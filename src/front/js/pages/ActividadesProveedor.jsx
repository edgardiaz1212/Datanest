import React, { useContext, useState, useEffect } from "react";
import { Context } from "../store/appContext";
import { Modal, Button, Form, Table, Alert, Spinner, Dropdown, Container, Row, Col } from "react-bootstrap";
import { format } from 'date-fns';

// --- Importaciones para PDF ---
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logoBase64 from '../../img/logo dcce.png'; // <-- Importa tu logo (ajusta la ruta)

const ESTATUS_OPTIONS = ['Pendiente', 'En Progreso', 'Completado', 'Cancelado'];

const ActividadesProveedor = () => { // Cambiado a función nombrada para export default
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
        estatus: ESTATUS_OPTIONS[0],
    });
    const [selectedProveedorFilter, setSelectedProveedorFilter] = useState('');
    const [selectedStatusFilter, setSelectedStatusFilter] = useState('');
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false); // Renombrado para claridad
    const [pdfError, setPdfError] = useState(null); // Renombrado para claridad

    // --- useEffects y otros handlers (sin cambios) ---
    useEffect(() => {
        actions.fetchProveedores();
        actions.fetchAllActividades();
    }, []);

    useEffect(() => {
        if (selectedProveedorFilter) {
            actions.fetchActividadesPorProveedor(selectedProveedorFilter);
        } else {
            actions.fetchAllActividades(selectedStatusFilter || null);
        }
    }, [selectedProveedorFilter, selectedStatusFilter]);

    const handleInputChange = (e) => { /* ... */ };
    const handleDateChange = (e) => { /* ... */ };
    const handleShowAddModal = () => { /* ... */ };
    const handleShowEditModal = (actividad) => { /* ... */ };
    const handleCloseModal = () => { /* ... */ };
    const handleSubmit = async (e) => { /* ... */ };
    const handleDelete = async (id) => { /* ... */ };
    const handleProveedorFilterChange = (e) => { /* ... */ };
    const handleStatusFilterChange = (e) => { /* ... */ };
    // --- Fin useEffects y otros handlers ---


    // --- *** NUEVA FUNCIÓN handleGeneratePDF *** ---
    const handleGeneratePDF = () => {
        // 1. Verificar que un proveedor esté seleccionado
        if (!selectedProveedorFilter) {
            setPdfError("Por favor, selecciona un proveedor para generar el reporte.");
            return;
        }

        setIsGeneratingPDF(true);
        setPdfError(null);
        actions.clearActividadesError(); // Limpiar errores generales

        try {
            // 2. Obtener el nombre del proveedor seleccionado
            const proveedorSeleccionado = store.proveedores.find(
                p => p.id === parseInt(selectedProveedorFilter)
            );
            const nombreProveedor = proveedorSeleccionado ? proveedorSeleccionado.nombre : 'Desconocido';

            // 3. Filtrar las actividades del store para el proveedor y estado activo
            const actividadesParaReporte = store.actividadesProveedor.filter(
                act => (act.estatus === 'Pendiente' || act.estatus === 'En Progreso')
                       // No necesitamos filtrar por proveedor_id aquí, porque
                       // store.actividadesProveedor ya está filtrado por el useEffect
            );

            // 4. Verificar si hay actividades para reportar
            if (actividadesParaReporte.length === 0) {
                setPdfError(`No se encontraron actividades Pendientes o En Progreso para ${nombreProveedor}.`);
                setIsGeneratingPDF(false);
                return;
            }

            // 5. Crear instancia de jsPDF
            const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

            // --- Añadir Logo (Ajusta posición y tamaño) ---
            const logoWidth = 25; // Ancho en mm
            const logoHeight = (doc.getImageProperties(logoBase64).height * logoWidth) / doc.getImageProperties(logoBase64).width; // Calcular altura proporcional
            const margin = 10; // Margen izquierdo/superior
            doc.addImage(logoBase64, 'PNG', margin, margin, logoWidth, logoHeight);

            // --- Añadir Título ---
            const title = `Informe de Seguimiento - Proveedor: ${nombreProveedor}`;
            doc.setFontSize(15);
            doc.setFont('helvetica', 'bold');
            // Centrar título (considerando el logo a la izquierda)
            const pageWidth = doc.internal.pageSize.getWidth();
            doc.text(title, pageWidth / 2, margin + logoHeight / 2, { align: 'center' }); // Ajusta Y según necesites

            // --- Preparar datos para la tabla ---
            const tableColumn = [
                'ID', 'Descripción', 'F. Ocurrencia', 'F. Reporte', '# Reporte', 'Estatus'
            ];
            const tableRows = [];

            actividadesParaReporte.forEach(act => {
                const actividadData = [
                    act.id,
                    act.descripcion || '-',
                    act.fecha_ocurrencia ? format(new Date(act.fecha_ocurrencia), 'dd/MM/yy HH:mm') : '-',
                    act.fecha_reporte ? format(new Date(act.fecha_reporte), 'dd/MM/yy HH:mm') : '-',
                    act.numero_reporte || '-',
                    act.estatus || '-'
                ];
                tableRows.push(actividadData);
            });

            // --- Añadir Tabla con autoTable ---
            const startY = margin + logoHeight + 10; // Posición Y debajo del logo/título
            autoTable(doc, {
                head: [tableColumn],
                body: tableRows,
                startY: startY,
                theme: 'grid',
                styles: { fontSize: 8, cellPadding: 1.5 },
                headStyles: { fillColor: [22, 160, 133], fontSize: 9, fontStyle: 'bold' }, // Estilo cabecera
                columnStyles: {
                    // Ajusta anchos si es necesario (ejemplo)
                    0: { cellWidth: 10 }, // ID
                    1: { cellWidth: 'auto' }, // Descripción (autoajustable)
                    // ... otros anchos ...
                },
                margin: { left: margin, right: margin }
            });

            // --- Añadir Pie de Página (Número de página) ---
            const pageCount = doc.internal.getNumberOfPages();
            doc.setFont('helvetica', 'italic');
            doc.setFontSize(8);
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.text(`Página ${i} de ${pageCount}`, pageWidth / 2, doc.internal.pageSize.getHeight() - margin, { align: 'center' });
            }

            // 6. Guardar el PDF
            const filename = `reporte_actividades_${nombreProveedor.replace(/\s+/g, '_')}.pdf`;
            doc.save(filename);

        } catch (error) {
            console.error("Error generando el reporte PDF:", error);
            setPdfError(error.message || "Ocurrió un error al generar el PDF.");
        } finally {
            setIsGeneratingPDF(false);
        }
    };
    // --- *** FIN NUEVA FUNCIÓN handleGeneratePDF *** ---

    return (
        <Container className="mt-4">
            <Row className="mb-3 align-items-center">
                <Col xs={12} md={6}> {/* Ajustado para mejor layout */}
                    <h2>Gestión de Actividades de Proveedores</h2>
                </Col>
                <Col xs={12} md={6} className="text-md-end mt-2 mt-md-0">
                    {/* --- Botón PDF modificado --- */}
                    <Button
                        variant="outline-danger"
                        onClick={handleGeneratePDF} // Llama a la nueva función
                        disabled={!selectedProveedorFilter || isGeneratingPDF} // Deshabilitado si no hay proveedor o si se está generando
                        className="me-2"
                        title={!selectedProveedorFilter ? "Selecciona un proveedor para generar el PDF" : "Descargar PDF de actividades Pendientes/En Progreso"}
                    >
                        {isGeneratingPDF ? (
                            <>
                                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                                {' '} Generando...
                            </>
                        ) : (
                            <>
                                <i className="fas fa-file-pdf me-2"></i> Descargar PDF Proveedor
                            </>
                        )}
                    </Button>
                    {/* Botón Nueva Actividad (sin cambios) */}
                    <Button variant="primary" onClick={handleShowAddModal}>
                        <i className="fas fa-plus me-2"></i> Nueva Actividad
                    </Button>
                </Col>
            </Row>

            {/* Alerta para errores de PDF */}
            {pdfError && <Alert variant="danger" onClose={() => setPdfError(null)} dismissible>{pdfError}</Alert>}

            {/* Filters (sin cambios) */}
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
                            disabled={!!selectedProveedorFilter}
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

            {/* Loading and Error Display (sin cambios) */}
            {store.actividadesLoading && <div className="text-center"><Spinner animation="border" /> Cargando actividades...</div>}
            {store.actividadesError && <Alert variant="danger" onClose={() => actions.clearActividadesError()} dismissible>{store.actividadesError}</Alert>}
            {!store.actividadesLoading && !store.actividadesError && store.actividadesProveedor.length === 0 && (
                <Alert variant="info">No se encontraron actividades con los filtros seleccionados.</Alert>
            )}

            {/* Activities Table (sin cambios) */}
            {!store.actividadesLoading && store.actividadesProveedor.length > 0 && (
                 <Table striped bordered hover responsive size="sm">
                 {/* ... thead y tbody sin cambios ... */}
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


            {/* Add/Edit Modal (sin cambios) */}
            <Modal show={showModal} onHide={handleCloseModal} size="lg">
                {/* ... Contenido del modal sin cambios ... */}
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

export default ActividadesProveedor; // Exportar como default
