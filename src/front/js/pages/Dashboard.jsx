import React, { useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Card, Alert, Spinner, Table } from 'react-bootstrap';
import { Context } from '../store/appContext';
import { FiWind, FiThermometer, FiDroplet, FiTool, FiAlertTriangle } from 'react-icons/fi';
import { format } from 'date-fns';
import { Link } from 'react-router-dom'; 


const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { store, actions } = useContext(Context);
  const { dashboardResumen, dashboardLoading, dashboardError, trackerUser } = store;

  useEffect(() => {
    const cargarResumen = async () => {
      await actions.fetchDashboardResumen();
    };
    cargarResumen();
  }, [actions.fetchDashboardResumen]); 



  // Usa los estados de carga y error del store
  if (dashboardLoading) {
    return (
      <div className="container mt-4 text-center p-5">
        <Spinner animation="border" variant="primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </Spinner>
        <p className="mt-3">Cargando Dashboard...</p>
      </div>
    );
  }

  // Usa el estado de error del store
  if (dashboardError) {
    return (
      <div className="container mt-4">
        <h1 className="mb-4">Dashboard</h1>
        {/* Opcional: Permitir limpiar el error desde el componente */}
        <Alert variant="danger" dismissible onClose={() => actions.clearStatsError?.()}>
          {dashboardError}
        </Alert>
      </div>
    );
  }

  // Usa los datos del store. Verifica si son null o undefined.
  if (!dashboardResumen) {
     return (
       <div className="container mt-4">
         <h1 className="mb-4">Dashboard</h1>
         <Alert variant="warning">No se pudieron cargar los datos del resumen.</Alert>
       </div>
     );
  }

  // --- Render Dashboard Content ---
  return (
    <div className="container mt-4">
      <h1 className="mb-4">Dashboard</h1>

      {/* Summary Cards */}
      <Row className="mb-4">
        {/* Total Aires Card - Enlazado */}
        <Col md={6} lg={3} className="mb-3">
          <Link to="/aires" className="text-decoration-none text-dark"> {/* Enlace a /aires */}
            <Card className="dashboard-card h-100 shadow-sm dashboard-card-link"> {/* Añadida clase opcional para hover */}
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h3 className="mb-0">{dashboardResumen.totalAires ?? 0}</h3>
                    <small className="text-muted">Aires Acondicionados</small>
                  </div>
                  <FiWind size={40} className="text-primary opacity-75" />
                </div>
              </Card.Body>
            </Card>
          </Link>
        </Col>

        {/* Total Lecturas Card - Enlazado */}
         <Col md={6} lg={3} className="mb-3">
           <Link to="/lecturas" className="text-decoration-none text-dark"> {/* Enlace a /lecturas */}
             <Card className="dashboard-card h-100 shadow-sm dashboard-card-link">
               <Card.Body>
                 <div className="d-flex justify-content-between align-items-center">
                   <div>
                     <h3 className="mb-0">{dashboardResumen.totalLecturas ?? 0}</h3>
                     <small className="text-muted">Lecturas Registradas</small>
                   </div>
                   <FiThermometer size={40} className="text-success opacity-75" />
                 </div>
               </Card.Body>
             </Card>
           </Link>
         </Col>

        {/* Total Mantenimientos Card - Enlazado */}
        <Col md={6} lg={3} className="mb-3">
          <Link to="/mantenimientos" className="text-decoration-none text-dark"> {/* Enlace a /mantenimientos */}
            <Card className="dashboard-card h-100 shadow-sm dashboard-card-link">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h3 className="mb-0">{dashboardResumen.totalMantenimientos ?? 0}</h3>
                    <small className="text-muted">Mantenimientos</small>
                  </div>
                  <FiTool size={40} className="text-info opacity-75" />
                </div>
              </Card.Body>
            </Card>
          </Link>
        </Col>

        {/* Active Alerts Card - Enlazado */}
        <Col md={6} lg={3} className="mb-3">
          <Link to="/alertas-activas" className="text-decoration-none text-dark"> {/* Enlace a /alertas-activas */}
            <Card className="dashboard-card h-100 shadow-sm dashboard-card-link">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h3 className="mb-0">{dashboardResumen.alertas_activas_count ?? 0}</h3>
                    <small className="text-muted">Alertas Activas</small>
                  </div>
                  <FiAlertTriangle size={40} className="text-warning opacity-75" />
                </div>
              </Card.Body>
            </Card>
          </Link>
        </Col>
      </Row>

      {/* Latest Readings Table */}
      <Card className="dashboard-card mb-4 shadow-sm">
        <Card.Header>
          <h5 className="mb-0">Últimas Lecturas</h5>
        </Card.Header>
        <Card.Body>
           {dashboardResumen.ultimasLecturas && Array.isArray(dashboardResumen.ultimasLecturas) && dashboardResumen.ultimasLecturas.length > 0 ? (
             <div className="table-responsive">
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
                   {dashboardResumen.ultimasLecturas.map((lectura) => (
                     lectura && lectura.id ? (
                       <tr key={lectura.id}>
                         <td>{lectura.nombre_aire || 'N/A'}</td>
                         <td>{lectura.ubicacion_aire || 'N/A'}</td>
                         <td>
                           {lectura.temperatura != null ? `${lectura.temperatura.toFixed(1)} °C` : 'N/A'}
                         </td>
                         <td>
                           {lectura.humedad != null ? `${lectura.humedad.toFixed(1)} %` : 'N/A'}
                         </td>
                         <td>
                            {lectura.fecha ? format(new Date(lectura.fecha), 'dd/MM/yyyy HH:mm') : 'N/A'}
                         </td>
                       </tr>
                     ) : null
                   ))}
                 </tbody>
               </Table>
             </div>
           ) : (
             <p className="text-center text-muted my-3">No hay lecturas recientes para mostrar.</p>
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

Dashboard.propTypes = {};

export default Dashboard;
