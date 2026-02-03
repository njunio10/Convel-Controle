import { ReactNode, useState } from "react";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";
import { SidebarContext, useSidebar } from "@/contexts/SidebarContext";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children: ReactNode;
}

function MainContent({ children }: { children: ReactNode }) {
  const { isCollapsed } = useSidebar();
  
  return (
    <main 
      className={cn(
        "transition-all duration-300 pt-16",
        isCollapsed ? "pl-16" : "pl-64"
      )}
    >
      <div className="p-8">
        {children}
      </div>
    </main>
  );
}

export function AppLayout({ children }: AppLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <SidebarContext.Provider value={{ isCollapsed, toggleSidebar }}>
      <div className="min-h-screen bg-background">
        <AppSidebar />
        <AppHeader />
        <MainContent>{children}</MainContent>
      </div>
    </SidebarContext.Provider>
  );
}
