import React, { useState, useEffect, useContext } from 'react';
import {
  Container, Card, Table, Button, Modal, Form, Row, Col, Spinner, Alert,
  Dropdown, InputGroup, ListGroup, Badge
} from 'react-bootstrap';
import {
  FiUsers, FiPlus, FiEdit, FiTrash2, FiMail, FiPhone, FiUser, FiSearch, FiX, FiBriefcase
} from 'react-icons/fi';
import { Context } from '../store/appContext';

const Proveedores = () => {
  const { store, actions } = useContext(Context);
  const {
    trackerUser: currentUser,
    proveedores, proveedoresLoading, proveedoresError,
    contactos, contactosLoading, contactosError
  } = store;
  const {
    fetchProveedores, addProveedor, updateProveedor, deleteProveedor, clearProveedoresError,
    fetchContactosPorProveedor, addContacto, updateContacto, deleteContacto, clearContactosError
  } = actions;

  // Permisos
  const canManageProveedores = currentUser?.rol === 'admin' || currentUser?.rol === 'supervisor';
  const canDeleteProveedores = currentUser?.rol === 'admin';

  // Estado local
  const [selectedProveedor, setSelectedProveedor] = useState(null); // Almacena el objeto proveedor completo
  const [searchTerm, setSearchTerm] = useState('');

  const [showAddProveedorModal, setShowAddProveedorModal] = useState(false);
  const [showEditProveedorModal, setShowEditProveedorModal] = useState(false);
  const [showAddContactoModal, setShowAddContactoModal] = useState(false);
  const [showEditContactoModal, setShowEditContactoModal] = useState(false);

  const [proveedorFormData, setProveedorFormData] = useState({ id: null, nombre: '', email_proveedor: '' });
  const [contactoFormData, setContactoFormData] = useState({ id: null, nombre_contacto: '', telefono_contacto: '', email_contacto: '' });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Efecto para cargar proveedores al montar
  useEffect(() => {
    fetchProveedores();
    return () => { // Limpieza al desmontar
      clearProveedoresError();
      clearContactosError();
    };
  }, [fetchProveedores, clearProveedoresError, clearContactosError]);

  // Efecto para cargar contactos cuando cambia el proveedor seleccionado
  useEffect(() => {
    if (selectedProveedor?.id) {
      fetchContactosPorProveedor(selectedProveedor.id);
    } else {
      // Limpiar contactos si no hay proveedor seleccionado
      actions.fetchContactosPorProveedor(null); // Llama a la acción con null
    }
  }, [selectedProveedor, fetchContactosPorProveedor]); // Depende del objeto proveedor

  // Filtrar proveedores basado en el término de búsqueda
  const filteredProveedores = proveedores.filter(p =>
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.email_proveedor && p.email_proveedor.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // --- Handlers para Modales y Formularios ---

  const handleProveedorChange = (e) => {
    const { name, value } = e.target;
    setProveedorFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleContactoChange = (e) => {
    const { name, value } = e.target;
    setContactoFormData(prev => ({ ...prev, [name]: value }));
  };

  // Abrir Modales
  const openAddProveedor = () => {
    setProveedorFormData({ id: null, nombre: '', email_proveedor: '' });
    setShowAddProveedorModal(true);
    clearProveedoresError();
  };

  const openEditProveedor = (proveedor) => {
    setProveedorFormData({ id: proveedor.id, nombre: proveedor.nombre, email_proveedor: proveedor.email_proveedor || '' });
    setShowEditProveedorModal(true);
    clearProveedoresError();
  };

  const openAddContacto = () => {
    if (!selectedProveedor) return;
    setContactoFormData({ id: null, nombre_contacto: '', telefono_contacto: '', email_contacto: '' });
    setShowAddContactoModal(true);
    clearContactosError();
  };

  const openEditContacto = (contacto) => {
    setContactoFormData({
      id: contacto.id,
      nombre_contacto: contacto.nombre_contacto,
      telefono_contacto: contacto.telefono_contacto || '',
      email_contacto: contacto.email_contacto || ''
    });
    setShowEditContactoModal(true);
    clearContactosError();
  };

  // Cerrar Modales
  const closeModals = () => {
    setShowAddProveedorModal(false);
    setShowEditProveedorModal(false);
    setShowAddContactoModal(false);
    setShowEditContactoModal(false);
  };

  // --- Handlers para Submits (llaman a actions) ---

  const handleAddProveedorSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const success = await addProveedor(proveedorFormData);
    setIsSubmitting(false);
    if (success) closeModals();
  };

  const handleEditProveedorSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const success = await updateProveedor(proveedorFormData.id, proveedorFormData);
    setIsSubmitting(false);
    if (success) {
      // Si el proveedor editado es el seleccionado, actualiza el objeto seleccionado
      if (selectedProveedor?.id === proveedorFormData.id) {
        setSelectedProveedor(prev => ({ ...prev, ...proveedorFormData }));
      }
      closeModals();
    }
  };

  const handleDeleteProveedorClick = async (proveedorId) => {
    if (!canDeleteProveedores) return;
    if (window.confirm(`¿Está seguro de eliminar el proveedor ID ${proveedorId} y todos sus contactos? Esta acción no se puede deshacer.`)) {
      const success = await deleteProveedor(proveedorId);
      if (success && selectedProveedor?.id === proveedorId) {
        setSelectedProveedor(null); // Deseleccionar si se eliminó el proveedor actual
      }
    }
  };

  const handleAddContactoSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProveedor?.id) return;
    setIsSubmitting(true);
    const success = await addContacto(selectedProveedor.id, contactoFormData);
    setIsSubmitting(false);
    if (success) closeModals();
  };

  const handleEditContactoSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const success = await updateContacto(contactoFormData.id, contactoFormData, selectedProveedor?.id);
    setIsSubmitting(false);
    if (success) closeModals();
  };

  const handleDeleteContactoClick = async (contactoId) => {
    if (!canManageProveedores) return;
    if (window.confirm(`¿Está seguro de eliminar el contacto ID ${contactoId}?`)) {
      await deleteContacto(contactoId, selectedProveedor?.id);
    }
  };

  // --- Renderizado ---
  return (
    <Container fluid className="mt-4">
      <h1>Gestión de Proveedores</h1>

      {/* --- Sección de Proveedores --- */}
      <Row className="mb-4">
        {/* Columna Lista/Selector de Proveedores */}
        <Col md={4}>
          <Card className="h-100">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Proveedores</h5>
              {canManageProveedores && (
                <Button variant="primary" size="sm" onClick={openAddProveedor}>
                  <FiPlus /> Añadir
                </Button>
              )}
            </Card.Header>
            <Card.Body className="d-flex flex-column p-0">
              <div className="p-3 border-bottom">
                <InputGroup>
                  <InputGroup.Text><FiSearch /></InputGroup.Text>
                  <Form.Control
                    type="search"
                    placeholder="Buscar proveedor..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <Button variant="outline-secondary" onClick={() => setSearchTerm('')}><FiX /></Button>
                  )}
                </InputGroup>
              </div>

              {proveedoresLoading && (
                <div className="text-center p-5 flex-grow-1 d-flex align-items-center justify-content-center">
                  <Spinner animation="border" variant="primary" />
                </div>
              )}
              {proveedoresError && !proveedoresLoading && (
                <Alert variant="danger" className="m-3 flex-grow-1">{proveedoresError}</Alert>
              )}
              {!proveedoresLoading && !proveedoresError && filteredProveedores.length === 0 && (
                <div className="text-center p-5 text-muted flex-grow-1 d-flex flex-column align-items-center justify-content-center">
                  <FiBriefcase size={40} className="mb-2" />
                  {proveedores.length === 0 ? 'No hay proveedores registrados.' : 'No se encontraron proveedores.'}
                </div>
              )}
              {!proveedoresLoading && !proveedoresError && filteredProveedores.length > 0 && (
                <ListGroup variant="flush" className="overflow-auto flex-grow-1">
                  {filteredProveedores.map(p => (
                    <ListGroup.Item
                      key={p.id}
                      action
                      active={selectedProveedor?.id === p.id}
                      onClick={() => setSelectedProveedor(p)}
                      className="d-flex justify-content-between align-items-center"
                    >
                      <div>
                        <strong>{p.nombre}</strong>
                        {p.email_proveedor && <div className="small text-muted"><FiMail size={12} className="me-1" />{p.email_proveedor}</div>}
                      </div>
                      <div>
                        {canManageProveedores && (
                          <Button variant="outline-secondary" size="sm" className="me-1 py-0 px-1" onClick={(e) => { e.stopPropagation(); openEditProveedor(p); }}>
                            <FiEdit size={12} />
                          </Button>
                        )}
                        {canDeleteProveedores && (
                          <Button variant="outline-danger" size="sm" className="py-0 px-1" onClick={(e) => { e.stopPropagation(); handleDeleteProveedorClick(p.id); }}>
                            <FiTrash2 size={12} />
                          </Button>
                        )}
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Columna Detalles y Contactos del Proveedor Seleccionado */}
        <Col md={8}>
          <Card className="h-100">
            <Card.Header>
              <h5 className="mb-0">
                {selectedProveedor ? `Contactos de: ${selectedProveedor.nombre}` : 'Seleccione un Proveedor'}
              </h5>
            </Card.Header>
            <Card.Body>
              {!selectedProveedor ? (
                <div className="text-center p-5 text-muted">
                  <FiUsers size={50} className="mb-3" />
                  <p>Seleccione un proveedor de la lista para ver sus contactos.</p>
                </div>
              ) : (
                <>
                  {/* Botón Añadir Contacto */}
                  {canManageProveedores && (
                    <Button variant="success" size="sm" className="mb-3" onClick={openAddContacto}>
                      <FiPlus /> Añadir Contacto
                    </Button>
                  )}

                  {/* Tabla de Contactos */}
                  {contactosLoading && (
                    <div className="text-center p-5">
                      <Spinner animation="border" variant="secondary" />
                      <p className="mt-2">Cargando contactos...</p>
                    </div>
                  )}
                  {contactosError && !contactosLoading && (
                    <Alert variant="danger">{contactosError}</Alert>
                  )}
                  {!contactosLoading && !contactosError && contactos.length === 0 && (
                    <div className="text-center p-5 text-muted">
                      <FiUser size={40} className="mb-2" />
                      <p>Este proveedor no tiene contactos registrados.</p>
                    </div>
                  )}
                  {!contactosLoading && !contactosError && contactos.length > 0 && (
                    <div className="table-responsive">
                      <Table hover striped size="sm">
                        <thead>
                          <tr>
                            <th>Nombre Contacto</th>
                            <th>Teléfono</th>
                            <th>Email</th>
                            <th className="text-end">Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {contactos.map(c => (
                            <tr key={c.id}>
                              <td><FiUser className="me-1" />{c.nombre_contacto}</td>
                              <td>{c.telefono_contacto ? <><FiPhone className="me-1" />{c.telefono_contacto}</> : '-'}</td>
                              <td>{c.email_contacto ? <><FiMail className="me-1" />{c.email_contacto}</> : '-'}</td>
                              <td className="text-end">
                                {canManageProveedores && (
                                  <>
                                    <Button variant="outline-primary" size="sm" className="me-1" onClick={() => openEditContacto(c)}>
                                      <FiEdit />
                                    </Button>
                                    <Button variant="outline-danger" size="sm" onClick={() => handleDeleteContactoClick(c.id)}>
                                      <FiTrash2 />
                                    </Button>
                                  </>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  )}
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* --- Modales --- */}

      {/* Modal Añadir Proveedor */}
      <Modal show={showAddProveedorModal} onHide={closeModals} backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>Añadir Nuevo Proveedor</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAddProveedorSubmit}>
          <Modal.Body>
            {proveedoresError && <Alert variant="danger">{proveedoresError}</Alert>}
            <Form.Group className="mb-3">
              <Form.Label>Nombre del Proveedor *</Form.Label>
              <Form.Control
                type="text"
                name="nombre"
                value={proveedorFormData.nombre}
                onChange={handleProveedorChange}
                required
                placeholder="Ej: Proveedor de Servicios XYZ"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email General (Opcional)</Form.Label>
              <Form.Control
                type="email"
                name="email_proveedor"
                value={proveedorFormData.email_proveedor}
                onChange={handleProveedorChange}
                placeholder="Ej: info@proveedorxyz.com"
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={closeModals} disabled={isSubmitting}>Cancelar</Button>
            <Button variant="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? <><Spinner size="sm" className="me-2" />Creando...</> : 'Crear Proveedor'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal Editar Proveedor */}
      <Modal show={showEditProveedorModal} onHide={closeModals} backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>Editar Proveedor</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleEditProveedorSubmit}>
          <Modal.Body>
            {proveedoresError && <Alert variant="danger">{proveedoresError}</Alert>}
            <Form.Group className="mb-3">
              <Form.Label>Nombre del Proveedor *</Form.Label>
              <Form.Control
                type="text"
                name="nombre"
                value={proveedorFormData.nombre}
                onChange={handleProveedorChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email General (Opcional)</Form.Label>
              <Form.Control
                type="email"
                name="email_proveedor"
                value={proveedorFormData.email_proveedor}
                onChange={handleProveedorChange}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={closeModals} disabled={isSubmitting}>Cancelar</Button>
            <Button variant="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? <><Spinner size="sm" className="me-2" />Guardando...</> : 'Guardar Cambios'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal Añadir Contacto */}
      <Modal show={showAddContactoModal} onHide={closeModals} backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>Añadir Contacto para {selectedProveedor?.nombre}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAddContactoSubmit}>
          <Modal.Body>
            {contactosError && <Alert variant="danger">{contactosError}</Alert>}
            <Form.Group className="mb-3">
              <Form.Label>Nombre del Contacto *</Form.Label>
              <Form.Control
                type="text"
                name="nombre_contacto"
                value={contactoFormData.nombre_contacto}
                onChange={handleContactoChange}
                required
                placeholder="Ej: Juan Pérez"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Teléfono (Opcional)</Form.Label>
              <Form.Control
                type="tel"
                name="telefono_contacto"
                value={contactoFormData.telefono_contacto}
                onChange={handleContactoChange}
                placeholder="Ej: +58 412 1234567"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email (Opcional)</Form.Label>
              <Form.Control
                type="email"
                name="email_contacto"
                value={contactoFormData.email_contacto}
                onChange={handleContactoChange}
                placeholder="Ej: juan.perez@proveedorxyz.com"
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={closeModals} disabled={isSubmitting}>Cancelar</Button>
            <Button variant="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? <><Spinner size="sm" className="me-2" />Añadiendo...</> : 'Añadir Contacto'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal Editar Contacto */}
      <Modal show={showEditContactoModal} onHide={closeModals} backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>Editar Contacto</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleEditContactoSubmit}>
          <Modal.Body>
            {contactosError && <Alert variant="danger">{contactosError}</Alert>}
            <Form.Group className="mb-3">
              <Form.Label>Nombre del Contacto *</Form.Label>
              <Form.Control
                type="text"
                name="nombre_contacto"
                value={contactoFormData.nombre_contacto}
                onChange={handleContactoChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Teléfono (Opcional)</Form.Label>
              <Form.Control
                type="tel"
                name="telefono_contacto"
                value={contactoFormData.telefono_contacto}
                onChange={handleContactoChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email (Opcional)</Form.Label>
              <Form.Control
                type="email"
                name="email_contacto"
                value={contactoFormData.email_contacto}
                onChange={handleContactoChange}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={closeModals} disabled={isSubmitting}>Cancelar</Button>
            <Button variant="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? <><Spinner size="sm" className="me-2" />Guardando...</> : 'Guardar Cambios'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

    </Container>
  );
};

export default Proveedores;
