import React from "react";
import { Calendar, Clock, CheckCircle2, AlertCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ScheduledContactsListProps {
  scheduled: any[];
  onMarkCompleted: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function ScheduledContactsList({
  scheduled,
  onMarkCompleted,
  onDelete,
}: ScheduledContactsListProps) {
  const statusBadges: Record<string, React.JSX.Element> = {
    pending: <Badge variant="outline" className="bg-yellow-50 text-yellow-700">Pendente</Badge>,
    completed: <Badge variant="outline" className="bg-green-50 text-green-700">Concluído</Badge>,
    cancelled: <Badge variant="outline" className="bg-red-50 text-red-700">Cancelado</Badge>,
  };

  // Separar em próximos e passados
  const now = new Date();
  const upcoming = scheduled.filter((s) => {
    const date = s.scheduledFor?.toDate?.() || new Date(s.scheduledFor);
    return date > now && s.status === "pending";
  });

  const past = scheduled.filter((s) => {
    const date = s.scheduledFor?.toDate?.() || new Date(s.scheduledFor);
    return date <= now || s.status !== "pending";
  });

  if (scheduled.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Nenhum contato agendado</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {upcoming.length > 0 && (
        <div>
          <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-orange-500" />
            Próximos Contatos
          </h4>
          <div className="space-y-3">
            {upcoming.map((item) => {
              const scheduledDate = item.scheduledFor?.toDate?.() || new Date(item.scheduledFor);

              return (
                <div
                  key={item.id}
                  className="p-4 rounded-lg bg-white/50 border border-white/20 hover:border-white/40 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="font-semibold">{item.contactName}</p>
                        {statusBadges[item.status] || statusBadges.pending}
                      </div>
                      <p className="text-sm font-medium mb-2">{item.subject}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {format(scheduledDate, "dd 'de' MMMM", {
                            locale: ptBR,
                          })}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {format(scheduledDate, "HH:mm")}
                        </div>
                      </div>
                      {item.notes && (
                        <p className="text-sm text-muted-foreground mt-2">{item.notes}</p>
                      )}
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => item.id && onMarkCompleted(item.id)}
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => item.id && onDelete(item.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {past.length > 0 && (
        <div>
          <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            Histórico de Agendamentos
          </h4>
          <div className="space-y-3">
            {past.map((item) => {
              const scheduledDate = item.scheduledFor?.toDate?.() || new Date(item.scheduledFor);

              return (
                <div
                  key={item.id}
                  className="p-4 rounded-lg bg-white/30 border border-white/10 opacity-75"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="font-semibold text-sm">{item.contactName}</p>
                        {statusBadges[item.status] || statusBadges.pending}
                      </div>
                      <p className="text-sm font-medium mb-2">{item.subject}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {format(scheduledDate, "dd 'de' MMMM", {
                            locale: ptBR,
                          })}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {format(scheduledDate, "HH:mm")}
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => item.id && onDelete(item.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
