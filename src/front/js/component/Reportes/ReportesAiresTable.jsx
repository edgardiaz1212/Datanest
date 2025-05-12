// src/front/js/component/Reportes/ReportesAiresTable.jsx

import React from 'react';
import PropTypes from 'prop-types';
import { Table } from 'react-bootstrap';

// Usa parámetros por defecto aquí: asigna [] a airesList si no se proporciona
const ReportesAiresTable = ({ airesList = [] }) => {
  // Verifica si la lista está vacía o no es un array
  // (La comprobación de Array.isArray sigue siendo útil por si se pasa algo que no sea un array)
  if (!Array.isArray(airesList) || airesList.length === 0) {
    return <p className="text-muted">No hay datos de aires acondicionados para mostrar en esta categoría.</p>;
  }

  // ... (resto del código del componente sin cambios) ...

  const columns = [
    { header: 'Nombre (TAG)', accessor: 'nombre' },
    { header: 'Tipo', accessor: 'tipo' },
    { header: 'Ubicación', accessor: 'ubicacion' },
    { header: 'Capacidad (Ton)', accessor: 'toneladas' },
    { header: 'Serial (Evap.)', accessor: 'evaporadora_serial' },
    { header: 'Inventario (Evap.)', accessor: 'evaporadora_codigo_inventario' },    
    { header: 'Estado (Evap.)', accessor: 'evaporadora_operativa' },
    { header: 'Serial (Cond.)', accessor: 'condensadora_serial' },
    // Corregido el accessor para Inventario (Cond.)
    { header: 'Inventario (Cond.)', accessor: 'condensadora_codigo_inventario' },
    { header: 'Estado (Cond.)', accessor: 'condensadora_operativa' },

    // ... más columnas ...
  ];

  const getCellValue = (aire, accessor) => {
    const value = aire[accessor];
    if (value === null || typeof value === 'undefined') return '-';
    if (typeof value === 'boolean') return value ? 'Operativo' : 'No Operativo';
    // ... otros formateos ...
    return value;
  };

  return (
    <Table striped bordered hover responsive size="sm">
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={col.accessor}>{col.header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {airesList.map((aire) => (
          <tr key={aire.id}>
            {columns.map((col) => (
              <td key={`${aire.id}-${col.accessor}`}>
                {getCellValue(aire, col.accessor)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

// La definición de PropTypes sigue siendo útil para la validación
ReportesAiresTable.propTypes = {
  airesList: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      nombre: PropTypes.string,
      tipo: PropTypes.string,
      evaporadora_marca: PropTypes.string,
      evaporadora_modelo: PropTypes.string,
      evaporadora_serial: PropTypes.string,
      toneladas: PropTypes.number,
      ubicacion: PropTypes.string,
      evaporadora_operativa: PropTypes.bool,
      // ... otras props ...
    })
  ),
};

// Elimina esta sección:
// ReportesAiresTable.defaultProps = {
//   airesList: [],
// };

export default ReportesAiresTable;
