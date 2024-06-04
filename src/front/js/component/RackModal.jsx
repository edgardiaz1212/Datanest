import React, { useState } from "react";

const RackModal = ({ show, handleClose }) => {
  const [rackData, setRackData] = useState({
    hasCabinet: false,
    leased: false,
    totalCabinets: "",
    openClosed: "",
    security: false,
    typeSecurity: "",
    hasExtractors: false,
    extractorsUbication: "",
    modular: false,
    lateralDoors: false,
    lateralUbication: "",
    rackUnit: "",
    rackPosition: "",
    rackUbication: "",
    hasAccessory: false,
    accessoryDescription: "",
    rackWidth: "",
    rackLength: "",
    rackHeight: "",
    internalPDU: "",
    inputConnector: "",
    fases: "",
    outputConnector: "",
    neutro: false,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRackData({ ...rackData, [name]: value });
  };

  return (
    <div className={`modal ${show ? "show" : ""}`} tabIndex="-1" role="dialog">
      <div className="modal-dialog" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Detalles de Rack</h5>
            <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={handleClose}>
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body">
            {/* Aquí colocarías los campos según las condiciones */}
            {rackData && (
              <>
                <label>
                  Tiene gabinete:
                  <input type="checkbox" name="hasCabinet" checked={rackData.hasCabinet} onChange={handleChange} />
                </label>
                {/* Agrega más campos según tus necesidades */}
              </>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={handleClose}>
              Cerrar
            </button>
            <button type="button" className="btn btn-primary">
              Guardar Cambios
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RackModal;
