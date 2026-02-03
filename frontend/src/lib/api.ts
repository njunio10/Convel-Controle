import axios from 'axios';
import type { Client, Lead, Transaction } from '@/types';

// Configuração base do axios para comunicação com o backend Laravel
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Interceptor para requisições
api.interceptors.request.use(
  (config) => {
    // Aqui você pode adicionar tokens de autenticação se necessário
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para respostas
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Tratamento de erros global
    if (error.response) {
      // Erro com resposta do servidor
      console.error('Erro na API:', error.response.data);
    } else if (error.request) {
      // Erro de rede
      console.error('Erro de rede:', error.request);
    } else {
      // Outro tipo de erro
      console.error('Erro:', error.message);
    }
    return Promise.reject(error);
  }
);

// Tipos para as respostas da API
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

// ==================== CLIENTES ====================

export const clientsApi = {
  // Listar todos os clientes
  getAll: async (): Promise<Client[]> => {
    const response = await api.get<ApiResponse<Client[]>>('/clients');
    return response.data.data;
  },

  // Buscar cliente por ID
  getById: async (id: string): Promise<Client> => {
    const response = await api.get<ApiResponse<Client>>(`/clients/${id}`);
    return response.data.data;
  },

  // Criar novo cliente
  create: async (client: Omit<Client, 'id' | 'createdAt'>): Promise<Client> => {
    const response = await api.post<ApiResponse<Client>>('/clients', client);
    return response.data.data;
  },

  // Atualizar cliente
  update: async (id: string, client: Partial<Client>): Promise<Client> => {
    const response = await api.put<ApiResponse<Client>>(`/clients/${id}`, client);
    return response.data.data;
  },

  // Deletar cliente
  delete: async (id: string): Promise<void> => {
    await api.delete(`/clients/${id}`);
  },
};

// ==================== LEADS ====================

export const leadsApi = {
  // Listar todos os leads
  getAll: async (): Promise<Lead[]> => {
    const response = await api.get<ApiResponse<Lead[]>>('/leads');
    return response.data.data;
  },

  // Buscar lead por ID
  getById: async (id: string): Promise<Lead> => {
    const response = await api.get<ApiResponse<Lead>>(`/leads/${id}`);
    return response.data.data;
  },

  // Criar novo lead
  create: async (lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>): Promise<Lead> => {
    const response = await api.post<ApiResponse<Lead>>('/leads', lead);
    return response.data.data;
  },

  // Atualizar lead
  update: async (id: string, lead: Partial<Lead>): Promise<Lead> => {
    const response = await api.put<ApiResponse<Lead>>(`/leads/${id}`, lead);
    return response.data.data;
  },

  // Atualizar status do lead
  updateStatus: async (id: string, status: Lead['status']): Promise<Lead> => {
    const response = await api.patch<ApiResponse<Lead>>(`/leads/${id}/status`, { status });
    return response.data.data;
  },

  // Deletar lead
  delete: async (id: string): Promise<void> => {
    await api.delete(`/leads/${id}`);
  },
};

// ==================== TRANSAÇÕES (CASH FLOW) ====================

export const transactionsApi = {
  // Listar todas as transações
  getAll: async (): Promise<Transaction[]> => {
    const response = await api.get<ApiResponse<Transaction[]>>('/transactions');
    return response.data.data;
  },

  // Buscar transação por ID
  getById: async (id: string): Promise<Transaction> => {
    const response = await api.get<ApiResponse<Transaction>>(`/transactions/${id}`);
    return response.data.data;
  },

  // Criar nova transação
  create: async (transaction: Omit<Transaction, 'id' | 'createdAt'>): Promise<Transaction> => {
    const response = await api.post<ApiResponse<Transaction>>('/transactions', transaction);
    return response.data.data;
  },

  // Atualizar transação
  update: async (id: string, transaction: Partial<Transaction>): Promise<Transaction> => {
    const response = await api.put<ApiResponse<Transaction>>(`/transactions/${id}`, transaction);
    return response.data.data;
  },

  // Deletar transação
  delete: async (id: string): Promise<void> => {
    await api.delete(`/transactions/${id}`);
  },
};

// ==================== STATUS ====================

export const statusApi = {
  // Verificar status da API
  check: async (): Promise<{ app: string; status: string }> => {
    const response = await api.get('/status');
    return response.data;
  },
};

// Exportar instância do axios para uso direto se necessário
export default api;

