import React, { useState, useContext } from "react";
import { Context } from "../store/appContext";
import { useNavigate } from "react-router-dom";

function RegisterUser() {
  const navigate = useNavigate()
  const { actions } = useContext(Context);
  const [error, setError] = useState(null);
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
    e.preventDefault()
    setError(null);
    try {
      await actions.addUser(formData);
      navigate("/register-data");
    } catch (err) {
      setError("Error al registrar usuario. Por favor intente nuevamente.");
    }
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
        <span>Coordinacion</span>
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
      {error && <div className="error-message">{error}</div>}
      <button className="submit" type="submit">Continuar</button>
    </form>
  );
}

export default RegisterUser;