// src/front/js/pages/Umbrales.jsx

import React, { useState, useEffect, useContext } from 'react';
import { Card, Table, Button, Modal, Form, Row, Col, Spinner, Alert, Badge, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FiPlus, FiEdit, FiTrash2, FiSlash, FiBell, FiGlobe, FiWind, FiAlertTriangle, FiThermometer, FiDroplet } from 'react-icons/fi';
// Import your Flux context
import { Context } from '../store/appContext';

// Remove TypeScript interfaces

const Umbrales = () => { // Remove : React.FC
  // Get store and actions from Flux context
  const { store, actions } = useContext(Context);
  // Destructure relevant state and actions
  const {
    trackerUser: currentUser, // Logged-in user info
    aires,                   // List of air conditioners from store
    umbrales,                // List of thresholds from store
    umbralesLoading: loading,// Use specific loading state
    umbralesError: error,    // Use specific error state
  } = store;
  const {
    fetchUmbrales,
    addUmbral,
    updateUmbral,
    deleteUmbral,
    clearUmbralesError // Action to clear the error
  } = actions;

  // Local state for modals and forms (remains mostly the same)
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ // Remove Partial<Umbral>
    nombre: '',
    es_global: true,
    aire_id: undefined, // Use undefined or null for non-selection
    temp_min: 18,
    temp_max: 25,
    hum_min: 30,
    hum_max: 70,
    notificar_activo: true
  });
  const [formMode, setFormMode] = useState('add'); // 'add' | 'edit'
  const [selectedUmbralId, setSelectedUmbralId] = useState(null); // number | null
  const [isSubmitting, setIsSubmitting] = useState(false); // For modal submit buttons

  // Verificar si el usuario puede agregar/editar umbrales
  const canEdit = currentUser?.rol === 'admin' || currentUser?.rol === 'supervisor';

  // Cargar umbrales (and aires via fetchUmbrales action)
  useEffect(() => {
    fetchUmbrales(); // Call the Flux action on mount

    // Cleanup function to clear error when component unmounts
    return () => {
      if (clearUmbralesError) clearUmbralesError();
    };
  }, [fetchUmbrales, clearUmbralesError]); // Add dependencies

  // Manejar cambios en el formulario (remove type annotations)
  const handleChange = (e) => {
    const target = e.target;
    let value = target.value;
    const name = target.name;

    // Handle checkboxes
    if (target.type === 'checkbox') {
      value = target.checked;
    }
    // Handle selects that should be boolean
    else if (name === 'es_global') {
      value = value === 'true'; // Convert "true"/"false" string to boolean
    }
    // Handle selects that should be number (or undefined)
    else if (name === 'aire_id') {
      value = value ? parseInt(value, 10) : undefined; // Convert to number or keep undefined
    }
    // Handle numeric inputs
    else if (['temp_min', 'temp_max', 'hum_min', 'hum_max'].includes(name)) {
      // Allow empty string for intermediate input, otherwise parse float
      value = value === '' ? '' : parseFloat(value);
    }

    // Update form data
    setFormData(prevData => {
      const newData = { ...prevData, [name]: value };

      // If es_global changes to true, clear aire_id
      if (name === 'es_global' && value === true) {
        newData.aire_id = undefined;
      }
      // If es_global changes to false, maybe select first aire if none selected
      else if (name === 'es_global' && value === false && !newData.aire_id && aires.length > 0) {
        // Optionally pre-select the first AC, or leave it for the user
        // newData.aire_id = aires[0].id;
      }
      return newData;
    });
  };


  // Validar formulario (remains mostly the same)
  const validateForm = () => {
    const errors = [];

    if (!formData.nombre?.trim()) { // Add trim check
      errors.push('El nombre es requerido');
    }

    if (formData.es_global === false && !formData.aire_id) { // Check boolean directly
      errors.push('Debe seleccionar un aire acondicionado para un umbral específico');
    }

    // Check if numeric fields are valid numbers (not empty string or NaN)
    const tempMin = parseFloat(formData.temp_min);
    const tempMax = parseFloat(formData.temp_max);
    const humMin = parseFloat(formData.hum_min);
    const humMax = parseFloat(formData.hum_max);

    if (isNaN(tempMin) || isNaN(tempMax) || isNaN(humMin) || isNaN(humMax)) {
      errors.push('Todos los valores de umbrales deben ser números válidos');
    } else {
      if (tempMin >= tempMax) {
        errors.push('La temperatura mínima debe ser menor que la máxima');
      }
      if (humMin >= humMax) {
        errors.push('La humedad mínima debe ser menor que la máxima');
      }
    }

    return errors;
  };

  // Abrir modal para agregar (clear error)
  const handleAdd = () => {
    setFormData({
      nombre: '',
      es_global: true,
      aire_id: undefined,
      temp_min: 18,
      temp_max: 25,
      hum_min: 30,
      hum_max: 70,
      notificar_activo: true
    });
    setFormMode('add');
    setSelectedUmbralId(null);
    if (clearUmbralesError) clearUmbralesError(); // Clear previous errors
    setShowModal(true);
  };

  // Abrir modal para editar (clear error)
  const handleEdit = (umbral) => { // Remove type Umbral
    setFormData({
      nombre: umbral.nombre,
      es_global: umbral.es_global,
      aire_id: umbral.aire_id, // Keep original aire_id
      temp_min: umbral.temp_min,
      temp_max: umbral.temp_max,
      hum_min: umbral.hum_min,
      hum_max: umbral.hum_max,
      notificar_activo: umbral.notificar_activo
    });
    setFormMode('edit');
    setSelectedUmbralId(umbral.id);
    if (clearUmbralesError) clearUmbralesError(); // Clear previous errors
    setShowModal(true);
  };

  // Eliminar umbral (calls Flux action)
  const handleDelete = async (id) => { // Remove type number
    if (window.confirm('¿Está seguro de eliminar esta configuración de umbrales?')) {
      setIsSubmitting(true); // Optionally show loading state during delete
      const success = await deleteUmbral(id);
      setIsSubmitting(false);
      if (!success) {
        // Error is handled globally by the store's error state
        // alert("Error al eliminar el umbral."); // Or show a toast
      }
      // UI updates optimistically or via store change
    }
  };

  // Enviar formulario (calls Flux action)
  const handleSubmit = async (e) => { // Remove type React.FormEvent
    e.preventDefault();
    if (clearUmbralesError) clearUmbralesError(); // Clear previous errors

    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      // Set error state in Flux or show local alert
      actions.setUmbralesError(validationErrors.join('. ')); // Need to create this action if preferred
      // Alternatively: setError(validationErrors.join('. ')); // If using local error state for form
      return;
    }

    setIsSubmitting(true);
    let success = false;

    // Prepare data, ensuring numbers are numbers
    const payload = {
      ...formData,
      temp_min: parseFloat(formData.temp_min),
      temp_max: parseFloat(formData.temp_max),
      hum_min: parseFloat(formData.hum_min),
      hum_max: parseFloat(formData.hum_max),
      // Ensure aire_id is null if global, or number if specific
      aire_id: formData.es_global ? null : formData.aire_id
    };


    if (formMode === 'add') {
      success = await addUmbral(payload);
    } else if (selectedUmbralId) {
      // Note: Backend PUT doesn't update es_global or aire_id
      success = await updateUmbral(selectedUmbralId, payload);
    }

    setIsSubmitting(false);
    if (success) {
      setShowModal(false); // Close modal on success
    }
    // Error display is handled by the global 'umbralesError' state
  };

  // --- Render Logic (mostly the same, just use store values) ---
  return (
    <div className="container mt-4"> {/* Add container */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Umbrales de Temperatura y Humedad</h1>
        {canEdit && (
          <Button variant="primary" onClick={handleAdd}>
            <FiPlus className="me-2" /> Agregar Configuración
          </Button>
        )}
      </div>

      {/* Global Error Display for this section */}
      {error && (
        <Alert variant="danger" dismissible onClose={clearUmbralesError}>
          {error}
        </Alert>
      )}

      {/* Info Card (same as before) */}
      <Row>
        <Col md={12} className="mb-4">
          <Card className="dashboard-card">
            <Card.Header>
              <h5 className="mb-0">Información</h5>
            </Card.Header>
            <Card.Body>
              <Alert variant="info" className="mb-0"> {/* Added mb-0 */}
                <Alert.Heading>¿Qué son los umbrales?</Alert.Heading>
                <p>
                  Los umbrales son configuraciones que definen los rangos aceptables de temperatura y humedad
                  para los aires acondicionados. Cuando una lectura está fuera de estos rangos, el sistema puede
                  generar alertas para notificar al personal.
                </p>
                <hr />
                <p className="mb-0">
                  Se pueden definir umbrales globales (que aplican a todos los aires) o específicos (para un aire en particular).
                  Los umbrales específicos tienen prioridad sobre los globales si ambos aplican.
                </p>
              </Alert>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Umbrales List Card */}
      <Card className="dashboard-card">
        <Card.Header>
          <h5 className="mb-0">Configuraciones de Umbrales</h5>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="text-center p-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3">Cargando configuraciones de umbrales...</p>
            </div>
          ) : umbrales.length === 0 ? (
            <div className="text-center p-5">
              <FiAlertTriangle size={50} className="text-muted mb-3" />
              <h4>No hay configuraciones de umbrales</h4>
              {canEdit && (
                <Button variant="primary" className="mt-3" onClick={handleAdd}>
                  <FiPlus className="me-2" /> Agregar configuración
                </Button>
              )}
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover>
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Tipo</th>
                    <th>Aire / Ubicación</th>
                    <th>Temperatura (°C)</th>
                    <th>Humedad (%)</th>
                    <th>Notificaciones</th>
                    {canEdit && <th className="text-end">Acciones</th>}
                  </tr>
                </thead>
                <tbody>
                  {umbrales.map(umbral => (
                    <tr key={umbral.id}>
                      <td>{umbral.nombre}</td>
                      <td>
                        {umbral.es_global ? (
                          <Badge bg="primary">
                            <FiGlobe className="me-1" /> Global
                          </Badge>
                        ) : (
                          <Badge bg="info">
                            <FiWind className="me-1" /> Específico
                          </Badge>
                        )}
                      </td>
                      <td>
                        {umbral.es_global ? (
                          <span className="text-muted">Todos los aires</span>
                        ) : (
                          <span>
                            {/* Use aire_nombre from store (populated by fetchUmbrales) */}
                            {umbral.aire_nombre || `Aire ID: ${umbral.aire_id}`} <br />
                            <small className="text-muted">{umbral.ubicacion || 'Ubicación desconocida'}</small>
                          </span>
                        )}
                      </td>
                      <td>
                        <OverlayTrigger
                          placement="top"
                          overlay={<Tooltip>Rango aceptable de temperatura</Tooltip>}
                        >
                          <Badge bg="light" text="dark">
                            <FiThermometer className="me-1 text-danger" />
                            {umbral.temp_min} - {umbral.temp_max} °C
                          </Badge>
                        </OverlayTrigger>
                      </td>
                      <td>
                        <OverlayTrigger
                          placement="top"
                          overlay={<Tooltip>Rango aceptable de humedad</Tooltip>}
                        >
                          <Badge bg="light" text="dark">
                            <FiDroplet className="me-1 text-primary" />
                            {umbral.hum_min} - {umbral.hum_max} %
                          </Badge>
                        </OverlayTrigger>
                      </td>
                      <td>
                        {umbral.notificar_activo ? (
                          <Badge bg="success">
                            <FiBell className="me-1" /> Activas
                          </Badge>
                        ) : (
                          <Badge bg="secondary">
                            <FiSlash className="me-1" /> Inactivas
                          </Badge>
                        )}
                      </td>
                      {canEdit && (
                        <td className="text-end">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="me-2"
                            onClick={() => handleEdit(umbral)}
                            title="Editar umbral"
                          >
                            <FiEdit />
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDelete(umbral.id)}
                            disabled={isSubmitting} // Disable while any submission is happening
                            title="Eliminar umbral"
                          >
                            <FiTrash2 />
                          </Button>
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

      {/* Modal de formulario (remove type annotations, adjust value handling) */}
      <Modal show={showModal} onHide={() => !isSubmitting && setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {formMode === 'add' ? 'Agregar Configuración' : 'Editar Configuración'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {/* Display form-specific errors or global umbralesError */}
            {error && <Alert variant="danger">{error}</Alert>}

            <Form.Group className="mb-3">
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                type="text"
                name="nombre"
                value={formData.nombre || ''}
                onChange={handleChange}
                required
                placeholder="Ej: Sala de Servidores - Estándar"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Tipo de Configuración</Form.Label>
              <Form.Select
                name="es_global"
                value={formData.es_global ? 'true' : 'false'} // Use string for select value
                onChange={handleChange}
                disabled={formMode === 'edit'} // Cannot change type when editing
              >
                <option value="true">Global (todos los aires)</option>
                <option value="false">Específico (un aire)</option>
              </Form.Select>
            </Form.Group>

            {/* Conditional Aire Select */}
            {!formData.es_global && (
              <Form.Group className="mb-3">
                <Form.Label>Aire Acondicionado</Form.Label>
                <Form.Select
                  name="aire_id"
                  value={formData.aire_id || ''} // Use empty string for no selection
                  onChange={handleChange}
                  required={!formData.es_global}
                  disabled={formMode === 'edit'} // Cannot change target aire when editing
                >
                  <option value="">Seleccione un aire acondicionado</option>
                  {/* Use 'aires' from store */}
                  {aires.map(aire => (
                    <option key={aire.id} value={aire.id}>
                      {aire.nombre} - {aire.ubicacion}
                    </option>
                  ))}
                </Form.Select>
                {aires.length === 0 && <Form.Text muted>Cargando lista de aires...</Form.Text>}
              </Form.Group>
            )}

            <hr />

            <h6 className="mb-3">Umbrales de Temperatura</h6>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Mínima (°C)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.1" // Or "any" for more flexibility
                    name="temp_min"
                    value={formData.temp_min ?? ''} // Handle potential null/undefined
                    onChange={handleChange}
                    required
                    placeholder="Ej: 18.0"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Máxima (°C)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.1"
                    name="temp_max"
                    value={formData.temp_max ?? ''}
                    onChange={handleChange}
                    required
                    placeholder="Ej: 25.5"
                  />
                </Form.Group>
              </Col>
            </Row>

            <h6 className="mb-3">Umbrales de Humedad</h6>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Mínima (%)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.1"
                    name="hum_min"
                    value={formData.hum_min ?? ''}
                    onChange={handleChange}
                    required
                    placeholder="Ej: 30.0"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Máxima (%)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.1"
                    name="hum_max"
                    value={formData.hum_max ?? ''}
                    onChange={handleChange}
                    required
                    placeholder="Ej: 70.0"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Activar notificaciones para esta configuración"
                name="notificar_activo"
                checked={formData.notificar_activo ?? false} // Handle potential null/undefined
                onChange={handleChange} // Use the generic handler
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? <><Spinner size="sm" className="me-2" />Guardando...</> : 'Guardar Cambios'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default Umbrales;
