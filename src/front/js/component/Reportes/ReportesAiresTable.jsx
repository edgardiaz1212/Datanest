import React from 'react';
import PropTypes from 'prop-types';
import { Table } from 'react-bootstrap';

const ReportesAiresTable = ({ airesList }) => {
  if (!airesList || airesList.length === 0) {
    return <p>No hay aires acondicionados para mostrar.</p>;
  }

  return (
    <div className="table-responsive">
      <Table striped bordered hover size="sm">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Ubicación</th>
            <th>Fecha Instalación</th>
            <th>Tipo</th>
            <th>Toneladas</th>
            <th>Evaporadora Modelo</th>
            <th>Condensadora Modelo</th>
          </tr>
        </thead>
        <tbody>
          {airesList.map((aire) => (
            <tr key={aire.id}>
              <td>{aire.nombre || '-'}</td>
              <td>{aire.ubicacion || '-'}</td>
              <td>{aire.fecha_instalacion || '-'}</td>
              <td>{aire.tipo || '-'}</td>
              <td>{aire.toneladas !== null && aire.toneladas !== undefined ? aire.toneladas : '-'}</td>
              <td>{aire.evaporadora_modelo || '-'}</td>
              <td>{aire.condensadora_modelo || '-'}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

ReportesAiresTable.propTypes = {
  airesList: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      nombre: PropTypes.string,
      ubicacion: PropTypes.string,
      fecha_instalacion: PropTypes.string,
      tipo: PropTypes.string,
      toneladas: PropTypes.number,
      evaporadora_modelo: PropTypes.string,
      condensadora_modelo: PropTypes.string,
    })
  ).isRequired,
};

export default ReportesAiresTable;
