import React from 'react';
import PropTypes from 'prop-types';
import { Modal, Button, Spinner, Alert, Row, Col } from 'react-bootstrap';

// Componente funcional del Modal de Vista
const AiresViewModal = ({
    show,
    onHide,
    // Use default parameters here instead of defaultProps
    selectedAireDetails = null,
    loadingDetails,
    viewError = null,
    formatDate,
}) => {

    // Helper para renderizar un par etiqueta-valor
    const renderDetail = (label, value) => {
        let displayValue = '-'; // Default value if null, undefined, or empty

        // Format the value for display
        if (value !== null && value !== undefined && value !== '') {
            if (typeof value === 'boolean') {
                // Show as badge Yes/No for booleans
                displayValue = (
                    <span className={`badge ${value ? 'bg-success' : 'bg-danger'}`}>
                        {value ? 'Sí' : 'No'}
                    </span>
                );
            } else if (typeof value === 'number' && isNaN(value)) {
                // Handle NaN specifically if needed (e.g., toneladas)
                displayValue = '-';
            } else {
                // Convert to string for other types (numbers, strings)
                displayValue = value.toString();
            }
        }

        // Return the column structure for the detail
        return (
            <React.Fragment key={label}> {/* Use Fragment with key for implicit lists */}
                <Col xs={5} sm={4} className="text-muted fw-bold">{label}:</Col>
                <Col xs={7} sm={8}>{displayValue}</Col>
            </React.Fragment>
        );
    };

    return (
        // Componente Modal de react-bootstrap
        <Modal show={show} onHide={onHide} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>Detalles del Aire Acondicionado</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {/* Show error if exists */}
                {viewError && <Alert variant="danger">{viewError}</Alert>}
                {/* Show spinner if loading */}
                {loadingDetails && (
                    <div className="text-center p-4">
                        <Spinner animation="border" variant="primary" />
                        <p className="mt-2 mb-0">Cargando detalles...</p>
                    </div>
                )}
                {/* Show details if NOT loading AND data exists */}
                {selectedAireDetails && !loadingDetails && (
                    <Row className="g-3"> {/* g-3 adds gap between columns */}
                        {/* General Information */}

                        {renderDetail('Nombre', selectedAireDetails.nombre)}
                        {renderDetail('Ubicación', selectedAireDetails.ubicacion)}
                        {renderDetail('Fecha Instalación', formatDate(selectedAireDetails.fecha_instalacion))}
                        {renderDetail('Tipo', selectedAireDetails.tipo)}
                        {renderDetail('Toneladas', selectedAireDetails.toneladas)}

                        {/* Separator */}
                        <Col xs={12}><hr className="my-3" /></Col>

                        {/* Evaporator Details */}
                        <Col xs={12}><h6 className="text-primary mb-2">Unidad Evaporadora</h6></Col>
                        {renderDetail('Evaporadora - Operativa', selectedAireDetails.evaporadora_operativa)}
                        {renderDetail('Evaporadora - Marca', selectedAireDetails.evaporadora_marca)}
                        {renderDetail('Evaporadora - Modelo', selectedAireDetails.evaporadora_modelo)}
                        {renderDetail('Evaporadora - Serial', selectedAireDetails.evaporadora_serial)}
                        {renderDetail('Evaporadora - Cód. Inventario', selectedAireDetails.evaporadora_codigo_inventario)}
                        {renderDetail('Evaporadora - Ubic. Específica', selectedAireDetails.evaporadora_ubicacion_instalacion)}

                        {/* Separator */}
                         <Col xs={12}><hr className="my-3" /></Col>

                        {/* Condenser Details */}
                        <Col xs={12}><h6 className="text-primary mb-2">Unidad Condensadora</h6></Col>
                        {/* Adjusted labels for clarity */}
                        {renderDetail('Condensadora - Operativa', selectedAireDetails.condensadora_operativa)}
                        {renderDetail('Condensadora - Marca', selectedAireDetails.condensadora_marca)}
                        {renderDetail('Condensadora - Modelo', selectedAireDetails.condensadora_modelo)}
                        {renderDetail('Condensadora - Serial', selectedAireDetails.condensadora_serial)}
                        {renderDetail('Condensadora - Cód. Inventario', selectedAireDetails.condensadora_codigo_inventario)}
                        {renderDetail('Condensadora - Ubic. Específica', selectedAireDetails.condensadora_ubicacion_instalacion)}
                    </Row>
                )}
                {/* Message if no details (just in case) */}
                {!selectedAireDetails && !loadingDetails && !viewError && (
                     <p className="text-center text-muted">No hay detalles para mostrar.</p>
                )}
            </Modal.Body>
            <Modal.Footer>
                {/* Button to close the modal */}
                <Button variant="secondary" onClick={onHide}>
                    Cerrar
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

// PropTypes remain the same
AiresViewModal.propTypes = {
    show: PropTypes.bool.isRequired,
    onHide: PropTypes.func.isRequired,
    selectedAireDetails: PropTypes.shape({
        id: PropTypes.number.isRequired,
        nombre: PropTypes.string,
        ubicacion: PropTypes.string,
        fecha_instalacion: PropTypes.string,
        tipo: PropTypes.string,
        toneladas: PropTypes.number,
        evaporadora_operativa: PropTypes.bool,
        evaporadora_marca: PropTypes.string,
        evaporadora_modelo: PropTypes.string,
        evaporadora_serial: PropTypes.string,
        evaporadora_codigo_inventario: PropTypes.string,
        evaporadora_ubicacion_instalacion: PropTypes.string,
        condensadora_operativa: PropTypes.bool,
        condensadora_marca: PropTypes.string,
        condensadora_modelo: PropTypes.string,
        condensadora_serial: PropTypes.string,
        condensadora_codigo_inventario: PropTypes.string,
        condensadora_ubicacion_instalacion: PropTypes.string,
    }), // Note: It's okay that this is nullable here, the default parameter handles it
    loadingDetails: PropTypes.bool.isRequired,
    viewError: PropTypes.string, // Note: It's okay that this is nullable here, the default parameter handles it
    formatDate: PropTypes.func.isRequired,
};


export default AiresViewModal;
