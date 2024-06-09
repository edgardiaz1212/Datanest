import React, { useState } from "react";
import RackDetails from "../component/RackDetails.jsx";
import EquipmentDetails from "../component/EquipmentDetails.jsx";
import { useLocation } from "react-router-dom";

function CompleteData() {
  const location = useLocation();
  const { entry } = location.state || {};
  const { componentType, requestType, brand, model, serial, partNumber } =
    entry || {};
  const [data, setData] = useState({
    observations: "",
    five_years_prevition: "",
  });

  const isInstallationOrRelocation =
    requestType === "Instalación" || requestType === "Mudanza";

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  return (
    <>
      <h1>
        Datos para {requestType} del {componentType} modelo {model} con serial :{" "}
        {serial}
      </h1>

      {componentType === "Rack" && (
        <RackDetails
          requestType={requestType}
          brand={brand}
          model={model}
          serial={serial}
          partNumber={partNumber}
        />
      )}
      {componentType !== "Rack" && (
        <EquipmentDetails
          requestType={requestType}
          brand={brand}
          model={model}
          serial={serial}
          partNumber={partNumber}
        />
      )}

      {/* observaciones */}
      <div className="input-group mb-3 mt-3">
        <span className="input-group-text">Observaciones</span>
        <textarea
          className="form-control"
          aria-label="With textarea"
          id="observations"
          name="observations"
          value={data.observations}
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
            value={data.five_years_prevition}
            onChange={handleFieldChange}
          ></textarea>
        </div>
      )}

      <button>Guardar</button>
    </>
  );
}

export default CompleteData;
