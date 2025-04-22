import React from "react";
// 1. Importa el hook useLocation
import { Link, useLocation } from "react-router-dom";
import logo from '../../img/CDHLogo.jpg';

export const NavbarMain = () => {
  // 2. Obtén el objeto de ubicación actual
  const location = useLocation();
  // 3. Extrae el pathname (la ruta actual, ej: "/forba7d")
  const currentPath = location.pathname;

  return (
    <>
      <header id="header" className="header">
        <nav className="navbar navbar-expand-md navbar-dark bg-dark main-nav" role="navigation">
          <div className="container-fluid position-relative d-flex justify-content-between align-items-center">

            <Link to="/" className="logo navbar-brand text-white me-auto d-inline-flex align-items-center py-0">
              <img className="logo-icon" src={logo} alt="icon" style={{ height: '38px', marginRight: '10px' }} />
              <span className="text">Infraestructura <span className="highlight">DCCE</span></span>
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
                {/* 4. Renderizado condicional: Muestra este <li> solo si la ruta NO es /forba7d */}
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
