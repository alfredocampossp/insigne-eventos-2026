import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { KanbanCard } from "./KanbanCard";
import { Deal, PipelineStage } from "@/types";
import { cn } from "@/lib/utils";

interface KanbanColumnProps {
  stage: PipelineStage;
  deals: Deal[];
  onDealClick: (deal: Deal) => void;
}

export function KanbanColumn({ stage, deals, onDealClick }: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({
    id: stage.id,
  });

  const totalValue = deals.reduce((sum, deal) => sum + Number(deal.value || 0), 0);

  return (
    <div className="flex flex-col w-80 min-w-[20rem] h-full rounded-xl bg-white/30 border border-white/20 backdrop-blur-sm flex-shrink-0">
      {/* Header */}
      <div className={cn("p-3 border-b border-white/10 rounded-t-xl", stage.color)}>
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-semibold text-sm text-slate-700">{stage.name}</h3>
          <span className="text-xs font-medium bg-white/50 px-2 py-0.5 rounded-full text-slate-600">
            {deals.length}
          </span>
        </div>
        <div className="text-xs font-medium text-slate-500">
          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalValue)}
        </div>
      </div>

      {/* Cards Container */}
      <div 
        ref={setNodeRef} 
        className="flex-1 p-2 overflow-y-auto space-y-2 min-h-[150px]"
      >
        <SortableContext 
          items={deals.map(d => d.id || "")} 
          strategy={verticalListSortingStrategy}
        >
          {deals.map((deal) => (
            <KanbanCard 
              key={deal.id} 
              deal={deal} 
              onClick={onDealClick} 
            />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}
