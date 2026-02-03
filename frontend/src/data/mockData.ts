import { Transaction, Client, Lead } from "@/types";

export const mockTransactions: Transaction[] = [
  {
    id: "1",
    description: "Venda de produto X",
    amount: 1500,
    type: "income",
    category: "Vendas",
    date: new Date("2024-01-15"),
    createdAt: new Date("2024-01-15"),
  },
  {
    id: "2",
    description: "Pagamento de fornecedor",
    amount: 800,
    type: "expense",
    category: "Fornecedores",
    date: new Date("2024-01-14"),
    createdAt: new Date("2024-01-14"),
  },
  {
    id: "3",
    description: "Serviço de consultoria",
    amount: 3200,
    type: "income",
    category: "Serviços",
    date: new Date("2024-01-13"),
    createdAt: new Date("2024-01-13"),
  },
  {
    id: "4",
    description: "Aluguel do escritório",
    amount: 2500,
    type: "expense",
    category: "Infraestrutura",
    date: new Date("2024-01-10"),
    createdAt: new Date("2024-01-10"),
  },
  {
    id: "5",
    description: "Venda online",
    amount: 450,
    type: "income",
    category: "Vendas",
    date: new Date("2024-01-08"),
    createdAt: new Date("2024-01-08"),
  },
];

export const mockClients: Client[] = [
  {
    id: "1",
    name: "Maria Silva",
    email: "maria@email.com",
    phone: "(11) 99999-1111",
    origin: "indicacao",
    referredBy: "João Santos",
    notes: "Cliente VIP",
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "2",
    name: "Carlos Oliveira",
    email: "carlos@email.com",
    phone: "(11) 99999-2222",
    origin: "redes_sociais",
    createdAt: new Date("2024-01-05"),
  },
  {
    id: "3",
    name: "Ana Costa",
    email: "ana@email.com",
    phone: "(11) 99999-3333",
    origin: "evento",
    notes: "Conheceu na feira de negócios",
    createdAt: new Date("2024-01-10"),
  },
  {
    id: "4",
    name: "Pedro Souza",
    email: "pedro@email.com",
    phone: "(11) 99999-4444",
    origin: "promocao",
    createdAt: new Date("2024-01-12"),
  },
];

export const mockLeads: Lead[] = [
  {
    id: "1",
    name: "Fernando Almeida",
    email: "fernando@email.com",
    phone: "(11) 98888-1111",
    status: "novo",
    source: "Google Ads",
    createdAt: new Date("2024-01-18"),
    updatedAt: new Date("2024-01-18"),
  },
  {
    id: "2",
    name: "Juliana Martins",
    email: "juliana@email.com",
    phone: "(11) 98888-2222",
    status: "em_contato",
    source: "Instagram",
    notes: "Interessada no plano premium",
    createdAt: new Date("2024-01-16"),
    updatedAt: new Date("2024-01-17"),
  },
  {
    id: "3",
    name: "Ricardo Lima",
    email: "ricardo@email.com",
    phone: "(11) 98888-3333",
    status: "convertido",
    source: "Indicação",
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-15"),
  },
  {
    id: "4",
    name: "Beatriz Santos",
    email: "beatriz@email.com",
    phone: "(11) 98888-4444",
    status: "perdido",
    source: "Facebook",
    notes: "Sem orçamento no momento",
    createdAt: new Date("2024-01-05"),
    updatedAt: new Date("2024-01-12"),
  },
];

export const transactionCategories = [
  "Vendas",
  "Serviços",
  "Fornecedores",
  "Infraestrutura",
  "Marketing",
  "Pessoal",
  "Outros",
];

export const clientOriginLabels: Record<string, string> = {
  promocao: "Promoção",
  indicacao: "Indicação",
  evento: "Evento",
  redes_sociais: "Redes Sociais",
  site: "Site",
  outro: "Outro",
};

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
