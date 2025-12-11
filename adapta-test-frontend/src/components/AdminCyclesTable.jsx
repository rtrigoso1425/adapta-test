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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
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
      {/* Cambio principal aquí: flex-row simple, items-center y gap pequeño */}
      <div className="flex flex-wrap justify-between items-center gap-3 mb-4 w-fit">
          <Input
            placeholder="Buscar por nombre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            // w-auto permite que el input sea compacto, o puedes usar w-[250px] para un tamaño fijo
            className="w-[250px]" 
          />
          
          <Select
            value={statusFilter}
            onValueChange={(val) => setStatusFilter(val)}
          >
            {/* w-[150px] para que el select tenga un ancho controlado y no ocupe todo */}
            <SelectTrigger className="w-[150px] px-3 py-2.5 bg-card text-foreground border rounded-lg transition-colors hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-slate-950 cursor-pointer">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="active">Activos</SelectItem>
              <SelectItem value="inactive">Inactivos</SelectItem>
            </SelectContent>
          </Select>

          <Button 
            variant="outline" 
            size="sm" // size="icon" podría ser útil si solo usas un icono, pero sm está bien
            onClick={() => { setSearch(""); setStatusFilter("all"); }}
            className="h-10" // Asegura que tenga la misma altura visual que los inputs si es necesario
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
