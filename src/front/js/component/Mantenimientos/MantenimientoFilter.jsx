import React from "react";
import PropTypes from 'prop-types';
import { Dropdown } from "react-bootstrap";
import { FiFilter } from "react-icons/fi";

const MantenimientoFilter = ({

  aires = [],
  filtroAire = null,
  // Required props don't need defaults
  onFilterChange,
}) => {

  const isValidAiresArray = Array.isArray(aires);

  // Find the filtered item only if 'aires' is a valid array
  const aireFiltrado = isValidAiresArray
    ? aires.find((a) => a.id === filtroAire)
    : undefined; // If not an array, no item is filtered

  return (
    <Dropdown className="d-inline-block">
      <Dropdown.Toggle
        variant="outline-secondary"
        id="dropdown-filtro-mantenimiento"
        // Add a check in case aires is loading and aireFiltrado is temporarily undefined
        title={aireFiltrado ? `Filtrando por: ${aireFiltrado.nombre}` : "Mostrar todos los equipos"}
      >
        <FiFilter className="me-2" />
        {/* Display text based on whether an item is filtered */}
        {aireFiltrado
          ? `Filtro: ${aireFiltrado.nombre}`
          : "Todos los equipos"} {/* Changed to be more generic */}
      </Dropdown.Toggle>
      <Dropdown.Menu>
        {/* Option to clear the filter */}
        <Dropdown.Item onClick={() => onFilterChange(null)}>
          Todos los equipos
        </Dropdown.Item>
        <Dropdown.Divider />
        {/* Render items only if 'aires' is a valid array */}
        {isValidAiresArray ? (
          // Check if the array is empty before mapping
          aires.length > 0 ? (
            aires.map((aire) => (
              // Add a check for aire and aire.id before rendering
              aire && aire.id ? (
                <Dropdown.Item
                  key={aire.id}
                  onClick={() => onFilterChange(aire.id)}
                  active={filtroAire === aire.id} // Highlight the active filter
                >
                  {aire.nombre} - {aire.ubicacion}
                </Dropdown.Item>
              ) : null // Don't render if aire or aire.id is missing
            ))
          ) : (
            // Display message if the array is empty
            <Dropdown.Item disabled>No hay filtros disponibles</Dropdown.Item>
          )
        ) : (
          // Optional: Display a loading or error state if not a valid array
          <Dropdown.Item disabled>Cargando filtros...</Dropdown.Item>
        )}
      </Dropdown.Menu>
    </Dropdown>
  );
};

// Add PropTypes for runtime type checking
MantenimientoFilter.propTypes = {
  aires: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    nombre: PropTypes.string.isRequired,
    ubicacion: PropTypes.string,
  })), // Not required, default handles this
  filtroAire: PropTypes.number, // Can be null, default handles this
  onFilterChange: PropTypes.func.isRequired,
};

export default MantenimientoFilter;
