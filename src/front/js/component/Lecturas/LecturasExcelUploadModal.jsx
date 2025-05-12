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
        // setUploadError(prev => `${prev} Detalles: ${result.errors.join(', ')}`);
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
            <li>La primera fila debe contener los nombres de los Aires Acondicionados exactamente como están guardados en el sistema.</li>
            <li>Debajo de cada nombre de Aire, dos columnas: "Temp" y "Hum" (Humedad).</li>
            <li>La primera columna (Columna A) se usa para las fechas y horas.</li>
            <li>Una celda (puede ser unida) en la Columna A para la Fecha (ej: 22/03/2025).</li>
            <li>Debajo de la fecha, en la Columna A, las horas para las lecturas (ej: 06:00, 09:00).</li>
            <li>Los valores de temperatura y humedad en las celdas correspondientes a la intersección de Aire/Hora.</li>
            <li>Para aires tipo "Confort", la columna de humedad puede estar vacía.</li>
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
