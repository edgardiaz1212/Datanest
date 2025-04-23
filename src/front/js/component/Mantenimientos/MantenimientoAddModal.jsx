// src/front/js/component/Mantenimientos/MantenimientoAddModal.jsx

import React, { useState, useEffect } from 'react'; // Añadir useState, useEffect
import PropTypes from 'prop-types'; // Import PropTypes
import { Modal, Button, Form, Spinner, Alert, Row, Col } from 'react-bootstrap'; // Añadir Row, Col

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
}) => {

  // Local state to manage which equipment type is selected
  const [selectedEquipoType, setSelectedEquipoType] = useState('aire'); // 'aire' | 'otro' -> 'aire'

  // Effect to reset the selected type when the modal opens
  // and select 'aire' if available, otherwise 'otro'.
  useEffect(() => {
    if (show) {
      const defaultType = aires.length > 0 ? 'aire' : (otrosEquipos.length > 0 ? 'otro' : 'aire');
      setSelectedEquipoType(defaultType);
      // Ensure formData reflects the initial type (parent's handleAdd does this)
    }
  }, [show, aires, otrosEquipos]); // Dependencies

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

  return (
    // Prevent closing during submit
    <Modal show={show} onHide={handleHide} centered backdrop="static" keyboard={!loadingSubmit}>
      <Modal.Header closeButton={!loadingSubmit}> {/* Disable close button during submit */}
        <Modal.Title>Registrar Nuevo Mantenimiento</Modal.Title>
      </Modal.Header>
      <Form onSubmit={onSubmit}>
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
};

export default MantenimientoAddModal;
