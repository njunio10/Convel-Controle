import { useState } from "react";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, UserPlus, Search, Mail, Phone, Sparkles, Clock, CheckCircle, XCircle, Eye, Pencil } from "lucide-react";
import { Lead, LeadStatus } from "@/types";
import { mockLeads, leadStatusLabels, leadStatusColors } from "@/data/mockData";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function Leads() {
  const [leads, setLeads] = useState<Lead[]>(mockLeads);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [newLead, setNewLead] = useState({
    name: "",
    email: "",
    phone: "",
    source: "",
    notes: "",
  });
  const [editLead, setEditLead] = useState({
    name: "",
    email: "",
    phone: "",
    source: "",
    notes: "",
    status: "novo" as LeadStatus,
  });

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || lead.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    novo: leads.filter((l) => l.status === "novo").length,
    em_contato: leads.filter((l) => l.status === "em_contato").length,
    convertido: leads.filter((l) => l.status === "convertido").length,
    perdido: leads.filter((l) => l.status === "perdido").length,
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const lead: Lead = {
      id: Date.now().toString(),
      name: newLead.name,
      email: newLead.email,
      phone: newLead.phone,
      status: "novo",
      source: newLead.source || undefined,
      notes: newLead.notes || undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setLeads([lead, ...leads]);
    setNewLead({ name: "", email: "", phone: "", source: "", notes: "" });
    setIsDialogOpen(false);
  };


  const handleViewLead = (lead: Lead) => {
    setSelectedLead(lead);
    setEditLead({
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      source: lead.source || "",
      notes: lead.notes || "",
      status: lead.status,
    });
    setIsEditMode(false);
    setIsViewDialogOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;

    setLeads(leads.map(l =>
      l.id === selectedLead.id
        ? {
            ...l,
            name: editLead.name,
            email: editLead.email,
            phone: editLead.phone,
            source: editLead.source || undefined,
            notes: editLead.notes || undefined,
            status: editLead.status,
            updatedAt: new Date(),
          }
        : l
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
        <PageHeader title="Leads" description="Acompanhe e converta seus leads">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Lead
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
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
                      onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                      placeholder="(00) 00000-0000"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="source">Origem</Label>
                  <Input
                    id="source"
                    value={newLead.source}
                    onChange={(e) => setNewLead({ ...newLead, source: e.target.value })}
                    placeholder="Ex: Google Ads, Instagram, etc."
                  />
                </div>

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

                <Button type="submit" className="w-full">
                  Adicionar Lead
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </PageHeader>

        {/* View/Edit Lead Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-md">
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
                      onChange={(e) => setEditLead({ ...editLead, phone: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-source">Origem</Label>
                  <Input
                    id="edit-source"
                    value={editLead.source}
                    onChange={(e) => setEditLead({ ...editLead, source: e.target.value })}
                  />
                </div>

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
                  <Button type="button" variant="outline" onClick={() => setIsEditMode(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">Salvar Alterações</Button>
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
                        <p className="text-sm text-foreground">{selectedLead.source || "—"}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground">Última atualização</p>
                        <p className="text-sm text-foreground">
                          {format(selectedLead.updatedAt, "dd/MM/yyyy", { locale: ptBR })}
                        </p>
                      </div>
                    </div>

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
        {filteredLeads.length === 0 ? (
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
                  <TableHead className="w-24">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {filteredLeads.map((lead, index) => (
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
                        {lead.source || "—"}
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
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewLead(lead)}
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
