import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader, StatCard } from "@/components/ui/page-components";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Wallet,
  TrendingUp,
  TrendingDown,
  CalendarIcon,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { AsaasPayment, AsaasFinancialData } from "@/types";
import { asaasApi } from "@/lib/api";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

export default function AsaasFinancial() {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [viewMode, setViewMode] = useState<"all" | "entries" | "outflows">("all");

  const buildQuery = () => ({
    start_date: startDate ? format(startDate, "yyyy-MM-dd") : undefined,
    end_date: endDate ? format(endDate, "yyyy-MM-dd") : undefined,
  });

  const query = buildQuery();
  const queryKey = ["asaas-financial", query, viewMode];

  const { data: financialData, isLoading, error, refetch } = useQuery<AsaasFinancialData>({
    queryKey,
    queryFn: async () => {
      try {
        console.log('Buscando dados da Asaas, viewMode:', viewMode, 'query:', query);
        
        if (viewMode === "entries") {
          const entries = await asaasApi.getEntries(query);
          console.log('Entries recebidas:', entries);
          return {
            entries: {
              received: { data: entries || [], total: (entries || []).reduce((sum, p) => sum + (p.value || 0), 0), count: (entries || []).length },
              pending: { data: [], total: 0, count: 0 },
              overdue: { data: [], total: 0, count: 0 },
            },
            summary: {
              total_received: (entries || []).reduce((sum, p) => sum + (p.value || 0), 0),
              total_pending: 0,
              total_overdue: 0,
              total_expected: 0,
            },
          };
        } else if (viewMode === "outflows") {
          const outflows = await asaasApi.getOutflows(query);
          console.log('Outflows recebidos:', outflows);
          return {
            entries: {
              received: { data: [], total: 0, count: 0 },
              pending: { data: outflows || [], total: (outflows || []).reduce((sum, p) => sum + (p.value || 0), 0), count: (outflows || []).length },
              overdue: { data: [], total: 0, count: 0 },
            },
            summary: {
              total_received: 0,
              total_pending: (outflows || []).reduce((sum, p) => sum + (p.value || 0), 0),
              total_overdue: 0,
              total_expected: (outflows || []).reduce((sum, p) => sum + (p.value || 0), 0),
            },
          };
        }
        const financial = await asaasApi.getFinancial(query);
        console.log('Financial recebido:', financial);
        return financial || {
          entries: {
            received: { data: [], total: 0, count: 0 },
            pending: { data: [], total: 0, count: 0 },
            overdue: { data: [], total: 0, count: 0 },
          },
          summary: {
            total_received: 0,
            total_pending: 0,
            total_overdue: 0,
            total_expected: 0,
          },
        };
      } catch (err) {
        console.error('Erro ao buscar dados da Asaas:', err);
        const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
        return {
          entries: {
            received: { data: [], total: 0, count: 0 },
            pending: { data: [], total: 0, count: 0 },
            overdue: { data: [], total: 0, count: 0 },
          },
          summary: {
            total_received: 0,
            total_pending: 0,
            total_overdue: 0,
            total_expected: 0,
          },
          error: errorMessage,
        };
      }
    },
    retry: 1,
    onError: (err) => {
      console.error('Erro na query:', err);
    },
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      RECEIVED: { label: "Recebido", variant: "default" },
      PENDING: { label: "Pendente", variant: "secondary" },
      OVERDUE: { label: "Vencido", variant: "destructive" },
      REFUNDED: { label: "Estornado", variant: "outline" },
      RECEIVED_IN_CASH_UNDONE: { label: "Recebido em dinheiro desfeito", variant: "outline" },
    };

    const statusInfo = statusMap[status] || { label: status, variant: "outline" as const };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const getBillingTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      BOLETO: "Boleto",
      CREDIT_CARD: "Cartão de Crédito",
      DEBIT_CARD: "Cartão de Débito",
      PIX: "PIX",
      TRANSFER: "Transferência",
    };
    return typeMap[type] || type;
  };

  const displayedPayments: AsaasPayment[] = financialData && financialData.entries
    ? viewMode === "entries"
      ? (financialData.entries.received?.data || [])
      : viewMode === "outflows"
      ? [...(financialData.entries.pending?.data || []), ...(financialData.entries.overdue?.data || [])]
      : [
          ...(financialData.entries.received?.data || []),
          ...(financialData.entries.pending?.data || []),
          ...(financialData.entries.overdue?.data || []),
        ]
    : [];

  // Estado inicial de loading
  if (isLoading && !financialData) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <PageHeader
            title="Entradas e Saídas - Asaas"
            description="Consulte pagamentos e recebimentos da plataforma Asaas"
          />
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Carregando dados da Asaas...</p>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <PageHeader
          title="Entradas e Saídas - Asaas"
          description="Consulte pagamentos e recebimentos da plataforma Asaas"
        >
          <Button onClick={() => refetch()} variant="outline" size="sm" disabled={isLoading}>
            <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
            Atualizar
          </Button>
        </PageHeader>

        {/* Filtros */}
        <div className="bg-card rounded-lg border p-4 space-y-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <Label>Data Inicial</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecione"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    locale={ptBR}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex-1 min-w-[200px]">
              <Label>Data Final</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecione"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    locale={ptBR}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex-1 min-w-[200px]">
              <Label>Visualização</Label>
              <Select value={viewMode} onValueChange={(value) => setViewMode(value as typeof viewMode)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="entries">Apenas Entradas</SelectItem>
                  <SelectItem value="outflows">Apenas Saídas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(startDate || endDate) && (
              <div className="flex items-end">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setStartDate(undefined);
                    setEndDate(undefined);
                  }}
                >
                  Limpar Filtros
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Mensagem de Erro */}
        {(error || financialData?.error) && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <p className="text-destructive font-medium">Erro ao carregar dados</p>
            <p className="text-sm text-muted-foreground mt-1">
              {error instanceof Error 
                ? error.message 
                : financialData?.error 
                ? financialData.error 
                : 'Erro desconhecido ao consultar a API da Asaas'}
            </p>
            <Button onClick={() => refetch()} variant="outline" size="sm" className="mt-2">
              Tentar novamente
            </Button>
          </div>
        )}

        {/* Cards de Resumo */}
        {financialData && financialData.summary && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Recebido"
              value={formatCurrency(financialData.summary.total_received || 0)}
              icon={<TrendingUp className="h-5 w-5" />}
              description={`${financialData.entries?.received?.count || 0} pagamentos`}
              className="bg-green-500/10 border-green-500/20"
            />
            <StatCard
              title="Pendente"
              value={formatCurrency(financialData.summary.total_pending || 0)}
              icon={<Wallet className="h-5 w-5" />}
              description={`${financialData.entries?.pending?.count || 0} pagamentos`}
              className="bg-yellow-500/10 border-yellow-500/20"
            />
            <StatCard
              title="Vencido"
              value={formatCurrency(financialData.summary.total_overdue || 0)}
              icon={<TrendingDown className="h-5 w-5" />}
              description={`${financialData.entries?.overdue?.count || 0} pagamentos`}
              className="bg-red-500/10 border-red-500/20"
            />
            <StatCard
              title="Total Esperado"
              value={formatCurrency(financialData.summary.total_expected || 0)}
              icon={<ArrowUpRight className="h-5 w-5" />}
              description="Pendente + Vencido"
              className="bg-blue-500/10 border-blue-500/20"
            />
          </div>
        )}

        {/* Tabela de Pagamentos */}
        <div className="bg-card rounded-lg border">
          <div className="p-4 border-b">
            <h3 className="font-semibold">
              {viewMode === "entries" ? "Entradas (Recebimentos)" : viewMode === "outflows" ? "Saídas (Pendentes)" : "Todos os Pagamentos"}
            </h3>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Pagamento</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Carregando...
                    </TableCell>
                  </TableRow>
                )}
                {!isLoading && displayedPayments.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Nenhum pagamento encontrado
                    </TableCell>
                  </TableRow>
                )}
                {!isLoading &&
                  displayedPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-mono text-xs">{payment.id.substring(0, 8)}...</TableCell>
                      <TableCell>{payment.description || "-"}</TableCell>
                      <TableCell className="font-semibold">{formatCurrency(payment.value)}</TableCell>
                      <TableCell>{getStatusBadge(payment.status)}</TableCell>
                      <TableCell>{getBillingTypeLabel(payment.billingType)}</TableCell>
                      <TableCell>{formatDate(payment.dueDate)}</TableCell>
                      <TableCell>{formatDate(payment.paymentDate || payment.clientPaymentDate)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {payment.bankSlipUrl && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(payment.bankSlipUrl, "_blank")}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          )}
                          {payment.invoiceUrl && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(payment.invoiceUrl, "_blank")}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
