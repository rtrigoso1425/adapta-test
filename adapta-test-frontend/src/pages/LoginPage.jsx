import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { login, reset } from "../features/auth/authSlice";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const { email, password } = formData;

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (isError) {
      alert(message);
    }

    if (isSuccess || user) {
      navigate("/dashboard");
    }

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
    const userData = { email, password };
    dispatch(login(userData));
  };

  if (isLoading) {
    return <h1>Cargando...</h1>;
  }

  return (
    <div>
      <h1>Iniciar Sesión</h1>
      <section>
        <form onSubmit={onSubmit}>
          <div>
            <input
              type="email"
              name="email"
              value={email}
              placeholder="Ingresa tu email"
              onChange={onChange}
              required
            />
          </div>
          <div>
            <input
              type="password"
              name="password"
              value={password}
              placeholder="Ingresa tu contraseña"
              onChange={onChange}
              required
            />
          </div>
          <div>
            <button type="submit">Entrar</button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default LoginPage;
