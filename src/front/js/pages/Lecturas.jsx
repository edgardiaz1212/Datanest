import React, { useState, useEffect, useCallback, useContext } from 'react';
import { Card, Button, Alert, Spinner } from 'react-bootstrap';
import { FiPlus } from 'react-icons/fi';
import { Context } from '../store/appContext';
import LecturasFilter from '../component/Lecturas/LecturasFilter.jsx';
import LecturasTable from '../component/Lecturas/LecturasTable.jsx';
import LecturasAddModal from '../component/Lecturas/LecturasAddModal.jsx';
import LecturasExcelUploadModal from '../component/Lecturas/LecturasExcelUploadModal.jsx'; // <--- NUEVO IMPORT


const Lecturas = () => {
  const { store, actions } = useContext(Context);
  const {
    trackerUser: user,
    lecturas,
    aires,
    umbrales,
    lecturasLoading: loading,
    lecturasError: error,
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
    const filters = {};
    if (filtroAire) {
      filters.aire_id = filtroAire;
    }
    fetchLecturas(filters);

    // Cleanup function
    return () => {
      if (clearLecturasError) clearLecturasError();
    };
  }, [filtroAire, fetchLecturas, clearLecturasError]); // Depend on filter and actions

  // --- Handlers ---

  // Filter by aire
  const handleFiltrarPorAire = useCallback((aireId) => {
    setFiltroAire(aireId);
    // useEffect will trigger fetchLecturas with the new filter
  }, []);

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
        actions.fetchLecturas(currentTableFilters);
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
          {canAdd && (<>
            <Button variant="primary" onClick={handleAdd}>
              <FiPlus className="me-2" /> Agregar Lectura
            </Button>
             {/* <Button variant="success" onClick={() => setShowExcelModal(true)} className="ms-2">
             Cargar desde Excel
           </Button> */}
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
        onUploadComplete={() => actions.fetchLecturas(filtroAire ? { aire_id: filtroAire } : {})}
      />
    </div>
  );
};

// Add PropTypes (opcional pero recomendado)
// Lecturas.propTypes = {
// No props needed for the main page component itself
// };

export default Lecturas;
