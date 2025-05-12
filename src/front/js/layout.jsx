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
    const [showFooter, setShowFooter] = useState(true);

    const toggleSidebar = () => {
        setSidebarCollapsed(!sidebarCollapsed);
    };

    // Este efecto se ejecutará cada vez que cambie isAuthenticated o la ubicación
    useEffect(() => {
        // Define ALL paths accessible without authentication
        const publicPaths = [
            '/', // Página principal pública
            '/login',
            '/register', // Si tienes página de registro
            '/forba7d', // Tu ruta de formulario
             '/register-data', '/complete-data', '/edit-data'
        ];

        // Check if the current path is NOT one of the public paths
        const requiresAuth = !publicPaths.includes(location.pathname);

        // If the user is NOT authenticated AND the path requires authentication
        if (!store.isAuthenticated && requiresAuth) {
            console.log("Usuario no autenticado intentando acceder a ruta protegida, redirigiendo a /login...");
            // Redirect to the login page instead of home?
            navigate('/login'); // Consider redirecting to login
        }

        // If the user IS authenticated and tries to access login/register, redirect to dashboard
        if (store.isAuthenticated && (location.pathname === '/login' || location.pathname === '/registro')) {
             navigate('/dashboard');
        }

    }, [store.isAuthenticated, location.pathname, navigate]); // Dependencias clave

    const getLayoutType = () => {
        const { pathname } = location;

        // Rutas para el layout principal de monitoreo (Sidebar + NavbarPrincipal)
        const monitoreoPaths = [
            '/dashboard', '/aires', '/lecturas', '/estadisticas',
            '/otros-equipos', '/mantenimientos', '/umbrales', '/usuarios', 
            '/perfil', '/reportes', '/proveedores','/actividades-proveedor',
            '/servicios-externos','/documentos', '/alertas-activas'
            // Añade otras rutas de monitoreo aquí
        ];

        // Rutas para el layout público/formulario (Solo NavbarMain)
        // This list correctly includes /forba7d for layout purposes
        const publicoPaths = [
            '/', // Página principal pública
            '/login',
            '/register', // Si tienes página de registro
            '/forba7d', // Tu ruta de formulario
             '/register-data', '/complete-data', '/edit-data' 
        ];

        // Rutas que NO deben tener NINGUNA navegación
        const noNavPaths = [
            // '/pagina-sin-nada'
        ];

        // 1. Comprueba si es una ruta pública/formulario (for layout)
        if (publicoPaths.some(path => pathname === path || (path !== '/' && pathname.startsWith(path)))) {
            return 'publico';
        }

        // 2. Comprueba si es una ruta de monitoreo (for layout)
        if (monitoreoPaths.some(path => pathname.startsWith(path))) {
            return 'monitoreo';
        }

        // 3. Comprueba si es una ruta sin navegación (for layout)
        if (noNavPaths.includes(pathname)) {
            return 'none';
        }

        // Default layout (adjust if needed)
        return 'publico';
    };

    const layoutType = getLayoutType();

    // --- Renderiza basado en el tipo de layout ---

    // Layout para secciones de MONITOREO
    if (layoutType === 'monitoreo') {
        // ... (monitoreo layout JSX remains the same)
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
                            {/* ... footer content ... */}
                        </footer>
                    )}
                </div>
            </div>
        );
    }

    // Layout para secciones PÚBLICAS/FORMULARIO
    if (layoutType === 'publico') {
         // ... (publico layout JSX remains the same)
        return (
            <div className="public-layout-container">
                <NavbarMain />
                <Container fluid className="page-content-public">
                    <Outlet />
                </Container>
                <Footer />
            </div>
        );
    }

    // Layout para páginas SIN NAVEGACIÓN
    if (layoutType === 'none') {
        // ... (none layout JSX remains the same)
         return (
            <div className="no-layout-container">
                <Outlet />
            </div>
        );
    }

    // Fallback
    return <Outlet />;
};

Layout.propTypes = {
    // No props expected directly
};

export default Layout;
