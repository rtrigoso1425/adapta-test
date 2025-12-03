import { cn } from "@/lib/utils";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SidebarToggle({ isCollapsed, onToggle }) {
  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={onToggle} 
      className={cn(
        "absolute -right-4 top-4 z-50 rounded-full h-8 w-8", // Posicionado fuera del sidebar
        "bg-background border shadow-md hover:bg-muted-foreground hover:text-white", // Estilo
        "transition-colors duration-200"
      )}
    >
      {isCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
    </Button>
  );
}