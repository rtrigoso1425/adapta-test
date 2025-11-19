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
    admin: "bg-red-600 text-white",
    coordinator: "bg-purple-600 text-white",
    professor: "bg-blue-600 text-white",
    student: "bg-green-600 text-white",
    parent: "bg-orange-600 text-white",
  };
  return styles[role] || "bg-gray-400 text-white";
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
    <div className="my-6 p-4 border border-gray-700 rounded-lg bg-black shadow-sm overflow-x-auto">
      <div className="flex flex-wrap items-center justify-between mb-4 gap-4">
        <div className="flex gap-2 items-center">
          <Input
            placeholder="Buscar por nombre o correo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64 bg-gray-900 text-white border-gray-700 placeholder-gray-400"
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 border border-gray-700 rounded-md bg-gray-900 text-white text-sm font-medium"
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
          className="bg-gray-800 text-white border-gray-700 hover:bg-gray-700"
        >
          Limpiar
        </Button>
      </div>

      <Table className="w-full">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[240px] text-white">Usuario</TableHead>
            <TableHead className="w-[220px] text-white">Correo</TableHead>
            <TableHead className="w-[120px] text-white">Rol</TableHead>
            <TableHead className="w-[160px] text-white">Creado</TableHead>
            <TableHead className="w-[160px] text-white">Actualizado</TableHead>
             <TableHead className="w-[100px] text-white">Acciones</TableHead>
            </TableRow>
         </TableHeader>

        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-6 text-gray-400">
                Cargando usuarios...
              </TableCell>
            </TableRow>
          ) : filtered.length ? (
            filtered.map((u) => (
              <TableRow key={u._id || u.id} className="border-gray-700">
                <TableCell className="font-medium whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Avatar className="h-8 w-8 ring-2 ring-white hover:z-10 cursor-pointer">
                            {u.avatar ? (
                              <AvatarImage src={u.avatar} alt={u.name} />
                            ) : (
                              <AvatarFallback className="bg-gray-700 text-white">{u.name ? u.name[0].toUpperCase() : "U"}</AvatarFallback>
                            )}
                          </Avatar>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="bg-gray-800 border-gray-700">
                          <div className="text-sm font-semibold text-white">{u.name}</div>
                          <div className="text-xs text-gray-300">{u.email}</div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <div>
                      <div className="text-sm font-medium text-white">{u.name}</div>
                      <div className="text-xs text-gray-400">{u.role}</div>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="text-sm text-white">
                  <a 
                    className="text-blue-400 hover:underline truncate" 
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

                <TableCell className="text-xs text-gray-300">
                  {formatDate(u.createdAt)}
                </TableCell>

                <TableCell className="text-xs text-gray-300">
                  {formatDate(u.updatedAt)}
                </TableCell>

                <TableCell>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="ghost"
                      className="text-xs text-gray-300 hover:bg-gray-800 hover:text-white"
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
               <TableCell colSpan={6} className="text-center py-6 text-gray-400">
                 No se encontraron usuarios.
               </TableCell>
             </TableRow>
           )}
         </TableBody>
       </Table>
     </div>
   );
 }
