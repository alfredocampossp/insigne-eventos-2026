import { useState } from "react";
import { useDeals } from "@/hooks/useDeals";
import { useCompanies } from "@/hooks/useCompanies";
import { useContacts } from "@/hooks/useContacts";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, Search, Loader2 } from "lucide-react";
import { Deal, DEFAULT_PIPELINE_STAGES } from "@/types";

export default function Deals() {
  const { deals, loading, addDeal, updateDeal, deleteDeal } = useDeals();
  const { companies } = useCompanies();
  const { contacts } = useContacts(); // This fetches all contacts, might need optimization for large datasets
  
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    companyId: "",
    contactId: "",
    value: "",
    probability: "50",
    pipelineStageId: "lead",
    expectedCloseDate: ""
  });

  const filteredDeals = deals.filter(deal => 
    deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    deal.companyName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDealMove = async (dealId: string, newStageId: string) => {
    await updateDeal(dealId, { pipelineStageId: newStageId });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedCompany = companies.find(c => c.id === formData.companyId);
    const selectedContact = contacts.find(c => c.id === formData.contactId);
    
    const dealData = {
      title: formData.title,
      companyId: formData.companyId,
      companyName: selectedCompany?.name || "",
      contactId: formData.contactId,
      contactName: selectedContact?.name || "",
      value: parseFloat(formData.value) || 0,
      probability: parseInt(formData.probability) || 0,
      pipelineStageId: formData.pipelineStageId,
      status: "open" as const,
      // Date handling would need to be more robust in production (converting string to Timestamp)
      expectedCloseDate: formData.expectedCloseDate ? new Date(formData.expectedCloseDate) : null
    };

    if (editingDeal && editingDeal.id) {
      await updateDeal(editingDeal.id, dealData);
    } else {
      await addDeal(dealData);
    }
    
    setIsDialogOpen(false);
    setEditingDeal(null);
    setFormData({
      title: "",
      companyId: "",
      contactId: "",
      value: "",
      probability: "50",
      pipelineStageId: "lead",
      expectedCloseDate: ""
    });
  };

  const handleEdit = (deal: Deal) => {
    setEditingDeal(deal);
    setFormData({
      title: deal.title,
      companyId: deal.companyId,
      contactId: deal.contactId || "",
      value: deal.value.toString(),
      probability: deal.probability.toString(),
      pipelineStageId: deal.pipelineStageId,
      expectedCloseDate: deal.expectedCloseDate ? new Date(deal.expectedCloseDate.seconds * 1000).toISOString().split('T')[0] : ""
    });
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingDeal(null);
    setFormData({
      title: "",
      companyId: "",
      contactId: "",
      value: "",
      probability: "50",
      pipelineStageId: "lead",
      expectedCloseDate: ""
    });
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 flex-shrink-0">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Funil de Vendas</h1>
          <p className="text-muted-foreground mt-1">Gerencie suas oportunidades e negociações</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-white/50 p-2 rounded-lg border border-white/20 w-64">
            <Search className="w-4 h-4 text-muted-foreground ml-2" />
            <Input 
              placeholder="Buscar negócios..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 h-5"
            />
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleAddNew} className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20">
                <Plus className="w-4 h-4 mr-2" />
                Novo Negócio
              </Button>
            </DialogTrigger>
            <DialogContent className="glass border-white/20 sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>{editingDeal ? "Editar Negócio" : "Novo Negócio"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título da Oportunidade *</Label>
                  <Input 
                    id="title" 
                    value={formData.title} 
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Ex: Evento de Final de Ano - Empresa X"
                    required 
                    className="bg-white/50"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company">Empresa *</Label>
                    <Select 
                      value={formData.companyId} 
                      onValueChange={(value) => setFormData({...formData, companyId: value})}
                      required
                    >
                      <SelectTrigger className="bg-white/50">
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        {companies.map((company) => (
                          <SelectItem key={company.id} value={company.id || ""}>
                            {company.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact">Contato Principal</Label>
                    <Select 
                      value={formData.contactId} 
                      onValueChange={(value) => setFormData({...formData, contactId: value})}
                    >
                      <SelectTrigger className="bg-white/50">
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        {contacts
                          .filter(c => !formData.companyId || c.companyId === formData.companyId)
                          .map((contact) => (
                            <SelectItem key={contact.id} value={contact.id || ""}>
                              {contact.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="value">Valor Estimado (R$)</Label>
                    <Input 
                      id="value" 
                      type="number"
                      value={formData.value} 
                      onChange={(e) => setFormData({...formData, value: e.target.value})}
                      className="bg-white/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="probability">Probabilidade (%)</Label>
                    <Input 
                      id="probability" 
                      type="number"
                      min="0"
                      max="100"
                      value={formData.probability} 
                      onChange={(e) => setFormData({...formData, probability: e.target.value})}
                      className="bg-white/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="stage">Etapa do Funil</Label>
                    <Select 
                      value={formData.pipelineStageId} 
                      onValueChange={(value) => setFormData({...formData, pipelineStageId: value})}
                    >
                      <SelectTrigger className="bg-white/50">
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        {DEFAULT_PIPELINE_STAGES.map((stage) => (
                          <SelectItem key={stage.id} value={stage.id}>
                            {stage.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date">Previsão de Fechamento</Label>
                    <Input 
                      id="date" 
                      type="date"
                      value={formData.expectedCloseDate} 
                      onChange={(e) => setFormData({...formData, expectedCloseDate: e.target.value})}
                      className="bg-white/50"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-6">
                  {editingDeal && (
                    <Button 
                      type="button" 
                      variant="destructive" 
                      className="mr-auto"
                      onClick={() => {
                        if (editingDeal.id) deleteDeal(editingDeal.id);
                        setIsDialogOpen(false);
                      }}
                    >
                      Excluir
                    </Button>
                  )}
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                  <Button type="submit">{editingDeal ? "Salvar Alterações" : "Criar Negócio"}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <KanbanBoard 
            deals={filteredDeals} 
            onDealMove={handleDealMove}
            onDealClick={handleEdit}
          />
        )}
      </div>
    </div>
  );
}
