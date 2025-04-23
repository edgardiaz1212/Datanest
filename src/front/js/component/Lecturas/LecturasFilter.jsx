import React from 'react';
import PropTypes from 'prop-types'; // Import PropTypes
import { Dropdown } from 'react-bootstrap';
import { FiFilter } from 'react-icons/fi';


const LecturasFilter = ({ 
  aires,
  filtroAire,
  onFilterChange
}) => {
  // --- Defensive Check ---
  const isValidAiresArray = Array.isArray(aires);

  // Find selected AC only if aires is a valid array
  const aireSeleccionado = isValidAiresArray
    ? aires.find(a => a.id === filtroAire)
    : undefined;

  // Determine display name for the toggle button
  const nombreFiltro = aireSeleccionado
    ? `${aireSeleccionado.nombre} (${aireSeleccionado.ubicacion || 'Sin Ubic.'})` // Add fallback for ubicacion
    : 'Todos los aires';

  return (
    <Dropdown className="d-inline-block me-2">
      <Dropdown.Toggle
        variant="outline-secondary"
        id="dropdown-filtro-lecturas" // More specific ID
        title={aireSeleccionado ? `Filtrando por: ${nombreFiltro}` : "Mostrar todos los aires"} // Accessibility
      >
        <FiFilter className="me-2" />
        {/* Display the determined name */}
        {nombreFiltro}
      </Dropdown.Toggle>
      <Dropdown.Menu>
        {/* Option to clear filter */}
        <Dropdown.Item onClick={() => onFilterChange(null)}>
          Todos los aires
        </Dropdown.Item>
        <Dropdown.Divider />
        {/* Render items only if aires is a valid array */}
        {isValidAiresArray ? (
          // Check if array is empty before mapping
          aires.length > 0 ? (
            aires.map(aire => (
              // Defensive check for aire and aire.id
              aire && aire.id ? (
                <Dropdown.Item
                  key={aire.id}
                  onClick={() => onFilterChange(aire.id)}
                  active={filtroAire === aire.id} // Highlight active filter
                >
                  {aire.nombre} - {aire.ubicacion || 'Sin Ubic.'} {/* Add fallback */}
                </Dropdown.Item>
              ) : null // Don't render invalid items
            ))
          ) : (
            // Message if array is empty
            <Dropdown.Item disabled>No hay aires disponibles</Dropdown.Item>
          )
        ) : (
          // Message if aires is not yet loaded or invalid
          <Dropdown.Item disabled>Cargando filtros...</Dropdown.Item>
        )}
      </Dropdown.Menu>
    </Dropdown>
  );
};

// Add PropTypes for runtime type checking
LecturasFilter.propTypes = {
  aires: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    nombre: PropTypes.string.isRequired,
    ubicacion: PropTypes.string,
  })), // Not required, might be loading
  filtroAire: PropTypes.number, // Can be null
  onFilterChange: PropTypes.func.isRequired,
};

export default LecturasFilter;
