import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { getMyCareer } from "../../features/careers/careerSlice";
import { getAuth } from "../../features/auth/authSlice";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "../../components/ui/collapsible";
import {
  Home,
  GraduationCap,
  BookOpen,
  Users,
  FileText,
  Settings,
  LogOut,
  ChevronDown,
} from "lucide-react";

const SidebarAccordion = ({ isOpen }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { myCareer } = useSelector((state) => state.careers);
  const [myCareers, setMyCareers] = useState([]);
  const [expandedSections, setExpandedSections] = useState({});

  // Obtener carreras del coordinador
  useEffect(() => {
    if (user?.role === "coordinator") {
      dispatch(getMyCareer());
    }
  }, [user, dispatch]);

  // Actualizar myCareers cuando myCareer cambie
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
    return location.pathname === path;
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // ===== ADMIN ROLE =====
  if (user?.role === "admin") {
    return (
      <nav className="space-y-4 p-4">
        <SidebarLink
          href="/admin"
          icon={Home}
          label="Dashboard"
          isActive={isActive("/admin")}
          isOpen={isOpen}
        />

        {/* Users Management */}
        <Collapsible
          open={expandedSections.users}
          onOpenChange={() => toggleSection("users")}
        >
          <CollapsibleTrigger className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-accent transition-colors text-foreground">
            <Users className="w-5 h-5" />
            {isOpen && (
              <>
                <span className="flex-1 text-left text-sm font-medium">Usuarios</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    expandedSections.users ? "rotate-180" : ""
                  }`}
                />
              </>
            )}
          </CollapsibleTrigger>
          <CollapsibleContent className="pl-8 space-y-2 mt-2">
            <SidebarLink
              href="/admin/users"
              label="Gestionar Usuarios"
              isActive={isActive("/admin/users")}
              isOpen={isOpen}
              indent
            />
            <SidebarLink
              href="/admin/users/roles"
              label="Asignar Roles"
              isActive={isActive("/admin/users/roles")}
              isOpen={isOpen}
              indent
            />
          </CollapsibleContent>
        </Collapsible>

        {/* Institutions Management */}
        <Collapsible
          open={expandedSections.institutions}
          onOpenChange={() => toggleSection("institutions")}
        >
          <CollapsibleTrigger className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-accent transition-colors text-foreground">
            <GraduationCap className="w-5 h-5" />
            {isOpen && (
              <>
                <span className="flex-1 text-left text-sm font-medium">Instituciones</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    expandedSections.institutions ? "rotate-180" : ""
                  }`}
                />
              </>
            )}
          </CollapsibleTrigger>
          <CollapsibleContent className="pl-8 space-y-2 mt-2">
            <SidebarLink
              href="/admin/institutions"
              label="Gestionar Instituciones"
              isActive={isActive("/admin/institutions")}
              isOpen={isOpen}
              indent
            />
          </CollapsibleContent>
        </Collapsible>

        {/* Careers Management */}
        <Collapsible
          open={expandedSections.careers}
          onOpenChange={() => toggleSection("careers")}
        >
          <CollapsibleTrigger className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-accent transition-colors text-foreground">
            <BookOpen className="w-5 h-5" />
            {isOpen && (
              <>
                <span className="flex-1 text-left text-sm font-medium">Carreras</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    expandedSections.careers ? "rotate-180" : ""
                  }`}
                />
              </>
            )}
          </CollapsibleTrigger>
          <CollapsibleContent className="pl-8 space-y-2 mt-2">
            <SidebarLink
              href="/admin/careers"
              label="Gestionar Carreras"
              isActive={isActive("/admin/careers")}
              isOpen={isOpen}
              indent
            />
          </CollapsibleContent>
        </Collapsible>

        {/* Courses Management */}
        <Collapsible
          open={expandedSections.courses}
          onOpenChange={() => toggleSection("courses")}
        >
          <CollapsibleTrigger className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-accent transition-colors text-foreground">
            <FileText className="w-5 h-5" />
            {isOpen && (
              <>
                <span className="flex-1 text-left text-sm font-medium">Cursos</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    expandedSections.courses ? "rotate-180" : ""
                  }`}
                />
              </>
            )}
          </CollapsibleTrigger>
          <CollapsibleContent className="pl-8 space-y-2 mt-2">
            <SidebarLink
              href="/admin/courses"
              label="Gestionar Cursos"
              isActive={isActive("/admin/courses")}
              isOpen={isOpen}
              indent
            />
          </CollapsibleContent>
        </Collapsible>

        {/* Settings */}
        <SidebarLink
          href="/admin/settings"
          icon={Settings}
          label="Configuración"
          isActive={isActive("/admin/settings")}
          isOpen={isOpen}
        />
      </nav>
    );
  }

  // ===== COORDINATOR ROLE =====
  if (user?.role === "coordinator") {
    return (
      <nav className="space-y-4 p-4">
        <SidebarLink
          href="/coordinator"
          icon={Home}
          label="Inicio"
          isActive={isActive("/coordinator")}
          isOpen={isOpen}
        />

        {/* Dashboard with Career Tabs */}
        {myCareers.length > 0 && (
          <Collapsible
            open={expandedSections.dashboard}
            onOpenChange={() => toggleSection("dashboard")}
          >
            <CollapsibleTrigger className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-accent transition-colors text-foreground">
              <GraduationCap className="w-5 h-5" />
              {isOpen && (
                <>
                  <span className="flex-1 text-left text-sm font-medium">Mi Carrera</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      expandedSections.dashboard ? "rotate-180" : ""
                    }`}
                  />
                </>
              )}
            </CollapsibleTrigger>
            <CollapsibleContent className="pl-8 space-y-2 mt-2">
              {myCareers.map((career) => (
                <SidebarLink
                  key={career._id}
                  href={`/coordinator/dashboard?career=${career._id}`}
                  label={career.name}
                  isActive={isActive("/coordinator/dashboard", career._id)}
                  isOpen={isOpen}
                  indent
                />
              ))}
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Settings */}
        <SidebarLink
          href="/coordinator/settings"
          icon={Settings}
          label="Configuración"
          isActive={isActive("/coordinator/settings")}
          isOpen={isOpen}
        />
      </nav>
    );
  }

  // ===== STUDENT ROLE =====
  if (user?.role === "student") {
    return (
      <nav className="space-y-4 p-4">
        <SidebarLink
          href="/student"
          icon={Home}
          label="Inicio"
          isActive={isActive("/student")}
          isOpen={isOpen}
        />

        <SidebarLink
          href="/student/courses"
          icon={BookOpen}
          label="Mis Cursos"
          isActive={isActive("/student/courses")}
          isOpen={isOpen}
        />

        <SidebarLink
          href="/student/progress"
          icon={FileText}
          label="Mi Progreso"
          isActive={isActive("/student/progress")}
          isOpen={isOpen}
        />

        <SidebarLink
          href="/student/settings"
          icon={Settings}
          label="Configuración"
          isActive={isActive("/student/settings")}
          isOpen={isOpen}
        />
      </nav>
    );
  }

  // ===== PROFESSOR ROLE =====
  if (user?.role === "professor") {
    return (
      <nav className="space-y-4 p-4">
        <SidebarLink
          href="/professor"
          icon={Home}
          label="Inicio"
          isActive={isActive("/professor")}
          isOpen={isOpen}
        />

        <SidebarLink
          href="/professor/courses"
          icon={BookOpen}
          label="Mis Cursos"
          isActive={isActive("/professor/courses")}
          isOpen={isOpen}
        />

        <SidebarLink
          href="/professor/grading"
          icon={FileText}
          label="Calificaciones"
          isActive={isActive("/professor/grading")}
          isOpen={isOpen}
        />

        <SidebarLink
          href="/professor/settings"
          icon={Settings}
          label="Configuración"
          isActive={isActive("/professor/settings")}
          isOpen={isOpen}
        />
      </nav>
    );
  }

  // ===== PARENT ROLE =====
  if (user?.role === "parent") {
    return (
      <nav className="space-y-4 p-4">
        <SidebarLink
          href="/parent"
          icon={Home}
          label="Inicio"
          isActive={isActive("/parent")}
          isOpen={isOpen}
        />

        <SidebarLink
          href="/parent/children"
          icon={Users}
          label="Mis Hijos"
          isActive={isActive("/parent/children")}
          isOpen={isOpen}
        />

        <SidebarLink
          href="/parent/progress"
          icon={FileText}
          label="Progreso"
          isActive={isActive("/parent/progress")}
          isOpen={isOpen}
        />

        <SidebarLink
          href="/parent/settings"
          icon={Settings}
          label="Configuración"
          isActive={isActive("/parent/settings")}
          isOpen={isOpen}
        />
      </nav>
    );
  }

  return null;
};

// ===== SIDEBAR LINK COMPONENT =====
const SidebarLink = ({ href, icon: Icon, label, isActive, isOpen, indent = false }) => {
  return (
    <Link
      to={href}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
        isActive
          ? "bg-primary text-primary-foreground font-medium"
          : "text-foreground hover:bg-accent"
      } ${indent ? "ml-2" : ""}`}
    >
      {Icon && <Icon className="w-5 h-5" />}
      {isOpen && <span className="text-sm">{label}</span>}
    </Link>
  );
};

// ===== MAIN SIDEBAR COMPONENT =====
const Sidebar = ({ isOpen }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!user) {
      dispatch(getAuth());
    }
  }, [dispatch, user]);

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-card border-r border-border transition-all duration-300 z-40 overflow-y-auto ${
        isOpen ? "w-64" : "w-20"
      }`}
    >
      <div className="pt-20">
        <SidebarAccordion isOpen={isOpen} />
      </div>

      {/* Logout Button */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
        <button className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-foreground hover:bg-accent transition-colors">
          <LogOut className="w-5 h-5" />
          {isOpen && <span className="text-sm font-medium">Cerrar Sesión</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
