export type TransactionType = "income" | "expense";

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: Date;
  createdAt: Date;
}

export type ClientOrigin = "promocao" | "indicacao" | "evento" | "redes_sociais" | "site" | "outro";

export interface Client {
  id: string;
  name: string;
  responsibleName: string;
  email: string;
  phone: string;
  origin: ClientOrigin;
  referredBy?: string;
  monthlyFee: number | null;
  notes?: string;
  createdAt: Date;
}

export type LeadStatus = "novo" | "em_contato" | "convertido" | "perdido";

export interface Lead {
  id: string;
  name: string;
  responsibleName: string;
  email: string;
  phone: string;
  status: LeadStatus;
  origin: ClientOrigin;
  referredBy?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
