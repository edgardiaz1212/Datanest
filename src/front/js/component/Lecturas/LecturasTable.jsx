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
  umbrales = []
  // filtroDispositivo, // Opcional: si se quiere un mensaje de vacío más específico
  // dispositivosMedibles // Opcional: para el mensaje de vacío
}) => {

  if (loading) {
    return (
      <div className="text-center p-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Cargando lecturas...</p>
      </div>
    );
  }

  if (!loading && lecturas.length === 0) {
    return (
      <div className="text-center p-5">
        <div className="d-flex justify-content-center mb-3">
          <FiThermometer size={40} className="text-danger me-2" />
          <FiDroplet size={40} className="text-primary" />
        </div>
        <h4>
          No hay lecturas registradas.
        </h4>

        <Button variant="primary" className="mt-3" onClick={onAdd}>
          <FiPlus className="me-2" /> Agregar primera lectura
        </Button>
      </div>
    );
  }

  const getBadgeColors = (lectura) => {
    const umbralesActivos = Array.isArray(umbrales) ? umbrales.filter(u => u.notificar_activo) : [];
    let umbralEspecifico = null;
    // Solo buscar umbral específico si la lectura tiene un aire_id
    if (lectura.aire_id) {
      umbralEspecifico = umbralesActivos.find(u => u.aire_id === lectura.aire_id);
    }
    const umbralGlobal = umbralesActivos.find(u => u.es_global);
    const umbralAplicable = umbralEspecifico || umbralGlobal;

    let tempColor = 'success'; // Default green
    let humColor = 'primary'; // Default blue

    if (umbralAplicable) {
      if (typeof lectura.temperatura === 'number' && lectura.temperatura < umbralAplicable.temp_min) tempColor = 'info';
      else if (typeof lectura.temperatura === 'number' && lectura.temperatura > umbralAplicable.temp_max) tempColor = 'danger';

      if (typeof lectura.humedad === 'number' && lectura.humedad < umbralAplicable.hum_min) humColor = 'secondary';
      else if (typeof lectura.humedad === 'number' && lectura.humedad > umbralAplicable.hum_max) humColor = 'warning';
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
            <th>Dispositivo</th>
            <th>Ubicación</th>
            <th><FiCalendar className="me-1" />Fecha</th>
            <th><FiClock className="me-1" />Hora</th>
            <th><FiThermometer className="me-1" />Temp.</th>
            <th><FiDroplet className="me-1" />Hum.</th>
            {canDelete && <th className="text-end">Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {lecturas.map(lectura => {
            // Defensive check
            if (!lectura || !lectura.id) return null;

            const { tempColor, humColor } = getBadgeColors(lectura);

            return (
              <tr key={lectura.id}>
                <td>{lectura.nombre_dispositivo || 'N/A'}</td>
                <td>{lectura.ubicacion_dispositivo || 'N/A'}</td>
                <td>
                  {formatearFecha(lectura.fecha)}
                </td>
                <td>
                  {formatearHora(lectura.fecha)}
                </td>
                <td>
                  <Badge bg={tempColor} pill>
                    {typeof lectura.temperatura === 'number' ? Number(lectura.temperatura).toFixed(1) : 'N/A'} °C
                  </Badge>
                </td>
                <td>
                  <Badge bg={humColor} pill>
                    {typeof lectura.humedad === 'number' ? Number(lectura.humedad).toFixed(1) : 'N/A'} %
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
    aire_id: PropTypes.number, // Puede ser null si es otro_equipo
    otro_equipo_id: PropTypes.number, // Puede ser null si es aire
    fecha: PropTypes.string.isRequired,
    temperatura: PropTypes.number.isRequired,
    humedad: PropTypes.oneOfType([PropTypes.number, PropTypes.oneOf([null])]), // Permitir número o null
    nombre_dispositivo: PropTypes.string,
    ubicacion_dispositivo: PropTypes.string,
  })).isRequired,
  loading: PropTypes.bool.isRequired,
  canDelete: PropTypes.bool.isRequired,
  onDelete: PropTypes.func.isRequired,
  onAdd: PropTypes.func.isRequired,
  formatearFecha: PropTypes.func.isRequired,
  formatearHora: PropTypes.func.isRequired,
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
  })),
  // filtroDispositivo: PropTypes.object, // Si se implementa el mensaje de vacío específico
  // dispositivosMedibles: PropTypes.array, // Si se implementa el mensaje de vacío específico
};

export default LecturasTable;
