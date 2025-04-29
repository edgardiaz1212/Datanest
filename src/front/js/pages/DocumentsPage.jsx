// src/front/js/pages/DocumentsPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Button, Form, Spinner, Alert, ListGroup } from 'react-bootstrap';
import { UploadCloud, FileText, Download, Trash2, PlusCircle } from 'lucide-react';
import { Context } from '../store/appContext'; // Importa el contexto

const DocumentsPage = () => {
  // --- Acceso al Store y Actions ---
  const { store, actions } = useContext(Context);
  const {
    documentos,
    documentosLoading,
    documentosError,
    uploadingDocumento,
    uploadDocumentoError,
    uploadDocumentoSuccess,
    deletingDocumentoId,
    deleteDocumentoError,
    trackerUser // <--- Accede al usuario logueado
  } = store;

  // --- Estados Locales (Solo para el formulario) ---
  const [selectedFile, setSelectedFile] = useState(null);
  const [documentName, setDocumentName] = useState('');
  const [documentDescription, setDocumentDescription] = useState('');

  // --- Efectos ---
  useEffect(() => {
    actions.fetchDocumentos();
    return () => {
      actions.clearUploadDocumentoStatus?.();
      actions.clearDocumentosError?.();
      actions.clearDeleteDocumentoError?.();
    };
  }, [actions.fetchDocumentos]);

  // --- Manejadores de Eventos ---
  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    actions.clearUploadDocumentoStatus?.();
  };

  // --- Función para manejar la descarga (Modificada) ---
  const handleDownload = async (docUrl, originalFilename) => {
    console.log(`Iniciando descarga de: ${originalFilename}`);
    try {
      // --- Obtener token y construir cabeceras aquí ---
      const token = localStorage.getItem("token"); // Obtiene el token directamente
      const headers = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      // No necesitamos 'Content-Type' para una solicitud GET de descarga
      // ------------------------------------------------

      const response = await fetch(docUrl, {
        method: 'GET',
        headers: headers // <--- Usa las cabeceras construidas localmente
      });

      if (!response.ok) {
        let errorMsg = `Error ${response.status}`;
        try {
            const errorData = await response.json();
            errorMsg = errorData.msg || errorMsg;
        } catch (e) { /* Ignorar */ }

        if (response.status === 401) {
          actions.logoutTrackerUser?.();
          alert("Error de autenticación. Por favor, inicia sesión de nuevo.");
        } else {
          alert(`Error al descargar el archivo: ${errorMsg}`);
        }
        throw new Error(errorMsg);
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', originalFilename);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      console.log(`Descarga completada para: ${originalFilename}`);

    } catch (error) {
      console.error("Error durante la descarga:", error);
    } finally {
      // Opcional: Ocultar estado de carga
    }
  };
  // --- Fin Función de Descarga Modificada ---

  // --- Función para manejar la subida (sin cambios) ---
  const handleUploadSubmit = async (event) => {
    event.preventDefault();
    if (trackerUser?.rol === 'operador') {
        console.warn("Intento de carga por rol 'operador' bloqueado en frontend.");
        return;
    }
    if (!selectedFile || !documentName) {
      actions.setUploadDocumentoError?.("Por favor, selecciona un archivo y asigna un nombre.");
      return;
    }
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('nombre', documentName);
    formData.append('descripcion', documentDescription);
    const success = await actions.uploadDocumento(formData);
    if (success) {
      setSelectedFile(null);
      setDocumentName('');
      setDocumentDescription('');
      const fileInput = document.getElementById('file-upload-input');
      if (fileInput) fileInput.value = null;
    }
  };

  // --- Función para manejar la eliminación (sin cambios) ---
  const handleDeleteDocument = async (docId, docName) => {
    if (trackerUser?.rol === 'operador') {
        console.warn("Intento de borrado por rol 'operador' bloqueado en frontend.");
        alert("No tienes permiso para eliminar documentos.");
        return;
    }
    if (window.confirm(`¿Estás seguro de que deseas eliminar el documento "${docName}"?`)) {
      await actions.deleteDocumento(docId);
    }
  };

  // --- Determinar permisos (sin cambios) ---
  const canUpload = trackerUser && ['admin', 'supervisor'].includes(trackerUser.rol);
  const canDelete = trackerUser && ['admin', 'supervisor'].includes(trackerUser.rol);

  // --- Renderizado del Componente (sin cambios en la estructura) ---
  return (
    <Container fluid className="py-5 px-md-5">
      {/* Título */}
      <Row className="justify-content-center mb-5">
        <Col md={10} lg={8} className="text-center">
          <FileText size={50} className="text-primary mb-3" />
          <h1 className="fw-bold display-5 mb-3">Gestión de Documentos</h1>
          <p className="lead text-secondary">
            Administra procedimientos, planillas y otros documentos importantes.
          </p>
        </Col>
      </Row>

      {/* Sección para Añadir Documento (CONDICIONAL) */}
      {canUpload && (
        <Row className="justify-content-center mb-5">
          <Col md={10} lg={8}>
            <Card className="shadow-sm">
              <Card.Header className="bg-primary text-white">
                <h5 className="mb-0 d-flex align-items-center">
                  <PlusCircle size={20} className="me-2" /> Añadir Nuevo Documento
                </h5>
              </Card.Header>
              <Card.Body>
                <Form onSubmit={handleUploadSubmit}>
                  {/* Campo Nombre */}
                  <Form.Group className="mb-3" controlId="documentName">
                    <Form.Label>Nombre del Documento <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Ej: Planilla_Solicitud_VPN"
                      value={documentName}
                      onChange={(e) => setDocumentName(e.target.value)}
                      required
                      disabled={uploadingDocumento}
                    />
                  </Form.Group>
                  {/* Campo Descripción */}
                  <Form.Group className="mb-3" controlId="documentDescription">
                    <Form.Label>Descripción (Opcional)</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      placeholder="Breve descripción del contenido o propósito del documento"
                      value={documentDescription}
                      onChange={(e) => setDocumentDescription(e.target.value)}
                      disabled={uploadingDocumento}
                    />
                  </Form.Group>
                  {/* Campo Archivo */}
                  <Form.Group className="mb-3" controlId="file-upload-input">
                    <Form.Label>Archivo <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="file"
                      onChange={handleFileChange}
                      required
                      disabled={uploadingDocumento}
                    />
                    {selectedFile && <small className="text-muted d-block mt-1">Archivo seleccionado: {selectedFile.name}</small>}
                  </Form.Group>
                  {/* Alertas */}
                  {uploadDocumentoError && (
                    <Alert variant="danger" dismissible onClose={() => actions.clearUploadDocumentoStatus?.()}>
                      {uploadDocumentoError}
                    </Alert>
                  )}
                  {uploadDocumentoSuccess && (
                    <Alert variant="success" dismissible onClose={() => actions.clearUploadDocumentoStatus?.()}>
                      {uploadDocumentoSuccess}
                    </Alert>
                  )}
                  {/* Botón Carga */}
                  <Button variant="primary" type="submit" disabled={uploadingDocumento || !selectedFile || !documentName}>
                    {uploadingDocumento ? (
                      <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />Cargando...</>
                    ) : (
                      <><UploadCloud size={18} className="me-2" /> Cargar Documento</>
                    )}
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Sección para Listar Documentos */}
      <Row className="justify-content-center">
        <Col md={10} lg={8}>
          <h2 className="mb-4">Documentos Disponibles</h2>
          {/* Alerta Error Borrar */}
          {deleteDocumentoError && (
            <Alert variant="danger" dismissible onClose={() => actions.clearDeleteDocumentoError?.()}>
              Error al eliminar: {deleteDocumentoError}
            </Alert>
          )}
          {/* Estados Carga/Error Lista */}
          {documentosLoading ? (
            <div className="text-center p-5"><Spinner animation="border" variant="primary" /><p className="mt-2">Cargando documentos...</p></div>
          ) : documentosError ? (
            <Alert variant="danger" dismissible onClose={() => actions.clearDocumentosError?.()}>{documentosError}</Alert>
          ) : documentos.length === 0 ? (
            <Alert variant="info">No hay documentos disponibles en este momento.</Alert>
          ) : (
            // Lista
            <Card className="shadow-sm">
              <ListGroup variant="flush">
                {documentos.map((doc) => (
                  <ListGroup.Item
                    key={doc.id}
                    className="d-flex justify-content-between align-items-center flex-wrap"
                    style={{ opacity: deletingDocumentoId === doc.id ? 0.5 : 1, transition: 'opacity 0.3s ease-in-out' }}
                  >
                    {/* Info */}
                    <div className="me-auto mb-2 mb-md-0">
                      <h6 className="mb-0">{doc.nombre}</h6>
                      {doc.descripcion && <small className="text-muted d-block">{doc.descripcion}</small>}
                      <small className="text-muted d-block">Subido por: {doc.usuario_carga || 'N/A'} el {doc.fecha_carga ? new Date(doc.fecha_carga).toLocaleDateString() : 'N/A'}</small>
                      <small className="text-muted d-block">Archivo: {doc.nombre_archivo_original}</small>
                    </div>
                    {/* Botones */}
                    <div className="d-flex gap-2">
                      {/* Descargar */}
                      <Button
                        variant="outline-success"
                        size="sm"
                        onClick={() => handleDownload(doc.url_descarga, doc.nombre_archivo_original)}
                        disabled={deletingDocumentoId === doc.id}
                      >
                        <Download size={16} className="me-1" /> Descargar
                      </Button>
                      {/* Eliminar (CONDICIONAL) */}
                      {canDelete && (
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDeleteDocument(doc.id, doc.nombre)}
                          title="Eliminar Documento"
                          disabled={deletingDocumentoId === doc.id}
                        >
                          {deletingDocumentoId === doc.id ? (
                            <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </Button>
                      )}
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default DocumentsPage;
