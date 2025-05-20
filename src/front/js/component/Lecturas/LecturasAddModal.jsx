import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Modal, Form, Button, Row, Col, Spinner } from 'react-bootstrap';

const LecturasAddModal = ({
  show,
  onHide,
  dispositivosMedibles, // Cambiado de aires
  formData,
  onChange,
  onSubmit,
  isSubmitting = false
}) => {
  const [selectedTipoDispositivo, setSelectedTipoDispositivo] = useState(''); // Cambiado de selectedTipoAire

  // Obtener los tipos únicos de la lista de dispositivosMedibles
  const tiposDeDispositivoUnicos = useMemo(() => {
    if (!Array.isArray(dispositivosMedibles)) return [];
    // Usar 'tipoOriginal' que viene de AireAcondicionado.tipo o OtroEquipo.tipo
    const tipos = dispositivosMedibles.map(d => d.tipoOriginal || (d.esAire ? 'Sin Tipo Aire' : 'Sin Tipo OtroEquipo')).filter(Boolean);
    return ['Todos', ...new Set(tipos)]; // Añadir "Todos" como opción
  }, [dispositivosMedibles]);

  // Filtrar dispositivos basados en el tipo seleccionado
  const dispositivosFiltradosPorTipo = useMemo(() => {
    if (!Array.isArray(dispositivosMedibles)) return [];
    if (!selectedTipoDispositivo || selectedTipoDispositivo === 'Todos') {
      return dispositivosMedibles;
    }
    return dispositivosMedibles.filter(d => (d.tipoOriginal || (d.esAire ? 'Sin Tipo Aire' : 'Sin Tipo OtroEquipo')) === selectedTipoDispositivo);
  }, [dispositivosMedibles, selectedTipoDispositivo]);

  // Efecto para resetear el dispositivo_key si el tipo cambia y el dispositivo seleccionado ya no es válido
  useEffect(() => {
    if (formData.dispositivo_key && selectedTipoDispositivo && selectedTipoDispositivo !== 'Todos') {
      const dispositivoActual = dispositivosMedibles.find(d => d.key === formData.dispositivo_key);
      if (dispositivoActual && (dispositivoActual.tipoOriginal || (dispositivoActual.esAire ? 'Sin Tipo Aire' : 'Sin Tipo OtroEquipo')) !== selectedTipoDispositivo) {
        onChange({ target: { name: 'dispositivo_key', value: '' } }); // Resetea la selección de dispositivo
      }
    }
  }, [selectedTipoDispositivo, formData.dispositivo_key, dispositivosMedibles, onChange]);

  // Encuentra el dispositivo seleccionado para determinar si se debe mostrar el campo de humedad
  const selectedDispositivoObj = Array.isArray(dispositivosFiltradosPorTipo) && formData.dispositivo_key
    ? dispositivosFiltradosPorTipo.find(d => d.key === formData.dispositivo_key)
    : null;

  // Mostrar el campo de humedad si:
  // 1. No hay dispositivo seleccionado (estado inicial).
  // 2. El dispositivo seleccionado es un Aire y NO es de tipo 'Confort'.
  // 3. El dispositivo seleccionado NO es un Aire (es decir, es un Termohigrómetro, que siempre muestra humedad).
  const mostrarCampoHumedad = !selectedDispositivoObj ||
                              (selectedDispositivoObj?.esAire && selectedDispositivoObj?.tipoOriginal !== 'Confort') ||
                              (selectedDispositivoObj && !selectedDispositivoObj.esAire);

  // Humedad es requerida si:
  // 1. El dispositivo seleccionado NO es un Aire (Termohigrómetro).
  // 2. El dispositivo seleccionado es un Aire Y NO es de tipo 'Confort'.
  const humedadRequerida = selectedDispositivoObj && (
                            (!selectedDispositivoObj.esAire) ||
                            (selectedDispositivoObj.esAire && selectedDispositivoObj.tipoOriginal !== 'Confort')
                       );

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
                <Form.Label>Tipo de Dispositivo</Form.Label>
                <Form.Select
                  value={selectedTipoDispositivo}
                  onChange={(e) => setSelectedTipoDispositivo(e.target.value)}
                  disabled={isSubmitting || !tiposDeDispositivoUnicos || tiposDeDispositivoUnicos.length <= 1}
                  aria-label="Seleccione un tipo de dispositivo"
                >
                  {tiposDeDispositivoUnicos.map(tipo => (
                    <option key={tipo} value={tipo}>{tipo}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Dispositivo <span className="text-danger">*</span></Form.Label>
                <Form.Select
                  name="dispositivo_key" // Cambiado de aire_id
                  value={formData.dispositivo_key || ''}
                  onChange={onChange}
                  required
                  disabled={isSubmitting || !dispositivosFiltradosPorTipo || dispositivosFiltradosPorTipo.length === 0}
                  aria-label="Seleccione un dispositivo"
                >
                  <option value="">Seleccione un dispositivo</option>
                  {dispositivosFiltradosPorTipo.map(disp => (
                    disp && typeof disp.idOriginal !== 'undefined' ? ( // Usar idOriginal y key
                      <option key={disp.key} value={disp.key}>
                        {disp.nombre || 'N/A'} ({disp.ubicacion || 'N/A'}) {disp.esAire ? `(Aire ${disp.tipoOriginal || ''})` : `(${disp.tipoOriginal || 'Otro'})`}
                      </option>
                    ) : null
                  ))}
                </Form.Select>
                {(!dispositivosFiltradosPorTipo || dispositivosFiltradosPorTipo.length === 0) && (
                  <Form.Text muted>
                    {selectedTipoDispositivo && selectedTipoDispositivo !== 'Todos'
                      ? `No hay dispositivos de tipo "${selectedTipoDispositivo}".`
                      : "No hay dispositivos disponibles."}
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
                  <Form.Label>Humedad (%) {humedadRequerida && <span className="text-danger">*</span>}</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.1" // Allow decimals
                    name="humedad"
                    value={formData.humedad ?? ''}
                    onChange={onChange}
                    required={humedadRequerida}
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
  dispositivosMedibles: PropTypes.arrayOf(PropTypes.shape({
    idOriginal: PropTypes.number.isRequired,
    key: PropTypes.string.isRequired,
    nombre: PropTypes.string.isRequired,
    ubicacion: PropTypes.string,
    tipoOriginal: PropTypes.string,
    esAire: PropTypes.bool.isRequired,
  })).isRequired,
  formData: PropTypes.shape({
    dispositivo_key: PropTypes.string, // Cambiado de aire_id
    fecha: PropTypes.string,
    hora: PropTypes.string,
    temperatura: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    humedad: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool,
};

export default LecturasAddModal;
