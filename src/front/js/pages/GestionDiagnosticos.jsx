import React, { useState, useEffect, useContext } from 'react';
import { Container, Card, Table, Button, Modal, Form, Row, Col, Spinner, Alert, Badge, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FiPlus, FiEdit, FiTrash2, FiCheckCircle, FiXCircle, FiWind, FiAward, FiHelpCircle } from 'react-icons/fi'; // Añadidos iconos relevantes
import { Context } from '../store/appContext';

// Definir las opciones de los Enums para los dropdowns
// Estos deben coincidir con los valores definidos en el backend (models.py)
const parteACOptions = [
  { value: 'evaporadora', label: 'Evaporadora' },
  { value: 'condensadora', label: 'Condensadora' },
  { value: 'general', label: 'General' },
];

const tipoAireSugeridoOptions = [
  { value: 'confort', label: 'Confort' },
  { value: 'precision', label: 'Precisión' },
  { value: 'ambos', label: 'Ambos' },
];

const GestionDiagnosticos = () => {
  const { store, actions } = useContext(Context);
  const {
    trackerUser: currentUser,
    diagnosticoComponentes: diagnosticos, // Renombrar para facilidad
    diagnosticoComponentesLoading: loading,
    diagnosticoComponentesError: error,
  } = store;
  const {
    fetchDiagnosticoComponentes,
    addDiagnosticoComponente,
    updateDiagnosticoComponente,
    deleteDiagnosticoComponente,
    clearDiagnosticoComponentesError,
  } = actions;

  // Estado local para el modal y formulario
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    nombre: '',
    parte_ac: parteACOptions[0].value, // Default to first option
    tipo_aire_sugerido: tipoAireSugeridoOptions[2].value, // Default to 'Ambos'
    descripcion_ayuda: '',
    activo: true,
  });
  const [formMode, setFormMode] = useState('add'); // 'add' or 'edit'
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Access Control ---
  // Only admin can manage diagnostics
  const canManage = currentUser?.rol === 'admin';
  // --- End Access Control ---

  // Efecto para cargar diagnósticos al montar
  useEffect(() => {
    // Only fetch data if the user has permission
    if (canManage) {
      fetchDiagnosticoComponentes();
    }

    return () => {
      if (clearDiagnosticoComponentesError) clearDiagnosticoComponentesError();
    };
  }, [fetchDiagnosticoComponentes, clearDiagnosticoComponentesError, canManage]);

  // --- Early Return for Access Denied ---
  if (!canManage) {
    return (
      <Container className="mt-4">
        <h1>Gestión de Diagnósticos</h1>
        <Alert variant="warning">
          <Alert.Heading>Acceso Restringido</Alert.Heading>
          <p>Solo los administradores pueden acceder a la gestión de diagnósticos predefinidos.</p>
        </Alert>
      </Container>
    );
  }
  // --- End Early Return ---

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const target = e.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  // Validar formulario
  const validateForm = () => {
    const errors = [];
    if (!formData.nombre?.trim()) {
      errors.push('El nombre del diagnóstico es requerido.');
    }
    if (!formData.parte_ac) {
      errors.push('La parte del AC es requerida.');
    }
    if (!formData.tipo_aire_sugerido) {
      errors.push('El tipo de aire sugerido es requerido.');
    }
    return errors;
  };

  // Abrir modal para agregar
  const handleAdd = () => {
    setFormData({
      id: null,
      nombre: '',
      parte_ac: parteACOptions[0].value,
      tipo_aire_sugerido: tipoAireSugeridoOptions[2].value,
      descripcion_ayuda: '',
      activo: true,
    });
    setFormMode('add');
    setShowModal(true);
    if (clearDiagnosticoComponentesError) clearDiagnosticoComponentesError();
  };

  // Abrir modal para editar
  const handleEdit = (diagnostico) => {
    setFormData({
      id: diagnostico.id,
      nombre: diagnostico.nombre,
      parte_ac: diagnostico.parte_ac,
      tipo_aire_sugerido: diagnostico.tipo_aire_sugerido,
      descripcion_ayuda: diagnostico.descripcion_ayuda || '',
      activo: diagnostico.activo,
    });
    setFormMode('edit');
    setShowModal(true);
    if (clearDiagnosticoComponentesError) clearDiagnosticoComponentesError();
  };

  // Eliminar diagnóstico
  const handleDelete = async (id, nombre) => {
    if (window.confirm(`¿Está seguro de eliminar el diagnóstico "${nombre}"? Esta acción no se puede deshacer.`)) {
      setIsSubmitting(true);
      const success = await deleteDiagnosticoComponente(id);
      setIsSubmitting(false);
      // Error handling is global via store.diagnosticoComponentesError
    }
  };

  // Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (clearDiagnosticoComponentesError) clearDiagnosticoComponentesError();

    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      // Assuming setDiagnosticoComponentesError action exists
      if (actions.setDiagnosticoComponentesError) {
        actions.setDiagnosticoComponentesError(validationErrors.join(' '));
      } else {
        alert(validationErrors.join(' '));
      }
      return;
    }

    setIsSubmitting(true);
    let success = false;

    const payload = {
      nombre: formData.nombre.trim(), // Trim whitespace
      parte_ac: formData.parte_ac,
      tipo_aire_sugerido: formData.tipo_aire_sugerido,
      descripcion_ayuda: formData.descripcion_ayuda?.trim() || null, // Save empty string as null
      activo: formData.activo,
    };

    if (formMode === 'add') {
      success = await addDiagnosticoComponente(payload);
    } else if (formData.id) {
      success = await updateDiagnosticoComponente(formData.id, payload);
    }

    setIsSubmitting(false);
    if (success) {
      setShowModal(false); // Close modal on success
    }
    // Error display is handled by the global 'diagnosticoComponentesError' state
  };

  // Helper para renderizar Tooltips
  const renderTooltip = (props, text) => (
    <Tooltip id={`button-tooltip-${text.replace(/\s+/g, '-')}`} {...props}>
      {text}
    </Tooltip>
  );

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Gestión de Diagnósticos</h1>
        {canManage && (
          <Button variant="primary" onClick={handleAdd}>
            <FiPlus className="me-2" /> Agregar Diagnóstico
          </Button>
        )}
      </div>

      {/* Global Error Display */}
      {error && (
        <Alert variant="danger" dismissible onClose={clearDiagnosticoComponentesError}>
          {error}
        </Alert>
      )}

      {/* Diagnósticos List Card */}
      <Card className="dashboard-card">
        <Card.Header>
          <h5 className="mb-0">Diagnósticos Predefinidos</h5>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="text-center p-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3">Cargando diagnósticos...</p>
            </div>
          ) : diagnosticos.length === 0 ? (
            <div className="text-center p-5">
              <FiAward size={50} className="text-muted mb-3" />
              <h4>No hay diagnósticos registrados</h4>
              {canManage && (
                <Button variant="primary" className="mt-3" onClick={handleAdd}>
                  <FiPlus className="me-2" /> Agregar primer diagnóstico
                </Button>
              )}
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover striped size="sm">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Parte AC</th>
                    <th>Tipo Aire Sugerido</th>
                    <th>Descripción/Ayuda</th>
                    <th>Activo</th>
                    {canManage && <th className="text-end">Acciones</th>}
                  </tr>
                </thead>
                <tbody>
                  {diagnosticos.map(diag => (
                    <tr key={diag.id}>
                      <td>{diag.nombre}</td>
                      <td>
                        <Badge bg="secondary">
                          {parteACOptions.find(opt => opt.value === diag.parte_ac)?.label || diag.parte_ac}
                        </Badge>
                      </td>
                      <td>
                         <Badge bg="info">
                           {tipoAireSugeridoOptions.find(opt => opt.value === diag.tipo_aire_sugerido)?.label || diag.tipo_aire_sugerido}
                         </Badge>
                      </td>
                      <td>
                        {diag.descripcion_ayuda ? (
                          <OverlayTrigger
                            placement="top"
                            overlay={renderTooltip(null, diag.descripcion_ayuda)}
                          >
                            <span><FiHelpCircle className="me-1 text-muted" />Ver ayuda</span>
                          </OverlayTrigger>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      <td>
                        {diag.activo ? (
                          <Badge bg="success"><FiCheckCircle /> Sí</Badge>
                        ) : (
                          <Badge bg="danger"><FiXCircle /> No</Badge>
                        )}
                      </td>
                      {canManage && (
                        <td className="text-end">
                          <OverlayTrigger
                            placement="top"
                            delay={{ show: 250, hide: 400 }}
                            overlay={(props) => renderTooltip(props, "Editar")}
                          >
                            <Button
                              variant="outline-primary"
                              size="sm"
                              className="me-2"
                              onClick={() => handleEdit(diag)}
                              disabled={isSubmitting}
                            >
                              <FiEdit />
                            </Button>
                          </OverlayTrigger>
                          <OverlayTrigger
                            placement="top"
                            delay={{ show: 250, hide: 400 }}
                            overlay={(props) => renderTooltip(props, "Eliminar")}
                          >
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDelete(diag.id, diag.nombre)}
                              disabled={isSubmitting}
                            >
                              <FiTrash2 />
                            </Button>
                          </OverlayTrigger>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Modal de formulario */}
      <Modal show={showModal} onHide={() => !isSubmitting && setShowModal(false)} centered backdrop="static" keyboard={!isSubmitting}>
        <Modal.Header closeButton={!isSubmitting}>
          <Modal.Title>
            {formMode === 'add' ? 'Agregar Diagnóstico' : 'Editar Diagnóstico'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {/* Display form-specific errors or global error */}
            {error && <Alert variant="danger">{error}</Alert>}

            <Form.Group className="mb-3" controlId="formDiagnosticoNombre">
              <Form.Label>Nombre del Diagnóstico <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
                disabled={isSubmitting}
                placeholder="Ej: Falla de Compresor"
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="formDiagnosticoParteAC">
                  <Form.Label>Parte del AC <span className="text-danger">*</span></Form.Label>
                  <Form.Select
                    name="parte_ac"
                    value={formData.parte_ac}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting}
                  >
                    {parteACOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="formDiagnosticoTipoAire">
                  <Form.Label>Tipo de Aire Sugerido <span className="text-danger">*</span></Form.Label>
                  <Form.Select
                    name="tipo_aire_sugerido"
                    value={formData.tipo_aire_sugerido}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting}
                  >
                    {tipoAireSugeridoOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3" controlId="formDiagnosticoDescripcion">
              <Form.Label>Descripción / Ayuda (Opcional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="descripcion_ayuda"
                value={formData.descripcion_ayuda}
                onChange={handleChange}
                disabled={isSubmitting}
                placeholder="Ej: Indica que el compresor no arranca o tiene bajo rendimiento."
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formDiagnosticoActivo">
              <Form.Check
                type="checkbox"
                label="Diagnóstico Activo (Visible en listas de selección)"
                name="activo"
                checked={formData.activo}
                onChange={handleChange}
                disabled={isSubmitting}
              />
            </Form.Group>

          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? <><Spinner size="sm" className="me-2" />Guardando...</> : 'Guardar Diagnóstico'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default GestionDiagnosticos;