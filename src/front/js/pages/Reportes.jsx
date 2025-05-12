import React, { useEffect, useContext, useState } from 'react';
import { Card, Spinner, Alert, Button } from 'react-bootstrap';
import { HiOutlineDocumentReport } from 'react-icons/hi'
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
      const newGroupedAires = airesList.reduce((acc, aire) => {
        const tipo = aire.tipo || 'Sin Tipo';
        const ubicacion = aire.ubicacion || 'Sin Ubicación';

        if (!acc[tipo]) {
          acc[tipo] = { items: [], byUbicacion: {} };
        }

        // Si es de tipo 'Precision', agrupar también por ubicación
        if (tipo.toLowerCase() === 'precision') { // Usar toLowerCase para ser flexible con la capitalización
          if (!acc[tipo].byUbicacion[ubicacion]) {
            acc[tipo].byUbicacion[ubicacion] = [];
          }
          acc[tipo].byUbicacion[ubicacion].push(aire);
        } else {
          // Para otros tipos, agregar directamente a la lista de items del tipo
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

  // --- Función para generar PDF de Aires por Tipo ---
  const handleDownloadAiresPDF = (tipo, aires, ubicacion = null) => {
    if (!aires || aires.length === 0) {
      console.warn(`No hay datos de aires para generar el PDF para el tipo: ${tipo}` + (ubicacion ? ` y ubicación: ${ubicacion}` : ''));
      return;
    }

    const doc = new jsPDF({ orientation: 'landscape' });
    const tableColumn = [
      "Nombre (TAG)", "Ubicación", "Tipo","Capacidad (Ton)", // Añadida Ubicación General
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
        aire.ubicacion || '-', // Ubicación general del aire
        aire.tipo || '-',
        aire.toneladas !== null ? aire.toneladas : '-',
        aire.evaporadora_marca || '-',
        aire.evaporadora_modelo || '-',
        aire.evaporadora_serial || '-',
        aire.evaporadora_codigo_inventario || '-',
        aire.ubicacion || '-',
        aire.evaporadora_operativa ? 'Operativo' : 'No Operativo', // Aquí debería ser evaporadora_ubicacion_instalacion si es diferente
        aire.condensadora_marca || '-',
        aire.condensadora_modelo || '-',
        aire.condensadora_serial || '-',
        aire.condensadora_codigo_inventario || '-',
        aire.condensadora_ubicacion || '-',
        aire.condensadora_operativa ? 'Operativo' : 'No Operativo'  

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

      let fileName = `reporte_aires_${tipo.replace(/\s+/g, '_')}`;
      if (ubicacion) fileName += `_${ubicacion.replace(/\s+/g, '_')}`;
      fileName += '.pdf';
      doc.save(fileName);

    } catch (error) {
      console.error("Error al generar la tabla PDF con autoTable:", error);
      // Informar al usuario sobre el error si es necesario
    }
  };
  // --- Fin de la función ---
// ... (dentro del componente Reportes, después de handleDownloadAiresPDF) ...

// --- Función para generar PDF de Otros Equipos por Tipo ---
const handleDownloadOtrosEquiposPDF = (tipo, equipos) => {
  if (!equipos || equipos.length === 0) {
    console.warn('No hay datos de otros equipos para generar el PDF para el tipo:', tipo);
    return;
  }

  const doc = new jsPDF({ orientation: 'landscape' });
  // --- Ajusta las columnas según tu modelo OtroEquipo ---
  const tableColumn = [
    "Nombre",
    "Tipo",
    "Ubicación",
    "Marca",
    "Modelo",
    "Serial",
    "Cód. Inventario",
    "Estado"
  ];
  const tableRows = [];

  // Título del documento
  doc.setFontSize(18);
  doc.text(`Reporte de Otros Equipos - Tipo: ${tipo}`, 14, 22);
  doc.setFontSize(11);
  doc.setTextColor(100);

  // Prepara las filas para la tabla usando las propiedades de models.py (OtroEquipo)
  equipos.forEach(equipo => {
    // --- Mapea las propiedades correctas del objeto 'equipo' ---
    const equipoData = [
      equipo.nombre || '-',             // Corresponde a OtroEquipo.nombre
      equipo.tipo || '-',               // Corresponde a OtroEquipo.tipo
      equipo.ubicacion || '-',          // Corresponde a OtroEquipo.ubicacion
      equipo.marca || '-',              // Corresponde a OtroEquipo.marca
      equipo.modelo || '-',             // Corresponde a OtroEquipo.modelo
      equipo.serial || '-',             // Corresponde a OtroEquipo.serial
      equipo.codigo_inventario || '-',  // Corresponde a OtroEquipo.codigo_inventario
      equipo.estado_operativo ? 'Operativo' : 'No Operativo', // Corresponde a OtroEquipo.estado_operativo
    ];
    tableRows.push(equipoData);
  });

  // Llama a autoTable como una función, pasando 'doc' como primer argumento
  try {
    autoTable(doc, { // Usando la importación explícita
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185] }, // Puedes usar otro color para diferenciar
      margin: { top: 30 }
    });

    // Nombre del archivo PDF
    const fileName = `reporte_otros_equipos_${tipo.replace(/\s+/g, '_')}.pdf`;
    doc.save(fileName);

  } catch (error) {
    console.error("Error al generar la tabla PDF para otros equipos:", error);
    // Informar al usuario sobre el error si es necesario
  }
};
// --- Fin de la función ---

  return (
    <div className="container mt-4">
       <h1 > Reportes</h1>
 
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
                // Si el tipo es 'Precision' y tiene subgrupos por ubicación
                if (tipo.toLowerCase() === 'precision' && Object.keys(dataTipo.byUbicacion).length > 0) {
                  return (
                    <div key={tipo} className="mb-4">
                      <h2 className="mb-3" style={{ borderBottom: '2px solid #eee', paddingBottom: '0.5rem' }}>Tipo: {tipo}</h2>
                      {Object.entries(dataTipo.byUbicacion).map(([ubicacion, airesEnUbicacion]) => (
                        <div key={`${tipo}-${ubicacion}`} className="mb-3 ps-3"> {/* Indentación para subgrupos */}
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <h4>Ubicación: {ubicacion} ({airesEnUbicacion.length} equipos)</h4>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDownloadAiresPDF(tipo, airesEnUbicacion, ubicacion)}
                              disabled={!airesEnUbicacion || airesEnUbicacion.length === 0}
                            >
                              <i className="fas fa-file-pdf me-2"></i>
                              Descargar PDF (Ubicación)
                            </Button>
                          </div>
                          <ReportesAiresTable airesList={airesEnUbicacion} />
                        </div>
                      ))}
                    </div>
                  );
                } else if (dataTipo.items.length > 0) { // Para otros tipos o 'Precision' sin desglose por ubicación
                  return (
                    <div key={tipo} className="mb-4">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <h2>Tipo: {tipo} ({dataTipo.items.length} equipos)</h2>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDownloadAiresPDF(tipo, dataTipo.items)}
                          disabled={!dataTipo.items || dataTipo.items.length === 0}
                        >
                          <i className="fas fa-file-pdf me-2"></i>
                          Descargar PDF (Tipo)
                        </Button>
                      </div>
                      <ReportesAiresTable airesList={dataTipo.items} />
                    </div>
                  );
                } return null; // Si no hay items ni desglose por ubicación para este tipo
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
               {/* --- Contenedor para título y botón --- */}
               <div className="d-flex justify-content-between align-items-center mb-2">
                 <h3>Tipo: {tipo}</h3>
                 {/* --- Botón de Descarga PDF para Otros Equipos --- */}
                 <Button
                   variant="outline-primary" // Puedes usar otro color (ej. primary)
                   size="sm"
                   onClick={() => handleDownloadOtrosEquiposPDF(tipo, equipos)}
                   disabled={!equipos || equipos.length === 0} // Deshabilita si no hay datos
                 >
                   <i className="fas fa-file-pdf me-2"></i> {/* Ícono opcional */}
                   Descargar PDF
                 </Button>
                 {/* --- Fin del Botón --- */}
               </div>
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
