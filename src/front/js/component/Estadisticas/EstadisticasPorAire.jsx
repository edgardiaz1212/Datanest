// src/front/js/component/estadisticas/EstadisticasPorAire.jsx

import React from 'react';
import PropTypes from 'prop-types'; // Import PropTypes
import { Card, Row, Col, Form, Spinner, Table } from 'react-bootstrap';
import { FiMapPin, FiThermometer, FiDroplet, FiWind } from 'react-icons/fi';

// --- Remove TypeScript imports and interfaces ---
// import { ChartDataType, AireAcondicionado } from '../../pages/Estadisticas';
// interface EstadisticasAire { ... }
// interface EstadisticasPorAireProps { ... }

// Import child components (assuming they are .jsx)
import ChartContainer from './ChartContainer.jsx';

const EstadisticasPorAire = ({ // Remove : React.FC<EstadisticasPorAireProps>
  aires,
  aireSeleccionado,
  setAireSeleccionado,
  estadisticasAire,
  graficoAireTemp,
  graficoAireHum,
  loadingAires, // Renamed from loadingGeneral for clarity
  loadingAireStats, // Renamed from loadingAire
  loadingChartsAire
}) => {

    return (
    <div>
      {/* AC Selector Row */}
      <Row className="mb-4">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Seleccionar Aire Acondicionado</Form.Label>
            <Form.Select
              value={aireSeleccionado ?? ''} // Use ?? '' to handle null correctly
              onChange={e => setAireSeleccionado(e.target.value ? parseInt(e.target.value, 10) : null)} // Parse value to int or null
              disabled={loadingAires || !Array.isArray(aires) || aires.length === 0} // Disable while loading or if no aires
            >
              <option value="">Seleccione un aire acondicionado</option>
              {/* Defensive check before mapping */}
              {Array.isArray(aires) && aires.map(aire => (
                // Defensive check for item validity
                aire && aire.id ? (
                  <option key={aire.id} value={aire.id.toString()}> {/* Ensure value is string */}
                    {aire.nombre} ({aire.ubicacion || 'Sin Ubic.'}) {/* Fallback for ubicacion */}
                  </option>
                ) : null
              ))}
            </Form.Select>
            {/* Optional: Loading/Empty message */}
            {loadingAires && <Form.Text muted>Cargando lista de aires...</Form.Text>}
            {!loadingAires && (!Array.isArray(aires) || aires.length === 0) && <Form.Text muted>No hay aires disponibles.</Form.Text>}
          </Form.Group>
        </Col>
      </Row>

      {/* Loading indicator for specific AC stats */}
      {loadingAireStats && (
        <div className="text-center p-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Cargando estadísticas del aire...</p>
        </div>
      )}

      {/* Content when AC is selected and stats are loaded */}
      {!loadingAireStats && aireSeleccionado !== null && estadisticasAire ? (
        <>
          {/* Stats Summary Card */}
          <Card className="dashboard-card mb-4">
            <Card.Header>
              <h5 className="mb-0">{estadisticasAire.nombre || 'Aire Desconocido'}</h5>
              <small className="text-muted">
                <FiMapPin className="me-1" /> {estadisticasAire.ubicacion || 'Ubicación Desconocida'}
              </small>
            </Card.Header>
            <Card.Body>
              <Row>
                {/* Temperature Stats Table */}
                <Col md={6} className="mb-3 mb-md-0"> {/* Add margin bottom for small screens */}
                  <Table striped hover size="sm" responsive> {/* Added responsive */}
                    <thead>
                        <tr>
                            <th colSpan="2"><FiThermometer className="me-2 text-danger" />Temperatura</th>
                        </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Promedio</td>
                        <td><strong>{estadisticasAire.temperatura_promedio?.toFixed(1) ?? 'N/A'} °C</strong></td>
                      </tr>
                      <tr>
                        <td>Máxima</td>
                        <td><strong>{estadisticasAire.temperatura_maxima?.toFixed(1) ?? 'N/A'} °C</strong></td>
                      </tr>
                      <tr>
                        <td>Mínima</td>
                        <td><strong>{estadisticasAire.temperatura_minima?.toFixed(1) ?? 'N/A'} °C</strong></td>
                      </tr>
                      <tr>
                        <td>Variación</td>
                        <td><strong>±{estadisticasAire.variacion_temperatura?.toFixed(2) ?? 'N/A'} °C</strong></td>
                      </tr>
                    </tbody>
                  </Table>
                </Col>
                {/* Humidity Stats Table */}
                <Col md={6}>
                  <Table striped hover size="sm" responsive> {/* Added responsive */}
                     <thead>
                        <tr>
                            <th colSpan="2"><FiDroplet className="me-2 text-primary" />Humedad</th>
                        </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Promedio</td>
                        <td><strong>{estadisticasAire.humedad_promedio?.toFixed(1) ?? 'N/A'} %</strong></td>
                      </tr>
                      <tr>
                        <td>Máxima</td>
                        <td><strong>{estadisticasAire.humedad_maxima?.toFixed(1) ?? 'N/A'} %</strong></td>
                      </tr>
                      <tr>
                        <td>Mínima</td>
                        <td><strong>{estadisticasAire.humedad_minima?.toFixed(1) ?? 'N/A'} %</strong></td>
                      </tr>
                      <tr>
                        <td>Variación</td>
                        <td><strong>±{estadisticasAire.variacion_humedad?.toFixed(2) ?? 'N/A'} %</strong></td>
                      </tr>
                    </tbody>
                  </Table>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Charts Row */}
          <Row>
            <Col md={6} className="mb-4">
               <ChartContainer
                  title={`Variación Temperatura - ${estadisticasAire.nombre || ''}`}
                  yAxisLabel="Temperatura (°C)"
                  data={graficoAireTemp}
                  loading={loadingChartsAire} // Use specific chart loading state
                  type={'line'}
               />
            </Col>
            <Col md={6} className="mb-4">
               <ChartContainer
                  title={`Variación Humedad - ${estadisticasAire.nombre || ''}`}
                  yAxisLabel="Humedad (%)"
                  data={graficoAireHum}
                  loading={loadingChartsAire} // Use specific chart loading state
                  type={'line'}
               />
            </Col>
          </Row>
        </>
      ) : !loadingAireStats && aireSeleccionado === null ? (
        // Placeholder when no AC is selected (and not loading stats)
        <Card className="dashboard-card">
          <Card.Body className="text-center p-5">
            <FiWind size={50} className="text-muted mb-3" />
            <h4>Seleccione un aire acondicionado para ver sus estadísticas detalladas y gráficos.</h4>
          </Card.Body>
        </Card>
      ) : null /* Handles other cases like error (error shown globally) or selected AC but null data */ }
    </div>
  );
};

// Define PropTypes for the component
EstadisticasPorAire.propTypes = {
  aires: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number.isRequired,
      nombre: PropTypes.string.isRequired,
      ubicacion: PropTypes.string,
  })), // Not required, might be loading
  aireSeleccionado: PropTypes.number, // Can be null
  setAireSeleccionado: PropTypes.func.isRequired,
  estadisticasAire: PropTypes.shape({ // Can be null
      temperatura_promedio: PropTypes.number,
      temperatura_maxima: PropTypes.number,
      temperatura_minima: PropTypes.number,
      humedad_promedio: PropTypes.number,
      humedad_maxima: PropTypes.number,
      humedad_minima: PropTypes.number,
      variacion_temperatura: PropTypes.number,
      variacion_humedad: PropTypes.number,
      aire_id: PropTypes.number,
      nombre: PropTypes.string,
      ubicacion: PropTypes.string,
  }),
  // Chart data props are objects
  graficoAireTemp: PropTypes.object,
  graficoAireHum: PropTypes.object,
  // Loading states
  loadingAires: PropTypes.bool.isRequired, // Renamed prop
  loadingAireStats: PropTypes.bool.isRequired, // Renamed prop
  loadingChartsAire: PropTypes.bool.isRequired,
};

// Default props
EstadisticasPorAire.defaultProps = {
  aires: [],
  aireSeleccionado: null,
  estadisticasAire: null,
  graficoAireTemp: null,
  graficoAireHum: null,
};


export default EstadisticasPorAire;
