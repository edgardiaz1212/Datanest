import React, { useEffect, useContext } from 'react';
import { Context } from '../store/appContext';
import { Container, Card, Alert, Spinner, Table, Badge } from 'react-bootstrap';
import { FiAlertTriangle, FiPower, FiThermometer, FiDroplet } from 'react-icons/fi';
import { format } from 'date-fns';
import { es } from 'date-fns/locale'; // For Spanish date formatting

const AlertasActivas = () => {
    const { store, actions } = useContext(Context);
    const { detailedAlertsList, detailedAlertsLoading, detailedAlertsError } = store;

    useEffect(() => {
        actions.fetchDetailedAlerts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); 

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: es });
        } catch (e) {
            console.error("Error formatting date:", dateString, e);
            return "Fecha inválida";
        }
    };

    const getAlertVariant = (tipoAlerta) => {
        if (tipoAlerta.includes("Operatividad")) return "danger";
        if (tipoAlerta.includes("Alta") || tipoAlerta.includes("Baja")) return "warning";
        return "secondary";
    };

    const getAlertIcon = (tipoAlerta) => {
        if (tipoAlerta.includes("Operatividad")) return <FiPower className="me-1" />;
        if (tipoAlerta.includes("Temperatura")) return <FiThermometer className="me-1" />;
        if (tipoAlerta.includes("Humedad")) return <FiDroplet className="me-1" />;
        return <FiAlertTriangle className="me-1" />;
    };

    if (detailedAlertsLoading) {
        return (
            <Container className="mt-4 text-center p-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3">Cargando Alertas Activas...</p>
            </Container>
        );
    }

    if (detailedAlertsError) {
        return (
            <Container className="mt-4">
                <h1 className="mb-4"> <FiAlertTriangle className="me-2"/> Alertas Activas</h1>
                <Alert variant="danger" dismissible onClose={actions.clearDetailedAlertsError}>
                    {detailedAlertsError}
                </Alert>
            </Container>
        );
    }

    const alertasOperatividad = detailedAlertsList.filter(alerta => alerta.alerta_tipo === "Operatividad");
    const alertasAmbientales = detailedAlertsList.filter(alerta => alerta.alerta_tipo !== "Operatividad");

    return (
        <Container className="mt-4">
            <h1 className="mb-4"><FiAlertTriangle className="me-2"/>Alertas Activas</h1>

            {/* Mostrar mensaje si no hay alertas y no está cargando */}
            {detailedAlertsList.length === 0 && !detailedAlertsLoading && !detailedAlertsError && (
                 <Alert variant="success">
                    <FiAlertTriangle className="me-2" /> 
                    No hay alertas activas en este momento. ¡Todo en orden!
                 </Alert>
            )}

            {alertasOperatividad.length > 0 && (
                <Card className="mb-4 shadow-sm">
                    <Card.Header className="bg-danger text-white">
                        <h5 className="mb-0"><FiPower className="me-2" />Aires No Operativos ({alertasOperatividad.length})</h5>
                    </Card.Header>
                    <Card.Body>
                        <div className="table-responsive">
                            <Table striped bordered hover responsive size="sm" className="mb-0">
                                <thead>
                                    <tr>
                                        <th>Aire</th>
                                        <th>Ubicación</th>
                                        <th>Componente Falla</th>
                                        <th>Mensaje</th>
                                        <th>Diagnóstico</th>
                                        <th>Notas Diagnóstico</th>
                                        <th>Detectado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {alertasOperatividad.map((alerta, index) => (
                                        <tr key={`op-${alerta.aire_id}-${index}-${alerta.mensaje}`}> {/* Added alerta.mensaje to key for more uniqueness */}
                                            <td>{alerta.aire_nombre || 'N/A'}</td>
                                            <td>{alerta.aire_ubicacion || 'N/A'}</td>
                                            <td>{alerta.componente || 'N/A'}</td>
                                            <td>
                                                <Badge bg={getAlertVariant(alerta.alerta_tipo)} pill className="me-2">
                                                    {getAlertIcon(alerta.alerta_tipo)}
                                                    {alerta.alerta_tipo}
                                                </Badge>
                                                {alerta.mensaje}
                                                {/* {alerta.razon && <><br/><small className="text-muted">Razón: {alerta.razon}</small></>} */}
                                            </td>
                                            <td>
                                                {alerta.diagnostico_nombre || <span className="text-muted">N/E</span>}
                                            </td>
                                            <td>
                                                {alerta.diagnostico_notas || <span className="text-muted">-</span>}
                                            </td>
                                            <td>{formatDate(alerta.fecha_lectura)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    </Card.Body>
                </Card>
            )}

            {alertasAmbientales.length > 0 && (
                <Card className="mb-4 shadow-sm">
                    <Card.Header className="bg-warning text-dark">
                        <h5 className="mb-0"><FiThermometer className="me-2" />Alertas Ambientales ({alertasAmbientales.length})</h5> {/* Added key to Card */}
                    </Card.Header>
                    <Card.Body>
                        <div className="table-responsive">
                            <Table striped bordered hover responsive size="sm" className="mb-0">
                                <thead>
                                    <tr>
                                        <th>Aire</th>
                                        <th>Ubicación</th>
                                        <th>Tipo Alerta</th>
                                        <th>Mensaje</th>
                                        <th>Valor Actual</th>
                                        <th>Límite Violado</th>
                                        <th>Fecha Lectura</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {alertasAmbientales.map((alerta, index) => (
                                        <tr key={`amb-${alerta.aire_id}-${index}-${alerta.alerta_tipo}-${alerta.mensaje}`}> {/* Added alerta.mensaje to key */}
                                            <td>{alerta.aire_nombre || 'N/A'}</td> {/* Added key to Card */}
                                            <td>{alerta.aire_ubicacion || 'N/A'}</td>
                                            <td><Badge bg={getAlertVariant(alerta.alerta_tipo)} pill>{getAlertIcon(alerta.alerta_tipo)}{alerta.alerta_tipo}</Badge></td>
                                            <td>{alerta.mensaje}</td>
                                            <td>{alerta.valor_actual}</td>
                                            <td>{alerta.limite_violado}</td>
                                            <td>{formatDate(alerta.fecha_lectura)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    </Card.Body>
                </Card>
            )}
        </Container>
    );
};

export default AlertasActivas;