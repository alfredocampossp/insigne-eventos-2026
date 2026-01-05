import { useState } from "react";
import { useTasks } from "@/hooks/useTasks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Search, Calendar, CheckCircle2, Circle, AlertCircle, Loader2, Trash2 } from "lucide-react";
import { Task } from "@/types";
import { cn } from "@/lib/utils";

export default function Tasks() {
  const { tasks, loading, addTask, updateTask, deleteTask } = useTasks();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
    priority: "medium" as "low" | "medium" | "high",
    status: "todo" as "todo" | "in_progress" | "done"
  });

  const filteredTasks = tasks.filter(task => 
    task.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await addTask({
      ...formData,
      dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null
    });
    
    setIsDialogOpen(false);
    setFormData({
      title: "",
      description: "",
      dueDate: "",
      priority: "medium",
      status: "todo"
    });
  };

  const toggleTaskStatus = async (task: Task) => {
    const newStatus = task.status === "done" ? "todo" : "done";
    await updateTask(task.id!, { status: newStatus });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "text-red-500 bg-red-50 border-red-200";
      case "medium": return "text-orange-500 bg-orange-50 border-orange-200";
      case "low": return "text-blue-500 bg-blue-50 border-blue-200";
      default: return "text-slate-500 bg-slate-50 border-slate-200";
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Tarefas</h1>
          <p className="text-muted-foreground mt-1">Gerencie suas atividades diárias</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20">
              <Plus className="w-4 h-4 mr-2" />
              Nova Tarefa
            </Button>
          </DialogTrigger>
          <DialogContent className="glass border-white/20">
            <DialogHeader>
              <DialogTitle>Nova Tarefa</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título *</Label>
                <Input 
                  id="title" 
                  value={formData.title} 
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required 
                  className="bg-white/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Input 
                  id="description" 
                  value={formData.description} 
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="bg-white/50"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Data de Vencimento</Label>
                  <Input 
                    id="dueDate" 
                    type="date"
                    value={formData.dueDate} 
                    onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                    className="bg-white/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Prioridade</Label>
                  <Select 
                    value={formData.priority} 
                    onValueChange={(value: any) => setFormData({...formData, priority: value})}
                  >
                    <SelectTrigger className="bg-white/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baixa</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                <Button type="submit">Criar Tarefa</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-2 bg-white/50 p-2 rounded-lg border border-white/20 max-w-md">
        <Search className="w-4 h-4 text-muted-foreground ml-2" />
        <Input 
          placeholder="Buscar tarefas..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
        />
      </div>

      <div className="grid gap-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground bg-white/30 rounded-xl border border-white/20">
            Nenhuma tarefa encontrada.
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div 
              key={task.id} 
              className={cn(
                "group flex items-center gap-4 p-4 rounded-xl border transition-all duration-200",
                task.status === "done" 
                  ? "bg-slate-50/50 border-slate-100 opacity-60" 
                  : "bg-white/60 border-white/40 hover:shadow-md hover:border-primary/20"
              )}
            >
              <button 
                onClick={() => toggleTaskStatus(task)}
                className={cn(
                  "flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                  task.status === "done"
                    ? "bg-primary border-primary text-white"
                    : "border-slate-300 hover:border-primary text-transparent"
                )}
              >
                <CheckCircle2 className="w-4 h-4" />
              </button>
              
              <div className="flex-1 min-w-0">
                <h3 className={cn(
                  "font-medium truncate",
                  task.status === "done" && "line-through text-slate-500"
                )}>
                  {task.title}
                </h3>
                {task.description && (
                  <p className="text-sm text-muted-foreground truncate">{task.description}</p>
                )}
              </div>

              <div className="flex items-center gap-4 text-sm">
                {task.dueDate && (
                  <div className={cn(
                    "flex items-center gap-1.5",
                    new Date(task.dueDate) < new Date() && task.status !== "done" ? "text-red-500" : "text-slate-500"
                  )}>
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(task.dueDate).toLocaleDateString('pt-BR')}</span>
                  </div>
                )}
                
                <span className={cn(
                  "px-2.5 py-0.5 rounded-full text-xs font-medium border",
                  getPriorityColor(task.priority)
                )}>
                  {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Média' : 'Baixa'}
                </span>

                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => task.id && deleteTask(task.id)}
                >
                  <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
