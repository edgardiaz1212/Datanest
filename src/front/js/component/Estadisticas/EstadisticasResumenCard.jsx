// src/front/js/component/estadisticas/EstadisticasResumenCard.jsx

import React from 'react';
import PropTypes from 'prop-types'; // Import PropTypes
import { Card, Table, Spinner } from 'react-bootstrap';
import { FiThermometer, FiDroplet, FiClock } from 'react-icons/fi';

// --- Remove TypeScript interfaces ---
// interface EstadisticasGenerales { ... }
// interface EstadisticasResumenCardProps { ... }

const EstadisticasResumenCard = ({ // Remove : React.FC<EstadisticasResumenCardProps>
  estadisticas,
  loading
}) => {
  return (
    // Added h-100 to make card fill parent height if needed
    <Card className="dashboard-card h-100">
      <Card.Header><h5 className="mb-0">Resumen General</h5></Card.Header> {/* Added h5 */}
      <Card.Body>
        {loading ? (
          // Centered spinner for loading state
          <div className="text-center p-5 d-flex flex-column justify-content-center align-items-center h-100">
            <Spinner animation="border" size="sm" variant="primary" />
            <p className="mt-2 mb-0">Cargando resumen...</p>
          </div>
        ) : estadisticas ? (
          // Use responsive table
          <Table striped hover size="sm" className="mb-0" responsive>
            <tbody>
              <tr>
                <td><FiThermometer className="me-2 text-danger" />Temp. Promedio</td>
                {/* Use ?? 'N/A' to handle null/undefined/0 correctly */}
                <td><strong>{estadisticas.temperatura_promedio?.toFixed(1) ?? 'N/A'} °C</strong></td>
              </tr>
              <tr>
                <td><FiThermometer className="me-2 text-danger" />Temp. Máxima</td>
                <td><strong>{estadisticas.temperatura_maxima?.toFixed(1) ?? 'N/A'} °C</strong></td>
              </tr>
              <tr>
                <td><FiThermometer className="me-2 text-danger" />Temp. Mínima</td>
                <td><strong>{estadisticas.temperatura_minima?.toFixed(1) ?? 'N/A'} °C</strong></td>
              </tr>
              <tr>
                <td><FiDroplet className="me-2 text-primary" />Hum. Promedio</td>
                <td><strong>{estadisticas.humedad_promedio?.toFixed(1) ?? 'N/A'} %</strong></td>
              </tr>
              <tr>
                <td><FiDroplet className="me-2 text-primary" />Hum. Máxima</td>
                <td><strong>{estadisticas.humedad_maxima?.toFixed(1) ?? 'N/A'} %</strong></td>
              </tr>
              <tr>
                <td><FiDroplet className="me-2 text-primary" />Hum. Mínima</td>
                <td><strong>{estadisticas.humedad_minima?.toFixed(1) ?? 'N/A'} %</strong></td>
              </tr>
              <tr>
                <td><FiClock className="me-2" />Total Lecturas</td>
                <td><strong>{estadisticas.total_lecturas ?? 'N/A'}</strong></td>
              </tr>
            </tbody>
          </Table>
        ) : (
          // Centered message when no data is available
          <div className="text-center text-muted p-5 d-flex justify-content-center align-items-center h-100">
            No hay datos de resumen disponibles.
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

// Add PropTypes for runtime type checking
EstadisticasResumenCard.propTypes = {
  estadisticas: PropTypes.shape({
    temperatura_promedio: PropTypes.number,
    temperatura_maxima: PropTypes.number,
    temperatura_minima: PropTypes.number,
    humedad_promedio: PropTypes.number,
    humedad_maxima: PropTypes.number,
    humedad_minima: PropTypes.number,
    total_lecturas: PropTypes.number,
  }), // Can be null
  loading: PropTypes.bool.isRequired,
};

// Default props for potentially null object
EstadisticasResumenCard.defaultProps = {
  estadisticas: null,
};

export default EstadisticasResumenCard;
