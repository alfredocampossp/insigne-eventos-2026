import { Proposal } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Download, Eye } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface DealProposalsSectionProps {
  proposals: Proposal[];
  onViewProposal?: (proposal: Proposal) => void;
  onDownloadProposal?: (proposal: Proposal) => void;
}

export function DealProposalsSection({
  proposals,
  onViewProposal,
  onDownloadProposal,
}: DealProposalsSectionProps) {
  const statusBadges = {
    draft: <Badge variant="outline" className="bg-gray-50 text-gray-700">Rascunho</Badge>,
    sent: <Badge variant="outline" className="bg-blue-50 text-blue-700">Enviada</Badge>,
    accepted: <Badge variant="outline" className="bg-green-50 text-green-700">Aceita</Badge>,
    rejected: <Badge variant="outline" className="bg-red-50 text-red-700">Rejeitada</Badge>,
  };

  if (proposals.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Nenhuma proposta associada</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {proposals.map((proposal) => {
        const validUntil = proposal.validUntil?.toDate?.() || new Date(proposal.validUntil);
        const isExpired = validUntil < new Date();

        return (
          <div
            key={proposal.id}
            className="p-4 bg-white/50 rounded-lg border border-white/20 hover:border-white/40 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <p className="font-semibold">
                    Proposta v{proposal.version}
                  </p>
                  {statusBadges[proposal.status]}
                  {isExpired && proposal.status !== "accepted" && (
                    <Badge variant="outline" className="bg-orange-50 text-orange-700">
                      Expirada
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                  <div>
                    <p className="text-muted-foreground">Subtotal</p>
                    <p className="font-semibold">
                      R$ {proposal.subtotal.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total</p>
                    <p className="font-semibold text-lg">
                      R$ {proposal.total.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground">
                  Válida até:{" "}
                  {format(validUntil, "dd 'de' MMMM 'de' yyyy", {
                    locale: ptBR,
                  })}
                </p>

                {proposal.notes && (
                  <p className="text-sm text-foreground/70 mt-2 p-2 bg-white/30 rounded">
                    {proposal.notes}
                  </p>
                )}

                <div className="mt-3 text-xs text-muted-foreground">
                  <p>
                    {proposal.items.length} item
                    {proposal.items.length !== 1 ? "ns" : ""}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {onViewProposal && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewProposal(proposal)}
                    className="gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Ver
                  </Button>
                )}
                {onDownloadProposal && proposal.pdfUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDownloadProposal(proposal)}
                    className="gap-2"
                  >
                    <Download className="w-4 h-4" />
                    PDF
                  </Button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
