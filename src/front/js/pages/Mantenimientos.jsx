// src/front/js/pages/Mantenimientos.jsx

import React, { useState, useEffect, useRef, useCallback, useContext } from "react";
import PropTypes from 'prop-types'; // Import PropTypes
import {
  Card,
  Button,
  Spinner,
  Alert,
  Pagination, // <--- Añadido
  Form, Row, Col // <--- Añadido
} from "react-bootstrap";
import {
  FiPlus,
  FiTool,
} from "react-icons/fi";
// Import your Flux context
import { Context } from '../store/appContext';

// Import the child components (assuming they are converted/created as .jsx)
import MantenimientoFilter from "../component/Mantenimientos/MantenimientoFilter.jsx";
import MantenimientosTable from "../component/Mantenimientos/MantenimientosTable.jsx";
import MantenimientoAddModal from "../component/Mantenimientos/MantenimientoAddModal.jsx";
import MantenimientoViewModal from "../component/Mantenimientos/MantenimientoViewModal.jsx";
import MantenimientoImagenModal from "../component/Mantenimientos/MantenimientoImagenModal.jsx";

const PER_PAGE_OPTIONS = [10, 20, 50, 100];

// Remove TypeScript interfaces

const Mantenimientos = () => { // Remove : React.FC
  // Get store and actions from Flux context
  const { store, actions } = useContext(Context);
  const {
    trackerUser: user,
    mantenimientos,
    aires, // Needed for filter and add modal
    otrosEquiposList: otrosEquipos, // Use the correct store key, rename for consistency
    mantenimientosLoading: loading,
    mantenimientosError: error,
    mantenimientosPaginationInfo, // <--- Añadido
  } = store;
  const {
    fetchMantenimientos,
    addMantenimiento,
    deleteMantenimiento,
    fetchMantenimientoImagenBase64, // Action to get image
    clearMantenimientosError,
    // fetchAires and fetchOtrosEquipos are called within fetchMantenimientos
  } = actions;

  // Local state
  const [filtroAire, setFiltroAire] = useState(null); // number | null -> null
  const [currentPage, setCurrentPage] = useState(1); // <--- Añadido
  const [itemsPerPage, setItemsPerPage] = useState(20); // <--- Añadido

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImagenModal, setShowImagenModal] = useState(false);
  const [imagenSeleccionada, setImagenSeleccionada] = useState(null); // string | null | 'error' -> null | 'error'
  const [loadingImagen, setLoadingImagen] = useState(false); // Added loading state for image
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedMantenimiento, setSelectedMantenimiento] = useState(null); // Mantenimiento | null -> null

  // Form state
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [formData, setFormData] = useState({ // Remove MantenimientoFormData type
    aire_id: "",
    otro_equipo_id: "",
    tipo_mantenimiento: "",
    descripcion: "",
    tecnico: "",
  });
  const fileInputRef = useRef(null); // Remove type assertion

  const canEdit = user?.rol === "admin" || user?.rol === "supervisor";

  // --- Cargar datos iniciales via Flux action ---
  useEffect(() => {
    // Pass the current filter to the action
    const filters = {};
    if (filtroAire) {
      filters.aire_id = filtroAire;
    }
    fetchMantenimientos(filters, currentPage, itemsPerPage);

    // Cleanup function
    return () => {
      if (clearMantenimientosError) clearMantenimientosError();
    };
  }, [filtroAire, currentPage, itemsPerPage, fetchMantenimientos, clearMantenimientosError]); // Depend on filter and actions

  // --- Handlers ---

  const handleFiltrarPorAire = useCallback((aireId) => { // Remove type number | null
    setFiltroAire(aireId);
    // The useEffect will trigger fetchMantenimientos with the new filter
    setCurrentPage(1); // Reset a la primera página al cambiar filtro
  }, []);

  const handleChange = useCallback((e) => { // Remove type annotation
    const { name, value } = e.target;
    setFormData(prev => {
      const newState = { ...prev, [name]: value };
      // If changing one ID, clear the other
      if (name === 'aire_id' && value !== "") {
        newState.otro_equipo_id = "";
      } else if (name === 'otro_equipo_id' && value !== "") {
        newState.aire_id = "";
      }
      return newState;
    });
  }, []);

  const handleAdd = useCallback(() => {
    // Reset form, default to first aire if available
    setFormData({
      aire_id: aires.length > 0 ? aires[0].id.toString() : "",
      otro_equipo_id: "",
      tipo_mantenimiento: "",
      descripcion: "",
      tecnico: "",
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Reset file input
    }
    if (clearMantenimientosError) clearMantenimientosError(); // Clear errors
    setLoadingSubmit(false);
    setShowAddModal(true);
    setShowViewModal(false);
  }, [aires, clearMantenimientosError]); // Dependency on aires

  const handleDelete = useCallback(async (id) => { // Remove type number
    if (window.confirm("¿Está seguro de eliminar este registro de mantenimiento?")) {
      if (clearMantenimientosError) clearMantenimientosError();
      setLoadingSubmit(true); // Indicate activity
      const success = await deleteMantenimiento(id);
      setLoadingSubmit(false);
      if (!success) {
        // Error is handled globally
        // alert("Error al eliminar"); // Optional local feedback
      }
      // UI updates optimistically via Flux
    }
  }, [deleteMantenimiento, clearMantenimientosError]);

  const handleShowImagen = useCallback(async (id) => { // Remove type number
    if (clearMantenimientosError) clearMantenimientosError();
    setImagenSeleccionada(null);
    setLoadingImagen(true); // Start loading image
    setShowImagenModal(true);
    try {
      // Use Flux action to fetch image
      const base64Image = await fetchMantenimientoImagenBase64(id);
      setImagenSeleccionada(base64Image || "error"); // Set image URL or 'error'
    } catch (error) {
      // Action should handle console logging
      setImagenSeleccionada("error");
    } finally {
      setLoadingImagen(false); // Stop loading image
    }
  }, [fetchMantenimientoImagenBase64, clearMantenimientosError]);

  const handleSubmit = useCallback(async (e) => { // Remove type React.FormEvent
    e.preventDefault();
    if (clearMantenimientosError) clearMantenimientosError();
    setLoadingSubmit(true);

    // --- Validation ---
    if (!formData.tipo_mantenimiento || !formData.descripcion || !formData.tecnico) {
      actions.setMantenimientosError("Tipo, Descripción y Técnico son requeridos."); // Use action if exists
      // Or set local error: setError("Tipo, Descripción y Técnico son requeridos.");
      setLoadingSubmit(false);
      return;
    }
    const aireSeleccionado = formData.aire_id && formData.aire_id !== "";
    const otroSeleccionado = formData.otro_equipo_id && formData.otro_equipo_id !== "";
    if ((aireSeleccionado && otroSeleccionado) || (!aireSeleccionado && !otroSeleccionado)) {
      actions.setMantenimientosError("Debe seleccionar exactamente un equipo (Aire u Otro)."); // Use action if exists
      // Or set local error: setError("Debe seleccionar exactamente un equipo (Aire u Otro).");
      setLoadingSubmit(false);
      return;
    }
    // --- End Validation ---

    // Create FormData object for multipart request
    const formDataObj = new FormData();
    if (aireSeleccionado) {
      formDataObj.append("aire_id", formData.aire_id);
    } else if (otroSeleccionado) {
      formDataObj.append("otro_equipo_id", formData.otro_equipo_id);
    }
    formDataObj.append("tipo_mantenimiento", formData.tipo_mantenimiento);
    formDataObj.append("descripcion", formData.descripcion);
    formDataObj.append("tecnico", formData.tecnico);
    if (fileInputRef.current?.files?.[0]) {
      formDataObj.append("imagen_file", fileInputRef.current.files[0]);
    }

    // Call Flux action
    const success = await addMantenimiento(formDataObj);

    setLoadingSubmit(false); // Reset local submit loading state

    if (success) {
      setShowAddModal(false); // Close modal on success
      // Re-fetch mantenimientos with current filters and pagination
      const currentFilters = {};
      if (filtroAire) {
        currentFilters.aire_id = filtroAire;
      }
      fetchMantenimientos(currentFilters, currentPage, itemsPerPage);
    }
    // Error display handled globally by 'mantenimientosError' state

  }, [
    formData,
    addMantenimiento,
    clearMantenimientosError,
    fetchMantenimientos, // Added fetchMantenimientos to dependencies
    filtroAire,          // Added filtroAire
    currentPage,         // Added currentPage
    itemsPerPage         // Added itemsPerPage
  ]); // Dependencies

  // --- Formatting Helpers (remain the same, remove types) ---
  const formatearFechaHora = useCallback((fechaStr) => {
    if (!fechaStr) return 'N/A';
    try {
      const fecha = new Date(fechaStr);
      if (isNaN(fecha.getTime())) return 'Fecha inválida';
      return fecha.toLocaleString('es-ES', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: false
      });
    } catch (e) { return 'Error fecha'; }
  }, []);

  const getBadgeColor = useCallback((tipo) => {
    switch (tipo?.toLowerCase()) {
      case "preventivo": return "success";
      case "correctivo": return "danger";
      case "predictivo": return "info";
      case "instalación": return "primary";
      case "limpieza": return "warning";
      default: return "secondary";
    }
  }, []);

  const handleShowViewModal = useCallback((mantenimiento) => { // Remove type Mantenimiento
    setSelectedMantenimiento(mantenimiento);
    setShowViewModal(true);
    setShowAddModal(false);
  }, []);

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= mantenimientosPaginationInfo.total_pages) {
        setCurrentPage(pageNumber);
    }
  };

  const handleItemsPerPageChange = (e) => {
      setItemsPerPage(parseInt(e.target.value));
      setCurrentPage(1); // Reset a la primera página
  };

  // Lógica para mostrar números de página (simplificada)
  const pageNumbers = [];
  if (mantenimientosPaginationInfo && mantenimientosPaginationInfo.total_pages > 0) {
      const totalPages = mantenimientosPaginationInfo.total_pages;
      const currentPageNum = mantenimientosPaginationInfo.current_page;
      let startPage = Math.max(1, currentPageNum - 2);
      let endPage = Math.min(totalPages, currentPageNum + 2);

      if (currentPageNum <= 3) {
          endPage = Math.min(5, totalPages);
      }
      if (currentPageNum > totalPages - 3) {
          startPage = Math.max(1, totalPages - 4);
      }
      for (let i = startPage; i <= endPage; i++) {
          pageNumbers.push(i);
      }
  }
  // --- Renderizado ---
  return (
    <div className="container mt-4"> {/* Added container */}
      {/* Encabezado */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <h1>Mantenimientos</h1>
        <div className="d-flex align-items-center flex-wrap gap-2">
          {/* Filter Component */}
          <MantenimientoFilter
            aires={aires} // Pass aires from store
            filtroAire={filtroAire}
            onFilterChange={handleFiltrarPorAire}
          />
          <Form.Group as={Col} md="auto" controlId="itemsPerPageSelectMantenimientos" className="mb-0">
            <div className="d-flex align-items-center">
                <Form.Label className="me-2 mb-0">Por Pág:</Form.Label>
                <Form.Select size="sm" value={itemsPerPage} onChange={handleItemsPerPageChange} style={{ width: 'auto' }}>
                    {PER_PAGE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </Form.Select>
            </div>
          </Form.Group>
          {canEdit && (
            <Button variant="primary" onClick={handleAdd}>
              <FiPlus className="me-2" /> Registrar Mantenimiento
            </Button>
          )}
        </div>
      </div>

      {/* Alerta de Error General */}
      {error && !loadingSubmit && ( // Show global error if not submitting
        <Alert variant="danger" dismissible onClose={clearMantenimientosError}>
          {error}
        </Alert>
      )}

      {/* Card Principal */}
      <Card className="dashboard-card">
        <Card.Body>
          {/* Tabla de Mantenimientos */}
          <MantenimientosTable
            mantenimientos={mantenimientos} // Pass mantenimientos from store
            loading={loading} // Pass global loading state
            canEdit={canEdit}
            onShowViewModal={handleShowViewModal}
            onShowImagen={handleShowImagen}
            onDelete={handleDelete}
            getBadgeColor={getBadgeColor}
            formatearFechaHora={formatearFechaHora}
          />
          {/* Mensaje y botón para estado vacío */}
          {!loading && mantenimientos.length === 0 && (
            <div className="text-center p-5">
              <FiTool size={50} className="text-muted mb-3" />
              <h4>
                No hay registros de mantenimiento{" "}
                {filtroAire
                  ? `para ${aires.find((a) => a.id === filtroAire)?.nombre || "equipo seleccionado"}`
                  : ""}
              </h4>
              {canEdit && (
                <Button variant="primary" className="mt-3" onClick={handleAdd}>
                  <FiPlus className="me-2" /> Registrar primer mantenimiento
                </Button>
              )}
            </div>
          )}
        </Card.Body>
        {mantenimientosPaginationInfo && mantenimientosPaginationInfo.total_items > 0 && mantenimientosPaginationInfo.total_pages > 1 && (
            <Card.Footer className="d-flex justify-content-between align-items-center">
                <span className="text-muted">
                    Página {mantenimientosPaginationInfo.current_page} de {mantenimientosPaginationInfo.total_pages} (Total: {mantenimientosPaginationInfo.total_items} mantenimientos)
                </span>
                <Pagination className="mb-0">
                    <Pagination.First 
                        onClick={() => handlePageChange(1)} 
                        disabled={mantenimientosPaginationInfo.current_page === 1} 
                    />
                    <Pagination.Prev 
                        onClick={() => handlePageChange(mantenimientosPaginationInfo.current_page - 1)} 
                        disabled={!mantenimientosPaginationInfo.has_prev} 
                    />
                    
                    {pageNumbers[0] > 1 && <Pagination.Ellipsis disabled />}
                    {pageNumbers.map(num => (
                        <Pagination.Item 
                            key={num} 
                            active={num === mantenimientosPaginationInfo.current_page} 
                            onClick={() => handlePageChange(num)}
                        >
                            {num}
                        </Pagination.Item>
                    ))}
                    {pageNumbers[pageNumbers.length - 1] < mantenimientosPaginationInfo.total_pages && <Pagination.Ellipsis disabled />}

                    <Pagination.Next 
                        onClick={() => handlePageChange(mantenimientosPaginationInfo.current_page + 1)} 
                        disabled={!mantenimientosPaginationInfo.has_next} 
                    />
                    <Pagination.Last 
                        onClick={() => handlePageChange(mantenimientosPaginationInfo.total_pages)} 
                        disabled={mantenimientosPaginationInfo.current_page === mantenimientosPaginationInfo.total_pages} 
                    />
                </Pagination>
            </Card.Footer>
        )}
      </Card>

      {/* Modales */}
      <MantenimientoAddModal
        show={showAddModal}
        onHide={() => !loadingSubmit && setShowAddModal(false)} // Prevent closing during submit
        aires={aires} // Pass aires from store
        otrosEquipos={otrosEquipos} // Pass otrosEquipos from store
        formData={formData}
        fileInputRef={fileInputRef} // Pass the ref
        onChange={handleChange}
        onSubmit={handleSubmit}
        loadingSubmit={loadingSubmit} // Pass submitting state
        error={error} // Pass global error to display inside modal if needed
        clearError={clearMantenimientosError} // Allow modal to clear global error
      />

      <MantenimientoImagenModal
        show={showImagenModal}
        onHide={() => setShowImagenModal(false)}
        imagenUrl={imagenSeleccionada} // Pass base64 URL or 'error'
        loading={loadingImagen} // Pass image loading state
      />

      <MantenimientoViewModal
        show={showViewModal}
        onHide={() => setShowViewModal(false)}
        mantenimiento={selectedMantenimiento}
        onShowImagen={(mantenimientoId) => {
          // Ensure ID is a number before calling
          if (typeof mantenimientoId === 'number') {
            handleShowImagen(mantenimientoId);
          }
        }}
        getBadgeColor={getBadgeColor}
        formatearFechaHora={formatearFechaHora}
      />
    </div>
  );
};

// Add PropTypes
Mantenimientos.propTypes = {
  // No props needed for the main page component itself
};


export default Mantenimientos;
