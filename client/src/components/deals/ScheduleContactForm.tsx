import { useState } from "react";
import { Timestamp } from "firebase/firestore";
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
import { Contact } from "@/types";
import { Calendar, Clock } from "lucide-react";
import { toast } from "sonner";

interface ScheduleContactFormProps {
  dealId: string;
  contacts: Contact[];
  onSubmit: (scheduled: any) => Promise<void>;
  onCancel: () => void;
}

export function ScheduleContactForm({
  dealId,
  contacts,
  onSubmit,
  onCancel,
}: ScheduleContactFormProps) {
  const [formData, setFormData] = useState({
    contactId: "",
    type: "phone" as const,
    subject: "",
    notes: "",
    date: "",
    time: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedContact = contacts.find((c) => c.id === formData.contactId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.contactId || !formData.date || !formData.time || !formData.subject) return;

    setIsSubmitting(true);
    try {
      // Parsear a data no formato YYYY-MM-DD
      const [year, month, day] = formData.date.split("-");
      const [hours, minutes] = formData.time.split(":");

      // Criar data em horário local (não UTC)
      const scheduledDate = new Date(
        parseInt(year),
        parseInt(month) - 1, // Mês é 0-indexed
        parseInt(day),
        parseInt(hours),
        parseInt(minutes),
        0,
        0
      );

      console.log("Data local criada:", scheduledDate);
      console.log("ISO String:", scheduledDate.toISOString());

      // Converter para Timestamp do Firebase
      const timestamp = Timestamp.fromDate(scheduledDate);

      console.log("Timestamp criado:", timestamp);

      await onSubmit({
        dealId,
        contactId: formData.contactId,
        contactName: selectedContact?.name || "",
        type: formData.type,
        subject: formData.subject,
        notes: formData.notes || undefined,
        scheduledFor: timestamp as any,
        status: "pending",
      });

      toast.success("Contato agendado com sucesso!");

      setFormData({
        contactId: "",
        type: "phone",
        subject: "",
        notes: "",
        date: "",
        time: "",
      });
    } catch (error) {
      console.error("Erro ao agendar contato:", error);
      toast.error("Erro ao agendar contato");
    } finally {
      setIsSubmitting(false);
    }
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
              <SelectItem value="phone">Chamada Telefônica</SelectItem>
              <SelectItem value="email">E-mail</SelectItem>
              <SelectItem value="meeting">Reunião</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="subject">Assunto *</Label>
        <Input
          id="subject"
          value={formData.subject}
          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          placeholder="Ex: Apresentar proposta"
          className="bg-white/50"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">Data *</Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-3 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="bg-white/50 pl-10"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="time">Hora *</Label>
          <div className="relative">
            <Clock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              id="time"
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              className="bg-white/50 pl-10"
              required
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notas</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Pontos a discutir, preparação necessária..."
          className="bg-white/50 min-h-20"
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={
            isSubmitting ||
            !formData.contactId ||
            !formData.date ||
            !formData.time ||
            !formData.subject
          }
        >
          {isSubmitting ? "Agendando..." : "Agendar Contato"}
        </Button>
      </div>
    </form>
  );
}
