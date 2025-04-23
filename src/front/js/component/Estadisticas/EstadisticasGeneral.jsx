import React from 'react';
import PropTypes from 'prop-types'; 
import { Row, Col } from 'react-bootstrap'; 

// Import child components (assuming they are .jsx)
import ChartContainer from './ChartContainer.jsx'
import EstadisticasResumenCard from './EstadisticasResumenCard.jsx';

const EstadisticasGeneral = ({
  // Set default values directly here using JavaScript default parameters
  estadisticasGenerales = null,
  graficoGeneralTemp = null,
  graficoGeneralHum = null,
  graficoComparativoTemp = null,
  graficoComparativoHum = null,
  // Required props don't need defaults
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
  }), // Can be null (default handles this)
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

export default EstadisticasGeneral;
