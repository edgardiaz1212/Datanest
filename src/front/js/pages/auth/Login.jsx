import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Context } from "../../store/appContext";
import { FiLogIn } from "react-icons/fi";

const Login = () => {
  const { store, actions } = useContext(Context);
  const { loading, error, isAuthenticated } = store;
  const { loginTrackerUser, clearAuthError } = actions;

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    if (clearAuthError) clearAuthError();
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [clearAuthError, isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await loginTrackerUser(identifier, password);
    if (success) {
      navigate("/dashboard");
    }
  };

  // Envolvemos todo en un contenedor y sistema de rejilla
  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6 col-xl-5">
          {/* Tu tarjeta de login original va aquí dentro */}
          <div className="card auth-form shadow">
            <div className="card-body">
              <div className="card-title text-center mb-4">
                <h2>Iniciar Sesión</h2>
                <small className="text-muted">Sistema de Monitoreo Infra</small>
              </div>

              {error && (
                <div
                  className="alert alert-danger alert-dismissible fade show"
                  role="alert"
                >
                  {error}
                  <button
                    type="button"
                    className="btn-close"
                    onClick={clearAuthError}
                    aria-label="Close"
                  ></button>
                </div>
              )}

              <form noValidate onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="formIdentifier" className="form-label">
                    Usuario o Email
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="formIdentifier"
                    placeholder="Ingrese su usuario o email"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                  />
                  <div className="invalid-feedback">
                    Por favor ingrese su nombre de usuario o email.
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="formPassword" className="form-label">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="formPassword"
                    placeholder="Ingrese su contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <div className="invalid-feedback">
                    Por favor ingrese su contraseña.
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100 mt-3"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Iniciando sesión...
                    </>
                  ) : (
                    <>
                      <FiLogIn className="me-2" /> Iniciar Sesión
                    </>
                  )}
                </button>
              </form>

              <div className="text-center mt-3">
                <p>
                  ¿No tienes una cuenta? <Link to="/register">Regístrate</Link>
                </p>
              </div>
            </div>
          </div>
          {/* Fin de la tarjeta de login */}
        </div>{" "}
        {/* Cierre de col-md-6 */}
      </div>{" "}
      {/* Cierre de row */}
    </div> // Cierre de container
  );
};

export default Login;
