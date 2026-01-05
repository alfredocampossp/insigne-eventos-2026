import { useState } from "react";
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
import { Contact, DealContactLog } from "@/types";
import { Phone, Mail, MessageSquare, Calendar } from "lucide-react";

interface ContactLogFormProps {
  dealId: string;
  contacts: Contact[];
  onSubmit: (log: Omit<DealContactLog, "id" | "createdAt">) => Promise<void>;
  onCancel: () => void;
}

export function ContactLogForm({
  dealId,
  contacts,
  onSubmit,
  onCancel,
}: ContactLogFormProps) {
  const [formData, setFormData] = useState({
    contactId: "",
    type: "phone" as const,
    subject: "",
    notes: "",
    duration: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedContact = contacts.find((c) => c.id === formData.contactId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.contactId || !formData.notes) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        dealId,
        contactId: formData.contactId,
        contactName: selectedContact?.name || "",
        type: formData.type,
        subject: formData.subject || undefined,
        notes: formData.notes,
        duration: formData.duration ? parseInt(formData.duration) : undefined,
        timestamp: new Date(),
      });

      setFormData({
        contactId: "",
        type: "phone",
        subject: "",
        notes: "",
        duration: "",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const typeIcons = {
    phone: <Phone className="w-4 h-4" />,
    email: <Mail className="w-4 h-4" />,
    meeting: <Calendar className="w-4 h-4" />,
    message: <MessageSquare className="w-4 h-4" />,
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white/50 rounded-lg border border-white/20">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="contact">Contato *</Label>
          <Select
            value={formData.contactId}
            onValueChange={(value) =>
              setFormData({ ...formData, contactId: value })
            }
          >
            <SelectTrigger className="bg-white/50">
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              {contacts.map((contact) => (
                <SelectItem key={contact.id} value={contact.id || ""}>
                  {contact.name} ({contact.role || "Sem cargo"})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Tipo de Contato *</Label>
          <Select
            value={formData.type}
            onValueChange={(value: any) =>
              setFormData({ ...formData, type: value })
            }
          >
            <SelectTrigger className="bg-white/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="phone">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Chamada Telefônica
                </div>
              </SelectItem>
              <SelectItem value="email">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  E-mail
                </div>
              </SelectItem>
              <SelectItem value="meeting">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Reunião
                </div>
              </SelectItem>
              <SelectItem value="message">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Mensagem
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="subject">Assunto</Label>
        <Input
          id="subject"
          value={formData.subject}
          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          placeholder="Ex: Discussão sobre proposta"
          className="bg-white/50"
        />
      </div>

      {formData.type === "phone" && (
        <div className="space-y-2">
          <Label htmlFor="duration">Duração (minutos)</Label>
          <Input
            id="duration"
            type="number"
            min="0"
            value={formData.duration}
            onChange={(e) =>
              setFormData({ ...formData, duration: e.target.value })
            }
            placeholder="Ex: 15"
            className="bg-white/50"
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="notes">Notas *</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Descreva o contato, pontos discutidos, próximos passos..."
          className="bg-white/50 min-h-24"
          required
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || !formData.contactId || !formData.notes}
        >
          {isSubmitting ? "Salvando..." : "Registrar Contato"}
        </Button>
      </div>
    </form>
  );
}
