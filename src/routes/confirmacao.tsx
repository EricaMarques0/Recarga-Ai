import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { CheckCircle2, FileText, Info, X } from "lucide-react";
import { useState } from "react";
import { brl, getCard } from "@/lib/catalog";
import { DemoTag, PrimaryButton, Steps, SummaryRow } from "@/components/recarga-ui";

export const Route = createFileRoute("/confirmacao")({
  validateSearch: (s: Record<string, unknown>) => ({
    card: String(s["card"] ?? ""),
    amount: Number(s["amount"]),
    id: String(s["id"] ?? "RA-DEMO"),
  }),
  beforeLoad: ({ search }) => {
    if (!getCard(search.card) || !(search.amount > 0)) throw redirect({ to: "/" });
  },
  head: () => ({
    meta: [
      { title: "Recarga confirmada — RecargaAí" },
      { name: "description", content: "Resumo e comprovante demonstrativo da sua recarga." },
      { property: "og:title", content: "Recarga confirmada — RecargaAí" },
      { property: "og:description", content: "Resumo e comprovante demonstrativo da sua recarga." },
    ],
  }),
  component: ConfirmPage,
});

function ConfirmPage() {
  const { card: cardId, amount, id } = Route.useSearch();
  const card = getCard(cardId)!;
  const [receipt, setReceipt] = useState(false);
  const date = new Date().toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });

  const rows = (
    <>
      <SummaryRow label="Cartão" value={card.name} />
      <SummaryRow label="Região" value={card.region} />
      <SummaryRow label="Valor" value={brl(amount)} />
      <SummaryRow label="Taxa de conveniência" value={brl(0)} />
      <SummaryRow label="Identificador" value={<span className="font-mono">{id}</span>} />
      <SummaryRow label="Status" value={<DemoTag>Em processamento (simulado)</DemoTag>} />
    </>
  );

  return (
    <div>
      <Steps current={4} />
      <div className="text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-secondary text-primary">
          <CheckCircle2 className="h-9 w-9" />
        </span>
        <h1 className="mt-4 text-2xl font-bold text-navy">Pagamento recebido!</h1>
        <p className="mt-1 text-muted-foreground">Sua recarga foi registrada nesta simulação.</p>
      </div>

      <div className="card-surface mt-6 divide-y divide-border px-4">{rows}</div>

      <div className="mt-4 flex gap-2 rounded-xl bg-secondary p-3 text-sm text-secondary-foreground">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        A disponibilização e a validação do crédito dependem do sistema do cartão e das instruções da operadora.
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <button
          onClick={() => setReceipt(true)}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-primary font-semibold text-primary hover:bg-secondary"
        >
          <FileText className="h-4 w-4" /> Ver comprovante
        </button>
        <Link to="/"><PrimaryButton>Voltar ao início</PrimaryButton></Link>
      </div>

      {receipt && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-navy/50 p-4" onClick={() => setReceipt(false)}>
          <div className="card-surface w-full max-w-sm p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-navy">Comprovante</h2>
              <button onClick={() => setReceipt(false)} aria-label="Fechar"><X className="h-5 w-5 text-muted-foreground" /></button>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{date} · Documento demonstrativo sem validade.</p>
            <div className="mt-3 divide-y divide-dashed divide-border">{rows}</div>
          </div>
        </div>
      )}
    </div>
  );
}
