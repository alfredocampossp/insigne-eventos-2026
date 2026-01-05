import { useState } from "react";
import { useTasks } from "@/hooks/useTasks";
import { useDeals } from "@/hooks/useDeals";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  isToday
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, CheckCircle2, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function Calendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const { tasks } = useTasks();
  const { deals } = useDeals();

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToToday = () => setCurrentMonth(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const getEventsForDay = (date: Date) => {
    const dayTasks = tasks.filter(task => 
      task.dueDate && isSameDay(new Date(task.dueDate), date)
    );
    
    const dayDeals = deals.filter(deal => 
      deal.expectedCloseDate && isSameDay(new Date(deal.expectedCloseDate.seconds * 1000), date)
    );

    return { tasks: dayTasks, deals: dayDeals };
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    const events = getEventsForDay(date);
    if (events.tasks.length > 0 || events.deals.length > 0) {
      setIsDialogOpen(true);
    }
  };

  const selectedDayEvents = selectedDate ? getEventsForDay(selectedDate) : { tasks: [], deals: [] };

  return (
    <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 flex-shrink-0">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Calendário</h1>
          <p className="text-muted-foreground mt-1">Visualize suas tarefas e previsões de fechamento</p>
        </div>
        <div className="flex items-center gap-2 bg-white/50 p-1 rounded-lg border border-white/20">
          <Button variant="ghost" size="icon" onClick={prevMonth}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="ghost" onClick={goToToday} className="font-medium min-w-[140px]">
            {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
          </Button>
          <Button variant="ghost" size="icon" onClick={nextMonth}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 glass rounded-xl border border-white/20 overflow-hidden flex flex-col">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 bg-white/30 border-b border-white/10">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
            <div key={day} className="py-3 text-center text-sm font-medium text-muted-foreground">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 grid grid-cols-7 grid-rows-5 sm:grid-rows-6">
          {calendarDays.map((day, dayIdx) => {
            const { tasks: dayTasks, deals: dayDeals } = getEventsForDay(day);
            const hasEvents = dayTasks.length > 0 || dayDeals.length > 0;
            
            return (
              <div
                key={day.toString()}
                onClick={() => handleDayClick(day)}
                className={cn(
                  "min-h-[80px] p-2 border-b border-r border-white/10 transition-colors cursor-pointer hover:bg-white/20 relative",
                  !isSameMonth(day, monthStart) && "bg-slate-50/30 text-muted-foreground",
                  isToday(day) && "bg-primary/5",
                  dayIdx % 7 === 0 && "border-l-0", // Remove left border for first column if needed
                  dayIdx % 7 === 6 && "border-r-0"  // Remove right border for last column
                )}
              >
                <div className="flex justify-between items-start">
                  <span className={cn(
                    "text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full",
                    isToday(day) ? "bg-primary text-white" : "text-slate-700"
                  )}>
                    {format(day, 'd')}
                  </span>
                  {hasEvents && (
                    <div className="flex gap-1">
                      {dayTasks.length > 0 && (
                        <span className="w-2 h-2 rounded-full bg-blue-400" title={`${dayTasks.length} Tarefas`} />
                      )}
                      {dayDeals.length > 0 && (
                        <span className="w-2 h-2 rounded-full bg-emerald-400" title={`${dayDeals.length} Negócios`} />
                      )}
                    </div>
                  )}
                </div>
                
                <div className="mt-1 space-y-1">
                  {dayTasks.slice(0, 2).map((task) => (
                    <div key={task.id} className="text-[10px] truncate bg-blue-100/50 text-blue-700 px-1 rounded border border-blue-200/50">
                      {task.title}
                    </div>
                  ))}
                  {dayDeals.slice(0, 1).map((deal) => (
                    <div key={deal.id} className="text-[10px] truncate bg-emerald-100/50 text-emerald-700 px-1 rounded border border-emerald-200/50">
                      {deal.title}
                    </div>
                  ))}
                  {(dayTasks.length > 2 || dayDeals.length > 1) && (
                    <div className="text-[10px] text-muted-foreground pl-1">
                      + {dayTasks.length + dayDeals.length - (dayTasks.length > 2 ? 2 : dayTasks.length) - (dayDeals.length > 1 ? 1 : dayDeals.length)} mais
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="glass border-white/20">
          <DialogHeader>
            <DialogTitle>
              Eventos de {selectedDate && format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {selectedDayEvents.tasks.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Tarefas
                </h3>
                <div className="space-y-2">
                  {selectedDayEvents.tasks.map(task => (
                    <div key={task.id} className="p-3 rounded-lg bg-white/50 border border-white/20 flex items-center justify-between">
                      <span className={cn("text-sm", task.status === 'done' && "line-through text-muted-foreground")}>
                        {task.title}
                      </span>
                      <span className={cn(
                        "text-[10px] px-2 py-0.5 rounded-full border",
                        task.priority === 'high' ? "bg-red-50 text-red-600 border-red-100" :
                        task.priority === 'medium' ? "bg-orange-50 text-orange-600 border-orange-100" :
                        "bg-blue-50 text-blue-600 border-blue-100"
                      )}>
                        {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Média' : 'Baixa'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedDayEvents.deals.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" /> Previsão de Fechamento
                </h3>
                <div className="space-y-2">
                  {selectedDayEvents.deals.map(deal => (
                    <div key={deal.id} className="p-3 rounded-lg bg-white/50 border border-white/20 flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">{deal.title}</div>
                        <div className="text-xs text-muted-foreground">{deal.companyName}</div>
                      </div>
                      <div className="text-sm font-semibold text-emerald-600">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(deal.value)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedDayEvents.tasks.length === 0 && selectedDayEvents.deals.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum evento para este dia.
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
