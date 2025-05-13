// src/front/js/component/Mantenimientos/MantenimientoViewModal.jsx

import React, { useMemo } from "react"; // <--- Añadido useMemo
import PropTypes from 'prop-types'; // Import PropTypes
import { Modal, Button, Row, Col, Badge, Alert } from "react-bootstrap";
import {
  FiTool,
  FiMapPin,
  FiCalendar,
  FiInfo,
  FiUser,
  FiImage,
  FiBox, // Icon for Equipo
  FiTag, // Icon for Tipo Equipo
  FiHash, // Icon for ID
  FiFileText, // Icon for Descripción
  FiCheckSquare, // Icon for Tiene Imagen (alternative) or Alerta Resuelta
  FiXSquare, // Icon for No Tiene Imagen (alternative)
} from "react-icons/fi";

// --- Remove TypeScript import ---
// import { Mantenimiento } from '../../pages/Mantenimientos';

// --- Remove TypeScript interface ---
// interface MantenimientoViewModalProps { ... }

const MantenimientoViewModal = ({ // Remove : React.FC<MantenimientoViewModalProps>
  show,
  onHide,
  mantenimiento,
  onShowImagen,
  getBadgeColor,
  formatearFechaHora,
}) => {

  // --- Helper Function to Render Details with Icon (remove type annotations) ---
  const renderDetail = (
    icon, // Icon component (e.g., FiCalendar) or null
    label,
    value // Can be string, number, boolean, or a React element
  ) => {
    let displayValue = <span className="text-muted fst-italic">N/A</span>; // Default for null/undefined/empty

    if (value !== null && value !== undefined && value !== '') {
      if (typeof value === 'boolean') {
        // Render boolean as a Badge
        displayValue = (
          <Badge pill bg={value ? 'success' : 'secondary'} className="d-flex align-items-center" style={{ width: 'fit-content' }}> {/* Added style */}
            {value ? <FiCheckSquare className="me-1"/> : <FiXSquare className="me-1"/>}
            {value ? 'Sí' : 'No'}
          </Badge>
        );
      } else {
        // Render string, number, or existing React element directly
        displayValue = value;
      }
    }

    return (
      // Use Row/Col for better alignment and responsiveness
      <Row key={label} className="mb-2 align-items-center"> {/* Added key */}
        <Col xs={12} md={4} className="fw-bold text-muted d-flex align-items-center">
          {/* Conditionally render icon using React.createElement */}
          {icon && React.createElement(icon, { className: "me-2 flex-shrink-0", size: 18 })}
          <span>{label}:</span>
        </Col>
        <Col xs={12} md={8}>
          {/* Wrap long text like descriptions */}
          {typeof value === 'string' && value.length > 100 ? (
             <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{displayValue}</div>
          ) : (
             displayValue
          )}
        </Col>
      </Row>
    );
  };
  // --- End Helper Function ---

  // Don't render the modal at all if there's no maintenance data
  if (!mantenimiento) {
    return null;
  }

  // Pre-render the badge for Tipo Mantenimiento so it's passed correctly as a ReactNode
  const tipoMantenimientoBadge = mantenimiento.tipo_mantenimiento ? (
    <Badge bg={getBadgeColor(mantenimiento.tipo_mantenimiento)}>
      {mantenimiento.tipo_mantenimiento}
    </Badge>
  ) : null; // Handle case where tipo might be missing

  // --- Parsear alertas_resueltas_info ---
  const alertasResueltas = useMemo(() => {
    if (mantenimiento && mantenimiento.alertas_resueltas_info) {
      try {
        return JSON.parse(mantenimiento.alertas_resueltas_info);
      } catch (e) {
        console.error("Error parseando alertas_resueltas_info:", e);
        return [];
      }
    }
    return [];
  }, [mantenimiento]);

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title className="d-flex align-items-center">
          <FiInfo className="me-2" /> Detalles del Mantenimiento
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* No need for ternary if we return null above when !mantenimiento */}
        <>
          {renderDetail(FiHash, 'ID Mantenimiento', mantenimiento.id)}
          {renderDetail(FiCalendar, 'Fecha Registro', formatearFechaHora(mantenimiento.fecha))}
          <hr className="my-3" /> {/* Separator */}
          <h5 className="mb-3"><FiBox className="me-2"/>Información del Equipo</h5>
          {renderDetail(null, 'Nombre Equipo', mantenimiento.equipo_nombre)}
          {renderDetail(FiMapPin, 'Ubicación', mantenimiento.equipo_ubicacion)}
          {renderDetail(FiTag, 'Tipo Equipo', mantenimiento.equipo_tipo)}
          {/* Optional: Show IDs if useful for debugging */}
          {/* {renderDetail(FiHash, 'Aire ID', mantenimiento.aire_id)} */}
          {/* {renderDetail(FiHash, 'Otro Equipo ID', mantenimiento.otro_equipo_id)} */}
          <hr className="my-3" /> {/* Separator */}
          <h5 className="mb-3"><FiTool className="me-2"/>Detalles del Trabajo</h5>
          {/* Pass the pre-rendered badge here */}
          {renderDetail(null, 'Tipo Mantenimiento', tipoMantenimientoBadge)}
          {renderDetail(FiUser, 'Técnico', mantenimiento.tecnico)}
          {renderDetail(FiFileText, 'Descripción', mantenimiento.descripcion)}
          {renderDetail(FiImage, 'Tiene Imagen Adjunta', mantenimiento.tiene_imagen)}

          {/* Button to view image if available */}
          {mantenimiento.tiene_imagen && (
            <Row className="mt-3">
              <Col md={{ span: 8, offset: 4 }}> {/* Align with value column */}
                <Button
                  variant="outline-primary" // Changed variant
                  size="sm"
                  onClick={() => onShowImagen(mantenimiento.id)} // Pass ID directly
                  className="d-flex align-items-center"
                >
                  <FiImage className="me-2" /> Ver Imagen Adjunta
                </Button>
              </Col>
            </Row>
          )}

          {/* --- Sección de Alertas Resueltas --- */}
          {alertasResueltas && alertasResueltas.length > 0 && (
            <>
              <hr className="my-3" />
              <h5 className="mb-3"><FiCheckSquare className="me-2 text-success"/>Alertas de Operatividad Resueltas por este Mantenimiento</h5>
              {alertasResueltas.map((alerta, index) => (
                <div key={index} className="mb-2 p-2 border rounded bg-light-subtle">
                  <p className="mb-1">
                    <Badge bg="danger" pill className="me-2">{alerta.componente || 'Componente Desconocido'}</Badge>
                    <strong>Diagnóstico:</strong> {alerta.diagnostico || alerta.mensaje || 'No especificado'}
                  </p>
                  {alerta.notas_diagnostico && (
                    <p className="mb-0 ms-4">
                      <small className="text-muted">Notas del diagnóstico original: {alerta.notas_diagnostico}</small>
                    </p>
                  )}
                   {alerta.fecha_lectura_original && (
                    <p className="mb-0 ms-4">
                      <small className="text-muted">Falla detectada el: {formatearFechaHora(alerta.fecha_lectura_original)}</small>
                    </p>
                  )}
                </div>
              ))}
            </>
          )}
        </>
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
MantenimientoViewModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  mantenimiento: PropTypes.shape({ // Can be null, so not isRequired at top level
    id: PropTypes.number.isRequired,
    aire_id: PropTypes.number,
    otro_equipo_id: PropTypes.number,
    fecha: PropTypes.string.isRequired,
    tipo_mantenimiento: PropTypes.string.isRequired,
    descripcion: PropTypes.string.isRequired,
    tecnico: PropTypes.string.isRequired,
    tiene_imagen: PropTypes.bool.isRequired,
    equipo_nombre: PropTypes.string,
    equipo_ubicacion: PropTypes.string,
    equipo_tipo: PropTypes.string,
    alertas_resueltas_info: PropTypes.string, // Es un string JSON
  }),
  // Modified to accept string or number (ID) or undefined
  onShowImagen: PropTypes.func.isRequired,
  getBadgeColor: PropTypes.func.isRequired,
  formatearFechaHora: PropTypes.func.isRequired,
};

export default MantenimientoViewModal;
