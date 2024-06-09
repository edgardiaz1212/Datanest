import React, { useState } from "react";

function RackDetails({ requestType }) {
  const [data, setData] = useState({
    has_cabinet: true,
    leased: false,
    total_cabinets: "",
    open_closed: false,
    security: false,
    type_security: "",
    has_extractors: false,
    extractors_ubication: "",
    modular: false,
    lateral_doors: false,
    lateral_ubication: "",
    rack_unit: "",
    rack_position: "",
    rack_ubication: "",
    has_accessory: false,
    accessory_description: "",
    rack_width: "",
    rack_length: "",
    rack_height: "",
    internal_pdu: "",
    input_connector: "",
    fases: "",
    output_connector: "",
    neutro: false,
  });

  const handleFieldChange = (event) => {
    const { name, value, type, checked } = event.target;
    if (type !== "checkbox" && type !== "radio") {
      setData((prevFormData) => ({
        ...prevFormData,
        [name]: value,
      }));
    } else {
      // Manejar los campos de tipo checkbox y radio como booleanos
      const newValue =
        type === "checkbox" ? checked : value === "true" ? true : false;

      setData((prevFormData) => ({
        ...prevFormData,
        [name]: newValue,
      }));
    }
  };

  const isInstallationOrRelocation =
    requestType === "Instalación" || requestType === "Mudanza";

  return (
    <>
      <div className="mb-3 ">
        <h2>Caracteristicas del Gabinete</h2>
      </div>
      <div className="row gy-5 justify-content-center">
        <div className="col-lg-3 col-sm-12 ">
          <p>Posee Gabinete ?</p>
          <div className="form-check">
            <input
              className="form-check-input"
              type="radio"
              name="has_cabinet"
              id="siGabinete"
              value={true}
              checked={data.has_cabinet === true}
              onChange={handleFieldChange}
            />
            <label className="form-check-label" htmlFor="siGabinete">
              Si
            </label>
          </div>
          <div className="form-check">
            <input
              className="form-check-input"
              type="radio"
              name="has_cabinet"
              id="noGabinete"
              value={false}
              checked={data.has_cabinet === false}
              onChange={handleFieldChange}
            />
            <label className="form-check-label" htmlFor="noGabinete">
              No
            </label>
          </div>
        </div>
        {data.has_cabinet === true && (
          <>
            <div className="col-lg-2 col-sm-12 ">
              <p>Propio o arrendado ?</p>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="leased"
                  id="noLeased"
                  value={false}
                  checked={data.leased === false}
                  onChange={handleFieldChange}
                />
                <label className="form-check-label" htmlFor="noLeased">
                  Propio
                </label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="leased"
                  id="yesleased"
                  value={true}
                  checked={data.leased === true}
                  onChange={handleFieldChange}
                />
                <label className="form-check-label" htmlFor="leased">
                  Arrendado
                </label>
              </div>
            </div>
            <div className=" col-lg-3 col-sm-12">
              <label htmlFor="total_cabinets" className="form-label">
                Numero Total de Gabinetes
              </label>
              <input
                type="text"
                className="form-control"
                id="total_cabinets"
                name="total_cabinets"
                value={data.total_cabinets}
                placeholder="Total gabinetes que requieren instalarse"
                onChange={handleFieldChange}
              />
            </div>
            <div className="col-lg-2 col-sm-12 ">
              <p>Rack abrierto o Cerrado ?</p>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="open_closed"
                  id="open"
                  value={true}
                  checked={data.open_closed === true}
                  onChange={handleFieldChange}
                />
                <label className="form-check-label" htmlFor="open">
                  Abierto
                </label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="open_closed"
                  id="close"
                  value={false}
                  checked={data.open_closed === false}
                  onChange={handleFieldChange}
                />
                <label className="form-check-label" htmlFor="close">
                  Cerrado
                </label>
              </div>
            </div>

            <div className="col-lg-3 col-sm-12">
              <p>Posee seguridad ?</p>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="security"
                  id="secured"
                  value={true}
                  checked={data.security === true}
                  onChange={handleFieldChange}
                />
                <label className="form-check-label" htmlFor="secured">
                  Si
                </label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="security"
                  id="nosecured"
                  value={false}
                  checked={data.security === false}
                  onChange={handleFieldChange}
                />
                <label className="form-check-label" htmlFor="nosecured">
                  No
                </label>
              </div>
            </div>
            <div className="col-lg-3 col-sm-12">
              <label htmlFor="type_security" className="form-label">
                Qué tipo de seguridad y Cuántos:
              </label>
              <input
                type="text"
                className="form-control"
                name="type_security"
                id="type_security"
                value={data.type_security}
                placeholder="Tipo de seguridad y cantidad"
                onChange={handleFieldChange}
                disabled={data.security === false}
              />
            </div>
            <div className="col-lg-2 col-sm-12">
              <p>Posee Extractores ?</p>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="has_extractors"
                  id="yesExtractor"
                  value={true}
                  checked={data.has_extractors === true}
                  onChange={handleFieldChange}
                />
                <label className="form-check-label" htmlFor="yesExtractor">
                  Si
                </label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="has_extractors"
                  id="noExtractor"
                  value={false}
                  checked={data.has_extractors === false}
                  onChange={handleFieldChange}
                />
                <label className="form-check-label" htmlFor="noExtractor">
                  No
                </label>
              </div>
            </div>

            <div className="col-lg-3 col-sm-12">
              <label htmlFor="extractors_ubication" className="form-label">
                Ubicación Extractores
              </label>
              <input
                type="text"
                className="form-control"
                name="extractors_ubication"
                id="extractors_ubication"
                value={data.extractors_ubication}
                placeholder="Ubicación de los extractores"
                onChange={handleFieldChange}
                disabled={data.has_extractors === false}
              />
            </div>

            <div className="col-lg-2 col-sm-12">
              <p>Es Modular ?</p>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="modular"
                  id="yesModular"
                  value={true}
                  checked={data.modular === true}
                  onChange={handleFieldChange}
                />
                <label className="form-check-label" htmlFor="yesModular">
                  Si
                </label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="modular"
                  id="noModular"
                  value={false}
                  checked={data.modular === false}
                  onChange={handleFieldChange}
                />
                <label className="form-check-label" htmlFor="noModular">
                  No
                </label>
              </div>
            </div>
            <div className="col-lg-3 col-sm-12">
              <p>Posee Puertas de servicio lateral: ?</p>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="lateral_doors"
                  value={true}
                  id="yesLateralDoors"
                  checked={data.lateral_doors === true}
                  onChange={handleFieldChange}
                />
                <label className="form-check-label" htmlFor="yesLateralDoors">
                  Si
                </label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="lateral_doors"
                  value={false}
                  id="noLateralDoors"
                  checked={data.lateral_doors === false}
                  onChange={handleFieldChange}
                />
                <label className="form-check-label" htmlFor="noLateralDoors">
                  No
                </label>
              </div>
            </div>

            <div className="col-lg-3 col-sm-12">
              <label htmlFor="lateral_ubication" className="form-label">
                Ubicación puertas de servicio
              </label>
              <input
                type="text"
                className="form-control"
                name="lateral_ubication"
                id="lateral_ubication"
                value={data.lateral_ubication}
                placeholder="Ubicación de las Puertas de Servicio"
                onChange={handleFieldChange}
                disabled={data.lateral_doors === false}
              />
            </div>

            <div className=" col-lg-3 col-sm-12">
              <label htmlFor="rack_unit" className="form-label">
                Total de Unidades de Rack
              </label>
              <input
                type="text"
                className="form-control"
                name="rack_unit"
                id="rack_unit"
                value={data.rack_unit}
                placeholder="Unidades de Rack del gabinete"
                onChange={handleFieldChange}
              />
            </div>
            <div className="col-lg-3 col-sm-12">
              <label htmlFor="rack_position" className="form-label">
                Posición del rack en la fila*
              </label>
              <input
                type="text"
                className="form-control"
                id="rack_position"
                name="rack_position"
                value={data.rack_position}
                placeholder="Posición del rack(ejem: 1,2,..."
                onChange={handleFieldChange}
              />
            </div>
            {!isInstallationOrRelocation && (
              <div className=" col-lg-2 col-sm-12">
                <label htmlFor="rack_position" className="form-label">
                  Ubicación en losa en el DC
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="rack_ubication"
                  name="rack_ubication"
                  value={data.rack_ubication}
                  placeholder="Nomenclatura DC"
                  onChange={handleFieldChange}
                />
              </div>
            )}
            <div className="col-lg-3 col-sm-12">
              <p>¿Tiene Accesorios Adicionales?</p>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="has_accessory"
                  value={true}
                  id="yesAccessories"
                  onChange={handleFieldChange}
                  checked={data.has_accessory === true}
                />
                <label className="form-check-label" htmlFor="yesAccessories">
                  Sí
                </label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="has_accessory"
                  id="noAccessories"
                  value={false}
                  checked={data.has_accessory === false}
                  onChange={handleFieldChange}
                />
                <label className="form-check-label" htmlFor="noAccessories">
                  No
                </label>
              </div>
            </div>
            <div className="col-lg-4 col-sm-12">
              <label htmlFor="accessory_description" className="form-label">
                Accesorios adicionales:
              </label>
              <input
                type="text"
                className="form-control"
                name="accessory_description"
                id="accessory_description"
                value={data.accessory_description}
                placeholder="Descripción de los accesorios adicionales"
                onChange={handleFieldChange}
                disabled={data.has_accessory === false}
              />
            </div>

            <div className="mt-5 mb-3">
              <h4 className="">Dimensiones del Rack</h4>
              <div className="row justify-content-center">
                <div className="col-lg-3 col-sm-12">
                  <label htmlFor="rack_width" className="form-label">
                    Ancho (en cm):
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="rack_width"
                    id="rack_width"
                    value={data.rack_width}
                    placeholder="Introduzca el ancho del rack"
                    onChange={handleFieldChange}
                  />
                </div>

                <div className="col-lg-3 col-sm-12">
                  <label htmlFor="rack_length" className="form-label">
                    Largo (en cm):
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="rack_length"
                    id="rack_length"
                    value={data.rack_length}
                    placeholder="Introduzca el largo del rack"
                    onChange={handleFieldChange}
                  />
                </div>

                <div className="col-lg-3 col-sm-12">
                  <label htmlFor="rack_height" className="form-label">
                    Alto (en cm):
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="rack_height"
                    id="rack_height"
                    value={data.rack_height}
                    placeholder="Introduzca el alto del rack"
                    onChange={handleFieldChange}
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      {/* consulta de energia */}
      {isInstallationOrRelocation && (
        <>
          <h2 className="mt-4">Requerimiento de energia para el rack</h2>
          <div className="row gx-5">
            <div className="mb-3 me-2 col-lg-4 col-sm-12">
              <label htmlFor="internal_pdu" className="form-label">
                Unidades de Distribución de Energía (PDU):
              </label>
              <input
                type="text"
                className="form-control"
                id="internal_pdu"
                name="internal_pdu"
                value={data.internal_pdu}
                placeholder="Cantidad de regletas"
                onChange={handleFieldChange}
              />
            </div>
            <div className="mb-3 col-lg-3 col-sm-12">
              <label htmlFor="input_connector" className="form-label">
                Tipo de conector del PDU:
              </label>
              <input
                type="text"
                className="form-control"
                id="input_connector"
                name="input_connector"
                value={data.input_connector}
                placeholder="Modelo enchufe"
                onChange={handleFieldChange}
              />
            </div>
            <div className="mb-3 col-lg-2 col-sm-12">
              <label htmlFor="fases" className="form-label">
                Numero de Fases
              </label>
              <input
                type="text"
                className="form-control"
                name="fases"
                id="fases"
                value={data.fases}
                placeholder="Fases para la PDU"
                onChange={handleFieldChange}
              />
            </div>
            <div className="mb-3 col-lg-2 col-sm-12">
              <label htmlFor="output_connector" className="form-label">
                Numero de Tomas PDU
              </label>
              <input
                type="text"
                className="form-control"
                id="output_connector"
                name="output_connector"
                value={data.output_connector}
                placeholder="Cantidad de Tomas"
                onChange={handleFieldChange}
              />
            </div>
            <div className="col-lg-3 col-sm-12 ">
              <p>Tiene conexión al neutro?</p>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="neutro"
                  id="yesNeutro"
                  value={true}
                  checked={data.neutro === true}
                  onChange={handleFieldChange}
                />
                <label className="form-check-label" htmlFor="yesNeutro">
                  Si
                </label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="neutro"
                  id="noNeutro"
                  value={false}
                  checked={data.neutro === false}
                  onChange={handleFieldChange}
                />
                <label className="form-check-label" htmlFor="noNeutro">
                  No
                </label>
              </div>
            </div>
          </div>
        </>
      )}
      
    </>
  );
}

export default RackDetails;
