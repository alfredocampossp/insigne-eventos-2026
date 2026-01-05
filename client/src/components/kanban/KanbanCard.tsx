import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Deal } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, DollarSign, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface KanbanCardProps {
  deal: Deal;
  onClick: (deal: Deal) => void;
}

export function KanbanCard({ deal, onClick }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: deal.id || "" });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick(deal)}
      className={cn(
        "group cursor-grab active:cursor-grabbing touch-none",
        isDragging && "opacity-50"
      )}
    >
      <Card className="hover:shadow-md transition-all duration-200 border-white/40 bg-white/60 backdrop-blur-sm">
        <CardContent className="p-3 space-y-2">
          <div className="flex justify-between items-start gap-2">
            <h4 className="font-medium text-sm text-slate-800 line-clamp-2 leading-tight">
              {deal.title}
            </h4>
            {deal.probability > 0 && (
              <span className={cn(
                "text-[10px] px-1.5 py-0.5 rounded-full font-medium flex-shrink-0",
                deal.probability >= 80 ? "bg-emerald-100 text-emerald-700" :
                deal.probability >= 50 ? "bg-blue-100 text-blue-700" :
                "bg-slate-100 text-slate-600"
              )}>
                {deal.probability}%
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <User className="w-3 h-3" />
            <span className="truncate">{deal.companyName}</span>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-slate-100 mt-2">
            <div className="flex items-center gap-1 text-xs font-semibold text-slate-700">
              <DollarSign className="w-3 h-3 text-slate-400" />
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(deal.value)}
            </div>
            {deal.expectedCloseDate && (
              <div className="flex items-center gap-1 text-[10px] text-slate-400">
                <Calendar className="w-3 h-3" />
                {new Date(deal.expectedCloseDate.seconds * 1000).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
