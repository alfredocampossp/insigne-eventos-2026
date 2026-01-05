import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  DollarSign, 
  Users, 
  Trello, 
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { useTasks } from "@/hooks/useTasks";
import { useDeals } from "@/hooks/useDeals";
import { TaskCalendar } from "@/components/dashboard/TaskCalendar";
import { UpcomingTasksList } from "@/components/dashboard/UpcomingTasksList";
import { TaskEditModal } from "@/components/dashboard/TaskEditModal";
import { RecentPipelineView } from "@/components/dashboard/RecentPipelineView";
import { Task } from "@/types";
import { useLocation } from "wouter";

export default function Home() {
  const { tasks, updateTask, deleteTask } = useTasks();
  const { deals } = useDeals();
  const [, setLocation] = useLocation();
  
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  const handleTaskClick = (task: Task) => {
    // Se a tarefa está relacionada a um deal (contato agendado)
    if (task.relatedTo?.type === "deal" && task.relatedTo?.id) {
      // Navegar para a página de Deals com o deal selecionado
      setLocation(`/deals?dealId=${task.relatedTo.id}`);
    } else {
      // Abrir modal de edição de tarefa
      setSelectedTask(task);
      setIsTaskModalOpen(true);
    }
  };

  const handleTaskSave = async (updates: Partial<Task>) => {
    if (selectedTask?.id) {
      await updateTask(selectedTask.id, updates);
    }
  };

  const handleStatusChange = async (taskId: string, status: Task["status"]) => {
    await updateTask(taskId, { status });
  };

  const handleDeleteTask = async (taskId: string) => {
    await deleteTask(taskId);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Visão geral da agência Insigne Eventos</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="glass hover:shadow-md transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Receita Prevista
            </CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {deals.reduce((sum, d) => sum + d.value, 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center text-emerald-600">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              +20.1% este mês
            </p>
          </CardContent>
        </Card>

        <Card className="glass hover:shadow-md transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Negócios Ativos
            </CardTitle>
            <Trello className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {deals.filter((d) => d.status === "open").length}
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center text-emerald-600">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              +2 novos esta semana
            </p>
          </CardContent>
        </Card>

        <Card className="glass hover:shadow-md transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tarefas Pendentes
            </CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tasks.filter((t) => t.status !== "done").length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {tasks.filter((t) => t.status === "todo").length} a fazer
            </p>
          </CardContent>
        </Card>

        <Card className="glass hover:shadow-md transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Taxa de Conversão
            </CardTitle>
            <Users className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24.5%</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center text-red-500">
              <ArrowDownRight className="h-3 w-3 mr-1" />
              -4% vs mês anterior
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Layout Principal: 3 Colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna Esquerda: Próximas Tarefas */}
        <div className="lg:col-span-1">
          <Card className="glass h-full">
            <CardHeader>
              <CardTitle className="text-base">Próximas Tarefas</CardTitle>
            </CardHeader>
            <CardContent>
              <UpcomingTasksList
                tasks={tasks}
                onTaskClick={handleTaskClick}
                onStatusChange={handleStatusChange}
                onDelete={handleDeleteTask}
              />
            </CardContent>
          </Card>
        </div>

        {/* Coluna Centro: Calendário */}
        <div className="lg:col-span-2">
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-base">Calendário de Tarefas</CardTitle>
            </CardHeader>
            <CardContent>
              <TaskCalendar
                tasks={tasks}
                onTaskClick={handleTaskClick}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Seção Inferior: Funil de Vendas */}
      <div>
        <RecentPipelineView deals={deals} />
      </div>

      {/* Modal de Edição de Tarefa */}
      <TaskEditModal
        task={selectedTask}
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setSelectedTask(null);
        }}
        onSave={handleTaskSave}
      />
    </div>
  );
}
