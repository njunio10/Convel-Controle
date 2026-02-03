import { LayoutDashboard, Wallet, Users, UserPlus, Settings } from "lucide-react";
import { SidebarNavLink } from "./SidebarNavLink";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/contexts/SidebarContext";

export function AppSidebar() {
  const { isCollapsed } = useSidebar();

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center gap-2 px-4 border-b border-sidebar-border">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg flex-shrink-0 overflow-hidden">
              <img 
                src="/Logo_Principal.png" 
                alt="Logo Convel" 
                className="h-full w-full object-contain"
              />
            </div>
            {!isCollapsed && (
              <span className="text-lg font-semibold text-sidebar-foreground flex-1">Convel Controle</span>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
            <div className="mb-4">
              {!isCollapsed && (
                <p className="px-3 text-xs font-medium uppercase tracking-wider text-sidebar-muted mb-2">
                  Principal
                </p>
              )}
              <SidebarNavLink to="/" icon={LayoutDashboard}>
                Dashboard
              </SidebarNavLink>
            </div>

            <div className="mb-4">
              {!isCollapsed && (
                <p className="px-3 text-xs font-medium uppercase tracking-wider text-sidebar-muted mb-2">
                  Financeiro
                </p>
              )}
              <SidebarNavLink to="/fluxo-caixa" icon={Wallet}>
                Fluxo de Caixa
              </SidebarNavLink>
            </div>

            <div className="mb-4">
              {!isCollapsed && (
                <p className="px-3 text-xs font-medium uppercase tracking-wider text-sidebar-muted mb-2">
                  CRM
                </p>
              )}
              <SidebarNavLink to="/clientes" icon={Users}>
                Clientes
              </SidebarNavLink>
              <SidebarNavLink to="/leads" icon={UserPlus}>
                Leads
              </SidebarNavLink>
            </div>
          </nav>

          {/* Footer */}
          {/* <div className="p-4 border-t border-sidebar-border">
            <SidebarNavLink to="/configuracoes" icon={Settings}>
              Configurações
            </SidebarNavLink>
          </div> */}
        </div>
      </aside>
  );
}
