import React, { useState, useEffect, useRef, useCallback, useContext, useMemo } from "react";
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
    diagnosticoComponentes, // Para pasar al modal
    detailedAlertsList, // <--- AÑADIR PARA PASAR AL MODAL
  } = store;
  const {
    fetchMantenimientos,
    addMantenimiento,
    deleteMantenimiento,
    fetchMantenimientoImagenBase64, // Action to get image
    clearMantenimientosError,
    fetchDiagnosticoComponentes, // Para pasar al modal
    fetchDetailedAlerts, // <--- AÑADIR PARA CARGAR ALERTAS
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
  // Añadir estados para los campos de diagnóstico que se actualizarán si un componente sigue no operativo
  // Estos se llenarán desde el modal si es necesario.
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
        fetchDiagnosticoComponentes({ activo: true }); // Cargar diagnósticos para el modal
        fetchDetailedAlerts(); // Cargar alertas para el modal

    // Cleanup function
    return () => {
      if (clearMantenimientosError) clearMantenimientosError();
    };
  }, [filtroAire, currentPage, itemsPerPage, fetchMantenimientos, fetchDiagnosticoComponentes, fetchDetailedAlerts, clearMantenimientosError]);

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
      // Inicializar campos de diagnóstico para el modal (se llenarán si es necesario)
      evaporadora_diagnostico_id: null,
      evaporadora_diagnostico_notas: '',
      evaporadora_fecha_diagnostico: new Date().toISOString().split('T')[0],
      evaporadora_hora_diagnostico: new Date().toTimeString().slice(0,5),
      // ... y para condensadora
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Reset file input
    }
    if (clearMantenimientosError) clearMantenimientosError(); // Clear errors
    setLoadingSubmit(false);
    setShowAddModal(true);
    setShowViewModal(false);
  }, [aires, clearMantenimientosError]); // Dependency on aires

  const handleDelete = useCallback(async (mantenimientoId, mantenimientoAireId) => { // Se añade mantenimientoAireId
    if (window.confirm("¿Está seguro de eliminar este registro de mantenimiento?")) {
      if (clearMantenimientosError) clearMantenimientosError();
      setLoadingSubmit(true); // Indicate activity
      const success = await deleteMantenimiento(mantenimientoId);
      setLoadingSubmit(false);

      if (success) {
        // Después de una eliminación exitosa, recargar la lista de mantenimientos.
        const currentFilters = {};
        if (filtroAire) {
          currentFilters.aire_id = filtroAire; // Mantener el filtro actual si existe
        }

        // Si el mantenimiento eliminado estaba asociado a un aire,
        // actualiza los detalles de ese aire y sus diagnósticos.
        if (mantenimientoAireId) {
            actions.fetchAireDetails(mantenimientoAireId);
            actions.fetchDiagnosticRecordsByAire(mantenimientoAireId);
        }
        actions.fetchDetailedAlerts(); // Actualiza la lista de alertas activas
      
        // Ajustar la página si se eliminó el último elemento de la página actual (y no es la primera página)
        let pageToFetch = currentPage;
        if (mantenimientos.length === 1 && currentPage > 1) {
          pageToFetch = currentPage - 1;
          // setCurrentPage(pageToFetch); // Opcional: actualizar el estado local de la página inmediatamente
                                      // pero fetchMantenimientos ya lo hará al actualizar paginationInfo
        }
        fetchMantenimientos(currentFilters, pageToFetch, itemsPerPage);
      }
      // El error global se maneja a través de 'mantenimientosError' en el store.
    }
  }, [
    deleteMantenimiento, clearMantenimientosError, filtroAire, 
    currentPage, itemsPerPage, fetchMantenimientos, mantenimientos.length,
    actions // Añadir actions como dependencia para fetchAireDetails, etc.
  ]);


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

  // Modificar handleSubmit para recibir las alertas seleccionadas del modal
  const handleSubmit = useCallback(async (e, datosParaEnviar) => { // datosParaEnviar es el objeto del modal
    e.preventDefault();
    if (clearMantenimientosError) clearMantenimientosError();
    setLoadingSubmit(true);

    // --- Validation ---
    if (!formData.tipo_mantenimiento || !formData.descripcion || !formData.tecnico) {
      actions.setMantenimientosError("Tipo, Descripción y Técnico son requeridos."); // Use action if exists
      setLoadingSubmit(false);
      return;
    }
    // Usar datosParaEnviar.mantenimientoData para la validación del equipo
    const aireSeleccionado = datosParaEnviar.mantenimientoData.aire_id && datosParaEnviar.mantenimientoData.aire_id !== "";
    const otroSeleccionado = datosParaEnviar.mantenimientoData.otro_equipo_id && datosParaEnviar.mantenimientoData.otro_equipo_id !== "";

    if ((aireSeleccionado && otroSeleccionado) || (!aireSeleccionado && !otroSeleccionado)) {
      actions.setMantenimientosError("Debe seleccionar exactamente un equipo (Aire u Otro)."); // Use action if exists
      setLoadingSubmit(false);
      return;
    }
    // --- End Validation ---

    // Create FormData object for multipart request
    const formDataObj = new FormData();
    // Añadir datos del mantenimiento
    if (aireSeleccionado) {
      formDataObj.append("aire_id", datosParaEnviar.mantenimientoData.aire_id);
    } else if (otroSeleccionado) {
      formDataObj.append("otro_equipo_id", datosParaEnviar.mantenimientoData.otro_equipo_id);
    }
    formDataObj.append("tipo_mantenimiento", datosParaEnviar.mantenimientoData.tipo_mantenimiento);
    formDataObj.append("descripcion", datosParaEnviar.mantenimientoData.descripcion);
    formDataObj.append("tecnico", datosParaEnviar.mantenimientoData.tecnico);
    if (fileInputRef.current?.files?.[0]) {
      formDataObj.append("imagen_file", fileInputRef.current.files[0]);
    }
    
    // Añadir datos de resolución de alertas y nuevos diagnósticos
    // El backend esperará un JSON stringificado para 'resolucion_alertas_data'
    // que contenga la estructura de alertasResolucion del modal.
    if (datosParaEnviar.resolucionAlertasData) {
        formDataObj.append("resolucion_alertas_data", JSON.stringify(datosParaEnviar.resolucionAlertasData));
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
    filtroAire,
    currentPage,
    itemsPerPage
    // store.detailedAlertsList ya no es necesario aquí directamente, se pasa al modal
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
        // --- PASAR ALERTAS AL MODAL ---
        detailedAlertsList={detailedAlertsList}
        diagnosticosDisponibles={diagnosticoComponentes}
        fetchDiagnosticos={fetchDiagnosticoComponentes}
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
