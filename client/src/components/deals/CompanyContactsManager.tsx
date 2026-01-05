import { useState } from "react";
import { Contact } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Edit2, Trash2, Mail, Phone } from "lucide-react";

interface CompanyContactsManagerProps {
  companyId: string;
  contacts: Contact[];
  onAddContact: (contact: Omit<Contact, "id" | "createdAt">) => Promise<void>;
  onEditContact: (id: string, updates: Partial<Contact>) => Promise<void>;
  onDeleteContact: (id: string) => Promise<void>;
}

export function CompanyContactsManager({
  companyId,
  contacts,
  onAddContact,
  onEditContact,
  onDeleteContact,
}: CompanyContactsManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    isPrimary: false,
  });

  const handleOpenDialog = (contact?: Contact) => {
    if (contact) {
      setEditingId(contact.id || null);
      setFormData({
        name: contact.name,
        email: contact.email,
        phone: contact.phone || "",
        role: contact.role || "",
        isPrimary: contact.isPrimary,
      });
    } else {
      setEditingId(null);
      setFormData({
        name: "",
        email: "",
        phone: "",
        role: "",
        isPrimary: false,
      });
    }
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    try {
      if (editingId) {
        await onEditContact(editingId, formData);
      } else {
        await onAddContact({
          ...formData,
          companyId,
          companyName: undefined,
        });
      }
      setIsOpen(false);
    } catch (error) {
      console.error("Erro ao salvar contato:", error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-sm">Contatos da Empresa</h4>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              onClick={() => handleOpenDialog()}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Novo Contato
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Editar Contato" : "Novo Contato"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Nome completo"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="email@exemplo.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="(11) 9999-9999"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Cargo</Label>
                <Input
                  id="role"
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  placeholder="Ex: Gerente de Vendas"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPrimary"
                  checked={formData.isPrimary}
                  onChange={(e) =>
                    setFormData({ ...formData, isPrimary: e.target.checked })
                  }
                  className="rounded"
                />
                <Label htmlFor="isPrimary" className="text-sm font-normal">
                  Contato Principal
                </Label>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingId ? "Salvar" : "Adicionar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        {contacts.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            Nenhum contato cadastrado
          </p>
        ) : (
          contacts.map((contact) => (
            <div
              key={contact.id}
              className="p-3 bg-white/50 rounded-lg border border-white/20 flex items-center justify-between group hover:border-white/40 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm truncate">
                    {contact.name}
                  </p>
                  {contact.isPrimary && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      Principal
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                  {contact.role && <span>{contact.role}</span>}
                  {contact.email && (
                    <a
                      href={`mailto:${contact.email}`}
                      className="flex items-center gap-1 hover:text-foreground"
                    >
                      <Mail className="w-3 h-3" />
                      {contact.email}
                    </a>
                  )}
                  {contact.phone && (
                    <a
                      href={`tel:${contact.phone}`}
                      className="flex items-center gap-1 hover:text-foreground"
                    >
                      <Phone className="w-3 h-3" />
                      {contact.phone}
                    </a>
                  )}
                </div>
              </div>

              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleOpenDialog(contact)}
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => contact.id && onDeleteContact(contact.id)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
