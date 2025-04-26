import React from 'react';
import PropTypes from 'prop-types';
import { Table } from 'react-bootstrap';

const ReportesOtrosEquiposTable = ({ equiposList }) => {
  if (!equiposList || equiposList.length === 0) {
    return <p>No hay otros equipos para mostrar.</p>;
  }

  return (
    <div className="table-responsive">
      <Table striped bordered hover size="sm">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Tipo</th>
            <th>Ubicación</th>
            <th>Marca</th>
            <th>Modelo</th>
            <th>Serial</th>
            <th>Código Inventario</th>
            <th>Fecha Instalación</th>
            <th>Estado Operativo</th>
            <th>Notas</th>
          </tr>
        </thead>
        <tbody>
          {equiposList.map((equipo) => (
            <tr key={equipo.id}>
              <td>{equipo.nombre || '-'}</td>
              <td>{equipo.tipo || '-'}</td>
              <td>{equipo.ubicacion || '-'}</td>
              <td>{equipo.marca || '-'}</td>
              <td>{equipo.modelo || '-'}</td>
              <td>{equipo.serial || '-'}</td>
              <td>{equipo.codigo_inventario || '-'}</td>
              <td>{equipo.fecha_instalacion || '-'}</td>
              <td>{equipo.estado_operativo ? 'Operativo' : 'Inoperativo'}</td>
              <td>{equipo.notas || '-'}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

ReportesOtrosEquiposTable.propTypes = {
  equiposList: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      nombre: PropTypes.string,
      tipo: PropTypes.string,
      ubicacion: PropTypes.string,
      marca: PropTypes.string,
      modelo: PropTypes.string,
      serial: PropTypes.string,
      codigo_inventario: PropTypes.string,
      fecha_instalacion: PropTypes.string,
      estado_operativo: PropTypes.bool,
      notas: PropTypes.string,
    })
  ).isRequired,
};

export default ReportesOtrosEquiposTable;
