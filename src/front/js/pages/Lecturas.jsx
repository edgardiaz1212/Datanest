import React, { useState, useEffect, useCallback, useContext } from 'react';
import { Card, Button, Alert, Spinner, Pagination, Form, Row, Col } from 'react-bootstrap'; // Added Pagination, Form, Row, Col
import { FiPlus, FiFilter } from 'react-icons/fi'; // Added FiFilter
import { Context } from '../store/appContext';
import LecturasFilter from '../component/Lecturas/LecturasFilter.jsx';
import LecturasTable from '../component/Lecturas/LecturasTable.jsx';
import LecturasAddModal from '../component/Lecturas/LecturasAddModal.jsx';
import LecturasExcelUploadModal from '../component/Lecturas/LecturasExcelUploadModal.jsx'; // <--- NUEVO IMPORT


const PER_PAGE_OPTIONS = [10, 20, 50, 100];

const Lecturas = () => {
  const { store, actions } = useContext(Context);
  const {
    trackerUser: user,
    lecturas,
    aires,
    umbrales,
    lecturasLoading: loading,
    lecturasError: error,
    lecturasPaginationInfo, // <--- NUEVO ESTADO DEL STORE
  } = store;
  const {
    fetchLecturas,
    addLectura,
    deleteLectura,
    clearLecturasError,
    // Asumimos que setLecturasError es una acción disponible si se usa en handleSubmit
    // setLecturasError 
  } = actions;

  // Local state
  const [filtroAire, setFiltroAire] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1); // <--- NUEVO ESTADO
  const [itemsPerPage, setItemsPerPage] = useState(20); // <--- NUEVO ESTADO
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showExcelModal, setShowExcelModal] = useState(false); // <--- NUEVO ESTADO
  const [formData, setFormData] = useState({
    aire_id: '',
    fecha: '',
    hora: '',
    temperatura: '',
    humedad: ''
  });

  // Check user permissions
  const canDelete = user?.rol === 'admin' || user?.rol === 'supervisor';
  // Assuming anyone logged in can add readings, adjust if needed
  const canAdd = !!user;

  useEffect(() => {
    // Cargar aires si no están en el store (para el filtro)
    if (aires.length === 0) {
        actions.fetchAires();
    }
    // Cargar umbrales si no están en el store (para la tabla)
    if (umbrales.length === 0) {
        actions.fetchUmbrales();
    }
  }, [actions, aires.length, umbrales.length]);

  useEffect(() => {
    const filters = filtroAire ? { aire_id: parseInt(filtroAire) } : {};
    // Solo llama a fetchLecturas si hay un aire seleccionado o si la lógica es para mostrar lecturas globales
    actions.fetchLecturas(filters, currentPage, itemsPerPage);

    // Cleanup function
    return () => {
      if (clearLecturasError) clearLecturasError();
    };
  }, [filtroAire, currentPage, itemsPerPage, fetchLecturas, clearLecturasError]); // Depend on filter and actions

  // --- Handlers ---

  // Filter by aire
  const handleFiltrarPorAire = useCallback((aireId) => {
    setFiltroAire(aireId);
    // useEffect will trigger fetchLecturas with the new filter
  }, []); // No necesita currentPage aquí, el useEffect se encarga

  // Handle form input changes
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newState = { ...prev, [name]: value };
      if (name === 'aire_id') {
        // Asegurarse de que 'aires' es un array y tiene elementos
        const selectedAireObj = Array.isArray(aires) && aires.length > 0
          ? aires.find(a => a.id.toString() === value)
          : null;

        if (selectedAireObj && selectedAireObj.tipo === 'Confort') {
          newState.humedad = ''; // Limpiar humedad si el aire seleccionado es de tipo Confort
        }
      }
      return newState;
    });
  }, [aires]); // <- Añadir 'aires' como dependencia

  // Open Add Modal
  const handleAdd = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toTimeString().slice(0, 5); // HH:MM

    // Determinar el estado inicial de humedad basado en el primer aire (si existe)
    let initialHumedad = '';
    const defaultAire = Array.isArray(aires) && aires.length > 0 ? aires[0] : null;
    // Si el aire por defecto es de tipo 'Confort', la humedad debe estar vacía.
    // El modal se encargará de ocultar el campo si es necesario.
    // Si no hay aires, o el primero no es 'Confort', la humedad puede empezar vacía
    // y el usuario la llenará si es necesario.
    if (defaultAire && defaultAire.tipo === 'Confort') {
        initialHumedad = '';
    }


    setFormData({
      aire_id: defaultAire ? defaultAire.id.toString() : '', // Default to first AC
      fecha: today,
      hora: now,
      temperatura: '',
      humedad: initialHumedad
    });
    if (clearLecturasError) clearLecturasError(); // Clear previous errors
    setShowModal(true);
  }, [aires, clearLecturasError]); // Dependency on aires

  // Delete Reading (calls Flux action)
  const handleDelete = useCallback(async (id) => {
    if (window.confirm('¿Está seguro de eliminar esta lectura?')) {
      if (clearLecturasError) clearLecturasError();
      // Optionally set a local loading state for the specific row if needed
      const success = await deleteLectura(id);
      if (!success && !store.lecturasError) { // Si deleteLectura no maneja el error globalmente
        alert("Error al eliminar la lectura.");
      }
      // Si deleteLectura ya establece store.lecturasError, el Alert global lo mostrará
    }
  }, [deleteLectura, clearLecturasError, store.lecturasError]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (clearLecturasError) clearLecturasError();
    setIsSubmitting(true);

    let success = false;
    const selectedAireObj = Array.isArray(aires) && formData.aire_id
      ? aires.find(a => a.id.toString() === formData.aire_id)
      : null;
    const esTipoConfort = selectedAireObj && selectedAireObj.tipo === 'Confort';

    try {
      // Basic Validations
      if (!formData.aire_id || !formData.fecha || !formData.hora || formData.temperatura === '') {
        throw new Error("Todos los campos (Aire, Fecha, Hora, Temp) son requeridos.");
      }
      // Humedad es requerida solo si el aire NO es de tipo Confort
      if (!esTipoConfort && (formData.humedad === '' || formData.humedad === null || formData.humedad === undefined)) {
        throw new Error("Humedad es requerida para este tipo de aire.");
      }

      // Parsear y validar temperatura explícitamente
      const temperaturaStr = formData.temperatura; // La validación de que no es '' ya se hizo arriba.
      const temperaturaNum = parseFloat(temperaturaStr);

      if (isNaN(temperaturaNum)) { // Esta es la validación crucial
        throw new Error("Temperatura debe ser un número válido. Por favor, ingrese solo dígitos y un punto decimal si es necesario.");
      }
      // Parsear humedad solo si no es tipo Confort y hay un valor
      const humedadNum = !esTipoConfort && (formData.humedad !== '' && formData.humedad !== null && formData.humedad !== undefined)
        ? parseFloat(formData.humedad)
        : null;

      
      // Validar humedadNum solo si se esperaba y se intentó parsear
      if (!esTipoConfort && (formData.humedad !== '' && formData.humedad !== null && formData.humedad !== undefined) && isNaN(humedadNum)) {
        throw new Error("Humedad debe ser un número válido.");
      }

      const aireIdNum = parseInt(formData.aire_id, 10);
      if (isNaN(aireIdNum)) {
        throw new Error("Selección de Aire inválida.");
      }

      const timeWithSeconds = formData.hora.includes(':') ? `${formData.hora}:00` : '00:00:00';
      const fechaHoraString = `${formData.fecha}T${timeWithSeconds}`;

      const payload = {
        fecha_hora: fechaHoraString,
        temperatura: temperaturaNum,
        humedad: esTipoConfort ? null : humedadNum // Enviar null si es Confort, sino el valor parseado
      };
      console.log("Payload a enviar:", JSON.stringify(payload));
      
      
      // Call Flux action
      success = await addLectura(aireIdNum, payload);

      if (success) {
        setShowModal(false); // Close modal on success
        // After successful add, refetch lecturas based on the current filter
        const currentTableFilters = {};
        if (filtroAire) { // filtroAire is the local state of Lecturas.jsx
          currentTableFilters.aire_id = filtroAire;
        }
        actions.fetchLecturas(currentTableFilters, currentPage, itemsPerPage); // <--- AÑADIR currentPage e itemsPerPage
      }
    } catch (err) {
      console.error('Error submitting lectura:', err);
      // Set error in Flux store (asegúrate que actions.setLecturasError exista y funcione)
      if (actions.setLecturasError) {
        actions.setLecturasError(err.message || 'Error al guardar la lectura.');
      } else {
        // Fallback si la acción no existe, aunque el Alert global ya usa store.error
        // Podrías tener un estado de error local para el modal si es preferible
        console.warn("actions.setLecturasError no está definida en el contexto.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, addLectura, clearLecturasError, actions, aires]);

  // --- Formatting Helpers ---
  const formatearFecha = useCallback((fechaStr) => {
    if (!fechaStr) return 'N/A';
    try {
      const fecha = new Date(fechaStr);
      if (isNaN(fecha.getTime())) return 'Fecha inválida';
      return fecha.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch (e) {
      console.error("Error formatting date:", fechaStr, e);
      return 'Error fecha';
    }
  }, []);

  const formatearHora = useCallback((fechaStr) => {
    if (!fechaStr) return 'N/A';
    try {
      const fecha = new Date(fechaStr);
      if (isNaN(fecha.getTime())) return 'Hora inválida';
      return fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false });
    } catch (e) {
      console.error("Error formatting time:", fechaStr, e);
      return 'Error hora';
    }
  }, []);

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= lecturasPaginationInfo.total_pages) {
        setCurrentPage(pageNumber);
    }
  };

  const handleItemsPerPageChange = (e) => {
      setItemsPerPage(parseInt(e.target.value));
      setCurrentPage(1); // Reset a la primera página
  };

  // Lógica para mostrar números de página (simplificada)
  const pageNumbers = [];
  if (lecturasPaginationInfo.total_pages > 0) {
      const totalPages = lecturasPaginationInfo.total_pages;
      const currentPageNum = lecturasPaginationInfo.current_page;
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
  // --- Render Logic ---
  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <h1>Lecturas de Sensores</h1>
        <div className="d-flex align-items-center flex-wrap gap-2">
          <LecturasFilter
            aires={aires}
            filtroAire={filtroAire}
            onFilterChange={handleFiltrarPorAire}
          />
          <Form.Group as={Col} md="auto" controlId="itemsPerPageSelect" className="mb-0">
            <div className="d-flex align-items-center">
                <Form.Label className="me-2 mb-0">Por Pág:</Form.Label>
                <Form.Select size="sm" value={itemsPerPage} onChange={handleItemsPerPageChange} style={{ width: 'auto' }}>
                    {PER_PAGE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </Form.Select>
            </div>
          </Form.Group>
          {canAdd && (<>
            <Button variant="primary" onClick={handleAdd}>
              <FiPlus className="me-2" /> Agregar Lectura
            </Button>
            <Button variant="success" onClick={() => setShowExcelModal(true)} className="ms-2">
                Cargar desde Excel
            </Button>
           </> )}
        </div>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={clearLecturasError}>
          {error}
        </Alert>
      )}

      <Card className="dashboard-card">
        <Card.Body>
          {loading && <div className="text-center"><Spinner animation="border" /> <p>Cargando lecturas...</p></div>}
          {!loading && (
            <LecturasTable
              lecturas={lecturas}
              loading = {loading}
              canDelete={canDelete}
              onDelete={handleDelete}
              onAdd={handleAdd}
              formatearFecha={formatearFecha}
              formatearHora={formatearHora}
              umbrales={umbrales}
              filtroAire={filtroAire}
              aires={aires}
            />
          )}
        </Card.Body>
        {lecturasPaginationInfo && lecturasPaginationInfo.total_items > 0 && lecturasPaginationInfo.total_pages > 1 && (
            <Card.Footer className="d-flex justify-content-between align-items-center">
                <span className="text-muted">
                    Página {lecturasPaginationInfo.current_page} de {lecturasPaginationInfo.total_pages} (Total: {lecturasPaginationInfo.total_items} lecturas)
                </span>
                <Pagination className="mb-0">
                    <Pagination.First 
                        onClick={() => handlePageChange(1)} 
                        disabled={lecturasPaginationInfo.current_page === 1} 
                    />
                    <Pagination.Prev 
                        onClick={() => handlePageChange(lecturasPaginationInfo.current_page - 1)} 
                        disabled={!lecturasPaginationInfo.has_prev} 
                    />
                    
                    {pageNumbers[0] > 1 && <Pagination.Ellipsis disabled />}
                    {pageNumbers.map(num => (
                        <Pagination.Item 
                            key={num} 
                            active={num === lecturasPaginationInfo.current_page} 
                            onClick={() => handlePageChange(num)}
                        >
                            {num}
                        </Pagination.Item>
                    ))}
                    {pageNumbers[pageNumbers.length - 1] < lecturasPaginationInfo.total_pages && <Pagination.Ellipsis disabled />}

                    <Pagination.Next 
                        onClick={() => handlePageChange(lecturasPaginationInfo.current_page + 1)} 
                        disabled={!lecturasPaginationInfo.has_next} 
                    />
                    <Pagination.Last 
                        onClick={() => handlePageChange(lecturasPaginationInfo.total_pages)} 
                        disabled={lecturasPaginationInfo.current_page === lecturasPaginationInfo.total_pages} 
                    />
                </Pagination>
            </Card.Footer>
        )}
      </Card>

      <LecturasAddModal
        show={showModal}
        onHide={() => !isSubmitting && setShowModal(false)}
        aires={aires}
        formData={formData}
        onChange={handleChange}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
      <LecturasExcelUploadModal
        show={showExcelModal}
        onHide={() => setShowExcelModal(false)}
        onUploadComplete={() => actions.fetchLecturas(filtroAire ? { aire_id: parseInt(filtroAire) } : {}, currentPage, itemsPerPage)}
      />
    </div>
  );
};

// Add PropTypes (opcional pero recomendado)
// Lecturas.propTypes = {
// No props needed for the main page component itself
// };

export default Lecturas;
