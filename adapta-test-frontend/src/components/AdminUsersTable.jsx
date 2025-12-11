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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { cn } from "../lib/utils";

const rolesOrder = ["admin", "coordinator", "professor", "student", "parent"];

const getRoleBadgeStyle = (role) => {
  const styles = {
    admin: "bg-red-600 text-white dark:bg-red-500 dark:text-white",
    coordinator: "bg-purple-600 text-white dark:bg-purple-500 dark:text-white",
    professor: "bg-blue-600 text-white dark:bg-blue-500 dark:text-white",
    student: "bg-green-600 text-white dark:bg-green-500 dark:text-white",
    parent: "bg-orange-600 text-white dark:bg-orange-500 dark:text-white",
  };
  return styles[role] || "bg-gray-400 text-white dark:bg-gray-500 dark:text-white";
};

export default function AdminUsersTable() {
  const users = useSelector((state) => state.users.users) || [];
  const isLoading = useSelector((state) => state.users.isLoading);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const availableRoles = useMemo(() => {
    const setR = new Set(users.map((u) => u.role).filter(Boolean));
    return Array.from(setR).sort((a, b) => rolesOrder.indexOf(a) - rolesOrder.indexOf(b));
  }, [users]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      const matchesRole = roleFilter ? u.role === roleFilter : true;
      const matchesQuery =
        !q ||
        (u.name && u.name.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q));
      return matchesRole && matchesQuery;
    });
  }, [users, search, roleFilter]);

  const handleCopyEmail = (email) => {
    navigator.clipboard.writeText(email).catch(() => {});
  };

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

  return (
    <div className="my-6 p-4 border rounded-lg bg-card shadow-sm overflow-x-auto">
      <div className="flex flex-wrap items-center justify-between mb-4 gap-4">
        <div className="flex gap-2 items-center">
          <Input
            placeholder="Buscar por nombre o correo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64"
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2.5 border rounded-lg bg-card text-foreground text-sm font-medium transition-colors hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-slate-950 cursor-pointer"
          >
            <option value="">Todos los roles</option>
            {availableRoles.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => { setSearch(""); setRoleFilter(""); }}
        >
          Limpiar
        </Button>
      </div>

      <Table className="w-full">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[240px] text-foreground">Usuario</TableHead>
            <TableHead className="w-[220px] text-foreground">Correo</TableHead>
            <TableHead className="w-[120px] text-foreground">Rol</TableHead>
            <TableHead className="w-[160px] text-foreground">Creado</TableHead>
            <TableHead className="w-[160px] text-foreground">Actualizado</TableHead>
             <TableHead className="w-[100px] text-foreground">Acciones</TableHead>
            </TableRow>
         </TableHeader>

        <TableBody>
            {isLoading ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                Cargando usuarios...
              </TableCell>
            </TableRow>
          ) : filtered.length ? (
            filtered.map((u) => (
              <TableRow key={u._id || u.id}>
                <TableCell className="font-medium whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Avatar className="h-8 w-8 hover:z-10 cursor-pointer">
                            {u.avatar ? (
                              <AvatarImage src={u.avatar} alt={u.name} />
                            ) : (
                              <AvatarFallback className="bg-muted-foreground text-foreground">{u.name ? u.name[0].toUpperCase() : "U"}</AvatarFallback>
                            )}
                          </Avatar>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="bg-popover text-foreground border">
                          <div className="text-sm font-semibold text-foreground">{u.name}</div>
                          <div className="text-xs text-muted-foreground">{u.email}</div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <div>
                      <div className="text-sm font-medium text-foreground">{u.name}</div>
                      <div className="text-xs text-muted-foreground">{u.role}</div>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="text-sm text-foreground">
                  <a 
                    className="text-primary hover:underline truncate" 
                    href={`mailto:${u.email}`}
                    title={u.email}
                  >
                    {u.email}
                  </a>
                </TableCell>

                <TableCell>
                  <Badge className={cn("px-2 py-1 text-xs font-medium", getRoleBadgeStyle(u.role))}>
                    {u.role}
                  </Badge>
                </TableCell>

                <TableCell className="text-xs text-muted-foreground">
                  {formatDate(u.createdAt)}
                </TableCell>

                <TableCell className="text-xs text-muted-foreground">
                  {formatDate(u.updatedAt)}
                </TableCell>

                <TableCell>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => handleCopyEmail(u.email)}
                    >
                      Copiar
                    </Button>
                  </div>
                 </TableCell>
               </TableRow>
             ))
           ) : (
             <TableRow>
               <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                 No se encontraron usuarios.
               </TableCell>
             </TableRow>
           )}
         </TableBody>
       </Table>
     </div>
   );
 }

