// src/front/js/component/Mantenimientos/MantenimientosTable.jsx

import React from "react";
import PropTypes from 'prop-types'; // Import PropTypes
import { Table, Button, Badge, Spinner, Tooltip, OverlayTrigger } from "react-bootstrap";
import {
  FiTrash2,
  FiImage,
  FiCalendar,
  FiUser,
  FiTool, // Keep FiTool or use FiTag for Type
  FiInfo,
  FiPackage, // Icon for Equipment Name
  FiMapPin,  // Icon for Equipment Location
} from "react-icons/fi";

// --- Remove TypeScript import ---
// import { Mantenimiento } from '../../pages/Mantenimientos';

// --- Remove TypeScript interface ---
// interface MantenimientosTableProps { ... }

const MantenimientosTable = ({ // Remove : React.FC<MantenimientosTableProps>
  mantenimientos,
  loading,
  canEdit,
  onShowViewModal,
  onShowImagen,
  onDelete,
  getBadgeColor,
  formatearFechaHora,
}) => {
  if (loading) {
    return (
      <div className="text-center p-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Cargando registros de mantenimiento...</p>
      </div>
    );
  }

  // Empty state is handled in the parent component

  // Helper to render Tooltips (remove type annotation)
  const renderTooltip = (props, text) => ( // Remove : any, : string
    <Tooltip id={`button-tooltip-${text.replace(/\s+/g, '-')}`} {...props}>
      {text}
    </Tooltip>
  );

  return (
    <div className="table-responsive">
      <Table hover className="mantenimientos-table">
        <thead>
          <tr>
            {/* Adjusted columns */}
            <th><FiUser className="me-1" />Técnico</th>
            <th><FiPackage className="me-1" />Equipo</th>
            <th><FiMapPin className="me-1" />Ubicación Equipo</th>
            <th><FiCalendar className="me-1" />Fecha</th>
            <th><FiTool className="me-1" />Tipo</th>
            <th className="text-end">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {/* Remove type annotation from map parameter */}
          {mantenimientos.map((mantenimiento) => (
            // Add defensive check for mantenimiento and mantenimiento.id
            mantenimiento && mantenimiento.id ? (
              <tr
                key={mantenimiento.id}
                onClick={() => onShowViewModal(mantenimiento)} // Row click opens details
                style={{ cursor: "pointer" }}
                title="Ver detalles del mantenimiento" // Tooltip for the row
              >
                {/* Adjusted data cells */}
                <td>
                  {mantenimiento.tecnico || '-'}
                </td>
                <td>
                  {mantenimiento.equipo_nombre || 'N/A'}
                </td>
                <td>
                  {mantenimiento.equipo_ubicacion || 'N/A'}
                </td>
                <td>
                  {/* Show only date by default */}
                  {formatearFechaHora(mantenimiento.fecha).split(" ")[0]}
                </td>
                <td>
                  {/* Use pill for badges */}
                  <Badge bg={getBadgeColor(mantenimiento.tipo_mantenimiento)} pill>
                    {mantenimiento.tipo_mantenimiento}
                  </Badge>
                </td>
                <td className="text-end" onClick={(e) => e.stopPropagation()}> {/* Prevent row click when clicking buttons */}

                  {/* Explicit button to view details */}
                  <OverlayTrigger
                    placement="top"
                    delay={{ show: 250, hide: 400 }}
                    overlay={(props) => renderTooltip(props, "Ver Detalles")}
                  >
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      className="me-2"
                      // Stop propagation here too
                      onClick={(e) => { e.stopPropagation(); onShowViewModal(mantenimiento); }}
                    >
                      <FiInfo />
                    </Button>
                  </OverlayTrigger>

                  {/* Button to view image */}
                  {mantenimiento.tiene_imagen && (
                    <OverlayTrigger
                      placement="top"
                      delay={{ show: 250, hide: 400 }}
                      overlay={(props) => renderTooltip(props, "Ver Imagen")}
                    >
                      <Button
                        variant="outline-info"
                        size="sm"
                        className="me-2"
                        // Stop propagation here too
                        onClick={(e) => { e.stopPropagation(); onShowImagen(mantenimiento.id); }}
                      >
                        <FiImage />
                      </Button>
                    </OverlayTrigger>
                  )}

                  {/* Button to delete */}
                  {canEdit && (
                    <OverlayTrigger
                      placement="top"
                      delay={{ show: 250, hide: 400 }}
                      overlay={(props) => renderTooltip(props, "Eliminar")}
                    >
                      <Button
                        variant="outline-danger"
                        size="sm"
                        // Stop propagation here too
                        onClick={(e) => { e.stopPropagation(); onDelete(mantenimiento.id); }}
                      >
                        <FiTrash2 />
                      </Button>
                    </OverlayTrigger>
                  )}
                </td>
              </tr>
            ) : null // Don't render if mantenimiento or id is missing
          ))}
        </tbody>
      </Table>
    </div>
  );
};

// Add PropTypes for runtime type checking
MantenimientosTable.propTypes = {
  mantenimientos: PropTypes.arrayOf(PropTypes.shape({
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
  })).isRequired,
  loading: PropTypes.bool.isRequired,
  canEdit: PropTypes.bool.isRequired,
  onShowViewModal: PropTypes.func.isRequired,
  onShowImagen: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  getBadgeColor: PropTypes.func.isRequired,
  formatearFechaHora: PropTypes.func.isRequired,
};

export default MantenimientosTable;
