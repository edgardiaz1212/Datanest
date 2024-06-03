import React, { useState, useContext } from "react";
import { Context } from "../store/appContext";

function RegisterUser() {
    const { actions, store } = useContext(Context)
  
    const initialState = {
    username: "",
    email: "",
    coordination: "",
    clientName: "",
    contract: "",
  };

  const [formData, setFormData] = useState(initialState);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await actions.addUser(formData);
      if (response.status === 201) {
        alert("User registered successfully!");
        setFormData(initialState);
      }
    } catch (error) {
      alert("An error occurred while registering the user. Please try again.");
      console.error("Error:", error);
    }
  };

  return (
    <>
      <form className="form" onSubmit={handleSubmit}>
        <p className="title">Tus Datos</p>
        <p className="message">LLena los datos como primer paso.</p>
        
          <label>
            <input
              required
              name="username"
              placeholder=""
              type="text"
              className="input"
              value={formData.username}
              onChange={handleChange}
            />
            <span>Nombre Completo</span>
          </label>
          <label>
            <input
              required
              name="email"
              placeholder=""
              type="text"
              className="input"
              value={formData.email}
              onChange={handleChange}
            />
            <span>Correo</span>
          </label>
        
        <label>
          <input
            required
            name="coordination"
            placeholder=""
            type="text"
            className="input"
            value={formData.coordination}
            onChange={handleChange}
          />
          <span>Coordinación</span>
        </label>
        <label>
          <input
            required
            name="clientName"
            placeholder=""
            type="text"
            className="input"
            value={formData.clientName}
            onChange={handleChange}
          />
          <span>Cliente Final</span>
        </label>
        
        <button className="submit" type="submit">Siguiente</button>
      </form>
    </>
  );
}

export default RegisterUser;