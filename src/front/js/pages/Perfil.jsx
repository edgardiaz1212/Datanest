// src/front/js/pages/Perfil.jsx

import React, { useState, useContext, useEffect } from 'react';
import { Context } from '../store/appContext';
import { Container, Card, Form, Button, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { FiUser, FiMail, FiCalendar, FiClock, FiEdit, FiSave, FiXCircle, FiLock, FiKey } from 'react-icons/fi'; // Añadido FiLock, FiKey

const Perfil = () => {
  const { store, actions } = useContext(Context);
  const { trackerUser: user, loading, error } = store;

  // --- State para Edición de Perfil ---
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
  });
  const [localError, setLocalError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // --- State para Cambio de Contraseña ---
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Effect 1: Load user data into form
  useEffect(() => {
    if (user) {
      setFormData({
        nombre: user.nombre || '',
        apellido: user.apellido || '',
        email: user.email || '',
      });
    }
    setLocalError('');
    setSuccessMessage('');
  }, [user, isEditing]);

  // Effect 2: Clear global error on mount/unmount
  useEffect(() => {
    actions.clearAuthError();
    return () => {
      actions.clearAuthError();
    };
  }, []);

  // --- Handlers para Edición de Perfil ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setLocalError('');
    setSuccessMessage('');
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    setLocalError('');
    setSuccessMessage('');
    // Resetear también errores de contraseña al cancelar edición general
    setPasswordError('');
    setPasswordSuccess('');
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    setLocalError('');
    setSuccessMessage('');

    if (!formData.nombre || !formData.apellido || !formData.email) {
      setLocalError("Nombre, apellido y email son requeridos.");
      return;
    }

    const success = await actions.updateCurrentUserProfile(formData);

    if (success) {
      setIsEditing(false);
      setSuccessMessage("Perfil actualizado correctamente.");
    } else {
      setLocalError(store.error || "No se pudo actualizar el perfil.");
    }
  };

  // --- Handlers para Cambio de Contraseña ---
  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    setPasswordError(''); // Limpiar error al escribir
    setPasswordSuccess(''); // Limpiar éxito al escribir
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    const { currentPassword, newPassword, confirmPassword } = passwordData;

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Todos los campos de contraseña son requeridos.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("La nueva contraseña y la confirmación no coinciden.");
      return;
    }
    if (newPassword.length < 6) { // Ejemplo de validación simple
        setPasswordError("La nueva contraseña debe tener al menos 6 caracteres.");
        return;
    }

    setPasswordLoading(true);
    const success = await actions.changeCurrentUserPassword({
      current_password: currentPassword,
      new_password: newPassword,
    });
    setPasswordLoading(false);

    if (success) {
      setPasswordSuccess("Contraseña actualizada correctamente.");
      // Limpiar campos de contraseña después del éxito
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } else {
      // El error se obtiene del store.error o se puede poner uno genérico
      setPasswordError(store.error || "No se pudo cambiar la contraseña.");
    }
  };

  // --- Renderizado ---
  if (!user) {
    return <div className="text-center p-5"><Spinner animation="border" /> Cargando perfil...</div>;
  }

  const formatDate = (isoString) => { /* ... sin cambios ... */ };
  const formatDateTime = (isoString) => { /* ... sin cambios ... */ };

  return (
    <Container className="mt-4 mb-5"> {/* Añadido mb-5 para espacio extra */}
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          {/* --- Card de Datos del Perfil --- */}
          <Card className="shadow-sm mb-4"> {/* Añadido mb-4 */}
            <Card.Header as="h4" className="d-flex justify-content-between align-items-center">
              Perfil de Usuario
              {!isEditing ? (
                <Button variant="outline-primary" size="sm" onClick={handleEditToggle} disabled={loading || passwordLoading}>
                  <FiEdit className="me-1" /> Editar
                </Button>
              ) : (
                 <Button variant="outline-secondary" size="sm" onClick={handleEditToggle} disabled={loading || passwordLoading}>
                   <FiXCircle className="me-1" /> Cancelar
                 </Button>
              )}
            </Card.Header>
            <Card.Body>
              {successMessage && <Alert variant="success">{successMessage}</Alert>}
              {localError && <Alert variant="danger">{localError}</Alert>}
              {error && !localError && !passwordError && <Alert variant="danger">{error}</Alert>} {/* Mostrar error global solo si no hay otros */}

              <Form onSubmit={handleSaveChanges}>
                {/* ... Campos del perfil (nombre, apellido, email, etc.) sin cambios ... */}
                 <Row>
                   <Col md={6}>
                     <Form.Group className="mb-3" controlId="formNombre">
                       <Form.Label><FiUser className="me-1" /> Nombre</Form.Label>
                       <Form.Control
                         type="text" name="nombre" value={formData.nombre}
                         onChange={handleInputChange} readOnly={!isEditing} required disabled={loading || passwordLoading}
                       />
                     </Form.Group>
                   </Col>
                   <Col md={6}>
                     <Form.Group className="mb-3" controlId="formApellido">
                       <Form.Label>Apellido</Form.Label>
                       <Form.Control
                         type="text" name="apellido" value={formData.apellido}
                         onChange={handleInputChange} readOnly={!isEditing} required disabled={loading || passwordLoading}
                       />
                     </Form.Group>
                   </Col>
                 </Row>

                 <Form.Group className="mb-3" controlId="formEmail">
                   <Form.Label><FiMail className="me-1" /> Email</Form.Label>
                   <Form.Control
                     type="email" name="email" value={formData.email}
                     onChange={handleInputChange} readOnly={!isEditing} required disabled={loading || passwordLoading}
                   />
                 </Form.Group>

                 <Form.Group className="mb-3" controlId="formUsername">
                   <Form.Label>Username</Form.Label>
                   <Form.Control type="text" value={user.username || 'N/A'} readOnly disabled />
                 </Form.Group>

                 <Form.Group className="mb-3" controlId="formRol">
                   <Form.Label>Rol</Form.Label>
                   <Form.Control type="text" value={user.rol || 'N/A'} readOnly disabled className="text-capitalize" />
                 </Form.Group>

                  <Row>
                    <Col md={6}>
                       <Form.Group className="mb-3" controlId="formFechaRegistro">
                         <Form.Label><FiCalendar className="me-1" /> Fecha de Registro</Form.Label>
                         <Form.Control type="text" value={formatDate(user.fecha_registro)} readOnly disabled />
                       </Form.Group>
                    </Col>
                    <Col md={6}>
                       <Form.Group className="mb-3" controlId="formUltimaConexion">
                         <Form.Label><FiClock className="me-1" /> Última Conexión</Form.Label>
                         <Form.Control type="text" value={formatDateTime(user.ultima_conexion)} readOnly disabled />
                       </Form.Group>
                    </Col>
                  </Row>

                {isEditing && (
                  <div className="d-grid">
                    <Button variant="success" type="submit" disabled={loading || passwordLoading}>
                      {loading ? (
                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-1" />
                      ) : (
                        <FiSave className="me-1" />
                      )}
                      Guardar Cambios de Perfil
                    </Button>
                  </div>
                )}
              </Form>
            </Card.Body>
          </Card>

          {/* --- Card de Cambio de Contraseña --- */}
          <Card className="shadow-sm">
            <Card.Header as="h5">
              Cambiar Contraseña
            </Card.Header>
            <Card.Body>
              {passwordSuccess && <Alert variant="success">{passwordSuccess}</Alert>}
              {passwordError && <Alert variant="danger">{passwordError}</Alert>}
              {/* Mostrar error global si es relevante para contraseña y no hay error local de contraseña */}
              {error && !localError && !passwordError && <Alert variant="danger">{error}</Alert>}

              <Form onSubmit={handleChangePassword}>
                <Form.Group className="mb-3" controlId="formCurrentPassword">
                  <Form.Label><FiLock className="me-1" /> Contraseña Actual</Form.Label>
                  <Form.Control
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordInputChange}
                    required
                    disabled={passwordLoading || isEditing} // Deshabilitar si se está editando el perfil
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formNewPassword">
                  <Form.Label><FiKey className="me-1" /> Nueva Contraseña</Form.Label>
                  <Form.Control
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordInputChange}
                    required
                    disabled={passwordLoading || isEditing}
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formConfirmPassword">
                  <Form.Label><FiKey className="me-1" /> Confirmar Nueva Contraseña</Form.Label>
                  <Form.Control
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordInputChange}
                    required
                    disabled={passwordLoading || isEditing}
                  />
                </Form.Group>

                <div className="d-grid">
                  <Button variant="warning" type="submit" disabled={passwordLoading || isEditing}>
                    {passwordLoading ? (
                      <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-1" />
                    ) : (
                      <FiSave className="me-1" />
                    )}
                    Actualizar Contraseña
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Perfil;
