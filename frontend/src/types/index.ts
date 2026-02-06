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

// Tipos para integração com Asaas
export interface AsaasPayment {
  id: string;
  customer: string;
  billingType: string;
  value: number;
  netValue: number;
  originalValue: number;
  interestValue: number;
  description: string;
  status: string;
  dueDate: string;
  paymentDate?: string;
  clientPaymentDate?: string;
  installmentNumber?: number;
  invoiceUrl?: string;
  bankSlipUrl?: string;
  transactionReceiptUrl?: string;
  invoiceNumber?: string;
  externalReference?: string;
  deleted: boolean;
  anticipated: boolean;
  anticipable: boolean;
  refunds?: any;
  dateCreated: string;
  creditDate?: string;
  estimatedCreditDate?: string;
  transactionReceiptUrl?: string;
  nossoNumero?: string;
  postalService?: boolean;
}

export interface AsaasFinancialSummary {
  total_received: number;
  total_pending: number;
  total_overdue: number;
  total_expected: number;
}

export interface AsaasFinancialData {
  entries: {
    received: {
      data: AsaasPayment[];
      total: number;
      count: number;
    };
    pending: {
      data: AsaasPayment[];
      total: number;
      count: number;
    };
    overdue: {
      data: AsaasPayment[];
      total: number;
      count: number;
    };
  };
  summary: AsaasFinancialSummary;
  error?: string;
}