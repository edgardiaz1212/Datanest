// src/front/js/component/estadisticas/EstadisticasGeneral.jsx

import React from 'react';
import PropTypes from 'prop-types'; // Import PropTypes
import { Row, Col, Card, Spinner, Table } from 'react-bootstrap'; // Removed unused imports Card, Table
// Icons are not directly used here, they are likely used within EstadisticasResumenCard
// import { FiBarChart2, FiThermometer, FiDroplet, FiClock } from 'react-icons/fi';

// --- Remove TypeScript imports and interfaces ---
// import { ChartDataType } from '../../pages/Estadisticas';
// interface EstadisticasGenerales { ... }
// interface EstadisticasGeneralProps { ... }

// Import child components (assuming they are .jsx)
import ChartContainer from './ChartContainer.jsx'
import EstadisticasResumenCard from './EstadisticasResumenCard.jsx';

const EstadisticasGeneral = ({ // Remove : React.FC<EstadisticasGeneralProps>
  estadisticasGenerales,
  graficoGeneralTemp,
  graficoGeneralHum,
  graficoComparativoTemp,
  graficoComparativoHum,
  loadingGeneral,
  loadingChartsGeneral,
  loadingUbicacion
}) => {
  return (
    <div>
      <Row>
        {/* General Summary Card */}
        <Col lg={4} md={6} className="mb-4">
          {/* Pass props to the summary card component */}
          <EstadisticasResumenCard
            estadisticas={estadisticasGenerales}
            loading={loadingGeneral}
          />
        </Col>
        {/* General Charts Column */}
        <Col lg={8} md={6} className="mb-4">
          <Row>
            {/* Temperature Line Chart */}
            <Col sm={12} className="mb-4">
              <ChartContainer
                title="Variación General de Temperatura (Últimas lecturas)"
                yAxisLabel="Temperatura (°C)"
                data={graficoGeneralTemp}
                loading={loadingChartsGeneral}
                type={'line'} // Pass type as string
              />
            </Col>
            {/* Humidity Line Chart */}
            <Col sm={12}>
               <ChartContainer
                  title="Variación General de Humedad (Últimas lecturas)"
                  yAxisLabel="Humedad (%)"
                  data={graficoGeneralHum}
                  loading={loadingChartsGeneral}
                  type={'line'} // Pass type as string
               />
            </Col>
          </Row>
        </Col>
      </Row>
      {/* Comparative Charts Row */}
      <Row>
        {/* Temperature Bar Chart */}
        <Col md={6} className="mb-4">
          <ChartContainer
            title="Temperatura Promedio por Ubicación"
            yAxisLabel="Temperatura (°C)"
            data={graficoComparativoTemp}
            loading={loadingUbicacion} // Use location loading state
            type={'bar'} // Pass type as string
          />
        </Col>
        {/* Humidity Bar Chart */}
        <Col md={6} className="mb-4">
           <ChartContainer
              title="Humedad Promedio por Ubicación"
              yAxisLabel="Humedad (%)"
              data={graficoComparativoHum}
              loading={loadingUbicacion} // Use location loading state
              type={'bar'} // Pass type as string
           />
        </Col>
      </Row>
    </div>
  );
};

// Define PropTypes for the component
EstadisticasGeneral.propTypes = {
  estadisticasGenerales: PropTypes.shape({
    temperatura_promedio: PropTypes.number,
    temperatura_maxima: PropTypes.number,
    temperatura_minima: PropTypes.number,
    humedad_promedio: PropTypes.number,
    humedad_maxima: PropTypes.number,
    humedad_minima: PropTypes.number,
    total_lecturas: PropTypes.number,
  }), // Can be null
  // Chart data props are objects, specific shape validation done in ChartContainer
  graficoGeneralTemp: PropTypes.object,
  graficoGeneralHum: PropTypes.object,
  graficoComparativoTemp: PropTypes.object,
  graficoComparativoHum: PropTypes.object,
  // Loading states are required booleans
  loadingGeneral: PropTypes.bool.isRequired,
  loadingChartsGeneral: PropTypes.bool.isRequired,
  loadingUbicacion: PropTypes.bool.isRequired,
};

// Default props for potentially null objects
EstadisticasGeneral.defaultProps = {
  estadisticasGenerales: null,
  graficoGeneralTemp: null,
  graficoGeneralHum: null,
  graficoComparativoTemp: null,
  graficoComparativoHum: null,
};

export default EstadisticasGeneral;
