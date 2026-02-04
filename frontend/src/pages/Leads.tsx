import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader, EmptyState, StatCard } from "@/components/ui/page-components";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  DialogFooter,
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
import { useToast } from "@/components/ui/use-toast";
import {
  Plus,
  UserPlus,
  Search,
  Mail,
  Phone,
  Sparkles,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Pencil,
  Trash2,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
} from "lucide-react";
import { Lead, LeadStatus, ClientOrigin } from "@/types";
import { leadStatusLabels, leadStatusColors } from "@/data/leadStatus";
import { clientOriginLabels } from "@/data/clientOrigins";
import { leadsApi } from "@/lib/api";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function Leads() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Lead | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [newLead, setNewLead] = useState({
    name: "",
    responsibleName: "",
    email: "",
    phone: "",
    origin: "" as ClientOrigin,
    referredBy: "",
    notes: "",
  });
  const [editLead, setEditLead] = useState({
    name: "",
    responsibleName: "",
    email: "",
    phone: "",
    origin: "" as ClientOrigin,
    referredBy: "",
    notes: "",
    status: "novo" as LeadStatus,
  });

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    }
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  const normalizeLead = (lead: Lead): Lead => ({
    ...lead,
    createdAt: new Date(lead.createdAt),
    updatedAt: new Date(lead.updatedAt),
  });

  // Usar React Query para carregar leads
  const { data: leadsData = [], isLoading } = useQuery({
    queryKey: ["leads"],
    queryFn: async () => {
      const data = await leadsApi.getAll();
      return data.map(normalizeLead);
    },
  });

  const leads = leadsData as Lead[];

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || lead.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalCount = filteredLeads.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const pagedLeads = filteredLeads.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const statusCounts = {
    novo: leads.filter((l) => l.status === "novo").length,
    em_contato: leads.filter((l) => l.status === "em_contato").length,
    convertido: leads.filter((l) => l.status === "convertido").length,
    perdido: leads.filter((l) => l.status === "perdido").length,
  };

  // Mutations para criar, atualizar e deletar
  const createMutation = useMutation({
    mutationFn: (data: Omit<Lead, "id" | "createdAt" | "updatedAt">) => leadsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      setNewLead({
        name: "",
        responsibleName: "",
        email: "",
        phone: "",
        origin: "" as ClientOrigin,
        referredBy: "",
        notes: "",
      });
      setIsDialogOpen(false);
      toast({
        title: "Lead cadastrado",
        description: "O lead foi adicionado com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao adicionar lead",
        description: "Verifique os dados e tente novamente.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Lead> }) =>
      leadsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      setIsViewDialogOpen(false);
      setSelectedLead(null);
      setIsEditMode(false);
      toast({
        title: "Lead atualizado",
        description: "As alterações foram salvas com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao atualizar lead",
        description: "Verifique os dados e tente novamente.",
        variant: "destructive",
      });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: LeadStatus }) =>
      leadsApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast({
        title: "Status atualizado",
        description: "O status do lead foi alterado com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao atualizar status",
        description: "Não foi possível alterar o status.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => leadsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      setIsDeleteDialogOpen(false);
      setDeleteTarget(null);
      toast({
        title: "Lead excluído",
        description: "O lead foi removido com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao excluir lead",
        description: "Não foi possível remover o lead.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createMutation.mutateAsync({
        name: newLead.name,
        responsibleName: newLead.responsibleName,
        email: newLead.email,
        phone: newLead.phone,
        status: "novo",
        origin: newLead.origin,
        referredBy: newLead.origin === "indicacao" ? newLead.referredBy || undefined : undefined,
        notes: newLead.notes || undefined,
      });
    } catch (error) {
      console.error("Erro ao criar lead:", error);
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleViewLead = (lead: Lead) => {
    setSelectedLead(lead);
    setEditLead({
      name: lead.name,
      responsibleName: lead.responsibleName,
      email: lead.email,
      phone: lead.phone,
      origin: lead.origin,
      referredBy: lead.referredBy || "",
      notes: lead.notes || "",
      status: lead.status,
    });
    setIsEditMode(false);
    setIsViewDialogOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;

    setIsSubmitting(true);
    try {
      await updateMutation.mutateAsync({
        id: selectedLead.id,
        data: {
          name: editLead.name,
          responsibleName: editLead.responsibleName,
          email: editLead.email,
          phone: editLead.phone,
          origin: editLead.origin,
          referredBy: editLead.origin === "indicacao" ? editLead.referredBy || undefined : undefined,
          notes: editLead.notes || undefined,
          status: editLead.status,
        },
      });
      setIsEditMode(false);
    } catch (error) {
      console.error("Erro ao atualizar lead:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDeleteDialog = (lead: Lead) => {
    setDeleteTarget(lead);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async (leadId: string) => {
    setIsSubmitting(true);
    try {
      await deleteMutation.mutateAsync(leadId);
    } catch (error) {
      console.error("Erro ao excluir lead:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (leadId: string, status: LeadStatus) => {
    try {
      await updateStatusMutation.mutateAsync({ id: leadId, status });
    } catch (error) {
      console.error("Erro ao alterar status:", error);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterStatus, pageSize]);

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
        <PageHeader title="Leads" description="Acompanhe e converta seus leads">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Lead
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Adicionar Lead</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    value={newLead.name}
                    onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                    placeholder="Nome completo"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="responsibleName">Nome do responsável</Label>
                  <Input
                    id="responsibleName"
                    value={newLead.responsibleName}
                    onChange={(e) => setNewLead({ ...newLead, responsibleName: e.target.value })}
                    placeholder="Nome do responsável"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newLead.email}
                      onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                      placeholder="email@exemplo.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={newLead.phone}
                      onChange={(e) =>
                        setNewLead({ ...newLead, phone: formatPhone(e.target.value) })
                      }
                      placeholder="(00) 00000-0000"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="origin">Origem</Label>
                  <Select
                    value={newLead.origin}
                    onValueChange={(value: ClientOrigin) =>
                      setNewLead({ ...newLead, origin: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Como conheceu?" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(clientOriginLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {newLead.origin === "indicacao" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="referredBy">Quem indicou?</Label>
                    <Input
                      id="referredBy"
                      value={newLead.referredBy}
                      onChange={(e) => setNewLead({ ...newLead, referredBy: e.target.value })}
                      placeholder="Nome de quem indicou"
                    />
                  </motion.div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea
                    id="notes"
                    value={newLead.notes}
                    onChange={(e) => setNewLead({ ...newLead, notes: e.target.value })}
                    placeholder="Anotações sobre o lead"
                    rows={3}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  Adicionar Lead
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </PageHeader>

        {/* View/Edit Lead Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {isEditMode ? (
                  <>
                    <Pencil className="h-5 w-5" />
                    Editar Lead
                  </>
                ) : (
                  <>
                    <Eye className="h-5 w-5" />
                    Detalhes do Lead
                  </>
                )}
              </DialogTitle>
            </DialogHeader>

            {isEditMode ? (
              <form onSubmit={handleEditSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Nome</Label>
                  <Input
                    id="edit-name"
                    value={editLead.name}
                    onChange={(e) => setEditLead({ ...editLead, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-responsibleName">Nome do responsável</Label>
                  <Input
                    id="edit-responsibleName"
                    value={editLead.responsibleName}
                    onChange={(e) =>
                      setEditLead({ ...editLead, responsibleName: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-email">E-mail</Label>
                    <Input
                      id="edit-email"
                      type="email"
                      value={editLead.email}
                      onChange={(e) => setEditLead({ ...editLead, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-phone">Telefone</Label>
                    <Input
                      id="edit-phone"
                      value={editLead.phone}
                      onChange={(e) =>
                        setEditLead({ ...editLead, phone: formatPhone(e.target.value) })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-origin">Origem</Label>
                  <Select
                    value={editLead.origin}
                    onValueChange={(value: ClientOrigin) =>
                      setEditLead({ ...editLead, origin: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(clientOriginLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {editLead.origin === "indicacao" && (
                  <div className="space-y-2">
                    <Label htmlFor="edit-referredBy">Quem indicou?</Label>
                    <Input
                      id="edit-referredBy"
                      value={editLead.referredBy}
                      onChange={(e) => setEditLead({ ...editLead, referredBy: e.target.value })}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select
                    value={editLead.status}
                    onValueChange={(value: LeadStatus) =>
                      setEditLead({ ...editLead, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(leadStatusLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-notes">Observações</Label>
                  <Textarea
                    id="edit-notes"
                    value={editLead.notes}
                    onChange={(e) => setEditLead({ ...editLead, notes: e.target.value })}
                    rows={3}
                  />
                </div>

                <DialogFooter className="gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsEditMode(false)} disabled={isSubmitting}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    Salvar Alterações
                  </Button>
                </DialogFooter>
              </form>
            ) : (
              selectedLead && (
                <div className="space-y-4 mt-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground">Nome</p>
                        <p className="font-medium text-foreground">{selectedLead.name}</p>
                      </div>
                      <Badge className={cn("font-medium border pointer-events-none", leadStatusColors[selectedLead.status])}>
                        {leadStatusLabels[selectedLead.status]}
                      </Badge>
                    </div>

                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground">Responsável</p>
                      <p className="text-sm text-foreground">{selectedLead.responsibleName}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Mail className="h-3 w-3" /> E-mail
                        </p>
                        <p className="text-sm text-foreground">{selectedLead.email}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Phone className="h-3 w-3" /> Telefone
                        </p>
                        <p className="text-sm text-foreground">{selectedLead.phone}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground">Origem</p>
                        <p className="text-sm text-foreground">
                          {clientOriginLabels[selectedLead.origin]}
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground">Última atualização</p>
                        <p className="text-sm text-foreground">
                          {format(selectedLead.updatedAt, "dd/MM/yyyy", { locale: ptBR })}
                        </p>
                      </div>
                    </div>

                    {selectedLead.origin === "indicacao" && (
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground">Quem indicou?</p>
                        <p className="text-sm text-foreground">{selectedLead.referredBy || "—"}</p>
                      </div>
                    )}

                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground">Data de Cadastro</p>
                      <p className="text-sm text-foreground">
                        {format(selectedLead.createdAt, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </p>
                    </div>

                    {selectedLead.notes && (
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground">Observações</p>
                        <p className="text-sm text-foreground whitespace-pre-wrap">{selectedLead.notes}</p>
                      </div>
                    )}
                  </div>

                  <DialogFooter>
                    <Button onClick={() => setIsEditMode(true)} className="w-full">
                      <Pencil className="h-4 w-4 mr-2" />
                      Editar Lead
                    </Button>
                  </DialogFooter>
                </div>
              )
            )}
          </DialogContent>
        </Dialog>

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir lead?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não poderá ser desfeita. O lead será removido permanentemente.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isSubmitting}>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteTarget && handleDelete(deleteTarget.id)}
                disabled={isSubmitting}
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <div className="rounded-xl border p-6 card-shadow bg-[#e4e7dd] border-[#e4e7dd]">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Novos</p>
                <p className="text-2xl font-semibold text-foreground">{statusCounts.novo}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-foreground/10 text-foreground">
                <Sparkles className="h-5 w-5" />
              </div>
            </div>
          </div>
          <StatCard
            title="Em Contato"
            value={statusCounts.em_contato}
            icon={<Clock className="h-5 w-5" />}
            variant="warning"
          />
          <StatCard
            title="Convertidos"
            value={statusCounts.convertido}
            icon={<CheckCircle className="h-5 w-5" />}
            variant="success"
          />
          <StatCard
            title="Perdidos"
            value={statusCounts.perdido}
            icon={<XCircle className="h-5 w-5" />}
            variant="destructive"
          />
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou e-mail..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {Object.entries(leadStatusLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Leads Table */}
        {isLoading ? (
          <div className="rounded-xl border bg-card card-shadow p-8 text-center text-muted-foreground">
            Carregando leads...
          </div>
        ) : filteredLeads.length === 0 ? (
          <EmptyState
            icon={<UserPlus className="h-8 w-8 text-muted-foreground" />}
            title="Nenhum lead encontrado"
            description="Adicione seu primeiro lead para começar a acompanhar suas oportunidades."
            action={
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Lead
              </Button>
            }
          />
        ) : (
          <div className="rounded-xl border bg-card card-shadow">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lead</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Origem</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Atualização</TableHead>
                      <TableHead className="w-28">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {pagedLeads.map((lead, index) => (
                    <motion.tr
                      key={lead.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b transition-colors"
                    >
                      <TableCell>
                        <p className="font-medium text-foreground">{lead.name}</p>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            <span className="text-foreground">{lead.email}</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            {lead.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {clientOriginLabels[lead.origin]}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={cn(
                            "font-medium border pointer-events-none",
                            leadStatusColors[lead.status]
                          )}
                        >
                          {leadStatusLabels[lead.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(lead.updatedAt, "dd MMM yyyy", { locale: ptBR })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewLead(lead)}
                          className="text-green-number hover:text-green-number hover:bg-primary/10"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDeleteDialog(lead)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </TableBody>
            </Table>
          </div>
        )}
        {totalCount > 0 && (
          <div className="mt-4 space-y-3">
            <div className="flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
              <span>Mostrando {pagedLeads.length} de {totalCount}</span>
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
