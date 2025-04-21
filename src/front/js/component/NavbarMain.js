import React from "react";
import { Link } from "react-router-dom";
import logo from '../../img/CDHLogo.jpg';

export const NavbarMain = () => {
  return (
    <>
      <header id="header" className="header">
        {/* Añadimos 'navbar' para estilos base y 'navbar-dark bg-dark' para un tema oscuro, ajusta si usas otro tema */}
        <nav className="navbar navbar-expand-md navbar-dark bg-dark main-nav" role="navigation">
          {/* Añadimos clases Flexbox de Bootstrap: d-flex, justify-content-between, align-items-center */}
          <div className="container-fluid position-relative d-flex justify-content-between align-items-center">

            {/* Logo y Título (sin cambios aquí) */}
            <Link to="/" className="logo navbar-brand text-white me-auto"> {/* 'me-auto' puede ayudar a empujar los links si justify-content no es suficiente */}
              <span className="logo-icon-wrapper">
                <img className="logo-icon" src={logo} alt="icon" style={{ height: '30px', marginRight: '10px' }} /> {/* Añadí un estilo inline para el tamaño y margen del logo */}
              </span>
              <span className="text">Pagina <span className="highlight">Infraestructura</span></span>
            </Link>

            {/* Botón Toggler para pantallas pequeñas (Importante para navbar-expand-md) */}
            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarNavMain" // Asegúrate que este ID sea único si tienes varios navbars
              aria-controls="navbarNavMain"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>

            {/* Contenedor de los enlaces */}
            {/* Cambiamos el ID para que coincida con data-bs-target */}
            <div className="collapse navbar-collapse" id="navbarNavMain">
              {/* 'ms-auto' empuja los links a la derecha en pantallas grandes */}
              <ul className="navbar-nav ms-auto">
                               <li className="nav-item">
                  <Link to="/forba7d" className="nav-link text-white">
                    LLenado de Planilla Colocacion
                  </Link>
                  <li className="nav-item">
                  <Link to="/login" className="nav-link text-white">
                    Ingresar
                  </Link>
                </li>
                </li>
              </ul>
            </div>
          </div>
        </nav>
      </header>
    </>
  );
};
