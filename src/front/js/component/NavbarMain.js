import React from "react";
import { Link, useLocation } from "react-router-dom";
import logo from '../../img/CDHLogo.jpg';

export const NavbarMain = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <>
      <header id="header" className="header">
        {/* No es estrictamente necesario role="navigation" en <nav> */}
        <nav className="navbar navbar-expand-md navbar-dark bg-dark main-nav">
          {/* Quitamos position-relative si no es necesario para otra cosa */}
          <div className="container-fluid d-flex justify-content-between align-items-center">

            {/* Ajustamos el brand: usamos d-flex y ocultamos texto en pantallas extra pequeñas */}
            <Link to="/" className="navbar-brand text-white d-flex align-items-center py-0 me-auto">
              <img
                className="logo-icon d-inline-block align-top" // Clase estándar para alinear imágenes en navbars
                src={logo}
                alt="Logo CDH" // Alt text más descriptivo
                style={{ height: '38px', marginRight: '8px' }} // Un poco menos de margen quizás
              />
              <span className="text">
                {/* Ocultamos "Infraestructura" en 'xs', lo mostramos desde 'sm' hacia arriba */}
                <span className="d-none d-sm-inline">Infraestructura </span>
                <span className="highlight">DCCE</span>
              </span>
            </Link>

            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarNavMain"
              aria-controls="navbarNavMain"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>

            <div className="collapse navbar-collapse" id="navbarNavMain">
              <ul className="navbar-nav ms-auto">
                <li className="nav-item">
                  <Link to="/forba7d" className="nav-link text-white">
                    LLenado de Planilla Colocacion
                  </Link>
                </li>
                {currentPath !== '/forba7d' && (
                  <li className="nav-item">
                    <Link to="/login" className="nav-link text-white">
                      Ingresar
                    </Link>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </nav>
      </header>
    </>
  );
};
