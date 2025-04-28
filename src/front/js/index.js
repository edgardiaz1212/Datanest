// src/front/js/index.js

import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";

// Importa el Layout principal y el proveedor de contexto
import Layout from "./layout.jsx"; // Asegúrate que la ruta sea correcta
import injectContext from "./store/appContext";

// Importa tus componentes de página
import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Aires from "./pages/Aires.jsx";
import Lecturas from "./pages/Lecturas.jsx";
import Estadisticas from "./pages/Estadisticas.jsx";
import OtrosEquipos from "./pages/OtrosEquipos.jsx";
import Mantenimientos from "./pages/Mantenimientos.jsx";
import Umbrales from "./pages/Umbrales.jsx";
import Usuarios from "./pages/Usuarios.jsx";
import Perfil from "./pages/Perfil.jsx";
import NotFound from "./pages/NotFound.jsx"; 
import Formulary from "./pages/Formulary.jsx";
import DataTable from "./pages/DataTable.jsx";
import CompleteData from "./pages/CompleteData.jsx";
import EditData from "./pages/EditData.jsx";
import Home from "./pages/Home.jsx"; // Página pública Home
import Reportes from "./pages/Reportes.jsx"; // Página de reportes

// Tus otros imports (CSS)
import "../styles/index.css";
import "../styles/layout.css";

// Componente principal de la aplicación
const App = () => {
    const basename = process.env.BASENAME || "";

    // Envuelve la App con el proveedor de contexto
    const AppWithContext = injectContext(() => (
        <BrowserRouter basename={basename}>
            {/* Layout AHORA envuelve TODAS las rutas */}
            <Routes>
                <Route element={<Layout />}>
                    {/* Rutas Públicas y de Formulario (ahora dentro del Layout) */}
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/forba7d" element={<Formulary />} />
                    <Route path="/register-data/:user_id" element={<DataTable />} />
                    <Route path="/complete-data" element={<CompleteData />} />
                    <Route path="/edit-data/" element={<EditData />} />

                    {/* Rutas Protegidas / Monitoreo */}
                    {/* La redirección a /dashboard si se accede a "/" ya no es necesaria aquí,
                        porque "/" ahora tiene su propio elemento <Home />.
                        Si quieres que "/" redirija a dashboard SIEMPRE,
                        puedes poner <Route path="/" element={<Navigate replace to="/dashboard" />} />
                        ANTES de la ruta de <Home /> o quitar <Home />.
                    */}
                    {/* <Route path="/" element={<Navigate replace to="/dashboard" />} /> */}
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/aires" element={<Aires />} />
                    <Route path="/lecturas" element={<Lecturas />} />
                    <Route path="/estadisticas" element={<Estadisticas />} />
                    <Route path="/otros-equipos" element={<OtrosEquipos />} />
                    <Route path="/mantenimientos" element={<Mantenimientos />} />
                    <Route path="/umbrales" element={<Umbrales />} />
                    <Route path="/usuarios" element={<Usuarios />} />
                     <Route path="/perfil" element={<Perfil />} />
                     <Route path="/reportes" element={<Reportes />} />

                    {/* Ruta para 404 Not Found (también dentro del Layout) */}
                    <Route path="*" element={<NotFound />} />
                </Route>
            </Routes>
        </BrowserRouter>
    ));

    return <AppWithContext />;
};

// Renderiza tu aplicación
const container = document.getElementById("app");
const root = createRoot(container);
root.render(<App />);
