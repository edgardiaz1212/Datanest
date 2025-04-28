import React, { useEffect, useContext } from 'react'; // Añadir useContext
import PropTypes from 'prop-types';
import { Card, Row, Col, Form, Spinner, Table, Alert } from 'react-bootstrap'; // Añadir Alert
import { FiMapPin, FiThermometer, FiDroplet, FiUsers, FiActivity } from 'react-icons/fi';
import { Context } from '../../store/appContext'; // Importar Context

// --- Importaciones de Chart.js ---
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale, // Importar TimeScale para ejes de fecha/hora
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns'; // Adaptador para date-fns
// --- Fin Importaciones de Chart.js ---

// --- Registrar módulos de Chart.js ---
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale // Registrar TimeScale
);
// --- Fin Registro ---

const EstadisticasPorUbicacion = ({
  ubicaciones = [],
  ubicacionSeleccionada = null,
  estadisticasUbicacion = [],
  setUbicacionSeleccionada,
  loadingUbicacion // Este loading es para la tabla/selector
}) => {
  // --- Obtener estado y acciones del Context ---
  const { store, actions } = useContext(Context);
  const {
    lecturasUbicacion,
    lecturasUbicacionLoading, // Loading específico para el gráfico
    lecturasUbicacionError
  } = store;
  // --- Fin Context ---

  // --- useEffect para buscar datos del gráfico ---
  useEffect(() => {
    // Llama a la acción para buscar lecturas cuando cambia la ubicación seleccionada
    actions.fetchLecturasPorUbicacion(ubicacionSeleccionada);
  }, [ubicacionSeleccionada, actions]); // Depende de la ubicación y actions
  // --- Fin useEffect ---

  // --- Preparar datos para el gráfico ---
  const chartData = {
    // Labels se generan a partir de los datos si usas TimeScale
    // labels: lecturasUbicacion.map(l => format(new Date(l.fecha), 'dd/MM HH:mm')),
    datasets: [
      {
        label: 'Temperatura (°C)',
        data: lecturasUbicacion.map(l => ({ x: new Date(l.fecha), y: l.temperatura })),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        yAxisID: 'y', // Asigna al eje Y izquierdo
        tension: 0.1
      },
      {
        label: 'Humedad (%)',
        data: lecturasUbicacion.map(l => ({ x: new Date(l.fecha), y: l.humedad })),
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        yAxisID: 'y1', // Asigna al eje Y derecho
        tension: 0.1
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false, // Para controlar altura con CSS o contenedor
    interaction: {
      mode: 'index',
      intersect: false,
    },
    stacked: false,
    plugins: {
      title: {
        display: true,
        text: `Variación de Temperatura y Humedad - ${ubicacionSeleccionada || 'Todas'}`,
      },
      legend: {
        position: 'top',
      },
      tooltip: {
        boxPadding: 3
      }
    },
    scales: {
      x: {
        type: 'time', // Usar escala de tiempo
        time: {
          unit: 'hour', // Ajusta la unidad según el rango de datos (day, minute, etc.)
          tooltipFormat: 'dd/MM/yyyy HH:mm', // Formato para el tooltip
          displayFormats: {
             hour: 'HH:mm', // Formato de visualización en el eje
             day: 'dd/MM'
          }
        },
        title: {
          display: true,
          text: 'Fecha y Hora'
        }
      },
      y: { // Eje Y izquierdo para Temperatura
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Temperatura (°C)',
          color: 'rgb(255, 99, 132)',
        },
        grid: {
          drawOnChartArea: false, // Solo dibuja la línea del eje
        },
        ticks: {
             color: 'rgb(255, 99, 132)',
        }
      },
      y1: { // Eje Y derecho para Humedad
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Humedad (%)',
          color: 'rgb(53, 162, 235)',
        },
        grid: {
          drawOnChartArea: false, // Evita que las rejillas se superpongan
        },
         ticks: {
             color: 'rgb(53, 162, 235)',
        }
      },
    },
  };
  // --- Fin preparación gráfico ---


  return (
    <div>
      {/* Location Selector (sin cambios) */}
      <Row className="mb-4">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Filtrar por Ubicación</Form.Label>
            <Form.Select
              value={ubicacionSeleccionada ?? ''}
              onChange={e => setUbicacionSeleccionada(e.target.value || null)}
              disabled={loadingUbicacion || !Array.isArray(ubicaciones) || ubicaciones.length === 0}
            >
              <option value="">Todas las ubicaciones</option>
              {Array.isArray(ubicaciones) && ubicaciones.map((ubicacion, index) => (
                typeof ubicacion === 'string' ? (
                  <option key={index} value={ubicacion}>
                    {ubicacion}
                  </option>
                ) : null
              ))}
            </Form.Select>
            {loadingUbicacion && <Form.Text muted>Cargando ubicaciones...</Form.Text>}
            {!loadingUbicacion && (!Array.isArray(ubicaciones) || ubicaciones.length === 0) && <Form.Text muted>No hay ubicaciones disponibles.</Form.Text>}
          </Form.Group>
        </Col>
      </Row>

      {/* Statistics Table (sin cambios) */}
      <Card className="dashboard-card mb-4"> {/* Añadido mb-4 */}
        <Card.Header><h5 className="mb-0">Estadísticas por Ubicación</h5></Card.Header>
        <Card.Body>
          {loadingUbicacion ? (
            <div className="text-center p-5">
                <Spinner animation="border" size="sm" variant="primary" className="me-2" /> Cargando datos...
            </div>
          ) : Array.isArray(estadisticasUbicacion) && estadisticasUbicacion.length > 0 ? (
            <Table striped hover responsive size="sm">
              {/* ... (thead y tbody de la tabla sin cambios) ... */}
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
                  .filter(est => !ubicacionSeleccionada || est.ubicacion === ubicacionSeleccionada)
                  .map((est, index) => (
                    est && est.ubicacion ? (
                      <tr key={est.ubicacion || index}>
                        <td>{est.ubicacion}</td>
                        <td>{est.num_aires ?? 'N/A'}</td>
                        <td>{est.temperatura_promedio?.toFixed(1) ?? 'N/A'} °C</td>
                        <td>{est.temperatura_min?.toFixed(1) ?? 'N/A'} °C</td>
                        <td>{est.temperatura_max?.toFixed(1) ?? 'N/A'} °C</td>
                        <td>{est.humedad_promedio?.toFixed(1) ?? 'N/A'} %</td>
                        <td>{est.humedad_min?.toFixed(1) ?? 'N/A'} %</td>
                        <td>{est.humedad_max?.toFixed(1) ?? 'N/A'} %</td>
                        <td>{est.lecturas_totales ?? 'N/A'}</td>
                      </tr>
                    ) : null
                  ))
                }
              </tbody>
            </Table>
          ) : (
            <div className="text-center p-5 text-muted">
                No hay datos de ubicaciones disponibles
                {ubicacionSeleccionada ? ` para "${ubicacionSeleccionada}"` : ""}.
            </div>
          )}
        </Card.Body>
      </Card>

      {/* --- Sección del Gráfico --- */}
      {ubicacionSeleccionada && ( // Mostrar solo si hay una ubicación seleccionada
        <Card className="dashboard-card">
          <Card.Header><h5 className="mb-0">Gráfico de Variaciones: {ubicacionSeleccionada}</h5></Card.Header>
          <Card.Body>
            {lecturasUbicacionLoading ? (
              <div className="text-center p-5">
                <Spinner animation="border" size="sm" variant="info" className="me-2" /> Cargando datos del gráfico...
              </div>
            ) : lecturasUbicacionError ? (
              <Alert variant="warning">
                Error al cargar datos del gráfico: {lecturasUbicacionError}
              </Alert>
            ) : lecturasUbicacion.length > 0 ? (
              // Contenedor para el gráfico con altura definida
              <div style={{ height: '300px', position: 'relative' }}>
                <Line options={chartOptions} data={chartData} />
              </div>
            ) : (
              <div className="text-center p-5 text-muted">
                No hay suficientes datos de lecturas para generar el gráfico para "{ubicacionSeleccionada}".
              </div>
            )}
          </Card.Body>
        </Card>
      )}
      {/* --- Fin Sección del Gráfico --- */}

    </div>
  );
};

// PropTypes (sin cambios)
EstadisticasPorUbicacion.propTypes = {
  // ... (propTypes existentes) ...
   ubicaciones: PropTypes.arrayOf(PropTypes.string),
  ubicacionSeleccionada: PropTypes.string,
  setUbicacionSeleccionada: PropTypes.func.isRequired,
  estadisticasUbicacion: PropTypes.arrayOf(PropTypes.shape({
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
  })),
  loadingUbicacion: PropTypes.bool.isRequired,
};

export default EstadisticasPorUbicacion;
