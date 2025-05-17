import React, { useEffect, useContext, useState } from 'react';
import { Card, Spinner, Alert, Button, Tabs, Tab, Row, Col } from 'react-bootstrap';
import { HiOutlineDocumentReport, HiOutlineTable } from 'react-icons/hi'; // Ya no se necesita HiOutlineExclamationCircle
import { Context } from '../store/appContext';
import ReportesAiresTable from '../component/Reportes/ReportesAiresTable.jsx';
import ReportesOtrosEquiposTable from '../component/Reportes/ReportesOtrosEquiposTable.jsx';
// Ya no se importa ReportesFallasTable
 
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Reportes = () => {
  const { store, actions } = useContext(Context);
  const {
    // trackerUser: user, // No se usa directamente aquí
    aires: airesList,
    airesLoading,
    airesError,
    otrosEquiposList,
    otrosEquiposLoading,
    otrosEquiposError,
    // Ya no necesitamos detailedAlertsList, detailedAlertsLoading, detailedAlertsError aquí
  } = store;

  // Ya no necesitamos fetchDetailedAlerts aquí
  const { fetchAires, fetchOtrosEquipos } = actions;

  const [groupedAires, setGroupedAires] = useState({});
  const [groupedOtrosEquipos, setGroupedOtrosEquipos] = useState({});
  // Si solo queda una pestaña principal, podrías eliminar la estructura de Tabs
  // pero la mantendremos por si se añaden otros reportes en el futuro.
  // El activeTab ahora solo será 'datosEquipo'.
  const [activeTab, setActiveTab] = useState('datosEquipo'); 

  useEffect(() => {
    fetchAires();
    fetchOtrosEquipos();
    // Ya no se llama a fetchDetailedAlerts
  }, [fetchAires, fetchOtrosEquipos]);

  useEffect(() => {
    if (airesList && Array.isArray(airesList)) {
      const newGroupedAires = airesList.reduce((acc, aire) => {
        const tipo = aire.tipo || 'Sin Tipo';
        const ubicacion = aire.ubicacion || 'Sin Ubicación';

        if (!acc[tipo]) {
          acc[tipo] = { items: [], byUbicacion: {} };
        }

        if (tipo.toLowerCase() === 'precision') {
          if (!acc[tipo].byUbicacion[ubicacion]) {
            acc[tipo].byUbicacion[ubicacion] = [];
          }
          acc[tipo].byUbicacion[ubicacion].push(aire);
        } else {
          acc[tipo].items.push(aire);
        }
        return acc;
      }, {});
      setGroupedAires(newGroupedAires);
    } else {
      setGroupedAires({});
    }
  }, [airesList]);

  useEffect(() => {
    if (otrosEquiposList && Array.isArray(otrosEquiposList)) {
      const grouped = otrosEquiposList.reduce((acc, equipo) => {
        const tipo = equipo.tipo || 'Sin Tipo';
        if (!acc[tipo]) acc[tipo] = [];
        acc[tipo].push(equipo);
        return acc;
      }, {});
      setGroupedOtrosEquipos(grouped);
    } else {
      setGroupedOtrosEquipos({});
    }
  }, [otrosEquiposList]);

  const handleDownloadAiresPDF = (tipo, aires, ubicacion = null) => {
    if (!aires || aires.length === 0) {
      console.warn(`No hay datos de aires para generar el PDF para el tipo: ${tipo}` + (ubicacion ? ` y ubicación: ${ubicacion}` : ''));
      return;
    }

    const doc = new jsPDF({ orientation: 'landscape' });
    const tableColumn = [
      "Nombre (TAG)", "Ubicación", "Tipo","Capacidad (Ton)",
      "Marca (Evap.)", "Modelo (Evap.)",
      "Serial (Evap.)", "Inventario (Evap.)",  "Ubicación(Evap.)", "Estado (Evap.)", 
      "Marca (Cond.)", "Modelo (Cond.)",
      "Serial (Cond.)", "Inventario (Cond.)", "Ubicación(Cond.)", "Estado (Cond.)"
    ];
    const tableRows = [];

    doc.setFontSize(18);
    let pdfTitle = `GDCCE Infraestructura, Reporte de Aires Acondicionados - Tipo: ${tipo}`;
    if (ubicacion) {
      pdfTitle += ` - Ubicación: ${ubicacion}`;
    }
    doc.text(pdfTitle, 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);

    aires.forEach(aire => {
      const aireData = [
        aire.nombre || '-',
        aire.ubicacion || '-',
        aire.tipo || '-',
        aire.toneladas !== null ? aire.toneladas : '-',
        aire.evaporadora_marca || '-',
        aire.evaporadora_modelo || '-',
        aire.evaporadora_serial || '-',
        aire.evaporadora_codigo_inventario || '-',
        aire.evaporadora_ubicacion_instalacion || '-', // Usar ubicación específica de evaporadora
        aire.evaporadora_operativa ? 'Operativo' : 'No Operativo',
        aire.condensadora_marca || '-',
        aire.condensadora_modelo || '-',
        aire.condensadora_serial || '-',
        aire.condensadora_codigo_inventario || '-',
        aire.condensadora_ubicacion_instalacion || '-', // Usar ubicación específica de condensadora
        aire.condensadora_operativa ? 'Operativo' : 'No Operativo'  
      ];
      tableRows.push(aireData);
    });

    try {
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 30,
        theme: 'grid',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [22, 160, 133] },
        margin: { top: 30 }
      });

      let fileName = `reporte_aires_${tipo.replace(/\s+/g, '_')}`;
      if (ubicacion) fileName += `_${ubicacion.replace(/\s+/g, '_')}`;
      fileName += '.pdf';
      doc.save(fileName);

    } catch (error) {
      console.error("Error al generar la tabla PDF con autoTable:", error);
    }
  };

  const handleDownloadOtrosEquiposPDF = (tipo, equipos) => {
    if (!equipos || equipos.length === 0) {
      console.warn('No hay datos de otros equipos para generar el PDF para el tipo:', tipo);
    return;
  }

  const doc = new jsPDF({ orientation: 'landscape' });
  const tableColumn = [
    "Nombre", "Tipo", "Ubicación", "Marca", "Modelo", "Serial", "Cód. Inventario", "Estado"
  ];
  const tableRows = [];

  doc.setFontSize(18);
  doc.text(`Reporte de Otros Equipos - Tipo: ${tipo}`, 14, 22);
  doc.setFontSize(11);
  doc.setTextColor(100);

  equipos.forEach(equipo => {
    const equipoData = [
      equipo.nombre || '-',
      equipo.tipo || '-',
      equipo.ubicacion || '-',
      equipo.marca || '-',
      equipo.modelo || '-',
      equipo.serial || '-',
      equipo.codigo_inventario || '-',
      equipo.estado_operativo ? 'Operativo' : 'No Operativo',
    ];
    tableRows.push(equipoData);
  });

  try {
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185] },
      margin: { top: 30 }
    });

    const fileName = `reporte_otros_equipos_${tipo.replace(/\s+/g, '_')}.pdf`;
    doc.save(fileName);

  } catch (error) {
    console.error("Error al generar la tabla PDF para otros equipos:", error);
  }
};

  return (
    <div className="container mt-4">
      <h1><HiOutlineDocumentReport className="me-2" />Reportes</h1>

      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-3"
        id="reportes-tabs"
        mountOnEnter
        unmountOnExit
      >
        <Tab eventKey="datosEquipo" title={<><HiOutlineTable className="me-1" /> Datos de Equipos</>}>
          {/* Aires Section */}
          <Card className="mb-4">
            <Card.Header>
              <h2>Aires Acondicionados por Tipo</h2>
            </Card.Header>
            <Card.Body>
              {airesLoading && (
                <div className="text-center p-3">
                  <Spinner animation="border" variant="primary" />
                  <p>Cargando aires acondicionados...</p>
                </div>
              )}
              {airesError && (
                <Alert variant="danger">
                  Error al cargar aires acondicionados: {airesError}
                </Alert>
              )}
              {!airesLoading && !airesError && (
                Object.keys(groupedAires).length === 0 ? (
                  <p>No hay aires acondicionados registrados.</p>
                ) : (
                  Object.entries(groupedAires).map(([tipo, dataTipo]) => {
                    if (tipo.toLowerCase() === 'precision' && Object.keys(dataTipo.byUbicacion).length > 0) {
                      return (
                        <div key={tipo} className="mb-4">
                          <h3 className="mb-3" style={{ borderBottom: '2px solid #eee', paddingBottom: '0.5rem' }}>Tipo: {tipo}</h3>
                          {Object.entries(dataTipo.byUbicacion).map(([ubicacion, airesEnUbicacion]) => (
                            <div key={`${tipo}-${ubicacion}`} className="mb-3 ps-3">
                              <div className="d-flex justify-content-between align-items-center mb-2">
                                <h4>Ubicación: {ubicacion} ({airesEnUbicacion.length} equipos)</h4>
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => handleDownloadAiresPDF(tipo, airesEnUbicacion, ubicacion)}
                                  disabled={!airesEnUbicacion || airesEnUbicacion.length === 0}
                                >
                                  <HiOutlineDocumentReport className="me-1" /> PDF (Ubic.)
                                </Button>
                              </div>
                              <ReportesAiresTable airesList={airesEnUbicacion} />
                            </div>
                          ))}
                        </div>
                      );
                    } else if (dataTipo.items.length > 0) {
                      return (
                        <div key={tipo} className="mb-4">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <h3>Tipo: {tipo} ({dataTipo.items.length} equipos)</h3>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDownloadAiresPDF(tipo, dataTipo.items)}
                              disabled={!dataTipo.items || dataTipo.items.length === 0}
                            >
                              <HiOutlineDocumentReport className="me-1" /> PDF (Tipo)
                            </Button>
                          </div>
                          <ReportesAiresTable airesList={dataTipo.items} />
                        </div>
                      );
                    } return null;
                  })
                )
              )}
            </Card.Body>
          </Card>

          {/* Otros Equipos Section */}
          <Card>
            <Card.Header>
              <h2>Otros Equipos por Tipo</h2>
            </Card.Header>
            <Card.Body>
              {otrosEquiposLoading && (
                <div className="text-center p-3">
                  <Spinner animation="border" variant="primary" />
                  <p>Cargando otros equipos...</p>
                </div>
              )}
              {otrosEquiposError && (
                <Alert variant="danger">
                  Error al cargar otros equipos: {otrosEquiposError}
                </Alert>
              )}
              {!otrosEquiposLoading && !otrosEquiposError && (
                Object.keys(groupedOtrosEquipos).length === 0 ? (
                  <p>No hay otros equipos registrados.</p>
                ) : (
                  Object.entries(groupedOtrosEquipos).map(([tipo, equipos]) => (
                    <div key={tipo} className="mb-4">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <h3>Tipo: {tipo} ({equipos.length} equipos)</h3>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => handleDownloadOtrosEquiposPDF(tipo, equipos)}
                          disabled={!equipos || equipos.length === 0}
                        >
                          <HiOutlineDocumentReport className="me-1" /> PDF
                        </Button>
                      </div>
                      <ReportesOtrosEquiposTable equiposList={equipos} />
                    </div>
                  ))
                )
              )}
            </Card.Body>
          </Card>
        </Tab>
        {/* La pestaña de Fallas Registradas ha sido eliminada */}
      </Tabs>
    </div>
  );
};

export default Reportes;
