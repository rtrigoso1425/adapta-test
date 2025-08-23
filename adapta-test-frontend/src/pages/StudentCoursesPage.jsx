import { useEffect, useState } from "react";
// eslint-disable-next-line no-unused-vars
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import axios from "axios"; // Usaremos axios para un nuevo servicio simple
import { store } from "../services/store";

// --- Componente de Tarjeta de Curso (inspirado en tu imagen) ---
const CourseCard = ({ enrollment }) => {
  // Lógica de progreso (placeholder por ahora)
  const progress = Math.floor(Math.random() * 30); // Simulación de progreso

  return (
    <div style={styles.card}>
      <div style={styles.cardImage}></div>
      <div style={{ padding: "15px" }}>
        <span style={styles.progressText}>{progress}%</span>
        <h4>{enrollment.section.course.title}</h4>
        <p style={styles.cardInfo}>
          {enrollment.section.sectionCode} - Presencial
        </p>
        <p style={styles.cardInfo}>
          <small>{enrollment.section.instructor.name}</small>
        </p>
        <Link
          to={`/learn/section/${enrollment.section._id}`}
          style={{ textDecoration: "none" }}
        >
          <button style={styles.cardButton}>Ir al Curso</button>
        </Link>
      </div>
    </div>
  );
};

// --- Componente Principal de la Página ---
const StudentCoursesPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("active"); // 'active' o el ID de un ciclo

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = store.getState().auth.user.token;
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const { data } = await axios.get("/api/enrollments/my-history", config);
        setHistory(data);
      } catch (error) {
        console.error("Error al cargar el historial:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading) {
    return <h2>Cargando tus cursos...</h2>;
  }

  const filteredHistory = history.filter((group) => {
    if (filter === "all") return true;
    if (filter === "active") return group.isActive;
    return group.cycleId === filter;
  });

  return (
    <div>
      <div style={styles.header}>
        <h2>Mis Cursos</h2>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={styles.filterSelect}
        >
          <option value="active">Periodo actual</option>
          <option value="all">Todos los periodos</option>
          {history.map((group) => (
            <option key={group.cycleId} value={group.cycleId}>
              {group.cycleName}
            </option>
          ))}
        </select>
      </div>

      {filteredHistory.map((group) => (
        <div key={group.cycleId}>
          <h3 style={styles.cycleHeader}>
            {group.cycleName} {group.isActive && "(Actual)"}
          </h3>
          <div style={styles.cardContainer}>
            {group.enrollments.map((enrollment) => (
              <CourseCard key={enrollment._id} enrollment={enrollment} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const styles = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid #eee",
    paddingBottom: "10px",
  },
  filterSelect: { padding: "8px", fontSize: "1rem" },
  cycleHeader: { color: "#333", marginTop: "30px" },
  cardContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "20px",
  },
  card: {
    border: "1px solid #ddd",
    borderRadius: "8px",
    overflow: "hidden",
    background: "white",
  },
  cardImage: { height: "150px", background: "#f0e4f7" /* Color de ejemplo */ },
  progressText: {
    background: "#eee",
    padding: "2px 8px",
    borderRadius: "4px",
    fontSize: "0.8rem",
    fontWeight: "bold",
  },
  cardInfo: { color: "#666", margin: "5px 0" },
  cardButton: {
    width: "100%",
    padding: "10px",
    border: "none",
    background: "#e9d8f2",
    color: "#333",
    cursor: "pointer",
    marginTop: "10px",
  },
};

export default StudentCoursesPage;
