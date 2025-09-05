// src/front/js/layout/SidebarMonitoreo.jsx

import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { Nav, Button } from 'react-bootstrap';
import {
  FiHome, FiWind, FiList, FiBarChart2, FiZap, FiTool, FiAlertCircle, FiUsers, FiMenu, FiBriefcase, FiExternalLink
} from 'react-icons/fi';
import { Context } from '../store/appContext'; // To check user role
import { HiOutlineDocumentReport } from 'react-icons/hi'
import { GrDocumentStore } from "react-icons/gr"
import { LuBriefcaseConveyorBelt, LuFireExtinguisher  } from "react-icons/lu";
import { GiPlagueDoctorProfile } from 'react-icons/gi';

const SidebarMonitoreo = ({ sidebarCollapsed, toggleSidebar }) => {
  const navigate = useNavigate();
  const { store } = useContext(Context);
  const { trackerUser: user } = store; // Get user from Flux store

  const commonLinks = [
    { path: '/dashboard', icon: FiHome, label: 'Dashboard' },
    { path: '/aires', icon: FiWind, label: 'Aires' },
    { path: '/lecturas', icon: FiList, label: 'Lecturas' },
    { path: '/estadisticas', icon: FiBarChart2, label: 'Estadísticas' },
    { path: '/otros-equipos', icon: FiZap, label: 'Otros Equipos' },
    { path: '/mantenimientos', icon: FiTool, label: 'Mantenimientos' },
    { path: '/reportes', icon: HiOutlineDocumentReport, label: 'Reportes' },
    {path: '/proveedores', icon: FiBriefcase, label: 'Proveedores' },
    {path: '/actividades-proveedor', icon: LuBriefcaseConveyorBelt, label: 'Actividades Proveedor' },
    {path: '/sha', icon: LuFireExtinguisher, label: 'SHA Extintores' },
    {path: '/servicios-externos', icon: FiExternalLink, label: 'Servicios Externos' },
    {path: '/documentos', icon: GrDocumentStore, label: 'Procedimientos y Planillas' },
    
    

    
  ];

  const adminLinks = [
    { path: '/gestion-diagnosticos', icon: GiPlagueDoctorProfile , label: 'Gestión Diagnósticos AA' },
    { path: '/umbrales', icon: FiAlertCircle, label: 'Umbrales' },
    { path: '/usuarios', icon: FiUsers, label: 'Configuración' },
    
  ];

  const renderNavLink = (link) => (
    <Nav.Link key={link.path} onClick={() => navigate(link.path)} className="text-light sidebar-link">
      <div className="d-flex align-items-center" title={link.label}> {/* Add title for tooltip */}
        <link.icon size={20} />
        {!sidebarCollapsed && <span className="ms-3">{link.label}</span>}
      </div>
    </Nav.Link>
  );

  return (
    <div className={`sidebar ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <div className="sidebar-header d-flex justify-content-between align-items-center p-3">
        {!sidebarCollapsed && <h5 className="m-0 text-light">Datanest</h5>}
        <Button variant="link" className="text-light p-0 toggle-button" onClick={toggleSidebar}>
          <FiMenu size={24} />
        </Button>
      </div>

      <Nav className="flex-column mt-3">
        {commonLinks.map(renderNavLink)}
        {user?.rol === 'admin' && adminLinks.map(renderNavLink)}
      </Nav>
    </div>
  );
};

SidebarMonitoreo.propTypes = {
  sidebarCollapsed: PropTypes.bool.isRequired,
  toggleSidebar: PropTypes.func.isRequired,
};

export default SidebarMonitoreo;
