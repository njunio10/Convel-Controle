import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader, StatCard } from "@/components/ui/page-components";
import { Wallet, Users, UserPlus, TrendingUp, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { leadStatusLabels, leadStatusColors } from "@/data/leadStatus";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { clientsApi, leadsApi, transactionsApi } from "@/lib/api";
import type { Client, Lead, Transaction } from "@/types";

const Index = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const normalizeTransaction = (transaction: Transaction): Transaction => ({
    ...transaction,
    date: new Date(transaction.date),
    createdAt: new Date(transaction.createdAt),
  });

  const normalizeLead = (lead: Lead): Lead => ({
    ...lead,
    createdAt: new Date(lead.createdAt),
    updatedAt: new Date(lead.updatedAt),
  });

  useEffect(() => {
    const loadDashboard = async () => {
      setIsLoading(true);
      try {
        const [transactionsData, clientsData, leadsData] = await Promise.all([
          transactionsApi.getAll(),
          clientsApi.getAll(),
          leadsApi.getAll(),
        ]);
        setTransactions(transactionsData.map(normalizeTransaction));
        setClients(clientsData);
        setLeads(leadsData.map(normalizeLead));
      } catch (error) {
        console.error("Erro ao carregar dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    };

    void loadDashboard();
  }, []);

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => acc + t.amount, 0);

  const balance = totalIncome - totalExpense;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const recentTransactions = transactions.slice(0, 3);
  const newLeads = leads.filter((l) => l.status === "novo").length;
  const convertedLeads = leads.filter((l) => l.status === "convertido").length;

  return (
    <AppLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <PageHeader
          title="Dashboard"
          description={`Bem-vindo de volta! Aqui está o resumo do seu negócio.`}
        />

        {/* Main Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatCard
            title="Saldo Atual"
            value={formatCurrency(balance)}
            icon={<Wallet className="h-5 w-5" />}
            variant={balance >= 0 ? "success" : "destructive"}
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            title="Total de Clientes"
            value={clients.length}
            icon={<Users className="h-5 w-5" />}
            description={`${clients.filter((c) => c.origin === "indicacao").length} por indicação`}
          />
          <StatCard
            title="Leads Ativos"
            value={leads.length}
            icon={<UserPlus className="h-5 w-5" />}
            description={`${newLeads} novos, ${convertedLeads} convertidos`}
          />
          <StatCard
            title="Receita do Mês"
            value={formatCurrency(totalIncome)}
            icon={<TrendingUp className="h-5 w-5" />}
            variant="success"
            trend={{ value: 8, isPositive: true }}
          />
        </div>

        {/* Content Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Transactions */}
          <div className="rounded-xl border bg-card p-6 card-shadow">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Transações Recentes</h2>
              <Link to="/fluxo-caixa">
                <Button variant="ghost" size="sm" className="hover:bg-primary hover:text-primary-foreground">
                  Ver todas
                </Button>
              </Link>
            </div>
            <div className="space-y-3">
              {isLoading && (
                <div className="text-sm text-muted-foreground">Carregando transações...</div>
              )}
              {!isLoading && recentTransactions.length === 0 && (
                <div className="text-sm text-muted-foreground">Nenhuma transação registrada.</div>
              )}
              {!isLoading &&
                recentTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between py-2 border-b border-border last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full ${
                          transaction.type === "income"
                            ? "bg-success/10 text-green-number"
                            : "bg-destructive/10 text-destructive"
                        }`}
                      >
                        {transaction.type === "income" ? (
                          <ArrowDownLeft className="h-4 w-4" />
                        ) : (
                          <ArrowUpRight className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{transaction.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(transaction.date, "dd MMM", { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                    <p
                      className={`text-sm font-semibold ${
                        transaction.type === "income" ? "text-green-number" : "text-destructive"
                      }`}
                    >
                      {transaction.type === "income" ? "+" : "-"}
                      {formatCurrency(transaction.amount)}
                    </p>
                  </div>
                ))}
            </div>
          </div>

          {/* Recent Leads */}
          <div className="rounded-xl border bg-card p-6 card-shadow">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Leads Recentes</h2>
              <Link to="/leads">
                <Button variant="ghost" size="sm" className="hover:bg-primary hover:text-primary-foreground">
                  Ver todos
                </Button>
              </Link>
            </div>
            <div className="space-y-3">
              {isLoading && <div className="text-sm text-muted-foreground">Carregando leads...</div>}
              {!isLoading && leads.length === 0 && (
                <div className="text-sm text-muted-foreground">Nenhum lead registrado.</div>
              )}
              {!isLoading &&
                leads.slice(0, 3).map((lead) => (
                  <div
                    key={lead.id}
                    className="flex items-center justify-between py-2 border-b border-border last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-green-number">
                        <UserPlus className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{lead.name}</p>
                        <p className="text-xs text-muted-foreground">{lead.email}</p>
                      </div>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium border ${leadStatusColors[lead.status]}`}
                    >
                      {leadStatusLabels[lead.status]}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </motion.div>
    </AppLayout>
  );
};

export default Index;
