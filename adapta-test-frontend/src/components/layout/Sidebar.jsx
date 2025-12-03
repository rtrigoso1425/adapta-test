/* eslint-disable no-undef */
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  Settings,
  BarChart3,
  ChevronDown,
  CircleDotDashed,
  UserCheck,
  Home,
  Users,
  FileText,
  LogOut
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import React, { useEffect, useState } from "react";
import { getMyCareer } from "../../features/careers/careerSlice";

// SidebarLink mejorado para mostrar iconos y labels según colapsado
function SidebarLink({ icon: Icon, label, to, active, isCollapsed, isSubItem = false }) {
  const content = (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-3 py-2.5 rounded-lg transition-all duration-200 group font-medium",
        // Estilo activo "pestaña"
        active
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
        
        // Colapsado: cuadrado perfecto y centrado
        isCollapsed 
          ? "h-10 w-10 justify-center p-0 mx-auto"
          : "px-3", // Expandido: padding interno

        isSubItem && !isCollapsed && "pl-8 text-sm" // Sub-item indentado
      )}
    >
      {/* protect Icon to avoid rendering undefined */}
      {Icon && <Icon className="h-5 w-5 flex-shrink-0" />} 
      <span 
        className={cn(
          "transition-opacity whitespace-nowrap",
          isCollapsed && "opacity-0 hidden"
        )}
      >
        {label}
      </span>
    </Link>
  );

  if (isCollapsed) {
    return (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent side="right">
            <p>{label}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return content;
}

// SidebarAccordion mejorado para manejar secciones abiertas/cerradas
function SidebarAccordion({ title, icon: Icon, isCollapsed, children, isOpen, onToggle }) {
  const headerContent = (
    <div
      className={cn(
        "flex items-center gap-3 py-2.5 rounded-lg transition-all duration-200 group font-medium cursor-pointer",
        "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
        isCollapsed ? "h-10 w-10 justify-center p-0 mx-auto" : "px-3"
      )}
    >
      {/* protect Icon too */}
      {Icon && <Icon className="h-5 w-5 flex-shrink-0" />}
      <span
        className={cn(
          "transition-opacity whitespace-nowrap",
          isCollapsed && "opacity-0 hidden"
        )}
      >
        {title}
      </span>
      {/* Flecha de expandir/contraer */}
      <ChevronDown
        className={cn(
          "ml-auto h-4 w-4 transition-transform",
          isOpen && "rotate-180",
          isCollapsed && "opacity-0 hidden"
        )}
      />
    </div>
  );

  // Si está colapsado, no hay acordeón, solo un link con tooltip
  if (isCollapsed) {
    return (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>{headerContent}</TooltipTrigger>
          <TooltipContent side="right">
            <p>{title}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <CollapsibleTrigger asChild>
        {headerContent}
      </CollapsibleTrigger>
      <CollapsibleContent className="data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up overflow-hidden">
        <div className="mt-1 space-y-1">
          {children} {/* Aquí van los SidebarLink anidados */}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

// Componente principal Sidebar
export function Sidebar({ isCollapsed, onToggle }) {
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { myCareer } = useSelector((state) => state.careers);
  const [myCareers, setMyCareers] = useState([]);
  const [expandedSections, setExpandedSections] = useState({});

  useEffect(() => {
    if (user?.role === "coordinator") {
      dispatch(getMyCareer());
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (myCareer) {
      if (Array.isArray(myCareer)) {
        setMyCareers(myCareer);
      } else {
        setMyCareers([myCareer]);
      }
    }
  }, [myCareer]);

  const isActive = (path, careerTab = null) => {
    if (careerTab) {
      return location.pathname === path && location.search.includes(careerTab);
    }
    if (path.includes("?")) {
      const [pPath, pQuery] = path.split("?");
      if (location.pathname !== pPath) return false;
      const wanted = new URLSearchParams(pQuery);
      const current = new URLSearchParams(location.search);
      for (const [k, v] of wanted.entries()) {
        if (current.get(k) !== v) return false;
      }
      return true;
    }
    return location.pathname === path || (path !== "/dashboard" && location.pathname.startsWith(path));
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // ADMIN
  if (user?.role === "admin") {
    return (
      <aside
        data-collapsed={isCollapsed}
        className={cn(
          "bg-card border-r shadow-lg transition-all duration-300 ease-in-out",
          "h-screen sticky top-0 left-0 z-40 flex flex-col",
          isCollapsed ? "w-20" : "w-64"
        )}
      >
        <div className={cn("h-16 border-b flex items-center transition-all duration-300 relative", isCollapsed ? "justify-center px-2" : "px-4")}>
          <Link to="/admin" className="flex items-center gap-2 overflow-hidden">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold flex-shrink-0">
              A
            </div>
            <div className={cn("flex flex-col transition-opacity", isCollapsed && "opacity-0 hidden")}>
              <span className="font-bold text-lg tracking-tight whitespace-nowrap">AdaptaTest</span>
              <span className="text-xs text-muted-foreground whitespace-nowrap truncate">{user?.institution?.name}</span>
            </div>
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-4 space-y-4">
          {/* Administración (agrupa los tabs del AdminDashboard) */}
          <SidebarAccordion
            title="Administración"
            icon={UserCheck}
            isCollapsed={isCollapsed}
            isOpen={expandedSections.administration}
            onToggle={() => toggleSection("administration")}
          >
            <SidebarLink
              icon={Users}
              label="Usuarios"
              to="/dashboard?tab=users"
              active={isActive("/dashboard?tab=users")}
              isCollapsed={isCollapsed}
              isSubItem={true}
            />
            {user?.institution?.type === "university" && (
              <SidebarLink
                icon={GraduationCap}
                label="Carreras"
                to="/dashboard?tab=careers"
                active={isActive("/dashboard?tab=careers")}
                isCollapsed={isCollapsed}
                isSubItem={true}
              />
            )}
            <SidebarLink
              icon={FileText}
              label="Cursos"
              to="/dashboard?tab=courses"
              active={isActive("/dashboard?tab=courses")}
              isCollapsed={isCollapsed}
              isSubItem={true}
            />
            <SidebarLink
              icon={BarChart3}
              label="Académico"
              to="/dashboard?tab=academic"
              active={isActive("/dashboard?tab=academic")}
              isCollapsed={isCollapsed}
              isSubItem={true}
            />
          </SidebarAccordion>

          {/* Configuración independiente */}
          <SidebarLink
            icon={Settings}
            label="Configuración"
            to="/admin/settings"
            active={isActive("/admin/settings")}
            isCollapsed={isCollapsed}
          />
        </nav>
        {/* ...Logout button if needed... */}
      </aside>
    );
  }

  // COORDINATOR
  if (user?.role === "coordinator") {
    return (
      <aside
        data-collapsed={isCollapsed}
        className={cn(
          "bg-card border-r shadow-lg transition-all duration-300 ease-in-out",
          "h-screen sticky top-0 left-0 z-40 flex flex-col",
          isCollapsed ? "w-20" : "w-64"
        )}
      >
        <div className={cn("h-16 border-b flex items-center transition-all duration-300 relative", isCollapsed ? "justify-center px-2" : "px-4")}>
          <Link to="/coordinator" className="flex items-center gap-2 overflow-hidden">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold flex-shrink-0">
              A
            </div>
            <div className={cn("flex flex-col transition-opacity", isCollapsed && "opacity-0 hidden")}>
              <span className="font-bold text-lg tracking-tight whitespace-nowrap">AdaptaTest</span>
              <span className="text-xs text-muted-foreground whitespace-nowrap truncate">{user?.institution?.name}</span>
            </div>
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-4 space-y-4">
          <SidebarLink
            icon={Home}
            label="Inicio"
            to="/coordinator"
            active={isActive("/coordinator")}
            isCollapsed={isCollapsed}
          />
          {myCareers.length > 0 && (
            <Collapsible open={expandedSections.dashboard} onOpenChange={() => toggleSection("dashboard")}>
              <CollapsibleTrigger asChild>
                <div className={cn("flex items-center gap-3 py-2.5 rounded-lg transition-all duration-200 group font-medium cursor-pointer", "text-muted-foreground hover:bg-accent hover:text-accent-foreground", isCollapsed ? "h-10 w-10 justify-center p-0 mx-auto" : "px-3")}>
                  <GraduationCap className="h-5 w-5 flex-shrink-0" />
                  <span className={cn("transition-opacity whitespace-nowrap", isCollapsed && "opacity-0 hidden")}>Mi Carrera</span>
                  <ChevronDown className={cn("ml-auto h-4 w-4 transition-transform", expandedSections.dashboard && "rotate-180", isCollapsed && "opacity-0 hidden")} />
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent className="pl-8 space-y-2 mt-2">
                {myCareers.map((career) => (
                  <SidebarLink
                    key={career._id}
                    label={career.name}
                    to={`/coordinator/dashboard?career=${career._id}`}
                    active={isActive("/coordinator/dashboard", career._id)}
                    isCollapsed={isCollapsed}
                    isSubItem={true}
                  />
                ))}
              </CollapsibleContent>
            </Collapsible>
          )}
          <SidebarLink
            icon={Settings}
            label="Configuración"
            to="/coordinator/settings"
            active={isActive("/coordinator/settings")}
            isCollapsed={isCollapsed}
          />
        </nav>
      </aside>
    );
  }

  // STUDENT
  if (user?.role === "student") {
    return (
      <aside
        data-collapsed={isCollapsed}
        className={cn(
          "bg-card border-r shadow-lg transition-all duration-300 ease-in-out",
          "h-screen sticky top-0 left-0 z-40 flex flex-col",
          isCollapsed ? "w-20" : "w-64"
        )}
      >
        <div className={cn("h-16 border-b flex items-center transition-all duration-300 relative", isCollapsed ? "justify-center px-2" : "px-4")}>
          <Link to="/student" className="flex items-center gap-2 overflow-hidden">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold flex-shrink-0">
              A
            </div>
            <div className={cn("flex flex-col transition-opacity", isCollapsed && "opacity-0 hidden")}>
              <span className="font-bold text-lg tracking-tight whitespace-nowrap">AdaptaTest</span>
              <span className="text-xs text-muted-foreground whitespace-nowrap truncate">{user?.institution?.name}</span>
            </div>
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-4 space-y-4">
          <SidebarLink
            icon={Home}
            label="Inicio"
            to="/student"
            active={isActive("/student")}
            isCollapsed={isCollapsed}
          />
          <SidebarLink
            icon={BookOpen}
            label="Mis Cursos"
            to="/student/courses"
            active={isActive("/student/courses")}
            isCollapsed={isCollapsed}
          />
          <SidebarLink
            icon={FileText}
            label="Mi Progreso"
            to="/student/progress"
            active={isActive("/student/progress")}
            isCollapsed={isCollapsed}
          />
          <SidebarLink
            icon={Settings}
            label="Configuración"
            to="/student/settings"
            active={isActive("/student/settings")}
            isCollapsed={isCollapsed}
          />
        </nav>
      </aside>
    );
  }

  // PROFESSOR
  if (user?.role === "professor") {
    return (
      <aside
        data-collapsed={isCollapsed}
        className={cn(
          "bg-card border-r shadow-lg transition-all duration-300 ease-in-out",
          "h-screen sticky top-0 left-0 z-40 flex flex-col",
          isCollapsed ? "w-20" : "w-64"
        )}
      >
        <div className={cn("h-16 border-b flex items-center transition-all duration-300 relative", isCollapsed ? "justify-center px-2" : "px-4")}>
          <Link to="/professor" className="flex items-center gap-2 overflow-hidden">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold flex-shrink-0">
              A
            </div>
            <div className={cn("flex flex-col transition-opacity", isCollapsed && "opacity-0 hidden")}>
              <span className="font-bold text-lg tracking-tight whitespace-nowrap">AdaptaTest</span>
              <span className="text-xs text-muted-foreground whitespace-nowrap truncate">{user?.institution?.name}</span>
            </div>
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-4 space-y-4">
          <SidebarLink
            icon={Home}
            label="Inicio"
            to="/professor"
            active={isActive("/professor")}
            isCollapsed={isCollapsed}
          />
          <SidebarLink
            icon={BookOpen}
            label="Mis Cursos"
            to="/professor/courses"
            active={isActive("/professor/courses")}
            isCollapsed={isCollapsed}
          />
          <SidebarLink
            icon={FileText}
            label="Calificaciones"
            to="/professor/grading"
            active={isActive("/professor/grading")}
            isCollapsed={isCollapsed}
          />
          <SidebarLink
            icon={Settings}
            label="Configuración"
            to="/professor/settings"
            active={isActive("/professor/settings")}
            isCollapsed={isCollapsed}
          />
        </nav>
      </aside>
    );
  }

  // PARENT
  if (user?.role === "parent") {
    return (
      <aside
        data-collapsed={isCollapsed}
        className={cn(
          "bg-card border-r shadow-lg transition-all duration-300 ease-in-out",
          "h-screen sticky top-0 left-0 z-40 flex flex-col",
          isCollapsed ? "w-20" : "w-64"
        )}
      >
        <div className={cn("h-16 border-b flex items-center transition-all duration-300 relative", isCollapsed ? "justify-center px-2" : "px-4")}>
          <Link to="/parent" className="flex items-center gap-2 overflow-hidden">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold flex-shrink-0">
              A
            </div>
            <div className={cn("flex flex-col transition-opacity", isCollapsed && "opacity-0 hidden")}>
              <span className="font-bold text-lg tracking-tight whitespace-nowrap">AdaptaTest</span>
              <span className="text-xs text-muted-foreground whitespace-nowrap truncate">{user?.institution?.name}</span>
            </div>
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-4 space-y-4">
          <SidebarLink
            icon={Home}
            label="Inicio"
            to="/parent"
            active={isActive("/parent")}
            isCollapsed={isCollapsed}
          />
          <SidebarLink
            icon={Users}
            label="Mis Hijos"
            to="/parent/children"
            active={isActive("/parent/children")}
            isCollapsed={isCollapsed}
          />
          <SidebarLink
            icon={FileText}
            label="Progreso"
            to="/parent/progress"
            active={isActive("/parent/progress")}
            isCollapsed={isCollapsed}
          />
          <SidebarLink
            icon={Settings}
            label="Configuración"
            to="/parent/settings"
            active={isActive("/parent/settings")}
            isCollapsed={isCollapsed}
          />
        </nav>
      </aside>
    );
  }

  return null;
}