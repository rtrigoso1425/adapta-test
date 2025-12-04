import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getMyCareer, addCourseToCurriculum, reset as resetCareers } from '../careers/careerSlice';
import { getCourses, uploadSyllabus, reset as resetCourses } from '../courses/courseSlice';
import { createPortal } from "react-dom";
import { BlurFade } from "../../components/ui/blur-fade";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { SelectNative } from "../../components/ui/select-native";
import { Typewriter } from "../../components/ui/typewriter-text";
import { 
    GraduationCap, 
    Book, 
    BookPlus, 
    FileText, 
    Upload, 
    X,
    Plus,
    AlertCircle 
} from "lucide-react";

// ##################################################################
// ### Modal Overlay Component ###
// ##################################################################
const ModalOverlay = ({ isOpen, onClose, children }) => {
  useEffect(() => {
    // Bloquear scroll del fondo
    document.body.style.overflow = isOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Portal → evita que el dashboard recorte o limite el modal
  return createPortal(
    <div style={modalStyles.overlay} onClick={onClose}>
      <div
        style={modalStyles.modalContent}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={modalStyles.closeButton}
          aria-label="Cerrar"
        >
          <X size={20} />
        </button>
        {children}
      </div>
    </div>,
    document.body
  );
};

// --- Sub-componente: Formulario para gestionar la Malla Curricular ---
const CurriculumForm = ({ careerId }) => {
    const dispatch = useDispatch();
    const { courses, isLoading: coursesLoading } = useSelector((state) => state.courses);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [cycleNumber, setCycleNumber] = useState('');

    const onSubmit = (e) => {
        e.preventDefault();
        if (selectedCourse && cycleNumber) {
            const courseData = {
                courseId: selectedCourse,
                cycleNumber: parseInt(cycleNumber, 10)
            };
            dispatch(addCourseToCurriculum({ careerId, courseData }));
            setSelectedCourse('');
            setCycleNumber('');
            setIsModalOpen(false);
        }
    };

    if (coursesLoading) {
        return <p className="text-center text-muted-foreground">Cargando lista de cursos...</p>;
    }

    return (
        <>
            <Button
                onClick={() => setIsModalOpen(true)}
                variant="default"
                className="flex items-center gap-2 px-4 py-2 rounded-lg"
            >
                <Plus size={20} />
                Añadir Curso a la Malla
            </Button>
            
            <ModalOverlay isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <BlurFade inView delay={0.1}>
                    <Card className="w-full max-w-md shadow-xl rounded-3xl border-0 bg-card">
                      <CardHeader className="space-y-2 pb-4">
                            <CardTitle className="text-2xl font-semibold text-center text-foreground">
                                <Typewriter text={["Añadir Curso a la Malla"]} speed={150} />
                            </CardTitle>
                            <p className="text-sm text-center text-muted-foreground mt-1">
                                Selecciona un curso del catálogo y asígnalo a un ciclo
                            </p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <form onSubmit={onSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-foreground">
                                        Curso
                                    </Label>
                                    <div className="flex items-center gap-2 border rounded-lg px-3 py-2.5 bg-card focus-within:ring-2">
                                        <Book className="w-5 h-5 text-muted-foreground" />
                                        <SelectNative
                                            value={selectedCourse}
                                            onChange={(e) => setSelectedCourse(e.target.value)}
                                            required
                                            className="w-full border-0 focus-visible:ring-0 focus-visible:outline-none shadow-none text-foreground"
                                        >
                                            <option value="">-- Selecciona un curso del catálogo --</option>
                                            {courses.map(course => (
                                                <option key={course._id} value={course._id}>{course.title}</option>
                                            ))}
                                        </SelectNative>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-foreground">
                                        Número de Ciclo
                                    </Label>
                                    <div className="flex items-center gap-2 border rounded-lg px-3 py-2.5 bg-card focus-within:ring-2">
                                        <BookPlus className="w-5 h-5 text-muted-foreground" />
                                        <Input
                                            type="number"
                                            min="1"
                                            value={cycleNumber}
                                            onChange={(e) => setCycleNumber(e.target.value)}
                                            placeholder="Ej. 1"
                                            required
                                            className="w-full border-0 focus-visible:ring-0 focus-visible:outline-none shadow-none text-foreground"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 mt-6">
                                    <Button
                                        type="submit"
                                        variant="default"
                                        className="w-full py-3 rounded-lg font-medium shadow-md transition-colors"
                                    >
                                        Añadir a Malla
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </BlurFade>
            </ModalOverlay>
        </>
    );
};

// ===================================================================================
//  SUB-COMPONENTE: Para Subir el Sílabus
// ===================================================================================
const SyllabusUploader = ({ coursesInCurriculum }) => {
    const dispatch = useDispatch();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCourseId, setSelectedCourseId] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedCourseId || !selectedFile) {
            alert('Por favor, selecciona un curso y un archivo PDF.');
            return;
        }

        const formData = new FormData();
        formData.append('syllabus', selectedFile);

        dispatch(uploadSyllabus({ courseId: selectedCourseId, formData }));
        setIsModalOpen(false);
        setSelectedCourseId('');
        setSelectedFile(null);
    };

    return (
        <>
            <Button
                onClick={() => setIsModalOpen(true)}
                variant="default"
                className="flex items-center gap-2 px-4 py-2 rounded-lg"
            >
                <Upload size={20} />
                Subir Sílabus
            </Button>

            <ModalOverlay isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <BlurFade inView delay={0.1}>
                    <Card className="w-full max-w-md shadow-xl rounded-3xl border-0 bg-card">
                        <CardHeader className="space-y-2 pb-4">
                            <CardTitle className="text-2xl font-semibold text-center text-foreground">
                                <Typewriter text={["Subir o Actualizar Sílabus"]} speed={150} />
                            </CardTitle>
                            <p className="text-sm text-center text-muted-foreground mt-1">
                                Selecciona un curso y carga el archivo PDF del sílabus
                            </p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-foreground">
                                        Selecciona el Curso
                                    </Label>
                                    <div className="flex items-center gap-2 border rounded-lg px-3 py-2.5 bg-card focus-within:ring-2">
                                        <Book className="w-5 h-5 text-muted-foreground" />
                                        <SelectNative
                                            value={selectedCourseId}
                                            onChange={(e) => setSelectedCourseId(e.target.value)}
                                            required
                                            className="w-full border-0 focus-visible:ring-0 focus-visible:outline-none shadow-none text-foreground"
                                        >
                                            <option value="">-- Selecciona un curso de tu malla --</option>
                                            {coursesInCurriculum.map(course => (
                                                <option key={course._id} value={course._id}>{course.title}</option>
                                            ))}
                                        </SelectNative>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-foreground">
                                        Archivo PDF del Sílabus
                                    </Label>
                                    <div className="flex items-center gap-2 border rounded-lg px-3 py-2.5 bg-card focus-within:ring-2">
                                        <FileText className="w-5 h-5 text-muted-foreground" />
                                        <input 
                                            type="file" 
                                            accept=".pdf" 
                                            onChange={(e) => setSelectedFile(e.target.files[0])} 
                                            required
                                            className="w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-muted file:text-foreground hover:file:bg-muted/80"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 mt-6">
                                    <Button
                                        type="submit"
                                        variant="default"
                                        className="w-full py-3 rounded-lg font-medium shadow-md transition-colors"
                                    >
                                        Subir Sílabus
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </BlurFade>
            </ModalOverlay>
        </>
    );
};

// --- Componente Principal: Dashboard del Coordinador ---
const CoordinatorDashboard = () => {
    const dispatch = useDispatch();
    const { myCareer, isLoading } = useSelector((state) => state.careers);
    // catálogo global de cursos (similar a cómo LearningPage usa section.course)
    const allCourses = useSelector((state) => state.courses?.courses || []);
    const [selectedCareer, setSelectedCareer] = useState(null);
    const [myCareers, setMyCareers] = useState([]);
    
    useEffect(() => {
        dispatch(getMyCareer());
        dispatch(getCourses());

        return () => {
            dispatch(resetCareers());
            dispatch(resetCourses());
        }
    }, [dispatch]);

    // Actualizar estado cuando myCareer cambie
    useEffect(() => {
        if (myCareer) {
            // Si es un array, establecer múltiples carreras
            if (Array.isArray(myCareer)) {
                setMyCareers(myCareer);
                setSelectedCareer(myCareer[0] || null);
            } else {
                // Si es un objeto singular
                setMyCareers([myCareer]);
                setSelectedCareer(myCareer);
            }
        }
    }, [myCareer]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <h3 className="text-xl text-muted-foreground">Cargando datos del coordinador...</h3>
            </div>
        );
    }

    // Caso: Sin carreras asignadas
    if (!selectedCareer || (Array.isArray(myCareers) && myCareers.length === 0)) {
        return (
            <div className="container mx-auto px-4 py-8">
                <BlurFade inView delay={0.1}>
                    <Card className="shadow-lg rounded-2xl border p-12 text-center max-w-2xl mx-auto">
                        <div className="flex justify-center mb-4">
                            <div className="bg-yellow-100 dark:bg-yellow-900/20 p-4 rounded-full">
                                <AlertCircle className="w-12 h-12 text-yellow-600 dark:text-yellow-400" />
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold text-foreground mb-3">
                            Sin Carreras Asignadas
                        </h2>
                        <p className="text-lg text-muted-foreground mb-6">
                            No tienes ninguna carrera asignada como coordinador. Por favor, contacta a un administrador para que te asigne una carrera.
                        </p>
                        <div className="bg-muted p-4 rounded-lg">
                            <p className="text-sm text-muted-foreground">
                                Una vez que se te asigne una carrera, podrás gestionar su malla curricular, subir sílabus y administrar los cursos.
                            </p>
                        </div>
                    </Card>
                </BlurFade>
            </div>
        );
    }

    const currentCareer = selectedCareer;
    const allCoursesInCurriculum = currentCareer.curriculum ? currentCareer.curriculum.flatMap(cycle => cycle.courses) : [];
    const hasMultipleCareers = myCareers.length > 1;

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header Section */}
            <BlurFade inView delay={0.1}>
                <div className="mb-8">
                    {/* Selector de Carrera (solo si tiene múltiples) */}
                    {hasMultipleCareers && (
                        <div className="mb-6 p-4 bg-muted rounded-lg border">
                            <Label className="text-sm font-medium text-foreground block mb-3">
                                Selecciona una Carrera
                            </Label>
                            <div className="flex items-center gap-2 border rounded-lg px-3 py-2.5 bg-card focus-within:ring-2">
                                <GraduationCap className="w-5 h-5 text-muted-foreground" />
                                <SelectNative
                                    value={currentCareer._id}
                                    onChange={(e) => {
                                        const career = myCareers.find(c => c._id === e.target.value);
                                        setSelectedCareer(career);
                                    }}
                                    className="w-full border-0 focus-visible:ring-0 focus-visible:outline-none shadow-none text-foreground"
                                >
                                    {myCareers.map(career => (
                                        <option key={career._id} value={career._id}>
                                            {career.name}
                                        </option>
                                    ))}
                                </SelectNative>
                            </div>
                        </div>
                    )}

                    <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="flex items-start gap-3">
                            <div className="bg-card/50 p-2.5 rounded-lg">
                                {/* icono principal del header: resaltado con color primario en modo claro */}
                                <GraduationCap className="w-6 h-6 text-primary" />
                            </div>
                            <div className="flex-1">
                                <h1 className="text-3xl font-bold mb-2">Gestión de Carrera</h1>
                                <p className="text-xl text-foreground">{currentCareer.name}</p>
                                <p className="text-sm text-muted-foreground mt-1">{currentCareer.description}</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <CurriculumForm careerId={currentCareer._id} />
                            <SyllabusUploader coursesInCurriculum={allCoursesInCurriculum} />
                        </div>
                    </div>
                </div>
            </BlurFade>

            <hr className="mb-8 border" />

            {/* Curriculum Section */}
            <BlurFade inView delay={0.3}>
                <div>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="bg-card/50 p-2.5 rounded-lg backdrop-blur-sm">
                            {/* icono secundario: usar color muted para buen contraste en claro */}
                            <BookPlus className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <h2 className="text-2xl font-bold">Malla Curricular</h2>
                    </div>

                    {currentCareer.curriculum && currentCareer.curriculum.length > 0 ? (
                        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                            {currentCareer.curriculum.map((cycle, index) => (
                                <BlurFade key={cycle.cycleNumber} inView delay={0.4 + index * 0.1}>
                                    <Card className="shadow-lg rounded-2xl border hover:shadow-xl transition-shadow">
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                                <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                                                    {cycle.cycleNumber}
                                                </div>
                                                Ciclo {cycle.cycleNumber}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            {cycle.courses && cycle.courses.length > 0 ? (
                                                <ul className="space-y-2">
                                                    {cycle.courses.map((courseRef) => {
                                                        // courseRef puede ser id o objeto
                                                        const courseId = (typeof courseRef === "string") ? courseRef : (courseRef?._id || courseRef?.id);
                                                        const courseObj = (typeof courseRef === "object" && courseRef.title)
                                                            ? courseRef
                                                            : allCourses.find((c) => String(c._id) === String(courseId)) || {};

                                                        const title = courseObj.title || courseRef.title || "Curso sin título";
                                                        const shortDesc = courseObj.description || courseObj.summary || courseRef.description || "";
                                                        const syllabus = courseObj.syllabus || courseRef.syllabus || null;
                                                        const instructorName = courseObj.instructor?.name || courseRef.instructor?.name || null;
                                                        const modulesCount =
                                                          (Array.isArray(courseObj.modules) && courseObj.modules.length) ||
                                                          courseObj.modulesCount ||
                                                          courseObj.moduleCount ||
                                                          0;

                                                        return (
                                                          <li
                                                            key={courseId || courseRef._id || Math.random()}
                                                            className="flex flex-col sm:flex-row sm:items-start gap-2 text-sm text-foreground bg-muted p-3 rounded-lg"
                                                          >
                                                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                                              <Book className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                                                            </div>
                                                            <div className="flex-1">
                                                              <div className="flex items-center justify-between">
                                                                <div className="font-medium">{title}</div>
                                                                {syllabus ? (
                                                                  <a
                                                                    href={syllabus}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className="text-xs text-primary hover:underline ml-2"
                                                                  >
                                                                    Sílabus
                                                                  </a>
                                                                ) : null}
                                                              </div>
                                                              {shortDesc ? <div className="text-xs text-muted-foreground mt-1">{shortDesc}</div> : null}
                                                              <div className="mt-2 text-xs text-muted-foreground flex gap-4">
                                                                <div>{modulesCount} módulos</div>
                                                                {instructorName ? <div>Profesor: {instructorName}</div> : null}
                                                              </div>
                                                            </div>
                                                          </li>
                                                        );
                                                    })}
                                                </ul>
                                            ) : (
                                                <p className="text-sm text-muted-foreground italic">
                                                    No hay cursos asignados a este ciclo.
                                                </p>
                                            )}
                                        </CardContent>
                                    </Card>
                                </BlurFade>
                            ))}
                        </div>
                    ) : (
                        <Card className="shadow-lg rounded-2xl border p-8 text-center">
                            <p className="text-muted-foreground text-lg">
                                La malla curricular aún no ha sido definida.
                            </p>
                        </Card>
                    )}
                </div>
            </BlurFade>
        </div>
    );
};

// --- Estilos del Modal ---
const modalStyles = {
  overlay: {
    position: "fixed",
    inset: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0, 0, 0, 0.35)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1009,
    backdropFilter: "blur(2px)"
  },

  modalContent: {
    position: "relative",
    backgroundColor: "transparent",
    borderRadius: "20px",
    padding: "20px",
    width: "90%",
    maxWidth: "480px",
    maxHeight: "90vh",
    overflowY: "auto",
    boxShadow: "0px 8px 25px rgba(0,0,0,0.22)",
    zIndex: 10000
  },

  closeButton: {
    position: "absolute",
    top: "10px",
    right: "10px",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: "8px",
    borderRadius: "50%",
  },
};

export default CoordinatorDashboard;
