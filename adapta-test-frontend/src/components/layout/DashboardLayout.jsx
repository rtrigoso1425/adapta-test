import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { cn } from "@/lib/utils";
import { SidebarToggle } from "@/components/layout/SidebarToggle"; // <-- Importar

const DashboardLayout = () => {
  const [isCollapsed, setIsCollapsed] = useLocalStorage("sidebar-collapsed", false);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Contenedor relativo para el sidebar y su botón de toggle */}
      <div className="relative">
        <Sidebar isCollapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)} />
        <SidebarToggle isCollapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)} />
      </div>

      <div
        className={cn(
          "flex-1 flex flex-col transition-all duration-300 ease-in-out",
          isCollapsed ? "ml-0" : "ml-0"
        )}
      >
        <DashboardHeader /> {/* onToggle eliminado */}
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;