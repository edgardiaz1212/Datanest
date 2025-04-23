import React from 'react';
import PropTypes from 'prop-types'; // Import PropTypes
import { Modal, Button, Form, Row, Col, Spinner, Alert } from 'react-bootstrap';

const OtrosEquiposAddEditModal = ({ 
    show,
    onHide,
    modalTitle,
    formData,
    formMode,
    loadingEditDetails, 
    editError,          
    onSubmit,
    onChange,
    // Set default value directly here using JavaScript default parameters
    isSubmitting = false,
}) => {

    // Define allowed types directly in the component
    const tiposPermitidos = ['Motogenerador', 'UPS', 'PDU', 'Otro'];

    return (
        // Use the isSubmitting prop to disable closing while submitting
        <Modal show={show} onHide={() => !isSubmitting && onHide()} size="lg" centered backdrop="static" keyboard={!isSubmitting}>
            <Modal.Header closeButton={!isSubmitting}> {/* Disable close button during submit */}
                <Modal.Title>{modalTitle}</Modal.Title>
            </Modal.Header>
            {/* Pass onSubmit to the Form */}
            <Form onSubmit={onSubmit}>
                <Modal.Body>
                    {/* Display modal-specific errors */}
                    {editError && <Alert variant="danger">{editError}</Alert>}

                    {/* Show spinner if loading details for editing */}
                    {loadingEditDetails ? (
                        <div className="text-center p-4"> {/* Added padding */}
                            <Spinner animation="border" variant="primary" />
                            <p className="mt-2 mb-0">Cargando detalles...</p> {/* Added mb-0 */}
                        </div>
                    ) : (
                        // Render form fields when not loading details
                        <Row>
                            {/* Column 1 */}
                            <Col md={6}>
                                <Form.Group className="mb-3" controlId="formNombreEquipo">
                                    <Form.Label>Nombre <span className="text-danger">*</span></Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="nombre"
                                        value={formData.nombre || ''} // Handle potential undefined/null
                                        onChange={onChange}
                                        required
                                        autoFocus={formMode === 'add'} // Focus on add mode
                                        disabled={isSubmitting} // Disable during submit
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="formTipoEquipo">
                                    <Form.Label>Tipo <span className="text-danger">*</span></Form.Label>
                                    <Form.Select
                                        name="tipo"
                                        value={formData.tipo || 'Otro'} // Default to 'Otro' if undefined
                                        onChange={onChange}
                                        required
                                        disabled={isSubmitting}
                                    >
                                        {tiposPermitidos.map(tipo => (
                                            <option key={tipo} value={tipo}>{tipo}</option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="formUbicacionEquipo">
                                    <Form.Label>Ubicación</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="ubicacion"
                                        value={formData.ubicacion || ''}
                                        onChange={onChange}
                                        disabled={isSubmitting}
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="formMarcaEquipo">
                                    <Form.Label>Marca</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="marca"
                                        value={formData.marca || ''}
                                        onChange={onChange}
                                        disabled={isSubmitting}
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="formModeloEquipo">
                                    <Form.Label>Modelo</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="modelo"
                                        value={formData.modelo || ''}
                                        onChange={onChange}
                                        disabled={isSubmitting}
                                    />
                                </Form.Group>
                            </Col>

                            {/* Column 2 */}
                            <Col md={6}>
                                <Form.Group className="mb-3" controlId="formSerialEquipo">
                                    <Form.Label>Serial</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="serial"
                                        value={formData.serial || ''}
                                        onChange={onChange}
                                        disabled={isSubmitting}
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="formCodigoInventarioEquipo">
                                    <Form.Label>Código Inventario</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="codigo_inventario"
                                        value={formData.codigo_inventario || ''}
                                        onChange={onChange}
                                        disabled={isSubmitting}
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="formFechaInstalacionEquipo">
                                    <Form.Label>Fecha Instalación</Form.Label>
                                    <Form.Control
                                        type="date"
                                        name="fecha_instalacion"
                                        value={formData.fecha_instalacion || ''} // Expects YYYY-MM-DD
                                        onChange={onChange}
                                        disabled={isSubmitting}
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="formEstadoOperativoEquipo">
                                    <Form.Check
                                        type="checkbox"
                                        label="Equipo Operativo"
                                        name="estado_operativo"
                                        // Use ?? to default to true if undefined/null, then ensure it's boolean
                                        checked={!!(formData.estado_operativo ?? true)}
                                        onChange={onChange}
                                        disabled={isSubmitting}
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="formNotasEquipo">
                                    <Form.Label>Notas Adicionales</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={2} // Reduced rows slightly
                                        name="notas"
                                        value={formData.notas || ''}
                                        onChange={onChange}
                                        disabled={isSubmitting}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    {/* Disable Cancel button during submit */}
                    <Button variant="secondary" onClick={onHide} disabled={isSubmitting || loadingEditDetails}>
                        Cancelar
                    </Button>
                    {/* Disable Submit button during submit or detail loading */}
                    <Button variant="primary" type="submit" disabled={isSubmitting || loadingEditDetails}>
                        {isSubmitting ? (
                            <><Spinner size="sm" className="me-2" /> Guardando...</>
                        ) : (
                            formMode === 'add' ? 'Agregar Equipo' : 'Guardar Cambios'
                        )}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

// Add PropTypes for runtime type checking
OtrosEquiposAddEditModal.propTypes = {
    show: PropTypes.bool.isRequired,
    onHide: PropTypes.func.isRequired,
    modalTitle: PropTypes.string.isRequired,
    formData: PropTypes.object.isRequired, // Keep as object, specific shape checked in parent
    formMode: PropTypes.oneOf(['add', 'edit']).isRequired,
    loadingEditDetails: PropTypes.bool.isRequired,
    editError: PropTypes.string, // Can be null
    onSubmit: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    isSubmitting: PropTypes.bool, // Optional, default handles this
};

export default OtrosEquiposAddEditModal;
