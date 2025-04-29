// src/front/js/pages/DocumentsPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Button, Form, Table, Spinner, Alert, ListGroup } from 'react-bootstrap';
import { UploadCloud, FileText, Download, Trash2, PlusCircle } from 'lucide-react';
import { Context } from '../store/appContext'; // Asumiendo que usarás context para manejar datos/API

const DocumentsPage = () => {
  const { store, actions } = useContext(Context); // Obtén store y actions si los usas

  // --- Estados Locales ---
  // Para el formulario de carga
  const [selectedFile, setSelectedFile] = useState(null);
  const [documentName, setDocumentName] = useState('');
  const [documentDescription, setDocumentDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(null);

  // Para la lista (idealmente vendrá del store global)
  const [documents, setDocuments] = useState([]); // Temporalmente local, debería ser store.documents
  const [isLoadingList, setIsLoadingList] = useState(false); // Temporalmente local, debería ser store.documentsLoading
  const [listError, setListError] = useState(null); // Temporalmente local, debería ser store.documentsError

  // --- Efectos ---
  // Simula la carga de documentos al montar (Reemplazar con actions.fetchDocuments())
  useEffect(() => {
    setIsLoadingList(true);
    setListError(null);
    // --- Simulación ---
    setTimeout(() => {
      setDocuments([
        { id: 1, name: "Procedimiento_Backup_Servidores.pdf", description: "Guía paso a paso para backups.", url: "/api/documents/1/download", created_at: "2023-10-26T10:00:00Z" },
        { id: 2, name: "Planilla_Solicitud_Acceso.docx", description: "Formulario para nuevos accesos.", url: "/api/documents/2/download", created_at: "2023-10-25T15:30:00Z" },
        { id: 3, name: "Normativa_Uso_Equipos.pdf", description: "Reglas de uso de hardware.", url: "/api/documents/3/download", created_at: "2023-10-24T09:15:00Z" },
      ]);
      setIsLoadingList(false);
    }, 1500);
    // --- Fin Simulación ---

    // --- Llamada Real (descomentar cuando tengas la acción) ---
    // const loadData = async () => {
    //   setIsLoadingList(true); // O usar store.documentsLoading
    //   setListError(null); // O usar store.documentsError
    //   try {
    //     await actions.fetchDocuments(); // Asume que esta acción existe y actualiza el store
    //   } catch (error) {
    //      // La acción debería manejar el error y ponerlo en el store
    //      // setListError("Error al cargar documentos.");
    //   } finally {
    //      // La acción debería poner loading a false en el store
    //      // setIsLoadingList(false);
    //   }
    // };
    // loadData();
    // ---------------------------------------------------------

  }, []); // Dependencia vacía para ejecutar solo al montar

  // --- Manejadores de Eventos ---
  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setUploadError(null); // Limpia errores anteriores al seleccionar nuevo archivo
    setUploadSuccess(null);
  };

  const handleUploadSubmit = async (event) => {
    event.preventDefault();
    if (!selectedFile || !documentName) {
      setUploadError("Por favor, selecciona un archivo y asigna un nombre.");
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('name', documentName);
    formData.append('description', documentDescription);

    // --- Simulación de Carga ---
    console.log("Simulando carga:", { name: documentName, description: documentDescription, fileName: selectedFile.name });
    setTimeout(() => {
        setIsUploading(false);
        setUploadSuccess(`Documento "${documentName}" cargado exitosamente (simulado).`);
        // Limpiar formulario
        setSelectedFile(null);
        setDocumentName('');
        setDocumentDescription('');
        document.getElementById('file-upload-input').value = null; // Resetear input file
        // TODO: Refrescar la lista (llamar a actions.fetchDocuments() o añadir localmente)
    }, 2000);
    // --- Fin Simulación ---

    // --- Llamada Real (descomentar cuando tengas la acción) ---
    // try {
    //   await actions.uploadDocument(formData); // Asume que esta acción existe
    //   setUploadSuccess(`Documento "${documentName}" cargado exitosamente.`);
    //   setSelectedFile(null);
    //   setDocumentName('');
    //   setDocumentDescription('');
    //   document.getElementById('file-upload-input').value = null;
    //   // La acción fetchDocuments podría llamarse dentro de uploadDocument si es necesario
    // } catch (error) {
    //   console.error("Error uploading document:", error);
    //   // La acción debería manejar el error y ponerlo en el store o devolverlo
    //   setUploadError(error.message || "Error al cargar el documento.");
    // } finally {
    //   setIsUploading(false); // La acción debería manejar el estado de carga
    // }
    // ---------------------------------------------------------
  };

  const handleDeleteDocument = async (docId, docName) => {
      if (window.confirm(`¿Estás seguro de que deseas eliminar el documento "${docName}"?`)) {
          console.log("Simulando eliminación de documento ID:", docId);
          // --- Llamada Real (descomentar cuando tengas la acción) ---
          // try {
          //   await actions.deleteDocument(docId);
          //   // Refrescar lista
          // } catch (error) {
          //   console.error("Error deleting document:", error);
          //   alert("Error al eliminar el documento.");
          // }
          // ---------------------------------------------------------

          // --- Simulación ---
          setDocuments(prevDocs => prevDocs.filter(doc => doc.id !== docId));
          // --- Fin Simulación ---
      }
  };


  return (
    <Container fluid className="py-5 px-md-5">
      <Row className="justify-content-center mb-5">
        <Col md={10} lg={8} className="text-center">
          <FileText size={50} className="text-primary mb-3" />
          <h1 className="fw-bold display-5 mb-3">Gestión de Documentos</h1>
          <p className="lead text-secondary">
            Administra procedimientos, planillas y otros documentos importantes.
          </p>
        </Col>
      </Row>

      {/* Sección para Añadir Documento */}
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
                <Form.Group className="mb-3" controlId="documentName">
                  <Form.Label>Nombre del Documento <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Ej: Planilla_Solicitud_VPN"
                    value={documentName}
                    onChange={(e) => setDocumentName(e.target.value)}
                    required
                    disabled={isUploading}
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="documentDescription">
                  <Form.Label>Descripción (Opcional)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    placeholder="Breve descripción del contenido o propósito del documento"
                    value={documentDescription}
                    onChange={(e) => setDocumentDescription(e.target.value)}
                    disabled={isUploading}
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="file-upload-input">
                  <Form.Label>Archivo <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="file"
                    onChange={handleFileChange}
                    required
                    disabled={isUploading}
                  />
                   {selectedFile && <small className="text-muted d-block mt-1">Archivo seleccionado: {selectedFile.name}</small>}
                </Form.Group>

                {uploadError && <Alert variant="danger">{uploadError}</Alert>}
                {uploadSuccess && <Alert variant="success">{uploadSuccess}</Alert>}

                <Button variant="primary" type="submit" disabled={isUploading || !selectedFile || !documentName}>
                  {isUploading ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                      Cargando...
                    </>
                  ) : (
                    <>
                      <UploadCloud size={18} className="me-2" /> Cargar Documento
                    </>
                  )}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Sección para Listar Documentos */}
      <Row className="justify-content-center">
        <Col md={10} lg={8}>
          <h2 className="mb-4">Documentos Disponibles</h2>
          {isLoadingList ? (
            <div className="text-center p-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2">Cargando documentos...</p>
            </div>
          ) : listError ? (
            <Alert variant="danger">{listError}</Alert>
          ) : documents.length === 0 ? (
            <Alert variant="info">No hay documentos disponibles en este momento.</Alert>
          ) : (
            <Card className="shadow-sm">
              <ListGroup variant="flush">
                {documents.map((doc) => (
                  <ListGroup.Item key={doc.id} className="d-flex justify-content-between align-items-center flex-wrap">
                    <div className="me-auto mb-2 mb-md-0">
                      <h6 className="mb-0">{doc.name}</h6>
                      {doc.description && <small className="text-muted d-block">{doc.description}</small>}
                       <small className="text-muted d-block">Subido: {new Date(doc.created_at).toLocaleDateString()}</small>
                    </div>
                    <div className="d-flex gap-2">
                       {/* El href debe apuntar a tu endpoint de descarga del backend */}
                      <Button
                        variant="outline-success"
                        size="sm"
                        href={doc.url} // ¡IMPORTANTE: Esta URL debe ser la del backend que sirve el archivo!
                        target="_blank" // Abre en nueva pestaña (opcional)
                        download // Sugiere al navegador descargar el archivo
                      >
                        <Download size={16} className="me-1" /> Descargar
                      </Button>
                      {/* Botón de eliminar (requiere lógica de permisos/backend) */}
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDeleteDocument(doc.id, doc.name)}
                        title="Eliminar Documento"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card>
            /* Opcional: Usar una Tabla si prefieres
            <Card>
              <Card.Body className="p-0"> // Quitar padding si se usa tabla
                <Table striped bordered hover responsive className="mb-0">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Descripción</th>
                      <th>Fecha Carga</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documents.map((doc) => (
                      <tr key={doc.id}>
                        <td>{doc.name}</td>
                        <td>{doc.description || '-'}</td>
                        <td>{new Date(doc.created_at).toLocaleDateString()}</td>
                        <td>
                          <Button variant="outline-success" size="sm" href={doc.url} target="_blank" download className="me-2">
                             <Download size={16} />
                          </Button>
                          <Button variant="outline-danger" size="sm" onClick={() => handleDeleteDocument(doc.id, doc.name)}>
                             <Trash2 size={16} />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
            */
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default DocumentsPage;
