import React, { useContext, useState, useEffect, useMemo } from "react";
import { Context } from "../store/appContext";
import {
  Modal,
  Button,
  Form,
  Table,
  Alert,
  Spinner,
  Dropdown,
  Container,
  Row,
  Col,
  Nav,
  Tab,
  Card,
  Badge,
} from "react-bootstrap"; // Añadido Nav y Tab
import { format } from "date-fns";

// --- Importaciones para PDF ---
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logoBase64 from "../../img/logo dcce.png"; // <-- Importa tu logo (ajusta la ruta)

const ESTATUS_OPTIONS = ["Pendiente", "En Progreso", "Completado", "Cancelado"];

const ActividadesProveedor = () => {
  // Cambiado a función nombrada para export default
  const { store, actions } = useContext(Context);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentActividad, setCurrentActividad] = useState(null);
  const [formData, setFormData] = useState({
    proveedor_id: "",
    descripcion: "",
    fecha_ocurrencia: "",
    fecha_reporte: "",
    numero_reporte: "",
    estatus: ESTATUS_OPTIONS[0],
  });
  const [selectedProveedorFilter, setSelectedProveedorFilter] = useState("");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("");
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false); // Renombrado para claridad
  const [pdfError, setPdfError] = useState(null);
  const [activeTab, setActiveTab] = useState("energia"); // 'energia' u 'otros'
  const [idProveedorEnergia, setIdProveedorEnergia] = useState(null);
  // Nuevo estado para los diagnósticos no solucionados
  const [diagnosticosNoSolucionados, setDiagnosticosNoSolucionados] = useState(
    []
  );

  // --- useEffects y otros handlers (sin cambios) ---
  useEffect(() => {
    actions.fetchProveedores();
    // La carga inicial de actividades dependerá de la pestaña activa
  }, []);

  useEffect(() => {
    // Encontrar el ID del proveedor "Energía" una vez que los proveedores se cargan
    const proveedorEnergia = store.proveedores.find(
      (p) =>
        p.nombre.toLowerCase().includes("energia") ||
        p.nombre.toLowerCase().includes("energía")
    );
    if (proveedorEnergia) {
      setIdProveedorEnergia(proveedorEnergia.id);
    }
  }, [store.proveedores]);

  useEffect(() => {
    if (activeTab === "energia") {
      if (idProveedorEnergia) {
        // Para la pestaña Energía, cargamos las actividades del proveedor Energía
        // Y también cargamos todos los diagnósticos no solucionados de los aires
        actions.fetchActividadesPorProveedor(idProveedorEnergia); // Esto es para las actividades existentes
        // Necesitamos una acción para traer TODOS los registros de diagnóstico o filtrarlos en el backend
        // Por ahora, simularemos que los obtenemos y filtramos aquí.
        // Idealmente, tendrías una acción: actions.fetchAllUnresolvedDiagnosticRecords()
        // y luego los filtrarías/agruparías.
        // Como placeholder, vamos a asumir que los tenemos en alguna parte del store o los cargamos.
        // Esta parte necesitará una acción de Flux dedicada.
        actions
          .fetchAllDiagnosticRecords({ solucionado: false })
          .then((allRecords) => {
            // Asumiendo que tienes esta acción y filtra por no solucionado
            if (allRecords) {
              // const unresolved = allRecords.filter(r => !r.solucionado); // No es necesario si el backend ya filtra
              setDiagnosticosNoSolucionados(allRecords);
            }
          });
      } else {
        // Si aún no se encuentra el ID de Energía, no cargar nada o mostrar mensaje
        actions.fetchActividadesPorProveedor(null); // Limpia la lista
        setDiagnosticosNoSolucionados([]);
      }
    } else if (activeTab === "otros") {
      // Para la pestaña Otros, usamos el filtro de proveedor (excluyendo Energía) o todos (excluyendo Energía)
      if (
        selectedProveedorFilter &&
        selectedProveedorFilter !== idProveedorEnergia?.toString()
      ) {
        actions.fetchActividadesPorProveedor(selectedProveedorFilter);
      } else {
        actions.fetchAllActividades(selectedStatusFilter || null); // fetchAllActividades podría necesitar un filtro para excluir Energía
      }
    }
  }, [
    activeTab,
    idProveedorEnergia,
    selectedProveedorFilter,
    selectedStatusFilter,
    actions,
  ]);

  // --- Dentro de ActividadesProveedor ---

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    // Formato para datetime-local: YYYY-MM-DDTHH:mm
    // No necesitas añadir ':00' aquí si el input es datetime-local
    setFormData({ ...formData, [name]: value });
  };

  const handleShowAddModal = () => {
    setIsEditing(false);
    setCurrentActividad(null);
    setFormData({
      proveedor_id:
        activeTab === "energia" && idProveedorEnergia
          ? idProveedorEnergia.toString()
          : activeTab === "otros" && selectedProveedorFilter
          ? selectedProveedorFilter
          : "",
      descripcion: "",
      fecha_ocurrencia: "",
      // Default fecha_reporte a ahora, formateado para datetime-local
      fecha_reporte: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      numero_reporte: "",
      estatus: ESTATUS_OPTIONS[0],
    });
    actions.clearActividadesError(); // Limpia errores previos al abrir
    setShowModal(true);
  };

  const handleShowEditModal = (actividad) => {
    setIsEditing(true);
    setCurrentActividad(actividad);
    setFormData({
      proveedor_id: actividad.proveedor_id, // No editable
      descripcion: actividad.descripcion || "",
      // Formatear fechas existentes para datetime-local
      fecha_ocurrencia: actividad.fecha_ocurrencia
        ? format(new Date(actividad.fecha_ocurrencia), "yyyy-MM-dd'T'HH:mm")
        : "",
      fecha_reporte: actividad.fecha_reporte
        ? format(new Date(actividad.fecha_reporte), "yyyy-MM-dd'T'HH:mm")
        : "",
      numero_reporte: actividad.numero_reporte || "",
      estatus: actividad.estatus || ESTATUS_OPTIONS[0],
    });
    actions.clearActividadesError(); // Limpia errores previos al abrir
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentActividad(null);
    setIsEditing(false);
    // Opcional: resetear formData al cerrar si prefieres
    // setFormData({ proveedor_id: '', ... });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    actions.clearActividadesError();

    // Validación básica
    if (!formData.descripcion || !formData.fecha_ocurrencia) {
      actions.setActividadesError(
        "Descripción y Fecha de Ocurrencia son requeridas."
      ); // Necesitas esta acción en flux.js
      return;
    }
    if (!isEditing && !formData.proveedor_id) {
      actions.setActividadesError("Debe seleccionar un proveedor.");
      return;
    }

    // Preparar datos (convertir fechas de datetime-local a ISO para el backend)
    const dataToSend = {
      ...formData,
      // Asegúrate que las fechas vacías se envíen como null o string vacío según espere tu backend
      fecha_ocurrencia: formData.fecha_ocurrencia
        ? new Date(formData.fecha_ocurrencia).toISOString()
        : null,
      fecha_reporte: formData.fecha_reporte
        ? new Date(formData.fecha_reporte).toISOString()
        : null,
    };

    let success = false;
    if (isEditing && currentActividad) {
      success = await actions.updateActividadProveedor(
        currentActividad.id,
        dataToSend,
        selectedProveedorFilter || null
      );
    } else {
      // Asegúrate que proveedor_id se esté enviando correctamente
      success = await actions.addActividadProveedor(
        formData.proveedor_id,
        dataToSend
      );
    }

    if (success) {
      handleCloseModal();
      // La recarga de datos es manejada por el useEffect que escucha los filtros
    }
    // El error se muestra a través de store.actividadesError
  };

  const handleDelete = async (id) => {
    if (
      window.confirm("¿Estás seguro de que deseas eliminar esta actividad?")
    ) {
      actions.clearActividadesError();
      const success = await actions.deleteActividadProveedor(
        id,
        selectedProveedorFilter || null
      );
      if (!success) {
        // El error se muestra a través de store.actividadesError
      }
      // La recarga de datos es manejada por el useEffect
    }
  };

  const handleProveedorFilterChange = (e) => {
    setSelectedProveedorFilter(e.target.value);
    if (e.target.value) {
      // Si se selecciona un proveedor, limpiar filtro de estado
      setSelectedStatusFilter("");
    }
  };

  const handleStatusFilterChange = (e) => {
    setSelectedStatusFilter(e.target.value);
    // Limpiar filtro de proveedor si seleccionas estatus (si la lógica es excluyente)
    // Esto solo aplica si estamos en la pestaña "Otros" y no hay un proveedor específico seleccionado
    // if (activeTab === 'otros' && e.target.value) {
    //     setSelectedProveedorFilter('');
    // }
  };

  const getFilteredActividades = () => {
    if (activeTab === "energia") {
      // Para la pestaña Energía, las actividades ya deberían estar filtradas por idProveedorEnergia
      // Solo aplicamos el filtro de estado si existe
      return selectedStatusFilter
        ? store.actividadesProveedor.filter(
            (act) =>
              act.estatus === selectedStatusFilter &&
              act.proveedor_id === idProveedorEnergia
          )
        : store.actividadesProveedor.filter(
            (act) => act.proveedor_id === idProveedorEnergia
          );
    } else {
      // activeTab === 'otros'
      // Para "Otros", excluimos las de Energía y aplicamos filtros de proveedor y estado
      return store.actividadesProveedor.filter(
        (act) =>
          act.proveedor_id !== idProveedorEnergia &&
          (!selectedProveedorFilter ||
            act.proveedor_id === parseInt(selectedProveedorFilter)) &&
          (!selectedStatusFilter || act.estatus === selectedStatusFilter)
      );
    }
  };

  // Agrupar diagnósticos no solucionados por aire para la pestaña "Energía"
  const diagnosticosAgrupadosPorAire = useMemo(() => {
    if (activeTab !== "energia" || !diagnosticosNoSolucionados.length)
      return {};
    return diagnosticosNoSolucionados.reduce((acc, diag) => {
      const aireNombre = diag.aire_nombre || `Aire ID: ${diag.aire_id}`; // Necesitarás el nombre del aire
      if (!acc[aireNombre]) {
        acc[aireNombre] = {
          aireId: diag.aire_id,
          nombre: aireNombre,
          ubicacion: diag.aire_ubicacion,
          diagnosticos: [],
        };
      }
      acc[aireNombre].diagnosticos.push(diag);
      return acc;
    }, {});
  }, [activeTab, diagnosticosNoSolucionados]);

  // --- *** NUEVA FUNCIÓN handleGeneratePDF *** ---
  const handleGeneratePDF = () => {
    // 1. Verificar que un proveedor esté seleccionado
    if (activeTab === "otros" && !selectedProveedorFilter) {
      setPdfError(
        "Por favor, selecciona un proveedor (Otros) para generar el reporte."
      );
      return;
    }
    if (activeTab === "energia" && !idProveedorEnergia) {
      setPdfError(
        "Proveedor Energía no definido, no se puede generar el reporte."
      );
      return;
    }

    setIsGeneratingPDF(true);
    setPdfError(null);
    actions.clearActividadesError(); // Limpiar errores generales

    try {
      // 2. Obtener el nombre del proveedor seleccionado
      let proveedorSeleccionado;
      if (activeTab === "energia") {
        proveedorSeleccionado = store.proveedores.find(
          (p) => p.id === idProveedorEnergia
        );
      } else {
        proveedorSeleccionado = store.proveedores.find(
          (p) => p.id === parseInt(selectedProveedorFilter)
        );
      }
      const nombreProveedor = proveedorSeleccionado
        ? proveedorSeleccionado.nombre
        : "Desconocido";

      // 3. Obtener datos para el PDF según la pestaña activa
      // Para el PDF, solo queremos Pendiente y En Progreso
      const actividadesFiltradasParaVista = getFilteredActividades();
      const actividadesParaReporte = actividadesFiltradasParaVista.filter(
        (act) => act.estatus === "Pendiente" || act.estatus === "En Progreso"
      );

      // 4. Verificar si hay actividades para reportar
      if (activeTab === "otros" && actividadesParaReporte.length === 0) {
        setPdfError(
          `No se encontraron actividades Pendientes o En Progreso para ${nombreProveedor}.`
        );
        setIsGeneratingPDF(false);
        return;
      }

      // 5. Crear instancia de jsPDF
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      // --- Añadir Logo (Ajusta posición y tamaño) ---
      const logoWidth = 25; // Ancho en mm
      const logoHeight =
        (doc.getImageProperties(logoBase64).height * logoWidth) /
        doc.getImageProperties(logoBase64).width; // Calcular altura proporcional
      const margin = 10; // Margen izquierdo/superior
      doc.addImage(logoBase64, "PNG", margin, margin, logoWidth, logoHeight);

      let startY = margin + logoHeight + 10; // Posición Y debajo del logo/título

      if (activeTab === "energia") {
        // --- PDF para la Pestaña Energía (basado en diagnósticos) ---
        const titleEnergia = `Informe de Diagnósticos Pendientes (Proveedor Energía)`;
        doc.setFontSize(15);
        doc.setFont("helvetica", "bold");
        doc.text(
          titleEnergia,
          doc.internal.pageSize.getWidth() / 2,
          margin + logoHeight / 2,
          { align: "center" }
        );

        const airesConDiagnosticos = Object.values(
          diagnosticosAgrupadosPorAire
        );
        if (airesConDiagnosticos.length === 0) {
          setPdfError(
            "No hay diagnósticos pendientes para el proveedor Energía."
          );
          setIsGeneratingPDF(false);
          return;
        }

        airesConDiagnosticos.forEach((grupo, index) => {
          if (index > 0) {
            // Añadir espacio o salto de página antes del siguiente aire
            startY = doc.lastAutoTable.finalY + 15;
            if (startY > doc.internal.pageSize.getHeight() - 30) {
              // Evitar que la tabla empiece muy abajo
              doc.addPage();
              startY = margin; // Reiniciar Y en nueva página
            }
          }
          doc.setFontSize(12);
          doc.setFont("helvetica", "bold");
          doc.text(
            `Aire: ${grupo.nombre} (Ubicación: ${grupo.ubicacion || "N/A"})`,
            margin,
            startY
          );
          startY += 7;

          const tableColumnDiagnosticos = [
            "Fecha",
            "Parte",
            "Diagnóstico",
            "Notas",
            "Registrado Por",
          ];
          const tableRowsDiagnosticos = grupo.diagnosticos.map((diag) => [
            diag.fecha_hora
              ? format(new Date(diag.fecha_hora), "dd/MM/yy HH:mm")
              : "-",
            diag.parte_ac || "-",
            diag.diagnostico_nombre || "-",
            diag.notas || "-",
            diag.registrado_por_username || "Sistema",
          ]);

          autoTable(doc, {
            head: [tableColumnDiagnosticos],
            body: tableRowsDiagnosticos,
            startY: startY,
            theme: "grid",
            styles: { fontSize: 8, cellPadding: 1.5 },
            headStyles: {
              fillColor: [22, 160, 133],
              fontSize: 9,
              fontStyle: "bold",
            },
            margin: { left: margin, right: margin },
          });
          startY = doc.lastAutoTable.finalY; // Actualizar startY para el siguiente elemento
        });
      } else {
        // activeTab === 'otros'
        // --- PDF para la Pestaña Otros (basado en actividades) ---
        const titleOtros = `Informe de Seguimiento - Proveedor: ${nombreProveedor}`;
        doc.setFontSize(15);
        doc.setFont("helvetica", "bold");
        doc.text(
          titleOtros,
          doc.internal.pageSize.getWidth() / 2,
          margin + logoHeight / 2,
          { align: "center" }
        );

        const tableColumnActividades = [
          "ID",
          "Descripción",
          "F. Ocurrencia",
          "F. Reporte",
          "# Reporte",
          "Estatus",
        ];
        const tableRowsActividades = actividadesParaReporte.map((act) => [
          act.id,
          act.descripcion || "-",
          act.fecha_ocurrencia
            ? format(new Date(act.fecha_ocurrencia), "dd/MM/yy HH:mm")
            : "-",
          act.fecha_reporte
            ? format(new Date(act.fecha_reporte), "dd/MM/yy HH:mm")
            : "-",
          act.numero_reporte || "-",
          act.estatus || "-",
        ]);

        autoTable(doc, {
          head: [tableColumnActividades],
          body: tableRowsActividades,
          startY: startY,
          theme: "grid",
          styles: { fontSize: 8, cellPadding: 1.5 },
          headStyles: {
            fillColor: [22, 160, 133],
            fontSize: 9,
            fontStyle: "bold",
          },
          margin: { left: margin, right: margin },
        });
      }

      // --- Añadir Pie de Página (Número de página) ---
      const pageCount = doc.internal.getNumberOfPages();
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8);
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.text(
          `Página ${i} de ${pageCount}`,
          doc.internal.pageSize.getWidth() / 2,
          doc.internal.pageSize.getHeight() - margin,
          { align: "center" }
        );
      }

      // 6. Guardar el PDF
      const filename =
        activeTab === "energia"
          ? `reporte_diagnosticos_energia.pdf`
          : `reporte_actividades_${nombreProveedor.replace(/\s+/g, "_")}.pdf`;

      doc.save(filename);
    } catch (error) {
      console.error("Error generando el reporte PDF:", error);
      setPdfError(error.message || "Ocurrió un error al generar el PDF.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };
  // --- *** FIN NUEVA FUNCIÓN handleGeneratePDF *** ---

  // Función para renderizar la tabla de actividades (reutilizable)
  function renderActividadesTabla(actividades) {
    if (store.actividadesLoading) {
      return (
        <div className="text-center">
          <Spinner animation="border" /> Cargando actividades...
        </div>
      );
    }
    if (store.actividadesError) {
      return (
        <Alert
          variant="danger"
          onClose={() => actions.clearActividadesError()}
          dismissible
        >
          {store.actividadesError}
        </Alert>
      );
    }
    if (actividades.length === 0) {
      return (
        <Alert variant="info">
          No se encontraron actividades con los filtros seleccionados.
        </Alert>
      );
    }

    return (
      <Table striped bordered hover responsive size="sm">
        <thead>
          <tr>
            <th>Proveedor</th>
            <th>Descripción</th>
            <th>Fecha Ocurrencia</th>
            <th>Fecha Reporte</th>
            <th># Reporte</th>
            <th>Estatus</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {actividades.map((act) => (
            <tr key={act.id}>
              <td>{act.nombre_proveedor || "N/A"}</td>
              <td>{act.descripcion}</td>
              <td>
                {act.fecha_ocurrencia
                  ? format(new Date(act.fecha_ocurrencia), "dd/MM/yyyy HH:mm")
                  : "N/A"}
              </td>
              <td>
                {act.fecha_reporte
                  ? format(new Date(act.fecha_reporte), "dd/MM/yyyy HH:mm")
                  : "N/A"}
              </td>
              <td>{act.numero_reporte || "-"}</td>
              <td>
                <span
                  className={`badge bg-${
                    act.estatus === "Completado"
                      ? "success"
                      : act.estatus === "Cancelado"
                      ? "danger"
                      : act.estatus === "En Progreso"
                      ? "warning"
                      : "secondary"
                  }`}
                >
                  {act.estatus || "N/A"}
                </span>
              </td>
              <td>
                <Button
                  variant="outline-primary"
                  size="sm"
                  className="me-1"
                  onClick={() => handleShowEditModal(act)}
                  title="Editar"
                >
                  <i className="fas fa-edit"></i>
                </Button>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => handleDelete(act.id)}
                  title="Eliminar"
                >
                  <i className="fas fa-trash"></i>
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    );
  }

  // Nueva función para renderizar la tabla de diagnósticos para la pestaña Energía
  function renderDiagnosticosEnergiaTabla(diagnosticosAgrupados) {
    const airesConDiagnosticos = Object.values(diagnosticosAgrupados);

    if (store.loading) {
      // Usar el estado de carga general o uno específico para diagnósticos
      return (
        <div className="text-center">
          <Spinner animation="border" /> Cargando diagnósticos...
        </div>
      );
    }
    if (store.error) {
      // Usar el estado de error general o uno específico
      return <Alert variant="danger">{store.error}</Alert>;
    }
    if (airesConDiagnosticos.length === 0 && !store.loading) {
      // Solo mostrar si no está cargando
      return (
        <Alert variant="info">
          No hay diagnósticos de operatividad pendientes que requieran atención
          del proveedor Energía.
        </Alert>
      );
    }

    return (
      <>
        {airesConDiagnosticos.map((grupo) => (
          <Card key={grupo.aireId} className="mb-3">
            <Card.Header>
              <strong>Aire: {grupo.nombre}</strong> (Ubicación:{" "}
              {grupo.ubicacion || "N/A"})
            </Card.Header>
            <Table striped bordered hover responsive size="sm" className="mb-0">
              <thead>
                <tr>
                  <th>Fecha/Hora Diagnóstico</th>
                  <th>Parte Afectada</th>
                  <th>Diagnóstico</th>
                  <th>Notas</th>
                  <th>Registrado Por</th>
                </tr>
              </thead>
              <tbody>
                {grupo.diagnosticos.map((diag) => (
                  <tr key={diag.id}>
                    <td>
                      {diag.fecha_hora
                        ? format(new Date(diag.fecha_hora), "dd/MM/yyyy HH:mm")
                        : "N/A"}
                    </td>
                    <td>
                      <Badge bg="info">{diag.parte_ac}</Badge>
                    </td>
                    <td>{diag.diagnostico_nombre || "N/A"}</td>
                    <td>{diag.notas || "-"}</td>
                    <td>{diag.registrado_por_username || "Sistema"}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
        ))}
      </>
    );
  }

  return (
    // El return principal del componente
    <Container className="mt-4">
      <Row className="mb-3 align-items-center">
        <Col xs={12} md={6}>
          <h2>Gestión de Actividades Pendientes de Proveedores Internos</h2>
        </Col>
        <Col xs={12} md={6} className="text-md-end mt-2 mt-md-0">
          <Button
            variant="outline-danger"
            onClick={handleGeneratePDF}
            disabled={
              (activeTab === "energia" && !idProveedorEnergia) ||
              (activeTab === "otros" && !selectedProveedorFilter) ||
              isGeneratingPDF
            }
            className="me-2 mb-2 mb-md-0"
            title={
              activeTab === "energia" && !idProveedorEnergia
                ? "Proveedor Energía no definido"
                : activeTab === "otros" && !selectedProveedorFilter
                ? "Selecciona un proveedor (Otros) para generar PDF"
                : "Descargar PDF de actividades Pendientes/En Progreso"
            }
          >
            {isGeneratingPDF ? (
              <>
                <Spinner size="sm" /> Generando...
              </>
            ) : (
              <>
                <i className="fas fa-file-pdf me-2"></i> Descargar PDF
              </>
            )}
          </Button>
          {activeTab !== "energia" && (
            <Button
              variant="primary"
              onClick={handleShowAddModal}
              className="mb-2 mb-md-0"
            >
              <i className="fas fa-plus me-2"></i> Nueva Actividad
            </Button>
          )}
        </Col>
      </Row>

      {pdfError && (
        <Alert variant="danger" onClose={() => setPdfError(null)} dismissible>
          {pdfError}
        </Alert>
      )}

      <Tab.Container
        id="actividades-tabs"
        activeKey={activeTab}
        onSelect={(k) => {
          setActiveTab(k);
          // Resetear filtros al cambiar de pestaña para evitar confusión
          setSelectedProveedorFilter("");
          setSelectedStatusFilter("");
        }}
      >
        <Nav variant="tabs" className="mb-3">
          <Nav.Item>
            <Nav.Link eventKey="energia">Proveedor Energía</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="otros">Otros Proveedores</Nav.Link>
          </Nav.Item>
        </Nav>

        <Row className="mb-3 gx-2">
          {activeTab === "otros" && (
            <Col md={6}>
              <Form.Group controlId="proveedorFilterOtros">
                <Form.Label>Filtrar por Proveedor (Otros)</Form.Label>
                <Form.Select
                  value={selectedProveedorFilter}
                  onChange={handleProveedorFilterChange}
                >
                  <option value="">-- Todos los Otros Proveedores --</option>
                  {store.proveedoresLoading ? (
                    <option disabled>Cargando...</option>
                  ) : (
                    store.proveedores
                      .filter((p) => p.id !== idProveedorEnergia)
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nombre}
                        </option>
                      ))
                  )}
                </Form.Select>
              </Form.Group>
            </Col>
          )}
          <Col md={activeTab === "otros" ? 6 : 12}>
            <Form.Group controlId="statusFilterComun">
              <Form.Label>Filtrar por Estatus</Form.Label>
              <Form.Select
                value={selectedStatusFilter}
                onChange={handleStatusFilterChange}
              >
                <option value="">-- Todos los Estatus --</option>
                {ESTATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        <Tab.Content>
          <Tab.Pane eventKey="energia">
            {idProveedorEnergia === null && !store.proveedoresLoading && (
              <Alert variant="warning">
                Proveedor "Energía" no encontrado o no definido.
              </Alert>
            )}
            {/* {idProveedorEnergia !== null && store.actividadesLoading && <div className="text-center"><Spinner animation="border" /> Cargando...</div>}
                        {idProveedorEnergia !== null && !store.actividadesLoading && store.actividadesError && <Alert variant="danger">{store.actividadesError}</Alert>} */}
            {idProveedorEnergia !== null &&
              renderDiagnosticosEnergiaTabla(diagnosticosAgrupadosPorAire)}
          </Tab.Pane>
          <Tab.Pane eventKey="otros">
            {renderActividadesTabla(getFilteredActividades())}
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>

      {/* Modal (sin cambios en su estructura interna, solo cómo se pre-llena el proveedor_id) */}
      <Modal
        show={showModal}
        onHide={handleCloseModal}
        size="lg"
        backdrop="static"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {isEditing ? "Editar Actividad" : "Agregar Nueva Actividad"}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {store.actividadesError && (
              <Alert variant="danger">{store.actividadesError}</Alert>
            )}
            <Form.Group className="mb-3">
              <Form.Label>Proveedor *</Form.Label>
              <Form.Select
                name="proveedor_id"
                value={formData.proveedor_id}
                onChange={handleInputChange}
                required={activeTab === "otros"} // Requerido solo si estamos en "Otros" y no se pre-llena
                disabled={
                  isEditing || (activeTab === "energia" && idProveedorEnergia)
                } // Deshabilitado si es Energía o editando
              >
                <option value="">Seleccione un proveedor...</option>
                {store.proveedores
                  .filter((p) =>
                    activeTab === "otros"
                      ? p.id !== idProveedorEnergia
                      : p.id === idProveedorEnergia
                  ) // Filtrar según la pestaña
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre}
                    </option>
                  ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Descripción *</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="descripcion"
                value={formData.descripcion}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Fecha de Ocurrencia *</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    name="fecha_ocurrencia"
                    value={formData.fecha_ocurrencia}
                    onChange={handleDateChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Fecha de Reporte</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    name="fecha_reporte"
                    value={formData.fecha_reporte}
                    onChange={handleDateChange}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Número de Reporte (Opcional)</Form.Label>
                  <Form.Control
                    type="text"
                    name="numero_reporte"
                    value={formData.numero_reporte}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Estatus *</Form.Label>
                  <Form.Select
                    name="estatus"
                    value={formData.estatus}
                    onChange={handleInputChange}
                    required
                  >
                    {ESTATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={handleCloseModal}
              disabled={store.actividadesLoading}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={store.actividadesLoading}
            >
              {store.actividadesLoading ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  Guardando...
                </>
              ) : isEditing ? (
                "Guardar Cambios"
              ) : (
                "Agregar Actividad"
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default ActividadesProveedor; // Exportar como default