import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: ReactNode;
}

export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 pb-6 border-b border-border mb-6 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
        {description && (
          <p className="text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      {children && <div className="flex items-center gap-3">{children}</div>}
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: "default" | "success" | "destructive" | "warning";
  className?: string;
}

export function StatCard({ title, value, description, icon, trend, variant = "default", className }: StatCardProps) {
  const variantStyles = {
    default: "bg-card border-border",
    success: "bg-success/10 border-success/30",
    destructive: "bg-destructive/10 border-destructive/30",
    warning: "bg-warning/10 border-warning/30",
  };

  const iconStyles = {
    default: "bg-primary/10 text-green-number",
    success: "bg-success/20 text-green-number",
    destructive: "bg-destructive/20 text-destructive",
    warning: "bg-warning/20 text-warning",
  };

  const valueStyles = {
    default: "text-foreground",
    success: "text-green-number",
    destructive: "text-destructive",
    warning: "text-warning",
  };

  return (
    <div className={cn("rounded-xl border p-6 card-shadow", variantStyles[variant], className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className={cn("text-2xl font-semibold", valueStyles[variant])}>{value}</p>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
          {trend && (
            <p className={cn("text-xs font-medium", trend.isPositive ? "text-green-number" : "text-destructive")}>
              {trend.isPositive ? "+" : ""}{trend.value}% em relação ao mês anterior
            </p>
          )}
        </div>
        {icon && (
          <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", iconStyles[variant])}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-4">{description}</p>
      {action}
    </div>
  );
}
