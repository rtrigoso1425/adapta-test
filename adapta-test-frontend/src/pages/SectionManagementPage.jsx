import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, Link } from "react-router-dom";
import { createPortal } from "react-dom";
import { BlurFade } from "../components/ui/blur-fade";
import { Card, CardHeader, CardContent, CardTitle } from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Typewriter } from "../components/ui/typewriter-text";
import { ArrowLeft, GraduationCap, Plus, X, Book, FileText, ChevronDown, ChevronUp } from "lucide-react";

// --- Acciones de Redux ---
import {
  getSectionAnalytics,
  reset as resetAnalytics,
} from "../features/analytics/analyticsSlice";

import {
  getGradingPreview,
  processSectionGrades,
  reset as resetGrading,
} from "../features/grading/gradingSlice";

import {
  getSectionDetails,
  reset as resetLearning,
} from "../features/learning/learningSlice";
import {
  getModulesForSection,
  createAndPublishModuleToSection,
  reset as resetContent,
  getLessonsForModule, // <-- usar action del slice para cargar lecciones
} from "../features/content/contentSlice";
import {
  getAssignmentsForSection,
  createAssignment,
  reset as resetAssignments,
} from "../features/assignments/assignmentSlice";
import {
  getSubmissionsForAssignment,
  gradeSubmission,
  reset as resetSubmissions,
} from "../features/submissions/submissionSlice";
import { updateApprovalCriteria } from "../features/sections/sectionSlice";

// ===================================================================================
//  MODAL OVERLAY COMPONENT (reutilizable)
// ===================================================================================
const ModalOverlay = ({ isOpen, onClose, children }) => {
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen) return null;

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

// ===================================================================================
//  COMPONENTE: Modal para Crear Módulo
// ===================================================================================
const CreateModuleModal = ({ sectionId, isOpen, onClose }) => {
  const dispatch = useDispatch();
  const [moduleTitle, setModuleTitle] = useState("");
  const { isLoading } = useSelector((state) => state.content);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (moduleTitle.trim()) {
      dispatch(
        createAndPublishModuleToSection({
          sectionId,
          moduleData: { title: moduleTitle },
        })
      );
      setModuleTitle("");
      onClose();
    }
  };

  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose}>
      <BlurFade inView delay={0.1}>
        <Card className="w-full max-w-md shadow-xl rounded-3xl border-0 bg-card">
          <CardHeader className="space-y-2 pb-4">
            <CardTitle className="text-2xl font-semibold text-center text-foreground">
              <Typewriter text={["Crear Nuevo Módulo"]} speed={150} />
            </CardTitle>
            <p className="text-sm text-center text-muted-foreground mt-1">
              Añade un nuevo módulo a esta sección
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">
                  Título del Módulo
                </Label>
                <div className="flex items-center gap-2 border rounded-lg px-3 py-2.5 bg-card focus-within:ring-2">
                  <Input
                    type="text"
                    value={moduleTitle}
                    onChange={(e) => setModuleTitle(e.target.value)}
                    placeholder="Ej. Introducción a JavaScript"
                    required
                    className="w-full border-0 focus-visible:ring-0 focus-visible:outline-none shadow-none text-foreground"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="w-full"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="default"
                  disabled={isLoading}
                  className="w-full py-2"
                >
                  {isLoading ? "Creando..." : "Crear Módulo"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </BlurFade>
    </ModalOverlay>
  );
};

// ===================================================================================
//  COMPONENTE: Modal para Crear Lección
// ===================================================================================
const CreateLessonModal = ({ moduleId, isOpen, onClose, onLessonCreated }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth); // ✅ ARREGLADO: Obtener usuario desde Redux
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [contentType, setContentType] = useState("text");
  const [fileUrl, setFileUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Obtener el token desde Redux store (usuario autenticado)
      const token = user?.token || localStorage.getItem("token");
      
      if (!token) {
        throw new Error("No se encontró el token de autenticación. Por favor, inicia sesión nuevamente.");
      }
      
      const lessonData = {
        title,
        content,
        contentType,
      };

      // Solo incluir fileUrl si tiene valor
      if (fileUrl.trim()) {
        lessonData.fileUrl = fileUrl;
      }

      // Hacer la petición usando el patrón correcto
      const response = await fetch(`/api/modules/${moduleId}/lessons`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify(lessonData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al crear la lección");
      }

      const newLesson = await response.json();
      onLessonCreated(newLesson);
      
      // Resetear formulario
      setTitle("");
      setContent("");
      setContentType("text");
      setFileUrl("");
      onClose();
    } catch (error) {
      console.error("Error:", error);
      alert("Error al crear la lección: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose}>
      <BlurFade inView delay={0.1}>
        <Card className="w-full max-w-md shadow-xl rounded-3xl border-0 bg-card">
          <CardHeader className="space-y-2 pb-4">
            <CardTitle className="text-2xl font-semibold text-center text-foreground">
              <Typewriter text={["Crear Nueva Lección"]} speed={150} />
            </CardTitle>
            <p className="text-sm text-center text-muted-foreground mt-1">
              Añade contenido educativo al módulo
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">
                  Título de la Lección
                </Label>
                <Input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej. Variables y Tipos de Datos"
                  required
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">
                  Tipo de Contenido
                </Label>
                <select
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-card text-foreground"
                >
                  <option value="text">Texto</option>
                  <option value="video">Video</option>
                  <option value="pdf">PDF</option>
                  <option value="link">Enlace</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">
                  Contenido
                </Label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Escribe el contenido de la lección..."
                  className="w-full px-3 py-2.5 border rounded-lg bg-card text-foreground focus-visible:ring-2 focus-visible:outline-none min-h-[120px]"
                  required
                />
              </div>

              {(contentType === "video" || contentType === "pdf" || contentType === "link") && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">
                    URL del Archivo/Recurso
                  </Label>
                  <Input
                    type="url"
                    value={fileUrl}
                    onChange={(e) => setFileUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full"
                  />
                </div>
              )}

              <div className="flex justify-end gap-3 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="w-full"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="default"
                  disabled={isLoading}
                  className="w-full py-2"
                >
                  {isLoading ? "Creando..." : "Crear Lección"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </BlurFade>
    </ModalOverlay>
  );
};

// ===================================================================================
//  COMPONENTE: Modal para Crear Pregunta en un módulo (NUEVO)
// ===================================================================================
const CreateQuestionModal = ({ moduleId, isOpen, onClose, onQuestionCreated }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth || {});
  const [questionText, setQuestionText] = useState("");
  const [optionsText, setOptionsText] = useState(""); // cada línea = una opción
  const [correctIndex, setCorrectIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = user?.token || localStorage.getItem("token");
      if (!token) {
        throw new Error("No autenticado. Por favor inicia sesión.");
      }

      // Parsear opciones: separar por saltos de línea y limpiar espacios
      const options = optionsText
        .split("\n")
        .map((o) => o.trim())
        .filter((o) => o.length > 0);

      if (options.length < 2) {
        throw new Error("Necesitas al menos 2 opciones.");
      }

      if (correctIndex < 0 || correctIndex >= options.length) {
        throw new Error("Índice de opción correcta inválido.");
      }

      const payload = {
        questionText,
        options,
        correctAnswer: options[correctIndex],
        difficulty: "medium", // o lo puedes hacer dinámico si quieres
      };

      const res = await fetch(`/api/modules/${moduleId}/questions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Error creando pregunta");
      }

      const newQuestion = await res.json();
      onQuestionCreated(newQuestion);

      // Limpiar formulario
      setQuestionText("");
      setOptionsText("");
      setCorrectIndex(0);
      onClose();
    } catch (error) {
      console.error("Error:", error);
      alert("Error creando pregunta: " + (error.message || error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose}>
      <BlurFade inView delay={0.1}>
        <Card className="w-full max-w-md shadow-xl rounded-3xl border-0 bg-card">
          <CardHeader className="space-y-2 pb-4">
            <CardTitle className="text-2xl font-semibold text-center text-foreground">
              <Typewriter text={["Crear Nueva Pregunta"]} speed={150} />
            </CardTitle>
            <p className="text-sm text-center text-muted-foreground mt-1">
              Añade una pregunta al banco del módulo
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">
                  Texto de la Pregunta
                </Label>
                <textarea
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="Ej. ¿Cuál es la capital de Francia?"
                  required
                  className="w-full px-3 py-2.5 border rounded-lg bg-card text-foreground focus-visible:ring-2 focus-visible:outline-none min-h-[80px]"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">
                  Opciones (una por línea)
                </Label>
                <textarea
                  value={optionsText}
                  onChange={(e) => setOptionsText(e.target.value)}
                  placeholder={"París\nLondres\nBerlín\nMadrid"}
                  required
                  className="w-full px-3 py-2.5 border rounded-lg bg-card text-foreground focus-visible:ring-2 focus-visible:outline-none min-h-[100px]"
                />
                <p className="text-xs text-muted-foreground">
                  Escribe cada opción en una línea separada
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">
                  Selecciona la Opción Correcta
                </Label>
                <select
                  value={correctIndex}
                  onChange={(e) => setCorrectIndex(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {optionsText
                    .split("\n")
                    .map((o) => o.trim())
                    .filter((o) => o.length > 0)
                    .map((option, idx) => (
                      <option key={idx} value={idx}>
                        {idx + 1}. {option}
                      </option>
                    ))}
                </select>
                <p className="text-xs text-muted-foreground">
                  Usa el índice (0, 1, 2, etc.) para indicar cuál es la opción correcta
                </p>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="w-full"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="default"
                  disabled={isLoading}
                  className="w-full py-2"
                >
                  {isLoading ? "Creando..." : "Crear Pregunta"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </BlurFade>
    </ModalOverlay>
  );
};

// ===================================================================================
//  COMPONENTE: Item de Módulo con Lecciones y Banco de Preguntas (ACTUALIZADO)
// ===================================================================================
const ModuleItemWithLessons = ({ module, index }) => {
  const dispatch = useDispatch();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCreateLessonOpen, setIsCreateLessonOpen] = useState(false);
  const [isCreateQuestionOpen, setIsCreateQuestionOpen] = useState(false);
  const [questions, setQuestions] = useState(module?.questionBank ? [...module.questionBank] : []);

  // tomar lecciones desde el slice content.lessonsByModule
  const lessonsFromStore = useSelector((state) => state.content?.lessonsByModule?.[module._id] || []);
  const isLoadingLessons = useSelector((state) => state.content?.loadingLessons?.[module._id]) || false;

  useEffect(() => {
    // si el prop module.questionBank cambia, sincronizar
    if (module?.questionBank) setQuestions([...module.questionBank]);
  }, [module?.questionBank]);

  const handleToggleExpand = () => {
    // al expandir, pedir lecciones a través del action creator
    if (!isExpanded) {
      dispatch(getLessonsForModule(module._id));
    }
    setIsExpanded(!isExpanded);
  };

  const handleLessonCreated = (newLesson) => {
    // refrescar lecciones desde el servidor / store para mantener coherencia
    dispatch(getLessonsForModule(module._id));
  };

  const handleQuestionCreated = (newQuestion) => {
    // Añadir localmente la pregunta para verla inmediatamente
    setQuestions((prev) => [...prev, newQuestion]);
  };

  return (
    <Card className="overflow-hidden border border-border hover:border-primary/50 transition-colors duration-200 bg-card">
      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Module Number Badge */}
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
            <span className="text-lg font-bold text-primary">
              {index + 1}
            </span>
          </div>

          {/* Module Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-foreground">
                {module.title}
              </h3>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsCreateLessonOpen(true)}
                  className="flex items-center gap-1"
                >
                  <Plus size={16} />
                  Lección
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleToggleExpand}
                  className="flex items-center gap-1"
                >
                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  {isExpanded ? "Ocultar" : "Ver"} Contenido
                </Button>
              </div>
            </div>

            {/* Expanded Content: Lecciones y Banco de Preguntas */}
            {isExpanded && (
              <div className="mt-4 space-y-4">
                {/* Sección de Lecciones */}
                <div className="pl-4 border-l-2 border-primary/30">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText size={16} className="text-primary" />
                    <h4 className="font-medium text-foreground">Lecciones</h4>
                  </div>
                  
                  {isLoadingLessons ? (
                    <p className="text-sm text-muted-foreground pl-4">Cargando lecciones...</p>
                  ) : lessonsFromStore && lessonsFromStore.length > 0 ? (
                    <div className="space-y-3 pl-4">
                      {lessonsFromStore.map((lesson) => (
                        <div
                          key={lesson._id}
                          className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <FileText size={14} className="text-primary" />
                          </div>
                          <div className="flex-1">
                            <h5 className="font-medium text-foreground text-sm">
                              {lesson.title}
                            </h5>
                            <p className="text-xs text-muted-foreground mt-1">
                              Tipo: {lesson.contentType}
                            </p>
                            {lesson.content && (
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                {lesson.content}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 pl-4">
                      <p className="text-sm text-muted-foreground mb-2">
                        No hay lecciones en este módulo
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsCreateLessonOpen(true)}
                        className="flex items-center gap-1 mx-auto"
                      >
                        <Plus size={14} />
                        Crear Primera Lección
                      </Button>
                    </div>
                  )}
                </div>

                {/* Sección de Banco de Preguntas */}
                <div className="pl-4 border-l-2 border-primary/30">
                  <div className="flex items-center gap-2 mb-3">
                    <Book size={16} className="text-primary" />
                    <h4 className="font-medium text-foreground">Banco de Preguntas</h4>
                  </div>

                  {questions && questions.length > 0 ? (
                    <div className="space-y-2 pl-4">
                      {questions.map((question, qIndex) => (
                        <div
                          key={question._id || qIndex}
                          className="p-3 rounded-lg border border-border bg-card/50 hover:bg-accent/30 transition-colors"
                        >
                          <p className="text-sm text-foreground">{question.questionText}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic pl-4">
                      No hay preguntas aún
                    </p>
                  )}

                  {/* Botón para añadir preguntas */}
                  <div className="pt-3 pl-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setIsCreateQuestionOpen(true)}
                      className="w-full border-dashed hover:border-solid"
                    >
                      <Plus size={14} className="mr-2" />
                      Añadir Pregunta
                    </Button>
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Lesson Modal */}
      <CreateLessonModal
        moduleId={module._id}
        isOpen={isCreateLessonOpen}
        onClose={() => setIsCreateLessonOpen(false)}
        onLessonCreated={handleLessonCreated}
      />

      {/* Create Question Modal */}
      <CreateQuestionModal
        moduleId={module._id}
        isOpen={isCreateQuestionOpen}
        onClose={() => setIsCreateQuestionOpen(false)}
        onQuestionCreated={handleQuestionCreated}
      />
    </Card>
  );
};

const ModulesTab = ({ sectionId }) => {
  const dispatch = useDispatch();
  const { modules, isLoading } = useSelector((state) => state.content);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    if (sectionId) {
      dispatch(getModulesForSection(sectionId));
    }
    return () => {
      dispatch(resetContent());
    };
  }, [dispatch, sectionId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground">Cargando módulos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Módulos del Curso</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Gestiona el contenido educativo organizado en módulos y lecciones
          </p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          variant="default"
          className="flex items-center gap-2 px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <Plus size={18} />
          Nuevo Módulo
        </Button>
      </div>

      {/* Modules List */}
      {modules.length > 0 ? (
        <div className="space-y-4">
          {modules.map((module, index) => (
            <BlurFade key={module._id} delay={0.1 + index * 0.05} inView>
              <ModuleItemWithLessons module={module} index={index} />
            </BlurFade>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center bg-muted/30 border-2 border-dashed border-muted-foreground/25">
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto">
              <Book className="w-10 h-10 text-muted-foreground/50" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No hay módulos aún
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Este curso aún no tiene módulos publicados. Crea el primer módulo para comenzar a estructurar el contenido educativo.
              </p>
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                variant="default"
                className="flex items-center gap-2 mx-auto"
              >
                <Plus size={18} />
                Crear Primer Módulo
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Create Module Modal */}
      <CreateModuleModal
        sectionId={sectionId}
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
};

// ===================================================================================
//  COMPONENTE PRINCIPAL: Página de Gestión de Sección
// ===================================================================================
const SectionManagementPage = () => {
  const { id: sectionId } = useParams();
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("modules");
  const { section, isLoading: isLoadingSection } = useSelector(
    (state) => state.learning
  );

  useEffect(() => {
    dispatch(getSectionDetails(sectionId));
    return () => {
      dispatch(resetLearning());
    };
  }, [dispatch, sectionId]);

  if (isLoadingSection || !section) {
    return <h1>Cargando datos de la sección...</h1>;
  }

  return (
    <div className="container mx-auto px-2 py-2">
      <BlurFade inView delay={0.1}>
        <div className="mb-6">
          <Button asChild variant="outline" size="sm" className="mb-4">
            <Link to="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Dashboard
            </Link>
          </Button>

          <div className="flex items-start gap-4">
            <div className="bg-card/50 p-2.5 rounded-lg flex-shrink-0">
              <GraduationCap className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold">
                Gestionando: {section.course.title}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Sección {section.sectionCode} • Prof.{" "}
                {section.instructor?.name || "-"}
              </p>
              {section.course?.syllabus && (
                <a
                  href={`http://localhost:5000${section.course.syllabus}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline inline-block mt-2"
                >
                  Ver Sílabus Oficial
                </a>
              )}
            </div>
          </div>
        </div>
      </BlurFade>

      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab("modules")}
            className={`px-3 py-2 rounded-md ${
              activeTab === "modules"
                ? "bg-primary text-primary-foreground"
                : "bg-card/50 text-foreground"
            }`}
          >
            Módulos y Contenido
          </button>
          <button
            onClick={() => setActiveTab("assignments")}
            className={`px-3 py-2 rounded-md ${
              activeTab === "assignments"
                ? "bg-primary text-primary-foreground"
                : "bg-card/50 text-foreground"
            }`}
          >
            Tareas
          </button>
          <button
            onClick={() => setActiveTab("grading")}
            className={`px-3 py-2 rounded-md ${
              activeTab === "grading"
                ? "bg-primary text-primary-foreground"
                : "bg-card/50 text-foreground"
            }`}
          >
            Criterios de Aprobación
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`px-3 py-2 rounded-md ${
              activeTab === "analytics"
                ? "bg-primary text-primary-foreground"
                : "bg-card/50 text-foreground"
            }`}
          >
            Analíticas
          </button>
        </div>
      </div>

      <div>
        {activeTab === "modules" && (
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Módulos y Contenido</CardTitle>
            </CardHeader>
            <CardContent>
              <ModulesTab sectionId={section._id} />
            </CardContent>
          </Card>
        )}

        {activeTab === "assignments" && (
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Gestión de Tareas</CardTitle>
            </CardHeader>
            <CardContent>
              <AssignmentsTab sectionId={section._id} />
            </CardContent>
          </Card>
        )}

        {activeTab === "grading" && (
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Criterios de Aprobación</CardTitle>
            </CardHeader>
            <CardContent>
              <FinalGradingTab section={section} />
            </CardContent>
          </Card>
        )}

        {activeTab === "analytics" && (
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Analíticas</CardTitle>
            </CardHeader>
            <CardContent>
              <AnalyticsTab sectionId={section._id} />
            </CardContent>
          </Card>
        )}
      </div>
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
    backdropFilter: "blur(2px)",
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
    zIndex: 10000,
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
    border: "1px solid transparent",
    background: "none",
    cursor: "pointer",
    borderBottom: "2px solid transparent",
  },
  activeNavButton: { fontWeight: "bold", borderBottom: "2px solid #007bff" },
  modalOverlay: {
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
  modalContent: {
    background: "white",
    padding: "25px",
    borderRadius: "8px",
    width: "90%",
    maxWidth: "800px",
    position: "relative",
  },
};

export default SectionManagementPage;
