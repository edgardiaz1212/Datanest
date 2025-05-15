// src/front/js/component/Mantenimientos/MantenimientoAddModal.jsx
import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Modal, Button, Form, Row, Col, Spinner, Alert, ListGroup, Badge, Accordion } from 'react-bootstrap';
import { FiAlertCircle } from 'react-icons/fi'; // Added icons

// Define allowed maintenance types directly
const tiposMantenimientoDisponibles = [
  "Preventivo",
  "Correctivo",
  "Predictivo",
  "Mejora",
  "Inspección",
  "Limpieza General",
  "Otro", // Generic option
];

const MantenimientoAddModal = ({
    show, onHide, aires, otrosEquipos, formData: initialFormData, fileInputRef, onChange: handleInitialFormChange, onSubmit: handleMainSubmit, loadingSubmit, error, clearError,
    // --- NUEVAS PROPS ---
    detailedAlertsList, // Lista de todas las alertas activas
    diagnosticosDisponibles, // Lista de diagnósticos predefinidos para seleccionar
    fetchDiagnosticos, // Acción para cargar diagnósticos si es necesario
}) => {

    const [localFormData, setLocalFormData] = useState(initialFormData);
    // Estado para manejar la resolución de alertas y nuevos diagnósticos
    const [alertasResolucion, setAlertasResolucion] = useState({});
    // { 'evaporadora-Falla de Compresor-ID_ALERTA_UNICO': { resuelta: false, nuevoEstado: '', nuevoDiagnosticoId: '', nuevasNotas: '' }, ... }
    const [selectedEquipoType, setSelectedEquipoType] = useState('aire'); // Default to 'aire'

    // Efecto para resetear el tipo de equipo seleccionado cuando el modal se abre
    useEffect(() => {
        if (show) {
            const defaultType = (initialFormData.aire_id && initialFormData.aire_id !== "") ? 'aire' :
                                (initialFormData.otro_equipo_id && initialFormData.otro_equipo_id !== "") ? 'otro' :
                                (aires && aires.length > 0) ? 'aire' :
                                (otrosEquipos && otrosEquipos.length > 0) ? 'otro' : 'aire';
            setSelectedEquipoType(defaultType);
            if (fetchDiagnosticos) { // Cargar diagnósticos si el modal se muestra y la función existe
                fetchDiagnosticos({ activo: true });
            }
        }
    }, [show, initialFormData.aire_id, initialFormData.otro_equipo_id, aires, otrosEquipos, fetchDiagnosticos]);


    // Filtrar alertas de operatividad para el aire seleccionado en el formulario
    const alertasOperatividadDelAireSeleccionado = useMemo(() => {
        if (selectedEquipoType !== 'aire' || !localFormData.aire_id || !detailedAlertsList) return [];
        return detailedAlertsList.filter(
            alerta => alerta.aire_id === parseInt(localFormData.aire_id) && alerta.alerta_tipo === "Operatividad"
        );
    }, [selectedEquipoType, localFormData.aire_id, detailedAlertsList]);

    useEffect(() => {
        // Cuando el modal se muestra o cambia el aire seleccionado, reseteamos el estado local
        setLocalFormData(initialFormData);
        const initialAlertasResolucion = {};
        if (selectedEquipoType === 'aire' && initialFormData.aire_id && detailedAlertsList) {
            detailedAlertsList
                .filter(alerta => alerta.aire_id === parseInt(initialFormData.aire_id) && alerta.alerta_tipo === "Operatividad")
                .forEach((alerta, index) => { // Añadir index para clave única
                    // Crear una clave única para cada alerta de operatividad
                    const alertKey = `${getParteFromMensaje(alerta.mensaje)}-${alerta.diagnostico_nombre || 'sin_diagnostico'}-${index}`;
                    initialAlertasResolucion[alertKey] = {
                        resuelta: false,
                        componenteOriginal: getParteFromMensaje(alerta.mensaje),
                        diagnosticoOriginal: alerta.diagnostico_nombre,
                        notasOriginales: alerta.diagnostico_notas,
                        mensajeOriginal: alerta.mensaje,
                        nuevoEstado: alerta.valor_actual, // Default al estado actual de la alerta
                        nuevoDiagnosticoId: '',
                        nuevasNotas: ''
                    };
                });
        }
        setAlertasResolucion(initialAlertasResolucion);
    }, [show, initialFormData, detailedAlertsList, selectedEquipoType]);

    const handleLocalFormChange = (e) => {
        // Llama al onChange del padre para los campos principales del mantenimiento
        handleInitialFormChange(e);
        // Actualiza el estado local también para que el modal refleje los cambios
        const { name, value } = e.target;
        setLocalFormData(prev => {
            const newState = { ...prev, [name]: value };
            if (name === 'aire_id' && value) {
                newState.otro_equipo_id = ""; // Limpiar el otro si se selecciona un aire
                setSelectedEquipoType('aire');
            } else if (name === 'otro_equipo_id' && value) {
                newState.aire_id = ""; // Limpiar el aire si se selecciona otro equipo
                setSelectedEquipoType('otro');
            }
            return newState;
        });
    };


    const handleAlertResolucionChange = (alertKey, field, value) => {
        setAlertasResolucion(prev => ({
            ...prev,
            [alertKey]: {
                ...prev[alertKey],
                [field]: value
            }
        }));
    };

    const handleSubmitInterno = (e) => {
        e.preventDefault();
        // Aquí pasamos tanto los datos del mantenimiento como los datos de resolución de alertas
        const datosParaEnviar = {
            mantenimientoData: localFormData, // Datos del formulario de mantenimiento
            resolucionAlertasData: alertasResolucion // Datos de cómo se resolvieron las alertas
        };
        handleMainSubmit(e, datosParaEnviar); // Llamar al onSubmit del padre con todos los datos
    };

    const getParteFromMensaje = (mensaje) => {
        if (!mensaje) return 'general';
        if (mensaje.toLowerCase().includes('evaporadora')) return 'evaporadora';
        if (mensaje.toLowerCase().includes('condensadora')) return 'condensadora';
        return 'general';
    }

    // Wrapper for onHide to also clear errors
    const handleHide = () => {
        if (clearError) clearError(); // Clear error on close
        onHide();
    };

    // Handler for changing the TYPE of equipment (radio buttons)
    const handleTypeChangeRadio = (e) => {
        const newType = e.target.value; // 'aire' or 'otro'
        setSelectedEquipoType(newType);

        // Clear the ID of the unselected type and select the first of the new type if it exists
        const firstAireId = aires && aires.length > 0 ? aires[0].id.toString() : "";
        const firstOtroId = otrosEquipos && otrosEquipos.length > 0 ? otrosEquipos[0].id.toString() : "";

        // Simulate change events to update formData in the parent via the passed onChange prop
        const fakeAireEvent = { target: { name: 'aire_id', value: newType === 'aire' ? firstAireId : "" } };
        const fakeOtroEvent = { target: { name: 'otro_equipo_id', value: newType === 'otro' ? firstOtroId : "" } };

        handleInitialFormChange(fakeAireEvent); // Update aire_id in parent's state
        handleInitialFormChange(fakeOtroEvent); // Update otro_equipo_id in parent's state
        // Actualizar el estado local también
        setLocalFormData(prev => ({
            ...prev,
            aire_id: newType === 'aire' ? firstAireId : "",
            otro_equipo_id: newType === 'otro' ? firstOtroId : ""
        }));
    };


    return (
        <Modal show={show} onHide={handleHide} size="lg" centered backdrop="static" keyboard={!loadingSubmit}>
            <Modal.Header closeButton={!loadingSubmit}>
                <Modal.Title>Registrar Nuevo Mantenimiento</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmitInterno}>
                <Modal.Body>
                    {error && <Alert variant="danger" dismissible onClose={clearError}>{error}</Alert>}

                    <Form.Group className="mb-3" controlId="formTipoEquipoSelector">
                        <Form.Label>Tipo de Equipo <span className="text-danger">*</span></Form.Label>
                        <div>
                            <Form.Check
                                inline type="radio" label="Aire Acondicionado" name="tipoEquipoSelector"
                                id="tipo-aire-radio" value="aire" checked={selectedEquipoType === 'aire'}
                                onChange={handleTypeChangeRadio} disabled={!aires || aires.length === 0 || loadingSubmit}
                            />
                            <Form.Check
                                inline type="radio" label="Otro Equipo" name="tipoEquipoSelector"
                                id="tipo-otro-radio" value="otro" checked={selectedEquipoType === 'otro'}
                                onChange={handleTypeChangeRadio} disabled={!otrosEquipos || otrosEquipos.length === 0 || loadingSubmit}
                            />
                        </div>
                    </Form.Group>

                    {selectedEquipoType === 'aire' && (
                        <Form.Group className="mb-3" controlId="formAireMantenimiento">
                            <Form.Label>Aire Acondicionado <span className="text-danger">*</span></Form.Label>
                            <Form.Select
                                name="aire_id"
                                value={localFormData.aire_id || ""}
                                onChange={handleLocalFormChange}
                                required={selectedEquipoType === 'aire'}
                                disabled={!aires || aires.length === 0 || loadingSubmit}
                            >
                                <option value="">Seleccione un Aire Acondicionado...</option>
                                {aires && aires.map((aire) => (
                                    <option key={aire.id} value={aire.id.toString()}>
                                        {aire.nombre} - {aire.ubicacion}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    )}

                    {selectedEquipoType === 'otro' && (
                        <Form.Group className="mb-3" controlId="formOtroEquipoMantenimiento">
                            <Form.Label>Otro Equipo <span className="text-danger">*</span></Form.Label>
                            <Form.Select
                                name="otro_equipo_id"
                                value={localFormData.otro_equipo_id || ""}
                                onChange={handleLocalFormChange}
                                required={selectedEquipoType === 'otro'}
                                disabled={!otrosEquipos || otrosEquipos.length === 0 || loadingSubmit}
                            >
                                <option value="">Seleccione Otro Equipo...</option>
                                {otrosEquipos && otrosEquipos.map((otro) => (
                                    <option key={otro.id} value={otro.id.toString()}>
                                        {otro.nombre} ({otro.tipo})
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    )}
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3" controlId="formTipoMantenimiento">
                                <Form.Label>Tipo de Mantenimiento <span className="text-danger">*</span></Form.Label>
                                <Form.Select
                                    name="tipo_mantenimiento" value={localFormData.tipo_mantenimiento || ""}
                                    onChange={handleLocalFormChange} required disabled={loadingSubmit}
                                >
                                    <option value="">-- Seleccione un Tipo --</option>
                                    {tiposMantenimientoDisponibles.map((tipo) => (
                                        <option key={tipo} value={tipo}>{tipo}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3" controlId="formTecnicoMantenimiento">
                                <Form.Label>Técnico Responsable <span className="text-danger">*</span></Form.Label>
                                <Form.Control
                                    type="text" name="tecnico" value={localFormData.tecnico || ""}
                                    onChange={handleLocalFormChange} required placeholder="Nombre del técnico"
                                    disabled={loadingSubmit}
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                    <Form.Group className="mb-3" controlId="formDescripcionMantenimiento">
                        <Form.Label>Descripción <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                            as="textarea" rows={3} name="descripcion" value={localFormData.descripcion || ""}
                            onChange={handleLocalFormChange} required placeholder="Detalles del trabajo realizado"
                            disabled={loadingSubmit}
                        />
                    </Form.Group>
                    <Form.Group controlId="formImagenMantenimiento" className="mb-3">
                        <Form.Label>Adjuntar Imagen (Opcional)</Form.Label>
                        <Form.Control
                            type="file" name="imagen_file" ref={fileInputRef}
                            accept="image/*" disabled={loadingSubmit}
                        />
                    </Form.Group>

                    {/* Sección para Resolver Alertas de Operatividad */}
                    {selectedEquipoType === 'aire' && localFormData.aire_id && alertasOperatividadDelAireSeleccionado.length > 0 && (
                        <Accordion className="mt-3">
                            <Accordion.Item eventKey="0">
                                <Accordion.Header>
                                    Resolver Alertas de Operatividad ({alertasOperatividadDelAireSeleccionado.length})
                                    <Badge pill bg="warning" text="dark" className="ms-2">
                                        {alertasOperatividadDelAireSeleccionado.filter(al => {
                                            const key = `${getParteFromMensaje(al.mensaje)}-${al.diagnostico_nombre || 'sin_diagnostico'}-${alertasOperatividadDelAireSeleccionado.indexOf(al)}`;
                                            return !alertasResolucion[key]?.resuelta;
                                        }).length} Pendientes
                                    </Badge>
                                </Accordion.Header>
                                <Accordion.Body>
                                    <ListGroup variant="flush">
                                        {alertasOperatividadDelAireSeleccionado.map((alerta, index) => {
                                            const alertKey = `${getParteFromMensaje(alerta.mensaje)}-${alerta.diagnostico_nombre || 'sin_diagnostico'}-${index}`;
                                            const resolucion = alertasResolucion[alertKey] || { resuelta: false, nuevoEstado: alerta.valor_actual, nuevoDiagnosticoId: '', nuevasNotas: '' };
                                            const parteAfectadaOriginal = getParteFromMensaje(alerta.mensaje);

                                            return (
                                                <ListGroup.Item key={alertKey} className="mb-3 p-3 border rounded">
                                                    <Form.Check
                                                        type="switch"
                                                        id={`resuelta-${alertKey}`}
                                                        label={<strong>Resolver: {alerta.mensaje} (Diagnóstico: {alerta.diagnostico_nombre || 'N/A'})</strong>}
                                                        checked={resolucion.resuelta}
                                                        onChange={(e) => handleAlertResolucionChange(alertKey, 'resuelta', e.target.checked)}
                                                        disabled={loadingSubmit}
                                                    />
                                                    {resolucion.resuelta && (
                                                        <div className="mt-2 ps-3">
                                                            <Form.Group as={Row} className="mb-2">
                                                                <Form.Label column sm="4">Nuevo Estado Operativo:</Form.Label>
                                                                <Col sm="8">
                                                                    <Form.Select
                                                                        name="nuevoEstado"
                                                                        value={resolucion.nuevoEstado}
                                                                        onChange={(e) => handleAlertResolucionChange(alertKey, 'nuevoEstado', e.target.value)}
                                                                        disabled={loadingSubmit}
                                                                    >
                                                                        <option value="operativa">Operativa</option>
                                                                        <option value="parcialmente_operativa">Parcialmente Operativa</option>
                                                                        <option value="no_operativa">No Operativa</option>
                                                                    </Form.Select>
                                                                </Col>
                                                            </Form.Group>
                                                        </div>
                                                    )}
                                                    {/* Mostrar campos para nuevo diagnóstico si NO está operativa o si no se resolvió */}
                                                    {((resolucion.resuelta && resolucion.nuevoEstado !== 'operativa') || !resolucion.resuelta) && (
                                                        <div className="mt-2 ps-3 border-start border-warning">
                                                            <p className="small text-muted mb-1">Si el problema persiste o cambia, registre un nuevo diagnóstico para <strong>{parteAfectadaOriginal}</strong>:</p>
                                                            <Form.Group as={Row} className="mb-2">
                                                                <Form.Label column sm="4">Nuevo Diagnóstico:</Form.Label>
                                                                <Col sm="8">
                                                                    <Form.Select
                                                                        name="nuevoDiagnosticoId"
                                                                        value={resolucion.nuevoDiagnosticoId}
                                                                        onChange={(e) => handleAlertResolucionChange(alertKey, 'nuevoDiagnosticoId', e.target.value)}
                                                                        disabled={loadingSubmit || !diagnosticosDisponibles}
                                                                    >
                                                                        <option value="">Seleccione un diagnóstico...</option>
                                                                        {diagnosticosDisponibles && diagnosticosDisponibles
                                                                            .filter(d => d.parte_ac === parteAfectadaOriginal || d.parte_ac === 'general')
                                                                            .map(diag => <option key={diag.id} value={diag.id}>{diag.nombre}</option>)}
                                                                    </Form.Select>
                                                                </Col>
                                                            </Form.Group>
                                                            <Form.Group as={Row}>
                                                                <Form.Label column sm="4">Nuevas Notas:</Form.Label>
                                                                <Col sm="8">
                                                                    <Form.Control as="textarea" rows={2} name="nuevasNotas" value={resolucion.nuevasNotas} onChange={(e) => handleAlertResolucionChange(alertKey, 'nuevasNotas', e.target.value)} disabled={loadingSubmit} placeholder="Notas adicionales del nuevo diagnóstico" />
                                                                </Col>
                                                            </Form.Group>
                                                        </div>
                                                    )}
                                                </ListGroup.Item>
                                            );
                                        })}
                                    </ListGroup>
                                </Accordion.Body>
                            </Accordion.Item>
                        </Accordion>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleHide} disabled={loadingSubmit}>
                        Cancelar
                    </Button>
                    <Button variant="primary" type="submit" disabled={loadingSubmit}>
                        {loadingSubmit ? <><Spinner size="sm" className="me-2" /> Guardando...</> : 'Guardar Mantenimiento'}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

MantenimientoAddModal.propTypes = {
    show: PropTypes.bool.isRequired,
    onHide: PropTypes.func.isRequired,
    aires: PropTypes.array,
    otrosEquipos: PropTypes.array,
    formData: PropTypes.object.isRequired,
    fileInputRef: PropTypes.object,
    onChange: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    loadingSubmit: PropTypes.bool.isRequired,
    error: PropTypes.string,
    clearError: PropTypes.func.isRequired,
    detailedAlertsList: PropTypes.array,
    diagnosticosDisponibles: PropTypes.array,
    fetchDiagnosticos: PropTypes.func,
};

export default MantenimientoAddModal;
