import React from 'react';
import { Link } from 'react-router-dom'; // Asegúrate de que Link esté importado
import '../../styles/home.css';
import { Server, Database, Thermometer, Cable, Settings, Activity, Users, BarChart, Handshake } from 'lucide-react';
import heroBgImage from '../../img/racks1.jpeg';

function Home() {
   const heroStyle = {
          backgroundImage: `url(${heroBgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          minHeight: '500px',
              width: '100%',
          };
  
  return (
    <div className="min-vh-100 bg-light"> 
      {/* Hero Section */}
      <section className="hero py-5 py-md-7 text-center"
        // 2. Aplica la imagen como estilo en línea
        style={ heroStyle }
      >
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-8 col-lg-6">
              <div className="d-flex justify-content-center mb-4">
                <Server color="#0d6efd" size={64} />
              </div>
              <h1 className="display-4 fw-bold mb-3">Infraestructura de Centro de Datos Clientes Externos</h1>
              <p className="lead text-secondary mb-5 text-white">
                Garantizamos la confiabilidad, seguridad y eficiencia de su infraestructura tecnológica
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-5 bg-light">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-10 col-lg-8 text-center">
              <h2 className="fw-bold mb-3">Solicitud de Adecuación de Espacio</h2>
              <p className="lead text-secondary mb-4">
                ¿Necesitas instalar, retirar o mover equipamiento para un cliente en nuestro Centro de Datos? Accede al formulario de solicitud para iniciar el proceso.
              </p>
              <Link to="/forba7d" className="btn btn-primary btn-lg px-4">
                Ir al Formulario
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-5 bg-white"> {/* Esta se mantiene bg-white */}
        <div className="container">
          <h2 className="text-center fw-bold mb-5">Nuestras Actividades</h2>

          <div className="row g-4">
            <div className="col-md-4">
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <div className="text-primary mb-3">
                    <Cable size={36} />
                  </div>
                  <h3 className="card-title h5 fw-bold">Tendido de Cableado</h3>
                  <p className="card-text text-secondary">
                    Instalación profesional de cableado estructurado con los más altos estándares de calidad,
                    siguiendo las normativas del sector para garantizar conectividad óptima.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <div className="text-primary mb-3">
                    <Settings size={36} />
                  </div>
                  <h3 className="card-title h5 fw-bold">Mantenimiento de Equipos</h3>
                  <p className="card-text text-secondary">
                    Seguimiento y supervision de mantenimiento preventivo y correctivo de equipos electrógenos,
                    asegurando su funcionamiento continuo y prolongando su vida útil.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <div className="text-primary mb-3">
                    <Thermometer size={36} />
                  </div>
                  <h3 className="card-title h5 fw-bold">Control de Temperatura</h3>
                  <p className="card-text text-secondary">
                    Monitoreo constante de temperaturas en el centro de datos para mantener
                    condiciones óptimas de funcionamiento y prevenir sobrecalentamientos.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="py-5 bg-light"> {/* Puedes alternar bg-light y bg-white */}
        <div className="container">
          <div className="row align-items-center"> {/* align-items-center para centrar verticalmente si las columnas tienen alturas distintas */}
            <div className="col-lg-6 text-center text-lg-start mb-4 mb-lg-0"> {/* Centrado en móvil, izquierda en large */}
               {/* Puedes usar un icono representativo */}
               <Handshake size={80} className="text-primary mb-3" />
               {/* O <Briefcase size={80} className="text-primary mb-3" /> */}
               {/* O <Users size={80} className="text-primary mb-3" /> */}
            </div>
            <div className="col-lg-6">
              <h2 className="fw-bold mb-3">Trabajo en Equipo: Interno y Externo</h2>
              <p className="text-secondary mb-3">
                En Infraestructura DCCE, creemos en la fuerza de la colaboración. Trabajamos de la mano
                tanto con las diversas unidades internas de la corporación como con nuestros valiosos
                clientes externos.
              </p>
              <p className="text-secondary">
                Esta sinergia nos permite entender a fondo cada necesidad y ofrecer soluciones integrales
                y eficientes, asegurando que cada proyecto en nuestro centro de datos sea un éxito compartido.
                ¡Juntos construimos una infraestructura sólida y confiable!
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* Why Us Section */}
      {/*<section className="py-5 bg-white">   
        <div className="container">
          <h2 className="text-center fw-bold mb-5">¿Por qué elegirnos?</h2>

          <div className="row g-4">
            <div className="col-md-6">
              <div className="d-flex">
                <div className="bg-primary p-3 rounded-circle me-3 d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
                  <Activity color="white" size={24} />
                </div>
                <div>
                  <h3 className="h5 fw-bold mb-2">Monitoreo 24/7</h3>
                  <p className="text-secondary">
                    Vigilancia constante de todos los sistemas críticos para detectar y
                    solucionar problemas antes de que afecten las operaciones.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="d-flex">
                <div className="bg-primary p-3 rounded-circle me-3 d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
                  <Database color="white" size={24} />
                </div>
                <div>
                  <h3 className="h5 fw-bold mb-2">Alta Disponibilidad</h3>
                  <p className="text-secondary">
                    Infraestructura diseñada para garantizar operaciones continuas con
                    redundancia en todos los sistemas críticos.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="d-flex">
                <div className="bg-primary p-3 rounded-circle me-3 d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
                  <Users color="white" size={24} />
                </div>
                <div>
                  <h3 className="h5 fw-bold mb-2">Personal Especializado</h3>
                  <p className="text-secondary">
                    Equipo de técnicos certificados con amplia experiencia en gestión
                    de infraestructuras de centros de datos.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="d-flex">
                <div className="bg-primary p-3 rounded-circle me-3 d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
                  <BarChart color="white" size={24} />
                </div>
                <div>
                  <h3 className="h5 fw-bold mb-2">Tecnología de Vanguardia</h3>
                  <p className="text-secondary">
                    Implementamos las últimas soluciones tecnológicas para optimizar el
                    rendimiento y la eficiencia energética.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>*/}

      {/* <section className="py-5 bg-white">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-8 text-center">
              <h2 className="fw-bold mb-3">¿Necesitas nuestros servicios?</h2>
              <p className="lead text-secondary mb-5">
                Contáctanos para una evaluación personalizada de tus necesidades de infraestructura
              </p>
              <div className="d-grid gap-2 d-md-flex justify-content-md-center">
                <button className="btn btn-primary btn-lg px-4 me-md-2">
                  Contactar Ahora
                </button>
                
              </div>
            </div>
          </div>
        </div>
      </section> */}
    </div>
  )
}

export default Home;
