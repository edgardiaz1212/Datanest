import React, { useState } from "react";

const EquipmentModal = ({ show, handleClose }) => {
  const [componentData, setComponentData] = useState({
    equipmentWidth: "",
    equipmentHeight: "",
    equipmentLength: "",
    packagingWidth: "",
    packagingLength: "",
    packagingHeight: "",
    weight: "",
    anchorType: "",
    serviceArea: false,
    serviceFrontal: false,
    serviceBack: false,
    serviceLateral: false,
    accessWidth: "",
    accessInclination: "",
    accessLength: "",
    rackNumber: "",
    equipRackUbication: "",
    rackUnitPosition: "",
    totalRackUnits: "",
    acDc: "",
    inputCurrent: "",
    power: "",
    powerSupply: "",
    operationTemp: "",
    thermalDisipation: "",
    powerConfig: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setComponentData({ ...componentData, [name]: value });
  };

  return (
    <div className={`modal ${show ? "show" : ""}`} tabIndex="-1" role="dialog">
      <div className="modal-dialog" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Detalles del Componente</h5>
            <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={handleClose}>
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body">
            {/* Aquí colocarías los campos específicos para el tipo de componente */}
            {componentData && (
              <>
                <label>
                  Ancho del equipo:
                  <input type="text" name="equipmentWidth" value={componentData.equipmentWidth} onChange={handleChange} />
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

export default EquipmentModal;
