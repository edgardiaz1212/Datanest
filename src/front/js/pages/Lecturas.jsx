// src/front/js/pages/Lecturas.jsx
import React, { useState, useEffect, useCallback, useContext, useMemo } from 'react';
import { Card, Button, Alert, Spinner, Pagination, Form, Row, Col } from 'react-bootstrap';
import { FiPlus } from 'react-icons/fi';
import { Context } from '../store/appContext';
import LecturasFilter from '../component/Lecturas/LecturasFilter.jsx';
import LecturasTable from '../component/Lecturas/LecturasTable.jsx';
import LecturasAddModal from '../component/Lecturas/LecturasAddModal.jsx';
import LecturasExcelUploadModal from '../component/Lecturas/LecturasExcelUploadModal.jsx';

const PER_PAGE_OPTIONS = [10, 20, 50, 100];

const Lecturas = () => {
  const { store, actions } = useContext(Context);
  const {
    trackerUser: user,
    lecturas,
    aires,
    otrosEquiposList,
    umbrales,
    lecturasLoading: loading,
    lecturasError: error,
    lecturasPaginationInfo,
  } = store;
  const {
    fetchLecturas,
    addLectura,
    deleteLectura,
    clearLecturasError,
    setLecturasError,
    fetchAires: actionFetchAires, // Renombrar para evitar conflicto con la variable 'aires' del store
    fetchOtrosEquipos: actionFetchOtrosEquipos,
    fetchUmbrales: actionFetchUmbrales,
  } = actions;

  const [filtroDispositivo, setFiltroDispositivo] = useState({ id: null, tipo: null });
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showExcelModal, setShowExcelModal] = useState(false);
  const [formData, setFormData] = useState({
    dispositivo_key: '', // ej: "aire-1" o "otro_equipo-5"
    fecha: '',
    hora: '',
    temperatura: '',
    humedad: '',
  });

  const canDelete = user?.rol === 'admin' || user?.rol === 'supervisor';
  const canAdd = !!user;

  const dispositivosMedibles = useMemo(() => {
    const airesList = (Array.isArray(aires) ? aires : []).map(a => ({
      ...a,
      esAire: true,
      idOriginal: a.id,
      key: `aire-${a.id}`,
      tipoOriginal: a.tipo
    }));
    const termohigrometrosList = (Array.isArray(otrosEquiposList) ? otrosEquiposList : [])
      .filter(oe => oe.tipo === 'Termohigrometro')
      .map(t => ({
        ...t,
        esAire: false,
        idOriginal: t.id,
        key: `otro_equipo-${t.id}`,
        tipoOriginal: t.tipo
      }));
    return [...airesList, ...termohigrometrosList].sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [aires, otrosEquiposList]);

  useEffect(() => {
    if (aires.length === 0) {
      actionFetchAires();
    }
    if (otrosEquiposList.length === 0) {
      actionFetchOtrosEquipos();
    }
    if (umbrales.length === 0) {
      actionFetchUmbrales();
    }
  }, [actionFetchAires, actionFetchOtrosEquipos, actionFetchUmbrales, aires.length, otrosEquiposList.length, umbrales.length]);

  useEffect(() => {
    const filters = {};
    if (filtroDispositivo.id && filtroDispositivo.tipo) {
      filters.dispositivo_id = filtroDispositivo.id;
      filters.tipo_dispositivo = filtroDispositivo.tipo;
    }
    fetchLecturas(filters, currentPage, itemsPerPage);

    return () => {
      if (clearLecturasError) clearLecturasError();
    };
  }, [filtroDispositivo, currentPage, itemsPerPage, fetchLecturas, clearLecturasError]);

  const handleFiltrarPorDispositivo = useCallback((dispositivoKey) => {
    if (!dispositivoKey) {
      setFiltroDispositivo({ id: null, tipo: null });
    } else {
      const [tipo, idStr] = dispositivoKey.split('-');
      setFiltroDispositivo({ id: parseInt(idStr), tipo });
    }
    setCurrentPage(1);
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newState = { ...prev, [name]: value };
      if (name === 'dispositivo_key') {
        const selectedDisp = dispositivosMedibles.find(d => d.key === value);
        if (selectedDisp && selectedDisp.esAire && selectedDisp.tipoOriginal === 'Confort') {
          newState.humedad = '';
        }
      }
      return newState;
    });
  }, [dispositivosMedibles]);

  const handleAdd = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toTimeString().slice(0, 5);
    setFormData({
      dispositivo_key: '',
      fecha: today,
      hora: now,
      temperatura: '',
      humedad: ''
    });
    if (clearLecturasError) clearLecturasError();
    setShowModal(true);
  }, [clearLecturasError]);

  const handleDelete = useCallback(async (id) => {
    if (window.confirm('¿Está seguro de eliminar esta lectura?')) {
      if (clearLecturasError) clearLecturasError();
      const success = await deleteLectura(id);
      if (success) {
        const currentTableFilters = {};
        if (filtroDispositivo.id && filtroDispositivo.tipo) {
          currentTableFilters.dispositivo_id = filtroDispositivo.id;
          currentTableFilters.tipo_dispositivo = filtroDispositivo.tipo;
        }
        let pageToFetch = currentPage;
        if (filtroDispositivo.id && lecturas.length === 1 && currentPage > 1) {
          pageToFetch = currentPage - 1;
          setCurrentPage(pageToFetch); // Actualizar el estado de la página actual
        }
        fetchLecturas(currentTableFilters, pageToFetch, itemsPerPage);
      } else if (!store.lecturasError && setLecturasError) {
        setLecturasError("Error al eliminar la lectura.");
      }
    }
  }, [deleteLectura, clearLecturasError, store.lecturasError, filtroDispositivo, currentPage, itemsPerPage, fetchLecturas, lecturas.length, setLecturasError]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (clearLecturasError) clearLecturasError();
    setIsSubmitting(true);

    const selectedDispositivo = dispositivosMedibles.find(d => d.key === formData.dispositivo_key);
    if (!selectedDispositivo) {
      if (setLecturasError) setLecturasError("Por favor, seleccione un dispositivo.");
      setIsSubmitting(false);
      return;
    }

    const esAireConfort = selectedDispositivo.esAire && selectedDispositivo.tipoOriginal === 'Confort';
    const esTermohigrometro = !selectedDispositivo.esAire;

    try {
      if (!formData.dispositivo_key || !formData.fecha || !formData.hora || formData.temperatura === '') {
        throw new Error("Todos los campos (Dispositivo, Fecha, Hora, Temp) son requeridos.");
      }
      if ((esTermohigrometro || (selectedDispositivo.esAire && !esAireConfort)) && (formData.humedad === '' || formData.humedad === null || formData.humedad === undefined)) {
        throw new Error("Humedad es requerida para este tipo de dispositivo.");
      }

      const temperaturaNum = parseFloat(formData.temperatura);
      if (isNaN(temperaturaNum)) {
        throw new Error("Temperatura debe ser un número válido.");
      }

      const humedadRequerida = esTermohigrometro || (selectedDispositivo.esAire && !esAireConfort);
      const humedadNum = humedadRequerida && (formData.humedad !== '' && formData.humedad !== null && formData.humedad !== undefined)
        ? parseFloat(formData.humedad)
        : null;

      if (humedadRequerida && (formData.humedad !== '' && formData.humedad !== null && formData.humedad !== undefined) && isNaN(humedadNum)) {
        throw new Error("Humedad debe ser un número válido.");
      }

      const [tipoDispositivo, idStr] = formData.dispositivo_key.split('-');
      const dispositivoIdNum = parseInt(idStr, 10);
      if (isNaN(dispositivoIdNum)) {
        throw new Error("Selección de Dispositivo inválida.");
      }

      const timeWithSeconds = formData.hora.includes(':') ? `${formData.hora}:00` : '00:00:00';
      const fechaHoraString = `${formData.fecha}T${timeWithSeconds}`;

      const payload = {
        fecha_hora: fechaHoraString,
        temperatura: temperaturaNum,
        humedad: esAireConfort ? null : humedadNum
      };

      const success = await addLectura(dispositivoIdNum, payload, tipoDispositivo);

      if (success) {
        setShowModal(false);
        const currentTableFilters = {};
        if (filtroDispositivo.id && filtroDispositivo.tipo) {
          currentTableFilters.dispositivo_id = filtroDispositivo.id;
          currentTableFilters.tipo_dispositivo = filtroDispositivo.tipo;
        }
        fetchLecturas(currentTableFilters, currentPage, itemsPerPage);
      }
    } catch (err) {
      console.error('Error submitting lectura:', err);
      if (setLecturasError) {
        setLecturasError(err.message || 'Error al guardar la lectura.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, addLectura, clearLecturasError, setLecturasError, dispositivosMedibles, filtroDispositivo, currentPage, itemsPerPage, fetchLecturas]);

  const formatearFecha = useCallback((fechaStr) => {
    if (!fechaStr) return 'N/A';
    try {
      const fecha = new Date(fechaStr);
      if (isNaN(fecha.getTime())) return 'Fecha inválida';
      return fecha.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch (e) {
      console.error("Error formatting date:", fechaStr, e);
      return 'Error fecha';
    }
  }, []);

  const formatearHora = useCallback((fechaStr) => {
    if (!fechaStr) return 'N/A';
    try {
      const fecha = new Date(fechaStr);
      if (isNaN(fecha.getTime())) return 'Hora inválida';
      return fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false });
    } catch (e) {
      console.error("Error formatting time:", fechaStr, e);
      return 'Error hora';
    }
  }, []);

  const handlePageChange = (pageNumber) => {
    if (lecturasPaginationInfo && pageNumber >= 1 && pageNumber <= lecturasPaginationInfo.total_pages) {
      setCurrentPage(pageNumber);
    }
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(parseInt(e.target.value));
    setCurrentPage(1);
  };

  const pageNumbers = [];
  if (lecturasPaginationInfo && lecturasPaginationInfo.total_pages > 0) {
    const totalPages = lecturasPaginationInfo.total_pages;
    const currentPageNum = lecturasPaginationInfo.current_page;
    let startPage = Math.max(1, currentPageNum - 2);
    let endPage = Math.min(totalPages, currentPageNum + 2);

    if (currentPageNum <= 3) {
      endPage = Math.min(5, totalPages);
    }
    if (currentPageNum > totalPages - 3) {
      startPage = Math.max(1, totalPages - 4);
    }
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <h1>Lecturas de Sensores</h1>
        <div className="d-flex align-items-center flex-wrap gap-2">
          <LecturasFilter
            dispositivosMedibles={dispositivosMedibles}
            filtroDispositivoKey={filtroDispositivo.id ? `${filtroDispositivo.tipo}-${filtroDispositivo.id}` : null}
            onFilterChange={handleFiltrarPorDispositivo}
          />
          <Form.Group as={Col} md="auto" controlId="itemsPerPageSelect" className="mb-0">
            <div className="d-flex align-items-center">
              <Form.Label className="me-2 mb-0">Por Pág:</Form.Label>
              <Form.Select size="sm" value={itemsPerPage} onChange={handleItemsPerPageChange} style={{ width: 'auto' }}>
                {PER_PAGE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </Form.Select>
            </div>
          </Form.Group>
          {canAdd && (
            <>
              <Button variant="primary" onClick={handleAdd}>
                <FiPlus className="me-2" /> Agregar Lectura
              </Button>
              <Button variant="success" onClick={() => setShowExcelModal(true)} className="ms-2">
                Cargar desde Excel
              </Button>
            </>
          )}
        </div>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={clearLecturasError}>
          {error}
        </Alert>
      )}

      <Card className="dashboard-card">
        <Card.Body>
          {loading && <div className="text-center"><Spinner animation="border" /> <p>Cargando lecturas...</p></div>}
          {!loading && (
            <LecturasTable
              lecturas={lecturas}
              loading={loading}
              canDelete={canDelete}
              onDelete={handleDelete}
              onAdd={handleAdd} // Para el botón en estado vacío
              formatearFecha={formatearFecha}
              formatearHora={formatearHora}
              umbrales={umbrales}
            />
          )}
        </Card.Body>
        {lecturasPaginationInfo && lecturasPaginationInfo.total_items > 0 && lecturasPaginationInfo.total_pages > 1 && (
          <Card.Footer className="d-flex justify-content-between align-items-center">
            <span className="text-muted">
              Página {lecturasPaginationInfo.current_page} de {lecturasPaginationInfo.total_pages} (Total: {lecturasPaginationInfo.total_items} lecturas)
            </span>
            <Pagination className="mb-0">
              <Pagination.First
                onClick={() => handlePageChange(1)}
                disabled={lecturasPaginationInfo.current_page === 1}
              />
              <Pagination.Prev
                onClick={() => handlePageChange(lecturasPaginationInfo.current_page - 1)}
                disabled={!lecturasPaginationInfo.has_prev}
              />
              {pageNumbers[0] > 1 && <Pagination.Ellipsis disabled />}
              {pageNumbers.map(num => (
                <Pagination.Item
                  key={num}
                  active={num === lecturasPaginationInfo.current_page}
                  onClick={() => handlePageChange(num)}
                >
                  {num}
                </Pagination.Item>
              ))}
              {pageNumbers.length > 0 && pageNumbers[pageNumbers.length - 1] < lecturasPaginationInfo.total_pages && <Pagination.Ellipsis disabled />}
              <Pagination.Next
                onClick={() => handlePageChange(lecturasPaginationInfo.current_page + 1)}
                disabled={!lecturasPaginationInfo.has_next}
              />
              <Pagination.Last
                onClick={() => handlePageChange(lecturasPaginationInfo.total_pages)}
                disabled={lecturasPaginationInfo.current_page === lecturasPaginationInfo.total_pages}
              />
            </Pagination>
          </Card.Footer>
        )}
      </Card>

      <LecturasAddModal
        show={showModal}
        onHide={() => !isSubmitting && setShowModal(false)}
        dispositivosMedibles={dispositivosMedibles}
        formData={formData}
        onChange={handleChange}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
      <LecturasExcelUploadModal
        show={showExcelModal}
        onHide={() => setShowExcelModal(false)}
        onUploadComplete={() => {
          const currentTableFilters = {};
          if (filtroDispositivo.id && filtroDispositivo.tipo) {
            currentTableFilters.dispositivo_id = filtroDispositivo.id;
            currentTableFilters.tipo_dispositivo = filtroDispositivo.tipo;
          }
          fetchLecturas(currentTableFilters, currentPage, itemsPerPage);
        }}
      />
    </div>
  );
};

export default Lecturas;
