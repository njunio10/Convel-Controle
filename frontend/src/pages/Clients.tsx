import { useState } from "react";
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
  DialogTrigger,
  DialogFooter,
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
import { Plus, Users, Search, Mail, Phone, Eye, Pencil } from "lucide-react";
import { Client, ClientOrigin } from "@/types";
import { mockClients, clientOriginLabels } from "@/data/mockData";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";

export default function Clients() {
  const [clients, setClients] = useState<Client[]>(mockClients);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [newClient, setNewClient] = useState({
    name: "",
    email: "",
    phone: "",
    origin: "" as ClientOrigin,
    referredBy: "",
    notes: "",
  });
  const [editClient, setEditClient] = useState({
    name: "",
    email: "",
    phone: "",
    origin: "" as ClientOrigin,
    referredBy: "",
    notes: "",
  });

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const client: Client = {
      id: Date.now().toString(),
      name: newClient.name,
      email: newClient.email,
      phone: newClient.phone,
      origin: newClient.origin,
      referredBy: newClient.origin === "indicacao" ? newClient.referredBy : undefined,
      notes: newClient.notes || undefined,
      createdAt: new Date(),
    };
    setClients([client, ...clients]);
    setNewClient({ name: "", email: "", phone: "", origin: "" as ClientOrigin, referredBy: "", notes: "" });
    setIsDialogOpen(false);
  };

  const handleViewClient = (client: Client) => {
    setSelectedClient(client);
    setEditClient({
      name: client.name,
      email: client.email,
      phone: client.phone,
      origin: client.origin,
      referredBy: client.referredBy || "",
      notes: client.notes || "",
    });
    setIsEditMode(false);
    setIsViewDialogOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;

    setClients(clients.map(c => 
      c.id === selectedClient.id 
        ? {
            ...c,
            name: editClient.name,
            email: editClient.email,
            phone: editClient.phone,
            origin: editClient.origin,
            referredBy: editClient.origin === "indicacao" ? editClient.referredBy : undefined,
            notes: editClient.notes || undefined,
          }
        : c
    ));
    setIsEditMode(false);
    setIsViewDialogOpen(false);
  };

  return (
    <AppLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <PageHeader title="Clientes" description="Gerencie sua base de clientes">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Cliente
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
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
                      onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
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
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea
                    id="notes"
                    value={newClient.notes}
                    onChange={(e) => setNewClient({ ...newClient, notes: e.target.value })}
                    placeholder="Anotações sobre o cliente"
                    rows={3}
                  />
                </div>

                <Button type="submit" className="w-full">
                  Adicionar Cliente
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </PageHeader>

        {/* View/Edit Client Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-md">
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
                      onChange={(e) => setEditClient({ ...editClient, phone: e.target.value })}
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
                  <Button type="submit">Salvar Alterações</Button>
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
        {filteredClients.length === 0 ? (
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
                  <TableHead>Contato</TableHead>
                  <TableHead>Origem</TableHead>
                  <TableHead>Indicado por</TableHead>
                  <TableHead>Cadastro</TableHead>
                  <TableHead className="w-24">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {filteredClients.map((client, index) => (
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
                        {format(client.createdAt, "dd MMM yyyy", { locale: ptBR })}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewClient(client)}
                          className="text-green-number hover:text-green-number hover:bg-primary/10"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ver mais
                        </Button>
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </TableBody>
            </Table>
          </div>
        )}
      </motion.div>
    </AppLayout>
  );
}
