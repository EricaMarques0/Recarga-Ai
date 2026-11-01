import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { Check, CheckCircle2, Copy, FileText, Info, Printer, X } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { brl, getCard, maskNumber } from "@/lib/catalog";
import { copyText, formatWhen, receiptLines, resolveStatus } from "@/lib/wallet";
import { useWallet } from "@/hooks/use-wallet";
import { primaryButtonClass, secondaryButtonClass, Steps, SummaryRow } from "@/components/recarga-ui";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/confirmacao")({
  validateSearch: (s: Record<string, unknown>) => ({ id: String(s["id"] ?? "") }),
  beforeLoad: ({ search }) => {
    if (!/^RA-[A-Z0-9]+$/.test(search.id)) throw redirect({ to: "/" });
  },
  head: () => ({
    meta: [
      { title: "Recarga confirmada — RecargaAí" },
      { name: "description", content: "Resumo, linha do tempo e comprovante da sua recarga." },
      { property: "og:title", content: "Recarga confirmada — RecargaAí" },
      { property: "og:description", content: "Resumo, linha do tempo e comprovante da sua recarga." },
    ],
  }),
  component: ConfirmPage,
});

function ConfirmPage() {
  const { id } = Route.useSearch();
  const wallet = useWallet();
  const navigate = useNavigate();
  const recharge = wallet?.recharges.find((r) => r.id === id);
  const card = recharge ? getCard(recharge.catalogId) : undefined;
  const [receipt, setReceipt] = useState(false);
  const [copied, setCopied] = useState<"ok" | "fail" | null>(null);

  useEffect(() => {
    if (!wallet) return;
    if (!recharge || !card) {
      navigate({ to: "/", replace: true });
      return;
    }
    const status = resolveStatus(recharge);
    if (status === "aguardando") navigate({ to: "/pagamento", search: { id }, replace: true });
    if (status === "expirada" || status === "substituida") navigate({ to: "/historico", replace: true });
  }, [wallet, recharge, card, navigate, id]);

  if (!recharge || !card || resolveStatus(recharge) !== "confirmada") {
    return (
      <div>
        <Steps current={4} />
        <div className="card-surface h-40 animate-pulse" />
      </div>
    );
  }

  const lines = receiptLines(recharge, card);
  const when = formatWhen(recharge.paidAt ?? recharge.createdAt);
  const copy = async () => {
    const ok = await copyText(lines.join("\n"));
    setCopied(ok ? "ok" : "fail");
    window.setTimeout(() => setCopied(null), 2000);
  };

  const timeline = [
    { title: "Pagamento confirmado", text: when, state: "done" as const },
    { title: "Repasse à operadora", text: card.creditTime, state: "current" as const },
    { title: "Validar no cartão", text: card.validation, state: "upcoming" as const },
  ];

  return (
    <div>
      <div className="print:hidden">
        <Steps current={4} />
        <div className="text-center">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-secondary text-primary">
            <CheckCircle2 className="h-9 w-9" />
          </span>
          <h1 className="mt-4 text-2xl font-bold text-navy">Pagamento confirmado</h1>
          <p className="mt-1 text-muted-foreground">A recarga de {recharge.nickname} entrou na fila de repasse.</p>
        </div>

        <div className="card-surface mt-6 divide-y divide-border px-4">
          <SummaryRow label="Cartão" value={card.name} />
          <SummaryRow label="Apelido" value={recharge.nickname} />
          <SummaryRow label="Número" value={<span className="font-mono">{maskNumber(recharge.number)}</span>} />
          <SummaryRow label="Valor" value={brl(recharge.amount)} />
          <SummaryRow label="Taxa de conveniência" value={brl(0)} />
          <SummaryRow label="Identificador" value={<span className="font-mono">{recharge.id}</span>} />
          <SummaryRow label="Data" value={when} />
        </div>

        <ol className="card-surface mt-4 px-4 py-5">
          {timeline.map((step, i) => (
            <li key={step.title} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span
                  className={cn(
                    "grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold",
                    step.state === "done" && "bg-primary text-primary-foreground",
                    step.state === "current" && "bg-navy text-cream ring-4 ring-primary/15",
                    step.state === "upcoming" && "border-2 border-dashed border-navy/25 bg-cream text-navy/45",
                  )}
                >
                  {step.state === "done" ? <Check className="h-4 w-4" /> : i + 1}
                </span>
                {i < timeline.length - 1 && <span className="my-1 w-px flex-1 border-l-2 border-dashed border-primary/40" />}
              </div>
              <div className={cn("min-w-0", i < timeline.length - 1 ? "pb-5" : "")}>
                <p className="font-bold text-navy">{step.title}</p>
                <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-4 flex gap-2 rounded-xl bg-secondary p-3 text-sm text-secondary-foreground">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          O crédito entra no cartão depois da validação na operadora.
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button type="button" onClick={() => setReceipt(true)} className={secondaryButtonClass}>
            <FileText className="h-4 w-4" /> Ver comprovante
          </button>
          <button type="button" onClick={copy} className={secondaryButtonClass}>
            {copied === "ok" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied === "ok" ? "Copiado" : "Copiar comprovante"}
          </button>
          <button type="button" onClick={() => window.print()} className={secondaryButtonClass}>
            <Printer className="h-4 w-4" /> Imprimir
          </button>
          <Link to="/historico" className={secondaryButtonClass}>
            Histórico
          </Link>
          <Link to="/" className={cn(primaryButtonClass, "sm:col-span-2")}>
            Voltar ao início
          </Link>
        </div>
        {copied === "fail" && (
          <p role="alert" className="mt-2 text-sm text-destructive">
            Não foi possível copiar. Abra o comprovante e selecione o texto.
          </p>
        )}

        {receipt && (
          <ReceiptDialog title="Comprovante" onClose={() => setReceipt(false)}>
            <p className="text-xs text-muted-foreground">{when}</p>
            <div className="mt-3 divide-y divide-dashed divide-border">
              <SummaryRow label="Cartão" value={card.name} />
              <SummaryRow label="Apelido" value={recharge.nickname} />
              <SummaryRow label="Número" value={<span className="font-mono">{maskNumber(recharge.number)}</span>} />
              <SummaryRow label="Operadora" value={card.operator} />
              <SummaryRow label="Valor" value={brl(recharge.amount)} />
              <SummaryRow label="Taxa" value={brl(0)} />
              <SummaryRow label="Identificador" value={<span className="font-mono">{recharge.id}</span>} />
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{card.validation}</p>
            <button type="button" onClick={copy} className={`${primaryButtonClass} mt-4`}>
              {copied === "ok" ? "Copiado" : "Copiar comprovante"}
            </button>
          </ReceiptDialog>
        )}
      </div>

      <article id="comprovante-print" className="hidden text-sm leading-6">
        {lines.map((line, i) => (
          <p key={i} className={line ? "" : "h-3"}>
            {line}
          </p>
        ))}
      </article>
    </div>
  );
}

function ReceiptDialog({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const node = ref.current;
    const focusable = () =>
      [...(node?.querySelectorAll<HTMLElement>("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])") ?? [])].filter(
        (el) => !el.hasAttribute("disabled"),
      );
    focusable()[0]?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeRef.current();
      if (e.key !== "Tab" || !node) return;
      const items = focusable();
      const first = items[0];
      const last = items[items.length - 1];
      if (!first || !last) return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      previous?.focus();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-navy/50 p-4" onClick={onClose}>
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="comprovante-titulo"
        className="card-surface w-full max-w-sm p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 id="comprovante-titulo" className="font-semibold text-navy">
            {title}
          </h2>
          <button type="button" onClick={onClose} aria-label="Fechar comprovante">
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
