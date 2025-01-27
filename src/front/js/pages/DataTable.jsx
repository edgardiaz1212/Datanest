import React, { useContext, useState, useEffect } from "react";
import { Context } from "../store/appContext";
import { useNavigate, useParams } from "react-router-dom";
import DownloadModal from "../component/DownloadModal.jsx";
import DeleteButton from "../component/DeleteButton.jsx";

const DataTable = () => {
  const { user_id } = useParams();
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
  
  const [formData, setFormData] = useState({});
  const [savedEntries, setSavedEntries] = useState([]);

  const navigate = useNavigate();

  const handleChange = (index, e) => {
    const { name, value } = e.target;
    const updatedEntries = [...entries];
    const currentEntry = updatedEntries[index];
  
    // Solo actualiza si el valor ha cambiado
    if (currentEntry[name] !== value) {
      updatedEntries[index][name] = value;
      setEntries(updatedEntries);
      setFormData(updatedEntries[index]);
    }
  };

  useEffect(() => {
    let isMounted = true; // Evita actualizaciones innecesarias si el componente se desmonta
  
    const fetchData = async () => {
      if (!user_id) {
        console.warn("User ID is undefined.");
        return;
      }
  
      try {
        const userEntries = await actions.getDescriptionsByUser(user_id);
  
        if (isMounted && userEntries?.length > 0) {
          const filteredEntries = userEntries.filter(
            (desc) => parseInt(desc.user_id) === parseInt(user_id)
          );
  
          setSavedEntries(filteredEntries); // Actualiza solo si hay cambios
          console.log("Filtered descriptions:", filteredEntries);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
  
    fetchData();
  
    return () => {
      isMounted = false; // Limpieza para evitar llamadas redundantes
    };
  }, [user_id]); // Evita incluir `actions` como dependencia a menos que sea necesario
  

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
      <div className=" fondoData ">
        <h1 className=" text-center p-5">
          Por favor {store.currentUser.username} llenar los campos para el
          cliente {store.currentUser.clientName}
        </h1>
      </div>
      <div className="container mt-5">
        <h2>Registro</h2>
        <div className="table-responsive">
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>Tipo de Solicitud*</th>
                <th>Marca*</th>
                <th>Modelo*</th>
                <th>Serial*</th>
                <th>Tipo de Componente*</th>
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
                          handleComplete(
                            entry.componentType,
                            entry.requestType,
                            store.currentUser.id
                          )
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
        </div>
        {savedEntries.length > 0 && (
          <div className="tableregister mb-3">
            <h2>Equipamiento Cargado</h2>
            <div className="table-responsive">
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
                        <button
                          className="Btn-edit me-2 ms-3"
                          onClick={() => handleEdit(entry)}
                        >
                          Editar
                        </button>
                        <DeleteButton
                          handleDeleteEntry={handleDeleteEntry}
                          entryId={entry.id}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="mt-3 gap-3">
          <div className="end&download mb-2"></div>
          {savedEntries.length > 0 && (
            <DownloadModal />
          )}

          <button
            type="button"
            className="btn-exit "
            onClick={() => {
              actions.deleteUserData();
              navigate("/");
            }}
          >
            Finalizar
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataTable;
