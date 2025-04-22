// src/front/js/component/estadisticas/ChartContainer.jsx

import React from 'react';
import PropTypes from 'prop-types'; // Import PropTypes
import { Card, Spinner } from 'react-bootstrap';
import { Line, Bar } from 'react-chartjs-2';
// ChartJS registration should happen in the parent or a central setup file

// --- Remove TypeScript imports and interfaces ---
// import { ChartDataType } from '../../pages/Estadisticas';
// import { ChartOptions } from 'chart.js';
// interface ChartContainerProps { ... }

// Base options remain the same (remove type annotations)
const opcionesLineaBase = { // Remove : ChartOptions<'line'>
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' }, // Remove 'as const'
      title: { display: true } // Title text will be added dynamically
    },
    scales: {
      y: {
        title: { display: true } // Y-axis label text will be added dynamically
      },
      x: {
        title: { display: true, text: 'Hora (HH:mm)' }
      }
    }
  };

const opcionesBarraBase = { // Remove : ChartOptions<'bar'>
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'x', // Keep as 'x' for vertical bars
    plugins: {
      legend: { position: 'top' }, // Remove 'as const'
      title: { display: true } // Title text will be added dynamically
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true } // Y-axis label text will be added dynamically
      },
      x: {
         title: { display: true, text: 'Ubicación' } // Label for x-axis in bar chart
      }
    }
  };

const ChartContainer = ({ // Remove : React.FC<ChartContainerProps>
  title,
  yAxisLabel,
  data,
  loading,
  type
}) => {

  // Define final options conditionally inside the return statement
  // using Immediately Invoked Function Expressions (IIFE)

  return (
    <Card className="dashboard-card h-100"> {/* Added h-100 for consistent height */}
      <Card.Header><h5 className="mb-0">{title}</h5></Card.Header> {/* Added h5 and mb-0 */}
      <Card.Body>
         {/* Ensure container takes available height */}
         <div className="chart-container" style={{ height: '300px', position: 'relative' }}>
          {loading ? (
            <div className="d-flex justify-content-center align-items-center h-100"> {/* Centering spinner */}
               <Spinner animation="border" size="sm" variant="primary" className="me-2" /> Cargando gráfico...
            </div>
          ) : data && data.labels && data.datasets ? ( // Check data structure
             type === 'line' ? (
                // IIFE to calculate and render Line chart
                (() => {
                  // Deep merge options for Line chart
                  const finalLineOptions = {
                    ...opcionesLineaBase,
                    plugins: {
                      ...opcionesLineaBase.plugins,
                      title: {
                        ...opcionesLineaBase.plugins?.title, // Safely spread existing title options
                        display: true,
                        text: title // Set dynamic title
                      }
                    },
                    scales: {
                      ...opcionesLineaBase.scales,
                      y: {
                        ...opcionesLineaBase.scales?.y, // Safely spread existing y-axis options
                        title: {
                          ...opcionesLineaBase.scales?.y?.title, // Safely spread existing y-axis title options
                          display: true,
                          text: yAxisLabel // Set dynamic y-axis label
                        }
                      }
                      // x-axis label is already set in base options
                    }
                  };
                  return <Line data={data} options={finalLineOptions} />;
                })() // Immediately invoke
             ) : ( // type === 'bar'
                // IIFE to calculate and render Bar chart
                (() => {
                  // Deep merge options for Bar chart
                  const finalBarOptions = {
                    ...opcionesBarraBase,
                    plugins: {
                      ...opcionesBarraBase.plugins,
                      title: {
                        ...opcionesBarraBase.plugins?.title,
                        display: true,
                        text: title // Set dynamic title
                      }
                    },
                    scales: {
                      ...opcionesBarraBase.scales,
                      y: {
                        ...opcionesBarraBase.scales?.y,
                        title: {
                          ...opcionesBarraBase.scales?.y?.title,
                          display: true,
                          text: yAxisLabel // Set dynamic y-axis label
                        }
                      }
                      // x-axis label is already set in base options
                    }
                  };
                  return <Bar data={data} options={finalBarOptions} />;
                })() // Immediately invoke
             )
          ) : (
             // Message when no data is available
             <div className="d-flex justify-content-center align-items-center h-100 text-muted">
                No hay datos suficientes para generar el gráfico.
             </div>
          )}
         </div>
      </Card.Body>
    </Card>
  );
};

// Add PropTypes for runtime type checking
ChartContainer.propTypes = {
  title: PropTypes.string.isRequired,
  yAxisLabel: PropTypes.string.isRequired,
  data: PropTypes.shape({ // Define the expected shape for chart data
      labels: PropTypes.arrayOf(PropTypes.string),
      datasets: PropTypes.arrayOf(PropTypes.shape({
          label: PropTypes.string,
          data: PropTypes.arrayOf(PropTypes.number), // Or PropTypes.any if mixed types
          borderColor: PropTypes.string,
          backgroundColor: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
          // Add other dataset properties if needed
      }))
  }), // Can be null
  loading: PropTypes.bool.isRequired,
  type: PropTypes.oneOf(['line', 'bar']).isRequired, // Ensure type is one of these
};

// Default props
ChartContainer.defaultProps = {
    data: null, // Default data to null
};


export default ChartContainer;
