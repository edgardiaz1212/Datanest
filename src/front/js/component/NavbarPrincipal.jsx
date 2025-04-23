// src/front/js/layout/NavbarPrincipal.jsx

import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { Navbar, Container, Dropdown, Nav } from 'react-bootstrap'; // Removed Button as it's not used here
import { FiUser, FiSettings, FiLogOut } from 'react-icons/fi';
import { Context } from '../store/appContext'; // To get user and logout action
import logo from "../../img/CDHLogo.png"; // Adjust path as needed

const NavbarPrincipal = () => {
  const navigate = useNavigate();
  const { store, actions } = useContext(Context);
  const { trackerUser: user } = store;

  const handleLogout = () => {
    actions.logoutTrackerUser();
    navigate('/login'); // Redirect to login after logout
  };

  return (
    <Navbar bg="light" expand="lg" className="mb-4 shadow-sm main-navbar">
      <Container fluid>
        {/* You can add a button here to toggle the sidebar if needed, passing the toggle function as a prop */}
        {/* <Button variant="link" onClick={toggleSidebar}><FiMenu /></Button> */}
        <Navbar.Brand href="/dashboard" className="d-flex align-items-center">
           <img
              src={logo}
              height="30" // Adjust height as needed
              className="d-inline-block align-top me-2"
              alt="Logo DCCE"
            />
          Sistema de Monitoreo AC DCCE
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
          {user ? (
            <Dropdown align="end">
              <Dropdown.Toggle variant="light" id="dropdown-user" className="d-flex align-items-center">
                <FiUser className="me-2" />
                {/* Display user info safely */}
                <span>{user.nombre} {user.apellido} ({user.rol})</span>
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => navigate('/perfil')}>
                  <FiSettings className="me-2" /> Perfil
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item onClick={handleLogout} className="text-danger">
                  <FiLogOut className="me-2" /> Cerrar Sesión
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          ) : (
            // Optional: Show login/register links if user is not logged in
            <Nav>
              <Nav.Link onClick={() => navigate('/login')}>Iniciar Sesión</Nav.Link>
              {/* <Nav.Link onClick={() => navigate('/register')}>Registrarse</Nav.Link> */}
            </Nav>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

// No props needed directly if getting user/logout from context
NavbarPrincipal.propTypes = {
  // toggleSidebar: PropTypes.func, // Add if you implement the toggle button here
};

export default NavbarPrincipal;

