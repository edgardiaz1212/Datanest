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
import ChartContainer from './ChartContainer.jsx'; // <-- AÑADIR ESTA LÍNEA
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
  loadingUbicacion, // Este loading es para la tabla/selector
  // --- Nuevas props para rango de fechas ---
  fechaDesde,
  setFechaDesde,
  fechaHasta,
  setFechaHasta,
  // --- Nuevas props para datos y carga de las nuevas gráficas ---
  datosGraficoPromedioHoraTemp,
  datosGraficoPromedioHoraHum,
  datosGraficoPorComponenteTemp,
  datosGraficoPorComponenteHum,
  loadingGraficasUbicacion // Un estado de carga general para las gráficas de esta pestaña
}) => {
  const { store, actions } = useContext(Context);

  // --- useEffect para buscar datos del gráfico ---
  useEffect(() => {
        console.log("EstPorUbicacion: Ubicación seleccionada cambió a:", ubicacionSeleccionada);

    // Llama a la acción para buscar lecturas cuando cambia la ubicación seleccionada
    actions.fetchLecturasPorUbicacion(ubicacionSeleccionada);
    // Si fetchLecturasPorUbicacion se actualiza para tomar fechas, se añadirían aquí:
    // actions.fetchLecturasPorUbicacion(ubicacionSeleccionada, fechaDesde, fechaHasta);
  }, [ubicacionSeleccionada, actions, fechaDesde, fechaHasta]); // Depende de la ubicación, fechas y actions
  // --- Fin useEffect ---

 // Log para ver qué llega al componente
  console.log("EstPorUbicacion: Renderizando con datos para gráficas:",
              "PromedioHoraTemp:", datosGraficoPromedioHoraTemp,
              "PorComponenteTemp:", datosGraficoPorComponenteTemp,
              "Ubicacion Seleccionada:", ubicacionSeleccionada);

  const commonChartOptions = {
    responsive: true,
    maintainAspectRatio: false, // Para controlar altura con CSS o contenedor
    interaction: {
      mode: 'index',
      intersect: false,
    },
    stacked: false,
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
        {/* --- Selectores de Fecha --- */}
        {ubicacionSeleccionada && ( // Mostrar solo si hay una ubicación seleccionada
          <>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Fecha Desde</Form.Label>
                <Form.Control
                  type="date"
                  value={fechaDesde || ''}
                  onChange={e => setFechaDesde(e.target.value)}
                  disabled={loadingUbicacion || loadingGraficasUbicacion}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Fecha Hasta</Form.Label>
                <Form.Control
                  type="date"
                  value={fechaHasta || ''}
                  onChange={e => setFechaHasta(e.target.value)}
                  disabled={loadingUbicacion || loadingGraficasUbicacion}
                />
              </Form.Group>
            </Col>
          </>
        )}
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
                  <th><FiUsers className="me-1" />Dispositivos</th> {/* O "Total Disp." */}
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
                        <td>{est.num_dispositivos_total ?? est.num_aires ?? 'N/A'}</td> {/* Prioriza el total, fallback a num_aires */}
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

      {/* --- Sección de Gráficas para Ubicación Seleccionada --- */}
      {ubicacionSeleccionada && ( // Mostrar solo si hay una ubicación seleccionada
        <>
          {/* Gráfica 1: Promedios por Hora */}
          <Row className="mt-4">
            <Col md={6} className="mb-4">
              <ChartContainer
                title={`Promedio Temperatura por Hora - ${ubicacionSeleccionada}`}
                yAxisLabel="Temperatura (°C)"
                data={datosGraficoPromedioHoraTemp} // Prop desde Estadisticas.jsx
                loading={loadingGraficasUbicacion}
                type={'line'}
                chartOptions={{...commonChartOptions, plugins: { ...commonChartOptions.plugins, title: { display: true, text: `Promedio Temperatura por Hora - ${ubicacionSeleccionada}`}}}}
              />
            </Col>
            <Col md={6} className="mb-4">
              <ChartContainer
                title={`Promedio Humedad por Hora - ${ubicacionSeleccionada}`}
                yAxisLabel="Humedad (%)"
                data={datosGraficoPromedioHoraHum} // Prop desde Estadisticas.jsx
                loading={loadingGraficasUbicacion}
                type={'line'}
                chartOptions={{...commonChartOptions, plugins: { ...commonChartOptions.plugins, title: { display: true, text: `Promedio Humedad por Hora - ${ubicacionSeleccionada}`}}}}
              />
            </Col>
          </Row>

          {/* Gráfica 2: Lecturas por Componente */}
          <Row className="mt-4">
            <Col md={6} className="mb-4">
              <ChartContainer
                title={`Temperatura por Dispositivo - ${ubicacionSeleccionada}`}
                yAxisLabel="Temperatura (°C)"
                data={datosGraficoPorComponenteTemp} // Prop desde Estadisticas.jsx (debe tener múltiples datasets)
                loading={loadingGraficasUbicacion}
                type={'line'}
                chartOptions={{...commonChartOptions, plugins: { ...commonChartOptions.plugins, title: { display: true, text: `Temperatura por Dispositivo - ${ubicacionSeleccionada}`}, legend: { display: true, position: 'bottom' }}}}
              />
            </Col>
            <Col md={6} className="mb-4">
              <ChartContainer
                title={`Humedad por Dispositivo - ${ubicacionSeleccionada}`}
                yAxisLabel="Humedad (%)"
                data={datosGraficoPorComponenteHum} // Prop desde Estadisticas.jsx (debe tener múltiples datasets)
                loading={loadingGraficasUbicacion}
                type={'line'}
                chartOptions={{...commonChartOptions, plugins: { ...commonChartOptions.plugins, title: { display: true, text: `Humedad por Dispositivo - ${ubicacionSeleccionada}`}, legend: { display: true, position: 'bottom' }}}}
              />
            </Col>
          </Row>
        </>
      )}

      {!ubicacionSeleccionada && !loadingUbicacion && (
        <Card className="mt-4">
          <Card.Body className="text-center p-5">
            <FiMapPin size={50} className="text-muted mb-3" />
            <h4>Seleccione una ubicación para ver sus estadísticas detalladas y gráficos.</h4>
          </Card.Body>
        </Card>
      )}
      {/* --- Fin Sección del Gráfico --- */}

    </div>
  );
};

EstadisticasPorUbicacion.propTypes = {
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
  fechaDesde: PropTypes.string,
  setFechaDesde: PropTypes.func,
  fechaHasta: PropTypes.string,
  setFechaHasta: PropTypes.func,
  datosGraficoPromedioHoraTemp: PropTypes.object,
  datosGraficoPromedioHoraHum: PropTypes.object,
  datosGraficoPorComponenteTemp: PropTypes.object,
  datosGraficoPorComponenteHum: PropTypes.object,
  loadingGraficasUbicacion: PropTypes.bool,
};

export default EstadisticasPorUbicacion;
