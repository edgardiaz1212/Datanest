// src/front/js/pages/Dashboard.jsx

import React, { useState, useEffect, useContext } from 'react'; // Added useContext
import PropTypes from 'prop-types'; // Import PropTypes
import { Row, Col, Card, Alert, Spinner } from 'react-bootstrap'; // Added Spinner
// Assuming your api instance is correctly set up
// If using Flux for API calls, import Context and actions instead
// import api from '../services/api'; // Keep if not using Flux for this call
import { Context } from '../store/appContext'; // Import context if using Flux actions

import { FiWind, FiThermometer, FiDroplet, FiTool, FiAlertTriangle } from 'react-icons/fi';
import { format } from 'date-fns'; // Import date-fns if needed for formatting dates from API

// --- Remove TypeScript interface ---
// interface ResumenData { ... }

const Dashboard = () => { // Remove : React.FC
  // --- State ---
  const [loading, setLoading] = useState(true); // Initialize loading to true
  const [error, setError] = useState(null); // Initialize error to null
  const [resumen, setResumen] = useState(null); // Initialize resumen data as null

  // --- Optional: Get Flux context if needed for auth or other actions ---
  const { store, actions } = useContext(Context);
  const { trackerUser } = store; // Example: Get logged-in user info if needed

  // --- Fetch Data ---
  useEffect(() => {
    const cargarResumen = async () => {
      setLoading(true);
      setError(null);
      setResumen(null); // Clear previous data on new fetch

      try {
        // --- API Call ---
        // Option 1: Direct API call (if not using Flux for this)
        // const response = await api.get('/dashboard/resumen');

        // Option 2: Using a Flux action (if you create one)
        // Replace with your actual action name if created
        const data = await actions.fetchDashboardResumen(); // Assuming this action exists and returns data or throws error

        // --- Process Response ---
        // If using direct API call:
        // if (!response || !response.data) {
        //   throw new Error("No se recibieron datos del servidor.");
        // }
        // setResumen(response.data);

        // If using Flux action:
        if (!data) {
             throw new Error("No se recibieron datos del servidor.");
        }
        setResumen(data); // Set data returned by the action

      } catch (err) { // Catch potential errors
        console.error('Error al cargar resumen:', err);
        // Provide more specific error messages
        // Check for specific error types if your API/action provides them
        // Example: Check for unauthorized error (might need adjustment based on actual error structure)
        if (err.message?.includes('401') || err.status === 401) {
          setError('No autorizado. Por favor, inicia sesión de nuevo.');
          // Optionally trigger logout action
          // actions.logoutTrackerUser();
        } else {
          setError(err.message || 'Error al cargar los datos del resumen.');
        }
        setResumen(null); // Clear data on error
      } finally {
        setLoading(false);
      }
    };

    cargarResumen();
    // Cleanup function for error state
    return () => setError(null);
  }, [actions]); // Add 'actions' to dependency array if using Flux actions

  // --- Render Logic ---

  // Handle loading state
  if (loading) {
    return (
      <div className="container mt-4 text-center p-5"> {/* Added container */}
        <Spinner animation="border" variant="primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </Spinner>
        <p className="mt-3">Cargando Dashboard...</p>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="container mt-4"> {/* Added container */}
        <h1 className="mb-4">Dashboard</h1>
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      </div>
    );
  }

  // Handle case where data is still null after loading/error checks
  if (!resumen) {
     return (
       <div className="container mt-4"> {/* Added container */}
         <h1 className="mb-4">Dashboard</h1>
         <Alert variant="warning">No se pudieron cargar los datos del resumen.</Alert>
       </div>
     );
  }

  // --- Render Dashboard Content ---
  return (
    <div className="container mt-4"> {/* Added container */}
      <h1 className="mb-4">Dashboard</h1>

      {/* Summary Cards */}
      <Row className="mb-4">
        {/* Total Aires Card */}
        <Col md={6} lg={3} className="mb-3"> {/* Adjusted grid for better spacing */}
          <Card className="dashboard-card h-100 shadow-sm"> {/* Added shadow */}
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h3 className="mb-0">{resumen.totalAires ?? 0}</h3> {/* Use ?? 0 as fallback */}
                  <small className="text-muted">Aires Acondicionados</small>
                </div>
                <FiWind size={40} className="text-primary opacity-75" /> {/* Added opacity */}
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Total Lecturas Card */}
         <Col md={6} lg={3} className="mb-3">
          <Card className="dashboard-card h-100 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h3 className="mb-0">{resumen.totalLecturas ?? 0}</h3>
                  <small className="text-muted">Lecturas Registradas</small>
                </div>
                <FiThermometer size={40} className="text-success opacity-75" />
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Total Mantenimientos Card */}
        <Col md={6} lg={3} className="mb-3">
          <Card className="dashboard-card h-100 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h3 className="mb-0">{resumen.totalMantenimientos ?? 0}</h3>
                  <small className="text-muted">Mantenimientos</small>
                </div>
                <FiTool size={40} className="text-info opacity-75" />
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Active Alerts Card */}
        <Col md={6} lg={3} className="mb-3">
          <Card className="dashboard-card h-100 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  {/* Assuming 'alertas' holds the count */}
                  <h3 className="mb-0">{resumen.alertas_activas_count ?? 0}</h3>
                  <small className="text-muted">Alertas Activas</small>
                </div>
                <FiAlertTriangle size={40} className="text-warning opacity-75" />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Latest Readings Table */}
      <Card className="dashboard-card mb-4 shadow-sm">
        <Card.Header>
          <h5 className="mb-0">Últimas Lecturas</h5>
        </Card.Header>
        <Card.Body>
           {/* Check if ultimasLecturas exists and is an array with items */}
           {resumen.ultimasLecturas && Array.isArray(resumen.ultimasLecturas) && resumen.ultimasLecturas.length > 0 ? (
             <div className="table-responsive">
               {/* Use Bootstrap table classes */}
               <Table striped hover responsive size="sm" className="mb-0">
                 <thead>
                   <tr>
                     <th>Aire</th>
                     <th>Ubicación</th>
                     <th><FiThermometer className="me-1"/>Temp.</th>
                     <th><FiDroplet className="me-1"/>Hum.</th>
                     <th>Fecha/Hora</th>
                   </tr>
                 </thead>
                 <tbody>
                   {/* Map over actual data */}
                   {resumen.ultimasLecturas.map((lectura) => (
                     // Defensive check for lectura and id
                     lectura && lectura.id ? (
                       <tr key={lectura.id}>
                         {/* Adjust property names based on your API response */}
                         <td>{lectura.nombre_aire || 'N/A'}</td>
                         <td>{lectura.ubicacion_aire || 'N/A'}</td>
                         <td>
                           {/* Use toFixed(1) for consistency */}
                           {lectura.temperatura?.toFixed(1) ?? 'N/A'} °C
                         </td>
                         <td>
                           {lectura.humedad?.toFixed(1) ?? 'N/A'} %
                         </td>
                         <td>
                            {/* Format date using date-fns */}
                            {lectura.fecha ? format(new Date(lectura.fecha), 'dd/MM/yyyy HH:mm') : 'N/A'}
                         </td>
                       </tr>
                     ) : null // Don't render invalid items
                   ))}
                 </tbody>
               </Table>
             </div>
           ) : (
             <p className="text-center text-muted my-3">No hay lecturas recientes para mostrar.</p> // Added margin
           )}
        </Card.Body>
      </Card>

      {/* Informational Alert */}
      <Alert variant="info">
        <Alert.Heading>Información</Alert.Heading>
        <p>
          Este es el resumen general del sistema de monitoreo de aires acondicionados.
          Utilice la barra lateral para navegar a las diferentes secciones y obtener
          información más detallada.
        </p>
      </Alert>
    </div>
  );
};

// Add PropTypes (even though none are received, it's good practice)
Dashboard.propTypes = {
  // No props expected for this component
};

export default Dashboard;
