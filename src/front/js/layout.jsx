import React, { useState, useContext, useEffect } from "react";
import PropTypes from 'prop-types';
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Container } from 'react-bootstrap';
import { Context } from "./store/appContext.js";
// Import Navigation Components
import SidebarMonitoreo from "./component/SidebarMonitoreo.jsx"; 
import NavbarPrincipal from "./component/NavbarPrincipal.jsx"; 
import {NavbarMain} from "./component/NavbarMain.js"; 
// Import Footer if you have one
import {Footer} from "./component/footer";
import madDataIcon from "../img/mad_data.png"; 

// Import CSS for layout
import "../styles/layout.css";

const Layout = () => {
    const { store, actions } = useContext(Context);
    const location = useLocation();
    const navigate = useNavigate();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [showFooter, setShowFooter] = useState(true); // Mantenemos el footer por ahora

    const toggleSidebar = () => {
        setSidebarCollapsed(!sidebarCollapsed);
    };
// Este efecto se ejecutará cada vez que cambie isAuthenticated o la ubicación
useEffect(() => {
    // Si el usuario NO está autenticado Y está intentando acceder a una ruta protegida
    // (Aquí asumimos que /login y /registro son las únicas públicas, ajusta según necesites)
    const publicPaths = ['/login', '/registro']; // Añade otras rutas públicas si existen
    const requiresAuth = !publicPaths.includes(location.pathname);

    if (!store.isAuthenticated && requiresAuth) {
        console.log("Usuario no autenticado o token expirado, redirigiendo a /login...");
        // Opcional: Puedes guardar la ruta actual para redirigir de vuelta después del login
        // localStorage.setItem('redirectAfterLogin', location.pathname);
        navigate('/');
    }

    // Opcional: Si el usuario ESTÁ autenticado y va a /login, redirigir al dashboard
     if (store.isAuthenticated && location.pathname === '/login') {
         navigate('/dashboard'); 
     }

}, [store.isAuthenticated, location.pathname, navigate]); // Dependencias clave

    const getLayoutType = () => {
        const { pathname } = location;

        // Rutas para el layout principal de monitoreo (Sidebar + NavbarPrincipal)
        const monitoreoPaths = [
            '/dashboard', '/aires', '/lecturas', '/estadisticas',
            '/otros-equipos', '/mantenimientos', '/umbrales', '/usuarios', '/perfil'
            // Añade otras rutas de monitoreo aquí
        ];

        // Rutas para el layout público/formulario (Solo NavbarMain)
        const publicoPaths = [
            '/', // Página principal pública
            '/login',
            '/register', // Si tienes página de registro
            '/forba7d', // Tu ruta de formulario
            // Añade otras rutas públicas o de formulario aquí
            // '/register-data', '/complete-data', '/edit-data' // Si estas también usan NavbarMain
        ];

        // Rutas que NO deben tener NINGUNA navegación (raro, quizás una página de error muy específica)
        const noNavPaths = [
            // '/pagina-sin-nada' // Ejemplo
        ];

        // 1. Comprueba si es una ruta pública/formulario
        if (publicoPaths.some(path => pathname === path || (path !== '/' && pathname.startsWith(path)))) {
             // Usamos startsWith para rutas como /register-data/:user_id, excepto para '/'
            return 'publico';
        }

        // 2. Comprueba si es una ruta de monitoreo
        if (monitoreoPaths.some(path => pathname.startsWith(path))) {
            return 'monitoreo';
        }

        // 3. Comprueba si es una ruta sin navegación
        if (noNavPaths.includes(pathname)) {
            return 'none';
        }

        // Default: Si no coincide con nada específico, decide un layout por defecto
        // Podría ser 'publico' o 'monitoreo' dependiendo de tu caso de uso más común
        // O podrías redirigir a una página 404 si no coincide.
        // Por ahora, lo dejamos como 'publico' si no es de monitoreo.
        return 'publico';
    };

    const layoutType = getLayoutType();

    // --- Renderiza basado en el tipo de layout ---

    // Layout para secciones de MONITOREO (Sidebar + NavbarPrincipal)
    if (layoutType === 'monitoreo') {
        return (
            <div className="app-container">
                <SidebarMonitoreo
                    sidebarCollapsed={sidebarCollapsed}
                    toggleSidebar={toggleSidebar}
                />
                <div className={`main-content ${sidebarCollapsed ? 'main-content-collapsed' : ''}`}>
                    <NavbarPrincipal />
                    <Container fluid className="page-content">
                        <Outlet /> {/* Contenido específico de la página */}
                    </Container>
                    {showFooter && (
                        <footer className="app-footer">
                            <div className="d-flex align-items-center justify-content-center">
                                <img src={madDataIcon} alt="MAD Data" height="70" className="me-2" />
                                <span className="text-muted small">© {new Date().getFullYear()} GDCCE</span>
                            </div>
                        </footer>
                    )}
                </div>
            </div>
        );
    }

    // Layout para secciones PÚBLICAS/FORMULARIO (Solo NavbarMain)
    if (layoutType === 'publico') {
        return (
            <div className="public-layout-container"> {/* Contenedor simple */}
                <NavbarMain /> {/* Tu Navbar anterior */}
                <Container fluid className="page-content-public"> {/* Contenedor para el contenido */}
                    <Outlet /> {/* Contenido específico de la página */}
                </Container>
                 {/* Puedes decidir si mostrar el footer aquí también */}
                <Footer />
            </div>
        );
    }

    // Layout para páginas SIN NAVEGACIÓN
    if (layoutType === 'none') {
        return (
            <div className="no-layout-container">
                <Outlet />
            </div>
        );
    }

    // Fallback (si getLayoutType devuelve algo inesperado)
    return <Outlet />;
};

Layout.propTypes = {
    // No props expected directly
};

export default Layout;
