import React from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import ScrollToTop from "./component/scrollToTop";
import { BackendURL } from "./component/backendURL";
import Formulary from "./pages/Formulary.jsx";
// Asegúrate que la importación del contexto use la misma capitalización que en otros archivos
import injectContext from "./store/appContext";
import { Navbar } from "./component/navbar";
import { NavbarMain } from "./component/NavbarMain";
import { Footer } from "./component/footer";
import DataTable from "./pages/DataTable.jsx";
import CompleteData from "./pages/CompleteData.jsx";
import EditData from "./pages/EditData.jsx";
import Home from "./pages/Home.jsx";
// Asegúrate que las rutas de importación sean correctas
import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";

/**
 * Componente que renderiza la estructura principal de la página (Navbar, Contenido, Footer).
 * Necesita estar dentro de BrowserRouter para usar useLocation.
 */
const LayoutContent = () => {
  const location = useLocation();

  // --- Cambio aquí ---
  // Define las rutas donde quieres mostrar NavbarMain
  const mainNavbarRoutes = ["/", "", "/login", "/register"];
  // Verifica si la ruta actual está en la lista
  const showNavbarMain = mainNavbarRoutes.includes(location.pathname);
  // --- Fin del cambio ---

  // Verifica si la URL del backend está configurada (buena práctica)
  if (!process.env.BACKEND_URL || process.env.BACKEND_URL === "") {
    return <BackendURL />;
  }

  return (
    // Contenedor principal con Flexbox para el sticky footer
    <div className="d-flex flex-column min-vh-100">
      {/* Renderiza el Navbar correspondiente */}
      {showNavbarMain ? <NavbarMain /> : <Navbar />}

      {/* Área de contenido principal que crece para empujar el footer */}
      {/* ScrollToTop envuelve las rutas para que funcione al navegar */}
      <main className="flex-grow-1">
        <ScrollToTop>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forba7d" element={<Formulary />} />
            <Route path="/register-data/:user_id" element={<DataTable />} />
            <Route path="/complete-data" element={<CompleteData />} />
            <Route path="/edit-data/" element={<EditData />} />
            {/* Ruta para páginas no encontradas */}
            <Route
              path="*"
              element={
                <h1 className="text-center my-5">404 - Página no encontrada</h1>
              }
            />
          </Routes>
        </ScrollToTop>
      </main>

      {/* Footer que se mantiene abajo */}
      <Footer />
    </div>
  );
};

/**
 * Componente principal del Layout.
 * Configura el BrowserRouter y el Contexto.
 */
const Layout = () => {
  // Configura el basename para el despliegue (ej. en subdirectorios)
  const basename = process.env.BASENAME_REACT_prefix || "";

  // No es necesario el div extra aquí
  return (
    <BrowserRouter basename={basename} future={{ v7_startTransition: true }}>
      {/* LayoutContent tiene acceso al contexto del Router */}
      <LayoutContent />
    </BrowserRouter>
  );
};

// Exporta el Layout envuelto en el HOC del contexto
export default injectContext(Layout);
