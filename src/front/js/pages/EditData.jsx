import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import RackDetails from "../component/RackDetails.jsx";
import EquipmentDetails from "../component/EquipmentDetails.jsx";

function EditData() {
  const location = useLocation();
  const navigate = useNavigate();
  const { entry } = location.state;
  const [formData, setFormData] = useState(entry);
  const [emptyFields, setEmptyFields] = useState({});

  useEffect(() => {
    if (!entry) {
      navigate("/datatable");
    }
  }, [entry, navigate]);

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSave = async () => {}
  const { requestType, brand, model, serial, componentType, partNumber, observations, five_years_prevition } = formData;

  const isInstallationOrRelocation = requestType === "Instalación" || requestType === "Mudanza";

  return (
    <>
 <div className="container mt-5">
 <h1>
        Datos para edita
      </h1>
      <form>
      <div className="col-lg-6 col-sm-8 ">
      <div className={`m-auto ${emptyFields.requestType ? 'is-invalid' : ''}`}>
            <label htmlFor="brand" className="form-label">Tipo de Solicitud*</label>
            <select
                    className="form-control"
                    name="requestType"
                    value={requestType}
                    onChange={(e) => handleChange(index, e)}
                    required
                  >
                    <option value="">Seleccionar</option>
                    <option value="Instalación">Instalación</option>
                    <option value="Retiro">Retiro</option>
                    <option value="Desincorporación">Desincorporación</option>
                    <option value="Mudanza">Mudanza</option>
                  </select>
          </div>
      <div className={`m-auto ${emptyFields.brand ? 'is-invalid' : ''}`}>
            <label htmlFor="brand" className="form-label">Marca*</label>
            <input
              type="text"
              className={`form-control ${emptyFields.brand ? 'is-invalid' : ''}`}
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
              className={`form-control ${emptyFields.model ? 'is-invalid' : ''}`}
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
              className={`form-control ${emptyFields.serial ? 'is-invalid' : ''}`}
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
                    onChange={(e) => handleFieldChange(index, e)}
                    required
                  >
                    <option value="">Seleccionar tipo de componente</option>
                    <option value="Rack">Rack</option>
                    <option value="Switch">Switch</option>
                    <option value="Servidor">Servidor</option>
                    <option value="Router">Router</option>
                    <option value="Firewall">Firewall</option>
                    <option value="Monitor">Monitor</option>
                    <option value="Caja Almacenamiento">
                      Caja Almacenamiento
                    </option>
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
      </form>
    </div></>
  )
}

export default EditData