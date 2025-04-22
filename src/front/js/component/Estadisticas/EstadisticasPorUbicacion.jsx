// src/front/js/component/estadisticas/EstadisticasPorUbicacion.jsx

import React from 'react';
import PropTypes from 'prop-types'; // Import PropTypes
import { Card, Row, Col, Form, Spinner, Table } from 'react-bootstrap';
import { FiMapPin, FiThermometer, FiDroplet, FiUsers, FiActivity } from 'react-icons/fi';

// --- Remove TypeScript imports and interfaces ---
// import { EstadisticasUbicacion } from '../../pages/Estadisticas';
// interface EstadisticasPorUbicacionProps { ... }

const EstadisticasPorUbicacion = ({ // Remove : React.FC<EstadisticasPorUbicacionProps>
  ubicaciones,
  ubicacionSeleccionada,
  setUbicacionSeleccionada,
  estadisticasUbicacion,
  loadingUbicacion
}) => {
  return (
    <div>
      {/* Location Selector */}
      <Row className="mb-4">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Filtrar por Ubicación</Form.Label>
            <Form.Select
              value={ubicacionSeleccionada ?? ''} // Use ?? '' to handle null correctly
              onChange={e => setUbicacionSeleccionada(e.target.value || null)} // Set to null if empty string selected
              disabled={loadingUbicacion || !Array.isArray(ubicaciones) || ubicaciones.length === 0} // Disable if loading or no locations
            >
              <option value="">Todas las ubicaciones</option>
              {/* Defensive check before mapping */}
              {Array.isArray(ubicaciones) && ubicaciones.map((ubicacion, index) => (
                // Ensure ubicacion is a string before rendering
                typeof ubicacion === 'string' ? (
                  <option key={index} value={ubicacion}>
                    {ubicacion}
                  </option>
                ) : null
              ))}
            </Form.Select>
            {/* Optional: Loading/Empty message */}
            {loadingUbicacion && <Form.Text muted>Cargando ubicaciones...</Form.Text>}
            {!loadingUbicacion && (!Array.isArray(ubicaciones) || ubicaciones.length === 0) && <Form.Text muted>No hay ubicaciones disponibles.</Form.Text>}
          </Form.Group>
        </Col>
      </Row>

      {/* Statistics Table */}
      <Card className="dashboard-card">
        <Card.Header><h5 className="mb-0">Estadísticas por Ubicación</h5></Card.Header> {/* Added h5 */}
        <Card.Body>
          {loadingUbicacion ? (
            <div className="text-center p-5">
                <Spinner animation="border" size="sm" variant="primary" className="me-2" /> Cargando datos...
            </div>
          ) : Array.isArray(estadisticasUbicacion) && estadisticasUbicacion.length > 0 ? (
            <Table striped hover responsive size="sm">
              <thead>
                <tr>
                  <th><FiMapPin className="me-1" />Ubicación</th>
                  <th><FiUsers className="me-1" />Aires</th>
                  <th><FiThermometer className="me-1 text-danger" />Temp. Prom.</th>
                  <th>Temp. Mín.</th>
                  <th>Temp. Máx.</th>
                  <th><FiDroplet className="me-1 text-primary" />Hum. Prom.</th>
                  <th>Hum. Mín.</th>
                  <th>Hum. Máx.</th>
                  <th><FiActivity className="me-1" />Lecturas</th>
                </tr>
              </thead>
              <tbody>
                {estadisticasUbicacion
                  // Filter if a specific location is selected
                  .filter(est => !ubicacionSeleccionada || est.ubicacion === ubicacionSeleccionada)
                  .map((est, index) => (
                    // Defensive check for item validity
                    est && est.ubicacion ? (
                      <tr key={index}> {/* Use index as key if ubicacion isn't guaranteed unique, otherwise est.ubicacion */}
                        <td>{est.ubicacion}</td>
                        {/* Use the correct property name: num_aires */}
                        <td>{est.num_aires ?? 'N/A'}</td>
                        <td>{est.temperatura_promedio?.toFixed(1) ?? 'N/A'} °C</td>
                        <td>{est.temperatura_min?.toFixed(1) ?? 'N/A'} °C</td>
                        <td>{est.temperatura_max?.toFixed(1) ?? 'N/A'} °C</td>
                        <td>{est.humedad_promedio?.toFixed(1) ?? 'N/A'} %</td>
                        <td>{est.humedad_min?.toFixed(1) ?? 'N/A'} %</td>
                        <td>{est.humedad_max?.toFixed(1) ?? 'N/A'} %</td>
                        <td>{est.lecturas_totales ?? 'N/A'}</td>
                      </tr>
                    ) : null // Don't render invalid items
                  ))
                }
              </tbody>
            </Table>
          ) : (
            // Message when no data is available
            <div className="text-center p-5 text-muted">
                No hay datos de ubicaciones disponibles
                {/* Add context if filtered */}
                {ubicacionSeleccionada ? ` para "${ubicacionSeleccionada}"` : ""}.
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

// Define PropTypes for the component
EstadisticasPorUbicacion.propTypes = {
  ubicaciones: PropTypes.arrayOf(PropTypes.string), // Not required, might be loading
  ubicacionSeleccionada: PropTypes.string, // Can be null
  setUbicacionSeleccionada: PropTypes.func.isRequired,
  estadisticasUbicacion: PropTypes.arrayOf(PropTypes.shape({ // Define shape for stats
      ubicacion: PropTypes.string.isRequired,
      num_aires: PropTypes.number,
      temperatura_promedio: PropTypes.number,
      temperatura_min: PropTypes.number,
      temperatura_max: PropTypes.number,
      temperatura_std: PropTypes.number,
      humedad_promedio: PropTypes.number,
      humedad_min: PropTypes.number,
      humedad_max: PropTypes.number,
      humedad_std: PropTypes.number,
      lecturas_totales: PropTypes.number,
  })).isRequired, // Data array itself is required
  loadingUbicacion: PropTypes.bool.isRequired,
};

// Default props
EstadisticasPorUbicacion.defaultProps = {
    ubicaciones: [],
    ubicacionSeleccionada: null,
    estadisticasUbicacion: [], // Default to empty array
};

export default EstadisticasPorUbicacion;
