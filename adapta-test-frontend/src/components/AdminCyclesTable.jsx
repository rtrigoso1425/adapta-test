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
    <div className="my-6 p-4 border rounded-lg bg-card shadow-sm overflow-x-auto">
      <div className="flex flex-wrap items-center justify-between mb-4 gap-4">
        <div className="flex gap-2 items-center flex-wrap">
          <Input
            placeholder="Buscar por nombre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 bg-card text-foreground border rounded-lg transition-colors hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-slate-950 cursor-pointer"
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
        >
          Limpiar
        </Button>
      </div>

      <Table className="w-full">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px] text-foreground">Nombre</TableHead>
            <TableHead className="w-[180px] text-foreground">Fecha Inicio</TableHead>
            <TableHead className="w-[180px] text-foreground">Fecha Fin</TableHead>
            <TableHead className="w-[150px] text-foreground">Estado</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                Cargando ciclos...
              </TableCell>
            </TableRow>
          ) : filtered.length ? (
            filtered.map((c) => {
              const isActive = (c.isActive ?? c.active) === true;
              return (
                <TableRow key={c._id}>
                  <TableCell className="font-medium">
                    <div className="text-sm font-medium text-foreground">{c.name}</div>
                  </TableCell>

                  <TableCell className="text-xs text-muted-foreground">
                    {formatDate(c.startDate)}
                  </TableCell>

                  <TableCell className="text-xs text-muted-foreground">
                    {formatDate(c.endDate)}
                  </TableCell>

                  <TableCell>
                    <Badge className={isActive ? "bg-green-600 text-white dark:bg-green-500" : "bg-gray-500 text-white dark:bg-gray-600"}>
                      {isActive ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                No se encontraron ciclos.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
