import { createFileRoute, Link } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { brl, getCard, maskNumber } from "@/lib/catalog";
import { clearHistory, formatWhen, removeRecharge, resolveStatus, STATUS_LABEL, type RechargeStatus } from "@/lib/wallet";
import { useWallet } from "@/hooks/use-wallet";
import { CardBadge, PageTitle, primaryButtonClass } from "@/components/recarga-ui";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/historico")({
  head: () => ({
    meta: [
      { title: "Histórico de recargas — RecargaAí" },
      { name: "description", content: "Acompanhe as recargas feitas neste aparelho." },
      { property: "og:title", content: "Histórico de recargas — RecargaAí" },
      { property: "og:description", content: "Acompanhe as recargas feitas neste aparelho." },
    ],
  }),
  component: HistoryPage,
});

const FILTERS: { id: "all" | RechargeStatus; label: string }[] = [
  { id: "all", label: "Todas" },
  { id: "confirmada", label: "Confirmadas" },
  { id: "aguardando", label: "Aguardando" },
  { id: "expirada", label: "Expiradas" },
  { id: "substituida", label: "Substituídas" },
];

function HistoryPage() {
  const wallet = useWallet();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");
  const [removing, setRemoving] = useState<string | null>(null);
  const [clearing, setClearing] = useState(false);
  const items = (wallet?.recharges ?? []).filter((r) => filter === "all" || resolveStatus(r) === filter);
  const hasHistory = (wallet?.recharges.length ?? 0) > 0;

  return (
    <div>
      <PageTitle title="Histórico de recargas" subtitle="As recargas deste aparelho ficam salvas aqui." />
      {clearing ? (
        <div className="card-surface mb-5 p-4">
          <p className="font-extrabold text-navy">Limpar todo o histórico?</p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            As recargas saem deste aparelho. Os cartões salvos continuam.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setClearing(false)}
              className="h-11 rounded-2xl border border-border font-semibold text-navy"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => {
                clearHistory();
                setClearing(false);
                setRemoving(null);
              }}
              className="h-11 rounded-2xl bg-destructive font-semibold text-destructive-foreground"
            >
              Limpar
            </button>
          </div>
        </div>
      ) : (
        hasHistory && (
          <button
            type="button"
            onClick={() => {
              setClearing(true);
              setRemoving(null);
            }}
            className="mb-5 inline-flex h-11 items-center justify-center rounded-2xl border border-border bg-card px-4 text-sm font-semibold text-navy transition hover:border-destructive/40 hover:text-destructive"
          >
            Limpar histórico
          </button>
        )
      )}
      <div className="mb-5 flex gap-2 overflow-x-auto" role="group" aria-label="Filtrar por status">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            aria-pressed={filter === f.id}
            onClick={() => setFilter(f.id)}
            className={cn(
              "shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition",
              filter === f.id ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {!wallet ? (
        <div className="card-surface h-28 animate-pulse" />
      ) : items.length === 0 ? (
        <div className="card-surface p-8 text-center">
          <p className="font-semibold text-navy">{filter === "all" ? "Nenhuma recarga ainda" : "Nada com esse status"}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {filter === "all" ? "Escolha um cartão para fazer a primeira recarga." : "Tente outro filtro."}
          </p>
          {filter === "all" && (
            <Link to="/cartoes" search={{ q: undefined }} className={`${primaryButtonClass} mt-5`}>
              Recarregar
            </Link>
          )}
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((h) => {
            const c = getCard(h.catalogId);
            if (!c) return null;
            const status = resolveStatus(h);
            if (removing === h.id) {
              return (
                <li key={h.id} className="card-surface p-4">
                  <p className="font-extrabold text-navy">Remover esta recarga?</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {h.nickname} · {brl(h.amount)} sai do histórico. O cartão salvo continua.
                  </p>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRemoving(null)}
                      className="h-11 rounded-2xl border border-border font-semibold text-navy"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        removeRecharge(h.id);
                        setRemoving(null);
                      }}
                      className="h-11 rounded-2xl bg-destructive font-semibold text-destructive-foreground"
                    >
                      Remover
                    </button>
                  </div>
                </li>
              );
            }
            return (
              <li key={h.id} className="card-surface p-4">
                <div className="flex items-center gap-3">
                  <CardBadge card={c} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-navy">{h.nickname}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {c.name} · {maskNumber(h.number)}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {formatWhen(h.createdAt)} · <span className="font-mono">{h.id}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-navy">{brl(h.amount)}</p>
                    <span
                      className={cn(
                        "text-xs font-medium",
                        status === "confirmada" && "text-primary",
                        status === "aguardando" && "text-navy",
                        (status === "expirada" || status === "substituida") && "text-muted-foreground",
                      )}
                    >
                      {STATUS_LABEL[status]}
                    </span>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <div className="text-sm font-semibold">
                    {status === "confirmada" && (
                      <Link to="/confirmacao" search={{ id: h.id }} className="text-primary">
                        Ver comprovante
                      </Link>
                    )}
                    {status === "aguardando" && (
                      <Link to="/pagamento" search={{ id: h.id }} className="text-primary">
                        Continuar Pix
                      </Link>
                    )}
                    {status === "expirada" && (
                      <Link to="/valor" search={{ card: c.id, saved: h.savedCardId, amount: h.amount }} className="text-primary">
                        Tentar de novo
                      </Link>
                    )}
                  </div>
                  <button
                    type="button"
                    aria-label={`Remover recarga ${h.id}`}
                    onClick={() => {
                      setRemoving(h.id);
                      setClearing(false);
                    }}
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-navy/45 transition hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
