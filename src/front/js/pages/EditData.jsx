import React from 'react'

function EditData() {
  return (
    <>
 <h1>
        Datos para {requestType} del {componentType} modelo {model} con serial: {serial}
      </h1>

      {componentType === "Rack" && (
        <RackDetails
          requestType={requestType}
          brand={brand}
          model={model}
          serial={serial}
          partNumber={partNumber}
          handleFieldChange={handleFieldChange}
          isInstallationOrRelocation={isInstallationOrRelocation}
          data={data}
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
          data={data}
        />
      )}

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
    </>
  )
}

export default EditData