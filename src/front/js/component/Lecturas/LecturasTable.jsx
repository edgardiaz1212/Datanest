import React from 'react';
import PropTypes from 'prop-types'; // Import PropTypes
import { Table, Spinner, Badge, Button } from 'react-bootstrap';
import { FiThermometer, FiDroplet, FiCalendar, FiClock, FiTrash2, FiPlus } from 'react-icons/fi';

const LecturasTable = ({
  lecturas,
  loading,
  canDelete,
  onDelete,
  onAdd,
  formatearFecha,
  formatearHora,
  // Set default values directly here using JavaScript default parameters
  umbrales = [],
  filtroAire = null,
  aires = [],
}) => {

  if (loading) {
    return (
      <div className="text-center p-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Cargando lecturas...</p>
      </div>
    );
  }

  // Empty state message (now uses props for context)
  if (!loading && lecturas.length === 0) {
    const nombreAireFiltrado = filtroAire && Array.isArray(aires)
      ? aires.find(a => a.id === filtroAire)?.nombre
      : null;

    return (
      <div className="text-center p-5">
        <div className="d-flex justify-content-center mb-3">
          <FiThermometer size={40} className="text-danger me-2" />
          <FiDroplet size={40} className="text-primary" />
        </div>
        <h4>
          No hay lecturas registradas
          {/* Add context if filtered */}
          {nombreAireFiltrado ? ` para ${nombreAireFiltrado}` : ""}
        </h4>

        <Button variant="primary" className="mt-3" onClick={onAdd}>
          <FiPlus className="me-2" /> Agregar primera lectura
        </Button>
      </div>
    );
  }

  // --- Logic to determine badge colors (remains the same) ---
  const getBadgeColors = (lectura) => {
    // Ensure umbrales is an array before filtering/finding
    const umbralesActivos = Array.isArray(umbrales) ? umbrales.filter(u => u.notificar_activo) : [];
    const umbralEspecifico = umbralesActivos.find(u => u.aire_id === lectura.aire_id);
    const umbralGlobal = umbralesActivos.find(u => u.es_global);
    const umbralAplicable = umbralEspecifico || umbralGlobal;

    let tempColor = 'success'; // Default green
    let humColor = 'primary'; // Default blue

    if (umbralAplicable) {
      if (lectura.temperatura < umbralAplicable.temp_min) tempColor = 'info'; // Cold - light blue
      else if (lectura.temperatura > umbralAplicable.temp_max) tempColor = 'danger'; // Hot - red

      if (lectura.humedad < umbralAplicable.hum_min) humColor = 'secondary'; // Dry - gray
      else if (lectura.humedad > umbralAplicable.hum_max) humColor = 'warning'; // Humid - yellow/orange
    } else {
      // Fallback logic if NO thresholds are defined (optional)
      if (lectura.temperatura > 25) tempColor = 'danger';
      if (lectura.temperatura < 18) tempColor = 'info';
      if (lectura.humedad > 70) humColor = 'warning';
      if (lectura.humedad < 30) humColor = 'secondary';
    }
    return { tempColor, humColor };
  };


  return (
    <div className="table-responsive">
      <Table hover>
        <thead>
          <tr>
            <th>ID</th>
            <th>Aire Acondicionado</th>
            <th>Ubicación</th>
            <th><FiCalendar className="me-1" />Fecha</th>
            <th><FiClock className="me-1" />Hora</th>
            <th><FiThermometer className="me-1" />Temp.</th>
            <th><FiDroplet className="me-1" />Hum.</th>
            {canDelete && <th className="text-end">Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {/* Remove type annotation from map parameter */}
          {lecturas.map(lectura => {
            // Defensive check
            if (!lectura || !lectura.id) return null;

            const { tempColor, humColor } = getBadgeColors(lectura);

            return (
              <tr key={lectura.id}>
                <td>{lectura.id}</td>
                <td>{lectura.aire_nombre || 'N/A'}</td>
                <td>{lectura.ubicacion || 'N/A'}</td>
                <td>
                  {formatearFecha(lectura.fecha)}
                </td>
                <td>
                  {formatearHora(lectura.fecha)}
                </td>
                <td>
                  <Badge bg={tempColor}>
                    {Number(lectura.temperatura).toFixed(1)} °C
                  </Badge>
                </td>
                <td>
                  <Badge bg={humColor}>
                    {Number(lectura.humedad).toFixed(1)} %
                  </Badge>
                </td>
                {canDelete && (
                  <td className="text-end">
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => onDelete(lectura.id)}
                      title="Eliminar lectura" // Add tooltip text
                    >
                      <FiTrash2 />
                    </Button>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
};

// PropTypes remain the same
LecturasTable.propTypes = {
  lecturas: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    aire_id: PropTypes.number.isRequired,
    fecha: PropTypes.string.isRequired,
    temperatura: PropTypes.number.isRequired,
    humedad: PropTypes.number.isRequired,
    aire_nombre: PropTypes.string,
    ubicacion: PropTypes.string,
  })).isRequired,
  loading: PropTypes.bool.isRequired,
  canDelete: PropTypes.bool.isRequired,
  onDelete: PropTypes.func.isRequired,
  onAdd: PropTypes.func.isRequired,
  formatearFecha: PropTypes.func.isRequired,
  formatearHora: PropTypes.func.isRequired,
  // PropType for umbrales is still useful for validation, even with default
  umbrales: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number.isRequired,
      nombre: PropTypes.string,
      es_global: PropTypes.bool,
      aire_id: PropTypes.number,
      temp_min: PropTypes.number,
      temp_max: PropTypes.number,
      hum_min: PropTypes.number,
      hum_max: PropTypes.number,
      notificar_activo: PropTypes.bool,
  })), // Removed .isRequired as it now has a default
  // PropType for filtroAire is still useful
  filtroAire: PropTypes.number,
  // PropType for aires is still useful
  aires: PropTypes.array,
};

export default LecturasTable;
