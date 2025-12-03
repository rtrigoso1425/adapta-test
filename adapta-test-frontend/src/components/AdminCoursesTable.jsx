import React, { useState, useMemo, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getSectionsForCourse, reset as resetSections } from "../features/sections/sectionSlice";
// ...axios removed (no secciones por ahora)...
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/ui/tooltip";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { X, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

export default function AdminCoursesTable() {
  const courses = useSelector((state) => state.courses.courses) || [];
  const isLoading = useSelector((state) => state.courses.isLoading);
  const { user } = useSelector((state) => state.auth);
  const academicCycles = useSelector((state) => state.academicCycles?.cycles) || [];

  // sections slice (usado igual que CourseDetailPage)
  const { sections: storeSections = [], isLoading: sectionsLoading } = useSelector((state) => state.sections || {});
  const dispatch = useDispatch();

  const [search, setSearch] = useState("");
  const [selectedPrerequisites, setSelectedPrerequisites] = useState(null);
  const [selectedSections, setSelectedSections] = useState(null); // contenido mostrado en modal
  const [selectedCourseId, setSelectedCourseId] = useState(null); // track curso para el modal

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return courses.filter((c) => {
      return (
        !q ||
        (c.title && c.title.toLowerCase().includes(q)) ||
        (c._id && c._id.toLowerCase().includes(q))
      );
    });
  }, [courses, search]);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPrerequisiteCourses = (prerequisiteIds) => {
    if (!prerequisiteIds || prerequisiteIds.length === 0) return [];
    return prerequisiteIds
      .map((id) => courses.find((c) => c._id === id))
      .filter(Boolean);
  };

  const handleViewPrerequisites = (prerequisiteIds) => {
    setSelectedPrerequisites(getPrerequisiteCourses(prerequisiteIds));
  };

  // helper para normalizar secciones (acepta ids u objetos). Ajustar si tus secciones tienen otros campos.
  const getSections = (sectionsRef) => {
    if (!sectionsRef || sectionsRef.length === 0) return [];
    return sectionsRef
      .map((s) => {
        if (!s) return null;
        if (typeof s === "string") {
          // solo tenemos id
          return { _id: s, name: s, description: "", instructorName: null, capacity: null, cycle: null };
        }
        // s es un objeto de sección — priorizar fields reales que usa CourseDetailPage
        const name = s.sectionCode || s.code || s.name || s.title || s._id;
        const instructorName = s.instructor?.name || s.instructorName || (typeof s.instructor === "string" ? s.instructor : null);
        const capacity = s.capacity ?? s.maxStudents ?? s.limit ?? null;
        return {
          _id: s._id,
          name,
          description: s.description || s.desc || "",
          instructorName,
          capacity,
          cycle: s.cycle || s.academicCycle || null,
        };
      })
      .filter(Boolean);
  };

  // Si el curso trae secciones embebidas, contarlas; si no, contamos 0 (el fetch se hará al pedirlas)
  const getSectionsCount = (course) => {
    if (!course) return 0;
    if (Array.isArray(course.sections) && course.sections.length) return course.sections.length;
    return 0;
  };

  // handler: busca el curso por id y abre modal con sus secciones
  const handleViewSections = (courseId) => {
    if (!courseId) return;
    // limpiamos modal previo y guardamos id
    setSelectedSections(null);
    setSelectedCourseId(courseId);
    // despachamos exactamente como en CourseDetailPage
    dispatch(getSectionsForCourse(courseId));
  };

  // sincronizar el contenido mostrado en modal con lo que trae el store
  useEffect(() => {
    if (!selectedCourseId) return;
    // storeSections viene del slice y ya es array de objetos sección
    setSelectedSections(getSections(storeSections));
  }, [storeSections, selectedCourseId]);

  // cerrar modal de secciones y limpiar slice igual que en CourseDetailPage
  const closeSectionsModal = () => {
    setSelectedSections(null);
    setSelectedCourseId(null);
    dispatch(resetSections());
  };

  // helper para resolver nombre del ciclo (acepta id o objeto)
  const getCycleName = (cycleRef) => {
    if (!cycleRef) return "-";
    if (typeof cycleRef === "string") {
      const found = academicCycles.find((ac) => String(ac._id) === String(cycleRef));
      return found ? found.name : cycleRef;
    }
    if (typeof cycleRef === "object" && cycleRef.name) return cycleRef.name;
    return "-";
  };

  return (
    <>
      <div className="my-6 p-4 border rounded-lg bg-card shadow-sm overflow-x-auto">
        <div className="flex flex-wrap items-center justify-between mb-4 gap-4">
          <div className="flex gap-2 items-center">
            <Input
              placeholder="Buscar por nombre o ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64"
            />
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setSearch("")}
          >
            Limpiar
          </Button>
        </div>

        <Table className="w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[260px] text-foreground">Nombre del Curso</TableHead>
              <TableHead className="w-[180px] text-foreground">ID</TableHead>
              <TableHead className="w-[140px] text-foreground">Creado</TableHead>
              <TableHead className="w-[140px] text-foreground">Actualizado</TableHead>
              <TableHead className="w-[140px] text-foreground">Prerrequisitos</TableHead>
              {/* Nueva columna para secciones */}
              <TableHead className="w-[140px] text-foreground">Secciones</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                  Cargando cursos...
                </TableCell>
              </TableRow>
            ) : filtered.length ? (
              filtered.map((c) => {
                return (
                  <TableRow key={c._id}>
                    <TableCell className="font-medium whitespace-nowrap">
                      <div className="text-sm font-medium text-foreground">{c.title}</div>
                    </TableCell>

                    <TableCell className="text-xs text-muted-foreground font-mono">
                      {/* ...existing tooltip ID ... */}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <code className="px-2 py-1 rounded cursor-pointer bg-transparent border">
                              {c._id?.substring(0, 12)}...
                            </code>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="bg-popover text-foreground border">
                            <div className="text-xs text-foreground font-mono">{c._id}</div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>

                    <TableCell className="text-xs text-muted-foreground">
                      {formatDate(c.createdAt)}
                    </TableCell>

                    <TableCell className="text-xs text-muted-foreground">
                      {formatDate(c.updatedAt)}
                    </TableCell>

                    <TableCell>
                      {/* prerrequisitos (sin cambios) */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewPrerequisites(c.prerequisites)}
                        disabled={!c.prerequisites || c.prerequisites.length === 0}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Ver ({c.prerequisites?.length || 0})
                      </Button>
                    </TableCell>

                    {/* Nueva celda para ver secciones (abre modal usando el mismo action que CourseDetailPage) */}
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewSections(c._id)}
                        // permitimos pedir secciones incluso si no están pre-cargadas
                        disabled={false}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Ver ({getSectionsCount(c)})
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
             ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                  No se encontraron cursos.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal de Prerrequisitos */}
      {selectedPrerequisites && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-2xl">
            <Card className="bg-card border rounded-lg shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
                <CardTitle className="text-xl font-semibold text-foreground">
                  Cursos Prerrequisitos
                </CardTitle>
                <button
                  onClick={() => setSelectedPrerequisites(null)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X size={24} />
                </button>
              </CardHeader>
              <CardContent className="pt-4">
                {selectedPrerequisites.length > 0 ? (
                  <div className="space-y-3">
                    {selectedPrerequisites.map((prereq) => (
                      <div
                        key={prereq._id}
                        className="p-3 rounded-lg border hover:border-gray-300 transition-colors bg-card"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="text-sm font-semibold text-foreground">
                              {prereq.title}
                            </h4>
                            <p className="text-xs text-muted-foreground mt-1 font-mono">
                              ID: {prereq._id}
                            </p>
                          </div>
                          <Badge className="bg-green-600 text-white text-xs ml-2 flex-shrink-0 dark:bg-green-500">
                            Requerido
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-4">
                    No hay cursos prerrequisitos.
                  </p>
                )}
                <div className="flex justify-end mt-6">
                  <Button
                    onClick={() => setSelectedPrerequisites(null)}
                  >
                    Cerrar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Modal de Secciones (igual estilo que prerrequisitos) */}
      {selectedSections && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-2xl">
            <Card className="bg-card border rounded-lg shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
                <CardTitle className="text-xl font-semibold text-foreground">
                  Secciones Disponibles
                </CardTitle>
                <button
                  onClick={closeSectionsModal}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X size={24} />
                </button>
              </CardHeader>
              <CardContent className="pt-4">
                {selectedSections.length > 0 ? (
                  <div className="space-y-3">
                    {selectedSections.map((sec) => (
                      <div
                        key={sec._id}
                        className="p-3 rounded-lg border hover:border-gray-300 transition-colors bg-card"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="text-sm font-semibold text-foreground">
                              {sec.name}
                            </h4>
                            <p className="text-xs text-muted-foreground mt-1 font-mono">
                              ID: {sec._id}
                            </p>
                            {sec.instructorName ? (
                              <p className="text-xs text-muted-foreground mt-1">
                                Instructor: {sec.instructorName}
                              </p>
                            ) : null}
                            {sec.capacity !== null ? (
                              <p className="text-xs text-muted-foreground mt-1">
                                Capacidad: {sec.capacity}
                              </p>
                            ) : null}
                            {sec.description ? (
                              <p className="text-xs text-muted-foreground mt-1">
                                {sec.description}
                              </p>
                            ) : null}
                            <p className="text-xs text-muted-foreground mt-1">
                              Ciclo: {getCycleName(sec.cycle)}
                            </p>
                          </div>
                          <Badge className="bg-blue-600 text-white text-xs ml-2 flex-shrink-0 dark:bg-blue-500">
                            Sección
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-4">
                    {sectionsLoading ? "Cargando secciones..." : "No hay secciones disponibles."}
                  </p>
                )}
                <div className="flex justify-end mt-6">
                  <Button
                    onClick={closeSectionsModal}
                  >
                    Cerrar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </>
  );
}
