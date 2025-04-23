// src/front/js/component/OtrosEquipos/OtrosEquiposTable.jsx

import React from 'react';
import PropTypes from 'prop-types'; // Import PropTypes
import { Table, Button, Spinner, Alert } from 'react-bootstrap';
import { FiEdit, FiTrash2, FiPackage, FiPlus } from 'react-icons/fi';

// Remove TypeScript interfaces

const OtrosEquiposTable = ({ // Remove : React.FC<OtrosEquiposTableProps>
    equiposList,
    loading,
    error,
    canManage,
    onRowClick,
    onEdit,
    onDelete,
    onAdd,
}) => {

    if (loading) {
        return (
            <div className="text-center p-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3">Cargando equipos...</p>
            </div>
        );
    }

    // Error handling: Show error only if loading is finished and there are no items
    // The main error display is handled by the parent component
    if (!loading && error && equiposList.length === 0) {
         return <Alert variant="danger">Error al cargar los equipos: {error}</Alert>;
    }

    if (!loading && equiposList.length === 0) {
        return (
            <div className="text-center p-5">
                <FiPackage size={50} className="text-muted mb-3" />
                <h4>No hay equipos registrados</h4>
                {canManage && (
                    <Button variant="primary" className="mt-3" onClick={onAdd}>
                        <FiPlus className="me-2" /> Agregar primer equipo
                    </Button>
                )}
            </div>
        );
    }

    return (
        <div className="table-responsive">
            <Table hover className="table-clickable">
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Tipo</th>
                        <th>Ubicación</th>
                        <th>Estado</th>
                        {canManage && <th className="text-end">Acciones</th>}
                    </tr>
                </thead>
                <tbody>
                    {equiposList.map(equipo => (
                        // Added check for equipo and equipo.id
                        equipo && equipo.id ? (
                            <tr key={equipo.id} onClick={() => onRowClick(equipo.id)} style={{ cursor: 'pointer' }}>
                                <td>{equipo.nombre}</td>
                                <td>{equipo.tipo}</td>
                                <td>{equipo.ubicacion || '-'}</td>
                                <td>
                                    {/* Use Bootstrap badge classes directly */}
                                    <span className={`badge ${equipo.estado_operativo ? 'bg-success' : 'bg-danger'}`}>
                                        {equipo.estado_operativo ? 'Operativo' : 'Inoperativo'}
                                    </span>
                                </td>
                                {canManage && (
                                    <td className="text-end" onClick={(e) => e.stopPropagation()}> {/* Prevent row click when clicking buttons */}
                                        <Button
                                            variant="outline-primary"
                                            size="sm"
                                            className="me-2"
                                            onClick={(e) => { e.stopPropagation(); onEdit(equipo); }} // Stop propagation here too
                                            title="Editar Equipo"
                                        >
                                            <FiEdit />
                                        </Button>
                                        <Button
                                            variant="outline-danger"
                                            size="sm"
                                            onClick={(e) => { e.stopPropagation(); onDelete(equipo.id); }} // Stop propagation here too
                                            title="Eliminar Equipo"
                                        >
                                            <FiTrash2 />
                                        </Button>
                                    </td>
                                )}
                            </tr>
                        ) : null // Render nothing if equipo or equipo.id is missing
                    ))}
                </tbody>
            </Table>
        </div>
    );
};

// Add PropTypes for basic type checking in JavaScript
OtrosEquiposTable.propTypes = {
    equiposList: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.number.isRequired,
        nombre: PropTypes.string.isRequired,
        tipo: PropTypes.string.isRequired,
        ubicacion: PropTypes.string,
        estado_operativo: PropTypes.bool.isRequired,
    })).isRequired,
    loading: PropTypes.bool.isRequired,
    error: PropTypes.string,
    canManage: PropTypes.bool.isRequired,
    onRowClick: PropTypes.func.isRequired,
    onEdit: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    onAdd: PropTypes.func.isRequired,
};

export default OtrosEquiposTable;
