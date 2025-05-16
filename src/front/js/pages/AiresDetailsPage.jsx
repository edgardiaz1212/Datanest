import React, { useEffect, useContext, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Context } from '../store/appContext'; // Asegúrate de que Context esté importado
import { Container, Card, Row, Col, Button, Spinner, Alert, Table, Badge, Modal, Form } from 'react-bootstrap';
import { FiArrowLeft, FiPlus, FiEdit, FiTrash2, FiTool } from 'react-icons/fi';

const AiresDetailsPage = () => {
    const { aireId } = useParams();
    const navigate = useNavigate();
    const { store, actions } = useContext(Context);
    const {
        selectedAireDetails: aire,
        selectedAireDiagnosticRecords: diagnosticRecords,
        diagnosticoComponentes: diagnosticosDisponibles,
        trackerUser: currentUser,

        // Loading states
        airesLoading, // General loading for aire details
        selectedAireDiagnosticRecordsLoading: recordsLoading,
        diagnosticoComponentesLoading: predefinedDiagnosticsLoading,
        // Error states
        airesError, // General error for aire details
        selectedAireDiagnosticRecordsError: recordsError,
        diagnosticoComponentesError: predefinedDiagnosticsError,
        detailedAlertsList, // Para verificar alertas después de actualizar

    } = store;

    // Local state for the "Add Diagnostic Record" modal/form
    const [showAddRecordModal, setShowAddRecordModal] = useState(false);
    const [newRecordFormData, setNewRecordFormData] = useState({
        parte_ac: 'general', // default for the diagnostic record itself
        diagnostico_id: '',
        fecha_hora: new Date().toISOString().slice(0, 16), // default to now, YYYY-MM-DDTHH:MM
        notas: '',
        // Add fields for updating the current operative state
        current_evaporadora_operativa: '',
        current_condensadora_operativa: '',
    });
    const [isSubmittingRecord, setIsSubmittingRecord] = useState(false);
    const [addRecordError, setAddRecordError] = useState(null);

    // Permissions
    const canManageDiagnostics = currentUser?.rol === 'admin' || currentUser?.rol === 'supervisor' || currentUser?.rol === 'tecnico';

    useEffect(() => {
        // Fetch aire details, diagnostic records, and predefined diagnostics
        if (aireId) {
            actions.fetchAireDetails(aireId);
            actions.fetchDiagnosticRecordsByAire(aireId);
            if (canManageDiagnostics) { // Solo cargar diagnósticos predefinidos si el usuario puede gestionarlos
                actions.fetchDiagnosticoComponentes({ activo: true }); // Fetch active predefined diagnostics
            }
        }
        return () => {
            // Clear specific errors when component unmounts or aireId changes
            if (actions.clearAiresError) actions.clearAiresError();
            if (actions.clearSelectedAireDiagnosticRecordsError) actions.clearSelectedAireDiagnosticRecordsError();
            if (actions.clearDiagnosticoComponentesError) actions.clearDiagnosticoComponentesError();
        };
    }, [aireId, actions, canManageDiagnostics]); // Dependencies

    // Effect to update modal form data when aire details are loaded/updated
    useEffect(() => {
        if (aire) {
            setNewRecordFormData(prev => ({
                ...prev,
                current_evaporadora_operativa: aire.evaporadora_operativa || 'no_operativa',
                current_condensadora_operativa: aire.condensadora_operativa || 'no_operativa',
            }));
        }
    }, [aire]); // Dependency on aire details

    const formatDate = useCallback((dateString, includeTime = false) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'Fecha inválida';
            const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
            if (includeTime) {
                options.hour = '2-digit';
                options.minute = '2-digit';
                options.second = '2-digit';
            }
            return date.toLocaleDateString('es-ES', options);
        } catch (e) {
            return 'Error fecha';
        }
    }, []);

    const getOperatividadBadge = (estado) => {
        switch (estado) {
            case 'operativa': return { bg: 'success', text: 'Operativa' };
            case 'parcialmente_operativa': return { bg: 'warning', text: 'Parcialmente Operativa' };
            case 'no_operativa': return { bg: 'danger', text: 'No Operativa' };
            default: return { bg: 'secondary', text: 'N/A' };
        }
    };

    const handleNewRecordChange = (e) => {
        const { name, value } = e.target;
        setNewRecordFormData(prev => ({ ...prev, [name]: value }));
    }; // Keep this handler for all form fields

    const handleAddRecordSubmit = async (e) => {
        e.preventDefault();
        setAddRecordError(null);

        // Basic validation for the diagnostic record itself
        if (!newRecordFormData.diagnostico_id || !newRecordFormData.fecha_hora) {
             // Check if at least one operative state is being changed if no diagnostic is selected
             if (newRecordFormData.current_evaporadora_operativa === (aire?.evaporadora_operativa || 'no_operativa') &&
                 newRecordFormData.current_condensadora_operativa === (aire?.condensadora_operativa || 'no_operativa')) {
                 setAddRecordError("Por favor, complete el diagnóstico y la fecha/hora, o cambie al menos un estado operativo.");
                 return;
             }
            setAddRecordError("Por favor, complete el diagnóstico y la fecha/hora.");
            return;
        }
        setIsSubmittingRecord(true);
        try {
            const payload = {
                ...newRecordFormData,
                fecha_hora: new Date(newRecordFormData.fecha_hora).toISOString(), // Ensure full ISO string for backend
                // Do NOT include current_operative_state fields in the diagnostic record payload
            };

            let recordAdded = false;
            if (newRecordFormData.diagnostico_id) { // Only add record if a diagnostic is selected
                 recordAdded = await actions.addDiagnosticRecord(aireId, payload);
                 if (!recordAdded) {
                     setAddRecordError(store.selectedAireDiagnosticRecordsError || "No se pudo agregar el registro de diagnóstico.");
                     return; // Stop if adding record failed
                 }
            }

            // Prepare payload for updating the main aire details (only operative states)
            const updateAirePayload = {
                evaporadora_operativa: newRecordFormData.current_evaporadora_operativa,
                condensadora_operativa: newRecordFormData.current_condensadora_operativa,
            };
            // Call updateAire action
            const aireUpdated = await actions.updateAire(aireId, updateAirePayload);
            if (aireUpdated) { // updateAire action should refetch aire details on success
                 setShowAddRecordModal(false);
                 // Recargar los registros de diagnóstico después de actualizar el aire
                 await actions.fetchDiagnosticRecordsByAire(aireId);
                 // Reset form data for the next time the modal is opened
                 setNewRecordFormData({ parte_ac: 'general', diagnostico_id: '', fecha_hora: new Date().toISOString().slice(0, 16), notas: '', current_evaporadora_operativa: aireUpdated.evaporadora_operativa, current_condensadora_operativa: aireUpdated.condensadora_operativa }); // Use updated states from the response
            }
        } catch (error) {
            setAddRecordError(error.message || "Error al enviar el formulario.");
        } finally {
            setIsSubmittingRecord(false);
        }
    };

    const handleDeleteRecord = async (recordId) => {
        if (window.confirm("¿Está seguro de eliminar este registro de diagnóstico?")) {
            setAddRecordError(null); // Clear any previous error
            await actions.deleteDiagnosticRecord(recordId, aireId);
            // Refetch is handled by the action
        }
    };

    if (airesLoading && !aire) return <Container className="mt-4 text-center"><Spinner animation="border" variant="primary" /><p>Cargando detalles del aire...</p></Container>;
    if (airesError && !aire) return <Container className="mt-4"><Alert variant="danger">Error al cargar detalles del aire: {airesError}</Alert></Container>;
    if (!aire) return <Container className="mt-4"><Alert variant="warning">No se encontró el aire acondicionado.</Alert></Container>;

    const { evaporadora_operativa, condensadora_operativa } = aire;
    const badgeEvap = getOperatividadBadge(evaporadora_operativa);
    const badgeCond = getOperatividadBadge(condensadora_operativa);

    return (
        <Container className="mt-4">
            <Button variant="outline-secondary" as={Link} to="/aires" className="mb-3">
                <FiArrowLeft className="me-2" /> Volver a la Lista
            </Button>

            <Card className="mb-4">
                <Card.Header>
                    <div className="d-flex justify-content-between align-items-center">
                        <h4>Detalles de: {aire.nombre}</h4>
                        {/* Aquí podrías añadir un botón para editar el aire, que navegue a una página de edición o abra un modal */}
                    </div>
                </Card.Header>
                <Card.Body>
                    <Row>
                        <Col md={6}><strong>Ubicación:</strong> {aire.ubicacion || 'N/A'}</Col>
                        <Col md={6}><strong>Tipo:</strong> {aire.tipo || 'N/A'}</Col>
                        <Col md={6}><strong>Toneladas:</strong> {aire.toneladas != null ? `${aire.toneladas} ton` : 'N/A'}</Col>
                        <Col md={6}><strong>Fecha Instalación:</strong> {formatDate(aire.fecha_instalacion)}</Col>
                    </Row>
                    <hr />
                    <Row>
                        <Col md={6}>
                            <h5>Unidad Evaporadora</h5>
                            <p><strong>Estado:</strong> <Badge bg={badgeEvap.bg}>{badgeEvap.text}</Badge></p>
                            <p><strong>Marca:</strong> {aire.evaporadora_marca || 'N/A'}</p>
                            <p><strong>Modelo:</strong> {aire.evaporadora_modelo || 'N/A'}</p>
                            <p><strong>Serial:</strong> {aire.evaporadora_serial || 'N/A'}</p>
                        </Col>
                        <Col md={6}>
                            <h5>Unidad Condensadora</h5>
                            <p><strong>Estado:</strong> <Badge bg={badgeCond.bg}>{badgeCond.text}</Badge></p>
                            <p><strong>Marca:</strong> {aire.condensadora_marca || 'N/A'}</p>
                            <p><strong>Modelo:</strong> {aire.condensadora_modelo || 'N/A'}</p>
                            <p><strong>Serial:</strong> {aire.condensadora_serial || 'N/A'}</p>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            <Card>
                <Card.Header>
                    <div className="d-flex justify-content-between align-items-center">
                        <h5>Historial de Diagnósticos</h5>
                        {canManageDiagnostics && (
                            <Button variant="success" size="sm" onClick={() => { setShowAddRecordModal(true); setAddRecordError(null); }}>
                                <FiPlus className="me-1" /> Registrar Diagnóstico
                            </Button>
                        )}
                    </div>
                </Card.Header>
                <Card.Body>
                    {recordsLoading && <div className="text-center"><Spinner animation="border" size="sm" /> Cargando historial...</div>}
                    {recordsError && <Alert variant="danger">Error al cargar historial: {recordsError}</Alert>}
                    {!recordsLoading && !recordsError && diagnosticRecords.length === 0 && (
                        <p className="text-muted text-center">No hay registros de diagnóstico para este equipo.</p>
                    )}
                    {!recordsLoading && !recordsError && diagnosticRecords.length > 0 && (
                        <Table striped bordered hover responsive size="sm">
                            <thead>
                                <tr>
                                    <th>Fecha/Hora</th>
                                    <th>Parte Afectada</th>
                                    <th>Diagnóstico</th>
                                    <th>Notas</th>
                                    <th>Estado</th> {/* <--- NUEVA COLUMNA --- */}
                                    <th>Registrado Por</th>
                                    {canManageDiagnostics && <th>Acciones</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {diagnosticRecords.map(record => (
                                    <tr key={record.id}>
                                        <td>{formatDate(record.fecha_hora, true)}</td>
                                        <td><Badge bg="info">{record.parte_ac}</Badge></td>
                                        <td>{record.diagnostico_nombre || 'N/A'}</td>
                                        <td>{record.notas || '-'}</td>
                                        {/* --- MOSTRAR ESTADO DE SOLUCIÓN --- */}
                                        <td>
                                            <Badge bg={record.solucionado ? "success" : "warning"}>
                                                {record.solucionado ? "Solucionado" : "Pendiente"}
                                            </Badge>
                                            {record.solucionado && record.fecha_solucion && <div className="small text-muted">({formatDate(record.fecha_solucion)})</div>}
                                        </td>
                                        <td>{record.registrado_por_username || 'Sistema'}</td>
                                        {canManageDiagnostics && (
                                            <td>
                                                {/* <Button variant="outline-primary" size="sm" className="me-1" onClick={() => handleEditRecord(record)}><FiEdit /></Button> */}
                                                <Button variant="outline-danger" size="sm" onClick={() => handleDeleteRecord(record.id)}><FiTrash2 /></Button>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
            </Card>

            {/* Modal para Agregar Registro de Diagnóstico */}
            <Modal show={showAddRecordModal} onHide={() => setShowAddRecordModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Registrar Nuevo Diagnóstico</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleAddRecordSubmit}>
                    <Modal.Body>
                        {addRecordError && <Alert variant="danger">{addRecordError}</Alert>}
                        {predefinedDiagnosticsLoading && <div className="text-center"><Spinner size="sm" /> Cargando diagnósticos predefinidos...</div>}
                        {predefinedDiagnosticsError && <Alert variant="danger">Error diagnósticos predefinidos: {predefinedDiagnosticsError}</Alert>}

                        {/* Fields for updating current operative state */}
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3" controlId="formRecordCurrentEvapState">
                                    <Form.Label>Estado Actual Evaporadora <span className="text-danger">*</span></Form.Label>
                                    <Form.Select name="current_evaporadora_operativa" value={newRecordFormData.current_evaporadora_operativa} onChange={handleNewRecordChange} required disabled={isSubmittingRecord}>
                                        <option value="operativa">Operativa</option>
                                        <option value="parcialmente_operativa">Parcialmente Operativa</option>
                                        <option value="no_operativa">No Operativa</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3" controlId="formRecordCurrentCondState">
                                    <Form.Label>Estado Actual Condensadora <span className="text-danger">*</span></Form.Label>
                                    <Form.Select name="current_condensadora_operativa" value={newRecordFormData.current_condensadora_operativa} onChange={handleNewRecordChange} required disabled={isSubmittingRecord}>
                                        <option value="operativa">Operativa</option>
                                        <option value="parcialmente_operativa">Parcialmente Operativa</option>
                                        <option value="no_operativa">No Operativa</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>

                         {/* Separator */}
                         <hr className="my-3" />

                        {/* Fields for the historical diagnostic record */}
                        <Form.Group className="mb-3" controlId="formRecordFechaHora">
                            <Form.Label>Fecha y Hora del Diagnóstico <span className="text-danger">*</span></Form.Label>
                            <Form.Control
                                type="datetime-local"
                                name="fecha_hora"
                                value={newRecordFormData.fecha_hora}
                                onChange={handleNewRecordChange}
                                required
                                disabled={isSubmittingRecord}
                            />
                        </Form.Group>

                         <Form.Group className="mb-3" controlId="formRecordParteAC">
                            <Form.Label>Parte Afectada (Diagnóstico) <span className="text-danger">*</span></Form.Label>
                            <Form.Select name="parte_ac" value={newRecordFormData.parte_ac} onChange={handleNewRecordChange} required disabled={isSubmittingRecord || predefinedDiagnosticsLoading}>
                                <option value="general">General</option>
                                <option value="evaporadora">Evaporadora</option>
                                <option value="condensadora">Condensadora</option>
                            </Form.Select>
                        </Form.Group>

                         <Form.Group className="mb-3" controlId="formRecordDiagnosticoId">
                            <Form.Label>Diagnóstico <span className="text-danger">*</span></Form.Label>
                            <Form.Select name="diagnostico_id" value={newRecordFormData.diagnostico_id} onChange={handleNewRecordChange} required disabled={isSubmittingRecord || predefinedDiagnosticsLoading || !diagnosticosDisponibles.length}>
                                <option value="">Seleccione un diagnóstico...</option>
                                {diagnosticosDisponibles
                                    .filter(d => d.parte_ac === newRecordFormData.parte_ac || d.parte_ac === 'general') // Filtrar por parte_ac seleccionada
                                    .map(diag => (
                                        <option key={diag.id} value={diag.id}>{diag.nombre}</option>
                                    ))}
                            </Form.Select>
                            {!predefinedDiagnosticsLoading && diagnosticosDisponibles.filter(d => d.parte_ac === newRecordFormData.parte_ac || d.parte_ac === 'general').length === 0 && (
                                <Form.Text className="text-muted">
                                    No hay diagnósticos predefinidos para la parte seleccionada. Puede agregarlos en "Gestión de Diagnósticos".
                                </Form.Text>
                            )}
                        </Form.Group>

                         <Form.Group className="mb-3" controlId="formRecordNotas">
                            <Form.Label>Notas Adicionales</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                name="notas"
                                value={newRecordFormData.notas}
                                onChange={handleNewRecordChange}
                                placeholder="Detalles sobre la falla, observaciones, etc."
                                disabled={isSubmittingRecord}
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowAddRecordModal(false)} disabled={isSubmittingRecord}>
                            Cancelar
                        </Button>
                        <Button variant="primary" type="submit" disabled={isSubmittingRecord || (newRecordFormData.diagnostico_id === '' && newRecordFormData.current_evaporadora_operativa === (aire?.evaporadora_operativa || 'no_operativa') && newRecordFormData.current_condensadora_operativa === (aire?.condensadora_operativa || 'no_operativa'))}>
                            {isSubmittingRecord ? <><Spinner size="sm" className="me-2" />Guardando...</> : 'Guardar Registro'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

        </Container>
    );
};

export default AiresDetailsPage;
