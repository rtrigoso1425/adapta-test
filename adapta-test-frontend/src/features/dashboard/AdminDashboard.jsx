import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { BlurFade } from "../../components/ui/blur-fade";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { TagsSelector } from "../../components/ui/tags-selector";
import { User,
  Mail, 
  Lock, 
  GraduationCap, 
  Book, 
  X, 
  Plus, 
  FileText, 
  Timer, 
  BookPlus, 
  CircleUserRound,
  LibraryBig,
} from "lucide-react";
import axios from "axios";
import { register, reset as resetAuth } from "../auth/authSlice";
import { Typewriter } from "../../components/ui/typewriter-text";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { AsyncSelect } from "../../components/ui/async-select";
import { SelectNative } from "../../components/ui/select-native";
import {
  getUsers,
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
// ### Modal Overlay Component ###
// ##################################################################
const ModalOverlay = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div style={modalStyles.overlay} onClick={onClose}>
      <div style={modalStyles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          style={modalStyles.closeButton}
          aria-label="Cerrar"
        >
          <X size={20} />
        </button>
        {children}
      </div>
    </div>
  );
};

// ##################################################################
// ### Sub-componentes ###
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
    <ModalOverlay isOpen={true} onClose={onClose}>
      <BlurFade inView delay={0.1}>
        <Card className="w-full max-w-md shadow-xl rounded-3xl border-0 bg-white">
          <CardHeader className="space-y-2 pb-4">
            <CardTitle className="text-2xl font-semibold text-center text-gray-900">
              Asignar Coordinador
            </CardTitle>
            <p className="text-sm text-center text-gray-500 mt-1">
              {career.name}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <p className="text-center text-gray-600">Cargando coordinadores...</p>
            ) : (
              <form onSubmit={onSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Selecciona un Coordinador
                  </Label>
                  <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2.5 bg-white focus-within:ring-2 focus-within:ring-gray-200">
                    <User className="w-5 h-5 text-gray-400" />
                    <SelectNative
                      value={selectedCoordinator}
                      onChange={(e) => setSelectedCoordinator(e.target.value)}
                      required
                      className="w-full border-0 focus-visible:ring-0 focus-visible:outline-none shadow-none text-black"
                    >
                      <option value="">-- Selecciona un coordinador --</option>
                      {coordinators.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name} ({c.email})
                        </option>
                      ))}
                    </SelectNative>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <Button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-2 rounded-lg text-gray-700 bg-gray-200 hover:bg-gray-300 font-medium transition-colors"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="px-6 py-2 rounded-lg text-white bg-black hover:bg-gray-800 font-medium shadow-md transition-colors"
                  >
                    Asignar
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </BlurFade>
    </ModalOverlay>
  );
};

const CareerManagementTab = ({ careers, onAssignCoordinatorClick }) => {
  const dispatch = useDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);
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
    setIsModalOpen(false);
  };

  return (
    <section>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Lista de Carreras</h2>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800"
        >
          <Plus size={20} />
          Nueva Carrera
        </Button>
      </div>

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

      <ModalOverlay isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <BlurFade inView delay={0.1}>
          <Card className="w-full max-w-md shadow-xl rounded-3xl border-0 bg-white">
            <CardHeader className="space-y-2 pb-4">
              <CardTitle className="text-2xl font-semibold text-center text-gray-900">
                <Typewriter text={["Crear Nueva Carrera"]} speed={150} />
              </CardTitle>
              <p className="text-sm text-center text-gray-500 mt-1">
                Completa el formulario para registrar una nueva carrera
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleCreateCareer} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Nombre de la Carrera
                  </Label>
                  <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2.5 bg-white focus-within:ring-2 focus-within:ring-gray-200">
                    <GraduationCap className="w-5 h-5 text-gray-400" />
                    <Input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ingrese Nombre de la Carrera"
                      required
                      className="w-full border-0 focus-visible:ring-0 focus-visible:outline-none shadow-none text-black"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Descripción
                  </Label>
                  <div className="flex items-start gap-2 border border-gray-300 rounded-lg px-3 py-2.5 bg-white focus-within:ring-2 focus-within:ring-gray-200">
                    <FileText className="w-5 h-5 text-gray-400 mt-1" />
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Ingrese la Descripción"
                      required
                      className="w-full border-0 bg-transparent focus:outline-none focus:ring-0 resize-none text-black"
                      rows={3}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Duración
                  </Label>
                  <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2.5 bg-white focus-within:ring-2 focus-within:ring-gray-200">
                    <Timer className="w-5 h-5 text-gray-400" />
                    <Input
                      type="text"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      placeholder="Ingrese la Duración (ej. 10 Ciclos)"
                      required
                      className="w-full border-0 focus-visible:ring-0 focus-visible:outline-none shadow-none text-black"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Grados
                  </Label>
                  <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2.5 bg-white focus-within:ring-2 focus-within:ring-gray-200">
                    <BookPlus className="w-5 h-5 text-gray-400" />
                    <Input
                      type="text"
                      value={degrees}
                      onChange={(e) => setDegrees(e.target.value)}
                      placeholder="Ingrese los Grados (separados por comas)"
                      required
                      className="w-full border-0 focus-visible:ring-0 focus-visible:outline-none shadow-none text-black"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full mt-6 py-3 rounded-lg hover:cursor-pointer text-white bg-black hover:bg-gray-800 font-medium shadow-md transition-colors"
                >
                  Crear Carrera
                </Button>
              </form>
            </CardContent>
          </Card>
        </BlurFade>
      </ModalOverlay>
    </section>
  );
};

const CourseManagementTab = ({ courses }) => {
  const dispatch = useDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [prerequisites, setPrerequisites] = useState([]);

  const courseTags = courses.map((course) => ({
    id: course._id,
    label: course.title
  }));

  const handlePrerequisitesChange = (selectedIds) => {
    setPrerequisites(selectedIds);
  };

  const handleCreateCourse = (e) => {
    e.preventDefault();
    dispatch(createCourse({ title, description, prerequisites }));
    setTitle("");
    setDescription("");
    setPrerequisites([]);
    setIsModalOpen(false);
  };

  return (
    <section>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Catálogo de Cursos</h2>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800"
        >
          <Plus size={20} />
          Nuevo Curso
        </Button>
      </div>

      {courses.map((course) => (
        <div key={course._id} style={styles.card}>
          <p>
            <strong>{course.title}</strong>
          </p>
          <small>ID: {course._id}</small>
        </div>
      ))}

      <ModalOverlay isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <BlurFade inView delay={0.1}>
          <Card className="w-full max-w-md shadow-xl rounded-3xl border-0 bg-white">
            <CardHeader className="space-y-2 pb-4">
              <CardTitle className="text-2xl font-semibold text-center text-gray-900">
                <Typewriter text={["Crear Nuevo Curso"]} speed={150} />
              </CardTitle>
              <p className="text-sm text-center text-gray-500 mt-1">
                Completa el formulario para crear un nuevo curso
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleCreateCourse} className="space-y-4">
                <Label className="text-black">Titulo del Curso</Label>
                <div className="flex items-center gap-2 border rounded-lg px-3 py-2 bg-white">
                  <Book className="w-5 h-5 text-gray-400 mt-1"/>
                  <Input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Título del Curso"
                    required
                    className="w-full border-0 focus-visible:ring-0 focus-visible:outline-none shadow-none text-black"
                  />
                </div>
                
                <Label className="text-black">Descripcion del Curso</Label>
                <div className="flex items-center gap-2 border rounded-lg px-3 py-2 bg-white">
                  <FileText className="w-5 h-5 text-gray-400 mt-1"/>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Descripción"
                    required
                    className="w-full border-0 bg-transparent focus:outline-none focus:ring-0 resize-none text-black"
                  />
                </div>
                
                <Label className="text-black">Prerrequisitos</Label>
                <div className="flex items-start gap-2 border rounded-lg px-3 py-2 bg-white min-h-[100px]">
                  <LibraryBig className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0"/>
                  <div className="w-full">
                    <TagsSelector 
                      tags={courseTags}
                      value={prerequisites}
                      onChange={handlePrerequisitesChange}
                      placeholder="Selecciona los cursos prerequisitos"
                      className="w-full border-0 focus-visible:ring-0 focus-visible:outline-none shadow-none text-black"
                    />
                  </div>
                </div>
                
                <Button type="submit" className="w-full rounded-xl hover:cursor-pointer text-white bg-black font-medium shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
                  Crear Curso
                </Button>
              </form>
            </CardContent>
          </Card>
        </BlurFade>
      </ModalOverlay>
    </section>
  );
};

const AcademicManagementTab = ({ courses, professors, cycles }) => {
  const dispatch = useDispatch();
  const [isCycleModalOpen, setIsCycleModalOpen] = useState(false);
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  
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
    setIsCycleModalOpen(false);
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
      setIsSectionModalOpen(false);
    } catch (error) {
      alert("Error al crear la sección: " + error.response.data.message);
    }
  };

  return (
    <section>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Gestión de Ciclos y Secciones</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button
            onClick={() => setIsCycleModalOpen(true)}
            className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800"
          >
            <Plus size={20} />
            Nuevo Ciclo
          </Button>
          <Button
            onClick={() => setIsSectionModalOpen(true)}
            className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800"
          >
            <Plus size={20} />
            Nueva Sección
          </Button>
        </div>
      </div>

      <ModalOverlay isOpen={isCycleModalOpen} onClose={() => setIsCycleModalOpen(false)}>
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
      </ModalOverlay>

      <ModalOverlay isOpen={isSectionModalOpen} onClose={() => setIsSectionModalOpen(false)}>
        <BlurFade inView delay={0.1}>
          <Card className="w-full max-w-md shadow-xl rounded-3xl border-0 bg-white">
            <CardHeader className="space-y-2 pb-4">
              <CardTitle className="text-2xl font-semibold text-center text-gray-900">
                <Typewriter text={["Crear Nueva Seccion"]} speed={150} />
              </CardTitle>
              <p className="text-sm text-center text-gray-500 mt-1">
                Completa el formulario para crear una nueva sección
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleCreateSection} className="space-y-4">
                <Label className="text-sm font-medium text-gray-700">
                  Curso:
                </Label>
                <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2.5 bg-white focus-within:ring-2 focus-within:ring-gray-200">
                  <SelectNative
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    required
                    className="w-full border-0 focus-visible:ring-0 focus-visible:outline-none shadow-none text-black"
                  >
                    <option value="">-- Selecciona --</option>
                    {courses.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.title}
                      </option>
                    ))}
                  </SelectNative>
                </div>
                <Label className="text-sm font-medium text-gray-700">
                  Profesor:
                </Label>
                <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2.5 bg-white focus-within:ring-2 focus-within:ring-gray-200">
                  <SelectNative
                    value={selectedProfessor}
                    onChange={(e) => setSelectedProfessor(e.target.value)}
                    required
                    className="w-full border-0 focus-visible:ring-0 focus-visible:outline-none shadow-none text-black"
                  >
                    <option value="">-- Selecciona --</option>
                    {professors.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name}
                      </option>
                    ))}
                  </SelectNative>
                </div>
                <Label className="text-sm font-medium text-gray-700">
                  Ciclo Academico:
                </Label>
                <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2.5 bg-white focus-within:ring-2 focus-within:ring-gray-200">
                  <SelectNative
                    value={selectedCycle}
                    onChange={(e) => setSelectedCycle(e.target.value)}
                    required
                    className="w-full border-0 focus-visible:ring-0 focus-visible:outline-none shadow-none text-black"
                  >
                    <option value="">-- Selecciona --</option>
                    {cycles.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </SelectNative>
                </div>
                <Label className="text-sm font-medium text-gray-700">
                  Código de Sección
                </Label>
                <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2.5 bg-white focus-within:ring-2 focus-within:ring-gray-200">
                  <Input
                    type="text"
                    value={sectionCode}
                    onChange={(e) => setSectionCode(e.target.value)}
                    required
                    className="w-full border-0 focus-visible:ring-0 focus-visible:outline-none shadow-none text-black"
                  />
                </div>
                <Label className="text-sm font-medium text-gray-700">
                  Capacidad:
                </Label>
                <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2.5 bg-white focus-within:ring-2 focus-within:ring-gray-200">
                  <Input
                    type="number"
                    min="1"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    required
                    className="w-full border-0 focus-visible:ring-0 focus-visible:outline-none shadow-none text-black"
                  />
                </div>
                <Button type="submit" className="w-full mt-6 py-3 rounded-lg hover:cursor-pointer text-white bg-black hover:bg-gray-800 font-medium shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  Crear Sección
                </Button>
              </form>
            </CardContent>
          </Card>
        </BlurFade>
      </ModalOverlay>
    </section>
  );
};

const UserManagementTab = () => {
  const dispatch = useDispatch();
  const { user: adminUser } = useSelector((state) => state.auth);
  const { users, isLoading } = useSelector((state) => state.users);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });
  const { name, email, password, role } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = (e) => {
    e.preventDefault();
    dispatch(register(formData))
      .unwrap()
      .then(() => {
        alert(`Usuario ${name} creado exitosamente!`);
        setFormData({ name: "", email: "", password: "", role: "" });
        dispatch(getUsers());
        setIsModalOpen(false);
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Usuarios de la Institución</h2>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800"
        >
          <Plus size={20} />
          Nuevo Usuario
        </Button>
      </div>

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

      <ModalOverlay isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <BlurFade inView delay={0.1}>
          <Card className="w-full max-w-md shadow-xl rounded-3xl border-0 bg-white">
            <CardHeader className="space-y-2 pb-4">
              <CardTitle className="text-2xl font-semibold text-center text-gray-900">
                <Typewriter text={["Crear Nuevo Usuario"]} speed={150} />
              </CardTitle>
              <p className="text-sm text-center text-gray-500 mt-1">
                Completa el formulario para registrar un nuevo usuario
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={onSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Nombre Completo
                  </Label>
                  <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2.5 bg-white focus-within:ring-2 focus-within:ring-gray-200">
                    <User className="w-5 h-5 text-gray-400" />
                    <Input
                      name="name"
                      value={name}
                      onChange={onChange}
                      placeholder="Ingrese el Nombre completo"
                      required
                      className="w-full border-0 focus-visible:ring-0 focus-visible:outline-none shadow-none text-black"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Correo electrónico
                  </Label>
                  <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2.5 bg-white focus-within:ring-2 focus-within:ring-gray-200">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <Input
                      name="email"
                      value={email}
                      type="email"
                      onChange={onChange}
                      placeholder="Ingrese el Correo electrónico"
                      required
                      className="w-full border-0 focus-visible:ring-0 focus-visible:outline-none shadow-none text-black"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Contraseña
                  </Label>
                  <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2.5 bg-white focus-within:ring-2 focus-within:ring-gray-200">
                    <Lock className="w-5 h-5 text-gray-400" />
                    <Input
                      name="password"
                      value={password}
                      type="password"
                      onChange={onChange}
                      placeholder="Ingrese la Contraseña temporal"
                      required
                      className="w-full border-0 focus-visible:ring-0 focus-visible:outline-none shadow-none text-black"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Rol</Label>
                  <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2.5 bg-white focus-within:ring-2 focus-within:ring-gray-200">
                    <CircleUserRound className="w-5 h-5 text-gray-400"/>
                    <SelectNative
                      name="role"
                      value={role}
                      onChange={onChange}
                      required
                      className="w-full border-0 focus-visible:ring-0 focus-visible:outline-none shadow-none text-black"
                    >
                      <option value="" disabled>
                        -- Selecciona un rol --
                      </option>
                      {allowedRoles.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </SelectNative>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-6 py-3 rounded-lg hover:cursor-pointer text-white bg-black hover:bg-gray-800 font-medium shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Crear Usuario
                </Button>
              </form>
            </CardContent>
          </Card>
        </BlurFade>
      </ModalOverlay>
    </section>
  );
};

// ######################################################################
// ### Componente Principal ###
// ######################################################################
const AdminDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

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
  const { isLoading: usersLoading } = useSelector((state) => state.users);

  const [modalCareer, setModalCareer] = useState(null);
  const [activeTab, setActiveTab] = useState("users");

  const isUniversity = user.institution.type === "university";

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [location.search]);

  useEffect(() => {
    dispatch(getUsers());
    if (isUniversity) {
      dispatch(getCareers());
      dispatch(getCoordinators());
    }
    dispatch(getCourses());
    dispatch(getProfessors());
    dispatch(getCycles());

    return () => {
      dispatch(resetCareers());
      dispatch(resetCourses());
      dispatch(resetUsers());
      dispatch(resetCycles());
      dispatch(resetAuth());
    };
  }, [dispatch, isUniversity]);

  const isLoadingData =
    usersLoading || careersLoading || coursesLoading || academicLoading;

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    navigate(`/dashboard?tab=${tab}`);
  };
  return (
    <div>
      <h1>Dashboard de Administración</h1>
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
