// src/pages/LoginPage.jsx
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
// Importamos las acciones nuevas y existentes
import { login, reset, getInstitutions } from "../features/auth/authSlice";

const LoginPage = () => {
  // Estado del formulario: ahora incluye el institutionId
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    institutionId: "", // <-- Nuevo campo para el ID de la institución seleccionada
  });

  const { email, password, institutionId } = formData;

  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Obtenemos los nuevos estados del slice de autenticación
  const {
    user,
    isLoading,
    isError,
    isSuccess,
    message,
    institutions,
    isLoadingInstitutions,
  } = useSelector((state) => state.auth);

  // useEffect para buscar las instituciones cuando el componente se monta
  useEffect(() => {
    dispatch(getInstitutions());
  }, [dispatch]);

  // useEffect para manejar el estado del login (éxito, error, etc.)
  useEffect(() => {
    if (isError) {
      alert(message); // Mostraremos una notificación mejor más adelante
    }

    if (isSuccess || user) {
      navigate("/dashboard"); // Si el login es exitoso, redirigir
    }

    // Limpiamos el estado de 'login', no el de las instituciones
    dispatch(reset());
  }, [user, isError, isSuccess, message, navigate, dispatch]);

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = (e) => {
    e.preventDefault();

    if (!institutionId) {
      alert("Por favor, selecciona tu institución.");
      return;
    }

    const userData = { email, password, institutionId };
    dispatch(login(userData));
  };

  // Si está cargando el login, mostramos un loader
  if (isLoading) {
    return <h1>Verificando credenciales...</h1>;
  }

  return (
    <div>
      <h1>Iniciar Sesión</h1>
      <p>Accede a tu institución educativa.</p>
      <section>
        <form onSubmit={onSubmit}>
          <div>
            <label htmlFor="institutionId">1. Selecciona tu Institución</label>
            {isLoadingInstitutions ? (
              <p>Cargando instituciones...</p>
            ) : (
              <select
                id="institutionId"
                name="institutionId"
                value={institutionId}
                onChange={onChange}
                required
                style={{ width: "100%", padding: "10px", marginTop: "5px" }}
              >
                <option value="" disabled>
                  -- Elige una opción --
                </option>
                {institutions.map((inst) => (
                  <option key={inst._id} value={inst._id}>
                    {inst.name} (
                    {inst.type === "university" ? "Universidad" : "Colegio"})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Mostramos los siguientes campos solo si se ha seleccionado una institución */}
          {institutionId && (
            <>
              <div style={{ marginTop: "20px" }}>
                <label htmlFor="email">2. Correo Electrónico</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={email}
                  placeholder="Ingresa tu email"
                  onChange={onChange}
                  required
                  style={{ width: "100%", padding: "10px", marginTop: "5px" }}
                />
              </div>
              <div style={{ marginTop: "20px" }}>
                <label htmlFor="password">3. Contraseña</label>
                <input
                  id="password"
                  type="password"
                  name="password"
                  value={password}
                  placeholder="Ingresa tu contraseña"
                  onChange={onChange}
                  required
                  style={{ width: "100%", padding: "10px", marginTop: "5px" }}
                />
              </div>
              <div>
                <button
                  type="submit"
                  style={{ marginTop: "20px", padding: "10px 20px" }}
                >
                  Entrar
                </button>
              </div>
            </>
          )}
        </form>
      </section>
    </div>
  );
};

export default LoginPage;