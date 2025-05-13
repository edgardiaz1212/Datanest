import React from 'react';
import PropTypes from 'prop-types';
import { Table, Badge } from 'react-bootstrap';
import { FiAlertCircle, FiTool, FiCalendar, FiInfo, FiFileText } from 'react-icons/fi'; // Iconos relevantes

const ReportesFallasTable = ({ fallas }) => {
  if (!fallas || fallas.length === 0) {
    return <p className="text-center text-muted my-3">No hay fallas de operatividad registradas.</p>;
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    } catch (e) {
      return "Fecha inválida";
    }
  };

  return (
    <div className="table-responsive">
      <Table striped bordered hover responsive size="sm">
        <thead>
          <tr>
            <th><FiTool className="me-1" />Aire Acondicionado</th>
            <th>Ubicación</th>
            <th>Componente en Falla</th>
            <th><FiInfo className="me-1" />Diagnóstico</th>
            <th><FiFileText className="me-1" />Notas Adicionales</th>
            <th><FiCalendar className="me-1" />Fecha Detección</th>
          </tr>
        </thead>
        <tbody>
          {fallas.map((falla, index) => (
            <tr key={`falla-${falla.aire_id}-${index}`}>
              <td>{falla.aire_nombre || 'N/A'}</td>
              <td>{falla.aire_ubicacion || 'N/A'}</td>
              <td>
                <Badge bg="danger" pill>
                  <FiAlertCircle className="me-1" />
                  {falla.componente || 'No especificado'}
                </Badge>
              </td>
              <td>{falla.diagnostico_nombre || <span className="text-muted">No especificado</span>}</td>
              <td style={{ maxWidth: '300px', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {falla.diagnostico_notas || <span className="text-muted">-</span>}
              </td>
              <td>{formatDate(falla.fecha_lectura)}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

ReportesFallasTable.propTypes = {
  fallas: PropTypes.arrayOf(PropTypes.shape({
    aire_id: PropTypes.number,
    aire_nombre: PropTypes.string,
    aire_ubicacion: PropTypes.string,
    componente: PropTypes.string,
    mensaje: PropTypes.string,
    diagnostico_nombre: PropTypes.string,
    diagnostico_notas: PropTypes.string,
    fecha_lectura: PropTypes.string,
    alerta_tipo: PropTypes.string, // Para asegurar que solo se pasen las de operatividad
  })).isRequired,
};

export default ReportesFallasTable;