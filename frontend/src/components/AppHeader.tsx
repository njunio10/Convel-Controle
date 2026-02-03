import { User, LogOut, PanelLeft } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useSidebar } from "@/contexts/SidebarContext";
import { cn } from "@/lib/utils";

export function AppHeader() {
  const { isCollapsed, toggleSidebar } = useSidebar();

  const handleLogout = () => {
    // Aqui você pode adicionar a lógica de logout
    // Por exemplo: limpar tokens, redirecionar para login, etc.
    console.log("Logout realizado");
    // window.location.href = "/login";
  };

  return (
    <header
      className={cn(
        "fixed top-0 right-0 z-30 h-16 border-b border-border bg-background transition-all duration-300",
        isCollapsed ? "left-16" : "left-64"
      )}
    >
      <div className="flex h-full items-center justify-between px-6">
        <button
          onClick={toggleSidebar}
          className=""
          aria-label={isCollapsed ? "Expandir sidebar" : "Colapsar sidebar"}
        >
          <PanelLeft className="h-5 w-5" />
        </button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 ">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground">
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem 
              className="cursor-pointer text-destructive focus:bg-destructive focus:text-destructive-foreground hover:bg-destructive hover:text-destructive-foreground" 
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

