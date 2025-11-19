import React, { useState, useMemo } from "react";
import { useSelector } from "react-redux";
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
  // leer academic cycles para resolver nombres cuando las secciones traigan solo el id del ciclo
  const academicCycles = useSelector((state) => state.academicCycles?.cycles) || [];

  const [search, setSearch] = useState("");
  const [selectedPrerequisites, setSelectedPrerequisites] = useState(null);
  // se eliminaron los estados de secciones

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

  // handleViewSections eliminado (secciones removidas)

  // filteredSections eliminado

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
      <div className="my-6 p-4 border border-gray-700 rounded-lg bg-black shadow-sm overflow-x-auto">
        <div className="flex flex-wrap items-center justify-between mb-4 gap-4">
          <div className="flex gap-2 items-center">
            <Input
              placeholder="Buscar por nombre o ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64 bg-gray-900 text-white border-gray-700 placeholder-gray-400"
            />
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setSearch("")}
            className="bg-gray-800 text-white border-gray-700 hover:bg-gray-700"
          >
            Limpiar
          </Button>
        </div>

        <Table className="w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[260px] text-white">Nombre del Curso</TableHead>
              <TableHead className="w-[180px] text-white">ID</TableHead>
              <TableHead className="w-[140px] text-white">Creado</TableHead>
              <TableHead className="w-[140px] text-white">Actualizado</TableHead>
              <TableHead className="w-[140px] text-white">Prerrequisitos</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6 text-gray-400">
                  Cargando cursos...
                </TableCell>
              </TableRow>
            ) : filtered.length ? (
              filtered.map((c) => {
                return (
                  <TableRow key={c._id} className="border-gray-700">
                    <TableCell className="font-medium whitespace-nowrap">
                      <div className="text-sm font-medium text-white">{c.title}</div>
                    </TableCell>

                    <TableCell className="text-xs text-gray-300 font-mono">
                      {/* ...existing tooltip ID ... */}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <code className="bg-gray-800 px-2 py-1 rounded cursor-pointer hover:bg-gray-700">
                              {c._id?.substring(0, 12)}...
                            </code>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="bg-gray-800 border-gray-700">
                            <div className="text-xs text-white font-mono">{c._id}</div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>

                    <TableCell className="text-xs text-gray-300">
                      {formatDate(c.createdAt)}
                    </TableCell>

                    <TableCell className="text-xs text-gray-300">
                      {formatDate(c.updatedAt)}
                    </TableCell>

                    <TableCell>
                      {/* prerrequisitos (sin cambios) */}
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs text-gray-300 border-gray-700 hover:bg-gray-800 hover:text-white"
                        onClick={() => handleViewPrerequisites(c.prerequisites)}
                        disabled={!c.prerequisites || c.prerequisites.length === 0}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Ver ({c.prerequisites?.length || 0})
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
             ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6 text-gray-400">
                  No se encontraron cursos.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal de Prerrequisitos */}
      {selectedPrerequisites && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-2xl">
            <Card className="bg-white border border-gray-700 rounded-lg shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-gray-700">
                <CardTitle className="text-xl font-semibold text-black">
                  Cursos Prerrequisitos
                </CardTitle>
                <button
                  onClick={() => setSelectedPrerequisites(null)}
                  className="text-gray-400 hover:text-black transition-colors"
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
                        className="p-3 bg-[#eeeeee] rounded-lg border border-[#aaaaaa] hover:border-gray-600 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="text-sm font-semibold text-black">
                              {prereq.title}
                            </h4>
                            <p className="text-xs text-gray-400 mt-1 font-mono">
                              ID: {prereq._id}
                            </p>
                          </div>
                          <Badge className="bg-green-600 text-white text-xs ml-2 flex-shrink-0">
                            Requerido
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-400 py-4">
                    No hay cursos prerrequisitos.
                  </p>
                )}
                <div className="flex justify-end mt-6">
                  <Button
                    onClick={() => setSelectedPrerequisites(null)}
                    className="bg-gray-800 text-white hover:bg-gray-700 border border-gray-700"
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
