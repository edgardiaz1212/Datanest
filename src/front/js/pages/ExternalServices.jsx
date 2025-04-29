// src/front/js/pages/ExternalServices.jsx
import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Ticket, Archive, FileText, LayoutGrid, ShieldCheck, ExternalLink, Network, Globe } from 'lucide-react';
import { Link } from 'react-router-dom'; // <--- Asegúrate que esté importado

const ExternalServices = () => {
  const services = [
    // ... (OTRS, Inventario, OpenDCIM - sin cambios) ...
    {
      icon: Ticket,
      title: "OTRS (Sistema de Tickets)",
      description: "Plataforma para la gestión de solicitudes, incidencias y seguimiento de casos relacionados con los servicios.",
      urlInternal: process.env.REACT_APP_URL_OTRS_INTERNAL,
      urlExternal: process.env.REACT_APP_URL_OTRS_EXTERNAL,
    },
    {
      icon: Archive,
      title: "Sistema de Inventarios",
      description: "Consulta y gestiona el inventario detallado de equipos, componentes y activos dentro del centro de datos.",
      urlInternal: process.env.REACT_APP_URL_INVENTORY_INTERNAL,
      urlExternal: process.env.REACT_APP_URL_INVENTORY_EXTERNAL,
    },
    {
      icon: LayoutGrid,
      title: "OpenDCIM (Gestión DCIM)",
      description: "Plataforma para la gestión de infraestructura del centro de datos (DCIM), incluyendo racks, activos y conexiones.",
      urlInternal: process.env.REACT_APP_URL_OPENDCIM_INTERNAL,
      urlExternal: process.env.REACT_APP_URL_OPENDCIM_EXTERNAL,
    },
    // --- Modificado ---
    {
      icon: FileText,
      title: "Procedimientos y Planillas",
      description: "Accede al repositorio centralizado de documentación, guías operativas, normativas y formularios estándar.",
      path: "/documentos", // <--- Nueva propiedad para ruta interna
      // Ya no necesita url ni buttonText aquí
    },
    // --- Fin Modificado ---
    {
      icon: ShieldCheck,
      title: "Gestión de Acceso (Seguridad)",
      description: "Plataforma para la administración y control de acceso físico del personal de seguridad a las instalaciones.",
      url: process.env.REACT_APP_URL_ACCESS_SECURITY, // URL única
      buttonText: "Acceder al Sistema" // Mantenemos buttonText para este caso
    }
  ];

  return (
    <Container fluid className="py-5 px-md-5 bg-light">
      {/* ... (Título y descripción sin cambios) ... */}
       <Row className="justify-content-center mb-5">
        <Col md={10} lg={8} className="text-center">
          <ExternalLink size={50} className="text-primary mb-3" />
          <h1 className="fw-bold display-5 mb-3">Herramientas y Recursos Externos</h1>
          <p className="lead text-secondary">
            Accede rápidamente a las plataformas y sistemas complementarios utilizados
            para la gestión integral del centro de datos y servicios asociados.
          </p>
        </Col>
      </Row>

      <Row xs={1} md={2} lg={3} className="g-4 justify-content-center">
        {services.map((service, index) => (
          <Col key={index} className="d-flex align-items-stretch">
            <Card className="h-100 shadow-sm border-0 service-card">
              <Card.Body className="text-center d-flex flex-column p-4">
                {/* ... (Icono, Título, Descripción sin cambios) ... */}
                 <div className="mb-3 text-primary">
                  <service.icon size={45} strokeWidth={1.5} />
                </div>
                <Card.Title as="h3" className="h5 fw-bold mb-3">{service.title}</Card.Title>
                <Card.Text className="text-secondary small mb-4 flex-grow-1">
                  {service.description}
                </Card.Text>

                {/* --- Contenedor para los botones (Modificado) --- */}
                <div className="mt-auto d-grid gap-2 d-sm-flex justify-content-sm-center">
                  {/* Botones Interno/Externo (sin cambios) */}
                  {service.urlInternal && (
                    <Button variant="outline-primary" size="sm" href={service.urlInternal} target="_blank" rel="noopener noreferrer" className="d-flex align-items-center justify-content-center">
                      <Network size={16} className="me-1" /> Interno
                    </Button>
                  )}
                  {service.urlExternal && (
                     <Button variant="outline-secondary" size="sm" href={service.urlExternal} target="_blank" rel="noopener noreferrer" className="d-flex align-items-center justify-content-center">
                       <Globe size={16} className="me-1" /> Corporativo
                     </Button>
                  )}

                  {/* --- Botón para URL ÚNICA EXTERNA --- */}
                  {service.url && !service.urlInternal && !service.urlExternal && (
                    <Button variant="outline-primary" size="sm" href={service.url} target="_blank" rel="noopener noreferrer">
                      {service.buttonText || 'Acceder'} {/* Usa buttonText o un default */}
                    </Button>
                  )}

                  {/* --- Botón para RUTA INTERNA --- */}
                  {service.path && (
                    <Link to={service.path} className="btn btn-outline-primary btn-sm"> {/* Usa Link con clases de botón */}
                       {/* Puedes añadir un icono si quieres */}
                       Ver Documentos {/* Texto fijo o podrías añadirlo al objeto service */}
                    </Link>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default ExternalServices;
