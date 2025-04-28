import React, { useEffect, useContext, useState } from 'react';
import { Card, Spinner, Alert, Button } from 'react-bootstrap';
import { Context } from '../store/appContext';
import ReportesAiresTable from '../component/Reportes/ReportesAiresTable.jsx';
import ReportesOtrosEquiposTable from '../component/Reportes/ReportesOtrosEquiposTable.jsx';

// Importa jsPDF como siempre
import jsPDF from 'jspdf';
// Importa autoTable explícitamente desde jspdf-autotable
import autoTable from 'jspdf-autotable';

// Ya no necesitas la importación por efecto secundario:
// import 'jspdf-autotable';

const Reportes = () => {
  const { store, actions } = useContext(Context);
  const {
    trackerUser: user,
    aires: airesList,
    airesLoading,
    airesError,
    otrosEquiposList,
    otrosEquiposLoading,
    otrosEquiposError,
  } = store;

  const { fetchAires, fetchOtrosEquipos } = actions;

  const [groupedAires, setGroupedAires] = useState({});
  const [groupedOtrosEquipos, setGroupedOtrosEquipos] = useState({});

  useEffect(() => {
    fetchAires();
    fetchOtrosEquipos();
  }, [fetchAires, fetchOtrosEquipos]);

  useEffect(() => {
    if (airesList && Array.isArray(airesList)) {
      const grouped = airesList.reduce((acc, aire) => {
        const tipo = aire.tipo || 'Sin Tipo';
        if (!acc[tipo]) acc[tipo] = [];
        acc[tipo].push(aire);
        return acc;
      }, {});
      setGroupedAires(grouped);
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

  // --- Función para generar PDF de Aires por Tipo ---
  const handleDownloadAiresPDF = (tipo, aires) => {
    if (!aires || aires.length === 0) {
      console.warn('No hay datos de aires para generar el PDF para el tipo:', tipo);
      return;
    }

    const doc = new jsPDF();
    const tableColumn = [
      "Nombre (TAG)", "Tipo","Capacidad (Ton)", "Marca (Evap.)", "Modelo (Evap.)",
      "Serial (Evap.)", "Inventario (Evap.)",  "Ubicación(Evap.)", "Estado (Evap.)", "Marca (Cond.)", "Modelo (Cond.)",
      "Serial (Cond.)", "Inventario (Cond.)", "Ubicación(Cond.)", "Estado (Cond.)"
      
    ];
    const tableRows = [];

    doc.setFontSize(18);
    doc.text(`Reporte de Aires Acondicionados - Tipo: ${tipo}`, 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);

    aires.forEach(aire => {
      const aireData = [
        aire.nombre || '-',
        aire.tipo || '-',
        aire.toneladas !== null ? aire.toneladas : '-',
        aire.evaporadora_marca || '-',
        aire.evaporadora_modelo || '-',
        aire.evaporadora_serial || '-',
        aire.ubicacion || '-',
        aire.evaporadora_operativa ? 'Operativo' : 'No Operativo',
      ];
      tableRows.push(aireData);
    });

    // --- Llama a autoTable como una función, pasando 'doc' como primer argumento ---
    try {
      autoTable(doc, { // <--- Cambio aquí
        head: [tableColumn],
        body: tableRows,
        startY: 30,
        theme: 'grid',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [22, 160, 133] },
        margin: { top: 30 }
      });

      const fileName = `reporte_aires_${tipo.replace(/\s+/g, '_')}.pdf`;
      doc.save(fileName);

    } catch (error) {
      console.error("Error al generar la tabla PDF con autoTable:", error);
      // Informar al usuario sobre el error si es necesario
    }
  };
  // --- Fin de la función ---

  // ... (resto del componente JSX sin cambios) ...

  return (
    <div className="container mt-4">
      <h1>Reportes</h1>

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
              Object.entries(groupedAires).map(([tipo, aires]) => (
                <div key={tipo} className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h3>Tipo: {tipo}</h3>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDownloadAiresPDF(tipo, aires)} // Línea 177
                      disabled={!aires || aires.length === 0}
                    >
                      <i className="fas fa-file-pdf me-2"></i>
                      Descargar PDF
                    </Button>
                  </div>
                  <ReportesAiresTable airesList={aires} />
                </div>
              ))
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
                   <h3>Tipo: {tipo}</h3>
                   {/* Podrías agregar un botón similar aquí para descargar PDF de otros equipos */}
                   <ReportesOtrosEquiposTable equiposList={equipos} />
                 </div>
               ))
             )
           )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default Reportes;
