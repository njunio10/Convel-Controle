import { NavLink as RouterNavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { useSidebar } from "@/contexts/SidebarContext";

interface SidebarNavLinkProps {
  to: string;
  icon: LucideIcon;
  children: React.ReactNode;
}

export function SidebarNavLink({ to, icon: Icon, children }: SidebarNavLinkProps) {
  const location = useLocation();
  const isActive = location.pathname === to;
  const { isCollapsed } = useSidebar();

  return (
    <RouterNavLink
      to={to}
      className={cn(
        "flex items-center gap-3 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus-visible:outline-none focus-visible:ring-0",
        isCollapsed ? "justify-center px-3 py-2.5" : "px-3 py-2.5",
        isActive
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
      )}
      style={{ 
        outline: 'none',
        outlineWidth: 0,
        outlineStyle: 'none',
        boxShadow: 'none'
      }}
      onMouseDown={(e) => {
        e.currentTarget.style.outline = 'none';
        e.currentTarget.style.boxShadow = 'none';
      }}
      onFocus={(e) => {
        e.currentTarget.style.outline = 'none';
        e.currentTarget.style.boxShadow = 'none';
      }}
      title={isCollapsed ? String(children) : undefined}
    >
      <Icon className="h-5 w-5 flex-shrink-0" />
      {!isCollapsed && <span className="truncate">{children}</span>}
    </RouterNavLink>
  );
}
