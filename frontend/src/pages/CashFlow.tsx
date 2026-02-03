import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader, StatCard } from "@/components/ui/page-components";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  Plus,
  Wallet,
  TrendingUp,
  TrendingDown,
  Filter,
  CalendarIcon,
  Pencil,
  Trash2,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
} from "lucide-react";
import { Transaction, TransactionType } from "@/types";
import { transactionsApi } from "@/lib/api";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function CashFlow() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState({ income: 0, expense: 0, balance: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [newTransaction, setNewTransaction] = useState({
    description: "",
    amount: "",
    type: "income" as TransactionType,
    category: "",
  });
  const [editTransaction, setEditTransaction] = useState({
    description: "",
    amount: "",
    type: "income" as TransactionType,
    category: "",
  });

  const buildQuery = () => ({
    type: filterType === "all" ? undefined : (filterType as TransactionType),
    startDate: startDate ? format(startDate, "yyyy-MM-dd") : undefined,
    endDate: endDate ? format(endDate, "yyyy-MM-dd") : undefined,
  });

  const normalizeTransaction = (transaction: Transaction): Transaction => ({
    ...transaction,
    date: new Date(transaction.date),
    createdAt: new Date(transaction.createdAt),
  });

  const totalCount = transactions.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const pagedTransactions = transactions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const loadTransactions = async () => {
    setIsLoading(true);
    try {
      const query = buildQuery();
      const [data, summaryData] = await Promise.all([
        transactionsApi.getAll(query),
        transactionsApi.getSummary(query),
      ]);
      setTransactions(data.map(normalizeTransaction));
      setSummary(summaryData);
    } catch (error) {
      console.error("Erro ao carregar transações:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await transactionsApi.create({
        description: newTransaction.description,
        amount: parseFloat(newTransaction.amount),
        type: newTransaction.type,
        category: newTransaction.category,
        date: new Date(),
      });
      setNewTransaction({ description: "", amount: "", type: "income", category: "" });
      setIsDialogOpen(false);
      await loadTransactions();
    } catch (error) {
      console.error("Erro ao criar transação:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTransaction) return;
    setIsSubmitting(true);
    try {
      await transactionsApi.update(editingTransaction.id, {
        description: editTransaction.description,
        amount: parseFloat(editTransaction.amount),
        type: editTransaction.type,
        category: editTransaction.category,
      });
      setIsEditDialogOpen(false);
      setEditingTransaction(null);
      await loadTransactions();
    } catch (error) {
      console.error("Erro ao atualizar transação:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditDialog = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setEditTransaction({
      description: transaction.description,
      amount: String(transaction.amount),
      type: transaction.type,
      category: transaction.category,
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (transaction: Transaction) => {
    setDeleteTarget(transaction);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async (transactionId: string) => {
    setIsSubmitting(true);
    try {
      await transactionsApi.delete(transactionId);
      await loadTransactions();
      setIsDeleteDialogOpen(false);
      setDeleteTarget(null);
    } catch (error) {
      console.error("Erro ao excluir transação:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const clearDateFilter = () => {
    setStartDate(undefined);
    setEndDate(undefined);
  };

  useEffect(() => {
    void loadTransactions();
  }, [filterType, startDate, endDate]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterType, startDate, endDate, pageSize]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);


  return (
    <AppLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <PageHeader title="Fluxo de Caixa" description="Controle suas entradas e saídas financeiras">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nova Transação
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {newTransaction.type === "income" ? "Nova Entrada" : "Nova Saída"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground mb-2">Tipo</p>
                    <Select
                      value={newTransaction.type}
                      onValueChange={(value: TransactionType) =>
                        setNewTransaction({ ...newTransaction, type: value })
                      }
                    >
                      <SelectTrigger className={cn(
                        "focus:ring-0 focus:ring-offset-0",
                        newTransaction.type === "income"
                          ? "border-success/50 focus-visible:ring-success focus-visible:ring-offset-2"
                          : "border-destructive/50 focus-visible:ring-destructive focus-visible:ring-offset-2"
                      )}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="income">Entrada</SelectItem>
                        <SelectItem value="expense">Saída</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground mb-2">Descrição</p>
                    <Input
                      id="description"
                      value={newTransaction.description}
                      onChange={(e) =>
                        setNewTransaction({ ...newTransaction, description: e.target.value })
                      }
                      placeholder="Ex: Venda de produto"
                      required
                      className={cn(
                        "bg-background",
                        newTransaction.type === "income"
                          ? "border-success/50 focus-visible:ring-success focus-visible:ring-offset-2"
                          : "border-destructive/50 focus-visible:ring-destructive focus-visible:ring-offset-2"
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground mb-2">Valor</p>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        value={newTransaction.amount}
                        onChange={(e) =>
                          setNewTransaction({ ...newTransaction, amount: e.target.value })
                        }
                        placeholder="0,00"
                        required
                        className={cn(
                          "bg-background",
                          newTransaction.type === "income"
                            ? "border-success/50 focus-visible:ring-success focus-visible:ring-offset-2"
                            : "border-destructive/50 focus-visible:ring-destructive focus-visible:ring-offset-2"
                        )}
                      />
                    </div>

                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground mb-2">Categoria</p>
                      <Input
                        id="category"
                        value={newTransaction.category}
                        onChange={(e) =>
                          setNewTransaction({ ...newTransaction, category: e.target.value })
                        }
                        placeholder="Ex: Vendas"
                        required
                        className={cn(
                          "bg-background",
                          newTransaction.type === "income"
                            ? "border-success/50 focus-visible:ring-success focus-visible:ring-offset-2"
                            : "border-destructive/50 focus-visible:ring-destructive focus-visible:ring-offset-2"
                        )}
                      />
                    </div>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className={cn(
                    "w-full",
                    newTransaction.type === "income"
                      ? "bg-success hover:bg-success/90 text-success-foreground"
                      : "bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                  )}
                  disabled={isSubmitting}
                >
                  Adicionar {newTransaction.type === "income" ? "Entrada" : "Saída"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Editar Transação</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleEditSubmit} className="space-y-4 mt-4">
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground mb-2">Tipo</p>
                    <Select
                      value={editTransaction.type}
                      onValueChange={(value: TransactionType) =>
                        setEditTransaction({ ...editTransaction, type: value })
                      }
                    >
                      <SelectTrigger className={cn(
                        "focus:ring-0 focus:ring-offset-0",
                        editTransaction.type === "income"
                          ? "border-success/50 focus-visible:ring-success focus-visible:ring-offset-2"
                          : "border-destructive/50 focus-visible:ring-destructive focus-visible:ring-offset-2"
                      )}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="income">Entrada</SelectItem>
                        <SelectItem value="expense">Saída</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground mb-2">Descrição</p>
                    <Input
                      id="edit-description"
                      value={editTransaction.description}
                      onChange={(e) =>
                        setEditTransaction({ ...editTransaction, description: e.target.value })
                      }
                      placeholder="Ex: Venda de produto"
                      required
                      className={cn(
                        "bg-background",
                        editTransaction.type === "income"
                          ? "border-success/50 focus-visible:ring-success focus-visible:ring-offset-2"
                          : "border-destructive/50 focus-visible:ring-destructive focus-visible:ring-offset-2"
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground mb-2">Valor</p>
                      <Input
                        id="edit-amount"
                        type="number"
                        step="0.01"
                        value={editTransaction.amount}
                        onChange={(e) =>
                          setEditTransaction({ ...editTransaction, amount: e.target.value })
                        }
                        placeholder="0,00"
                        required
                        className={cn(
                          "bg-background",
                          editTransaction.type === "income"
                            ? "border-success/50 focus-visible:ring-success focus-visible:ring-offset-2"
                            : "border-destructive/50 focus-visible:ring-destructive focus-visible:ring-offset-2"
                        )}
                      />
                    </div>

                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground mb-2">Categoria</p>
                      <Input
                        id="edit-category"
                        value={editTransaction.category}
                        onChange={(e) =>
                          setEditTransaction({ ...editTransaction, category: e.target.value })
                        }
                        placeholder="Ex: Vendas"
                        required
                        className={cn(
                          "bg-background",
                          editTransaction.type === "income"
                            ? "border-success/50 focus-visible:ring-success focus-visible:ring-offset-2"
                            : "border-destructive/50 focus-visible:ring-destructive focus-visible:ring-offset-2"
                        )}
                      />
                    </div>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className={cn(
                    "w-full",
                    editTransaction.type === "income"
                      ? "bg-success hover:bg-success/90 text-success-foreground"
                      : "bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                  )}
                  disabled={isSubmitting}
                >
                  Salvar alterações
                </Button>
              </form>
            </DialogContent>
          </Dialog>
          <AlertDialog
            open={isDeleteDialogOpen}
            onOpenChange={(open) => {
              setIsDeleteDialogOpen(open);
              if (!open) {
                setDeleteTarget(null);
              }
            }}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir transação</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir
                  {deleteTarget ? ` "${deleteTarget.description}"` : " esta transação"}? Essa ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="hover:bg-primary hover:text-primary-foreground">
                  Cancelar
                </AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                  onClick={() => deleteTarget && handleDelete(deleteTarget.id)}
                  disabled={isSubmitting || !deleteTarget}
                >
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </PageHeader>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <StatCard
            title="Saldo Total"
            value={formatCurrency(summary.balance)}
            icon={<Wallet className="h-5 w-5" />}
            variant={summary.balance >= 0 ? "success" : "destructive"}
          />
          <StatCard
            title="Total de Entradas"
            value={formatCurrency(summary.income)}
            icon={<TrendingUp className="h-5 w-5" />}
            variant="success"
          />
          <StatCard
            title="Total de Saídas"
            value={formatCurrency(summary.expense)}
            icon={<TrendingDown className="h-5 w-5" />}
            variant="destructive"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Filtrar:</span>
          </div>
          
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className={cn(
              "w-40",
              filterType === "income"
                ? "border-success/50 focus:ring-success"
                : filterType === "expense"
                ? "border-destructive/50 focus:ring-destructive"
                : ""
            )}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="income">Entradas</SelectItem>
              <SelectItem value="expense">Saídas</SelectItem>
            </SelectContent>
          </Select>

          {/* Date Range Filter */}
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-40 justify-start text-left font-normal hover:bg-primary hover:text-primary-foreground">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "dd/MM/yyyy") : "Data inicial"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>

            <span className="text-muted-foreground">até</span>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-40 justify-start text-left font-normal hover:bg-primary hover:text-primary-foreground">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "dd/MM/yyyy") : "Data final"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>

            {(startDate || endDate) && (
              <Button variant="ghost" size="sm" onClick={clearDateFilter} className="hover:bg-primary hover:text-primary-foreground">
                Limpar
              </Button>
            )}
          </div>
        </div>

        {/* Transactions Table */}
        <div className="rounded-xl border bg-card card-shadow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence>
                {pagedTransactions.map((transaction, index) => (
                  <motion.tr
                    key={transaction.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b transition-colors"
                  >
                    <TableCell>
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
                    </TableCell>
                    <TableCell className="font-medium text-foreground">{transaction.description}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{transaction.category}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(transaction.date, "dd MMM yyyy", { locale: ptBR })}
                    </TableCell>
                    <TableCell
                      className={`text-right font-semibold ${
                        transaction.type === "income" ? "text-green-number" : "text-destructive"
                      }`}
                    >
                      {transaction.type === "income" ? "+" : "-"}
                      {formatCurrency(transaction.amount)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(transaction)}
                          className="text-green-number hover:text-green-number hover:bg-primary/10"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDeleteDialog(transaction)}
                          disabled={isSubmitting}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </motion.tr>
                ))}
              </AnimatePresence>
              {!isLoading && transactions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-6 text-center text-sm text-muted-foreground">
                    Nenhuma transação encontrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        {totalCount > 0 && (
          <div className="mt-4 space-y-3">
            <div className="flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
              <span>Mostrando {pagedTransactions.length} de {totalCount}</span>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <span>Por página</span>
                  <Select
                    value={String(pageSize)}
                    onValueChange={(value) => setPageSize(Number(value))}
                  >
                    <SelectTrigger className="h-8 w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[5, 10, 20, 50].map((size) => (
                        <SelectItem key={size} value={String(size)}>
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <span>Página {currentPage} de {totalPages}</span>
              </div>
            </div>
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </AppLayout>
  );
}
