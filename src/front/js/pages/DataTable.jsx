import React, { useContext, useState, useEffect } from "react";
import { Context } from "../store/appContext";
import { useNavigate } from "react-router-dom";
import DownloadModal from "../component/DownloadModal.jsx";
import DeleteButton from "../component/DeleteButton.jsx";

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

  const [formData, setFormData] = useState({}); // Estado local para almacenar los datos del formulario
  const [savedEntries, setSavedEntries] = useState([]);

  const navigate = useNavigate();

  const handleChange = (index, e) => {
    const { name, value } = e.target;
    const updatedEntries = [...entries];
    updatedEntries[index][name] = value;
    setEntries(updatedEntries);
    setFormData(updatedEntries[index]); // Actualiza el estado local con los datos del formulario actual
  };

  useEffect(() => {
    let isMounted = true;
  
    async function fetchData() {
      try {
        if (store.descriptions.length > 0) {
          if (isMounted) {
            setSavedEntries(store.descriptions);
            console.log("Using descriptions from store:", store.descriptions);
          }
        } else {
          console.log("No descriptions in store.");
        }
      } catch (error) {
        console.log("Error fetching user data:", error);
      }
    }
  
    if (isMounted && (store.descriptions.length === 0 || savedEntries.length === 0)) {
      fetchData();
    }
  
    return () => {
      isMounted = false;
    };
  }, [actions, store.descriptions.length, savedEntries.length]);

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

  const handleComplete = () => {
    if (isFormFilled(formData)) {
      navigate("/complete-data", { state: { entry: formData } });
    } else {
      console.log("Formulario no está completo.");
      // Puedes manejar el caso de formulario incompleto aquí
    }
  };

  const handleDeleteEntry = async (id) => {
    try {
      await actions.deleteDescription(id);
      const updatedDescriptions = store.descriptions.filter(
        (desc) => desc.id !== id
      );
      setSavedEntries(updatedDescriptions);
    } catch (error) {
      console.log("Error deleting description:", error);
    }
  };

  const handleEdit = async (entry) => {
    let additionalData = {};
    if (entry.componentType === "Rack") {
      additionalData = await actions.getRackByDescriptionId(entry.id);
    } else {
      additionalData = await actions.getEquipmentByDescriptionId(entry.id);
    }
    navigate("/edit-data", {
      state: { entry: { ...entry, ...additionalData } },
    });
  };

  const handleFinalize = () => {
    // Finalize logic
  };

  return (
    <div className="mb-5 ">
      <div
        className=" fondoData "
        
      >
        <h1 className=" text-center p-5">
          Por favor {store.currentUser.username} llenar los campos para el
          cliente {store.currentUser.clientName}
        </h1>
      </div>
      <div className="container mt-5">
        <h2>Registro</h2>
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
                    <option value="Instalación">Instalación</option>
                    <option value="Retiro">Retiro</option>
                    <option value="Desincorporación">Desincorporación</option>
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
                    placeholder="Marca*"
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
                    placeholder="Modelo*"
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
                    placeholder="Serial*"
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
                    <option value="Consola">Consola</option>
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
                <td className="d-flex">
                  {isFormFilled(entry) && (
                    <button
                      type="button"
                      className="btn btn-primary "
                      onClick={() =>
                        handleComplete(entry.componentType, entry.requestType, store.currentUser.id)
                      }
                    >
                      Completar
                    </button>
                  )}
                  {isFormFilled(entry) && (
                    <DeleteButton
                      handleDeleteEntry={handleRemoveEntry}
                      entryId={index}
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {store.descriptions.length > 0 && (
          <div className="tableregister mb-3">
            <h2>Equipamiento Cargado</h2>
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
                {savedEntries.map((entry, index) => (
                  <tr key={index}>
                    <td>{entry.requestType}</td>
                    <td>{entry.brand}</td>
                    <td>{entry.model}</td>
                    <td>{entry.serial}</td>
                    <td>{entry.componentType}</td>
                    <td>{entry.partNumber}</td>
                    <td className="d-flex ">
                      <>
                        
                        <button className="Btn-edit me-2 ms-3" onClick={() => handleEdit(entry)}>
                          Editar
                          <svg viewBox="0 0 512 512" className="svg">
                            <path d="M410.3 231l11.3-11.3-33.9-33.9-62.1-62.1L291.7 89.8l-11.3 11.3-22.6 22.6L58.6 322.9c-10.4 10.4-18 23.3-22.2 37.4L1 480.7c-2.5 8.4-.2 17.5 6.1 23.7s15.3 8.5 23.7 6.1l120.3-35.4c14.1-4.2 27-11.8 37.4-22.2L387.7 253.7 410.3 231zM160 399.4l-9.1 22.7c-4 3.1-8.5 5.4-13.3 6.9L59.4 452l23-78.1c1.4-4.9 3.8-9.4 6.9-13.3l22.7-9.1v32c0 8.8 7.2 16 16 16h32zM362.7 18.7L348.3 33.2 325.7 55.8 314.3 67.1l33.9 33.9 62.1 62.1 33.9 33.9 11.3-11.3 22.6-22.6 14.5-14.5c25-25 25-65.5 0-90.5L453.3 18.7c-25-25-65.5-25-90.5 0zm-47.4 168l-144 144c-6.2 6.2-16.4 6.2-22.6 0s-6.2-16.4 0-22.6l144-144c6.2-6.2 16.4-6.2 22.6 0s6.2 16.4 0 22.6z"></path>
                          </svg>
                        </button>

                        <DeleteButton
                          handleDeleteEntry={handleDeleteEntry}
                          entryId={entry.id}
                        />
                      </>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="mt-3 gap-3">
          {/* {isFormFilled(entries[entries.length - 1]) && (
            <div>
            <button
              type="button"
              className="btn btn-success mr-2"
              onClick={handleAddEntry}
            >
              Agregar Otro
            </button>
            </div>
          )} */}

          <div className="end&download mb-2"></div>
            {store.descriptions.length > 0 && (
            <>
              <DownloadModal />
            </>
          )}

          <button
            type="button"
            className="btn-exit "
            onClick={() => {
              actions.deleteAll()
              navigate('/')}}
          >
            Finalizar
          </button>
          
        </div>
      </div>
    </div>
  );
};

export default DataTable;
