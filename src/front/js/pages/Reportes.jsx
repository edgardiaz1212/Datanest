import React, { useEffect, useContext, useState } from 'react';
import { Card, Spinner, Alert } from 'react-bootstrap';
import { Context } from '../store/appContext';
import ReportesAiresTable from '../component/Reportes/ReportesAiresTable.jsx';
import ReportesOtrosEquiposTable from '../component/Reportes/ReportesOtrosEquiposTable.jsx';

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
    // Group Aires by tipo
    if (airesList && Array.isArray(airesList)) {
      const grouped = airesList.reduce((acc, aire) => {
        const tipo = aire.tipo || 'Sin Tipo';
        if (!acc[tipo]) acc[tipo] = [];
        acc[tipo].push(aire);
        return acc;
      }, {});
      setGroupedAires(grouped);
    }
  }, [airesList]);

  useEffect(() => {
    // Group OtrosEquipos by tipo
    if (otrosEquiposList && Array.isArray(otrosEquiposList)) {
      const grouped = otrosEquiposList.reduce((acc, equipo) => {
        const tipo = equipo.tipo || 'Sin Tipo';
        if (!acc[tipo]) acc[tipo] = [];
        acc[tipo].push(equipo);
        return acc;
      }, {});
      setGroupedOtrosEquipos(grouped);
    }
  }, [otrosEquiposList]);

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
                  <h3>Tipo: {tipo}</h3>
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
