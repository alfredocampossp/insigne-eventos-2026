import React from "react";
import { Phone, Mail, Calendar, MessageSquare, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ContactHistoryTimelineProps {
  logs: any[];
  onDelete: (id: string) => Promise<void>;
}

export function ContactHistoryTimeline({
  logs,
  onDelete,
}: ContactHistoryTimelineProps) {
  const typeIcons: Record<string, React.JSX.Element> = {
    phone: <Phone className="w-4 h-4" />,
    email: <Mail className="w-4 h-4" />,
    meeting: <Calendar className="w-4 h-4" />,
    message: <MessageSquare className="w-4 h-4" />,
  };

  const typeLabels: Record<string, string> = {
    phone: "Chamada Telefônica",
    email: "E-mail",
    meeting: "Reunião",
    message: "Mensagem",
  };

  const typeColors: Record<string, string> = {
    phone: "bg-blue-100 text-blue-700",
    email: "bg-purple-100 text-purple-700",
    meeting: "bg-green-100 text-green-700",
    message: "bg-orange-100 text-orange-700",
  };

  if (logs.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Nenhum contato registrado ainda</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {logs.map((log) => {
        const timestamp = log.timestamp?.toDate?.() || new Date(log.timestamp);
        return (
          <div
            key={log.id}
            className="p-4 bg-white/50 rounded-lg border border-white/20 hover:border-white/40 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`p-2 rounded-lg ${typeColors[log.type] || typeColors.phone}`}>
                    {typeIcons[log.type] || typeIcons.phone}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{log.contactName}</p>
                    <p className="text-xs text-muted-foreground">
                      {typeLabels[log.type] || "Contato"}
                      {log.duration && ` • ${log.duration} min`}
                    </p>
                  </div>
                </div>

                {log.subject && (
                  <p className="text-sm font-medium mb-2">{log.subject}</p>
                )}

                <p className="text-sm text-muted-foreground mb-2">{log.notes}</p>

                <p className="text-xs text-muted-foreground">
                  {format(timestamp, "dd 'de' MMMM 'às' HH:mm", {
                    locale: ptBR,
                  })}
                </p>
              </div>

              <Button
                size="sm"
                variant="ghost"
                onClick={() => log.id && onDelete(log.id)}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
