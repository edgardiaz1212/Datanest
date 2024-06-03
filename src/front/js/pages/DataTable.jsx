import React, { useState } from "react";

const DataTable = () => {
    const initialState = {
        requestType: "",
        brand: "",
        model: "",
        serial: "",
        componentType: "",
        partNumber: ""
    };

    const [formEntries, setFormEntries] = useState([initialState]);

    const handleChange = (index, e) => {
        const { name, value } = e.target;
        const newFormEntries = [...formEntries];
        newFormEntries[index][name] = value;
        setFormEntries(newFormEntries);
    };

    const handleAddEntry = () => {
        setFormEntries([...formEntries, initialState]);
    };

    const handleRemoveEntry = (index) => {
        const newFormEntries = formEntries.filter((_, i) => i !== index);
        setFormEntries(newFormEntries);
    };

    const handleDownload = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(formEntries));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "data.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    return (
      <>
      <div className="container mt-5 bg-success">
        <h1 className="pt-5">
          Por favor NOMBRE llenar los campos con la informacion basica para el
          cliente CLIENTE{" "}
        </h1>
      </div>
        <div className="container p-5">
            <h2>EQUIPAMIENTO A REGISTRAR</h2>
            <div className="p-2">
            {formEntries.map((entry, index) => (
                <div key={index} className="form-group">
                    <select
                        name="requestType"
                        value={entry.requestType}
                        onChange={(e) => handleChange(index, e)}
                        required
                    >
                        <option value="">Select Request Type</option>
                        <option value="Installation">Installation</option>
                        <option value="Maintenance">Maintenance</option>
                        <option value="Removal">Removal</option>
                    </select>
                    <input
                        type="text"
                        name="brand"
                        placeholder="Brand"
                        value={entry.brand}
                        onChange={(e) => handleChange(index, e)}
                        required
                    />
                    <input
                        type="text"
                        name="model"
                        placeholder="Model"
                        value={entry.model}
                        onChange={(e) => handleChange(index, e)}
                        required
                    />
                    <input
                        type="text"
                        name="serial"
                        placeholder="Serial"
                        value={entry.serial}
                        onChange={(e) => handleChange(index, e)}
                        required
                    />
                    <input
                        type="text"
                        name="componentType"
                        placeholder="Component Type"
                        value={entry.componentType}
                        onChange={(e) => handleChange(index, e)}
                        required
                    />
                    <input
                        type="text"
                        name="partNumber"
                        placeholder="Part Number"
                        value={entry.partNumber}
                        onChange={(e) => handleChange(index, e)}
                    />
                    {index > 0 && (
                        <button onClick={() => handleRemoveEntry(index)}>Remove Entry</button>
                    )}
                    {entry.requestType && entry.brand && entry.model && entry.serial && entry.componentType && (
                        <button onClick={handleAddEntry}>Add Another Entry</button>
                    )}
                </div>
            ))}
            </div>
            <button onClick={handleDownload}>Download All Data</button>
            <button onClick={() => console.log("Finalizing...")}>Finalize</button>
        </div>
        </>
    );
};

export default DataTable;
