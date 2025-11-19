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
    Plus 
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
        return <p className="text-center text-gray-600">Cargando lista de cursos...</p>;
    }

    return (
        <>
            <Button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800"
            >
                <Plus size={20} />
                Añadir Curso a la Malla
            </Button>
            
            <ModalOverlay isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <BlurFade inView delay={0.1}>
                    <Card className="w-full max-w-md shadow-xl rounded-3xl border-0 bg-white">
                      <CardHeader className="space-y-2 pb-4">
                            <CardTitle className="text-2xl font-semibold text-center text-gray-900">
                                <Typewriter text={["Añadir Curso a la Malla"]} speed={150} />
                            </CardTitle>
                            <p className="text-sm text-center text-gray-500 mt-1">
                                Selecciona un curso del catálogo y asígnalo a un ciclo
                            </p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <form onSubmit={onSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700">
                                        Curso
                                    </Label>
                                    <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2.5 bg-white focus-within:ring-2 focus-within:ring-gray-200">
                                        <Book className="w-5 h-5 text-gray-400" />
                                        <SelectNative
                                            value={selectedCourse}
                                            onChange={(e) => setSelectedCourse(e.target.value)}
                                            required
                                            className="w-full border-0 focus-visible:ring-0 focus-visible:outline-none shadow-none text-black"
                                        >
                                            <option value="">-- Selecciona un curso del catálogo --</option>
                                            {courses.map(course => (
                                                <option key={course._id} value={course._id}>{course.title}</option>
                                            ))}
                                        </SelectNative>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700">
                                        Número de Ciclo
                                    </Label>
                                    <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2.5 bg-white focus-within:ring-2 focus-within:ring-gray-200">
                                        <BookPlus className="w-5 h-5 text-gray-400" />
                                        <Input
                                            type="number"
                                            min="1"
                                            value={cycleNumber}
                                            onChange={(e) => setCycleNumber(e.target.value)}
                                            placeholder="Ej. 1"
                                            required
                                            className="w-full border-0 focus-visible:ring-0 focus-visible:outline-none shadow-none text-black"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 mt-6">
                                    <Button
                                        type="submit"
                                        className="w-full py-3 rounded-lg text-white bg-black hover:bg-gray-800 font-medium shadow-md transition-colors"
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
                className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800"
            >
                <Upload size={20} />
                Subir Sílabus
            </Button>

            <ModalOverlay isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <BlurFade inView delay={0.1}>
                    <Card className="w-full max-w-md shadow-xl rounded-3xl border-0 bg-white">
                        <CardHeader className="space-y-2 pb-4">
                            <CardTitle className="text-2xl font-semibold text-center text-gray-900">
                                <Typewriter text={["Subir o Actualizar Sílabus"]} speed={150} />
                            </CardTitle>
                            <p className="text-sm text-center text-gray-500 mt-1">
                                Selecciona un curso y carga el archivo PDF del sílabus
                            </p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700">
                                        Selecciona el Curso
                                    </Label>
                                    <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2.5 bg-white focus-within:ring-2 focus-within:ring-gray-200">
                                        <Book className="w-5 h-5 text-gray-400" />
                                        <SelectNative
                                            value={selectedCourseId}
                                            onChange={(e) => setSelectedCourseId(e.target.value)}
                                            required
                                            className="w-full border-0 focus-visible:ring-0 focus-visible:outline-none shadow-none text-black"
                                        >
                                            <option value="">-- Selecciona un curso de tu malla --</option>
                                            {coursesInCurriculum.map(course => (
                                                <option key={course._id} value={course._id}>{course.title}</option>
                                            ))}
                                        </SelectNative>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700">
                                        Archivo PDF del Sílabus
                                    </Label>
                                    <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2.5 bg-white focus-within:ring-2 focus-within:ring-gray-200">
                                        <FileText className="w-5 h-5 text-gray-400" />
                                        <input 
                                            type="file" 
                                            accept=".pdf" 
                                            onChange={(e) => setSelectedFile(e.target.files[0])} 
                                            required
                                            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 mt-6">
                                    <Button
                                        type="submit"
                                        className="w-full py-3 rounded-lg text-white bg-black hover:bg-gray-800 font-medium shadow-md transition-colors"
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
    
    useEffect(() => {
        dispatch(getMyCareer());
        dispatch(getCourses());

        return () => {
            dispatch(resetCareers());
            dispatch(resetCourses());
        }
    }, [dispatch]);

    if (isLoading || !myCareer) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <h3 className="text-xl text-gray-600">Cargando datos del coordinador...</h3>
            </div>
        );
    }

    const allCoursesInCurriculum = myCareer.curriculum.flatMap(cycle => cycle.courses);

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header Section */}
            <BlurFade inView delay={0.1}>
                <div className="mb-8">
                    <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="flex items-start gap-3">
                            <div className="bg-black/10 p-2.5 rounded-lg backdrop-blur-sm">
                                <GraduationCap className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                                <h1 className="text-3xl font-bold mb-2">Gestión de Carrera</h1>
                                <p className="text-xl text-gray-700">{myCareer.name}</p>
                                <p className="text-sm text-gray-500 mt-1">{myCareer.description}</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <CurriculumForm careerId={myCareer._id} />
                            <SyllabusUploader coursesInCurriculum={allCoursesInCurriculum} />
                        </div>
                    </div>
                </div>
            </BlurFade>

            <hr className="mb-8 border-gray-300" />

            {/* Curriculum Section */}
            <BlurFade inView delay={0.3}>
                <div>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="bg-black/10 p-2.5 rounded-lg backdrop-blur-sm">
                            <BookPlus className="w-6 h-6" />
                        </div>
                        <h2 className="text-2xl font-bold">Malla Curricular</h2>
                    </div>

                    {myCareer.curriculum && myCareer.curriculum.length > 0 ? (
                        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                            {myCareer.curriculum.map((cycle, index) => (
                                <BlurFade key={cycle.cycleNumber} inView delay={0.4 + index * 0.1}>
                                    <Card className="shadow-lg rounded-2xl border border-gray-200 hover:shadow-xl transition-shadow">
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                                <div className="bg-black text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                                                    {cycle.cycleNumber}
                                                </div>
                                                Ciclo {cycle.cycleNumber}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            {cycle.courses && cycle.courses.length > 0 ? (
                                                <ul className="space-y-2">
                                                    {cycle.courses.map(course => (
                                                        <li 
                                                            key={course._id}
                                                            className="flex items-start gap-2 text-sm text-gray-700 bg-gray-50 p-2 rounded-lg"
                                                        >
                                                            <Book className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                                            <span>{course.title}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <p className="text-sm text-gray-500 italic">
                                                    No hay cursos asignados a este ciclo.
                                                </p>
                                            )}
                                        </CardContent>
                                    </Card>
                                </BlurFade>
                            ))}
                        </div>
                    ) : (
                        <Card className="shadow-lg rounded-2xl border border-gray-200 p-8 text-center">
                            <p className="text-gray-500 text-lg">
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
    inset: 0, // top:0 left:0 right:0 bottom:0
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0, 0, 0, 0.35)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1009, // por encima de cualquier layout
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