import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import axios from "axios";

// --- Acciones de Redux ---
import { register, reset as resetAuth } from "../auth/authSlice";
import {
  getUsers, // <-- Nos aseguraremos de llamar a esta desde el padre
  getCoordinators,
  getProfessors,
  reset as resetUsers,
} from "../users/usersSlice";
import {
  getCareers,
  createCareer,
  assignCoordinator,
  reset as resetCareers,
} from "../careers/careerSlice";
import {
  getCourses,
  createCourse,
  reset as resetCourses,
} from "../courses/courseSlice";
import {
  getCycles,
  createCycle,
  reset as resetCycles,
} from "../academic-cycles/academicCycleSlice";
import { store } from "../../services/store";

// ##################################################################
// ### Sub-componentes (Sin cambios, pero incluidos para completitud) ###
// ##################################################################

const AssignCoordinatorModal = ({ career, onClose }) => {
  const dispatch = useDispatch();
  const { coordinators, isLoading } = useSelector((state) => state.users);
  const [selectedCoordinator, setSelectedCoordinator] = useState("");

  useEffect(() => {
    dispatch(getCoordinators());
  }, [dispatch]);

  const onSubmit = (e) => {
    e.preventDefault();
    if (selectedCoordinator) {
      dispatch(
        assignCoordinator({ careerId: career._id, userId: selectedCoordinator })
      );
      onClose();
    }
  };

  return (
    <div style={modalStyles.overlay}>
      <div style={modalStyles.modal}>
        <h2>Asignar Coordinador a: {career.name}</h2>
        {isLoading ? (
          <p>Cargando coordinadores...</p>
        ) : (
          <form onSubmit={onSubmit}>
            <select
              value={selectedCoordinator}
              onChange={(e) => setSelectedCoordinator(e.target.value)}
              required
              style={{ width: "100%", padding: "10px", marginBottom: "20px" }}
            >
              <option value="">-- Selecciona un coordinador --</option>
              {coordinators.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} ({c.email})
                </option>
              ))}
            </select>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
              }}
            >
              <button type="button" onClick={onClose}>
                Cancelar
              </button>
              <button type="submit">Asignar</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
const CareerManagementTab = ({ careers, onAssignCoordinatorClick }) => {
  const dispatch = useDispatch();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [degrees, setDegrees] = useState("");
  const [duration, setDuration] = useState("");

  const handleCreateCareer = (e) => {
    e.preventDefault();
    const degreesArray = degrees.split(",").map((degree) => degree.trim());
    dispatch(
      createCareer({ name, description, degrees: degreesArray, duration })
    );
    setName("");
    setDescription("");
    setDegrees("");
    setDuration("");
  };

  return (
    <section>
      <h2>Lista de Carreras</h2>
      {careers.map((career) => (
        <div key={career._id} style={styles.card}>
          <h3>{career.name}</h3>
          <p>{career.description}</p>
          <p>
            <strong>Duración:</strong> {career.duration}
          </p>
          <p>
            <strong>Grados:</strong> {career.degrees.join(", ")}
          </p>
          <small>
            Coordinador:{" "}
            {career.coordinator ? career.coordinator.name : "No asignado"}
          </small>
          <div style={{ marginTop: "15px" }}>
            <button onClick={() => onAssignCoordinatorClick(career)}>
              {career.coordinator
                ? "Cambiar Coordinador"
                : "Asignar Coordinador"}
            </button>
            <Link
              to={`/career/${career._id}/curriculum`}
              style={{ marginLeft: "10px" }}
            >
              <button>Ver Malla</button>
            </Link>
          </div>
        </div>
      ))}
      <div style={styles.formContainer}>
        <h3>Crear Nueva Carrera</h3>
        <form onSubmit={handleCreateCareer}>
          <div style={styles.formGroup}>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre de la Carrera"
              required
              style={styles.input}
            />
          </div>
          <div style={styles.formGroup}>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción"
              required
              style={{ ...styles.input, height: "80px" }}
            />
          </div>
          <div style={styles.formGroup}>
            <input
              type="text"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="Duración (ej. 10 Ciclos)"
              required
              style={styles.input}
            />
          </div>
          <div style={styles.formGroup}>
            <input
              type="text"
              value={degrees}
              onChange={(e) => setDegrees(e.target.value)}
              placeholder="Grados (separados por comas)"
              required
              style={styles.input}
            />
          </div>
          <button type="submit">Crear Carrera</button>
        </form>
      </div>
    </section>
  );
};
const CourseManagementTab = ({ courses }) => {
  const dispatch = useDispatch();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [prerequisites, setPrerequisites] = useState([]);

  const handlePrerequisitesChange = (e) => {
    const selectedIds = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );
    setPrerequisites(selectedIds);
  };

  const handleCreateCourse = (e) => {
    e.preventDefault();
    dispatch(createCourse({ title, description, prerequisites }));
    setTitle("");
    setDescription("");
    setPrerequisites([]);
  };

  return (
    <section>
      <h2>Catálogo de Cursos</h2>
      {courses.map((course) => (
        <div key={course._id} style={styles.card}>
          <p>
            <strong>{course.title}</strong>
          </p>
          <small>ID: {course._id}</small>
        </div>
      ))}
      <div style={styles.formContainer}>
        <h3>Crear Nuevo Curso</h3>
        <form onSubmit={handleCreateCourse}>
          <div style={styles.formGroup}>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título del Curso"
              required
              style={styles.input}
            />
          </div>
          <div style={styles.formGroup}>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción"
              required
              style={{ ...styles.input, height: "80px" }}
            />
          </div>
          <div style={styles.formGroup}>
            <label>
              Prerrequisitos (mantén Ctrl o Cmd para seleccionar varios):
            </label>
            <br />
            <select
              multiple={true}
              value={prerequisites}
              onChange={handlePrerequisitesChange}
              style={{ ...styles.input, height: "150px" }}
            >
              {courses.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>
          <button type="submit">Crear Curso</button>
        </form>
      </div>
    </section>
  );
};
const AcademicManagementTab = ({ courses, professors, cycles }) => {
  const dispatch = useDispatch();
  const [cycleName, setCycleName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedProfessor, setSelectedProfessor] = useState("");
  const [selectedCycle, setSelectedCycle] = useState("");
  const [sectionCode, setSectionCode] = useState("");
  const [capacity, setCapacity] = useState(30);

  const handleCreateCycle = (e) => {
    e.preventDefault();
    dispatch(createCycle({ name: cycleName, startDate, endDate }));
    setCycleName("");
    setStartDate("");
    setEndDate("");
  };

  const handleCreateSection = async (e) => {
    e.preventDefault();
    const sectionData = {
      instructor: selectedProfessor,
      academicCycle: selectedCycle,
      sectionCode,
      capacity,
    };
    try {
      const token = store.getState().auth.user.token;
      await axios.post(`/api/courses/${selectedCourse}/sections`, sectionData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("¡Sección creada exitosamente!");
    } catch (error) {
      alert("Error al crear la sección: " + error.response.data.message);
    }
  };

  return (
    <section>
      <h2>Gestión de Ciclos y Secciones</h2>
      <div style={styles.formContainer}>
        <h3>Crear Nuevo Ciclo Académico</h3>
        <form onSubmit={handleCreateCycle}>
          <div style={styles.formGroup}>
            <input
              type="text"
              value={cycleName}
              onChange={(e) => setCycleName(e.target.value)}
              placeholder="Nombre del Ciclo (ej. 2025-II)"
              required
              style={styles.input}
            />
          </div>
          <div style={styles.formGroup}>
            <label>Fecha de Inicio:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              style={styles.input}
            />
          </div>
          <div style={styles.formGroup}>
            <label>Fecha de Fin:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
              style={styles.input}
            />
          </div>
          <button type="submit">Crear Ciclo</button>
        </form>
      </div>

      <div style={styles.formContainer}>
        <h3>Crear Nueva Sección</h3>
        <form onSubmit={handleCreateSection}>
          <div style={styles.formGroup}>
            <label>Curso:</label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              required
              style={styles.input}
            >
              <option value="">-- Selecciona --</option>
              {courses.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
          <div style={styles.formGroup}>
            <label>Profesor:</label>
            <select
              value={selectedProfessor}
              onChange={(e) => setSelectedProfessor(e.target.value)}
              required
              style={styles.input}
            >
              <option value="">-- Selecciona --</option>
              {professors.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div style={styles.formGroup}>
            <label>Ciclo Académico:</label>
            <select
              value={selectedCycle}
              onChange={(e) => setSelectedCycle(e.target.value)}
              required
              style={styles.input}
            >
              <option value="">-- Selecciona --</option>
              {cycles.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div style={styles.formGroup}>
            <label>Código de Sección (ej. G1):</label>
            <input
              type="text"
              value={sectionCode}
              onChange={(e) => setSectionCode(e.target.value)}
              required
              style={styles.input}
            />
          </div>
          <div style={styles.formGroup}>
            <label>Capacidad:</label>
            <input
              type="number"
              min="1"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              required
              style={styles.input}
            />
          </div>
          <button type="submit">Crear Sección</button>
        </form>
      </div>
    </section>
  );
};

// ##################################################################
// ### Sub-componente CORREGIDO: Pestaña para Gestionar Usuarios ###
// ##################################################################
const UserManagementTab = () => {
  const dispatch = useDispatch();
  const { user: adminUser } = useSelector((state) => state.auth);
  // Leemos los datos que el componente padre ya solicitó
  const { users, isLoading } = useSelector((state) => state.users);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });
  const { name, email, password, role } = formData;

  // YA NO NECESITAMOS EL useEffect aquí para pedir los datos

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = (e) => {
    e.preventDefault();
    dispatch(register(formData))
      .unwrap()
      .then(() => {
        alert(`Usuario ${name} creado exitosamente!`);
        setFormData({ name: "", email: "", password: "", role: "" });
        dispatch(getUsers()); // Refrescar la lista de usuarios tras la creación
      })
      .catch((error) => alert(`Error al crear usuario: ${error}`));
  };

  const institutionType = adminUser.institution.type;
  const allowedRoles =
    institutionType === "university"
      ? ["student", "professor", "coordinator", "admin"]
      : ["student", "professor", "parent", "admin"];

  return (
    <section>
      <h2>Usuarios de la Institución</h2>
      {isLoading ? (
        <p>Cargando usuarios...</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {users &&
            users.map((u) => (
              <li key={u._id} style={styles.card}>
                <strong>{u.name}</strong> ({u.email}) - Rol: {u.role}
              </li>
            ))}
        </ul>
      )}

      <div style={styles.formContainer}>
        <h3>Crear Nuevo Usuario</h3>
        <form onSubmit={onSubmit}>
          <input
            name="name"
            value={name}
            onChange={onChange}
            placeholder="Nombre completo"
            required
            style={styles.input}
          />
          <input
            name="email"
            value={email}
            type="email"
            onChange={onChange}
            placeholder="Correo electrónico"
            required
            style={styles.input}
          />
          <input
            name="password"
            value={password}
            type="password"
            onChange={onChange}
            placeholder="Contraseña temporal"
            required
            style={styles.input}
          />
          <select
            name="role"
            value={role}
            onChange={onChange}
            required
            style={styles.input}
          >
            <option value="" disabled>
              -- Selecciona un rol --
            </option>
            {allowedRoles.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <button type="submit" style={{ marginTop: "10px" }}>
            Crear Usuario
          </button>
        </form>
      </div>
    </section>
  );
};

// ######################################################################
// ### Componente Principal CORREGIDO: Dashboard de Administrador ###
// ######################################################################
const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  // Unificamos todos los estados de carga aquí
  const { careers, isLoading: careersLoading } = useSelector(
    (state) => state.careers
  );
  const { courses, isLoading: coursesLoading } = useSelector(
    (state) => state.courses
  );
  const {
    professors,
    cycles,
    isLoading: academicLoading,
  } = useSelector((state) => ({
    professors: state.users.professors,
    cycles: state.academicCycles.cycles,
    isLoading: state.users.isLoading || state.academicCycles.isLoading,
  }));
  // El estado de carga para `getUsers` viene del mismo slice que `getProfessors`.
  const { isLoading: usersLoading } = useSelector((state) => state.users);

  const [modalCareer, setModalCareer] = useState(null);
  const [activeTab, setActiveTab] = useState("users");

  const isUniversity = user.institution.type === "university";

  useEffect(() => {
    // El padre despacha TODAS las acciones necesarias al montarse
    dispatch(getUsers()); // <-- LLAMADA CENTRALIZADA
    if (isUniversity) {
      dispatch(getCareers());
      dispatch(getCoordinators());
    }
    dispatch(getCourses());
    dispatch(getProfessors());
    dispatch(getCycles());

    return () => {
      // La limpieza se mantiene en el padre
      dispatch(resetCareers());
      dispatch(resetCourses());
      dispatch(resetUsers());
      dispatch(resetCycles());
      dispatch(resetAuth());
    };
  }, [dispatch, isUniversity]);

  // Un solo indicador de carga para todo el dashboard
  const isLoadingData =
    usersLoading || careersLoading || coursesLoading || academicLoading;

  return (
    <div>
      <h1>Dashboard de Administración</h1>
      <nav style={styles.nav}>
        <button
          onClick={() => setActiveTab("users")}
          style={getTabStyle("users", activeTab)}
        >
          Gestionar Usuarios
        </button>
        {isUniversity && (
          <button
            onClick={() => setActiveTab("careers")}
            style={getTabStyle("careers", activeTab)}
          >
            Gestionar Carreras
          </button>
        )}
        <button
          onClick={() => setActiveTab("courses")}
          style={getTabStyle("courses", activeTab)}
        >
          Gestionar Cursos
        </button>
        <button
          onClick={() => setActiveTab("academic")}
          style={getTabStyle("academic", activeTab)}
        >
          Gestión Académica
        </button>
      </nav>

      {isLoadingData ? (
        <h3>Cargando datos de administración...</h3>
      ) : (
        <div>
          {activeTab === "users" && <UserManagementTab />}
          {activeTab === "careers" && isUniversity && (
            <CareerManagementTab
              careers={careers}
              onAssignCoordinatorClick={setModalCareer}
            />
          )}
          {activeTab === "courses" && <CourseManagementTab courses={courses} />}
          {activeTab === "academic" && (
            <AcademicManagementTab
              courses={courses}
              professors={professors}
              cycles={cycles}
            />
          )}
        </div>
      )}

      {modalCareer && (
        <AssignCoordinatorModal
          career={modalCareer}
          onClose={() => setModalCareer(null)}
        />
      )}
    </div>
  );
};

// --- Estilos ---
const styles = {
  card: {
    border: "1px solid #ddd",
    padding: "15px",
    margin: "10px 0",
    borderRadius: "5px",
  },
  formContainer: {
    border: "2px dashed #ccc",
    padding: "20px",
    marginTop: "30px",
    borderRadius: "5px",
  },
  formGroup: { marginBottom: "15px" },
  input: {
    width: "100%",
    padding: "8px",
    marginTop: "5px",
    boxSizing: "border-box",
  },
  nav: {
    marginBottom: "20px",
    borderBottom: "1px solid #ccc",
    paddingBottom: "10px",
  },
  navButton: {
    marginRight: "10px",
    padding: "8px 12px",
    border: "1px solid #ccc",
    background: "#f0f0f0",
    cursor: "pointer",
  },
  activeNavButton: {
    fontWeight: "bold",
    background: "#e0e0e0",
    borderBottom: "1px solid #e0e0e0",
  },
};

const getTabStyle = (tabName, activeTab) => ({
  ...styles.navButton,
  ...(activeTab === tabName && styles.activeNavButton),
});

const modalStyles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modal: {
    background: "white",
    padding: "25px",
    borderRadius: "8px",
    width: "500px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  },
};

export default AdminDashboard;
