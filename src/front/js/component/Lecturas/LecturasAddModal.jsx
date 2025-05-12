import React from 'react';
import PropTypes from 'prop-types'; // Import PropTypes
import { Modal, Form, Button, Row, Col, Spinner } from 'react-bootstrap';

const LecturasAddModal = ({
  show,
  onHide,
  aires,
  formData,
  onChange,
  onSubmit,
  // Set default value directly here using JavaScript default parameters
  isSubmitting = false
}) => {
  // Encuentra el aire seleccionado para determinar si se debe mostrar el campo de humedad
  const selectedAire = Array.isArray(aires) && formData.aire_id
    ? aires.find(a => a.id.toString() === formData.aire_id)
    : null;

  // Mostrar el campo de humedad si no hay un aire seleccionado (estado inicial)
  // o si el aire seleccionado no es de tipo 'Confort'.
  const mostrarCampoHumedad = !selectedAire || (selectedAire && selectedAire.tipo !== 'Confort');


  return (
    // Prevent closing during submit
    <Modal show={show} onHide={onHide} backdrop="static" keyboard={!isSubmitting}>
      {/* Disable close button during submit */}
      <Modal.Header closeButton={!isSubmitting}>
        <Modal.Title>Agregar Lectura</Modal.Title>
      </Modal.Header>
      <Form onSubmit={onSubmit}>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Aire Acondicionado <span className="text-danger">*</span></Form.Label>
            <Form.Select
              name="aire_id"
              value={formData.aire_id || ''} // Handle potential undefined/null
              onChange={onChange}
              required
              disabled={isSubmitting || !aires || aires.length === 0} // Disable if submitting or no aires
              aria-label="Seleccione un aire acondicionado"
            >
              <option value="">Seleccione un aire acondicionado</option>
              {/* Add defensive check for aires array */}
              {Array.isArray(aires) && aires.map(aire => (
                // Add defensive check for aire object and id
                aire && typeof aire.id !== 'undefined' ? ( // Check for id existence specifically
                  <option key={aire.id} value={aire.id.toString()}> {/* Ensure value is string */}
                    {aire.nombre || 'Nombre no disponible'} - {aire.ubicacion || 'Ubicación no disponible'}
                  </option>
                ) : null
              ))}
            </Form.Select>
             {/* Optional: Message if no ACs */}
             {(!aires || aires.length === 0) && <Form.Text muted>No hay aires disponibles para seleccionar.</Form.Text>}
          </Form.Group>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Fecha <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="date"
                  name="fecha"
                  value={formData.fecha || ''} // Handle potential undefined/null
                  onChange={onChange}
                  required
                  disabled={isSubmitting}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Hora <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="time"
                  name="hora"
                  value={formData.hora || ''} // Handle potential undefined/null
                  onChange={onChange}
                  required
                  disabled={isSubmitting}
                  // Consider adding step="1" if seconds might be needed by backend
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Temperatura (°C) <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="number"
                  step="0.1" // Allow decimals
                  name="temperatura"
                  value={formData.temperatura ?? ''} // Handle potential undefined/null, default to empty string
                  onChange={onChange}
                  required
                  placeholder="Ej: 22.5"
                  disabled={isSubmitting}
                />
              </Form.Group>
            </Col>
            {mostrarCampoHumedad && (
              <Col md={6}>
                <Form.Group className="mb-3">
                  {/* El asterisco de requerido se muestra condicionalmente */}
                  <Form.Label>Humedad (%) {selectedAire && selectedAire.tipo !== 'Confort' && <span className="text-danger">*</span>}</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.1" // Allow decimals
                    name="humedad"
                    value={formData.humedad ?? ''}
                    onChange={onChange}
                    // HTML5 validation, la validación principal está en handleSubmit en Lecturas.jsx
                    required={selectedAire && selectedAire.tipo !== 'Confort'} 
                    placeholder="Ej: 55.0"
                    disabled={isSubmitting}
                  />
                </Form.Group>
              </Col>
            )}
          </Row>
        </Modal.Body>
        <Modal.Footer>
          {/* Disable Cancel button during submit */}
          <Button variant="secondary" onClick={onHide} disabled={isSubmitting}>
            Cancelar
          </Button>
          {/* Disable Submit button during submit */}
          <Button variant="primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-1" />
                Guardando...
              </>
            ) : (
              'Guardar'
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

LecturasAddModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  aires: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    nombre: PropTypes.string.isRequired,
    ubicacion: PropTypes.string,
    tipo: PropTypes.string, // Se espera que los aires tengan una propiedad 'tipo'
  })).isRequired,
  formData: PropTypes.shape({
    aire_id: PropTypes.string,
    fecha: PropTypes.string,
    hora: PropTypes.string,
    temperatura: PropTypes.oneOfType([PropTypes.string, PropTypes.number]), // Allow string or number during input
    humedad: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),     // Allow string or number during input
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool,
};

export default LecturasAddModal;
