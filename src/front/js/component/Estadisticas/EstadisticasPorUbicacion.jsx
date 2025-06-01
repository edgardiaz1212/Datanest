import React, { useState, useEffect, useContext, useCallback } from 'react'; // Añadir useState, useCallback
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
import { format } from 'date-fns'; // Importar format
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
  fechaHasta, // Mantener fechaHasta y setFechaHasta
  setFechaHasta, // Mantener fechaHasta y setFechaHasta
  // Ya no se reciben datos de gráficos pre-procesados ni su loading
  // datosGraficoPromedioHoraTemp,
  // datosGraficoPromedioHoraHum,
  // loadingGraficasUbicacion
}) => {
  const { store, actions } = useContext(Context);

  // Estado local para los gráficos de esta pestaña
  const [graficoPromedioHoraTempLocal, setGraficoPromedioHoraTempLocal] = useState(null);
  const [graficoPromedioHoraHumLocal, setGraficoPromedioHoraHumLocal] = useState(null);
  const [graficoPorDispositivoTempLocal, setGraficoPorDispositivoTempLocal] = useState(null);
  const [graficoPorDispositivoHumLocal, setGraficoPorDispositivoHumLocal] = useState(null);
  const [loadingGraficasLocal, setLoadingGraficasLocal] = useState(false);

  // Definición local de procesarLecturasParaTimeScale para encapsulación
  const procesarLecturasParaTimeScaleLocal = useCallback((
    lecturas,
    filterFechaDesde,
    filterFechaHasta,
    promediarPorHora = false,
    maxPuntos = 50
  ) => {
    if (!lecturas || !Array.isArray(lecturas) || lecturas.length === 0) return { tempData: [], humData: [] };

    let tempData = [];
    let humData = [];

    let lecturasFiltradas = lecturas;
    if (filterFechaDesde && filterFechaHasta) {
      const desde = new Date(filterFechaDesde);
      const hasta = new Date(filterFechaHasta);
      hasta.setHours(23, 59, 59, 999);
      lecturasFiltradas = lecturas.filter(l => {
        try {
          const fechaLectura = new Date(l.fecha);
          return !isNaN(fechaLectura.getTime()) && fechaLectura >= desde && fechaLectura <= hasta;
        } catch (e) { return false; }
      });
    }
    if (!lecturasFiltradas || lecturasFiltradas.length === 0) return { tempData: [], humData: [] };

    if (promediarPorHora) {
        const lecturasPorHora = lecturasFiltradas.reduce((acc, l) => {
            try {
                const fechaHora = new Date(l.fecha);
                if (isNaN(fechaHora.getTime())) return acc;
                const claveHora = format(fechaHora, 'yyyy-MM-dd-HH');
                if (!acc[claveHora]) {
                    acc[claveHora] = { fechaOriginal: fechaHora, temps: [], hums: [] };
                }
                if (typeof l.temperatura === 'number' && !isNaN(l.temperatura)) {
                    acc[claveHora].temps.push(l.temperatura);
                }
                if (typeof l.humedad === 'number' && !isNaN(l.humedad)) {
                    acc[claveHora].hums.push(l.humedad);
                }
                return acc;
            } catch (e) {
                console.warn("Error procesando fecha en agrupación por hora:", l.fecha, e);
                return acc;
            }
        }, {});
        
        const promediosHorarios = Object.values(lecturasPorHora)
            .map(data => {
                const avgTemp = data.temps.length > 0 ? data.temps.reduce((a, b) => a + b, 0) / data.temps.length : null;
                const avgHum = data.hums.length > 0 ? data.hums.reduce((a, b) => a + b, 0) / data.hums.length : null;
                return {
                    x: data.fechaOriginal,
                    avgTemp: avgTemp !== null ? parseFloat(avgTemp.toFixed(1)) : null,
                    avgHum: avgHum !== null ? parseFloat(avgHum.toFixed(1)) : null,
                };
            })
            .sort((a, b) => a.x.getTime() - b.x.getTime());

        const limitedPromedios = promediosHorarios.slice(-maxPuntos);
        tempData = limitedPromedios.filter(p => p.avgTemp !== null).map(p => ({ x: p.x, y: p.avgTemp }));
        humData = limitedPromedios.filter(p => p.avgHum !== null).map(p => ({ x: p.x, y: p.avgHum }));
    } else {
        const sortedLecturas = [...lecturasFiltradas].sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
        const limitedLecturas = sortedLecturas.slice(-maxPuntos);
        tempData = limitedLecturas
            .filter(l => typeof l.temperatura === 'number' && !isNaN(l.temperatura))
            .map(l => ({ x: new Date(l.fecha), y: l.temperatura }));
        humData = limitedLecturas
            .filter(l => typeof l.humedad === 'number' && !isNaN(l.humedad))
            .map(l => ({ x: new Date(l.fecha), y: l.humedad }));
    }
    return { tempData, humData };
  }, []);

  useEffect(() => {
    const fetchAndProcessDataForLocationCharts = async () => {
      if (ubicacionSeleccionada && fechaDesde && fechaHasta) {
        setLoadingGraficasLocal(true);
        try {
          // La acción actualiza store.lecturasUbicacion
          await actions.fetchLecturasPorUbicacion(ubicacionSeleccionada, fechaDesde, fechaHasta);
          console.log(`EstPorUbicacion - Acción fetchLecturasPorUbicacion llamada para: ${ubicacionSeleccionada}, Desde: ${fechaDesde}, Hasta: ${fechaHasta}`);
          // Acceder a los datos actualizados del store
          const lecturasFetched = store.lecturasUbicacion || [];
          console.log("EstPorUbicacion - Lecturas Fetched del Store:", JSON.parse(JSON.stringify(lecturasFetched.slice(0, 10)))); // Loguear solo las primeras 10 para no saturar consola

          if (lecturasFetched.length > 0) {
            console.log("EstPorUbicacion - Procesando lecturas para gráficos...");
            const { tempData: promedioTempData, humData: promedioHumData } = procesarLecturasParaTimeScaleLocal(
              lecturasFetched,
              fechaDesde, // Se pasan para mantener la consistencia del contexto, aunque lecturasFetched ya debería estar filtrado
              fechaHasta,
              true, // Promediar por hora
              200   // Máximo 200 puntos
            );
            console.log("EstPorUbicacion - Datos Promedio Hora Temp:", JSON.parse(JSON.stringify(promedioTempData.slice(0,5))));
            setGraficoPromedioHoraTempLocal({ datasets: [{ label: 'Temperatura Promedio °C', data: promedioTempData, borderColor: 'rgba(255, 99, 132, 1)', tension: 0.1 }] });
            setGraficoPromedioHoraHumLocal({ datasets: [{ label: 'Humedad Promedio %', data: promedioHumData, borderColor: 'rgba(54, 162, 235, 1)', tension: 0.1 }] });

            // --- Lógica para Gráficas por Dispositivo ---
            console.log("EstPorUbicacion - Iniciando agrupación por dispositivo...");
            const readingsByDevice = lecturasFetched.reduce((acc, lectura) => {
              // Determinar el ID del dispositivo y el nombre
              let deviceId = null;
              let deviceName = lectura.nombre_dispositivo; // Usar el nombre que ya viene del backend

              if (lectura.aire_id) {
                deviceId = `aire-${lectura.aire_id}`; // Prefijo para unicidad
              } else if (lectura.otro_equipo_id) {
                deviceId = `otro-${lectura.otro_equipo_id}`; // Prefijo para unicidad
              }

              if (!deviceId) { // Si no tiene ni aire_id ni otro_equipo_id, no se puede agrupar
                // console.warn("EstPorUbicacion - Lectura sin aire_id ni otro_equipo_id:", JSON.parse(JSON.stringify(lectura)));
                return acc;
              }

              if (!deviceName) { // Fallback si nombre_dispositivo no viene (aunque el log muestra que sí)
                deviceName = `Dispositivo ${deviceId}`;
              }

              if (!acc[deviceId]) {
                  acc[deviceId] = {
                      nombre: deviceName, // Usar el nombre determinado
                      lecturas: []
                  };
              }
              acc[deviceId].lecturas.push(lectura);
              return acc;
            }, {});
            console.log("EstPorUbicacion - Lecturas agrupadas por dispositivo (primeros 2 dispositivos):", 
              Object.fromEntries(Object.entries(readingsByDevice).slice(0, 2).map(([key, value]) => [key, {...value, lecturas: value.lecturas.length + " lecturas"}]))
            );

            const tempDatasetsDevice = [];
            const humDatasetsDevice = [];
            const deviceColors = [
                'rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)', 'rgba(153, 102, 255, 1)', 'rgba(255, 159, 64, 1)',
                'rgba(199, 199, 199, 1)', 'rgba(83, 102, 83, 1)', 'rgba(210, 130, 30, 1)',
                'rgba(30, 210, 130, 1)', 'rgba(130, 30, 210, 1)', 'rgba(100, 100, 100, 1)'
            ];
            let colorIndex = 0;

            for (const deviceId in readingsByDevice) {
                
                const deviceData = readingsByDevice[deviceId];
                console.log(`EstPorUbicacion - Procesando para Dispositivo: ${deviceData.nombre} (ID: ${deviceId}), ${deviceData.lecturas.length} lecturas`);
                const { tempData: deviceTempData, humData: deviceHumData } = procesarLecturasParaTimeScaleLocal(
                    deviceData.lecturas,
                    fechaDesde,
                    fechaHasta,
                    false, // No promediar por hora para detalle por dispositivo
                    500    // Máximo 500 puntos por dispositivo (aumentado)
                );
                
                console.log(`  ${deviceData.nombre} - DeviceTempData (${deviceTempData.length}):`, JSON.parse(JSON.stringify(deviceTempData.slice(0, 3))));
                console.log(`  ${deviceData.nombre} - DeviceHumData (${deviceHumData.length}):`, JSON.parse(JSON.stringify(deviceHumData.slice(0, 3))));
                
                const color = deviceColors[colorIndex % deviceColors.length];
                colorIndex++;

                if (deviceTempData.length > 0) {
                    tempDatasetsDevice.push({
                        label: `Temp ${deviceData.nombre}`, data: deviceTempData, borderColor: color, tension: 0.1, fill: false
                    });
                }
                if (deviceHumData.length > 0) {
                    humDatasetsDevice.push({
                        label: `Hum ${deviceData.nombre}`, data: deviceHumData, borderColor: color, tension: 0.1, fill: false,
                        yAxisID: 'y1' // <-- ASEGURAR QUE EL GRÁFICO DE HUMEDAD USE EL EJE Y1
                    });
                }
            }
            console.log("EstPorUbicacion - Temp Datasets por Dispositivo (final):", JSON.parse(JSON.stringify(tempDatasetsDevice.map(ds => ({label: ds.label, dataLength: ds.data.length})))));
            console.log("EstPorUbicacion - Hum Datasets por Dispositivo (final):", JSON.parse(JSON.stringify(humDatasetsDevice.map(ds => ({label: ds.label, dataLength: ds.data.length})))));

            setGraficoPorDispositivoTempLocal({ datasets: tempDatasetsDevice });
            setGraficoPorDispositivoHumLocal({ datasets: humDatasetsDevice });

          } else {
            console.log("EstPorUbicacion - No hay lecturasFetched, limpiando gráficos.");
            setGraficoPromedioHoraTempLocal(null);
            setGraficoPromedioHoraHumLocal(null);
            setGraficoPorDispositivoTempLocal(null);
            setGraficoPorDispositivoHumLocal(null);
          }
        } catch (error) {
            console.error("EstPorUbicacion - Error en fetchAndProcessDataForLocationCharts:", error);
            setGraficoPromedioHoraTempLocal(null);
            setGraficoPromedioHoraHumLocal(null);
            setGraficoPorDispositivoTempLocal(null);
            setGraficoPorDispositivoHumLocal(null);
        } finally {
            setLoadingGraficasLocal(false);
        }
      } else {
        // Limpiar gráficos si no hay ubicación o rango de fechas
        // console.log("EstPorUbicacion - Sin ubicación seleccionada o rango de fechas, limpiando gráficos.");
        setGraficoPromedioHoraTempLocal(null);
        setGraficoPromedioHoraHumLocal(null);
        setGraficoPorDispositivoTempLocal(null);
        setGraficoPorDispositivoHumLocal(null);
        setLoadingGraficasLocal(false); // Asegurar que el loading esté en false
      }
    };

    fetchAndProcessDataForLocationCharts();
    // Dependencias: se ejecuta cuando cambia la ubicación, las fechas, o las acciones/funciones de procesamiento.
    // NO incluir store.lecturasUbicacion aquí para evitar bucles si este efecto es el que llama a la acción que lo modifica.
  }, [ubicacionSeleccionada, fechaDesde, fechaHasta, actions, procesarLecturasParaTimeScaleLocal]);


  // Log para ver qué se renderiza
  // console.log("EstPorUbicacion: Renderizando con datos locales para gráficas:",
  //             "PromedioHoraTempLocal:", graficoPromedioHoraTempLocal ? graficoPromedioHoraTempLocal.datasets[0].data.length : 0,
  //             "Ubicacion Seleccionada:", ubicacionSeleccionada,
  //             "GraficoPorDispositivoTempLocal:", graficoPorDispositivoTempLocal ? graficoPorDispositivoTempLocal.datasets.map(d => d.data.length) : [],
  //             "LoadingGraficasLocal:", loadingGraficasLocal);

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
                  onChange={e => {
                    console.log("onChange fechaDesde - typeof setFechaDesde:", typeof setFechaDesde); // DEBUG
                    if (typeof setFechaDesde === 'function') setFechaDesde(e.target.value);
                  }}
                  disabled={loadingUbicacion || loadingGraficasLocal}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Fecha Hasta</Form.Label>
                <Form.Control
                  type="date"
                  value={fechaHasta || ''}
                  onChange={e => {
                    console.log("onChange fechaHasta - typeof setFechaHasta:", typeof setFechaHasta); // DEBUG
                    if (typeof setFechaHasta === 'function') setFechaHasta(e.target.value);
                  }}
                  disabled={loadingUbicacion || loadingGraficasLocal}
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
                data={graficoPromedioHoraTempLocal} // Usar estado local
                loading={loadingGraficasLocal}      // Usar estado local
                type={'line'}
                chartOptions={{...commonChartOptions, plugins: { ...commonChartOptions.plugins, title: { display: true, text: `Promedio Temperatura por Hora - ${ubicacionSeleccionada}`}}}}
              />
            </Col>
            <Col md={6} className="mb-4">
              <ChartContainer
                title={`Promedio Humedad por Hora - ${ubicacionSeleccionada}`}
                yAxisLabel="Humedad (%)"
                data={graficoPromedioHoraHumLocal}  // Usar estado local
                loading={loadingGraficasLocal}       // Usar estado local
                type={'line'}
                chartOptions={{...commonChartOptions, plugins: { ...commonChartOptions.plugins, title: { display: true, text: `Promedio Humedad por Hora - ${ubicacionSeleccionada}`}}}}
              />
            </Col>
          </Row>

          {/* Gráficas por Dispositivo */}
          <Row className="mt-4">
            <Col md={6} className="mb-4">
              <ChartContainer
                title={`Temperatura por Dispositivo - ${ubicacionSeleccionada}`}
                yAxisLabel="Temperatura (°C)"
                data={graficoPorDispositivoTempLocal}
                loading={loadingGraficasLocal}
                type={'line'}
                chartOptions={{...commonChartOptions, plugins: { ...commonChartOptions.plugins, title: { display: true, text: `Temperatura por Dispositivo - ${ubicacionSeleccionada}`}, legend: { display: true, position: 'bottom' }}}}
              />
            </Col>
            <Col md={6} className="mb-4">
              <ChartContainer
                title={`Humedad por Dispositivo - ${ubicacionSeleccionada}`}
                yAxisLabel="Humedad (%)"
                data={graficoPorDispositivoHumLocal}
                loading={loadingGraficasLocal}
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
  fechaDesde: PropTypes.string.isRequired,
  setFechaDesde: PropTypes.func.isRequired,
  fechaHasta: PropTypes.string.isRequired,
  setFechaHasta: PropTypes.func.isRequired,
  // Se eliminan las props de datos de gráficos y su loading
  // datosGraficoPromedioHoraTemp: PropTypes.object,
  // datosGraficoPromedioHoraHum: PropTypes.object,
  // loadingGraficasUbicacion: PropTypes.bool,
};

export default EstadisticasPorUbicacion;
