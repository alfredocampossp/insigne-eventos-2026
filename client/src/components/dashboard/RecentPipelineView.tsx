import { Deal, DEFAULT_PIPELINE_STAGES } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

interface RecentPipelineViewProps {
  deals: Deal[];
}

export function RecentPipelineView({ deals }: RecentPipelineViewProps) {
  // Agrupar deals por estágio
  const dealsByStage = DEFAULT_PIPELINE_STAGES.map((stage) => ({
    ...stage,
    deals: deals.filter((d) => d.pipelineStageId === stage.id),
  }));

  // Calcular totais
  const totalValue = deals.reduce((sum, d) => sum + d.value, 0);
  const totalDeals = deals.length;

  return (
    <div className="space-y-4">
      {/* Resumo */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="glass">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total em Negociação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {totalValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalDeals} negócios ativos
            </p>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Probabilidade Média
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalDeals > 0
                ? Math.round(
                    deals.reduce((sum, d) => sum + d.probability, 0) /
                      totalDeals
                  )
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              De fechamento
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Funil */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Funil de Vendas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {dealsByStage.map((stage) => {
              const stageValue = stage.deals.reduce((sum, d) => sum + d.value, 0);
              const percentage =
                totalValue > 0 ? (stageValue / totalValue) * 100 : 0;

              return (
                <div key={stage.id}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{stage.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {stage.deals.length} • R${" "}
                      {stageValue.toLocaleString("pt-BR", {
                        minimumFractionDigits: 0,
                      })}
                    </span>
                  </div>
                  <div className="w-full bg-white/30 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full transition-all ${stage.color}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Deals recentes */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="text-base">Negócios Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {deals.slice(0, 5).map((deal) => {
              const stage = DEFAULT_PIPELINE_STAGES.find(
                (s) => s.id === deal.pipelineStageId
              );

              return (
                <div
                  key={deal.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-white/50 border border-white/20 hover:border-white/40 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {deal.title}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {deal.companyName}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right">
                      <p className="font-semibold text-sm">
                        R$ {deal.value.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {deal.probability}%
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded font-medium text-white ${stage?.color.replace("bg-", "bg-").replace("border-", "")}`}>
                      {stage?.name}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
