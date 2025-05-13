// src/front/js/component/Mantenimientos/MantenimientoAddModal.jsx

import React, { useState, useEffect, useMemo } from 'react'; // Añadir useState, useEffect
import PropTypes from 'prop-types';
import { Modal, Button, Form, Spinner, Alert, Row, Col, ListGroup, Badge } from 'react-bootstrap'; // Added ListGroup, Badge
import { FiAlertCircle, FiCheckSquare, FiSquare } from 'react-icons/fi'; // Added icons

// --- Remove TypeScript interfaces ---
// Interfaces AireAcondicionadoOption, OtroEquipoOption are defined in the parent

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

const MantenimientoAddModal = ({ // Remove : React.FC<MantenimientoAddModalProps>
  show,
  onHide,
  aires,
  otrosEquipos, // <-- Receive prop
  formData,
  fileInputRef,
  onChange,
  onSubmit,
  loadingSubmit,
  error,
  clearError,
  detailedAlertsList, 
  diagnosticosDisponibles, 
  fetchDiagnosticos,
 
}) => {

  // Local state to manage which equipment type is selected
  const [selectedEquipoType, setSelectedEquipoType] = useState('aire');
  const [alertasDelAireSeleccionado, setAlertasDelAireSeleccionado] = useState([]);
  const [alertasResueltasSeleccionadas, setAlertasResueltasSeleccionadas] = useState({}); // { "mensaje_alerta_unico": true/false }
  // --- NUEVO ESTADO PARA RESOLVER OPERATIVIDAD ---
  const [resuelveOperatividadEvaporadora, setResuelveOperatividadEvaporadora] = useState(false);
  const [resuelveOperatividadCondensadora, setResuelveOperatividadCondensadora] = useState(false);
  const [aireSeleccionadoActual, setAireSeleccionadoActual] = useState(null); // Para saber el estado operativo del aire

  // Effect to reset the selected type when the modal opens
  // and select 'aire' if available, otherwise 'otro'.
  useEffect(() => {
    if (show) {
      const defaultType = aires.length > 0 ? 'aire' : (otrosEquipos.length > 0 ? 'otro' : 'aire');
      setSelectedEquipoType(defaultType);
      // Ensure formData reflects the initial type (parent's handleAdd does this)
    }
    // Resetear estados de resolución de operatividad al abrir/cerrar
    setResuelveOperatividadEvaporadora(false);
    setResuelveOperatividadCondensadora(false);
     // Cargar diagnósticos si el modal se muestra
     if (show && fetchDiagnosticos) {
      fetchDiagnosticos({ activo: true });
  }
  }, [show, aires, otrosEquipos]);

  // Efecto para filtrar alertas cuando cambia el aire seleccionado en el formulario
  useEffect(() => {
    if (show && selectedEquipoType === 'aire' && formData.aire_id && detailedAlertsList) {
      const aireIdNum = parseInt(formData.aire_id);
      const alertasFiltradas = detailedAlertsList.filter(
        alerta => alerta.aire_id === aireIdNum && alerta.alerta_tipo === "Operatividad"
      );
      setAlertasDelAireSeleccionado(alertasFiltradas);
      // Resetear las alertas resueltas seleccionadas al cambiar de aire
      setAlertasResueltasSeleccionadas({});
      // --- NUEVO: Guardar el objeto del aire seleccionado para verificar su estado operativo ---
      const aireObj = aires.find(a => a.id === aireIdNum); // 'aires' viene de props
      setAireSeleccionadoActual(aireObj || null);
      // Si el aire ya está operativo, el switch de "resolver" no tiene sentido,
      // pero si no lo está, por defecto no lo resuelve el mantenimiento.
      setResuelveOperatividadEvaporadora(aireObj?.evaporadora_operativa || false);
      setResuelveOperatividadCondensadora(aireObj?.condensadora_operativa || false);

      // Poblar formData con el diagnóstico actual si el componente está no operativo
      // Esto es para que el usuario vea el diagnóstico actual y pueda cambiarlo si el componente SIGUE no operativo.
      // La lógica de si se envían estos datos dependerá de los switches de "resolver operatividad".
      // El `onChange` del modal (pasado desde Mantenimientos.jsx) actualizará el `formData` del padre.
      // Aquí solo estamos preparando los valores iniciales para el modal.


    } else {
      setAlertasDelAireSeleccionado([]);
      setAlertasResueltasSeleccionadas({});
      setAireSeleccionadoActual(null);
    }
  }, [show, selectedEquipoType, formData.aire_id, detailedAlertsList]);

// Filtrar diagnósticos para el modal (similar a AiresAddEditModal)
const diagnosticosEvaporadoraModal = useMemo(() => {
  if (!diagnosticosDisponibles || !aireSeleccionadoActual) return [];
  return diagnosticosDisponibles.filter(d =>
      (d.parte_ac === 'evaporadora' || d.parte_ac === 'general') &&
      (d.tipo_aire_sugerido === aireSeleccionadoActual.tipo?.toLowerCase() || d.tipo_aire_sugerido === 'ambos' || !aireSeleccionadoActual.tipo)
  );
}, [diagnosticosDisponibles, aireSeleccionadoActual]);

const diagnosticosCondensadoraModal = useMemo(() => {
  if (!diagnosticosDisponibles || !aireSeleccionadoActual) return [];
  return diagnosticosDisponibles.filter(d =>
      (d.parte_ac === 'condensadora' || d.parte_ac === 'general') &&
      (d.tipo_aire_sugerido === aireSeleccionadoActual.tipo?.toLowerCase() || d.tipo_aire_sugerido === 'ambos' || !aireSeleccionadoActual.tipo)
  );
}, [diagnosticosDisponibles, aireSeleccionadoActual]);

// Helper para formatear fecha para input tipo 'date'
const formatDateForInput = (isoDateString) => {
  if (!isoDateString) return new Date().toISOString().split('T')[0];
  return new Date(isoDateString).toISOString().split('T')[0];
};
const formatTimeForInput = (isoDateString) => {
  if (!isoDateString) return new Date().toTimeString().slice(0,5);
  return new Date(isoDateString).toTimeString().slice(0,5);
};

  // Wrapper for onHide to also clear errors
  const handleHide = () => {
    if (clearError) clearError(); // Clear error on close
    onHide();
  };

  // Handler for changing the TYPE of equipment (radio buttons)
  const handleTypeChange = (e) => { // Remove type annotation
    const newType = e.target.value; // 'aire' or 'otro'
    setSelectedEquipoType(newType);

    // Clear the ID of the unselected type and select the first of the new type if it exists
    const firstAireId = aires.length > 0 ? aires[0].id.toString() : "";
    const firstOtroId = otrosEquipos.length > 0 ? otrosEquipos[0].id.toString() : "";

    // Simulate change events to update formData in the parent via the passed onChange prop
    // Create minimal event-like objects
    const fakeAireEvent = { target: { name: 'aire_id', value: newType === 'aire' ? firstAireId : "" } };
    const fakeOtroEvent = { target: { name: 'otro_equipo_id', value: newType === 'otro' ? firstOtroId : "" } };

    onChange(fakeAireEvent); // Update aire_id in parent's state
    onChange(fakeOtroEvent); // Update otro_equipo_id in parent's state
  };

  // Modificar el onSubmit para incluir las alertas seleccionadas
  const handleFormSubmit = (e) => {
    e.preventDefault();
    // Pasar las alertas seleccionadas junto con el evento y el formData (implícito a través de props)
    // --- NUEVO: Pasar también los booleanos de resolución de operatividad ---
    onSubmit(e, {
      alertasResueltas: alertasResueltasSeleccionadas,
      resuelveEvaporadora: resuelveOperatividadEvaporadora,
      resuelveCondensadora: resuelveOperatividadCondensadora
    });
  };

  // Handler para seleccionar/deseleccionar una alerta resuelta
  const handleAlertaResueltaChange = (alertaMensaje) => {
    setAlertasResueltasSeleccionadas(prev => ({
      ...prev,
      [alertaMensaje]: !prev[alertaMensaje]
    }));
  };

  return (
    // Prevent closing during submit
    <Modal show={show} onHide={handleHide} centered backdrop="static" keyboard={!loadingSubmit}>
      <Modal.Header closeButton={!loadingSubmit}> {/* Disable close button during submit */}
        <Modal.Title>Registrar Mantenimiento</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleFormSubmit}> {/* <--- USAR EL NUEVO HANDLER */}
        <Modal.Body>
          {/* Display error if passed */}
          {error && <Alert variant="danger">{error}</Alert>}

          {/* --- Equipment Type Selector --- */}
          <Form.Group className="mb-3" controlId="formTipoEquipoSelector">
            <Form.Label>Tipo de Equipo <span className="text-danger">*</span></Form.Label>
            <div>
              <Form.Check
                inline
                type="radio"
                label="Aire Acondicionado"
                name="tipoEquipoSelector" // Group radios
                id="tipo-aire" // Unique ID
                value="aire"
                checked={selectedEquipoType === 'aire'}
                onChange={handleTypeChange}
                disabled={aires.length === 0 || loadingSubmit} // Disable if no aires or submitting
              />
              <Form.Check
                inline
                type="radio"
                label="Otro Equipo"
                name="tipoEquipoSelector" // Group radios
                id="tipo-otro" // Unique ID
                value="otro"
                checked={selectedEquipoType === 'otro'}
                onChange={handleTypeChange}
                disabled={otrosEquipos.length === 0 || loadingSubmit} // Disable if no otros or submitting
              />
            </div>
          </Form.Group>

          {/* --- Conditional Selector for Aires --- */}
          {selectedEquipoType === 'aire' && (
            <Form.Group className="mb-3" controlId="formAireMantenimiento">
              <Form.Label>Aire Acondicionado <span className="text-danger">*</span></Form.Label>
              <Form.Select
                name="aire_id" // Matches key in formData
                value={formData.aire_id || ""} // Use value from formData, default to ""
                onChange={onChange} // Use parent's handler
                required={selectedEquipoType === 'aire'} // Required only when visible
                disabled={aires.length === 0 || loadingSubmit}
              >
                {aires.length === 0 ? (
                  <option value="">No hay aires disponibles</option>
                ) : (
                  <>
                    {/* Optional: Add a default selection prompt */}
                    {/* <option value="">-- Seleccione un Aire --</option> */}
                    {aires.map((aire) => (
                      <option key={aire.id} value={aire.id.toString()}>
                        {aire.nombre} - {aire.ubicacion}
                      </option>
                    ))}
                  </>
                )}
              </Form.Select>
            </Form.Group>
          )}

          {/* --- Conditional Selector for Otros Equipos --- */}
          {selectedEquipoType === 'otro' && (
            <Form.Group className="mb-3" controlId="formOtroEquipoMantenimiento">
              <Form.Label>Otro Equipo <span className="text-danger">*</span></Form.Label>
              <Form.Select
                name="otro_equipo_id" // Matches key in formData
                value={formData.otro_equipo_id || ""} // Use value from formData, default to ""
                onChange={onChange} // Use parent's handler
                required={selectedEquipoType === 'otro'} // Required only when visible
                disabled={otrosEquipos.length === 0 || loadingSubmit}
              >
                {otrosEquipos.length === 0 ? (
                  <option value="">No hay otros equipos disponibles</option>
                ) : (
                  <>
                    {/* <option value="">-- Seleccione Otro Equipo --</option> */}
                    {otrosEquipos.map((otro) => (
                      <option key={otro.id} value={otro.id.toString()}>
                        {otro.nombre} ({otro.tipo})
                      </option>
                    ))}
                  </>
                )}
              </Form.Select>
            </Form.Group>
          )}

          {/* --- Rest of the form fields --- */}
          <Form.Group className="mb-3" controlId="formTipoMantenimiento">
            <Form.Label>Tipo de Mantenimiento <span className="text-danger">*</span></Form.Label>
            <Form.Select
              name="tipo_mantenimiento"
              value={formData.tipo_mantenimiento || ""}
              onChange={onChange}
              required
              disabled={loadingSubmit}
            >
              <option value="">-- Seleccione un Tipo --</option>
              {tiposMantenimientoDisponibles.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3" controlId="formTecnicoMantenimiento">
            <Form.Label>Técnico Responsable <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="text"
              name="tecnico"
              value={formData.tecnico || ""}
              onChange={onChange}
              required
              disabled={loadingSubmit}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formDescripcionMantenimiento">
            <Form.Label>Descripción <span className="text-danger">*</span></Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="descripcion"
              value={formData.descripcion || ""}
              onChange={onChange}
              required
              disabled={loadingSubmit}
            />
          </Form.Group>

          <Form.Group controlId="formImagenMantenimiento" className="mb-3">
            <Form.Label>Adjuntar Imagen (Opcional)</Form.Label>
            <Form.Control
              type="file"
              name="imagen_file" // Name used in the backend FormData access
              ref={fileInputRef} // Assign the ref
              accept="image/*" // Accept only image files
              disabled={loadingSubmit}
            />
          </Form.Group>

          {/* --- SECCIÓN DE ALERTAS RESUELTAS (CONDICIONAL) --- */}
          {selectedEquipoType === 'aire' && alertasDelAireSeleccionado.length > 0 && (
            <Form.Group className="mb-3" controlId="formAlertasResueltas">
              <Form.Label className="fw-bold">
                <FiAlertCircle className="me-1" /> ¿Este mantenimiento resuelve alguna alerta activa de este aire?
              </Form.Label>
              <ListGroup variant="flush">
                {alertasDelAireSeleccionado.map((alerta, index) => {
                  // Crear un identificador único para la alerta si no tiene un ID persistente
                  const alertaKey = `${alerta.componente}-${alerta.mensaje}-${alerta.diagnostico_nombre || index}`;
                  return (
                    <ListGroup.Item key={alertaKey} className="px-0 py-2">
                      <Form.Check
                        type="checkbox"
                        id={`alerta-resuelta-${alertaKey}`}
                        checked={!!alertasResueltasSeleccionadas[alertaKey]}
                        onChange={() => handleAlertaResueltaChange(alertaKey)}
                        label={
                          <>
                            <Badge bg="danger" pill className="me-2">{alerta.componente}</Badge>
                            {alerta.diagnostico_nombre || alerta.mensaje}
                            {alerta.diagnostico_notas && (
                              <small className="d-block text-muted ms-4">
                                Notas: {alerta.diagnostico_notas}
                              </small>
                            )}
                          </>
                        }
                        disabled={loadingSubmit}
                      />
                    </ListGroup.Item>
                  );
                })}
              </ListGroup>
              <Form.Text muted>
                Marque las fallas de operatividad que se corrigen con este mantenimiento.
              </Form.Text>
            </Form.Group>
          )}
          {/* --- FIN SECCIÓN ALERTAS --- */}
 {/* --- SECCIÓN ACTUALIZAR DIAGNÓSTICO SI SIGUE NO OPERATIVO --- */}
 {selectedEquipoType === 'aire' && aireSeleccionadoActual && !resuelveOperatividadEvaporadora && !aireSeleccionadoActual.evaporadora_operativa && (
            <Form.Group className="mb-3 p-3 border rounded border-warning bg-light-subtle" controlId="formActualizarDiagnosticoEvap">
              <Form.Label className="fw-bold text-warning">
                <FiAlertCircle className="me-1" /> Actualizar Diagnóstico Evaporadora (ya que sigue/queda NO operativa)
              </Form.Label>
              <Row>
                <Col md={6}>
                    <Form.Label>Nuevo Diagnóstico</Form.Label>
                    <Form.Select name="evaporadora_diagnostico_id" value={formData.evaporadora_diagnostico_id || aireSeleccionadoActual.evaporadora_diagnostico_id || ''} onChange={onChange} disabled={loadingSubmit}>
                        <option value="">Seleccione un diagnóstico...</option>
                        {diagnosticosEvaporadoraModal.map(diag => (<option key={diag.id} value={diag.id}>{diag.nombre}</option>))}
                    </Form.Select>
                </Col>
                 <Col md={3}>
                    <Form.Label>Fecha Diagnóstico</Form.Label>
                    <Form.Control type="date" name="evaporadora_fecha_diagnostico" value={formData.evaporadora_fecha_diagnostico || formatDateForInput(aireSeleccionadoActual.evaporadora_fecha_hora_diagnostico)} onChange={onChange} disabled={loadingSubmit} />
                </Col>
                <Col md={3}>
                    <Form.Label>Hora Diagnóstico</Form.Label>
                    <Form.Control type="time" name="evaporadora_hora_diagnostico" value={formData.evaporadora_hora_diagnostico || formatTimeForInput(aireSeleccionadoActual.evaporadora_fecha_hora_diagnostico)} onChange={onChange} disabled={loadingSubmit} />
                </Col>
              </Row>
              <Form.Group className="mt-2">
                <Form.Label>Nuevas Notas del Diagnóstico</Form.Label>
                <Form.Control as="textarea" rows={2} name="evaporadora_diagnostico_notas" value={formData.evaporadora_diagnostico_notas || aireSeleccionadoActual.evaporadora_diagnostico_notas || ''} onChange={onChange} placeholder="Detalles adicionales..." disabled={loadingSubmit} />
              </Form.Group>
            </Form.Group>
          )}

          {selectedEquipoType === 'aire' && aireSeleccionadoActual && !resuelveOperatividadCondensadora && !aireSeleccionadoActual.condensadora_operativa && (
            <Form.Group className="mb-3 p-3 border rounded border-warning bg-light-subtle" controlId="formActualizarDiagnosticoCond">
              <Form.Label className="fw-bold text-warning">
                <FiAlertCircle className="me-1" /> Actualizar Diagnóstico Condensadora (ya que sigue/queda NO operativa)
              </Form.Label>
               <Row>
                <Col md={6}>
                    <Form.Label>Nuevo Diagnóstico</Form.Label>
                    <Form.Select name="condensadora_diagnostico_id" value={formData.condensadora_diagnostico_id || aireSeleccionadoActual.condensadora_diagnostico_id || ''} onChange={onChange} disabled={loadingSubmit}>
                        <option value="">Seleccione un diagnóstico...</option>
                        {diagnosticosCondensadoraModal.map(diag => (<option key={diag.id} value={diag.id}>{diag.nombre}</option>))}
                    </Form.Select>
                </Col>
                <Col md={3}>
                    <Form.Label>Fecha Diagnóstico</Form.Label>
                    <Form.Control type="date" name="condensadora_fecha_diagnostico" value={formData.condensadora_fecha_diagnostico || formatDateForInput(aireSeleccionadoActual.condensadora_fecha_hora_diagnostico)} onChange={onChange} disabled={loadingSubmit} />
                </Col>
                <Col md={3}>
                    <Form.Label>Hora Diagnóstico</Form.Label>
                    <Form.Control type="time" name="condensadora_hora_diagnostico" value={formData.condensadora_hora_diagnostico || formatTimeForInput(aireSeleccionadoActual.condensadora_fecha_hora_diagnostico)} onChange={onChange} disabled={loadingSubmit} />
                </Col>
              </Row>
              <Form.Group className="mt-2">
                <Form.Label>Nuevas Notas del Diagnóstico</Form.Label>
                <Form.Control as="textarea" rows={2} name="condensadora_diagnostico_notas" value={formData.condensadora_diagnostico_notas || aireSeleccionadoActual.condensadora_diagnostico_notas || ''} onChange={onChange} placeholder="Detalles adicionales..." disabled={loadingSubmit} />
              </Form.Group>
            </Form.Group>
          )}
          {/* --- FIN SECCIÓN ACTUALIZAR DIAGNÓSTICO --- */}

          {/* --- SECCIÓN RESOLVER OPERATIVIDAD (CONDICIONAL) --- */}
          {selectedEquipoType === 'aire' && aireSeleccionadoActual && (
            <>
              {!aireSeleccionadoActual.evaporadora_operativa && (
                <Form.Group className="mb-3 mt-3" controlId="formResuelveEvap">
                  <Form.Check
                    type="switch"
                    id="resuelve-evaporadora-switch"
                    label="¿Este mantenimiento deja la EVAPORADORA operativa?"
                    checked={resuelveOperatividadEvaporadora}
                    onChange={(e) => setResuelveOperatividadEvaporadora(e.target.checked)}
                    disabled={loadingSubmit}
                  />
                </Form.Group>
              )}
              {!aireSeleccionadoActual.condensadora_operativa && (
                <Form.Group className="mb-3" controlId="formResuelveCond">
                  <Form.Check
                    type="switch"
                    id="resuelve-condensadora-switch"
                    label="¿Este mantenimiento deja la CONDENSADORA operativa?"
                    checked={resuelveOperatividadCondensadora}
                    onChange={(e) => setResuelveOperatividadCondensadora(e.target.checked)}
                    disabled={loadingSubmit}
                  />
                </Form.Group>
              )}
            </>
          )}
          {/* --- FIN SECCIÓN RESOLVER OPERATIVIDAD --- */}


        </Modal.Body>
        <Modal.Footer>
          {/* Disable Cancel button during submit */}
          <Button variant="secondary" onClick={handleHide} disabled={loadingSubmit}>
            Cancelar
          </Button>
          {/* Disable Submit button during submit */}
          <Button variant="primary" type="submit" disabled={loadingSubmit}>
            {loadingSubmit ? <><Spinner size="sm" className="me-2" /> Guardando...</> : 'Guardar Mantenimiento'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

// Add PropTypes for runtime type checking
MantenimientoAddModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  aires: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    nombre: PropTypes.string.isRequired,
    ubicacion: PropTypes.string,
  })).isRequired,
  otrosEquipos: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    nombre: PropTypes.string.isRequired,
    tipo: PropTypes.string,
  })).isRequired,
  formData: PropTypes.shape({
    aire_id: PropTypes.string,
    otro_equipo_id: PropTypes.string,
    tipo_mantenimiento: PropTypes.string,
    descripcion: PropTypes.string,
    tecnico: PropTypes.string,
  }).isRequired,
  fileInputRef: PropTypes.oneOfType([ // Ref can be a function or an object
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.instanceOf(Element) })
  ]),
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  loadingSubmit: PropTypes.bool.isRequired,
  error: PropTypes.string, // Can be null
  clearError: PropTypes.func.isRequired,
  // --- NUEVOS PROPTYPES ---
  detailedAlertsList: PropTypes.arrayOf(PropTypes.shape({
    aire_id: PropTypes.number,
    componente: PropTypes.string,
    mensaje: PropTypes.string,
    diagnostico_nombre: PropTypes.string,
  })).isRequired,
  diagnosticosDisponibles: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    nombre: PropTypes.string.isRequired,
  })), // No es isRequired porque puede ser null inicialmente
  fetchDiagnosticos: PropTypes.func.isRequired,

};

export default MantenimientoAddModal;
