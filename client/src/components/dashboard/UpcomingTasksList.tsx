import { Task } from "@/types";
import { CheckCircle2, Circle, AlertCircle, Trash2, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format, isPast, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";

interface UpcomingTasksListProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onStatusChange: (taskId: string, status: Task["status"]) => Promise<void>;
  onDelete: (taskId: string) => Promise<void>;
}

export function UpcomingTasksList({
  tasks,
  onTaskClick,
  onStatusChange,
  onDelete,
}: UpcomingTasksListProps) {
  // Filtrar apenas tarefas não concluídas e ordenar por data
  const upcomingTasks = tasks
    .filter((t) => t.status !== "done")
    .sort((a, b) => {
      const dateA = a.dueDate?.toDate?.() || new Date(a.dueDate);
      const dateB = b.dueDate?.toDate?.() || new Date(b.dueDate);
      return new Date(dateA).getTime() - new Date(dateB).getTime();
    })
    .slice(0, 10); // Mostrar apenas as 10 próximas

  const priorityIcons = {
    low: <AlertCircle className="w-4 h-4 text-blue-500" />,
    medium: <AlertCircle className="w-4 h-4 text-yellow-500" />,
    high: <AlertCircle className="w-4 h-4 text-red-500" />,
  };

  const priorityLabels = {
    low: "Baixa",
    medium: "Média",
    high: "Alta",
  };

  const priorityColors = {
    low: "bg-blue-50 text-blue-700",
    medium: "bg-yellow-50 text-yellow-700",
    high: "bg-red-50 text-red-700",
  };

  if (upcomingTasks.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Nenhuma tarefa pendente</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {upcomingTasks.map((task) => {
        const dueDate = task.dueDate?.toDate?.() || new Date(task.dueDate);
        const isOverdue = isPast(dueDate) && !isToday(dueDate);
        const isDueToday = isToday(dueDate);

        return (
          <div
            key={task.id}
            className={`p-3 rounded-lg border transition-all hover:shadow-md ${
              isOverdue
                ? "bg-red-50 border-red-200"
                : isDueToday
                  ? "bg-blue-50 border-blue-200"
                  : "bg-white/50 border-white/20"
            }`}
          >
            <div className="flex items-start gap-3">
              {/* Checkbox */}
              <button
                onClick={() =>
                  onStatusChange(
                    task.id || "",
                    task.status === "in_progress" ? "todo" : "in_progress"
                  )
                }
                className="mt-1 flex-shrink-0 hover:opacity-70 transition-opacity"
              >
                {task.status === "in_progress" ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                ) : (
                  <Circle className="w-5 h-5 text-muted-foreground" />
                )}
              </button>

              {/* Conteúdo */}
              <div className="flex-1 min-w-0">
                <button
                  onClick={() => onTaskClick(task)}
                  className="text-left hover:opacity-70 transition-opacity"
                >
                  <p className="font-medium text-sm line-clamp-2">
                    {task.title}
                  </p>
                </button>

                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <Badge
                    variant="outline"
                    className={`text-xs ${priorityColors[task.priority]}`}
                  >
                    {priorityLabels[task.priority]}
                  </Badge>

                  <span className="text-xs text-muted-foreground">
                    {format(dueDate, "dd 'de' MMM", { locale: ptBR })}
                  </span>

                  {isOverdue && (
                    <Badge variant="outline" className="bg-red-50 text-red-700 text-xs">
                      Atrasada
                    </Badge>
                  )}

                  {isDueToday && (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 text-xs">
                      Hoje
                    </Badge>
                  )}
                </div>

                {task.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                    {task.description}
                  </p>
                )}
              </div>

              {/* Ações */}
              <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onTaskClick(task)}
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => task.id && onDelete(task.id)}
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
  );
}
