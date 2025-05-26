import React, { useState, useContext } from 'react';
import PropTypes from 'prop-types';
import { Modal, Button, Form, Alert, Spinner, ProgressBar } from 'react-bootstrap';
import { Context } from '../../store/appContext'; // Ajusta la ruta si es necesario

const LecturasExcelUploadModal = ({ show, onHide, onUploadComplete }) => {
    const { store, actions } = useContext(Context); // Añadir store para el token
    const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0); // Para futura implementación de progreso real

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setUploadError(null);
    setUploadSuccess(null);
    setUploadProgress(0);
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      setUploadError("Por favor, selecciona un archivo Excel.");
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(null);
    setUploadProgress(0); // Reset progress

    const result = await actions.uploadLecturasExcel(selectedFile, (progressEvent) => {
        // Para progreso real, necesitarías que la acción `uploadLecturasExcel` soporte onUploadProgress
        // Por ahora, simularemos un progreso simple o lo dejaremos en 0 y luego 100.
        // const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        // setUploadProgress(percentCompleted);
    });

    setIsUploading(false);

    if (result && result.success) {
      setUploadSuccess(result.message || "Archivo procesado con éxito.");
      if (result.details) {
        // Podrías mostrar detalles como result.details.success_count, result.details.error_count
        console.log("Detalles del proceso:", result.details);
      }
      setSelectedFile(null); // Limpiar selección
      if (onUploadComplete) {
        onUploadComplete(); // Llama a la función para refrescar la tabla principal
      }
      // Opcional: cerrar modal automáticamente tras éxito después de un delay
      // setTimeout(onHide, 3000);
    } else {
      setUploadError(result.message || "Ocurrió un error al procesar el archivo.");
      if (result.errors && result.errors.length > 0) {
        // Aquí podrías formatear y mostrar los errores específicos
        console.error("Errores específicos:", result.errors);
        setUploadError(prev => `${prev}\n\nDetalles de errores:\n- ${result.errors.join('\n- ')}`); // <--- MODIFICADO: Mostrar errores detallados
      }
    }
  };

  const handleModalClose = () => {
    if (isUploading) return; // No cerrar si está subiendo
    setSelectedFile(null);
    setUploadError(null);
    setUploadSuccess(null);
    setUploadProgress(0);
    onHide();
  };

  const handleDownloadTemplate = async () => {
    try {
      const token = store.token; // Asumiendo que el token está en el store
      const response = await fetch(`${process.env.BACKEND_URL}/api/lecturas/download_excel_template`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          // No 'Content-Type' es necesario para una descarga GET simple
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ msg: "Error al descargar plantilla."}));
        throw new Error(errorData.msg || `Error ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = "plantilla_lecturas_historicas.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error("Error descargando plantilla:", error);
      setUploadError(error.message || "No se pudo descargar la plantilla.");
    }
  };


  return (
    <Modal show={show} onHide={handleModalClose} backdrop="static" keyboard={!isUploading}>
      <Modal.Header closeButton={!isUploading}>
        <Modal.Title>Cargar Lecturas desde Excel</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {uploadError && <Alert variant="danger">{uploadError}</Alert>}
        {uploadSuccess && <Alert variant="success">{uploadSuccess}</Alert>}

        <Form.Group controlId="formFile" className="mb-3">
          <Form.Label>Selecciona el archivo Excel (.xlsx, .xls)</Form.Label>
          <Form.Control
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </Form.Group>

        {isUploading && (
          <div className="text-center">
            <Spinner animation="border" variant="primary" className="mb-2" />
            <p>Procesando archivo, por favor espera...</p>
            {/* Si tuvieras progreso real: <ProgressBar now={uploadProgress} label={`${uploadProgress}%`} /> */}
          </div>
        )}
<div className="mb-3">
          <Button variant="link" onClick={handleDownloadTemplate} className="p-0">Descargar plantilla de ejemplo</Button>
        </div>
        <Alert variant="info">
          <Alert.Heading as="h5">Formato Esperado del Excel:</Alert.Heading>
          <ul>
            <li><strong>Extensión del Archivo:</strong> Debe ser <code>.xlsx</code> o <code>.xls</code>.</li>
            <li><strong>Celda B1 (Tipo de Dato):</strong> La celda <code>B1</code> (primera fila, segunda columna) debe contener la palabra 'TEMPERATURA' o 'HUMEDAD' (sin comillas) para indicar el tipo de datos que se cargarán desde las columnas de valores.</li>
            <li><strong>Fila 2 (Fechas):</strong> En la Fila 2, comenzando desde la <strong>Columna C</strong>, se ingresan las fechas (<code>dd/mm/yyyy</code>). Una fecha se propaga a celdas vacías a su derecha en la misma fila.</li>
            <li><strong>Fila 3 (Ignorada):</strong> Esta fila es ignorada por el sistema y puede usarse para notas.</li>
            <li><strong>Fila 4 (Encabezados y Horas):</strong>
              <ul>
                <li>Celda <code>B4</code>: Encabezado "NOMBRE DISPOSITIVO (Aire o Termohigrómetro, exacto como en BD)".</li>
                <li>Comenzando desde la <strong>Columna C</strong> (<code>C4</code>, <code>D4</code>, etc.), esta fila contiene las horas para las lecturas (ej: <code>HH:MM</code>).</li>
              </ul>
            </li>
                <li><strong>Columna B:</strong> Nombre del dispositivo. Debe coincidir <em>exactamente</em> con el nombre de un Aire Acondicionado o un Termohigrómetro registrado en el sistema. El sistema intentará identificarlo automáticamente.</li>
              <ul>
                <li>Filas con nombres como 'total', 'promedio', o designaciones de sala (ej: 'sala 32e', 'sala 31e') en esta columna serán ignoradas por el proceso.</li>
              </ul>
            <li><strong>Columnas C en adelante (Valores de Lectura, desde Fila 5):</strong> Para cada dispositivo listado en la Columna B (desde Fila 5), los valores de lectura (según celda <code>B1</code>) se ingresan en la misma fila, desde la <strong>Columna C</strong>. Cada valor debe alinearse con una columna que tenga una fecha (Fila 2) y una hora (Fila 4) definidas.</li>
            <li><strong>Manejo de Temperatura y Humedad:</strong>
              <ul>
                <li>Si la celda <code>B1</code> es 'TEMPERATURA': El sistema importará los valores como temperaturas. La humedad para estas lecturas se guardará como nula o será ignorada.</li>
                <li>Si la celda <code>B1</code> es 'HUMEDAD': El sistema importará los valores como humedades (asegúrese que estén en el rango 0-100). La temperatura para estas lecturas se guardará con un valor predeterminado (ej: 0.0).</li>
              </ul>
            </li>
            <li><strong>Celdas de Valor Vacías/Inválidas:</strong> Si una celda destinada a un valor de lectura (temperatura o humedad) está vacía o contiene un texto no numérico (como <code>#DIV/0!</code>), esa lectura específica será omitida.</li>
            <li><strong>Lecturas Duplicadas:</strong> El sistema omite automáticamente la carga de lecturas si ya existe un registro para el mismo aire, en la misma fecha y hora. El sistema verifica duplicados antes de intentar guardar una nueva lectura.</li>
          </ul>
        </Alert>

      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleModalClose} disabled={isUploading}>
          Cancelar
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={!selectedFile || isUploading}
        >
          {isUploading ? 'Procesando...' : 'Cargar y Procesar'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

LecturasExcelUploadModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  onUploadComplete: PropTypes.func,
};

export default LecturasExcelUploadModal;
