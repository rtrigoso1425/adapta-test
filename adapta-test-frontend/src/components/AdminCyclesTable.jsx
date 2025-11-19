import React, { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/ui/tooltip";

export default function AdminCyclesTable() {
  const cycles = useSelector((state) => state.academicCycles?.cycles) || [];
  const isLoading = useSelector((state) => state.academicCycles?.isLoading);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all | active | inactive

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return cycles.filter((c) => {
      // búsqueda por texto
      const matchesText =
        !q ||
        (c.name && c.name.toLowerCase().includes(q));

      // filtro por estado
      const isActive = (c.isActive ?? c.active) === true;
      let matchesStatus = true;
      if (statusFilter === "active") matchesStatus = isActive;
      else if (statusFilter === "inactive") matchesStatus = !isActive;

      return matchesText && matchesStatus;
    });
  }, [cycles, search, statusFilter]);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  return (
    <div className="my-6 p-4 border border-gray-700 rounded-lg bg-black shadow-sm overflow-x-auto">
      <div className="flex flex-wrap items-center justify-between mb-4 gap-4">
        <div className="flex gap-2 items-center flex-wrap">
          <Input
            placeholder="Buscar por nombre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64 bg-gray-900 text-white border-gray-700 placeholder-gray-400"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-gray-900 text-white border border-gray-700 rounded-lg hover:border-gray-600 transition-colors"
          >
            <option value="all">Todos</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => { setSearch(""); setStatusFilter("all"); }}
          className="bg-gray-800 text-white border-gray-700 hover:bg-gray-700"
        >
          Limpiar
        </Button>
      </div>

      <Table className="w-full">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px] text-white">Nombre</TableHead>
            <TableHead className="w-[180px] text-white">Fecha Inicio</TableHead>
            <TableHead className="w-[180px] text-white">Fecha Fin</TableHead>
            <TableHead className="w-[150px] text-white">Estado</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-6 text-gray-400">
                Cargando ciclos...
              </TableCell>
            </TableRow>
          ) : filtered.length ? (
            filtered.map((c) => {
              const isActive = (c.isActive ?? c.active) === true;
              return (
                <TableRow key={c._id} className="border-gray-700">
                  <TableCell className="font-medium">
                    <div className="text-sm font-medium text-white">{c.name}</div>
                  </TableCell>

                  <TableCell className="text-xs text-gray-300">
                    {formatDate(c.startDate)}
                  </TableCell>

                  <TableCell className="text-xs text-gray-300">
                    {formatDate(c.endDate)}
                  </TableCell>

                  <TableCell>
                    <Badge className={isActive ? "bg-green-600 text-white" : "bg-gray-500 text-white"}>
                      {isActive ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-6 text-gray-400">
                No se encontraron ciclos.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
