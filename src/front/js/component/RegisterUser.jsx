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
    const emailAvailable = await actions.checkemails(formData.email);

    if (emailAvailable) {
      try {
          // Si el correo está disponible, agregar el usuario
          const responseData = await actions.addUser(formData);
          if (responseData && responseData.user_id) {
              setTimeout(() => {
                  navigate(`/register-data/${responseData.user_id}`);
              }, 1000);
          } else {
              setError("Error: User ID is undefined.");
          }
      } catch (err) {
          console.log(err);
          setError("Error al registrar usuario. Por favor intente nuevamente.");
      }
  } else {
      // Si el correo ya está registrado, mostrar un mensaje de error
      setError("El correo electrónico ya está registrado.");
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