// c:\Users\AdminLocal\Documents\Github\movementColocationPageV2\src\front\js\component\Lecturas\LecturasFilter.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { Dropdown } from 'react-bootstrap';
import { FiFilter } from 'react-icons/fi';

const LecturasFilter = ({ dispositivosMedibles, filtroDispositivoKey, onFilterChange }) => {
  const isValidDispositivosArray = Array.isArray(dispositivosMedibles);

  const dispositivoSeleccionado = isValidDispositivosArray && filtroDispositivoKey
    ? dispositivosMedibles.find(d => d.key === filtroDispositivoKey)
    : undefined;

  let nombreCompletoFiltro = 'Todos los Dispositivos';
  if (dispositivoSeleccionado) {
    const tipoDisplay = dispositivoSeleccionado.esAire
      ? `Aire ${dispositivoSeleccionado.tipoOriginal || ''}`.trim()
      : `${dispositivoSeleccionado.tipoOriginal || 'Otro Equipo'}`.trim();
    nombreCompletoFiltro = `${dispositivoSeleccionado.nombre} (${dispositivoSeleccionado.ubicacion || 'Sin Ubic.'}) - ${tipoDisplay}`;
  }

  const toggleButtonText = dispositivoSeleccionado
    ? dispositivoSeleccionado.nombre // Mostrar solo el nombre en el botón para brevedad
    : 'Todos los Dispositivos';

  return (
    <Dropdown className="d-inline-block me-2">
      <Dropdown.Toggle
        variant="outline-secondary"
        id="dropdown-filtro-lecturas-dispositivos" // ID actualizado
        title={dispositivoSeleccionado ? `Filtrando por: ${nombreCompletoFiltro}` : "Mostrar todos los dispositivos"} // Tooltip con nombre completo
      >
        <FiFilter className="me-2" />
        {toggleButtonText}
      </Dropdown.Toggle>
      <Dropdown.Menu style={{ maxHeight: '300px', overflowY: 'auto' }}> {/* Para listas largas */}
        <Dropdown.Item onClick={() => onFilterChange(null)} active={!filtroDispositivoKey}>
          Todos los Dispositivos
        </Dropdown.Item>
        <Dropdown.Divider />
        {isValidDispositivosArray ? (
          dispositivosMedibles.length > 0 ? (
            dispositivosMedibles.map(disp => (
              disp && disp.key ? ( // Verificar que el dispositivo y su key existan
                <Dropdown.Item
                  key={disp.key}
                  onClick={() => onFilterChange(disp.key)}
                  active={filtroDispositivoKey === disp.key}
                >
                  {disp.nombre} ({disp.ubicacion || 'Sin Ubic.'})
                  <small className="d-block text-muted">
                    {disp.esAire ? `Aire ${disp.tipoOriginal || ''}`.trim() : `${disp.tipoOriginal || 'Otro Equipo'}`.trim()}
                  </small>
                </Dropdown.Item>
              ) : null
            ))
          ) : (
            <Dropdown.Item disabled>No hay dispositivos disponibles</Dropdown.Item>
          )
        ) : (
          <Dropdown.Item disabled>Cargando filtros...</Dropdown.Item>
        )}
      </Dropdown.Menu>
    </Dropdown>
  );
};

LecturasFilter.propTypes = {
  dispositivosMedibles: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string.isRequired,
    nombre: PropTypes.string.isRequired,
    ubicacion: PropTypes.string,
    esAire: PropTypes.bool.isRequired,
    tipoOriginal: PropTypes.string,
    idOriginal: PropTypes.number.isRequired,
  })), // No es requerido, puede estar cargando
  filtroDispositivoKey: PropTypes.string, // Puede ser null
  onFilterChange: PropTypes.func.isRequired,
};

export default LecturasFilter;
