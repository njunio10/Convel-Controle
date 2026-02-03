import { useState } from "react";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowDownLeft, ArrowUpRight, Plus, Wallet, TrendingUp, TrendingDown, Filter, CalendarIcon } from "lucide-react";
import { Transaction, TransactionType } from "@/types";
import { mockTransactions, transactionCategories } from "@/data/mockData";
import { format, isWithinInterval, startOfDay, endOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function CashFlow() {
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [newTransaction, setNewTransaction] = useState({
    description: "",
    amount: "",
    type: "income" as TransactionType,
    category: "",
  });

  const filteredTransactions = transactions.filter((t) => {
    if (filterType !== "all" && t.type !== filterType) return false;
    
    if (startDate && endDate) {
      return isWithinInterval(t.date, {
        start: startOfDay(startDate),
        end: endOfDay(endDate),
      });
    }
    if (startDate) {
      return t.date >= startOfDay(startDate);
    }
    if (endDate) {
      return t.date <= endOfDay(endDate);
    }
    
    return true;
  });

  const totalIncome = filteredTransactions
    .filter((t) => t.type === "income")
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpense = filteredTransactions
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => acc + t.amount, 0);

  const balance = totalIncome - totalExpense;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const transaction: Transaction = {
      id: Date.now().toString(),
      description: newTransaction.description,
      amount: parseFloat(newTransaction.amount),
      type: newTransaction.type,
      category: newTransaction.category,
      date: new Date(),
      createdAt: new Date(),
    };
    setTransactions([transaction, ...transactions]);
    setNewTransaction({ description: "", amount: "", type: "income", category: "" });
    setIsDialogOpen(false);
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
                      <Select
                        value={newTransaction.category}
                        onValueChange={(value) =>
                          setNewTransaction({ ...newTransaction, category: value })
                        }
                      >
                        <SelectTrigger className={cn(
                          "bg-background",
                          newTransaction.type === "income"
                            ? "border-success/50 focus-visible:ring-success focus-visible:ring-offset-2"
                            : "border-destructive/50 focus-visible:ring-destructive focus-visible:ring-offset-2"
                        )}>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {transactionCategories.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                >
                  Adicionar {newTransaction.type === "income" ? "Entrada" : "Saída"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </PageHeader>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <StatCard
            title="Saldo Total"
            value={formatCurrency(balance)}
            icon={<Wallet className="h-5 w-5" />}
            variant={balance >= 0 ? "success" : "destructive"}
          />
          <StatCard
            title="Total de Entradas"
            value={formatCurrency(totalIncome)}
            icon={<TrendingUp className="h-5 w-5" />}
            variant="success"
          />
          <StatCard
            title="Total de Saídas"
            value={formatCurrency(totalExpense)}
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
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence>
                {filteredTransactions.map((transaction, index) => (
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
                  </motion.tr>
                ))}
              </AnimatePresence>
            </TableBody>
          </Table>
        </div>
      </motion.div>
    </AppLayout>
  );
}
