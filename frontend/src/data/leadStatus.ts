export const leadStatusLabels: Record<string, string> = {
  novo: "Novo",
  em_contato: "Em Contato",
  convertido: "Convertido",
  perdido: "Perdido",
};

export const leadStatusColors: Record<string, string> = {
  novo: "bg-[#e4e7dd] text-foreground border-[#e4e7dd]",
  em_contato: "bg-warning/10 text-warning border-warning/20",
  convertido: "bg-success/10 text-green-number border-success/20",
  perdido: "bg-destructive/10 text-destructive border-destructive/20",
};
