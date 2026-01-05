import { useState } from "react";
import { useEvents, EventLogistics } from "@/hooks/useEvents";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Calendar as CalendarIcon, 
  MapPin, 
  CheckSquare, 
  Truck, 
  Clock, 
  Plus, 
  Trash2, 
  Edit,
  MoreVertical,
  CheckCircle2,
  Circle
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

export default function Events() {
  const { events, loading, addEvent, updateEvent, deleteEvent } = useEvents();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventLogistics | null>(null);
  
  // Form states
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState<EventLogistics['status']>("planning");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedEvent) {
        await updateEvent(selectedEvent.id, {
          title,
          date,
          location,
          status
        });
      } else {
        await addEvent({
          title,
          date,
          location,
          status,
          checklist: [],
          suppliers: [],
          schedule: []
        });
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error(error);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDate("");
    setLocation("");
    setStatus("planning");
    setSelectedEvent(null);
  };

  const handleEdit = (event: EventLogistics) => {
    setSelectedEvent(event);
    setTitle(event.title);
    setDate(event.date);
    setLocation(event.location);
    setStatus(event.status);
    setIsDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'confirmed': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'in_progress': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'completed': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'cancelled': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'planning': return 'Planejamento';
      case 'confirmed': return 'Confirmado';
      case 'in_progress': return 'Em Andamento';
      case 'completed': return 'Concluído';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Gestão de Eventos</h1>
          <p className="text-muted-foreground mt-1">Logística, fornecedores e cronogramas</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Novo Evento
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{selectedEvent ? "Editar Evento" : "Novo Evento"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Nome do Evento</Label>
                <Input 
                  id="title" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  required 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="date">Data</Label>
                  <Input 
                    id="date" 
                    type="date" 
                    value={date} 
                    onChange={(e) => setDate(e.target.value)} 
                    required 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <select 
                    id="status"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                  >
                    <option value="planning">Planejamento</option>
                    <option value="confirmed">Confirmado</option>
                    <option value="in_progress">Em Andamento</option>
                    <option value="completed">Concluído</option>
                    <option value="cancelled">Cancelado</option>
                  </select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="location">Local</Label>
                <Input 
                  id="location" 
                  value={location} 
                  onChange={(e) => setLocation(e.target.value)} 
                  required 
                />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {selectedEvent ? "Salvar Alterações" : "Criar Evento"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <Card key={event.id} className="glass hover:shadow-lg transition-all duration-300 group">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <Badge variant="outline" className={getStatusColor(event.status)}>
                  {getStatusLabel(event.status)}
                </Badge>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(event)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteEvent(event.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardTitle className="mt-2 text-xl">{event.title}</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <CalendarIcon className="h-4 w-4" />
                {format(new Date(event.date), "dd 'de' MMMM, yyyy", { locale: ptBR })}
              </CardDescription>
              <CardDescription className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {event.location}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="checklist" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-4">
                  <TabsTrigger value="checklist">Checklist</TabsTrigger>
                  <TabsTrigger value="suppliers">Fornecedores</TabsTrigger>
                  <TabsTrigger value="schedule">Cronograma</TabsTrigger>
                </TabsList>
                
                <TabsContent value="checklist" className="h-[200px]">
                  <ScrollArea className="h-full pr-4">
                    <div className="space-y-2">
                      {event.checklist.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">Nenhum item no checklist</p>
                      ) : (
                        event.checklist.map((item) => (
                          <div key={item.id} className="flex items-center gap-2 text-sm">
                            <button className={cn("text-muted-foreground hover:text-primary", item.completed && "text-green-500")}>
                              {item.completed ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                            </button>
                            <span className={cn(item.completed && "line-through text-muted-foreground")}>
                              {item.task}
                            </span>
                          </div>
                        ))
                      )}
                      <Button variant="ghost" size="sm" className="w-full mt-2 text-xs">
                        <Plus className="h-3 w-3 mr-1" /> Adicionar Item
                      </Button>
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="suppliers" className="h-[200px]">
                  <ScrollArea className="h-full pr-4">
                    <div className="space-y-3">
                      {event.suppliers.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">Nenhum fornecedor vinculado</p>
                      ) : (
                        event.suppliers.map((supplier) => (
                          <div key={supplier.id} className="flex justify-between items-center text-sm border-b border-border pb-2 last:border-0">
                            <div>
                              <p className="font-medium">{supplier.name}</p>
                              <p className="text-xs text-muted-foreground">{supplier.service}</p>
                            </div>
                            <Badge variant="secondary" className="text-[10px]">
                              {supplier.status === 'paid' ? 'Pago' : supplier.status === 'confirmed' ? 'Confirmado' : 'Pendente'}
                            </Badge>
                          </div>
                        ))
                      )}
                      <Button variant="ghost" size="sm" className="w-full mt-2 text-xs">
                        <Plus className="h-3 w-3 mr-1" /> Adicionar Fornecedor
                      </Button>
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="schedule" className="h-[200px]">
                  <ScrollArea className="h-full pr-4">
                    <div className="space-y-3">
                      {event.schedule.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">Cronograma vazio</p>
                      ) : (
                        event.schedule.map((item) => (
                          <div key={item.id} className="flex gap-3 text-sm relative pl-4 border-l border-border">
                            <div className="absolute left-[-5px] top-1.5 w-2.5 h-2.5 rounded-full bg-primary" />
                            <span className="font-mono text-xs text-muted-foreground min-w-[40px]">{item.time}</span>
                            <div>
                              <p className="font-medium">{item.activity}</p>
                              <p className="text-xs text-muted-foreground">{item.responsible}</p>
                            </div>
                          </div>
                        ))
                      )}
                      <Button variant="ghost" size="sm" className="w-full mt-2 text-xs">
                        <Plus className="h-3 w-3 mr-1" /> Adicionar Atividade
                      </Button>
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
