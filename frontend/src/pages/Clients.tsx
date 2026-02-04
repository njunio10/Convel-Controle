import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader, EmptyState } from "@/components/ui/page-components";
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
import {
  Plus,
  Users,
  Search,
  Mail,
  Phone,
  Eye,
  Pencil,
  Trash2,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Client, ClientOrigin } from "@/types";
import { clientOriginLabels } from "../data/clientOrigins";
import { clientsApi } from "@/lib/api";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";

export default function Clients() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Client | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [newClient, setNewClient] = useState({
    name: "",
    responsibleName: "",
    email: "",
    phone: "",
    origin: "" as ClientOrigin,
    referredBy: "",
    monthlyFee: "",
    notes: "",
  });
  const [editClient, setEditClient] = useState({
    name: "",
    responsibleName: "",
    email: "",
    phone: "",
    origin: "" as ClientOrigin,
    referredBy: "",
    monthlyFee: "",
    notes: "",
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

  const formatCurrency = (value: number | null) => {
    if (value === null || Number.isNaN(value)) return "—";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const normalizeClient = (client: Client): Client => ({
    ...client,
    createdAt: new Date(client.createdAt),
  });

  // Usar React Query para carregar clientes
  const { data: clientsData = [], isLoading } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const data = await clientsApi.getAll();
      return data.map(normalizeClient);
    },
  });

  const clients = clientsData as Client[];

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalCount = filteredClients.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const pagedClients = filteredClients.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Mutations para criar, atualizar e deletar
  const createMutation = useMutation({
    mutationFn: (data: Omit<Client, "id" | "createdAt">) => clientsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      setNewClient({
        name: "",
        responsibleName: "",
        email: "",
        phone: "",
        origin: "" as ClientOrigin,
        referredBy: "",
        monthlyFee: "",
        notes: "",
      });
      setIsDialogOpen(false);
      toast({
        title: "Cliente cadastrado",
        description: "O cliente foi adicionado com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao adicionar cliente",
        description: "Verifique os dados e tente novamente.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Client> }) =>
      clientsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      setIsViewDialogOpen(false);
      setSelectedClient(null);
      toast({
        title: "Cliente atualizado",
        description: "As alterações foram salvas com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao atualizar cliente",
        description: "Verifique os dados e tente novamente.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => clientsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      setIsDeleteDialogOpen(false);
      setDeleteTarget(null);
      toast({
        title: "Cliente excluído",
        description: "O cliente foi removido com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao excluir cliente",
        description: "Não foi possível remover o cliente.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, pageSize]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createMutation.mutateAsync({
        name: newClient.name,
        responsibleName: newClient.responsibleName,
        email: newClient.email,
        phone: newClient.phone,
        origin: newClient.origin,
        referredBy: newClient.origin === "indicacao" ? newClient.referredBy || undefined : undefined,
        monthlyFee: newClient.monthlyFee ? parseFloat(newClient.monthlyFee) : 0,
        notes: newClient.notes || undefined,
      });
    } catch (error) {
      console.error("Erro ao criar cliente:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewClient = (client: Client) => {
    setSelectedClient(client);
    setEditClient({
      name: client.name,
      responsibleName: client.responsibleName,
      email: client.email,
      phone: client.phone,
      origin: client.origin,
      referredBy: client.referredBy || "",
      monthlyFee: client.monthlyFee !== null ? String(client.monthlyFee) : "",
      notes: client.notes || "",
    });
    setIsEditMode(false);
    setIsViewDialogOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;
    setIsSubmitting(true);
    try {
      await updateMutation.mutateAsync({
        id: selectedClient.id,
        data: {
          name: editClient.name,
          responsibleName: editClient.responsibleName,
          email: editClient.email,
          phone: editClient.phone,
          origin: editClient.origin,
          referredBy: editClient.origin === "indicacao" ? editClient.referredBy || undefined : undefined,
          monthlyFee: editClient.monthlyFee ? parseFloat(editClient.monthlyFee) : 0,
          notes: editClient.notes || undefined,
        },
      });
      setIsEditMode(false);
    } catch (error) {
      console.error("Erro ao atualizar cliente:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDeleteDialog = (client: Client) => {
    setDeleteTarget(client);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async (clientId: string) => {
    setIsSubmitting(true);
    try {
      await deleteMutation.mutateAsync(clientId);
    } catch (error) {
      console.error("Erro ao remover cliente:", error);
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <AppLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <PageHeader title="Clientes" description="Gerencie sua base de clientes">
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Cliente
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Adicionar Cliente</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    value={newClient.name}
                    onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                    placeholder="Nome completo"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="responsibleName">Nome do responsável</Label>
                  <Input
                    id="responsibleName"
                    value={newClient.responsibleName}
                    onChange={(e) =>
                      setNewClient({ ...newClient, responsibleName: e.target.value })
                    }
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
                      value={newClient.email}
                      onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                      placeholder="email@exemplo.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={newClient.phone}
                      onChange={(e) =>
                        setNewClient({ ...newClient, phone: formatPhone(e.target.value) })
                      }
                      placeholder="(00) 00000-0000"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="origin">Origem</Label>
                  <Select
                    value={newClient.origin}
                    onValueChange={(value: ClientOrigin) =>
                      setNewClient({ ...newClient, origin: value })
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

                {newClient.origin === "indicacao" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="referredBy">Quem indicou?</Label>
                    <Input
                      id="referredBy"
                      value={newClient.referredBy}
                      onChange={(e) => setNewClient({ ...newClient, referredBy: e.target.value })}
                      placeholder="Nome de quem indicou"
                    />
                  </motion.div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="monthlyFee">Valor da mensalidade</Label>
                  <Input
                    id="monthlyFee"
                    type="number"
                    step="0.01"
                    value={newClient.monthlyFee}
                    onChange={(e) =>
                      setNewClient({ ...newClient, monthlyFee: e.target.value })
                    }
                    placeholder="0,00"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea
                    id="notes"
                    value={newClient.notes}
                    onChange={(e) => setNewClient({ ...newClient, notes: e.target.value })}
                    placeholder="Anotações sobre o cliente"
                    rows={3}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  Adicionar Cliente
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </PageHeader>

        {/* View/Edit Client Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {isEditMode ? (
                  <>
                    <Pencil className="h-5 w-5" />
                    Editar Cliente
                  </>
                ) : (
                  <>
                    <Eye className="h-5 w-5" />
                    Detalhes do Cliente
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
                    value={editClient.name}
                    onChange={(e) => setEditClient({ ...editClient, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-responsibleName">Nome do responsável</Label>
                  <Input
                    id="edit-responsibleName"
                    value={editClient.responsibleName}
                    onChange={(e) =>
                      setEditClient({ ...editClient, responsibleName: e.target.value })
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
                      value={editClient.email}
                      onChange={(e) => setEditClient({ ...editClient, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-phone">Telefone</Label>
                    <Input
                      id="edit-phone"
                      value={editClient.phone}
                      onChange={(e) =>
                        setEditClient({ ...editClient, phone: formatPhone(e.target.value) })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-origin">Origem</Label>
                  <Select
                    value={editClient.origin}
                    onValueChange={(value: ClientOrigin) =>
                      setEditClient({ ...editClient, origin: value })
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

                {editClient.origin === "indicacao" && (
                  <div className="space-y-2">
                    <Label htmlFor="edit-referredBy">Quem indicou?</Label>
                    <Input
                      id="edit-referredBy"
                      value={editClient.referredBy}
                      onChange={(e) => setEditClient({ ...editClient, referredBy: e.target.value })}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="edit-monthlyFee">Valor da mensalidade</Label>
                  <Input
                    id="edit-monthlyFee"
                    type="number"
                    step="0.01"
                    value={editClient.monthlyFee}
                    onChange={(e) =>
                      setEditClient({ ...editClient, monthlyFee: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-notes">Observações</Label>
                  <Textarea
                    id="edit-notes"
                    value={editClient.notes}
                    onChange={(e) => setEditClient({ ...editClient, notes: e.target.value })}
                    rows={3}
                  />
                </div>

                <DialogFooter className="gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsEditMode(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>Salvar Alterações</Button>
                </DialogFooter>
              </form>
            ) : (
              selectedClient && (
                <div className="space-y-4 mt-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground">Nome</p>
                        <p className="font-medium text-foreground">{selectedClient.name}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground">Responsável</p>
                        <p className="font-medium text-foreground">{selectedClient.responsibleName}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Mail className="h-3 w-3" /> E-mail
                        </p>
                        <p className="text-sm text-foreground">{selectedClient.email}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Phone className="h-3 w-3" /> Telefone
                        </p>
                        <p className="text-sm text-foreground">{selectedClient.phone}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground">Origem</p>
                        <Badge variant="secondary" className="mt-1">
                          {clientOriginLabels[selectedClient.origin]}
                        </Badge>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground">Indicado por</p>
                        <p className="text-sm text-foreground">{selectedClient.referredBy || "—"}</p>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground">Mensalidade</p>
                      <p className="text-sm text-foreground">
                        {formatCurrency(selectedClient.monthlyFee)}
                      </p>
                    </div>

                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground">Data de Cadastro</p>
                      <p className="text-sm text-foreground">
                        {format(selectedClient.createdAt, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </p>
                    </div>

                    {selectedClient.notes && (
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground">Observações</p>
                        <p className="text-sm text-foreground whitespace-pre-wrap">{selectedClient.notes}</p>
                      </div>
                    )}
                  </div>

                  <DialogFooter>
                    <Button onClick={() => setIsEditMode(true)} className="w-full">
                      <Pencil className="h-4 w-4 mr-2" />
                      Editar Cliente
                    </Button>
                  </DialogFooter>
                </div>
              )
            )}
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
              <AlertDialogTitle>Excluir cliente</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir
                {deleteTarget ? ` "${deleteTarget.name}"` : " este cliente"}? Essa ação não pode ser desfeita.
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

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou e-mail..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 mb-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Total de clientes:</span>
            <span className="font-semibold text-foreground">{clients.length}</span>
          </div>
        </div>

        {/* Clients Table */}
        {isLoading ? (
          <div className="rounded-xl border bg-card card-shadow p-6 text-sm text-muted-foreground">
            Carregando clientes...
          </div>
        ) : filteredClients.length === 0 ? (
          <EmptyState
            icon={<Users className="h-8 w-8 text-muted-foreground" />}
            title="Nenhum cliente encontrado"
            description="Adicione seu primeiro cliente para começar a gerenciar sua base."
            action={
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Cliente
              </Button>
            }
          />
        ) : (
          <div className="rounded-xl border bg-card card-shadow">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Responsável</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Origem</TableHead>
                  <TableHead>Indicado por</TableHead>
                  <TableHead>Mensalidade</TableHead>
                  <TableHead>Cadastro</TableHead>
                  <TableHead className="w-24">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {pagedClients.map((client, index) => (
                    <motion.tr
                      key={client.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b transition-colors"
                    >
                      <TableCell>
                        <p className="font-medium text-foreground">{client.name}</p>
                      </TableCell>
                      <TableCell>
                        <p className="text-foreground">{client.responsibleName}</p>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            <span className="text-foreground">{client.email}</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            {client.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {clientOriginLabels[client.origin]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {client.referredBy || "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatCurrency(client.monthlyFee)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(client.createdAt, "dd MMM yyyy", { locale: ptBR })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewClient(client)}
                            className="text-green-number hover:text-green-number hover:bg-primary/10"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteDialog(client)}
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
              <span>Mostrando {pagedClients.length} de {totalCount}</span>
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
