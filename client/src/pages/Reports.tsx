import { useDeals } from "@/hooks/useDeals";
import { useFinancial } from "@/hooks/useFinancial";
import { useTasks } from "@/hooks/useTasks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from "recharts";
import { Loader2, TrendingUp, Users, DollarSign, CheckCircle2 } from "lucide-react";

export default function Reports() {
  const { deals, loading: dealsLoading } = useDeals();
  const { records, loading: financialLoading } = useFinancial();
  const { tasks, loading: tasksLoading } = useTasks();

  const loading = dealsLoading || financialLoading || tasksLoading;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-8rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // 1. Funil de Vendas (Deals by Stage)
  const dealsByStage = deals.reduce((acc, deal) => {
    const stage = deal.pipelineStageId;
    acc[stage] = (acc[stage] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const funnelData = [
    { name: 'Lead', value: dealsByStage['lead'] || 0 },
    { name: 'Reunião', value: dealsByStage['meeting'] || 0 },
    { name: 'Proposta', value: dealsByStage['proposal'] || 0 },
    { name: 'Negociação', value: dealsByStage['negotiation'] || 0 },
    { name: 'Ganho', value: dealsByStage['won'] || 0 },
  ];

  // 2. Receita vs Despesa (Financial)
  const financialSummary = records.reduce((acc, record) => {
    if (record.type === 'income') acc.income += record.amount;
    if (record.type === 'expense') acc.expense += record.amount;
    return acc;
  }, { income: 0, expense: 0 });

  const financialData = [
    { name: 'Receitas', value: financialSummary.income },
    { name: 'Despesas', value: financialSummary.expense },
  ];

  // 3. Previsão de Vendas (Forecast)
  const forecastValue = deals
    .filter(d => d.status === 'open')
    .reduce((sum, d) => sum + (d.value * (d.probability / 100)), 0);

  const totalPipelineValue = deals
    .filter(d => d.status === 'open')
    .reduce((sum, d) => sum + d.value, 0);

  // 4. Tarefas por Status
  const tasksByStatus = tasks.reduce((acc, task) => {
    acc[task.status] = (acc[task.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const tasksData = [
    { name: 'A Fazer', value: tasksByStatus['todo'] || 0, color: '#94a3b8' },
    { name: 'Em Progresso', value: tasksByStatus['in_progress'] || 0, color: '#3b82f6' },
    { name: 'Concluídas', value: tasksByStatus['done'] || 0, color: '#10b981' },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div className="space-y-8 pb-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Relatórios e Dashboards</h1>
        <p className="text-muted-foreground mt-1">Análise estratégica do seu negócio</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass border-white/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor em Pipeline</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPipelineValue)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total de oportunidades abertas
            </p>
          </CardContent>
        </Card>
        <Card className="glass border-white/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Previsão Ponderada</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(forecastValue)}
            </div>
            <p className="text-xs text-muted-foreground">
              Baseado na probabilidade de fechamento
            </p>
          </CardContent>
        </Card>
        <Card className="glass border-white/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {deals.length > 0 
                ? Math.round((dealsByStage['won'] || 0) / deals.length * 100) 
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Negócios ganhos vs total
            </p>
          </CardContent>
        </Card>
        <Card className="glass border-white/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tarefas Concluídas</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {tasksByStatus['done'] || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Produtividade da equipe
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="glass border-white/20">
          <CardHeader>
            <CardTitle>Funil de Vendas</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={80} tick={{fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: 'transparent'}}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" fill="#4f46e5" radius={[0, 4, 4, 0]} barSize={30}>
                  {funnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass border-white/20">
          <CardHeader>
            <CardTitle>Receitas vs Despesas</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={financialData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  <Cell fill="#10b981" /> {/* Receitas - Emerald */}
                  <Cell fill="#ef4444" /> {/* Despesas - Red */}
                </Pie>
                <Tooltip formatter={(value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value))} />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="glass border-white/20">
          <CardHeader>
            <CardTitle>Status das Tarefas</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={tasksData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {tasksData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Placeholder for future chart */}
        <Card className="glass border-white/20 flex items-center justify-center bg-slate-50/50">
          <div className="text-center p-8">
            <TrendingUp className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-500">Mais métricas em breve</h3>
            <p className="text-sm text-slate-400">
              Novos relatórios de performance de equipe e conversão por origem serão adicionados aqui.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
