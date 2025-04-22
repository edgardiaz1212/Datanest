// src/front/js/component/OtrosEquipos/OtrosEquiposViewModal.jsx

import React from 'react';
import PropTypes from 'prop-types'; // Import PropTypes
import { Modal, Button, Spinner, Alert, Row, Col } from 'react-bootstrap';

// Remove TypeScript interfaces

const OtrosEquiposViewModal = ({ // Remove : React.FC<OtrosEquiposViewModalProps>
    show,
    onHide,
    selectedEquipoDetails,
    loadingDetails,
    viewError,
    formatDate,
}) => {

    // Helper function to render detail rows
    const renderDetail = (label, value) => { // Remove type annotations
        let displayValue = '-'; // Default display value

        // Check if value is meaningful (not null, undefined, or empty string)
        if (value !== null && value !== undefined && value !== '') {
            if (typeof value === 'boolean') {
                // Display boolean as a badge
                displayValue = (
                    <span className={`badge ${value ? 'bg-success' : 'bg-danger'}`}>
                        {value ? 'Sí' : 'No'}
                    </span>
                );
            } else {
                // Display other types as string
                displayValue = value.toString();
            }
        }

        // Return the Row structure for the detail
        return (
            <React.Fragment key={label}> {/* Use Fragment with key for list rendering */}
                <Col xs={5} sm={4} className="text-muted fw-bold"> {/* Make label bold */}
                    {label}:
                </Col>
                <Col xs={7} sm={8}>
                    {displayValue}
                </Col>
            </React.Fragment>
        );
    };

    return (
        <Modal show={show} onHide={onHide} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>Detalles del Equipo</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {/* Display error if any */}
                {viewError && <Alert variant="danger">{viewError}</Alert>}

                {/* Display spinner while loading */}
                {loadingDetails && (
                    <div className="text-center p-4"> {/* Added padding */}
                        <Spinner animation="border" variant="primary" />
                        <p className="mt-2 mb-0">Cargando detalles...</p> {/* Added mb-0 */}
                    </div>
                )}

                {/* Display details when loaded and available */}
                {selectedEquipoDetails && !loadingDetails && (
                    <Row className="g-3"> {/* g-3 for gap between rows/cols */}
                        {renderDetail('ID', selectedEquipoDetails.id)}
                        {renderDetail('Nombre', selectedEquipoDetails.nombre)}
                        {renderDetail('Tipo', selectedEquipoDetails.tipo)}
                        {renderDetail('Ubicación', selectedEquipoDetails.ubicacion)}
                        {renderDetail('Marca', selectedEquipoDetails.marca)}
                        {renderDetail('Modelo', selectedEquipoDetails.modelo)}
                        {renderDetail('Serial', selectedEquipoDetails.serial)}
                        {renderDetail('Código Inventario', selectedEquipoDetails.codigo_inventario)}
                        {/* Use the passed formatDate function */}
                        {renderDetail('Fecha Instalación', formatDate(selectedEquipoDetails.fecha_instalacion))}
                        {renderDetail('Operativo', selectedEquipoDetails.estado_operativo)}
                        {/* Render notes only if they exist */}
                        {selectedEquipoDetails.notas && renderDetail('Notas', selectedEquipoDetails.notas)}
                        {/* Optional: Display creation/modification dates */}
                        {/* {renderDetail('Fecha Creación', formatDate(selectedEquipoDetails.fecha_creacion))} */}
                        {/* {renderDetail('Última Modificación', formatDate(selectedEquipoDetails.ultima_modificacion))} */}
                    </Row>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Cerrar
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

// Add PropTypes for runtime type checking
OtrosEquiposViewModal.propTypes = {
    show: PropTypes.bool.isRequired,
    onHide: PropTypes.func.isRequired,
    selectedEquipoDetails: PropTypes.shape({
        id: PropTypes.number.isRequired,
        nombre: PropTypes.string.isRequired,
        tipo: PropTypes.string, // Keep as string, specific enum check is harder in PropTypes
        ubicacion: PropTypes.string,
        marca: PropTypes.string,
        modelo: PropTypes.string,
        serial: PropTypes.string,
        codigo_inventario: PropTypes.string,
        fecha_instalacion: PropTypes.string,
        estado_operativo: PropTypes.bool.isRequired,
        notas: PropTypes.string,
        fecha_creacion: PropTypes.string,
        ultima_modificacion: PropTypes.string,
    }), // Can be null
    loadingDetails: PropTypes.bool.isRequired,
    viewError: PropTypes.string, // Can be null
    formatDate: PropTypes.func.isRequired,
};

export default OtrosEquiposViewModal;
