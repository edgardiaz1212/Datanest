import React, { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import RackDetails from "../component/RackDetails.jsx";
import EquipmentDetails from "../component/EquipmentDetails.jsx";
import { Context } from "../store/appContext.js";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function EditData() {
  const location = useLocation();
  const navigate = useNavigate();
  const { entry } = location.state;
  const [formData, setFormData] = useState(entry);
  const [emptyFields, setEmptyFields] = useState({});
  const { actions, store } = useContext(Context);

  useEffect(() => {
    if (!entry) {
      navigate(`/register-data/${store.currentUser.user_id}`);
    }
  }, [entry, navigate]);

  const handleFieldChange = (event) => {
    const { name, type, checked, value } = event.target;

    // Manejar los campos de entrada de texto como cadenas
    if (type !== "checkbox" && type !== "radio") {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: value,
      }));
    } else {
      // Manejar los campos de tipo checkbox y radio como booleanos
      const newValue =
        type === "checkbox" ? checked : value === "true" ? true : false;

      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: newValue,
      }));
    }
  };

  
  const handleSave = async () => {
    // Verificar si los campos obligatorios están vacíos
    if (!formData.requestType || !formData.brand || !formData.model || !formData.serial || !formData.componentType) {
      toast.error("Por favor, complete los campos obligatorios.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      return; // Detener la función si los campos están vacíos
    }

    try {
      // Editar la descripción primero
      await actions.editDescription(entry.description.id, formData);

      // Editar los detalles del rack o del equipo según el tipo de componente
      if (formData.componentType === "Rack") {
        await actions.editRack(entry.id, formData);
      } else {
        await actions.editEquipment(entry.id, formData);
      }

      // Mostrar un mensaje de éxito
      toast.success("Edición Completa");

      // Navegar a la página de registro de datos con el user ID
      setTimeout(() => {
        navigate(`/register-data/${store.currentUser.user_id}`);
      }, 1000);
    } catch (error) {
      console.error("Error saving changes:", error);
      toast.error("Ocurrió un error al guardar los cambios.");
    }
  };
  const {
    requestType,
    brand,
    model,
    serial,
    componentType,
    partNumber,
    observations,
    five_years_prevition,
  } = formData;

  const isInstallationOrRelocation =
    requestType === "Instalación" || requestType === "Mudanza";

  return (
    <>
      <ToastContainer
        theme="dark"
        position="top-center"
        pauseOnFocusLoss={false}
        autoClose={3000}
        hideProgressBar
      />
      <div className="formulario container text-center mt-5">
        <h1>Datos para editar</h1>
        <form>
          <div className="col-lg-6 col-sm-8 mx-auto ">
            <div
              className={`m-auto ${
                emptyFields.requestType ? "is-invalid" : ""
              }`}
            >
              <label htmlFor="brand" className="form-label">
                Tipo de Solicitud*
              </label>
              <select
                className="form-control"
                name="requestType"
                value={requestType}
                onChange={handleFieldChange}
                required
              >
                <option value="">Seleccionar</option>
                <option value="Instalación">Instalación</option>
                <option value="Retiro">Retiro</option>
                <option value="Desincorporación">Desincorporación</option>
                <option value="Mudanza">Mudanza</option>
              </select>
            </div>
            <div className={`m-auto ${emptyFields.brand ? "is-invalid" : ""}`}>
              <label htmlFor="brand" className="form-label">
                Marca*
              </label>
              <input
                type="text"
                className={`form-control ${
                  emptyFields.brand ? "is-invalid" : ""
                }`}
                id="brand"
                name="brand"
                placeholder="Introduzca la marca"
                value={brand}
                onChange={handleFieldChange}
              />
            </div>

            <div className="m-auto">
              <label htmlFor="model" className="form-label">
                Modelo*:
              </label>
              <input
                type="text"
                className={`form-control ${
                  emptyFields.model ? "is-invalid" : ""
                }`}
                id="model"
                name="model"
                value={model}
                placeholder="Introduzca el modelo"
                onChange={handleFieldChange}
              />
            </div>

            <div className="m-auto">
              <label htmlFor="serial" className="form-label">
                Serial*:
              </label>
              <input
                type="text"
                className={`form-control ${
                  emptyFields.serial ? "is-invalid" : ""
                }`}
                id="serial"
                name="serial"
                value={serial}
                placeholder="Introduzca el serial"
                onChange={handleFieldChange}
              />
            </div>
            <div className="m-auto">
              <label htmlFor="numberpart" className="form-label">
                Numero de Parte:
              </label>
              <input
                type="text"
                className="form-control"
                id="partNumber"
                name="partNumber"
                value={partNumber}
                placeholder="Introduzca el número de parte"
                onChange={handleFieldChange}
              />
            </div>
            <div className="m-auto">
              <label htmlFor="componentType" className="form-label">
                Tipo de componente*:
              </label>
              <select
                className="form-control"
                name="componentType"
                value={componentType}
                onChange={handleFieldChange}
                required
              >
                <option value="">Seleccionar tipo de componente</option>
                <option value="Rack">Rack</option>
                <option value="Switch">Switch</option>
                <option value="Servidor">Servidor</option>
                <option value="Router">Router</option>
                <option value="Firewall">Firewall</option>
                <option value="Monitor">Monitor</option>
                <option value="Caja Almacenamiento">Caja Almacenamiento</option>
              </select>
            </div>
          </div>

          {componentType === "Rack" && (
            <RackDetails
              requestType={requestType}
              brand={brand}
              model={model}
              serial={serial}
              partNumber={partNumber}
              handleFieldChange={handleFieldChange}
              isInstallationOrRelocation={isInstallationOrRelocation}
              data={formData}
            />
          )}
          {componentType !== "Rack" && (
            <EquipmentDetails
              requestType={requestType}
              brand={brand}
              model={model}
              serial={serial}
              partNumber={partNumber}
              handleFieldChange={handleFieldChange}
              isInstallationOrRelocation={isInstallationOrRelocation}
              data={formData}
            />
          )}
          <div className="container ps-5 pe-5">
            <div className="input-group mb-3 mt-3">
              <span className="input-group-text">Observaciones</span>
              <textarea
                className="form-control"
                aria-label="With textarea"
                id="observations"
                name="observations"
                value={observations}
                onChange={handleFieldChange}
              ></textarea>
            </div>
            {isInstallationOrRelocation && (
              <div className="input-group mb-5">
                <span className="input-group-text">Previsión de 5 años</span>
                <textarea
                  className="form-control"
                  aria-label="With textarea"
                  id="five_years_prevition"
                  name="five_years_prevition"
                  value={five_years_prevition}
                  onChange={handleFieldChange}
                ></textarea>
              </div>
            )}
          </div>
        </form>

        <button className="btn btn-success" onClick={handleSave}>
          Guardar Cambios
        </button>
        <button className="btn btn-secondary ms-2" onClick={() => navigate(-1)}>
          Volver Atrás
        </button>
      </div>
    </>
  );
}

export default EditData;
