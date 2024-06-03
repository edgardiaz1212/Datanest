import React, { useState, useContext } from "react";
import { Context } from "../store/appContext";

function RegisterUser() {
  const { actions } = useContext(Context);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    coordination: "",
    clientName: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await actions.addUser(formData);
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      <p className="title">Tus Datos</p>
      <p className="message">LLena los datos como primer paso.</p>
        <label>
          <input
            required
            placeholder=""
            type="text"
            name="username"
            className="input"
            value={formData.username}
            onChange={handleChange}
          />
          <span>Nombre Completo</span>
        </label>
        <label>
          <input
            required
            placeholder=""
            type="email"
            name="email"
            className="input"
            value={formData.email}
            onChange={handleChange}
          />
          <span>Correo</span>
        </label>

      <label>
        <input
          required
          placeholder=""
          type="text"
          name="coordination"
          className="input"
          value={formData.coordination}
          onChange={handleChange}
        />
        <span>Cordinacion</span>
      </label>
      <label>
        <input
          required
          placeholder=""
          type="text"
          name="clientName"
          className="input"
          value={formData.clientName}
          onChange={handleChange}
        />
        <span>Cliente Final</span>
      </label>
     
      <button className="submit" type="submit">Continuar</button>
    </form>
  );
}

export default RegisterUser;