import React, { useState, useEffect, useContext } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Spinner,
  Alert,
  Table,
  Modal,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import { FiMapPin, FiPlus, FiEdit } from "react-icons/fi";
import { FaFireExtinguisher, FaMapMarkedAlt } from "react-icons/fa";
import { Context } from "../store/appContext";
import ProtectedImage from "../component/ProtectedImage.jsx";
import "../../styles/ShaPage.css"; // Necesitaremos CSS personalizado

const ShaPage = () => {
  const { store, actions } = useContext(Context);
  // Añadir mapasPisos y su estado al destructuring
  const {
    extintores,
    pisosExtintores,
    extintoresLoading,
    extintoresError,
    mapasPisos,
    mapasPisosLoading,
  } = store;

  const [selectedPiso, setSelectedPiso] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentExtintor, setCurrentExtintor] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tempPinCoords, setTempPinCoords] = useState({ x: null, y: null });

  useEffect(() => {
    // Cargar datos iniciales al montar el componente
    actions.fetchPisosExtintores();
    actions.fetchMapasPisos(); // <-- AÑADIDO: Cargar los mapas de pisos dinámicos
    actions.fetchExtintores();
  }, []);

  useEffect(() => {
    // Si la lista de pisos se actualiza y no hay ninguno seleccionado, selecciona el primero
    if (pisosExtintores.length > 0 && !selectedPiso) {
      setSelectedPiso(pisosExtintores[0]);
    }
  }, [pisosExtintores]);

  const handleShowModal = (extintor = null) => {
    if (extintor) {
      setIsEditing(true);
      setCurrentExtintor({
        ...extintor,
        fecha_ultima_recarga: extintor.fecha_ultima_recarga
          ? extintor.fecha_ultima_recarga.split("T")[0]
          : "",
        fecha_proxima_recarga: extintor.fecha_proxima_recarga
          ? extintor.fecha_proxima_recarga.split("T")[0]
          : "",
      });
      // Set temp pin to existing coordinates for visual feedback
      setTempPinCoords({ x: extintor.coordenada_x, y: extintor.coordenada_y });
    } else {
      setIsEditing(false);
      setCurrentExtintor({
        tag: "",
        piso: selectedPiso || "",
        ubicacion_exacta: "",
        tipo: "PQS",
        capacidad_kg: "",
        fecha_ultima_recarga: "",
        fecha_proxima_recarga: "",
        estado: "Operativo",
        coordenada_x: null,
        coordenada_y: null,
      });
      // Reset temp pin when adding a new one
      setTempPinCoords({ x: null, y: null });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentExtintor(null);
    setIsEditing(false);
    // Reset temp pin on close
    setTempPinCoords({ x: null, y: null });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setCurrentExtintor((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    let success;
    if (isEditing) {
      success = await actions.updateExtintor(
        currentExtintor.id,
        currentExtintor
      );
    } else {
      success = await actions.addExtintor(currentExtintor);
    }
    setIsSubmitting(false);
    if (success) {
      handleCloseModal();
    }
  };

  const handleMapClick = (e) => {
    // Only allow placing pins if the modal is open for adding/editing
    if (!showModal) return;

    // This prevents setting coordinates if an existing extinguisher icon is clicked
    if (e.target.closest(".extintor-icon")) {
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);

    // Update the form fields in the modal
    setCurrentExtintor((prev) => ({
      ...prev,
      coordenada_x: x,
      coordenada_y: y,
    }));

    // Update the temporary pin for visual feedback
    setTempPinCoords({ x, y });
  };

  const extintoresFiltrados = extintores.filter((e) => e.piso === selectedPiso);

  // --- LÓGICA DINÁMICA PARA OBTENER EL MAPA ---
  // Busca el mapa correspondiente al piso seleccionado en el store
  const mapaActual = mapasPisos.find(
    (mapa) => mapa.nombre_piso === selectedPiso
  );
  const currentMapImage = mapaActual ? mapaActual.url_descarga : null;

  const renderTooltip = (props, extintor) => (
    <Tooltip id={`tooltip-${extintor.id}`} {...props}>
      <strong>Tag: {extintor.tag}</strong>
      <br />
      Ubicación: {extintor.ubicacion_exacta}
      <br />
      Tipo: {extintor.tipo} ({extintor.capacidad_kg} kg)
      <br />
      Últ. Recarga:{" "}
      {extintor.fecha_ultima_recarga
        ? new Date(extintor.fecha_ultima_recarga).toLocaleDateString()
        : "N/A"}
      <br />
      Prox. Recarga:{" "}
      {extintor.fecha_proxima_recarga
        ? new Date(extintor.fecha_proxima_recarga).toLocaleDateString()
        : "N/A"}
    </Tooltip>
  );

  return (
    <Container fluid className="mt-4">
      <h1 className="mb-4">Seguridad e Higiene (SHA) - Extintores</h1>

      {extintoresError && <Alert variant="danger">{extintoresError}</Alert>}

      <Row>
        {/* Columna del Mapa Interactivo */}
        <Col md={7} lg={8} className="mb-4">
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <FiMapPin className="me-2" />
                Mapa de Piso
              </h5>
              <div style={{ minWidth: "200px" }}>
                <Form.Select
                  value={selectedPiso}
                  onChange={(e) => setSelectedPiso(e.target.value)}
                  disabled={extintoresLoading}
                >
                  {pisosExtintores.length > 0 ? (
                    pisosExtintores.map((piso) => (
                      <option key={piso} value={piso}>
                        {piso}
                      </option>
                    ))
                  ) : (
                    <option>Cargando pisos...</option>
                  )}
                </Form.Select>
              </div>
            </Card.Header>
            <Card.Body>
              {extintoresLoading || mapasPisosLoading ? ( // <-- Comprobar carga de mapas también
                <div className="text-center p-5">
                  <Spinner animation="border" />
                </div>
              ) : (
                <div
                  className={`map-container ${
                    showModal ? "is-placing-pin" : ""
                  }`}
                  onClick={handleMapClick}
                >
                  {mapaActual ? (
                    <ProtectedImage
                      src={currentMapImage}
                      alt={`Mapa de ${selectedPiso}`}
                      className="map-image"
                    />
                  ) : (
                    <div className="map-placeholder d-flex justify-content-center align-items-center">
                      <div className="text-center text-muted">
                        <FaMapMarkedAlt size={60} className="mb-3" />
                        <h4>
                          No hay mapa disponible para{" "}
                          {selectedPiso || "este piso"}
                        </h4>
                        <p className="small">
                          Puedes subir uno desde la sección de Configuración/
                          Gestión de Pisos.
                        </p>
                      </div>
                    </div>
                  )}
                  {extintoresFiltrados.map(
                    (extintor) =>
                      extintor.coordenada_x != null &&
                      extintor.coordenada_y != null && (
                        <OverlayTrigger
                          key={extintor.id}
                          placement="top"
                          delay={{ show: 250, hide: 400 }}
                          overlay={(props) => renderTooltip(props, extintor)}
                        >
                          <div
                            className="extintor-icon"
                            style={{
                              left: `${extintor.coordenada_x}px`,
                              top: `${extintor.coordenada_y}px`,
                            }}
                          >
                            <FaFireExtinguisher
                              size={24}
                              color={
                                extintor.estado !== "Operativo"
                                  ? "orange"
                                  : "red"
                              }
                            />
                          </div>
                        </OverlayTrigger>
                      )
                  )}
                  {/* Visual feedback for the new/edited pin location */}
                  {showModal &&
                    tempPinCoords.x != null &&
                    tempPinCoords.y != null && (
                      <div
                        className="extintor-icon temp-pin"
                        style={{
                          left: `${tempPinCoords.x}px`,
                          top: `${tempPinCoords.y}px`,
                        }}
                        title="Ubicación seleccionada"
                      >
                        <FiMapPin size={28} color="#0d6efd" />
                      </div>
                    )}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Columna de Datos y Acciones */}
        <Col md={5} lg={4}>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Extintores en {selectedPiso}</h5>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleShowModal()}
              >
                <FiPlus /> Agregar
              </Button>
            </Card.Header>
            <Card.Body>
              {extintoresLoading ? (
                <div className="text-center p-3">
                  <Spinner animation="border" size="sm" />
                </div>
              ) : (
                <Table striped bordered hover responsive size="sm">
                  <thead>
                    <tr>
                      <th>Tag</th>
                      <th>Tipo</th>
                      <th>Últ. Recarga</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {extintoresFiltrados.length > 0 ? (
                      extintoresFiltrados.map((extintor) => (
                        <tr key={extintor.id}>
                          <td>{extintor.tag}</td>
                          <td>{extintor.tipo}</td>
                          <td>
                            {extintor.fecha_ultima_recarga
                              ? new Date(
                                  extintor.fecha_ultima_recarga
                                ).toLocaleDateString()
                              : "N/A"}
                          </td>
                          <td>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              className="me-1"
                              onClick={() => handleShowModal(extintor)}
                            >
                              <FiEdit />
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="text-center text-muted">
                          No hay extintores para este piso.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modal para Agregar/Editar Extintor */}
      <Modal show={showModal} onHide={handleCloseModal} backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>
            {isEditing ? "Editar Extintor" : "Agregar Nuevo Extintor"}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleFormSubmit}>
          <Modal.Body>
            {extintoresError && (
              <Alert variant="danger">{extintoresError}</Alert>
            )}
            <Alert variant="info" className="small p-2">
              <FiMapPin className="me-2" />
              {isEditing
                ? "Haga clic en el mapa para reubicar el extintor."
                : "Haga clic en el mapa para establecer la ubicación del nuevo extintor."}
            </Alert>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Tag / ID</Form.Label>
                  <Form.Control
                    type="text"
                    name="tag"
                    value={currentExtintor?.tag || ""}
                    onChange={handleFormChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Piso</Form.Label>
                  <Form.Select
                    name="piso"
                    value={currentExtintor?.piso || ""}
                    onChange={handleFormChange}
                    required
                  >
                    <option value="">Seleccione...</option>
                    {pisosExtintores.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Ubicación Exacta</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="ubicacion_exacta"
                value={currentExtintor?.ubicacion_exacta || ""}
                onChange={handleFormChange}
                required
              />
            </Form.Group>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Tipo</Form.Label>
                  <Form.Select
                    name="tipo"
                    value={currentExtintor?.tipo || "PQS"}
                    onChange={handleFormChange}
                    required
                  >
                    <option value="PQS">PQS</option>
                    <option value="CO2">CO2</option>
                    <option value="Agua">Agua</option>
                    <option value="Espuma">Espuma AFFF</option>
                    <option value="Clase K">Clase K</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Capacidad (kg)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.1"
                    name="capacidad_kg"
                    value={currentExtintor?.capacidad_kg || ""}
                    onChange={handleFormChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Fecha Última Recarga</Form.Label>
                  <Form.Control
                    type="date"
                    name="fecha_ultima_recarga"
                    value={currentExtintor?.fecha_ultima_recarga || ""}
                    onChange={handleFormChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Fecha Próxima Recarga</Form.Label>
                  <Form.Control
                    type="date"
                    name="fecha_proxima_recarga"
                    value={currentExtintor?.fecha_proxima_recarga || ""}
                    onChange={handleFormChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Coord. X (px)</Form.Label>
                  <Form.Control
                    type="number"
                    name="coordenada_x"
                    value={currentExtintor?.coordenada_x ?? 0}
                    onChange={handleFormChange}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Coord. Y (px)</Form.Label>
                  <Form.Control
                    type="number"
                    name="coordenada_y"
                    value={currentExtintor?.coordenada_y ?? 0}
                    onChange={handleFormChange}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Estado</Form.Label>
                  <Form.Select
                    name="estado"
                    value={currentExtintor?.estado || "Operativo"}
                    onChange={handleFormChange}
                  >
                    <option value="Operativo">Operativo</option>
                    <option value="Vencido">Vencido</option>
                    <option value="Obstruido">Obstruido</option>
                    <option value="Faltante">Faltante</option>
                    <option value="Mantenimiento">Mantenimiento</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={handleCloseModal}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button variant="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                  />{" "}
                  Guardando...
                </>
              ) : (
                "Guardar"
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default ShaPage;
