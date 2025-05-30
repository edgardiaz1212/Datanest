import React, { useState, useEffect, useCallback, useContext } from 'react';
import { Tabs, Tab, Spinner, Alert } from 'react-bootstrap';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title, // Mantener Title
  Tooltip,
  Legend,
} from 'chart.js';
import { format } from 'date-fns'; // Use date-fns for formatting
import { FiBarChart2, FiMapPin, FiWind } from 'react-icons/fi';
// Import your Flux context
import { Context } from '../store/appContext';

import EstadisticasGeneral from '../component/Estadisticas/EstadisticasGeneral.jsx';
import EstadisticasPorAire from '../component/Estadisticas/EstadisticasPorAire.jsx';
import EstadisticasPorUbicacion from '../component/Estadisticas/EstadisticasPorUbicacion.jsx'

// Register ChartJS components (needs to be done once)
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// --- Componente Estadisticas (Contenedor Principal) ---
const Estadisticas = () => { // Remove : React.FC
  // --- Get Store and Actions from Context ---
  const { store, actions } = useContext(Context);
  const {
    // Data from store
    aires,
    ubicaciones,
    umbrales,
    estadisticasGenerales,
    estadisticasAire,
    estadisticasUbicacion,
    _rawLecturasGenerales, // Raw data for general charts
    _rawLecturasAire,      // Raw data for specific AC charts
    // Loading states from store
    statsLoadingGeneral,
    statsLoadingAire,
    statsLoadingUbicacion,
    statsLoadingChartsGeneral, // We'll manage chart loading locally after processing
    statsLoadingChartsAire,    // We'll manage chart loading locally after processing
    statsLoadingUmbrales,
    statsError: error, // Rename for clarity
  } = store;
  const {
    fetchEstadisticasIniciales,
    fetchEstadisticasAire,
    clearStatsError,
  } = actions;

  // --- Local State ---
  const [aireSeleccionado, setAireSeleccionado] = useState(null); // number | null -> null
  const [ubicacionSeleccionada, setUbicacionSeleccionada] = useState(null); // string | null -> null
  // --- State for Date Range Filter (shared or specific) ---
  const today = new Date();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 7);

  // Local state for processed chart data and their loading status
  // For "Por Aire" tab
  const [graficoGeneralTemp, setGraficoGeneralTemp] = useState(null);
  const [graficoGeneralHum, setGraficoGeneralHum] = useState(null);
  const [graficoComparativoTemp, setGraficoComparativoTemp] = useState(null);
  const [graficoComparativoHum, setGraficoComparativoHum] = useState(null);
  const [graficoAireTemp, setGraficoAireTemp] = useState(null);
  const [graficoAireHum, setGraficoAireHum] = useState(null);
  // For "Por Ubicacion" tab
  const [graficoUbicacionPromedioTemp, setGraficoUbicacionPromedioTemp] = useState(null);
  const [graficoUbicacionPromedioHum, setGraficoUbicacionPromedioHum] = useState(null);
  const [graficoUbicacionComponentesTemp, setGraficoUbicacionComponentesTemp] = useState(null);
  const [graficoUbicacionComponentesHum, setGraficoUbicacionComponentesHum] = useState(null);

  const [loadingChartsGeneralLocal, setLoadingChartsGeneralLocal] = useState(true);
  const [loadingChartsAireLocal, setLoadingChartsAireLocal] = useState(false);
  const [loadingChartsUbicacionLocal, setLoadingChartsUbicacionLocal] = useState(false); // State for Ubicacion charts loading
  const [fechaDesde, setFechaDesde] = useState(sevenDaysAgo.toISOString().split('T')[0]);
  const [fechaHasta, setFechaHasta] = useState(today.toISOString().split('T')[0]);

  // --- Helper Functions for Processing Data (remove type annotations) ---

  // Renombrado y refactorizado para devolver datos para TimeScale
  const procesarLecturasParaTimeScale = useCallback((
    lecturas, // : Lectura[]
    filterFechaDesde, // : string | null
    filterFechaHasta, // : string | null
    promediarPorHora = false,
    maxPuntos = 50
  ) => { // Devuelve: { tempData: {x: Date, y: number}[], humData: {x: Date, y: number}[] }
    if (!lecturas || !Array.isArray(lecturas) || lecturas.length === 0) return { tempData: [], humData: [] };

    let tempData = [];
    let humData = [];

    // Filtrar lecturas por rango de fecha si se proporcionan
    let lecturasFiltradas = lecturas;
    if (filterFechaDesde && filterFechaHasta) {
      const desde = new Date(filterFechaDesde);
      // Ajustar 'hasta' para incluir todo el día
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
                if (isNaN(fechaHora.getTime())) return acc; // Saltar fechas inválidas

                // Clave como 'YYYY-MM-DD-HH' para agrupar
                const claveHora = format(fechaHora, 'yyyy-MM-dd-HH');

                if (!acc[claveHora]) {
                    acc[claveHora] = {
                        fechaOriginal: fechaHora, // Guardar la primera fecha de esta hora para ordenamiento
                        temps: [], // Almacenar todas las temperaturas de esa hora
                        hums: []  // Almacenar todas las humedades de esa hora
                    };
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

    } else { // Lecturas individuales
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

  const procesarUbicacionesParaGrafico = useCallback((stats) => { // Remove type : EstadisticasUbicacion[]
    if (!stats || !Array.isArray(stats) || stats.length === 0) return null;

    const labels = stats.map(s => s.ubicacion);
    const tempAvgData = stats.map(s => s.temperatura_promedio);
    const humAvgData = stats.map(s => s.humedad_promedio);

    const backgroundColors = [ // Define colors
      'rgba(255, 99, 132, 0.7)', 'rgba(54, 162, 235, 0.7)', 'rgba(255, 206, 86, 0.7)',
      'rgba(75, 192, 192, 0.7)', 'rgba(153, 102, 255, 0.7)', 'rgba(255, 159, 64, 0.7)',
      // Add more colors if needed
    ];

    const tempChart = { // Remove type : ChartDataType
      labels,
      datasets: [{
        label: 'Temperatura Promedio °C',
        data: tempAvgData,
        backgroundColor: backgroundColors.slice(0, labels.length) // Assign colors
      }]
    };
    const humChart = { // Remove type : ChartDataType
      labels,
      datasets: [{
        label: 'Humedad Promedio %',
        data: humAvgData,
        backgroundColor: backgroundColors.slice(0, labels.length).reverse() // Different colors/order
      }]
    };
    return { tempChart, humChart };
  }, []); // Empty dependency array

  // --- Effects ---

  // Fetch initial data on mount
  useEffect(() => {
    fetchEstadisticasIniciales();
    // Cleanup function
    return () => {
      if (clearStatsError) clearStatsError();
    };
  }, [fetchEstadisticasIniciales, clearStatsError]); // Add dependencies

  // Process general charts when raw data or umbrales change
  useEffect(() => {
    setLoadingChartsGeneralLocal(true);
    if (_rawLecturasGenerales && Array.isArray(umbrales)) {
      const umbralesGlobalesActivos = umbrales.filter(u => u.es_global && u.notificar_activo);
      // Llamar con promediarPorHora = true y, por ejemplo, las últimas 48 horas
      // Para gráficos generales, no aplicamos el filtro de fechaDesde/fechaHasta del estado local,
      // ya que estos son para el filtro específico de "Por Aire" o "Por Ubicación".
      const { tempData: generalTempData, humData: generalHumData } = procesarLecturasParaTimeScale(
        _rawLecturasGenerales,
        null, // Sin filtro de fecha para gráficos generales
        null, // Sin filtro de fecha para gráficos generales
        true, 48 // Promediar, últimas 48 horas
      );

      const createThresholdDataset = (label, value, color) => {
        if (value === undefined || value === null) return null;
        // Para TimeScale, los umbrales también necesitan datos {x,y} o ser una anotación.
        // Por simplicidad aquí, si tenemos datos, extendemos el umbral a lo largo del rango de datos.
        // Una mejor solución sería usar el plugin de anotaciones de Chart.js.
        // Esta es una aproximación simple:
        const dataPoints = generalTempData.length > 0 ? generalTempData : (generalHumData.length > 0 ? generalHumData : []);
        if (dataPoints.length === 0) return null;
        const firstX = dataPoints[0].x;
        const lastX = dataPoints[dataPoints.length - 1].x;

        return {
          label: label,
          data: [{x: firstX, y: value}, {x: lastX, y: value}], // Línea de umbral
          borderColor: color,
          borderWidth: 1.5,
          borderDash: [5, 5],
          pointRadius: 0,
          fill: false,
          tension: 0,
          type: 'line' // Asegurar que se renderice como línea
        };
      };

      setGraficoGeneralTemp({ datasets: [{ label: 'Temperatura °C', data: generalTempData, borderColor: 'rgba(255, 99, 132, 1)', tension: 0.1 }] });
      setGraficoGeneralHum({ datasets: [{ label: 'Humedad %', data: generalHumData, borderColor: 'rgba(54, 162, 235, 1)', tension: 0.1 }] });
    } else {
      setGraficoGeneralTemp(null);
      setGraficoGeneralHum(null);
    }
    setLoadingChartsGeneralLocal(false);
  }, [_rawLecturasGenerales, umbrales, procesarLecturasParaTimeScale]); // Depend on raw data and umbrales

  // Process comparison charts when location stats change
  useEffect(() => {
    setLoadingChartsGeneralLocal(true); // Use general loading as it's on the same tab
    if (estadisticasUbicacion) {
      const comparativoChartData = procesarUbicacionesParaGrafico(estadisticasUbicacion);
      setGraficoComparativoTemp(comparativoChartData?.tempChart || null);
      setGraficoComparativoHum(comparativoChartData?.humChart || null);
    } else {
      setGraficoComparativoTemp(null);
      setGraficoComparativoHum(null);
    }
    setLoadingChartsGeneralLocal(false);
  }, [estadisticasUbicacion, procesarUbicacionesParaGrafico]); // Depend on location stats

  // Fetch and process specific AC data when aireSeleccionado changes
  useEffect(() => {
    // Fetch data using Flux action
    fetchEstadisticasAire(aireSeleccionado);
  }, [aireSeleccionado, fetchEstadisticasAire]); // Depend only on selection and action

  // Process specific AC charts when raw data or umbrales change
  useEffect(() => {
    setLoadingChartsAireLocal(true);
    if (_rawLecturasAire && Array.isArray(umbrales) && aireSeleccionado !== null) {
      const umbralesParaAire = umbrales.filter(u =>
        u.notificar_activo && (u.es_global || u.aire_id === aireSeleccionado)
      );
      // Aplicar el filtro de fechaDesde y fechaHasta del estado local
      const { tempData: aireTempData, humData: aireHumData } = procesarLecturasParaTimeScale(
        _rawLecturasAire,
        fechaDesde,
        fechaHasta,
        false, // No promediar por hora para la vista detallada por aire
        200 // Mostrar hasta 200 puntos individuales (o ajustar según necesidad)
      );

      setGraficoAireTemp({ datasets: [{ label: 'Temperatura °C', data: aireTempData, borderColor: 'rgba(255, 99, 132, 1)', tension: 0.1 }] });
      setGraficoAireHum({ datasets: [{ label: 'Humedad %', data: aireHumData, borderColor: 'rgba(54, 162, 235, 1)', tension: 0.1 }] });
    } else {
      // Clear charts if no AC selected or data missing
      setGraficoAireTemp(null);
      setGraficoAireHum(null);
    }
    setLoadingChartsAireLocal(false);
  }, [_rawLecturasAire, umbrales, aireSeleccionado, fechaDesde, fechaHasta, procesarLecturasParaTimeScale]);

  // --- Effect for "Por Ubicación" charts ---
  useEffect(() => {
    const fetchAndProcessUbicacionData = async () => {
      setLoadingChartsUbicacionLocal(true); // Start loading
      if (ubicacionSeleccionada) {
        // Fetch readings for selected location with date range
        await actions.fetchLecturasPorUbicacion(ubicacionSeleccionada, fechaDesde, fechaHasta);
        const lecturas = store.lecturasUbicacion || [];
        if (lecturas.length > 0) {
          // Process general average per hour
          const { tempData: promedioTempData, humData: promedioHumData } = procesarLecturasParaTimeScale(
            lecturas, fechaDesde, fechaHasta, true, 200 // Max 200 promedios horarios
          );

          setGraficoUbicacionPromedioTemp({ datasets: [{ label: 'Temperatura Promedio °C', data: promedioTempData, borderColor: 'rgba(255, 99, 132, 1)', tension: 0.1 }] });
          setGraficoUbicacionPromedioHum({ datasets: [{ label: 'Humedad Promedio %', data: promedioHumData, borderColor: 'rgba(54, 162, 235, 1)', tension: 0.1 }] });


          // Process combined data per device (air conditioners) in location
          // Group readings by device id
          const readingsByDevice = lecturas.reduce((acc, lectura) => {
            if (!lectura.dispositivo_id) return acc;
            if (!acc[lectura.dispositivo_id]) acc[lectura.dispositivo_id] = [];
            acc[lectura.dispositivo_id].push(lectura);
            return acc;
          }, {});

          // For each device, process readings to get temp and hum datasets
          const tempDatasets = [];
          const humDatasets = [];
          const colors = [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)',
          ];
          let colorIndex = 0;

          for (const [deviceId, deviceReadings] of Object.entries(readingsByDevice)) {
            // Identificar el nombre del dispositivo
            const aireInfo = aires.find(a => a.id === parseInt(deviceId)); // Asumiendo que deviceId es de un aire
            const deviceName = aireInfo ? aireInfo.nombre : `Dispositivo ${deviceId}`;

            const { tempData: deviceTempData, humData: deviceHumData } = procesarLecturasParaTimeScale(
              deviceReadings, fechaDesde, fechaHasta, true, 200 // Promediar por hora, max 200 puntos
            );

            if (deviceTempData.length > 0 || deviceHumData.length > 0) {
              const color = colors[colorIndex % colors.length];
              colorIndex++;
              if (deviceTempData.length > 0) {
                tempDatasets.push({
                  label: `Temp ${deviceName}`, data: deviceTempData, borderColor: color, tension: 0.1, fill: false
                });
              }
              if (deviceHumData.length > 0) {
                humDatasets.push({
                  label: `Hum ${deviceName}`, data: deviceHumData, borderColor: color, tension: 0.1, fill: false
                });
              }
            }
          }

          // Chart.js con TimeScale no necesita 'labels' explícitos en la estructura de datos principal
          setGraficoUbicacionComponentesTemp({ datasets: tempDatasets });
          setGraficoUbicacionComponentesHum({ datasets: humDatasets });
        } else {
          setGraficoUbicacionPromedioTemp(null);
          setGraficoUbicacionPromedioHum(null);
          setGraficoUbicacionComponentesTemp(null);
          setGraficoUbicacionComponentesHum(null);
        }
      } else {
        setGraficoUbicacionPromedioTemp(null);
        setGraficoUbicacionPromedioHum(null);
        setGraficoUbicacionComponentesTemp(null);
        setGraficoUbicacionComponentesHum(null);
      }
      setLoadingChartsUbicacionLocal(false); // End loading
    };

    fetchAndProcessUbicacionData();
  }, [ubicacionSeleccionada, fechaDesde, fechaHasta, procesarLecturasParaTimeScale, umbrales, actions, store.lecturasUbicacion, aires, store.otrosEquiposList]); // Añadidas dependencias

  // --- Render ---
  // Determine overall initial loading state
  const initialLoading = statsLoadingGeneral || statsLoadingUbicacion || statsLoadingUmbrales;

  return (
    <div className="container mt-4"> {/* Added container */}
      <h1 className="mb-4">Estadísticas</h1>

      {/* Global Error Alert */}
      {error && (
        <Alert variant="danger" dismissible onClose={clearStatsError}>
          {error}
        </Alert>
      )}

      {/* Initial Loading Spinner */}
      {initialLoading && (
        <div className="text-center p-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Cargando datos iniciales...</p>
        </div>
      )}

      {/* Tabs - Render only after initial load */}
      {!initialLoading && (
        <Tabs defaultActiveKey="general" id="stats-tabs" className="mb-4" mountOnEnter unmountOnExit>
          {/* General Tab */}
          <Tab eventKey="general" title={<><FiBarChart2 className="me-2" /> General</>}>
            <EstadisticasGeneral
              // Pass data from store/local state
              estadisticasGenerales={estadisticasGenerales}
              graficoGeneralTemp={graficoGeneralTemp}
              graficoGeneralHum={graficoGeneralHum}
              graficoComparativoTemp={graficoComparativoTemp}
              graficoComparativoHum={graficoComparativoHum}
              // Pass relevant loading states
              loadingGeneral={statsLoadingGeneral} // Loading for the stats card
              loadingChartsGeneral={loadingChartsGeneralLocal} // Loading for line/bar charts
              loadingUbicacion={statsLoadingUbicacion} // Loading specifically for bar chart data source
            />
          </Tab>

          {/* Per AC Tab */}
          <Tab eventKey="aire" title={<><FiWind className="me-2" /> Por Aire</>}>
            <EstadisticasPorAire
              // Pass data/state from store/local state
              aires={aires}
              aireSeleccionado={aireSeleccionado}
              setAireSeleccionado={setAireSeleccionado} // Pass setter for selection
              estadisticasAire={estadisticasAire}
              graficoAireTemp={graficoAireTemp}
              graficoAireHum={graficoAireHum}
              // Pass relevant loading states
              loadingAires={statsLoadingGeneral} // Loading state for the 'aires' list (part of initial load)
              loadingAireStats={statsLoadingAire} // Loading state for the specific AC's stats card
              fechaDesde={fechaDesde}
              setFechaDesde={setFechaDesde}
              fechaHasta={fechaHasta}
              setFechaHasta={setFechaHasta}
              loadingChartsAire={loadingChartsAireLocal} // Loading state for the specific AC's charts
            />
          </Tab>

          {/* Per Location Tab */}
          <Tab eventKey="ubicacion" title={<><FiMapPin className="me-2" /> Por Ubicación</>}>
            <EstadisticasPorUbicacion
              ubicaciones={ubicaciones}
              ubicacionSeleccionada={ubicacionSeleccionada}
              setUbicacionSeleccionada={setUbicacionSeleccionada}
              estadisticasUbicacion={estadisticasUbicacion} // Datos agregados para la tabla
              loadingUbicacion={statsLoadingUbicacion} // Loading para la tabla de estadísticas
              // --- Pasar props de fecha y carga para las gráficas de ubicación ---
              fechaDesde={fechaDesde} // Usando las mismas fechas que "Por Aire" por ahora
              setFechaDesde={setFechaDesde}
              fechaHasta={fechaHasta}
              setFechaHasta={setFechaHasta}
              datosGraficoPromedioHoraTemp={graficoUbicacionPromedioTemp}
              datosGraficoPromedioHoraHum={graficoUbicacionPromedioHum}
              datosGraficoPorComponenteTemp={graficoUbicacionComponentesTemp}
              datosGraficoPorComponenteHum={graficoUbicacionComponentesHum}
              loadingGraficasUbicacion={loadingChartsUbicacionLocal} // Pasar el estado de carga correcto
            />
          </Tab>
        </Tabs>
      )}
    </div>
  );
};

// Add PropTypes
Estadisticas.propTypes = {
  // No props needed for the main page component itself
};


export default Estadisticas;
