import React, { useContext, useState, useEffect } from "react";
import { Context } from "../store/appContext";
import { Modal, Button, Form, Table, Alert, Spinner, Dropdown, Container, Row, Col } from "react-bootstrap";
import { format } from 'date-fns'; // For formatting dates

const ESTATUS_OPTIONS = ['Pendiente', 'En Progreso', 'Completado', 'Cancelado']; // Based on EstatusActividad enum

const ActividadesProveedor = () => {
    const { store, actions } = useContext(Context);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentActividad, setCurrentActividad] = useState(null);
    const [formData, setFormData] = useState({
        proveedor_id: '',
        descripcion: '',
        fecha_ocurrencia: '',
        fecha_reporte: '',
        numero_reporte: '',
        estatus: ESTATUS_OPTIONS[0], // Default to 'Pendiente'
    });
    const [selectedProveedorFilter, setSelectedProveedorFilter] = useState(''); // ID del proveedor para filtrar
    const [selectedStatusFilter, setSelectedStatusFilter] = useState(''); // Estatus para filtrar

    // Fetch initial data (proveedores and activities)
    useEffect(() => {
        actions.fetchProveedores();
        // Decide initial fetch: all activities or based on filter? Fetch all initially.
        actions.fetchAllActividades();
    }, []);

    // Fetch activities when filters change
    useEffect(() => {
        if (selectedProveedorFilter) {
            actions.fetchActividadesPorProveedor(selectedProveedorFilter);
        } else {
            actions.fetchAllActividades(selectedStatusFilter || null); // Pass status filter if no supplier is selected
        }
    }, [selectedProveedorFilter, selectedStatusFilter]);


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleDateChange = (e) => {
        const { name, value } = e.target;
        // Input type="datetime-local" returns value in "YYYY-MM-DDTHH:mm" format
        // Backend expects ISO format (YYYY-MM-DDTHH:MM:SS)
        // We can append ':00' for seconds if needed, or let backend handle it if flexible
        setFormData({ ...formData, [name]: value ? `${value}:00` : '' });
    };

    const handleShowAddModal = () => {
        setIsEditing(false);
        setCurrentActividad(null);
        // Reset form, default status, maybe default current date for reporte?
        setFormData({
            proveedor_id: selectedProveedorFilter || '', // Pre-select if filtered
            descripcion: '',
            fecha_ocurrencia: '',
            fecha_reporte: format(new Date(), "yyyy-MM-dd'T'HH:mm"), // Default to now
            numero_reporte: '',
            estatus: ESTATUS_OPTIONS[0],
        });
        setShowModal(true);
    };

    const handleShowEditModal = (actividad) => {
        setIsEditing(true);
        setCurrentActividad(actividad);
        setFormData({
            proveedor_id: actividad.proveedor_id, // Cannot change supplier on edit
            descripcion: actividad.descripcion,
            // Format dates for datetime-local input: YYYY-MM-DDTHH:mm
            fecha_ocurrencia: actividad.fecha_ocurrencia ? format(new Date(actividad.fecha_ocurrencia), "yyyy-MM-dd'T'HH:mm") : '',
            fecha_reporte: actividad.fecha_reporte ? format(new Date(actividad.fecha_reporte), "yyyy-MM-dd'T'HH:mm") : '',
            numero_reporte: actividad.numero_reporte || '',
            estatus: actividad.estatus || ESTATUS_OPTIONS[0],
        });
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setCurrentActividad(null);
        setIsEditing(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        actions.clearActividadesError(); // Clear previous errors

        // Basic validation
        if (!formData.descripcion || !formData.fecha_ocurrencia) {
            actions.setActividadesError("Descripción y Fecha de Ocurrencia son requeridas.");
            return;
        }
        if (!isEditing && !formData.proveedor_id) {
             actions.setActividadesError("Debe seleccionar un proveedor para agregar una actividad.");
             return;
        }

        // Prepare data for backend (ensure dates are ISO strings)
        const dataToSend = {
            ...formData,
            fecha_ocurrencia: formData.fecha_ocurrencia ? new Date(formData.fecha_ocurrencia).toISOString() : null,
            fecha_reporte: formData.fecha_reporte ? new Date(formData.fecha_reporte).toISOString() : null,
        };

        let success = false;
        if (isEditing && currentActividad) {
            success = await actions.updateActividadProveedor(currentActividad.id, dataToSend, selectedProveedorFilter || null);
        } else {
            success = await actions.addActividadProveedor(formData.proveedor_id, dataToSend);
        }

        if (success) {
            handleCloseModal();
            // Refetching is handled by the useEffect hook based on filters
        }
        // Error is handled and displayed via store.actividadesError
    };

    const handleDelete = async (id) => {
        if (window.confirm("¿Estás seguro de que deseas eliminar esta actividad?")) {
            actions.clearActividadesError();
            const success = await actions.deleteActividadProveedor(id, selectedProveedorFilter || null);
            if (!success) {
                // Error message is already in the store
            }
             // Refetching is handled by the useEffect hook based on filters
        }
    };

    const handleProveedorFilterChange = (e) => {
        setSelectedProveedorFilter(e.target.value);
        // Reset status filter when supplier changes? Optional.
        // setSelectedStatusFilter('');
    };

     const handleStatusFilterChange = (e) => {
        setSelectedStatusFilter(e.target.value);
        // Cannot filter by status if a supplier is selected (backend limitation assumed)
        if (selectedProveedorFilter) {
            setSelectedProveedorFilter(''); // Clear supplier filter if status is chosen
        }
    };

    return (
        <Container className="mt-4">
            <Row className="mb-3 align-items-center">
                <Col md={8}>
                    <h2>Gestión de Actividades de Proveedores</h2>
                </Col>
                <Col md={4} className="text-md-end">
                    <Button variant="primary" onClick={handleShowAddModal}>
                        <i className="fas fa-plus me-2"></i> Nueva Actividad
                    </Button>
                </Col>
            </Row>

            {/* Filters */}
            <Row className="mb-3 gx-2">
                <Col md={6}>
                    <Form.Group controlId="proveedorFilter">
                        <Form.Label>Filtrar por Proveedor</Form.Label>
                        <Form.Select
                            value={selectedProveedorFilter}
                            onChange={handleProveedorFilterChange}
                        >
                            <option value="">-- Todos los Proveedores --</option>
                            {store.proveedoresLoading ? (
                                <option disabled>Cargando...</option>
                            ) : (
                                store.proveedores.map(p => (
                                    <option key={p.id} value={p.id}>{p.nombre}</option>
                                ))
                            )}
                        </Form.Select>
                    </Form.Group>
                </Col>
                <Col md={6}>
                     <Form.Group controlId="statusFilter">
                        <Form.Label>Filtrar por Estatus (Global)</Form.Label>
                        <Form.Select
                            value={selectedStatusFilter}
                            onChange={handleStatusFilterChange}
                            disabled={!!selectedProveedorFilter} // Disable if supplier is selected
                        >
                            <option value="">-- Todos los Estatus --</option>
                            {ESTATUS_OPTIONS.map(status => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </Form.Select>
                         {selectedProveedorFilter && <Form.Text muted>El filtro por estatus se aplica solo cuando no hay proveedor seleccionado.</Form.Text>}
                    </Form.Group>
                </Col>
            </Row>

            {/* Loading and Error Display */}
            {store.actividadesLoading && <div className="text-center"><Spinner animation="border" /> Cargando actividades...</div>}
            {store.actividadesError && <Alert variant="danger" onClose={() => actions.clearActividadesError()} dismissible>{store.actividadesError}</Alert>}
            {!store.actividadesLoading && !store.actividadesError && store.actividadesProveedor.length === 0 && (
                <Alert variant="info">No se encontraron actividades con los filtros seleccionados.</Alert>
            )}

            {/* Activities Table */}
            {!store.actividadesLoading && store.actividadesProveedor.length > 0 && (
                <Table striped bordered hover responsive size="sm">
                    <thead>
                        <tr>
                            <th>Proveedor</th>
                            <th>Descripción</th>
                            <th>Fecha Ocurrencia</th>
                            <th>Fecha Reporte</th>
                            <th># Reporte</th>
                            <th>Estatus</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {store.actividadesProveedor.map(act => (
                            <tr key={act.id}>
                                <td>{act.nombre_proveedor || 'N/A'}</td>
                                <td>{act.descripcion}</td>
                                <td>{act.fecha_ocurrencia ? format(new Date(act.fecha_ocurrencia), 'dd/MM/yyyy HH:mm') : 'N/A'}</td>
                                <td>{act.fecha_reporte ? format(new Date(act.fecha_reporte), 'dd/MM/yyyy HH:mm') : 'N/A'}</td>
                                <td>{act.numero_reporte || '-'}</td>
                                <td>
                                    <span className={`badge bg-${act.estatus === 'Completado' ? 'success' : act.estatus === 'Cancelado' ? 'danger' : act.estatus === 'En Progreso' ? 'warning' : 'secondary'}`}>
                                        {act.estatus || 'N/A'}
                                    </span>
                                </td>
                                <td>
                                    <Button variant="outline-primary" size="sm" className="me-1" onClick={() => handleShowEditModal(act)} title="Editar">
                                        <i className="fas fa-edit"></i>
                                    </Button>
                                    <Button variant="outline-danger" size="sm" onClick={() => handleDelete(act.id)} title="Eliminar">
                                        <i className="fas fa-trash"></i>
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}

            {/* Add/Edit Modal */}
            <Modal show={showModal} onHide={handleCloseModal} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>{isEditing ? "Editar Actividad" : "Agregar Nueva Actividad"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {store.actividadesError && <Alert variant="danger">{store.actividadesError}</Alert>}
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3" controlId="formProveedorId">
                            <Form.Label>Proveedor *</Form.Label>
                            <Form.Select
                                name="proveedor_id"
                                value={formData.proveedor_id}
                                onChange={handleInputChange}
                                required
                                disabled={isEditing} // Cannot change supplier when editing
                            >
                                <option value="">Seleccione un proveedor...</option>
                                {store.proveedores.map(p => (
                                    <option key={p.id} value={p.id}>{p.nombre}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formDescripcion">
                            <Form.Label>Descripción *</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                name="descripcion"
                                value={formData.descripcion}
                                onChange={handleInputChange}
                                required
                                placeholder="Detalles de la actividad realizada o incidente"
                            />
                        </Form.Group>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3" controlId="formFechaOcurrencia">
                                    <Form.Label>Fecha y Hora de Ocurrencia *</Form.Label>
                                    <Form.Control
                                        type="datetime-local"
                                        name="fecha_ocurrencia"
                                        value={formData.fecha_ocurrencia}
                                        onChange={handleDateChange} // Use specific handler
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3" controlId="formFechaReporte">
                                    <Form.Label>Fecha y Hora de Reporte</Form.Label>
                                    <Form.Control
                                        type="datetime-local"
                                        name="fecha_reporte"
                                        value={formData.fecha_reporte}
                                        onChange={handleDateChange} // Use specific handler
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                             <Col md={6}>
                                <Form.Group className="mb-3" controlId="formNumeroReporte">
                                    <Form.Label>Número de Reporte (Opcional)</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="numero_reporte"
                                        value={formData.numero_reporte}
                                        onChange={handleInputChange}
                                        placeholder="Ej: INC00123, OT-456"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3" controlId="formEstatus">
                                    <Form.Label>Estatus *</Form.Label>
                                    <Form.Select
                                        name="estatus"
                                        value={formData.estatus}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        {ESTATUS_OPTIONS.map(status => (
                                            <option key={status} value={status}>{status}</option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>

                        <div className="d-flex justify-content-end">
                             <Button variant="secondary" onClick={handleCloseModal} className="me-2">
                                Cancelar
                            </Button>
                            <Button variant="primary" type="submit" disabled={store.actividadesLoading}>
                                {store.actividadesLoading ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : (isEditing ? "Actualizar" : "Guardar")}
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        </Container>
    );
};
export default ActividadesProveedor;