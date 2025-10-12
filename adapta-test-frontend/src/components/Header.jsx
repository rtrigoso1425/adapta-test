// src/components/Header.jsx
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout, reset } from "../features/auth/authSlice";

const Header = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const onLogout = () => {
    dispatch(logout());
    dispatch(reset());
    navigate("/login"); // Redirigir a login en lugar de la raíz
  };

  return (
    <header
      style={{
        padding: "20px",
        borderBottom: "1px solid #ccc",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div>
        <Link
          to="/"
          style={{ textDecoration: "none", color: "black", fontSize: "1.5rem" }}
        >
          AdaptaTest
        </Link>
        {/* Mostramos el nombre de la institución si el usuario ha iniciado sesión */}
        {user && user.institution && (
          <span
            style={{
              marginLeft: "15px",
              color: "#555",
              borderLeft: "1px solid #ccc",
              paddingLeft: "15px",
            }}
          >
            {user.institution.name}
          </span>
        )}
      </div>
      <nav>
        <ul
          style={{
            listStyle: "none",
            margin: 0,
            display: "flex",
            gap: "20px",
            alignItems: "center",
          }}
        >
          {user ? (
            <>
              <li>
                <span style={{ fontStyle: "italic" }}>
                  Hola, {user.name} ({user.role})
                </span>
              </li>
              <li>
                <Link to="/dashboard">Dashboard</Link>
              </li>
              <li>
                <button onClick={onLogout}>Cerrar Sesión</button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/login">Login</Link>
              </li>
              <li>
                <Link to="/register">Register</Link>
              </li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Header;
