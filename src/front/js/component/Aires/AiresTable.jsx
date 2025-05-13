import React from 'react';
import PropTypes from 'prop-types'; // Import PropTypes
import { Table, Spinner, Badge, Button, OverlayTrigger, Tooltip, Stack } from 'react-bootstrap'; // Added Stack
import { FiEdit, FiTrash2, FiWind, FiPlus, FiInfo } from 'react-icons/fi';

// Componente funcional de la Tabla
const AiresTable = ({
    airesList = [], 
    loading,
    error = null, 
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

    // Helper para renderizar Tooltips en botones
    const renderTooltip = (props, text) => (
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
                        <th>Tipo</th>
                        <th>Capacidad</th>
                        <th>Operatividad</th>
                        <th>Diagnóstico Evap.</th>
                        <th>Diagnóstico Cond.</th>
                        {/* Columna de acciones solo si tiene permisos */}
                        {canManage && <th className="text-end">Acciones</th>}
                    </tr>
                </thead>
                <tbody>
                  {/* Mapea la lista de aires para crear las filas */}
                  {Array.isArray(airesList) && airesList.map((aire) => { // Use curly braces for the map callback
                    // Defensive check: ensure aire and aire.id exist
                    if (!aire || !aire.id) {
                      return null; // Explicitly return null if item is invalid, avoids whitespace issues
                    }
                    return (
                      <tr
                        key={aire.id}
                        onClick={() => onRowClick(aire.id)}
                        style={{ cursor: 'pointer' }}
                        title="Ver detalles del aire"
                      >
                        <td>{aire.nombre || 'N/A'}</td>
                        <td>{aire.ubicacion || 'N/A'}</td>
                        <td>{aire.tipo || 'N/A'}</td>
                        <td>{aire.toneladas != null ? `${aire.toneladas} ton` : 'N/A'}</td>
                        <td>
                          <Stack direction="horizontal" gap={1}>
                            <Badge bg={aire.evaporadora_operativa ? 'success' : 'danger'}>
                              Evap: {aire.evaporadora_operativa ? 'OK' : 'Falla'}
                            </Badge>
                            <Badge bg={aire.condensadora_operativa ? 'success' : 'danger'}>
                              Cond: {aire.condensadora_operativa ? 'OK' : 'Falla'}
                            </Badge>
                          </Stack>
                        </td>
                        <td>
                          {!aire.evaporadora_operativa ? (
                            <OverlayTrigger placement="top" overlay={(props) => renderTooltip(props, aire.evaporadora_diagnostico_notas || 'Sin notas adicionales')}>
                              <span className="d-inline-block text-truncate" style={{ maxWidth: "150px" }}>
                                {aire.evaporadora_diagnostico_nombre || 'No especificado'}
                              </span>
                            </OverlayTrigger>
                          ) : '-'}
                        </td>
                        <td>
                          {!aire.condensadora_operativa ? (
                             <OverlayTrigger placement="top" overlay={(props) => renderTooltip(props, aire.condensadora_diagnostico_notas || 'Sin notas adicionales')}>
                              <span className="d-inline-block text-truncate" style={{ maxWidth: "150px" }}>
                                {aire.condensadora_diagnostico_nombre || 'No especificado'}
                              </span>
                            </OverlayTrigger>
                          ) : '-'}
                        </td>
                        
                        {canManage && (
                          <td className="text-end" onClick={(e) => e.stopPropagation()}>
                            {/* Botón Ver Detalles */}
                            <OverlayTrigger placement="top" overlay={(props) => renderTooltip(props, 'Ver Detalles')}>
                              <Button
                                variant="outline-secondary"
                                size="sm"
                                className="me-2"
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
                                onClick={(e) => { e.stopPropagation(); onEdit(aire); }}
                              >
                                <FiEdit />
                              </Button>
                            </OverlayTrigger>
                            {/* Botón Eliminar */}
                            <OverlayTrigger placement="top" overlay={(props) => renderTooltip(props, 'Eliminar')}>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={(e) => { e.stopPropagation(); onDelete(aire.id); }}
                              >
                                <FiTrash2 />
                              </Button>
                            </OverlayTrigger>
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

// Add PropTypes for runtime type checking
AiresTable.propTypes = {
    // airesList is now optional in terms of being passed, but the default handles it
    airesList: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.number.isRequired,
        nombre: PropTypes.string.isRequired,
        ubicacion: PropTypes.string.isRequired,
        tipo: PropTypes.string,
        toneladas: PropTypes.number,
        evaporadora_operativa: PropTypes.bool,
        condensadora_operativa: PropTypes.bool,
        evaporadora_diagnostico_nombre: PropTypes.string,
        evaporadora_diagnostico_notas: PropTypes.string,
        condensadora_diagnostico_nombre: PropTypes.string,
        condensadora_diagnostico_notas: PropTypes.string,
        fecha_instalacion: PropTypes.string, // Can be string or potentially null/undefined if formatting handles it

    })), // Removed .isRequired for the array itself
    loading: PropTypes.bool.isRequired,
    error: PropTypes.string, // Can be null
    canManage: PropTypes.bool.isRequired,
    onRowClick: PropTypes.func.isRequired,
    onEdit: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    onAdd: PropTypes.func.isRequired,
    formatDate: PropTypes.func.isRequired,
};

export default AiresTable;
