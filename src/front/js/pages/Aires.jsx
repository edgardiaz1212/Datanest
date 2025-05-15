import React, { useState, useEffect, useCallback, useContext } from 'react';
import PropTypes from 'prop-types'; // Import PropTypes
import { Card, Button, Alert, Spinner } from 'react-bootstrap'; // Added Spinner
import { FiPlus } from 'react-icons/fi';
import { Context } from '../store/appContext';
import AiresTable from '../component/Aires/AiresTable.jsx';
import AiresAddEditModal from '../component/Aires/AiresAddEditModal.jsx';
import AiresViewModal from '../component/Aires/AiresViewModal.jsx';


const Aires = () => { 

  const { store, actions } = useContext(Context);
  const {
    trackerUser: user, 
    aires: airesList,  
    airesLoading: loading, 
    airesError: error, // Global error for the list
  } = store;
  const {
    fetchAires,
    fetchAireDetails, // Still needed for view/edit modals
    addAire,
    deleteAire,
    clearAiresError,
    // ---> AÑADIR ESTA ACCIÓN:
    fetchDiagnosticoComponentes,
    // <---
  } = actions;


  const [showEditModal, setShowEditModal] = useState(false); // Modal for Add/Edit
  const [modalTitle, setModalTitle] = useState('');
  const [formData, setFormData] = useState({}); // Form data for Add/Edit modal
  const [formMode, setFormMode] = useState('add'); // 'add' or 'edit'
  const [loadingEditDetails, setLoadingEditDetails] = useState(false); // Loading state for fetching details for edit
  const [editError, setEditError] = useState(null); // Error specific to the Add/Edit modal

  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedAireDetails, setSelectedAireDetails] = useState(null); 
  const [loadingDetails, setLoadingDetails] = useState(false); 
  const [viewError, setViewError] = useState(null); 

  const [isSubmitting, setIsSubmitting] = useState(false); 

  // Determine user permissions
  const canManage = user?.rol === 'admin' || user?.rol === 'supervisor';

  // --- Helper para formatear fechas (remains the same, remove types) ---
  const formatDate = useCallback((dateString, forInput = false) => {
    if (!dateString) return '';
    try {
      let date = new Date(dateString);
      if (isNaN(date.getTime())) {
        if (!dateString.includes('GMT') && dateString.includes('-')) {
          const dateWithTime = new Date(dateString + 'T00:00:00');
          if (!isNaN(dateWithTime.getTime())) {
            date = dateWithTime;
          } else {
            console.warn("Fecha inválida recibida (fallback también falló):", dateString);
            return forInput ? '' : 'Fecha inválida';
          }
        } else {
          console.warn("Fecha inválida recibida (formato desconocido?):", dateString);
          return forInput ? '' : 'Fecha inválida';
        }
      }
      if (forInput) {
        const year = date.getUTCFullYear();
        const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
        const day = date.getUTCDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
      } else {
        return date.toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' });
      }
    } catch (e) {
      console.error("Error formatting date:", dateString, e);
      return forInput ? '' : 'Error fecha';
    }
  }, []);

  // --- Fetch initial list via Flux action ---
  useEffect(() => {
    fetchAires();
    // Cleanup function
    return () => {
      if (clearAiresError) clearAiresError();
    };
  }, [fetchAires, clearAiresError]); 

  // --- Handlers ---

  // Handle form input changes (remove types)
  const handleChange = useCallback((e) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === 'checkbox';
    const checked = isCheckbox ? e.target.checked : undefined;

    setFormData(prevData => ({
      ...prevData,
      [name]: isCheckbox
              ? checked
              : type === 'number'
              ? (value === '' ? null : parseFloat(value)) // Convert number input or null
              : value
    }));
  }, []);

  // Open Add Modal
  const handleAdd = useCallback(() => {
    setFormData({ // Reset form
      nombre: '', ubicacion: '',
      fecha_instalacion: formatDate(new Date().toISOString(), true),
      tipo: '', toneladas: null,
      evaporadora_operativa: 'operativa', evaporadora_marca: '', evaporadora_modelo: '',
      evaporadora_serial: '', evaporadora_codigo_inventario: '', evaporadora_ubicacion_instalacion: '',
      condensadora_operativa: 'operativa', condensadora_marca: '', condensadora_modelo: '', // Default operative state
      condensadora_serial: '', condensadora_codigo_inventario: '', condensadora_ubicacion_instalacion: '',
    });
    setModalTitle('Agregar Aire Acondicionado');
    setFormMode('add');
    setEditError(null); // Clear modal error
    if (clearAiresError) clearAiresError(); // Clear global error
    setShowEditModal(true);
    setShowViewModal(false);
  }, [formatDate, clearAiresError]);

  // Open Edit Modal (fetches details via Flux action)
  const handleEdit = useCallback(async (aireListItem) => { 
    setFormMode('edit');
    setModalTitle('Editar Aire Acondicionado');
    setEditError(null);
    if (clearAiresError) clearAiresError();
    setShowViewModal(false);
    setLoadingEditDetails(true);
    setShowEditModal(true);

    try {
      // Use Flux action to fetch details
      const fullDetails = await fetchAireDetails(aireListItem.id);
      if (fullDetails && typeof fullDetails === 'object' && fullDetails.id) {
        setFormData({
          ...fullDetails,
          fecha_instalacion: formatDate(fullDetails.fecha_instalacion, true),
          toneladas: (typeof fullDetails.toneladas === 'number' && !isNaN(fullDetails.toneladas)) ? fullDetails.toneladas : null,
          evaporadora_operativa: fullDetails.evaporadora_operativa || 'no_operativa',
          condensadora_operativa: fullDetails.condensadora_operativa || 'no_operativa',
        });
      } else {
        throw new Error("Formato de respuesta inválido al cargar detalles para editar.");
      }
    } catch (error) {
      console.error(`Error loading details for editing aire ${aireListItem.id}:`, error);
      setEditError(error.message || `Error al cargar detalles para editar.`);
    } finally {
      setLoadingEditDetails(false);
    }
  }, [formatDate, fetchAireDetails, clearAiresError]); // Dependencies

  // Delete AC (calls Flux action)
  const handleDelete = useCallback(async (id) => { 
    if (window.confirm('¿Está seguro de eliminar este aire acondicionado? Esta acción no se puede deshacer.')) {
      if (clearAiresError) clearAiresError();
      setIsSubmitting(true); // Indicate activity
      const success = await deleteAire(id);
      setIsSubmitting(false);
      if (!success) {
        // Error is handled globally
         alert("Error al eliminar"); 
      }
    }
  }, [deleteAire, clearAiresError]); // Dependencies

  // Submit Add/Edit Form (calls Flux action)
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setEditError(null);
    if (clearAiresError) clearAiresError();

    // --- Validation ---
    const requiredFields = [
      'nombre', 'ubicacion', 'fecha_instalacion',
      'evaporadora_serial', 'evaporadora_codigo_inventario',
      'condensadora_serial', 'condensadora_codigo_inventario'
    ];
    const missingFields = requiredFields.filter(field => {
      const value = formData[field];
      return value === null || value === undefined || String(value).trim() === ''; // Check trimmed string
    });

    if (missingFields.length > 0) {
      const fieldNames = missingFields.map(field => {
        switch(field) {
            case 'nombre': return 'Nombre';
            case 'ubicacion': return 'Ubicación';
            case 'fecha_instalacion': return 'Fecha de Instalación';
            case 'evaporadora_serial': return 'Serial Evap.';
            case 'evaporadora_codigo_inventario': return 'Inventario Evap.';
            case 'condensadora_serial': return 'Serial Cond.';
            case 'condensadora_codigo_inventario': return 'Inventario Cond.';
            default: return field; // Nombre técnico si no hay mapeo
        }
    }).join(', ');
      setEditError(`Los siguientes campos son requeridos: ${fieldNames}.`);
      return;
    }
    // --- End Validation ---

    // Prepare payload
    const payload = {
      ...formData,
      fecha_instalacion: formData.fecha_instalacion ? formData.fecha_instalacion.split('T')[0] : null, // Ensure YYYY-MM-DD or null
      toneladas: (formData.toneladas !== null && formData.toneladas !== undefined && !isNaN(Number(formData.toneladas))) ? Number(formData.toneladas) : null,
      evaporadora_operativa: formData.evaporadora_operativa, // Send as string
      condensadora_operativa: formData.condensadora_operativa, // Send as string
    }; // Note: Old diagnostic fields are NOT included here
    if (formMode === 'add') { delete payload.id; }

    setIsSubmitting(true);
    let success = false;

    try {
      if (formMode === 'add') {
        success = await addAire(payload); // Use addAire action
      } else if (formMode === 'edit' && formData.id) {
        success = await updateAire(formData.id, payload);
      } else {
        throw new Error("Operación inválida.");
      }

      if (success) {
        setShowEditModal(false); // Close modal on success
        // fetchAires is called within the action on success
      }

    } catch (error) {
      console.error('Error saving aire:', error);
      setEditError(error.message || 'Error de red o al procesar la solicitud');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, formMode, addAire, actions.updateAire, clearAiresError]); // Dependencies: include updateAire from actions

  // Open View Details Modal (fetches details via Flux action)
  const handleRowClick = useCallback(async (id) => { // Remove type
    setShowViewModal(true);
    setLoadingDetails(true);
    setViewError(null);
    setSelectedAireDetails(null);
    if (clearAiresError) clearAiresError();

    try {
      // Use Flux action to fetch details
      const details = await fetchAireDetails(id);
      if (details && typeof details === 'object' && details.id) {
        setSelectedAireDetails(details);
      } else {
        throw new Error("Formato de respuesta inválido al cargar detalles.");
      }
    } catch (error) {
      console.error(`Error loading details for aire ${id}:`, error);
      setViewError(error.message || `Error al cargar detalles.`);
    } finally {
      setLoadingDetails(false);
    }
  }, [fetchAireDetails, clearAiresError]); // Dependencies

  // --- Render ---
  return (
    <div className="container mt-4"> {/* Added container */}
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <h1>Aires Acondicionados</h1>
        {canManage && (
          <Button variant="primary" onClick={handleAdd}>
            <FiPlus className="me-2" /> Agregar Aire
          </Button>
        )}
      </div>

      {/* Global Error Alert */}
      {error && (
        <Alert variant="danger" dismissible onClose={clearAiresError}>
          {error}
        </Alert>
      )}

      {/* Main Card */}
      <Card className="dashboard-card">
        <Card.Body>
          {/* Table Component */}
          <AiresTable
            airesList={airesList} // Pass list from store
            loading={loading} // Pass global loading state
            // error={error} // Error handled globally above
            canManage={canManage}
            onRowClick={handleRowClick}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAdd={handleAdd} // For empty state button
            formatDate={formatDate}
          />
        </Card.Body>
      </Card>

      {/* --- Modals --- */}

      {/* Add/Edit Modal */}
      <AiresAddEditModal
        show={showEditModal}
        onHide={() => !isSubmitting && setShowEditModal(false)} // Prevent close during submit
        modalTitle={modalTitle}
        formData={formData}
        formMode={formMode}
        loadingEditDetails={loadingEditDetails}
        editError={editError} // Pass modal-specific error
        onSubmit={handleSubmit}
        onChange={handleChange}
        isSubmitting={isSubmitting} // Pass submitting state (for form submission)
        // Note: Diagnostic props are NOT passed to this modal anymore
      />

      {/* View Details Modal */}
      <AiresViewModal
        show={showViewModal}
        onHide={() => setShowViewModal(false)}
        selectedAireDetails={selectedAireDetails}
        loadingDetails={loadingDetails}
        viewError={viewError} // Pass view-modal-specific error
        formatDate={formatDate}
      />
    </div>
  );
};

// Add PropTypes
Aires.propTypes = {
  // No props needed for the main page component itself
};

export default Aires;
