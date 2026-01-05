import { useState } from "react";
import { useProposals } from "@/hooks/useProposals";
import { useDeals } from "@/hooks/useDeals";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
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
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, FileText, Download, Eye, Trash2, Loader2, PlusCircle, MinusCircle } from "lucide-react";
import { Proposal, ProposalItem } from "@/types";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { ProposalPDF } from "@/components/proposals/ProposalPDF";

export default function Proposals() {
  const { proposals, loading, addProposal, deleteProposal } = useProposals();
  const { deals } = useDeals();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    dealId: "",
    validUntil: "",
    notes: "",
    taxRate: "0"
  });
  
  const [items, setItems] = useState<ProposalItem[]>([
    { description: "", quantity: 1, unitPrice: 0, total: 0 }
  ]);

  const filteredProposals = proposals.filter(proposal => 
    proposal.dealTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    proposal.companyName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleItemChange = (index: number, field: keyof ProposalItem, value: string | number) => {
    const newItems = [...items];
    const item = { ...newItems[index] };
    
    if (field === "description") {
      item.description = value as string;
    } else {
      item[field] = Number(value);
    }
    
    item.total = item.quantity * item.unitPrice;
    newItems[index] = item;
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { description: "", quantity: 1, unitPrice: 0, total: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      const newItems = [...items];
      newItems.splice(index, 1);
      setItems(newItems);
    }
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const taxRate = parseFloat(formData.taxRate) || 0;
    const taxAmount = subtotal * (taxRate / 100);
    const total = subtotal + taxAmount;
    return { subtotal, taxAmount, total };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedDeal = deals.find(d => d.id === formData.dealId);
    if (!selectedDeal) return;

    const { subtotal, taxAmount, total } = calculateTotals();
    
    const proposalData = {
      dealId: formData.dealId,
      dealTitle: selectedDeal.title,
      companyName: selectedDeal.companyName,
      contactName: selectedDeal.contactName || "A/C Responsável",
      version: 1, // Simple versioning for now
      status: "draft" as const,
      items,
      subtotal,
      taxRate: parseFloat(formData.taxRate) || 0,
      taxAmount,
      total,
      validUntil: formData.validUntil ? new Date(formData.validUntil).toISOString() : null,
      notes: formData.notes
    };

    await addProposal(proposalData);
    
    setIsDialogOpen(false);
    setFormData({ dealId: "", validUntil: "", notes: "", taxRate: "0" });
    setItems([{ description: "", quantity: 1, unitPrice: 0, total: 0 }]);
  };

  const { subtotal, taxAmount, total } = calculateTotals();

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Propostas</h1>
          <p className="text-muted-foreground mt-1">Crie e gerencie propostas comerciais</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20">
              <Plus className="w-4 h-4 mr-2" />
              Nova Proposta
            </Button>
          </DialogTrigger>
          <DialogContent className="glass border-white/20 max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nova Proposta Comercial</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="deal">Negócio / Oportunidade *</Label>
                  <Select 
                    value={formData.dealId} 
                    onValueChange={(value) => setFormData({...formData, dealId: value})}
                    required
                  >
                    <SelectTrigger className="bg-white/50">
                      <SelectValue placeholder="Selecione um negócio..." />
                    </SelectTrigger>
                    <SelectContent>
                      {deals.map((deal) => (
                        <SelectItem key={deal.id} value={deal.id || ""}>
                          {deal.title} - {deal.companyName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="validUntil">Válida Até</Label>
                  <Input 
                    id="validUntil" 
                    type="date"
                    value={formData.validUntil} 
                    onChange={(e) => setFormData({...formData, validUntil: e.target.value})}
                    className="bg-white/50"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Itens da Proposta</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addItem}>
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Adicionar Item
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {items.map((item, index) => (
                    <div key={index} className="flex gap-2 items-start">
                      <div className="flex-1">
                        <Input 
                          placeholder="Descrição do serviço/produto" 
                          value={item.description}
                          onChange={(e) => handleItemChange(index, "description", e.target.value)}
                          className="bg-white/50"
                          required
                        />
                      </div>
                      <div className="w-20">
                        <Input 
                          type="number" 
                          min="1"
                          placeholder="Qtd" 
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                          className="bg-white/50"
                          required
                        />
                      </div>
                      <div className="w-32">
                        <Input 
                          type="number" 
                          min="0"
                          step="0.01"
                          placeholder="Valor Unit." 
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(index, "unitPrice", e.target.value)}
                          className="bg-white/50"
                          required
                        />
                      </div>
                      <div className="w-32 pt-2 text-right font-medium text-sm">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.total)}
                      </div>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => removeItem(index)}
                        disabled={items.length === 1}
                      >
                        <MinusCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <div className="w-64 space-y-2 bg-white/30 p-4 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span className="font-medium">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(subtotal)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm text-muted-foreground">Impostos (%):</span>
                    <Input 
                      type="number" 
                      min="0" 
                      max="100" 
                      className="w-16 h-8 bg-white/50 text-right"
                      value={formData.taxRate}
                      onChange={(e) => setFormData({...formData, taxRate: e.target.value})}
                    />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Valor Impostos:</span>
                    <span className="font-medium">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(taxAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-white/20">
                    <span>Total:</span>
                    <span className="text-primary">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Observações / Termos</Label>
                <Textarea 
                  id="notes" 
                  value={formData.notes} 
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="bg-white/50 min-h-[100px]"
                  placeholder="Condições de pagamento, prazos, etc."
                />
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                <Button type="submit">Gerar Proposta</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-2 bg-white/50 p-2 rounded-lg border border-white/20 max-w-md">
        <Search className="w-4 h-4 text-muted-foreground ml-2" />
        <Input 
          placeholder="Buscar propostas..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
        />
      </div>

      <div className="glass rounded-xl border border-white/20 overflow-hidden">
        <Table>
          <TableHeader className="bg-white/30">
            <TableRow className="hover:bg-transparent">
              <TableHead>Negócio</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Versão</TableHead>
              <TableHead>Valor Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <div className="flex justify-center items-center">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredProposals.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  Nenhuma proposta encontrada.
                </TableCell>
              </TableRow>
            ) : (
              filteredProposals.map((proposal) => (
                <TableRow key={proposal.id} className="hover:bg-white/40 transition-colors">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-purple-100 flex items-center justify-center text-purple-600">
                        <FileText className="w-4 h-4" />
                      </div>
                      {proposal.dealTitle}
                    </div>
                  </TableCell>
                  <TableCell>{proposal.companyName}</TableCell>
                  <TableCell>v{proposal.version}</TableCell>
                  <TableCell className="font-medium">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(proposal.total)}
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${proposal.status === 'draft' ? 'bg-slate-100 text-slate-800' : 
                        proposal.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                        proposal.status === 'accepted' ? 'bg-emerald-100 text-emerald-800' :
                        'bg-red-100 text-red-800'}`}>
                      {proposal.status === 'draft' ? 'Rascunho' : 
                       proposal.status === 'sent' ? 'Enviada' :
                       proposal.status === 'accepted' ? 'Aceita' : 'Rejeitada'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <PDFDownloadLink
                        document={<ProposalPDF proposal={proposal} />}
                        fileName={`Proposta-${proposal.companyName.replace(/\s+/g, '-')}-v${proposal.version}.pdf`}
                      >
                        {({ loading: pdfLoading }) => (
                          <Button variant="ghost" size="icon" disabled={pdfLoading}>
                            {pdfLoading ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Download className="w-4 h-4 text-muted-foreground hover:text-primary" />
                            )}
                          </Button>
                        )}
                      </PDFDownloadLink>
                      
                      <Button variant="ghost" size="icon" onClick={() => proposal.id && deleteProposal(proposal.id)}>
                        <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
