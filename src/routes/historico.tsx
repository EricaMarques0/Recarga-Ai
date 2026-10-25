import { createFileRoute } from "@tanstack/react-router";
import { brl, getCard, HISTORY } from "@/lib/data";
import { CardBadge, DemoTag, PageTitle } from "@/components/app-ui";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/historico")({
  head: () => ({
    meta: [
      { title: "Histórico de recargas — RecargaAí" },
      { name: "description", content: "Acompanhe suas recargas anteriores." },
      { property: "og:title", content: "Histórico de recargas — RecargaAí" },
      { property: "og:description", content: "Acompanhe suas recargas anteriores." },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  return (
    <div>
      <PageTitle title="Histórico de recargas" />
      <p className="-mt-3 mb-5"><DemoTag>Dados de demonstração</DemoTag></p>
      <ul className="space-y-3">
        {HISTORY.map((h) => {
          const c = getCard(h.cardId)!;
          return (
            <li key={h.id} className="card-surface flex items-center gap-3 p-4">
              <CardBadge card={c} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-navy">{c.name}</p>
                <p className="text-xs text-muted-foreground">{h.date} · <span className="font-mono">{h.id}</span></p>
              </div>
              <div className="text-right">
                <p className="font-bold text-navy">{brl(h.amount)}</p>
                <span
                  className={cn(
                    "text-xs font-medium",
                    h.status === "Concluída" && "text-primary",
                    h.status === "Em processamento" && "text-navy",
                    h.status === "Expirada" && "text-muted-foreground",
                  )}
                >
                  {h.status}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
