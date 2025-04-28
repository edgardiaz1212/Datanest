// src/front/js/pages/Estadisticas.jsx

import React, { useState, useEffect, useCallback, useContext } from 'react';

import { Tabs, Tab, Spinner, Alert } from 'react-bootstrap';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
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

// --- Remove TypeScript interfaces ---

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

  // Local state for processed chart data and their loading status
  const [graficoGeneralTemp, setGraficoGeneralTemp] = useState(null);
  const [graficoGeneralHum, setGraficoGeneralHum] = useState(null);
  const [graficoComparativoTemp, setGraficoComparativoTemp] = useState(null);
  const [graficoComparativoHum, setGraficoComparativoHum] = useState(null);
  const [graficoAireTemp, setGraficoAireTemp] = useState(null);
  const [graficoAireHum, setGraficoAireHum] = useState(null);
  const [loadingChartsGeneralLocal, setLoadingChartsGeneralLocal] = useState(true);
  const [loadingChartsAireLocal, setLoadingChartsAireLocal] = useState(false);

  // --- Helper Functions for Processing Data (remove type annotations) ---

  const procesarLecturasParaGrafico = useCallback((
    lecturas, // : Lectura[]
    umbralesAplicables // : UmbralConfiguracion[]
  ) => { // : { tempChart: ChartDataType, humChart: ChartDataType } | null
    if (!lecturas || !Array.isArray(lecturas) || lecturas.length === 0) return null;

    // Sort and limit readings
    const sortedLecturas = [...lecturas].sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
    const limitedLecturas = sortedLecturas.slice(-50); // Limit to last 50

    const labels = limitedLecturas.map(l => format(new Date(l.fecha), 'HH:mm'));
    const tempData = limitedLecturas.map(l => l.temperatura);
    const humData = limitedLecturas.map(l => l.humedad);

    // Find applicable thresholds (ensure umbralesAplicables is an array)
    const validUmbrales = Array.isArray(umbralesAplicables) ? umbralesAplicables : [];
    const tempMinThreshold = validUmbrales.find(u => u.temp_min !== undefined)?.temp_min;
    const tempMaxThreshold = validUmbrales.find(u => u.temp_max !== undefined)?.temp_max;
    const humMinThreshold = validUmbrales.find(u => u.hum_min !== undefined)?.hum_min;
    const humMaxThreshold = validUmbrales.find(u => u.hum_max !== undefined)?.hum_max;

    // Helper to create threshold datasets
    const createThresholdDataset = (label, value, color, dataLength) => { // Remove types
      if (value === undefined || dataLength === 0) return null;
      return {
        label: label,
        data: Array(dataLength).fill(value),
        borderColor: color,
        borderWidth: 1.5,
        borderDash: [5, 5], // Dashed line
        pointRadius: 0, // No points
        fill: false,
        tension: 0 // Straight line
      };
    };

    // Temperature Datasets
    const tempDatasets = [
      { label: 'Temperatura °C', data: tempData, borderColor: 'rgba(255, 99, 132, 1)', backgroundColor: 'rgba(255, 99, 132, 0.2)', tension: 0.1 },
      createThresholdDataset('Temp Mín', tempMinThreshold, 'rgba(54, 162, 235, 0.8)', labels.length), // Blue for min temp
      createThresholdDataset('Temp Máx', tempMaxThreshold, 'rgba(255, 0, 0, 0.8)', labels.length)      // Red for max temp
    ].filter(ds => ds !== null); // Filter out null datasets

    // Humidity Datasets
    const humDatasets = [
       { label: 'Humedad %', data: humData, borderColor: 'rgba(54, 162, 235, 1)', backgroundColor: 'rgba(54, 162, 235, 0.2)', tension: 0.1 },
       createThresholdDataset('Hum Mín', humMinThreshold, 'rgba(255, 159, 64, 0.8)', labels.length), // Orange for min hum
       createThresholdDataset('Hum Máx', humMaxThreshold, 'rgba(153, 102, 255, 0.8)', labels.length) // Purple for max hum
    ].filter(ds => ds !== null);

    return {
      tempChart: { labels, datasets: tempDatasets },
      humChart: { labels, datasets: humDatasets }
    };
  }, []); // Empty dependency array

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
      const generalChartData = procesarLecturasParaGrafico(_rawLecturasGenerales, umbralesGlobalesActivos);
      setGraficoGeneralTemp(generalChartData?.tempChart || null);
      setGraficoGeneralHum(generalChartData?.humChart || null);
    } else {
      setGraficoGeneralTemp(null);
      setGraficoGeneralHum(null);
    }
    setLoadingChartsGeneralLocal(false);
  }, [_rawLecturasGenerales, umbrales, procesarLecturasParaGrafico]); // Depend on raw data and umbrales

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
      const aireChartData = procesarLecturasParaGrafico(_rawLecturasAire, umbralesParaAire);
      setGraficoAireTemp(aireChartData?.tempChart || null);
      setGraficoAireHum(aireChartData?.humChart || null);
    } else {
      // Clear charts if no AC selected or data missing
      setGraficoAireTemp(null);
      setGraficoAireHum(null);
    }
    setLoadingChartsAireLocal(false);
  }, [_rawLecturasAire, umbrales, aireSeleccionado, procesarLecturasParaGrafico]); // Depend on raw data, umbrales, selection


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
              loadingChartsAire={loadingChartsAireLocal} // Loading state for the specific AC's charts
            />
          </Tab>

          {/* Per Location Tab */}
          <Tab eventKey="ubicacion" title={<><FiMapPin className="me-2" /> Por Ubicación</>}>
            <EstadisticasPorUbicacion
              // Pass data/state from store/local state
              ubicaciones={ubicaciones}
              ubicacionSeleccionada={ubicacionSeleccionada}
              setUbicacionSeleccionada={setUbicacionSeleccionada} // Pass setter for selection
              estadisticasUbicacion={estadisticasUbicacion}
              // Pass relevant loading state
              loadingUbicacion={statsLoadingUbicacion} // Loading state for location stats data
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
