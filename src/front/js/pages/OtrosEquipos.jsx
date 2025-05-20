// src/front/js/pages/OtrosEquipos.jsx

import React, { useState, useEffect, useCallback, useContext } from 'react';
import { Card, Button, Alert, Spinner } from 'react-bootstrap'; // Added Spinner
import { FiPlus } from 'react-icons/fi';
// Import your Flux context
import { Context } from '../store/appContext';

// Import the child components (assuming they are converted/created as .jsx)
import OtrosEquiposTable from '../component/OtrosEquipos/OtrosEquiposTable.jsx';
import OtrosEquiposAddEditModal from '../component/OtrosEquipos/OtrosEquiposAddEditModal.jsx';
import OtrosEquiposViewModal from '../component/OtrosEquipos/OtrosEquiposViewModal.jsx';

// Remove TypeScript interfaces

// --- Componente Contenedor Principal ---
const OtrosEquipos = () => { // Remove : React.FC
    // Get store and actions from Flux context
    const { store, actions } = useContext(Context);
    const {
        trackerUser: user, // Logged-in user info
        otrosEquiposList,  // Use list from store
        otrosEquiposLoading: loading, // Use specific loading state
        otrosEquiposError: error,     // Use specific error state
    } = store;
    const {
        fetchOtrosEquipos,
        fetchOtroEquipoDetails, // Action to get details
        addOtroEquipo,
        updateOtroEquipo,
        deleteOtroEquipo,
        clearOtrosEquiposError // Action to clear the error
    } = actions;

    // Local state for modals, form data, view details etc.
    const [showEditModal, setShowEditModal] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [formData, setFormData] = useState({}); // Initial empty object
    const [formMode, setFormMode] = useState('add'); // 'add' | 'edit'
    const [loadingEditDetails, setLoadingEditDetails] = useState(false); // Loading state for modal details
    const [editError, setEditError] = useState(null); // Specific error for the edit/add modal

    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedEquipoDetails, setSelectedEquipoDetails] = useState(null); // Details for view modal
    const [loadingDetails, setLoadingDetails] = useState(false); // Loading state for view modal
    const [viewError, setViewError] = useState(null); // Specific error for view modal

    const [isSubmitting, setIsSubmitting] = useState(false); // For modal submit buttons

    const canManage = user?.rol === 'admin' || user?.rol === 'supervisor' || user?.rol === 'operador'; 

    // --- Helper para formatear fechas (remains the same, remove type annotations) ---
    const formatDate = useCallback((dateString, forInput = false) => {
        if (!dateString) return '';
        try {
            let date;
            if (dateString.includes('T') || dateString.includes(' ')) { // Handle ISO or space separator
                // Try parsing as ISO first, then with space
                date = new Date(dateString.includes('T') ? dateString : dateString.replace(' ', 'T'));
            } else if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) { // YYYY-MM-DD
                date = new Date(dateString + 'T00:00:00'); // Add time to avoid timezone issues
            } else {
                 throw new Error("Unrecognized date format");
            }


            if (isNaN(date.getTime())) {
                console.warn("Fecha inválida recibida:", dateString);
                return forInput ? '' : 'Fecha inválida';
            }

            if (forInput) {
                const year = date.getFullYear();
                const month = (date.getMonth() + 1).toString().padStart(2, '0');
                const day = date.getDate().toString().padStart(2, '0');
                return `${year}-${month}-${day}`;
            } else {
                return date.toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' });
            }
        } catch (e) {
            console.error("Error formatting date:", dateString, e);
            return forInput ? '' : 'Error fecha';
        }
    }, []);

    // --- Cargar lista de equipos via Flux action ---
    useEffect(() => {
        fetchOtrosEquipos();

        // Cleanup function to clear error when component unmounts
        return () => {
            if (clearOtrosEquiposError) clearOtrosEquiposError();
        };
    }, [fetchOtrosEquipos, clearOtrosEquiposError]); // Add dependencies

    // --- Manejar cambios en el formulario de Edición/Creación (remains the same, remove types) ---
    const handleChange = useCallback((e) => {
        const { name, value, type } = e.target;
        const isCheckbox = type === 'checkbox';
        const checked = e.target.checked; // Only relevant for checkbox

        setFormData(prevData => ({
            ...prevData,
            [name]: isCheckbox ? checked : value
        }));
    }, []);

    // --- Abrir modal para Agregar ---
    const handleAdd = useCallback(() => {
        setFormData({ // Reset form data
            nombre: '',
            tipo: 'Otro', // Default value
            ubicacion: '',
            marca: '',
            modelo: '',
            serial: '',
            codigo_inventario: '',
            fecha_instalacion: formatDate(new Date().toISOString(), true), // Current date
            estado_operativo: true,
            notas: '',
        });
        setModalTitle('Agregar Equipo');
        setFormMode('add');
        setEditError(null); // Clear modal specific error
        if (clearOtrosEquiposError) clearOtrosEquiposError(); // Clear global error
        setShowEditModal(true);
        setShowViewModal(false);
    }, [formatDate, clearOtrosEquiposError]);

    // --- Abrir modal para Editar (y cargar detalles via Flux action) ---
    const handleEdit = useCallback(async (equipoListItem) => { // Remove type
        setFormMode('edit');
        setModalTitle('Editar Equipo');
        setEditError(null);
        if (clearOtrosEquiposError) clearOtrosEquiposError();
        setShowViewModal(false);
        setLoadingEditDetails(true);
        setShowEditModal(true); // Show modal while loading details

        try {
            // Use the Flux action to fetch details
            const fullDetails = await fetchOtroEquipoDetails(equipoListItem.id);
            if (fullDetails) {
                setFormData({
                    ...fullDetails,
                    // Format date for input
                    fecha_instalacion: formatDate(fullDetails.fecha_instalacion, true),
                    // Ensure boolean is handled correctly
                    estado_operativo: !!fullDetails.estado_operativo,
                });
            } else {
                 throw new Error("No se pudieron cargar los detalles del equipo.");
            }
        } catch (error) {
            console.error(`Error loading full details for editing equipo ${equipoListItem.id}:`, error);
            setEditError(error.message || `Error al cargar detalles para editar.`);
            // Optionally close modal on error: setShowEditModal(false);
        } finally {
            setLoadingEditDetails(false);
        }
    }, [formatDate, fetchOtroEquipoDetails, clearOtrosEquiposError]);

    // --- Eliminar equipo (calls Flux action) ---
    const handleDelete = useCallback(async (id) => { // Remove type
        if (window.confirm('¿Está seguro de eliminar este equipo? Esta acción no se puede deshacer.')) {
            setIsSubmitting(true); // Indicate activity
            if (clearOtrosEquiposError) clearOtrosEquiposError(); // Clear previous errors
            const success = await deleteOtroEquipo(id);
            setIsSubmitting(false);
            if (!success) {
                // Error is now handled by the global state 'otrosEquiposError'
                // alert("Error al eliminar el equipo."); // Optional local feedback
            }
            // UI updates optimistically via Flux action
        }
    }, [deleteOtroEquipo, clearOtrosEquiposError]);

    // --- Enviar formulario de Edición/Creación (calls Flux action) ---
    const handleSubmit = useCallback(async (e) => { // Remove type
        e.preventDefault();
        setEditError(null); // Clear modal specific error
        if (clearOtrosEquiposError) clearOtrosEquiposError(); // Clear global error

        // Basic validation
        if (!formData.nombre || !formData.tipo) {
            setEditError("Nombre y Tipo son requeridos.");
            return;
        }

        // Prepare payload
        const payload = {
            ...formData,
            fecha_instalacion: formData.fecha_instalacion || null, // Send null if empty
            estado_operativo: !!formData.estado_operativo, // Ensure boolean
        };

        setIsSubmitting(true);
        let success = false;

        try {
            if (formMode === 'add') {
                success = await addOtroEquipo(payload);
            } else if (formMode === 'edit' && formData.id) {
                success = await updateOtroEquipo(formData.id, payload);
            }

            if (success) {
                setShowEditModal(false); // Close modal on success
            }
            // If !success, the error is set in the Flux store and displayed globally
        } catch (error) {
             // This catch might not be strictly necessary if actions handle errors
             console.error("Unexpected error during submit:", error);
             setEditError("Ocurrió un error inesperado al guardar.");
        } finally {
            setIsSubmitting(false);
        }
    }, [formData, formMode, addOtroEquipo, updateOtroEquipo, clearOtrosEquiposError]);

    // --- Abrir modal de Detalles (al hacer clic en la fila, calls Flux action) ---
    const handleRowClick = useCallback(async (id) => { // Remove type
        setShowViewModal(true);
        setLoadingDetails(true);
        setViewError(null);
        setSelectedEquipoDetails(null);
        if (clearOtrosEquiposError) clearOtrosEquiposError();

        try {
            // Use Flux action to fetch details
            const details = await fetchOtroEquipoDetails(id);
            if (details) {
                setSelectedEquipoDetails(details);
            } else {
                 throw new Error("No se pudieron cargar los detalles del equipo.");
            }
        } catch (error) {
            console.error(`Error loading details for equipo ${id}:`, error);
            setViewError(error.message || `Error al cargar detalles del equipo ${id}`);
        } finally {
            setLoadingDetails(false);
        }
    }, [fetchOtroEquipoDetails, clearOtrosEquiposError]);

    // --- Render Logic ---
    return (
        <div className="container mt-4"> {/* Added container */}
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                <h1>Otros Equipos</h1>
                {canManage && (
                    <Button variant="primary" onClick={handleAdd}>
                        <FiPlus className="me-2" /> Agregar Equipo
                    </Button>
                )}
            </div>

            {/* Global Error Alert for this section */}
            {error && !loading && ( // Show general error only when not loading
                <Alert variant="danger" dismissible onClose={clearOtrosEquiposError}>
                    {error}
                </Alert>
            )}

            {/* Main Card */}
            <Card className="dashboard-card">
                <Card.Body>
                    {/* Use the specific table component */}
                    <OtrosEquiposTable
                        // Pass data from Flux store
                        equiposList={otrosEquiposList}
                        loading={loading} // Pass global loading state
                        // error={error} // Error is handled globally above
                        canManage={canManage}
                        onRowClick={handleRowClick}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onAdd={handleAdd} // Pass handleAdd for empty state button
                    />
                </Card.Body>
            </Card>

            {/* --- Modals (using specific components) --- */}
            <OtrosEquiposAddEditModal
                show={showEditModal}
                onHide={() => !isSubmitting && setShowEditModal(false)}
                modalTitle={modalTitle}
                formData={formData}
                formMode={formMode}
                loadingEditDetails={loadingEditDetails} // Loading details specifically for edit
                editError={editError} // Pass modal-specific error
                onSubmit={handleSubmit}
                onChange={handleChange}
                isSubmitting={isSubmitting} // Pass submitting state
            />

            <OtrosEquiposViewModal
                show={showViewModal}
                onHide={() => setShowViewModal(false)}
                selectedEquipoDetails={selectedEquipoDetails}
                loadingDetails={loadingDetails} // Loading details specifically for view
                viewError={viewError} // Pass view-modal-specific error
                formatDate={formatDate} // Pass the formatting function
            />
        </div>
    );
};

export default OtrosEquipos;
