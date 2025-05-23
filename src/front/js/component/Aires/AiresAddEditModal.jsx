import React from 'react'; // Removed useEffect, useState, useMemo
import PropTypes from 'prop-types';
import { Modal, Form, Button, Row, Col, Spinner, Alert, Accordion } from 'react-bootstrap';
import { FiInfo, FiPackage, FiZap } from 'react-icons/fi';

// Componente funcional del Modal
const AiresAddEditModal = ({
    show,
    onHide,
    modalTitle,
    formData,
    formMode,
    loadingEditDetails,
    editError,
    onSubmit,
    onChange, // Keep onChange for general form fields
    // Set default value directly here
    isSubmitting = false
}) => {

    return (
        // Componente Modal de react-bootstrap
        // Prevent closing during submit
        <Modal show={show} onHide={onHide} size="lg" centered backdrop="static" keyboard={!isSubmitting}>
            {/* Disable close button during submit */}
            <Modal.Header closeButton={!isSubmitting}>
                <Modal.Title>{modalTitle}</Modal.Title>
            </Modal.Header>
            {/* Formulario que maneja el envío */}
            <Form onSubmit={onSubmit}>
                <Modal.Body>
                    {/* Muestra errores específicos del modal */}
                    {editError && <Alert variant="danger">{editError}</Alert>}
                    {/* Muestra spinner si está cargando detalles en modo edición */}
                    {loadingEditDetails && formMode === 'edit' && (
                         <div className="text-center p-4">
                            <Spinner animation="border" variant="primary" />
                            <p className="mt-2 mb-0">Cargando detalles...</p>
                        </div>
                    )}

                    {/* Muestra el formulario si NO está cargando detalles O si está en modo 'add' */}
                    {(!loadingEditDetails || formMode === 'add') && (
                        // Acordeón para organizar las secciones del formulario
                        <Accordion defaultActiveKey={['0', '1', '2']} alwaysOpen>
                            {/* --- Sección: Información General --- */}
                            <Accordion.Item eventKey="0">
                                <Accordion.Header><FiInfo className="me-2" /> Información General</Accordion.Header>
                                <Accordion.Body>
                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className="mb-3" controlId="formNombreAire">
                                                <Form.Label>Nombre <span className="text-danger">*</span></Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="nombre"
                                                    value={formData.nombre || ''}
                                                    onChange={onChange}
                                                    required // Campo obligatorio HTML5
                                                    placeholder="Ej: Aire Sala Servidores 1"
                                                    autoFocus={formMode === 'add'} // Autofoco al agregar
                                                    disabled={isSubmitting} // Disable during submit
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-3" controlId="formUbicacionAire">
                                                <Form.Label>Ubicación <span className="text-danger">*</span></Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="ubicacion"
                                                    value={formData.ubicacion || ''}
                                                    onChange={onChange}
                                                    required // Campo obligatorio HTML5
                                                    placeholder="Ej: Edificio A, Piso 3"
                                                    disabled={isSubmitting}
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className="mb-3" controlId="formFechaInstalacionAire">
                                                <Form.Label>Fecha de Instalación <span className="text-danger">*</span></Form.Label>
                                                <Form.Control
                                                    type="date"
                                                    name="fecha_instalacion"
                                                    value={formData.fecha_instalacion || ''} // Usa el valor formateado YYYY-MM-DD
                                                    onChange={onChange}
                                                    required // Campo obligatorio HTML5
                                                    disabled={isSubmitting}
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={3}>
                                             <Form.Group className="mb-3" controlId="formTipoAire">
                                                <Form.Label>Tipo</Form.Label>
                                                <Form.Select
                                                    type="text"
                                                    name="tipo"
                                                    value={formData.tipo || ''} // Maneja null/undefined
                                                    onChange={onChange}
                                                    
                                                    disabled={isSubmitting}
                                                    aria-label="Seleccione un tipo de aire acondicionado"
                                                    >
                                                        <option value="">Seleccione un tipo</option>
                                                        <option value="Precision">Precisión</option>
                                                        <option value="Confort">Confort</option>
                                                        {/* Puedes agregar más opciones si es necesario
                                                        <option value="Otro">Otro (especificar)</option>
                                                        */}
                                                    </Form.Select>
                                            </Form.Group>
                                        </Col>
                                        <Col md={3}>
                                            <Form.Group className="mb-3" controlId="formToneladasAire">
                                                <Form.Label>Toneladas</Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    name="toneladas"
                                                    value={formData.toneladas ?? ''} // Usa '' para null/undefined en el input
                                                    onChange={onChange}
                                                    placeholder="Ej: 1.5"
                                                    step="0.1" // Permite decimales
                                                    min="0" // Valor mínimo
                                                    disabled={isSubmitting}
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </Accordion.Body>
                            </Accordion.Item>

                            {/* --- Sección: Unidad Evaporadora --- */}
                            <Accordion.Item eventKey="1">
                                <Accordion.Header><FiPackage className="me-2" /> Unidad Evaporadora</Accordion.Header>
                                <Accordion.Body>
                                    <Row>
                                        <Col md={4}>
                                            <Form.Group className="mb-3" controlId="formEvapMarca">
                                                <Form.Label>Marca</Form.Label>
                                                <Form.Control type="text" name="evaporadora_marca" value={formData.evaporadora_marca || ''} onChange={onChange} placeholder="Ej: Carrier" disabled={isSubmitting} />
                                            </Form.Group>
                                        </Col>
                                        <Col md={4}>
                                            <Form.Group className="mb-3" controlId="formEvapModelo">
                                                <Form.Label>Modelo</Form.Label>
                                                <Form.Control type="text" name="evaporadora_modelo" value={formData.evaporadora_modelo || ''} onChange={onChange} placeholder="Ej: XPower" disabled={isSubmitting} />
                                            </Form.Group>
                                        </Col>
                                        <Col md={4}>
                                            <Form.Group className="mb-3" controlId="formEvapSerial">
                                                <Form.Label>Serial <span className="text-danger">*</span></Form.Label>
                                                <Form.Control type="text" name="evaporadora_serial" value={formData.evaporadora_serial || ''} onChange={onChange} required placeholder="Ej: SN-EVAP123" disabled={isSubmitting} />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className="mb-3" controlId="formEvapInventario">
                                                <Form.Label>Código Inventario <span className="text-danger">*</span></Form.Label>
                                                <Form.Control type="text" name="evaporadora_codigo_inventario" value={formData.evaporadora_codigo_inventario || ''} onChange={onChange} required placeholder="Ej: INV-EVAP456" disabled={isSubmitting} />
                                            </Form.Group>
                                        </Col>
                                         <Col md={6}>
                                            <Form.Group className="mb-3" controlId="formEvapUbicacion">
                                                <Form.Label>Ubicación Específica</Form.Label>
                                                <Form.Control type="text" name="evaporadora_ubicacion_instalacion" value={formData.evaporadora_ubicacion_instalacion || ''} onChange={onChange} placeholder="Ej: Dentro de Sala Servidores" disabled={isSubmitting} />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                    {/* Mostrar solo en modo 'add' */}
                                    {formMode === 'add' && (
                                        <Form.Group className="mb-3" controlId="formEvapOperativaSelect">
                                            <Form.Label>Estado Evaporadora</Form.Label>
                                            <Form.Select
                                                name="evaporadora_operativa"
                                                value={formData.evaporadora_operativa || 'no_operativa'}
                                                onChange={onChange}
                                                disabled={isSubmitting}
                                                aria-label="Seleccione el estado de la evaporadora"
                                            >
                                                <option value="operativa">Operativa</option>
                                                <option value="parcialmente_operativa">Parcialmente Operativa</option>
                                                <option value="no_operativa">No Operativa</option>
                                            </Form.Select>
                                        </Form.Group>
                                    )}

                                </Accordion.Body>
                            </Accordion.Item>

                            {/* --- Sección: Unidad Condensadora --- */}
                            <Accordion.Item eventKey="2">
                                <Accordion.Header><FiZap className="me-2" /> Unidad Condensadora</Accordion.Header>
                                <Accordion.Body>
                                     <Row>
                                        <Col md={4}>
                                            <Form.Group className="mb-3" controlId="formCondMarca">
                                                <Form.Label>Marca</Form.Label>
                                                <Form.Control type="text" name="condensadora_marca" value={formData.condensadora_marca || ''} onChange={onChange} placeholder="Ej: LG" disabled={isSubmitting} />
                                            </Form.Group>
                                        </Col>
                                        <Col md={4}>
                                            <Form.Group className="mb-3" controlId="formCondModelo">
                                                <Form.Label>Modelo</Form.Label>
                                                <Form.Control type="text" name="condensadora_modelo" value={formData.condensadora_modelo || ''} onChange={onChange} placeholder="Ej: Multi V" disabled={isSubmitting} />
                                            </Form.Group>
                                        </Col>
                                        <Col md={4}>
                                            <Form.Group className="mb-3" controlId="formCondSerial">
                                                <Form.Label>Serial <span className="text-danger">*</span></Form.Label>
                                                <Form.Control type="text" name="condensadora_serial" value={formData.condensadora_serial || ''} onChange={onChange} required placeholder="Ej: SN-COND789" disabled={isSubmitting} />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className="mb-3" controlId="formCondInventario">
                                                <Form.Label>Código Inventario <span className="text-danger">*</span></Form.Label>
                                                <Form.Control type="text" name="condensadora_codigo_inventario" value={formData.condensadora_codigo_inventario || ''} onChange={onChange} required placeholder="Ej: INV-COND012" disabled={isSubmitting} />
                                            </Form.Group>
                                        </Col>
                                         <Col md={6}>
                                            <Form.Group className="mb-3" controlId="formCondUbicacion">
                                                <Form.Label>Ubicación Específica</Form.Label>
                                                <Form.Control type="text" name="condensadora_ubicacion_instalacion" value={formData.condensadora_ubicacion_instalacion || ''} onChange={onChange} placeholder="Ej: Techo Edificio A" disabled={isSubmitting} />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                    {/* Mostrar solo en modo 'add' */}
                                    {formMode === 'add' && (
                                        <Form.Group className="mb-3" controlId="formCondOperativaSelect">
                                            <Form.Label>Estado Condensadora</Form.Label>
                                            <Form.Select
                                                name="condensadora_operativa"
                                                value={formData.condensadora_operativa || 'no_operativa'}
                                                onChange={onChange}
                                                disabled={isSubmitting}
                                                aria-label="Seleccione el estado de la condensadora"
                                            >
                                                <option value="operativa">Operativa</option>
                                                <option value="parcialmente_operativa">Parcialmente Operativa</option>
                                                <option value="no_operativa">No Operativa</option>
                                            </Form.Select>
                                        </Form.Group>
                                    )}
                                </Accordion.Body>
                            </Accordion.Item>
                        </Accordion>
                    )}
                </Modal.Body>
                <Modal.Footer>
                     {/* Botón Cancelar: deshabilita si está cargando detalles o enviando */}
                     <Button variant="secondary" onClick={onHide} disabled={isSubmitting || (loadingEditDetails && formMode === 'edit')}>
                        Cancelar
                    </Button>
                    {/* Botón Guardar: deshabilita si está cargando detalles o enviando */}
                    <Button variant="primary" type="submit" disabled={isSubmitting || (loadingEditDetails && formMode === 'edit')}>
                        {isSubmitting ? (
                            <><Spinner size="sm" className="me-2" /> Guardando...</>
                        ) : (
                            formMode === 'add' ? 'Agregar Aire' : 'Guardar Cambios'
                        )}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

// PropTypes remain the same
AiresAddEditModal.propTypes = {
    show: PropTypes.bool.isRequired,
    onHide: PropTypes.func.isRequired,
    modalTitle: PropTypes.string.isRequired,
    formData: PropTypes.object.isRequired,
    formMode: PropTypes.oneOf(['add', 'edit']).isRequired,
    loadingEditDetails: PropTypes.bool.isRequired, // Still needed to show spinner when fetching details for edit
    editError: PropTypes.string,
    onSubmit: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    // PropType for isSubmitting is still useful for validation
    isSubmitting: PropTypes.bool,
};

export default AiresAddEditModal;
