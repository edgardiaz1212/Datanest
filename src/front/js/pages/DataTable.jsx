import React, { useContext, useState } from "react";
import { Context } from "../store/appContext";
import RackModal from "../component/RackModal.jsx"; // Importa el componente del modal de Rack
import EquipmentModal from "../component/EquipmentModal.jsx"; // Importa el componente del modal de Equipment

const DataTable = () => {
  const { actions, store } = useContext(Context);
  const [entries, setEntries] = useState([
    {
      requestType: "",
      brand: "",
      model: "",
      serial: "",
      componentType: "",
      partNumber: "",
    },
  ]);

  const [selectedComponent, setSelectedComponent] = useState(null); // Estado para controlar el tipo de componente seleccionado

  const handleChange = (index, e) => {
    const { name, value } = e.target;
    const updatedEntries = [...entries];
    updatedEntries[index][name] = value;
    setEntries(updatedEntries);
  };

  const handleAddEntry = () => {
    setEntries([
      ...entries,
      {
        requestType: "",
        brand: "",
        model: "",
        serial: "",
        componentType: "",
        partNumber: "",
      },
    ]);
  };

  const handleRemoveEntry = (index) => {
    const updatedEntries = entries.filter((_, i) => i !== index);
    setEntries(
      updatedEntries.length > 0
        ? updatedEntries
        : [
            {
              requestType: "",
              brand: "",
              model: "",
              serial: "",
              componentType: "",
              partNumber: "",
            },
          ]
    );
  };

  const isFormFilled = (entry) => {
    return (
      entry.requestType &&
      entry.brand &&
      entry.model &&
      entry.serial &&
      entry.componentType
    );
  };

  const handleFinalize = () => {
    // Finalize logic
  };

  const handleDownload = () => {
    // Download logic
  };

  const handleComplete = (index) => {
    const selectedEntry = entries[index];
    if (selectedEntry.componentType === "Rack") {
      setSelectedComponent("Rack");
    } else {
      setSelectedComponent("Equipment");
    }
  };

  return (
    <>
      <div className="container mt-5 bg-success">
        <h1 className="pt-5">
          Por favor {store.currentUser.username} llenar los campos con la
          informacion para el cliente {store.currentUser.clientName}
        </h1>
      </div>
      <div className="container mt-5">
        <h2>DataTable</h2>
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Tipo de Solicitud</th>
              <th>Marca</th>
              <th>Modelo</th>
              <th>Serial</th>
              <th>Tipo de Componente</th>
              <th>Número de Parte</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, index) => (
              <tr key={index}>
                <td>
                  <select
                    className="form-control"
                    name="requestType"
                    value={entry.requestType}
                    onChange={(e) => handleChange(index, e)}
                    required
                  >
                    <option value="">Seleccionar</option>
                    <option value="Instalacion">Instalacion</option>
                    <option value="Retiro">Retiro</option>
                    <option value="Desincorporacion">Desincorporacion</option>
                    <option value="Mudanza">Mudanza</option>
                  </select>
                </td>
                <td>
                  <input
                    type="text"
                    className="form-control"
                    name="brand"
                    value={entry.brand}
                    onChange={(e) => handleChange(index, e)}
                    placeholder="Marca"
                    required
                  />
                </td>
                <td>
                  <input
                    type="text"
                    className="form-control"
                    name="model"
                    value={entry.model}
                    onChange={(e) => handleChange(index, e)}
                    placeholder="Modelo"
                    required
                  />
                </td>
                <td>
                  <input
                    type="text"
                    className="form-control"
                    name="serial"
                    value={entry.serial}
                    onChange={(e) => handleChange(index, e)}
                    placeholder="Serial"
                    required
                  />
                </td>
                <td>
                  <select
                    className="form-control"
                    name="componentType"
                    value={entry.componentType}
                    onChange={(e) => handleChange(index, e)}
                    required
                  >
                    <option value="">Seleccionar tipo de componente</option>
                    <option value="Rack">Rack</option>
                    <option value="Switch">Switch</option>
                    <option value="Server">Server</option>
                    <option value="Router">Router</option>
                    <option value="Firewall">Firewall</option>
                    <option value="Caja Almacenamiento">
                      Caja Almacenamiento
                    </option>
                  </select>
                </td>
                <td>
                  <input
                    type="text"
                    className="form-control"
                    name="partNumber"
                    value={entry.partNumber}
                    onChange={(e) => handleChange(index, e)}
                    placeholder="Número de Parte"
                  />
                </td>
                <td>
                  {isFormFilled(entry) && (
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => handleRemoveEntry(index)}
                    >
                      Eliminar
                    </button>
                  )}
                  {isFormFilled(entry) && (
                    <button
                      type="button"
                      className="btn btn-primary mt-2"
                      data-bs-toggle="modal"
                      data-bs-target={selectedComponent === "Rack" ? "#rackModal" : "#equipmentModal"}
                      onClick={() => handleComplete(index)}
                    >
                      Completar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-3">
          {isFormFilled(entries[entries.length - 1]) && (
            <button
              type="button"
              className="btn btn-success mr-2"
              onClick={handleAddEntry}
            >
              Agregar Otro
            </button>
          )}
          <button
            type="button"
            className="btn btn-primary mr-2"
            onClick={handleFinalize}
          >
            Finalizar
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleDownload}
          >
            Descargar Todo
          </button>
        </div>
      </div>
      <RackModal /> {/* Modal para Rack */}
      <EquipmentModal /> {/* Modal para Equipment */}
    </>
  );
};

export default DataTable;
