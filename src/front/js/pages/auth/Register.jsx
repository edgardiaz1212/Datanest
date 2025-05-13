import React, { useState, useEffect, useContext } from 'react';
// Asegúrate de tener react-bootstrap instalado y el CSS importado en tu app
import { Form, Button, Card, Alert, Row, Col } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
// Importa el Contexto de Flux
import { Context } from '../../store/appContext';
import { FiUserPlus } from 'react-icons/fi';

const Register = () => { // Quitamos React.FC
  // Obtenemos store y actions del contexto
  const { store, actions } = useContext(Context);
  const { loading, error, isAuthenticated } = store;
  // Asegúrate que la acción se llame 'registerTrackerUser' en tu flux.js
  const { registerTrackerUser, clearAuthError } = actions;

  // Estado local para los datos del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [validated, setValidated] = useState(false); // Para validación de Bootstrap
  const [passwordError, setPasswordError] = useState(null); // Error específico de contraseña

  const navigate = useNavigate();

  useEffect(() => {
    // Limpiar error al montar
    if (clearAuthError) clearAuthError();

    // Si ya está autenticado, redirigir
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [clearAuthError, isAuthenticated, navigate]);

  // Manejador para cambios en los inputs
  const handleChange = (e) => { // Quitamos tipo de evento
    const { name, value } = e.target;
    setFormData(prevData => ({ // Usamos función para actualizar estado basado en el previo
      ...prevData,
      [name]: value
    }));

    // Verificar coincidencia de contraseñas mientras se escribe
    if (name === 'password' || name === 'confirmPassword') {
      const currentPassword = name === 'password' ? value : formData.password;
      const currentConfirmPassword = name === 'confirmPassword' ? value : formData.confirmPassword;

      if (currentConfirmPassword && currentPassword !== currentConfirmPassword) {
        setPasswordError('Las contraseñas no coinciden');
      } else {
        setPasswordError(null);
      }
    }
  };

  // Manejador para el envío del formulario
  const handleSubmit = async (e) => { // Quitamos tipo de evento
    e.preventDefault();
    const form = e.currentTarget;

    // Validar formulario con Bootstrap y error de contraseña
    if (form.checkValidity() === false || passwordError) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    setValidated(true); // Marcar como validado si pasa la comprobación inicial

    // Doble verificación de contraseñas antes de enviar
    if (formData.password !== formData.confirmPassword) {
      setPasswordError('Las contraseñas no coinciden');
      return;
    }

    // Llamar a la acción de registro desde Flux
    const success = await registerTrackerUser({
      nombre: formData.nombre,
      apellido: formData.apellido,
      email: formData.email,
      username: formData.username,
      password: formData.password
      // No enviamos confirmPassword al backend
    });

    if (success) {
      // Redirigir al login con un mensaje de éxito (opcional)
      navigate('/login', { state: { registroExitoso: true } });
    }
    // El manejo de errores (mostrar Alert) se basa en el 'error' del store
  };

  // Estructura del formulario usando react-bootstrap
  return (
    // Contenedor para centrar y limitar ancho (opcional, como en Login)
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-7 col-xl-6"> {/* Ajusta el ancho si es necesario */}

          <Card className="auth-form shadow">
            <Card.Body>
              <Card.Title className="text-center mb-4">
                <h2>Crear Cuenta</h2>
                <small className="text-muted">Sistema de Monitoreo Datanest</small>
              </Card.Title>

              {/* Muestra errores globales desde el store */}
              {error && (
                <Alert variant="danger" dismissible onClose={clearAuthError}>
                  {error}
                </Alert>
              )}

              <Form noValidate validated={validated} onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="formNombre">
                      <Form.Label>Nombre</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Ingrese su nombre"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        Por favor ingrese su nombre.
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="formApellido">
                      <Form.Label>Apellido</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Ingrese su apellido"
                        name="apellido"
                        value={formData.apellido}
                        onChange={handleChange}
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        Por favor ingrese su apellido.
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3" controlId="formEmail">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Ingrese su email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    Por favor ingrese un email válido.
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3" controlId="formUsername">
                  <Form.Label>Nombre de usuario</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Elija un nombre de usuario"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    Por favor elija un nombre de usuario.
                  </Form.Control.Feedback>
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="formPassword">
                      <Form.Label>Contraseña</Form.Label>
                      <Form.Control
                        type="password"
                        placeholder="Ingrese su contraseña"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        // Marca como inválido si hay error de coincidencia
                        isInvalid={!!passwordError}
                      />
                      <Form.Control.Feedback type="invalid">
                        Por favor ingrese una contraseña.
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="formConfirmPassword">
                      <Form.Label>Confirmar contraseña</Form.Label>
                      <Form.Control
                        type="password"
                        placeholder="Confirme su contraseña"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        // Marca como inválido si hay error de coincidencia
                        isInvalid={!!passwordError}
                      />
                      {/* Muestra el error de contraseña o el mensaje por defecto */}
                      <Form.Control.Feedback type="invalid">
                        {passwordError || 'Por favor confirme su contraseña.'}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Button
                  variant="primary"
                  type="submit"
                  className="w-100 mt-3"
                  disabled={loading} // Deshabilitar con estado de carga global
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Registrando...
                    </>
                  ) : (
                    <>
                      <FiUserPlus className="me-2" /> Crear Cuenta
                    </>
                  )}
                </Button>
              </Form>

              <div className="text-center mt-3">
                <p>
                  ¿Ya tienes una cuenta? <Link to="/login">Iniciar sesión</Link>
                </p>
              </div>
            </Card.Body>
          </Card>

        </div>
      </div>
    </div>
  );
};

export default Register;
