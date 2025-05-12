import React, { useState, useEffect, useMemo } from 'react';
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
  const [selectedTipoAire, setSelectedTipoAire] = useState('');

  // Obtener los tipos únicos de la lista de aires
  const tiposDeAireUnicos = useMemo(() => {
    if (!Array.isArray(aires)) return [];
    const tipos = aires.map(a => a.tipo || 'Sin Tipo').filter(Boolean);
    return ['Todos', ...new Set(tipos)]; // Añadir "Todos" como opción
  }, [aires]);

  // Filtrar aires basados en el tipo seleccionado
  const airesFiltradosPorTipo = useMemo(() => {
    if (!Array.isArray(aires)) return [];
    if (!selectedTipoAire || selectedTipoAire === 'Todos') {
      return aires;
    }
    return aires.filter(a => (a.tipo || 'Sin Tipo') === selectedTipoAire);
  }, [aires, selectedTipoAire]);

  // Efecto para resetear el aire_id si el tipo cambia y el aire seleccionado ya no es válido
  useEffect(() => {
    if (formData.aire_id && selectedTipoAire && selectedTipoAire !== 'Todos') {
      const aireActual = aires.find(a => a.id.toString() === formData.aire_id);
      if (aireActual && (aireActual.tipo || 'Sin Tipo') !== selectedTipoAire) {
        onChange({ target: { name: 'aire_id', value: '' } }); // Resetea la selección de aire
      }
    }
  }, [selectedTipoAire, formData.aire_id, aires, onChange]);

  // Encuentra el aire seleccionado para determinar si se debe mostrar el campo de humedad
  const selectedAireObj = Array.isArray(airesFiltradosPorTipo) && formData.aire_id
    ? airesFiltradosPorTipo.find(a => a.id.toString() === formData.aire_id)
    : null;
  // Mostrar el campo de humedad si no hay un aire seleccionado (estado inicial)
  // o si el aire seleccionado no es de tipo 'Confort'.
  const mostrarCampoHumedad = !selectedAireObj || (selectedAireObj && selectedAireObj.tipo !== 'Confort');


  return (
    // Prevent closing during submit
    <Modal show={show} onHide={onHide} backdrop="static" keyboard={!isSubmitting}>
      {/* Disable close button during submit */}
      <Modal.Header closeButton={!isSubmitting}>
        <Modal.Title>Agregar Lectura</Modal.Title>
      </Modal.Header>
      <Form onSubmit={onSubmit}>
        <Modal.Body>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Tipo de Aire</Form.Label>
                <Form.Select
                  value={selectedTipoAire}
                  onChange={(e) => setSelectedTipoAire(e.target.value)}
                  disabled={isSubmitting || !tiposDeAireUnicos || tiposDeAireUnicos.length <= 1}
                  aria-label="Seleccione un tipo de aire"
                >
                  {tiposDeAireUnicos.map(tipo => (
                    <option key={tipo} value={tipo}>{tipo}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Aire Acondicionado <span className="text-danger">*</span></Form.Label>
                <Form.Select
                  name="aire_id"
                  value={formData.aire_id || ''}
                  onChange={onChange}
                  required
                  disabled={isSubmitting || !airesFiltradosPorTipo || airesFiltradosPorTipo.length === 0}
                  aria-label="Seleccione un aire acondicionado"
                >
                  <option value="">Seleccione un aire</option>
                  {airesFiltradosPorTipo.map(aire => (
                    aire && typeof aire.id !== 'undefined' ? (
                      <option key={aire.id} value={aire.id.toString()}>
                        {aire.nombre || 'N/A'} ({aire.ubicacion || 'N/A'})
                      </option>
                    ) : null
                  ))}
                </Form.Select>
                {(!airesFiltradosPorTipo || airesFiltradosPorTipo.length === 0) && (
                  <Form.Text muted>
                    {selectedTipoAire && selectedTipoAire !== 'Todos'
                      ? `No hay aires de tipo "${selectedTipoAire}".`
                      : "No hay aires disponibles."}
                  </Form.Text>
                )}
              </Form.Group>
            </Col>
          </Row>

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
                  <Form.Label>Humedad (%) {selectedAireObj && selectedAireObj.tipo !== 'Confort' && <span className="text-danger">*</span>}</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.1" // Allow decimals
                    name="humedad"
                    value={formData.humedad ?? ''}
                    onChange={onChange}
                    required={selectedAireObj && selectedAireObj.tipo !== 'Confort'}
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
