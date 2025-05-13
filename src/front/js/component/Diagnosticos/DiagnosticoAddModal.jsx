import React, { useState, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Modal, Button, Form, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { Context } from '../../store/appContext'; // Ajusta la ruta según tu estructura

// Opciones para los selects, deben coincidir con los Enums del backend
const parteACOptions = [
    { value: 'evaporadora', label: 'Evaporadora' },
    { value: 'condensadora', label: 'Condensadora' },
    { value: 'general', label: 'General' },
];

const tipoAireSugeridoOptions = [
    { value: 'confort', label: 'Confort' },
    { value: 'precision', label: 'Precisión' },
    { value: 'ambos', label: 'Ambos' },
];

const DiagnosticoAddModal = ({ show, onHide, onDiagnosticoAdded, defaultParteAC, defaultTipoAireSugerido }) => {
    const { actions } = useContext(Context);
    const [formData, setFormData] = useState({
        nombre: '',
        parte_ac: defaultParteAC || parteACOptions[0].value,
        tipo_aire_sugerido: defaultTipoAireSugerido || tipoAireSugeridoOptions[2].value,
        descripcion_ayuda: '',
        activo: true,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Reset form when modal is shown with new defaults
        if (show) {
            setFormData({
                nombre: '',
                parte_ac: defaultParteAC || parteACOptions[0].value,
                tipo_aire_sugerido: defaultTipoAireSugerido || tipoAireSugeridoOptions[2].value,
                descripcion_ayuda: '',
                activo: true,
            });
            setError(null); // Clear previous errors
        }
    }, [show, defaultParteAC, defaultTipoAireSugerido]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        if (!formData.nombre.trim()) {
            setError("El nombre del diagnóstico es requerido.");
            return;
        }
        setIsSubmitting(true);
        const success = await actions.addDiagnosticoComponente(formData);
        setIsSubmitting(false);
        if (success) {
            const newDiagnostico = { ...formData }; // Simulación, idealmente el backend devuelve el ID
            if (onDiagnosticoAdded) {
                // La acción addDiagnosticoComponente ya llama a fetchDiagnosticoComponentes,
                // por lo que la lista en el store se actualizará.
                // Aquí podríamos querer pasar el nombre o un objeto simulado del nuevo diagnóstico
                // para que el modal padre pueda intentar seleccionarlo.
                onDiagnosticoAdded(newDiagnostico);
            }
            onHide(); // Cierra este modal
        } else {
            // El error global del store.diagnosticoComponentesError se mostrará en GestionDiagnosticos
            // Aquí podemos mostrar un error local si es necesario o si la acción no establece uno global.
            setError(actions.getStore().diagnosticoComponentesError || "Error al agregar el diagnóstico.");
        }
    };

    return (
        <Modal show={show} onHide={() => !isSubmitting && onHide()} centered backdrop="static">
            <Modal.Header closeButton={!isSubmitting}>
                <Modal.Title>Agregar Nuevo Diagnóstico</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Form.Group className="mb-3">
                        <Form.Label>Nombre del Diagnóstico <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                            type="text" name="nombre" value={formData.nombre} onChange={handleChange}
                            required placeholder="Ej: Falla de Compresor" autoFocus disabled={isSubmitting}
                        />
                    </Form.Group>
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Parte del AC <span className="text-danger">*</span></Form.Label>
                                <Form.Select name="parte_ac" value={formData.parte_ac} onChange={handleChange} required disabled={isSubmitting}>
                                    {parteACOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Tipo de Aire Sugerido <span className="text-danger">*</span></Form.Label>
                                <Form.Select name="tipo_aire_sugerido" value={formData.tipo_aire_sugerido} onChange={handleChange} required disabled={isSubmitting}>
                                    {tipoAireSugeridoOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>
                    <Form.Group className="mb-3">
                        <Form.Label>Descripción / Ayuda (Opcional)</Form.Label>
                        <Form.Control
                            as="textarea" rows={2} name="descripcion_ayuda"
                            value={formData.descripcion_ayuda} onChange={handleChange}
                            placeholder="Ej: Indica que el compresor no arranca..." disabled={isSubmitting}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Check type="checkbox" label="Diagnóstico Activo" name="activo"
                            checked={formData.activo} onChange={handleChange} disabled={isSubmitting}
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onHide} disabled={isSubmitting}>Cancelar</Button>
                    <Button variant="primary" type="submit" disabled={isSubmitting}>
                        {isSubmitting ? <><Spinner size="sm" className="me-2" />Agregando...</> : 'Agregar Diagnóstico'}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

DiagnosticoAddModal.propTypes = {
    show: PropTypes.bool.isRequired,
    onHide: PropTypes.func.isRequired,
    onDiagnosticoAdded: PropTypes.func,
    defaultParteAC: PropTypes.oneOf(['evaporadora', 'condensadora', 'general']),
    defaultTipoAireSugerido: PropTypes.oneOf(['confort', 'precision', 'ambos']),
};

export default DiagnosticoAddModal;