import React from "react";
import PropTypes from 'prop-types'; // Import PropTypes
import { Modal, Button, Image, Spinner, Alert } from "react-bootstrap"; // Added Spinner, Alert


const MantenimientoImagenModal = ({ 
  show,
  onHide,
  imagenUrl = null,
  loading = false,
}) => {
  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Imagen de Mantenimiento</Modal.Title>
      </Modal.Header>
      <Modal.Body className="text-center">
        {loading ? (
          // Display spinner while loading
          <div className="p-4">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2 mb-0">Cargando imagen...</p>
          </div>
        ) : imagenUrl && imagenUrl !== 'error' ? (
          // Display image if URL is valid
          // Limit max height to prevent overly large images
          <Image src={imagenUrl} fluid style={{ maxHeight: "80vh" }} alt="Imagen de mantenimiento" />
        ) : (
          // Display error message if imagenUrl is null or 'error'
          <Alert variant="warning" className="mb-0">
            {imagenUrl === 'error'
              ? "No se pudo cargar la imagen o no existe."
              : "No hay imagen disponible para este mantenimiento."}
          </Alert>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

// Add PropTypes for runtime type checking
MantenimientoImagenModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  imagenUrl: PropTypes.string, // Can be null or 'error' string, default handles this
  loading: PropTypes.bool,     // Added loading prop type, default handles this
};

export default MantenimientoImagenModal;
