import React, { useContext, useState } from "react";
import { Context } from "../store/appContext";
import { useNavigate } from "react-router-dom"; // Importa useNavigate para redireccionar

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

  const navigate = useNavigate(); // Instancia useNavigate para redireccionar

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

  const handleComplete = (componentType, requestType) => {
    // Redirecciona a la página CompletData y pasa los datos como state
    navigate("/complete-data", { state: { componentType, requestType } });
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
        <h2>Equipamiento</h2>
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
                    <option value="Servidor">Servidor</option>
                    <option value="Router">Router</option>
                    <option value="Firewall">Firewall</option>
                    <option value="Monitor">Monitor</option>
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
                      className="btn btn-primary mt-2"
                      onClick={() => handleComplete(entry.componentType, entry.requestType)}
                    >
                      Completar
                    </button>
                  )}
                  {isFormFilled(entry) && (
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => handleRemoveEntry(index)}
                    >
                      Eliminar
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
    </>
  );
};

export default DataTable;
