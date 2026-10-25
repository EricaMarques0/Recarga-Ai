import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { Check, Copy, Loader2, Clock, Info } from "lucide-react";
import { useMemo, useState } from "react";
import { brl, getCard, validateAmount } from "@/lib/data";
import { DemoTag, PageTitle, PrimaryButton, Steps } from "@/components/app-ui";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/pagamento")({
  validateSearch: (s: Record<string, unknown>) => ({ card: String(s.card ?? ""), amount: Number(s.amount) }),
  beforeLoad: ({ search }) => {
    if (!getCard(search.card) || !validateAmount(String(search.amount).replace(".", ",")).value)
      throw redirect({ to: "/cartoes", search: { q: undefined } });
  },
  head: () => ({
    meta: [
      { title: "Pagamento via Pix — RecargaAí" },
      { name: "description", content: "Pagamento demonstrativo via Pix da sua recarga." },
      { property: "og:title", content: "Pagamento via Pix — RecargaAí" },
      { property: "og:description", content: "Pagamento demonstrativo via Pix da sua recarga." },
    ],
  }),
  component: PixPage,
});

// Padrão visual pseudo-aleatório — NÃO é um QR Code válido.
function FakeQr() {
  const cells = useMemo(() => {
    const n = 25;
    let seed = 7;
    const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
    const finder = (x: number, y: number) =>
      [[0, 0], [n - 7, 0], [0, n - 7]].some(([fx, fy]) => x >= fx && x < fx + 7 && y >= fy && y < fy + 7);
    const out: { x: number; y: number }[] = [];
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (!finder(x, y) && rnd() > 0.52) out.push({ x, y });
    return out;
  }, []);
  const Finder = ({ x, y }: { x: number; y: number }) => (
    <g>
      <rect x={x} y={y} width="7" height="7" className="fill-navy" />
      <rect x={x + 1} y={y + 1} width="5" height="5" className="fill-card" />
      <rect x={x + 2} y={y + 2} width="3" height="3" className="fill-navy" />
    </g>
  );
  return (
    <svg viewBox="-1 -1 27 27" className="h-48 w-48" aria-label="QR Code ilustrativo, não válido">
      {cells.map((c, i) => <rect key={i} x={c.x} y={c.y} width="1" height="1" className="fill-navy" />)}
      <Finder x={0} y={0} /><Finder x={18} y={0} /><Finder x={0} y={18} />
    </svg>
  );
}

function PixPage() {
  const { card: cardId, amount } = Route.useSearch();
  const card = getCard(cardId)!;
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState<"waiting" | "processing" | "paid">("waiting");
  const code = `DEMO-PIX-RECARGAAI-${card.id.toUpperCase()}-${amount.toFixed(2)}-NAO-PAGAVEL`;

  const copy = async () => {
    try { await navigator.clipboard.writeText(code); } catch { /* ignore */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const simulate = () => {
    setStatus("processing");
    setTimeout(() => {
      setStatus("paid");
      const id = "RA-" + Math.random().toString(36).slice(2, 7).toUpperCase();
      setTimeout(() => navigate({ to: "/confirmacao", search: { card: card.id, amount, id } }), 900);
    }, 1400);
  };

  return (
    <div>
      <Steps current={3} />
      <PageTitle title="Pague com Pix" subtitle={`Recarga ${card.name} · ${card.region}`} />

      <div className="card-surface p-5 text-center">
        <p className="text-sm text-muted-foreground">Valor total</p>
        <p className="text-3xl font-bold text-navy">{brl(amount)}</p>

        <div
          className={cn(
            "mx-auto mt-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium",
            status === "paid" ? "bg-secondary text-secondary-foreground" : "bg-warning-soft text-navy",
          )}
        >
          {status === "waiting" && <><Clock className="h-4 w-4" /> Aguardando pagamento</>}
          {status === "processing" && <><Loader2 className="h-4 w-4 animate-spin" /> Verificando pagamento…</>}
          {status === "paid" && <><Check className="h-4 w-4" /> Pagamento confirmado (simulado)</>}
        </div>

        <div className="relative mx-auto mt-5 w-fit rounded-2xl border border-border bg-card p-3">
          <div className={cn(status !== "waiting" && "opacity-30 transition")}><FakeQr /></div>
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-md bg-card px-2 py-1 text-xs font-bold text-destructive shadow-card">
            ILUSTRATIVO
          </span>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">QR Code ilustrativo — não é válido para pagamento.</p>

        <div className="mt-5 text-left">
          <label className="text-sm font-medium text-navy">Pix Copia e Cola <DemoTag>Simulado</DemoTag></label>
          <div className="mt-2 flex gap-2">
            <input readOnly value={code} className="h-11 min-w-0 flex-1 truncate rounded-xl border border-border bg-muted px-3 font-mono text-xs" />
            <button
              onClick={copy}
              className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-xl border border-primary px-4 text-sm font-semibold text-primary transition hover:bg-secondary"
            >
              {copied ? <><Check className="h-4 w-4" /> Copiado</> : <><Copy className="h-4 w-4" /> Copiar</>}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-4 flex gap-2 rounded-xl bg-warning-soft p-3 text-sm text-navy">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        Ambiente de protótipo: nenhuma cobrança real é gerada.
      </div>

      <PrimaryButton className="mt-6" disabled={status !== "waiting"} onClick={simulate}>
        {status === "waiting" ? "Simular confirmação do pagamento" : "Processando…"}
      </PrimaryButton>
    </div>
  );
}
