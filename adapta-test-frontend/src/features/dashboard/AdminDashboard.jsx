import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { BlurFade } from "../../components/ui/blur-fade";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { TagsSelector } from "../../components/ui/tags-selector";
import { DatePicker } from "../../components/ui/date-picker";
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
  UserCog,
} from "lucide-react";
import axios from "axios";
import { register, reset as resetAuth } from "../auth/authSlice";
import { Typewriter } from "../../components/ui/typewriter-text";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { HoverButton } from "../../components/ui/hover-button";
import { SelectNative } from "../../components/ui/select-native";
import AdminUsersTable from "../../components/AdminUsersTable";
import AdminCoursesTable from "../../components/AdminCoursesTable";
import AdminCyclesTable from "../../components/AdminCyclesTable";
import { Component as BauhausCard } from "../../components/bauhaus-card";

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
  const { careers: allCareers } = useSelector((state) => state.careers); // obtener todas las carreras
  const [selectedCoordinator, setSelectedCoordinator] = useState("");

  useEffect(() => {
    dispatch(getCoordinators());
    // asegurar que las carreras estén cargadas para el filtrado
    if (!allCareers || allCareers.length === 0) {
      dispatch(getCareers());
    }
  }, [dispatch]);

  // Construir set de IDs de coordinadores ya asignados (robusto contra distintos shapes)
  const assignedCoordinatorIds = new Set();
  (allCareers || []).forEach((cr) => {
    if (!cr) return;
    const coord = cr.coordinator;
    if (!coord) return;
    const id = typeof coord === "string" ? coord : (coord._id || coord.id);
    if (id) assignedCoordinatorIds.add(String(id));
  });

  // Filtrar coordinadores que NO tienen ya una carrera asignada (excluir IDs en assignedCoordinatorIds)
  const availableCoordinators = (coordinators || []).filter((c) => {
    const id = c && (c._id || c.id) ? String(c._id || c.id) : null;
    const isAssigned = id ? assignedCoordinatorIds.has(id) : false;
    const isCoordinatorRole = c.role ? c.role === "coordinator" : true;
    return !isAssigned && isCoordinatorRole;
  });

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
        <Card className="w-full max-w-md shadow-xl rounded-3xl border-0 bg-card">
          <CardHeader className="space-y-2 pb-4">
            <CardTitle className="text-2xl font-semibold text-center text-foreground">
              Asignar Coordinador
            </CardTitle>
            <p className="text-sm text-center text-muted-foreground mt-1">
              {career.name}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <p className="text-center text-muted-foreground">Cargando coordinadores...</p>
            ) : (
              <form onSubmit={onSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">
                    Selecciona un Coordinador
                  </Label>

                  {/* Si no hay coordinadores disponibles, mostrar mensaje */}
                  {availableCoordinators.length === 0 ? (
                    <div className="rounded-lg border px-4 py-3 bg-muted/10 text-sm text-muted-foreground">
                      No hay coordinadores disponibles sin asignación de carrera.
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 border rounded-lg px-3 py-2.5 bg-card focus-within:ring-2">
                      <User className="w-5 h-5 text-muted-foreground" />
                      <SelectNative
                        value={selectedCoordinator}
                        onChange={(e) => setSelectedCoordinator(e.target.value)}
                        required
                        className="w-full border-0 focus-visible:ring-0 focus-visible:outline-none shadow-none text-foreground"
                      >
                        <option value="">-- Selecciona un coordinador --</option>
                        {availableCoordinators.map((c) => (
                          <option key={c._id} value={c._id}>
                            {c.name} ({c.email})
                          </option>
                        ))}
                      </SelectNative>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <Button
                    type="button"
                    onClick={onClose}
                    variant="outline"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    variant="default"
                    disabled={availableCoordinators.length === 0}
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
        <div style={{ marginTop: '10px'}} className="flex items-start gap-3">
          <div className="bg-white/10 p-2.5 rounded-lg backdrop-blur-sm">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-2">Lista de Carreras</h1>
          </div>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          variant="default"
          className="flex items-center gap-2 px-4 py-2 rounded-lg"
        >
          <Plus size={20} />
          Nueva Carrera
        </Button>
      </div>

      {/* Grid de tarjetas Bauhaus para cada carrera */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {careers.map((career) => (
          <div key={career._id} className="p-2">
            <BauhausCard
              id={career._id}
              topInscription={career.duration || ""}
              mainText={career.name || "Sin nombre"}
              subMainText={career.description || ""}
              filledButtonInscription={career.coordinator ? "Cambiar Coordinador" : "Asignar Coordinador"}
              outlinedButtonInscription="Ver Malla"
              onFilledButtonClick={() => onAssignCoordinatorClick(career)}
              onOutlinedButtonClick={() => { window.location.href = `/career/${career._id}/curriculum`; }}
              /* Use theme-aware CSS variables (Tailwind theme tokens) so cards adapt to light/dark */
              accentColor={`hsl(var(--primary))`}
              backgroundColor={`hsl(var(--card))`}
              textColorMain={`hsl(var(--card-foreground))`}
              textColorSub={`hsl(var(--muted-foreground))`}
              chronicleButtonBg={`transparent`}
              chronicleButtonFg={`hsl(var(--foreground))`}
              chronicleButtonHoverFg={`hsl(var(--primary-foreground))`}
            />
          </div>
        ))}
      </div>

      <ModalOverlay isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <BlurFade inView delay={0.1}>
          <Card className="w-full max-w-md shadow-xl rounded-3xl border-0 bg-card">
            <CardHeader className="space-y-2 pb-4">
              <CardTitle className="text-2xl font-semibold text-center text-foreground">
                <Typewriter text={["Crear Nueva Carrera"]} speed={150} />
              </CardTitle>
              <p className="text-sm text-center text-muted-foreground mt-1">
                Completa el formulario para registrar una nueva carrera
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleCreateCareer} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">
                    Nombre de la Carrera
                  </Label>
                  <div className="flex items-center gap-2 border rounded-lg px-3 py-2.5 bg-card focus-within:ring-2">
                    <GraduationCap className="w-5 h-5 text-muted-foreground" />
                    <Input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ingrese Nombre de la Carrera"
                      required
                      className="w-full border-0 focus-visible:ring-0 focus-visible:outline-none shadow-none text-foreground"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">
                    Descripción
                  </Label>
                  <div className="flex items-start gap-2 border rounded-lg px-3 py-2.5 bg-card focus-within:ring-2">
                    <FileText className="w-5 h-5 text-muted-foreground mt-1" />
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Ingrese la Descripción"
                      required
                      className="w-full border-0 bg-transparent focus:outline-none focus:ring-0 resize-none text-foreground"
                      rows={3}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">
                    Duración
                  </Label>
                  <div className="flex items-center gap-2 border rounded-lg px-3 py-2.5 bg-card focus-within:ring-2">
                    <Timer className="w-5 h-5 text-muted-foreground" />
                    <Input
                      type="text"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      placeholder="Ingrese la Duración (ej. 10 Ciclos)"
                      required
                      className="w-full border-0 focus-visible:ring-0 focus-visible:outline-none shadow-none text-foreground"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">
                    Grados
                  </Label>
                  <div className="flex items-center gap-2 border rounded-lg px-3 py-2.5 bg-card focus-within:ring-2">
                    <BookPlus className="w-5 h-5 text-muted-foreground" />
                    <Input
                      type="text"
                      value={degrees}
                      onChange={(e) => setDegrees(e.target.value)}
                      placeholder="Ingrese los Grados (separados por comas)"
                      required
                      className="w-full border-0 focus-visible:ring-0 focus-visible:outline-none shadow-none text-foreground"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full mt-6 py-3 rounded-lg font-medium shadow-md transition-colors"
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
        <div style={{ marginTop: '10px'}} className="flex items-start gap-3">
          <div className="bg-white/10 p-2.5 rounded-lg backdrop-blur-sm">
            <FileText className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-2">Catálogo de Cursos</h1>
          </div>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          variant="default"
          className="flex items-center gap-2 px-4 py-2 rounded-lg"
        >
          <Plus size={20} />
          Nuevo Curso
        </Button>
      </div>

      {/* Usar la tabla de administración de cursos */}
      <AdminCoursesTable />

      <ModalOverlay isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <BlurFade inView delay={0.1}>
          <Card className="w-full max-w-md shadow-xl rounded-3xl border-0 bg-card">
            <CardHeader className="space-y-2 pb-4">
              <CardTitle className="text-2xl font-semibold text-center text-foreground">
                <Typewriter text={["Crear Nuevo Curso"]} speed={150} />
              </CardTitle>
              <p className="text-sm text-center text-muted-foreground mt-1">
                Completa el formulario para crear un nuevo curso
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleCreateCourse} className="space-y-4">
                <Label className="text-foreground">Titulo del Curso</Label>
                <div className="flex items-center gap-2 border rounded-lg px-3 py-2 bg-card">
                  <Book className="w-5 h-5 text-muted-foreground mt-1"/>
                  <Input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Título del Curso"
                    required
                    className="w-full border-0 focus-visible:ring-0 focus-visible:outline-none shadow-none text-foreground"
                  />
                </div>
                <Label className="text-foreground">Descripcion del Curso</Label>
                <div className="flex items-center gap-2 border rounded-lg px-3 py-2 bg-card">
                  <FileText className="w-5 h-5 text-muted-foreground mt-1"/>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Descripción"
                    required
                    className="w-full border-0 bg-transparent focus:outline-none focus:ring-0 resize-none text-foreground"
                  />
                </div>
                
                <Label className="text-foreground">Prerrequisitos</Label>
                <div className="flex items-start gap-2 border rounded-lg px-3 py-2 bg-card min-h-[100px]">
                  <LibraryBig className="w-5 h-5 text-muted-foreground mt-1 flex-shrink-0"/>
                  <div className="w-full">
                    <TagsSelector 
                      tags={courseTags}
                      value={prerequisites}
                      onChange={handlePrerequisitesChange}
                      placeholder="Selecciona los cursos prerequisitos"
                      className="w-full border-0 focus-visible:ring-0 focus-visible:outline-none shadow-none text-foreground"
                    />
                  </div>
                </div>
                
                <Button type="submit" variant="default" className="w-full rounded-xl hover:cursor-pointer font-medium shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
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
  // startDate is stored as ISO string (or null) and passed to DatePicker as Date
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState("");

  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedProfessor, setSelectedProfessor] = useState("");
  const [selectedCycle, setSelectedCycle] = useState("");
  const [sectionCode, setSectionCode] = useState("");
  const [capacity, setCapacity] = useState(30);

  const handleCreateCycle = (e) => {
    e.preventDefault();
    // startDate is an ISO string (or null); endDate remains as string from the input
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
        <div style={{ marginTop: '10px'}} className="flex items-start gap-3">
          <div className="bg-white/10 p-2.5 rounded-lg backdrop-blur-sm">
            <BookPlus className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-2">Gestión de Ciclos y Secciones</h1>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button
            onClick={() => setIsCycleModalOpen(true)}
            variant="default"
            className="flex items-center gap-2 px-4 py-2 rounded-lg"
          >
            <Plus size={20} />
            Nuevo Ciclo
          </Button>
          <Button
            onClick={() => setIsSectionModalOpen(true)}
            variant="default"
            className="flex items-center gap-2 px-4 py-2 rounded-lg"
          >
            <Plus size={20} />
            Nueva Sección
          </Button>
        </div>
      </div>

      {/* Tabla de ciclos académicos */}
      <h3 style={{ marginTop: '10px', marginBottom: '15px' }}>Ciclos Académicos</h3>
      <AdminCyclesTable />
      <ModalOverlay isOpen={isCycleModalOpen} onClose={() => setIsCycleModalOpen(false)}>
        <BlurFade inView delay={0.1}>
          <Card className="w-full max-w-md shadow-xl rounded-3xl border-0 bg-card">
            <CardHeader className="space-y-2 pb-4">
              <CardTitle className="text-2xl font-semibold text-center text-foreground">
                <Typewriter text={["Crear Nuevo Ciclo"]} speed={150} />
              </CardTitle>
              <p className="text-sm text-center text-muted-foreground mt-1">
                Completa el formulario para crear un nuevo ciclo
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleCreateCycle}>
                <Label className="text-sm font-medium text-foreground">Nombre del ciclo:</Label>
                <div className="flex items-center gap-2 border rounded-lg px-3 py-2.5 bg-card focus-within:ring-2">
                  <Input
                    type="text"
                    value={cycleName}
                    onChange={(e) => setCycleName(e.target.value)}
                    placeholder="Nombre del Ciclo (ej. 2025-II)"
                    required
                    className="w-full border-0 focus-visible:ring-0 focus-visible:outline-none shadow-none text-foreground"
                  />
                </div>
                <Label className="text-sm font-medium text-foreground">Fecha de Inicio:</Label>
                <div className="flex items-center gap-2 border rounded-lg px-3 py-2.5 bg-card focus-within:ring-2">
                  <DatePicker
                    date={startDate ? new Date(startDate) : null}
                    onDateChange={(date) => setStartDate(date ? date.toISOString() : "")}
                    required
                    className="w-full border-0 focus-visible:ring-0 focus-visible:outline-none shadow-none text-foreground"
                  />
                </div>
                <Label className="text-sm font-medium text-foreground">Fecha de Fin:</Label>
                <div className="flex items-center gap-2 border rounded-lg px-3 py-2.5 bg-card focus-within:ring-2">
                   <DatePicker
                     date={endDate ? new Date(endDate) : null}
                     onDateChange={(date) => setEndDate(date ? date.toISOString() : "")}
                     required
                     className="w-full border-0 focus-visible:ring-0 focus-visible:outline-none shadow-none text-foreground bg-card"
                   />
                 </div>
                <Button type="submit" variant="default" className="w-full rounded-xl hover:cursor-pointer font-medium shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
                  Crear Ciclo
                </Button>
              </form>
            </CardContent>
          </Card>
        </BlurFade>
      </ModalOverlay>

      <ModalOverlay isOpen={isSectionModalOpen} onClose={() => setIsSectionModalOpen(false)}>
        <BlurFade inView delay={0.1}>
          <Card className="w-full max-w-md shadow-xl rounded-3xl border-0 bg-card">
            <CardHeader className="space-y-2 pb-4">
              <CardTitle className="text-2xl font-semibold text-center text-foreground">
                <Typewriter text={["Crear Nueva Seccion"]} speed={150} />
              </CardTitle>
              <p className="text-sm text-center text-muted-foreground mt-1">
                Completa el formulario para crear una nueva sección
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleCreateSection} className="space-y-4">
                <Label className="text-sm font-medium text-foreground">
                  Curso:
                </Label>
                <div className="flex items-center gap-2 border rounded-lg px-3 py-2.5 bg-card focus-within:ring-2">
                  <Book className="w-5 h-5 text-muted-foreground mt-1 flex-shrink-0"/>
                  <SelectNative
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    required
                    className="w-full border-0 focus-visible:ring-0 focus-visible:outline-none shadow-none text-foreground"
                  >
                    <option value="">-- Selecciona --</option>
                    {courses.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.title}
                      </option>
                    ))}
                  </SelectNative>
                </div>
                <Label className="text-sm font-medium text-foreground">
                  Profesor:
                </Label>
                <div className="flex items-center gap-2 border rounded-lg px-3 py-2.5 bg-card focus-within:ring-2">
                  <User className="w-5 h-5 text-muted-foreground mt-1 flex-shrink-0"/>
                  <SelectNative
                    value={selectedProfessor}
                    onChange={(e) => setSelectedProfessor(e.target.value)}
                    required
                    className="w-full border-0 focus-visible:ring-0 focus-visible:outline-none shadow-none text-foreground"
                  >
                    <option value="">-- Selecciona --</option>
                    {professors.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name}
                      </option>
                    ))}
                  </SelectNative>
                </div>
                <Label className="text-sm font-medium text-foreground">
                  Ciclo Academico:
                </Label>
                <div className="flex items-center gap-2 border rounded-lg px-3 py-2.5 bg-card focus-within:ring-2">
                  <LibraryBig className="w-5 h-5 text-muted-foreground mt-1 flex-shrink-0"/>
                  <SelectNative
                    value={selectedCycle}
                    onChange={(e) => setSelectedCycle(e.target.value)}
                    required
                    className="w-full border-0 focus-visible:ring-0 focus-visible:outline-none shadow-none text-foreground"
                  >
                    <option value="">-- Selecciona --</option>
                    {cycles.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </SelectNative>
                </div>
                <Label className="text-sm font-medium text-foreground">
                  Código de Sección
                </Label>
                <div className="flex items-center gap-2 border rounded-lg px-3 py-2.5 bg-card focus-within:ring-2">
                  <Plus className="w-5 h-5 text-muted-foreground mt-1 flex-shrink-0"/>
                  <Input
                    type="text"
                    value={sectionCode}
                    onChange={(e) => setSectionCode(e.target.value)}
                    required
                    className="w-full border-0 focus-visible:ring-0 focus-visible:outline-none shadow-none text-foreground"
                  />
                </div>
                <Label className="text-sm font-medium text-foreground">
                  Capacidad:
                </Label>
                <div className="flex items-center gap-2 border rounded-lg px-3 py-2.5 bg-card focus-within:ring-2">
                  <UserCog className="w-5 h-5 text-muted-foreground mt-1 flex-shrink-0"/>
                  <Input
                    type="number"
                    min="1"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    required
                    className="w-full border-0 focus-visible:ring-0 focus-visible:outline-none shadow-none text-foreground"
                  />
                </div>
                <Button type="submit" variant="default" className="w-full mt-6 py-3 rounded-lg hover:cursor-pointer font-medium shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
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
        <div style={{ marginTop: '10px'}} className="flex items-start gap-3">
          <div className="bg-white/10 p-2.5 rounded-lg backdrop-blur-sm">
            <User className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-2">Usuarios de la Institución</h1>
          </div>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          variant="default"
          className="flex items-center gap-2 px-4 py-2 rounded-lg"
        >
          <Plus size={20} />
          Nuevo Usuario
        </Button>
      </div>

      {/* Usar la tabla de administración de usuarios */}
      <AdminUsersTable />
      
      <ModalOverlay isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <BlurFade inView delay={0.1}>
          <Card className="w-full max-w-md shadow-xl rounded-3xl border-0 bg-card">
            <CardHeader className="space-y-2 pb-4">
              <CardTitle className="text-2xl font-semibold text-center text-foreground">
                <Typewriter text={["Crear Nuevo Usuario"]} speed={150} />
              </CardTitle>
              <p className="text-sm text-center text-muted-foreground mt-1">
                Completa el formulario para registrar un nuevo usuario
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={onSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">
                    Nombre Completo
                  </Label>
                  <div className="flex items-center gap-2 border rounded-lg px-3 py-2.5 bg-card focus-within:ring-2">
                    <User className="w-5 h-5 text-muted-foreground" />
                    <Input
                      name="name"
                      value={name}
                      onChange={onChange}
                      placeholder="Ingrese el Nombre completo"
                      required
                      className="w-full border-0 focus-visible:ring-0 focus-visible:outline-none shadow-none text-foreground"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">
                    Correo electrónico
                  </Label>
                  <div className="flex items-center gap-2 border rounded-lg px-3 py-2.5 bg-card focus-within:ring-2">
                    <Mail className="w-5 h-5 text-muted-foreground" />
                    <Input
                      name="email"
                      value={email}
                      type="email"
                      onChange={onChange}
                      placeholder="Ingrese el Correo electrónico"
                      required
                      className="w-full border-0 focus-visible:ring-0 focus-visible:outline-none shadow-none text-foreground"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">
                    Contraseña
                  </Label>
                  <div className="flex items-center gap-2 border rounded-lg px-3 py-2.5 bg-card focus-within:ring-2">
                    <Lock className="w-5 h-5 text-muted-foreground" />
                    <Input
                      name="password"
                      value={password}
                      type="password"
                      onChange={onChange}
                      placeholder="Ingrese la Contraseña temporal"
                      required
                      className="w-full border-0 focus-visible:ring-0 focus-visible:outline-none shadow-none text-foreground"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">Rol</Label>
                  <div className="flex items-center gap-2 border rounded-lg px-3 py-2.5 bg-card focus-within:ring-2">
                    <CircleUserRound className="w-5 h-5 text-muted-foreground"/>
                    <SelectNative
                      name="role"
                      value={role}
                      onChange={onChange}
                      required
                      className="w-full border-0 focus-visible:ring-0 focus-visible:outline-none shadow-none text-foreground"
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
                  variant="default"
                  className="w-full mt-6 py-3 rounded-lg hover:cursor-pointer font-medium shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
