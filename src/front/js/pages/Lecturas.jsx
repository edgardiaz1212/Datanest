import React, { useState, useEffect, useCallback, useContext } from 'react';
import { Card, Button, Alert, Spinner } from 'react-bootstrap';
import { FiPlus } from 'react-icons/fi';
import { Context } from '../store/appContext';
import LecturasFilter from '../component/Lecturas/LecturasFilter.jsx';
import LecturasTable from '../component/Lecturas/LecturasTable.jsx';
import LecturasAddModal from '../component/Lecturas/LecturasAddModal.jsx';


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
  } = actions;

  // Local state
  const [filtroAire, setFiltroAire] = useState(null); 
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); 
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
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  // Open Add Modal
  const handleAdd = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toTimeString().slice(0, 5); // HH:MM

    setFormData({
      aire_id: aires.length > 0 ? aires[0].id.toString() : '', // Default to first AC
      fecha: today,
      hora: now,
      temperatura: '',
      humedad: ''
    });
    if (clearLecturasError) clearLecturasError(); // Clear previous errors
    setShowModal(true);
  }, [aires, clearLecturasError]); // Dependency on aires

  // Delete Reading (calls Flux action)
  const handleDelete = useCallback(async (id) => { // Remove type number
    if (window.confirm('¿Está seguro de eliminar esta lectura?')) {
      if (clearLecturasError) clearLecturasError();
      // Optionally set a local loading state for the specific row if needed
      const success = await deleteLectura(id);
      if (!success) {
        // Error is handled globally
        alert("Error al eliminar"); 
      }
    }
  }, [deleteLectura, clearLecturasError]);

  const handleSubmit = useCallback(async (e) => { 
    e.preventDefault();
    if (clearLecturasError) clearLecturasError();
    setIsSubmitting(true);

    let success = false;
    try {
      // Basic Validations
      if (!formData.aire_id || !formData.fecha || !formData.hora || formData.temperatura === '' || formData.humedad === '') {
        throw new Error("Todos los campos (Aire, Fecha, Hora, Temp, Hum) son requeridos.");
      }
      const temperaturaNum = parseFloat(formData.temperatura);
      const humedadNum = parseFloat(formData.humedad);
      if (isNaN(temperaturaNum) || isNaN(humedadNum)) {
        throw new Error("Temperatura y Humedad deben ser números válidos.");
      }
      const aireIdNum = parseInt(formData.aire_id, 10);
      if (isNaN(aireIdNum)) {
           throw new Error("Selección de Aire inválida.");
      }

      // Combine date and time for backend (adjust format if backend expects differently)
      // Ensure time has seconds if backend expects HH:MM:SS
      const timeWithSeconds = formData.hora.includes(':') ? `${formData.hora}:00` : '00:00:00';
      const fechaHoraString = `${formData.fecha}T${timeWithSeconds}`; 

      const payload = {
        // aire_id is part of the URL for the action
        fecha_hora: fechaHoraString, // Combined date and time string
        temperatura: temperaturaNum,
        humedad: humedadNum
      };

      // Call Flux action
      success = await addLectura(aireIdNum, payload);

      if (success) {
        setShowModal(false); // Close modal on success
      }
    } catch (err) {
      console.error('Error submitting lectura:', err);
      // Set error in Flux store
      actions.setLecturasError(err.message || 'Error al guardar la lectura.'); // Need to create this action
      setError(err.message || 'Error al guardar la lectura.');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, addLectura, clearLecturasError]); 

  // --- Formatting Helpers (remain the same, remove types) ---
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
      // Use 24-hour format explicitly
      return fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false });
    } catch (e) {
      console.error("Error formatting time:", fechaStr, e);
      return 'Error hora';
    }
  }, []);

  // --- Render Logic ---
  return (
    <div className="container mt-4"> {/* Added container */}
      {/* Header and Filters */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <h1>Lecturas de Sensores</h1>
        <div className="d-flex align-items-center flex-wrap gap-2">
          {/* Filter Component */}
          <LecturasFilter
            aires={aires} // Pass aires from store
            filtroAire={filtroAire}
            onFilterChange={handleFiltrarPorAire}
          />
          {/* Add button only if user can add */}
          {canAdd && (
            <Button variant="primary" onClick={handleAdd}>
              <FiPlus className="me-2" /> Agregar Lectura
            </Button>
          )}
        </div>
      </div>

      {/* Global Error Alert */}
      {error && (
        <Alert variant="danger" dismissible onClose={clearLecturasError}>
          {error}
        </Alert>
      )}

      {/* Card with Table */}
      <Card className="dashboard-card">
        <Card.Body>
          {/* Table Component */}
          <LecturasTable
            lecturas={lecturas} // Pass lecturas from store
            loading={loading} // Pass global loading state
            canDelete={canDelete}
            onDelete={handleDelete}
            onAdd={handleAdd} // Pass add handler for empty state button
            formatearFecha={formatearFecha}
            formatearHora={formatearHora}
            umbrales={umbrales} // Pass umbrales from store
            filtroAire={filtroAire} // Pass current filter for empty state message
            aires={aires} // Pass aires for empty state message
          />
        </Card.Body>
      </Card>

      {/* Add Modal Component */}
      <LecturasAddModal
        show={showModal}
        onHide={() => !isSubmitting && setShowModal(false)} // Prevent close during submit
        aires={aires} // Pass aires from store
        formData={formData}
        onChange={handleChange}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting} // Pass submitting state
        // Pass error and clearError if the modal should display/clear them
        // error={error}
        // clearError={clearLecturasError}
      />
    </div>
  );
};

// Add PropTypes
Lecturas.propTypes = {
  // No props needed for the main page component itself
};

export default Lecturas;
