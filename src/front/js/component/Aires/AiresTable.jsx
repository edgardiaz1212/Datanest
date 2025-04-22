// src/front/js/component/Aires/AiresTable.jsx

import React from 'react';
import PropTypes from 'prop-types'; // Import PropTypes
import { Table, Button, Spinner, Alert, Tooltip, OverlayTrigger } from 'react-bootstrap';
import { FiEdit, FiTrash2, FiWind, FiPlus, FiInfo } from 'react-icons/fi';

// --- Remove TypeScript imports and interfaces ---
// import { AireAcondicionadoListItem } from '../../pages/Aires';
// interface AiresTableProps { ... }

// Componente funcional de la Tabla
const AiresTable = ({ // Remove : React.FC<AiresTableProps>
    airesList, // Prop now uses validation below
    loading,
    error, // Error general no se muestra aquí directamente
    canManage,
    onRowClick,
    onEdit,
    onDelete,
    onAdd,
    formatDate
}) => {

    // Muestra spinner mientras carga
    if (loading) {
        return (
            <div className="text-center p-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3">Cargando aires acondicionados...</p>
            </div>
        );
    }

    // El error general se maneja en el componente padre (Aires.jsx)
    // Muestra mensaje y botón de agregar si la lista está vacía (y no hay error)
    // Ensure airesList is an array before checking length
    if (!error && Array.isArray(airesList) && airesList.length === 0) {
        return (
            <div className="text-center p-5">
                <FiWind size={50} className="text-muted mb-3" />
                <h4>No hay aires acondicionados registrados</h4>
                {/* Botón para agregar el primer aire, solo si tiene permisos */}
                {canManage && (
                    <Button variant="primary" className="mt-3" onClick={onAdd}>
                        <FiPlus className="me-2" /> Agregar primer aire
                    </Button>
                )}
            </div>
        );
    }

    // Helper para renderizar Tooltips en botones (remove type annotations)
    const renderTooltip = (props, text) => ( // Remove : any, : string
        <Tooltip id={`tooltip-${text.replace(/\s+/g, '-')}`} {...props}>
          {text}
        </Tooltip>
      );

    // Renderiza la tabla si hay datos
    return (
        <div className="table-responsive">
            <Table hover className="table-clickable aires-table">
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Ubicación</th>
                        <th>Fecha de Instalación</th>
                        {/* Columna de acciones solo si tiene permisos */}
                        {canManage && <th className="text-end">Acciones</th>}
                    </tr>
                </thead>
                <tbody>
                    {/* Mapea la lista de aires para crear las filas */}
                    {/* Defensive check: ensure airesList is an array before mapping */}
                    {Array.isArray(airesList) && airesList.map((aire) => ( // Remove type annotation
                        // Defensive check: ensure aire and aire.id exist
                        aire && aire.id ? (
                            <tr
                                key={aire.id}
                                onClick={() => onRowClick(aire.id)} // Clic en fila abre detalles
                                style={{ cursor: 'pointer' }}
                                title="Ver detalles del aire" // Tooltip para la fila
                            >
                                <td>{aire.nombre || 'N/A'}</td> {/* Fallback */}
                                <td>{aire.ubicacion || 'N/A'}</td> {/* Fallback */}
                                {/* Formatea la fecha para mostrarla */}
                                <td>{formatDate(aire.fecha_instalacion)}</td>
                                {/* Celda de acciones solo si tiene permisos */}
                                {canManage && (
                                    <td className="text-end" onClick={(e) => e.stopPropagation()}> {/* Evita que clic en botones active clic en fila */}
                                        {/* Botón Ver Detalles */}
                                        <OverlayTrigger placement="top" overlay={(props) => renderTooltip(props, 'Ver Detalles')}>
                                            <Button
                                                variant="outline-secondary" // Cambiado a secundario
                                                size="sm"
                                                className="me-2"
                                                // Stop propagation here too
                                                onClick={(e) => { e.stopPropagation(); onRowClick(aire.id); }}
                                            >
                                                <FiInfo />
                                            </Button>
                                        </OverlayTrigger>
                                        {/* Botón Editar */}
                                        <OverlayTrigger placement="top" overlay={(props) => renderTooltip(props, 'Editar')}>
                                            <Button
                                                variant="outline-primary"
                                                size="sm"
                                                className="me-2"
                                                 // Stop propagation here too
                                                onClick={(e) => { e.stopPropagation(); onEdit(aire); }} // Pasa el objeto 'aire' completo
                                            >
                                                <FiEdit />
                                            </Button>
                                        </OverlayTrigger>
                                        {/* Botón Eliminar */}
                                        <OverlayTrigger placement="top" overlay={(props) => renderTooltip(props, 'Eliminar')}>
                                            <Button
                                                variant="outline-danger"
                                                size="sm"
                                                 // Stop propagation here too
                                                onClick={(e) => { e.stopPropagation(); onDelete(aire.id); }} // Pasa solo el ID
                                            >
                                                <FiTrash2 />
                                            </Button>
                                        </OverlayTrigger>
                                    </td>
                                )}
                            </tr>
                        ) : null // Don't render if aire or aire.id is invalid
                    ))}
                </tbody>
            </Table>
        </div>
    );
};

// Add PropTypes for runtime type checking
AiresTable.propTypes = {
    airesList: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.number.isRequired,
        nombre: PropTypes.string.isRequired,
        ubicacion: PropTypes.string.isRequired,
        fecha_instalacion: PropTypes.string, // Can be string or potentially null/undefined if formatting handles it
    })).isRequired, // The array itself is required
    loading: PropTypes.bool.isRequired,
    error: PropTypes.string, // Can be null
    canManage: PropTypes.bool.isRequired,
    onRowClick: PropTypes.func.isRequired,
    onEdit: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    onAdd: PropTypes.func.isRequired,
    formatDate: PropTypes.func.isRequired,
};

// Default props (optional, but good practice if some props might not be passed)
AiresTable.defaultProps = {
    airesList: [], // Default to empty array
    error: null,
};


export default AiresTable;
