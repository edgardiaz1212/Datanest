import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
// Asegúrate que useAppContext esté disponible y funcione en tu contexto JS
import { useAppContext } from '../../context/AppContext'; 
import { FiLogIn } from 'react-icons/fi';

const Login = () => { // Quitamos React.FC
  const [identifier, setIdentifier] = useState(''); // Cambiado de username a identifier
  const [password, setPassword] = useState('');
  const [validated, setValidated] = useState(false);
  // Asume que tu AppContext provee estas funciones/estados adaptados para JS
  const { login, loading, error, clearError, isAuthenticated } = useAppContext(); 
  const navigate = useNavigate();

  useEffect(() => {
    // Limpiar error al montar el componente
    if (clearError) clearError(); // Verifica si clearError existe antes de llamar

    // Si ya está autenticado, redirigir al dashboard
    if (isAuthenticated) {
      navigate('/dashboard');
    }
    // Asegúrate que las dependencias sean correctas para tu AppContext JS
  }, [clearError, isAuthenticated, navigate]); 

  const handleSubmit = async (e) => { // Quitamos el tipo del evento
    e.preventDefault();
    const form = e.currentTarget;

    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    setValidated(true);

    // Llama a la función login del contexto, pasando identifier y password
    // Asume que la función login en tu AppContext JS ahora usa 'identifier'
    const success = await login(identifier, password); 
    if (success) {
      navigate('/dashboard'); // O a donde necesites redirigir
    }
  };

  return (
    <Card className="auth-form shadow">
      <Card.Body>
        <Card.Title className="text-center mb-4">
          <h2>Iniciar Sesión</h2>
          {/* Puedes ajustar este subtítulo si es necesario */}
          <small className="text-muted">Sistema de Monitoreo AC</small> 
        </Card.Title>

        {error && (
          <Alert variant="danger" dismissible onClose={clearError}>
            {error}
          </Alert>
        )}

        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          {/* Cambiado controlId y Label/Placeholder para reflejar 'identifier' */}
          <Form.Group className="mb-3" controlId="formIdentifier"> 
            <Form.Label>Usuario o Email</Form.Label> 
            <Form.Control
              type="text"
              placeholder="Ingrese su usuario o email" 
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
            <Form.Control.Feedback type="invalid">
              Por favor ingrese su nombre de usuario o email.
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3" controlId="formPassword">
            <Form.Label>Contraseña</Form.Label>
            <Form.Control
              type="password"
              placeholder="Ingrese su contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Form.Control.Feedback type="invalid">
              Por favor ingrese su contraseña.
            </Form.Control.Feedback>
          </Form.Group>

          <Button
            variant="primary"
            type="submit"
            className="w-100 mt-3"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Iniciando sesión...
              </>
            ) : (
              <>
                <FiLogIn className="me-2" /> Iniciar Sesión
              </>
            )}
          </Button>
        </Form>

        <div className="text-center mt-3">
          <p>
            {/* Asegúrate que la ruta '/register' corresponda a tu componente de registro */}
            ¿No tienes una cuenta? <Link to="/register">Regístrate</Link> 
          </p>
        </div>
      </Card.Body>
    </Card>
  );
};

export default Login;
