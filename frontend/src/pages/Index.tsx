import { AppLayout } from "@/components/AppLayout";
import { PageHeader, StatCard } from "@/components/ui/page-components";
import { Wallet, Users, UserPlus, TrendingUp, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { mockTransactions, mockClients, mockLeads, leadStatusLabels, leadStatusColors } from "@/data/mockData";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index = () => {
  const totalIncome = mockTransactions
    .filter((t) => t.type === "income")
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpense = mockTransactions
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => acc + t.amount, 0);

  const balance = totalIncome - totalExpense;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const recentTransactions = mockTransactions.slice(0, 5);
  const newLeads = mockLeads.filter((l) => l.status === "novo").length;
  const convertedLeads = mockLeads.filter((l) => l.status === "convertido").length;

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
            value={mockClients.length}
            icon={<Users className="h-5 w-5" />}
            description={`${mockClients.filter((c) => c.origin === "indicacao").length} por indicação`}
          />
          <StatCard
            title="Leads Ativos"
            value={mockLeads.length}
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
              {recentTransactions.map((transaction) => (
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
              {mockLeads.slice(0, 5).map((lead) => (
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
