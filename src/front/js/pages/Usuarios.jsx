import React, { useState, useEffect, useContext } from 'react';
import { Card, Table, Button, Modal, Form, Row, Col, Spinner, Alert, Badge, Tabs, Tab } from 'react-bootstrap';
import { FiEdit, FiCheckCircle, FiUserX, FiUser, FiUsers, FiMail, FiCalendar, FiClock, FiShield, FiCheck, FiX, FiPlus, FiMap, FiUpload, FiTrash2 } from 'react-icons/fi';
import { Context } from '../store/appContext';
import ProtectedImage from '../component/ProtectedImage.jsx';

const Usuarios = () => {


  const { store, actions } = useContext(Context);
  // Destructure relevant state and actions

  const {
    trackerUser: currentUser,
    trackerUsers,
    loading,
    error,
    mapasPisos,
    mapasPisosLoading,
    mapasPisosError
  } = store;
  const {
    fetchTrackerUsers,
    updateTrackerUser,
    addTrackerUserByAdmin,
    clearAuthError,
    fetchMapasPisos,
    uploadMapaPiso,
    deleteMapaPiso
  } = actions;

  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    rol: 'operador',
    activo: true
  });
  const [newUserData, setNewUserData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    username: '',
    password: '',
    rol: 'operador'
  });
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New state for map management
  const [mapaForm, setMapaForm] = useState({ nombre_piso: '', file: null });
  const [isUploadingMap, setIsUploadingMap] = useState(false);
  const [mapError, setMapError] = useState('');

  // Determine user permissions based on the logged-in user from the store
  const isAdmin = currentUser?.rol === 'admin';
  const canAdd = currentUser?.rol === 'admin' || currentUser?.rol === 'supervisor';


  useEffect(() => {
    if (isAdmin) {
      fetchTrackerUsers(); // Call the Flux action
      fetchMapasPisos();
    }
    // Clear any previous auth errors when mounting
    if (clearAuthError) clearAuthError();
  }, [isAdmin, fetchTrackerUsers, clearAuthError]); // Add fetchTrackerUsers and clearAuthError to dependencies
  

  // Handle changes in the EDIT form
  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditFormData(prevData => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle changes in the ADD form
  const handleNewUserChange = (e) => {
    const { name, value } = e.target;
    setNewUserData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  // Open EDIT modal
  const handleEdit = (usuario) => {
    setEditFormData({
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      email: usuario.email,
      rol: usuario.rol,
      activo: usuario.activo
    });
    setSelectedUserId(usuario.id);
    setShowEditModal(true);
    setShowAddModal(false);
    if (clearAuthError) clearAuthError(); // Clear errors when opening modal
  };

  // Open ADD modal
  const handleAddUser = () => {
    setNewUserData({ // Reset form
      nombre: '',
      apellido: '',
      email: '',
      username: '',
      password: '',
      rol: 'operador'
    });
    setShowAddModal(true);
    setShowEditModal(false);
    if (clearAuthError) clearAuthError(); // Clear errors when opening modal
  };

  // Toggle active status (calls Flux action)
  const handleToggleActivo = async (id, currentStatus) => {
    if (id === currentUser?.id) return; // Prevent self-deactivation

    // Call the update action with only the 'activo' field changed
    // La acción `updateTrackerUser` ya actualiza el estado localmente.
    // No se necesita hacer nada más aquí, el componente se re-renderizará solo.
    await updateTrackerUser(id, { activo: !currentStatus });
 
  };

  // Submit EDIT form (calls Flux action)
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUserId) return;
    setIsSubmitting(true); // Indicate submission start

    const success = await updateTrackerUser(selectedUserId, editFormData);

    setIsSubmitting(false); // Indicate submission end
    if (success) {
      setShowEditModal(false); // Close modal on success
    }
    // Error display is handled by the global 'error' state
  };

  // Submit ADD form (calls Flux action)
  const handleNewUserSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true); // Indicate submission start

    const success = await addTrackerUserByAdmin(newUserData);

    setIsSubmitting(false); // Indicate submission end
    if (success) {
      setShowAddModal(false); // Close modal on success
      
    }
    // Error display is handled by the global 'error' state
  };

  // New handlers for map management
  const handleMapaFormChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'file') {
      setMapaForm(prev => ({ ...prev, file: files[0] }));
    } else {
      setMapaForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleMapaFormSubmit = async (e) => {
    e.preventDefault();
    if (!mapaForm.nombre_piso || !mapaForm.file) {
      setMapError('El nombre del piso y el archivo del mapa son requeridos.');
      return;
    }
    setMapError('');
    setIsUploadingMap(true);
    const formData = new FormData();
    formData.append('nombre_piso', mapaForm.nombre_piso);
    formData.append('file', mapaForm.file);

    const success = await uploadMapaPiso(formData);
    if (success) {
      setMapaForm({ nombre_piso: '', file: null }); // Reset form
      e.target.reset(); // Reset file input
    }
    setIsUploadingMap(false);
  };

  const handleDeleteMapa = async (mapaId) => {
    if (window.confirm('¿Está seguro de que desea eliminar este mapa? Esta acción no se puede deshacer.')) {
      await deleteMapaPiso(mapaId);
    }
  };

  // Format date function (remains the same)
  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return 'N/A';
    try {
      const fecha = new Date(fechaStr);
      if (isNaN(fecha.getTime())) return 'Fecha inválida';
      return fecha.toLocaleDateString() + ' ' + fecha.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      console.error("Error formatting date:", fechaStr, e);
      return 'Error fecha';
    }
  };

  // Get badge color based on role (remains the same)
  const getRolBadgeColor = (rol) => {
    switch (rol?.toLowerCase()) {
      case 'admin': return 'danger';
      case 'supervisor': return 'warning';
      case 'operador': return 'info';
      default: return 'secondary';
    }
  };

  // --- Render Logic ---

  // Access Denied message if not admin
  if (!isAdmin) {
    return (
      <div className="container mt-4">
        
        <h1>Configuración</h1>
        <Alert variant="warning">
          <Alert.Heading>Acceso Restringido</Alert.Heading>
          <p>Solo los administradores pueden acceder a esta sección.</p>
        </Alert>
      </div>
    );
  }

  // Main component render for Admin
  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Gestión de Usuarios</h1>
        {canAdd && (
          <Button variant="primary" onClick={handleAddUser}>
            <FiPlus className="me-2" /> Agregar Usuario
          </Button>
        )}
      </div>
      <div className="d-flex justify-content-between align-items-center mb-4"><h1>Configuración del Sistema</h1></div>

      {/* Global Error Display */}
      {error && (
        <Alert variant="danger" dismissible onClose={clearAuthError}>
          {error}
        </Alert>
      )}
      <Tabs defaultActiveKey="usuarios" id="config-tabs" className="mb-3 nav-pills">
        <Tab eventKey="usuarios" title={<><FiUsers className="me-2" />Gestión de Usuarios</>}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4>Usuarios del Sistema</h4>
            {canAdd && (
              <Button variant="primary" onClick={handleAddUser}>
                <FiPlus className="me-2" /> Agregar Usuario
              </Button>
            )}
          </div>
          {error && (<Alert variant="danger" dismissible onClose={clearAuthError}>{error}</Alert>)}
          <Card className="dashboard-card mb-4">
            <Card.Header><h5 className="mb-0">Información de Roles</h5></Card.Header>
            <Card.Body>
              <Alert variant="info" className="mb-0">
                <div className="d-flex align-items-center">
                  <FiUsers size={30} className="me-3 flex-shrink-0" />
                  <div>
                    <ul className="mb-0 small">
                      <li><strong>Administrador:</strong> Acceso completo, incluida gestión de usuarios y mapas.</li>
                      <li><strong>Supervisor:</strong> Gestiona equipos y puede agregar operadores.</li>
                      <li><strong>Operador:</strong> Registra lecturas y visualiza datos.</li>
                    </ul>
                  </div>
                </div>
              </Alert>
            </Card.Body>
          </Card>
          <Card className="dashboard-card">
            <Card.Header><h5 className="mb-0">Lista de Usuarios</h5></Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center p-5"><Spinner animation="border" variant="primary" /><p className="mt-3">Cargando usuarios...</p></div>
              ) : !trackerUsers || trackerUsers.length === 0 ? (
                <div className="text-center p-5">
                  <FiUsers size={50} className="text-muted mb-3" />
                  <h4>No hay usuarios registrados</h4>
                  {canAdd && (<Button variant="primary" className="mt-3" onClick={handleAddUser}><FiPlus className="me-2" /> Agregar Usuario</Button>)}
                </div>
              ) : (
                <div className="table-responsive">
                  <Table hover responsive><thead><tr><th>ID</th><th>Usuario</th><th>Nombre Completo</th><th>Email</th><th>Rol</th><th>Estado</th><th>Registro</th><th>Última Conexión</th><th className="text-end">Acciones</th></tr></thead><tbody>
                    {trackerUsers.map(usuario => (
                      <tr key={usuario.id} className={!usuario.activo ? 'text-muted' : ''}>
                        <td>{usuario.id}</td>
                        <td><FiUser className="me-1" />{usuario.username}</td>
                        <td>{usuario.nombre} {usuario.apellido}</td>
                        <td><FiMail className="me-1" />{usuario.email}</td>
                        <td><Badge bg={getRolBadgeColor(usuario.rol)}><FiShield className="me-1" />{usuario.rol?.charAt(0).toUpperCase() + usuario.rol?.slice(1)}</Badge></td>
                        <td>{usuario.activo ? (<Badge bg="success"><FiCheck className="me-1" /> Activo</Badge>) : (<Badge bg="secondary"><FiX className="me-1" /> Inactivo</Badge>)}</td>
                        <td><FiCalendar className="me-1" />{formatearFecha(usuario.fecha_registro).split(' ')[0]}</td>
                        <td><FiClock className="me-1" />{formatearFecha(usuario.ultima_conexion)}</td>
                        <td className="text-end">
                          <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleEdit(usuario)} disabled={usuario.id === currentUser?.id} title={usuario.id === currentUser?.id ? 'No puede editar su propio usuario' : 'Editar usuario'}><FiEdit /></Button>
                          <Button variant={usuario.activo ? 'outline-danger' : 'outline-success'} size="sm" onClick={() => handleToggleActivo(usuario.id, usuario.activo)} disabled={usuario.id === currentUser?.id} title={usuario.id === currentUser?.id ? 'No puede cambiar el estado de su propio usuario' : (usuario.activo ? 'Desactivar usuario' : 'Activar usuario')}>{usuario.activo ? <FiUserX /> : <FiCheckCircle />}</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody></Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Tab>
        <Tab eventKey="mapas" title={<><FiMap className="me-2" />Gestión de Pisos</>}>
          <Card className="dashboard-card">
            <Card.Header><h5 className="mb-0">Mapas de Pisos</h5></Card.Header>
            <Card.Body>
              <Card className="mb-4 bg-light border">
                <Card.Body>
                  <Card.Title>Agregar o Actualizar Mapa de Piso</Card.Title>
                  <Card.Text className="small text-muted">
                    Ingrese el nombre de un piso y seleccione un archivo de imagen (.jpg, .png) para subirlo como mapa. Si el nombre del piso ya existe, se reemplazará el mapa existente.
                  </Card.Text>
                  <Form onSubmit={handleMapaFormSubmit}>
                    {mapasPisosError && <Alert variant="danger">{mapasPisosError}</Alert>}
                    {mapError && <Alert variant="danger">{mapError}</Alert>}
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Nombre del Piso</Form.Label>
                          <Form.Control type="text" name="nombre_piso" onChange={handleMapaFormChange} required placeholder="Ej: Planta Baja, Piso 1, Azotea" />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Archivo de Mapa (Imagen)</Form.Label>
                          <Form.Control type="file" name="file" onChange={handleMapaFormChange} required accept="image/png, image/jpeg, image/jpg" />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Button variant="primary" type="submit" disabled={isUploadingMap}>
                      {isUploadingMap ? <><Spinner size="sm" className="me-2" />Subiendo...</> : <><FiUpload className="me-2" />Subir Mapa</>}
                    </Button>
                  </Form>
                </Card.Body>
              </Card>

      <h5>Mapas Existentes</h5>
              {mapasPisosLoading ? (
                
                <div className="text-center p-5"><Spinner animation="border" /></div>
              ) : mapasPisos.length === 0 ? (
                <Alert variant="secondary">No hay mapas cargados.</Alert>
              ) : (
                <Row xs={1} md={2} lg={3} className="g-4">
                  {mapasPisos.map(mapa => (
                    <Col key={mapa.id}>
                      <Card className="h-100">
                        <Card.Header className="fw-bold">{mapa.nombre_piso}</Card.Header>
                        <div style={{ height: '200px', overflow: 'hidden' }}>
                          <ProtectedImage src={mapa.url_descarga} alt={`Mapa de ${mapa.nombre_piso}`} className="card-img-top" style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
                        </div>
                        <Card.Body className="d-flex flex-column">
                          <Card.Text className="small text-muted">
                            Archivo: {mapa.nombre_archivo_original}<br />
                            Cargado: {formatearFecha(mapa.fecha_carga)}
                          </Card.Text>
                          <Button variant="outline-danger" size="sm" className="mt-auto" onClick={() => handleDeleteMapa(mapa.id)}>
                            <FiTrash2 className="me-1" /> Eliminar
                          </Button>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              )}

     
    
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>

      {/* EDIT Modal */}
      <Modal show={showEditModal} onHide={() => !isSubmitting && setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Editar Usuario</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleEditSubmit}>
          <Modal.Body>
            {/* Global Error Display within Modal */}
            {error && <Alert variant="danger">{error}</Alert>}
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nombre</Form.Label>
                  <Form.Control type="text" name="nombre" value={editFormData.nombre || ''} onChange={handleEditChange} required />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Apellido</Form.Label>
                  <Form.Control type="text" name="apellido" value={editFormData.apellido || ''} onChange={handleEditChange} required />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" name="email" value={editFormData.email || ''} onChange={handleEditChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Rol</Form.Label>
              <Form.Select name="rol" value={editFormData.rol || 'operador'} onChange={handleEditChange} required>
                <option value="admin">Administrador</option>
                <option value="supervisor">Supervisor</option>
                <option value="operador">Operador</option>
              </Form.Select>
              <Form.Text muted>El rol determina los permisos.</Form.Text>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Check type="checkbox" label="Usuario activo" name="activo" checked={editFormData.activo ?? false} onChange={handleEditChange} />
              <Form.Text muted>Usuarios inactivos no pueden iniciar sesión.</Form.Text>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)} disabled={isSubmitting}>Cancelar</Button>
            <Button variant="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? <><Spinner size="sm" className="me-2" />Guardando...</> : 'Guardar Cambios'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* ADD Modal */}
      <Modal show={showAddModal} onHide={() => !isSubmitting && setShowAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Agregar Nuevo Usuario</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleNewUserSubmit}>
          <Modal.Body>
            {/* Global Error Display within Modal */}
            {error && <Alert variant="danger">{error}</Alert>}
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nombre</Form.Label>
                  <Form.Control type="text" name="nombre" value={newUserData.nombre} onChange={handleNewUserChange} required placeholder="Ingrese el nombre" />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Apellido</Form.Label>
                  <Form.Control type="text" name="apellido" value={newUserData.apellido} onChange={handleNewUserChange} required placeholder="Ingrese el apellido" />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" name="email" value={newUserData.email} onChange={handleNewUserChange} required placeholder="ejemplo@dominio.com" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Nombre de Usuario</Form.Label>
              <Form.Control type="text" name="username" value={newUserData.username} onChange={handleNewUserChange} required placeholder="Elija un nombre de usuario" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Contraseña</Form.Label>
              <Form.Control type="password" name="password" value={newUserData.password} onChange={handleNewUserChange} required placeholder="Ingrese una contraseña segura" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Rol</Form.Label>
              <Form.Select name="rol" value={newUserData.rol} onChange={handleNewUserChange} required>
                {isAdmin && <option value="admin">Administrador</option>}
                {isAdmin && <option value="supervisor">Supervisor</option>}
                <option value="operador">Operador</option>
              </Form.Select>
              <Form.Text muted>Seleccione el rol inicial.</Form.Text>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAddModal(false)} disabled={isSubmitting}>Cancelar</Button>
            <Button variant="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? <><Spinner size="sm" className="me-2" />Creando...</> : 'Crear Usuario'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

    </div>
  );
};

export default Usuarios;
