import { useState } from "react";
import { 
  DndContext, 
  DragOverlay, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent
} from "@dnd-kit/core";
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy 
} from "@dnd-kit/sortable";
import { KanbanColumn } from "./KanbanColumn";
import { KanbanCard } from "./KanbanCard";
import { Deal, DEFAULT_PIPELINE_STAGES } from "@/types";

interface KanbanBoardProps {
  deals: Deal[];
  onDealMove: (dealId: string, newStageId: string) => void;
  onDealClick: (deal: Deal) => void;
}

export function KanbanBoard({ deals, onDealMove, onDealClick }: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 5px movement required to start drag
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveId(null);
      return;
    }

    const activeDealId = active.id as string;
    const overId = over.id as string;

    // Find the stage ID
    // If dropped on a container (column), overId is the stageId
    // If dropped on a card, we need to find which stage that card belongs to
    let newStageId = "";
    
    if (DEFAULT_PIPELINE_STAGES.some(stage => stage.id === overId)) {
      newStageId = overId;
    } else {
      const overDeal = deals.find(d => d.id === overId);
      if (overDeal) {
        newStageId = overDeal.pipelineStageId;
      }
    }

    if (newStageId) {
      const activeDeal = deals.find(d => d.id === activeDealId);
      if (activeDeal && activeDeal.pipelineStageId !== newStageId) {
        onDealMove(activeDealId, newStageId);
      }
    }

    setActiveId(null);
  };

  const activeDeal = activeId ? deals.find(d => d.id === activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-full gap-4 overflow-x-auto pb-4 items-start">
        {DEFAULT_PIPELINE_STAGES.map((stage) => (
          <KanbanColumn
            key={stage.id}
            stage={stage}
            deals={deals.filter(d => d.pipelineStageId === stage.id)}
            onDealClick={onDealClick}
          />
        ))}
      </div>

      <DragOverlay>
        {activeDeal ? <KanbanCard deal={activeDeal} onClick={() => {}} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
