import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { Check, Clock, Copy, Info, Loader2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { brl, getCard, maskNumber } from "@/lib/catalog";
import {
  confirmRecharge,
  copyText,
  expireDue,
  formatRemaining,
  openRecharge,
  pixCode,
  remainingMs,
  resolveStatus,
} from "@/lib/wallet";
import { useWallet } from "@/hooks/use-wallet";
import { PageTitle, PrimaryButton, primaryButtonClass, Steps } from "@/components/recarga-ui";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/pagamento")({
  validateSearch: (s: Record<string, unknown>) => ({ id: String(s["id"] ?? "") }),
  beforeLoad: ({ search }) => {
    if (!/^RA-[A-Z0-9]+$/.test(search.id)) throw redirect({ to: "/" });
  },
  head: () => ({
    meta: [
      { title: "Pagamento via Pix — RecargaAí" },
      { name: "description", content: "Pague sua recarga com Pix. O código vale por 5 minutos." },
      { property: "og:title", content: "Pagamento via Pix — RecargaAí" },
      { property: "og:description", content: "Pague sua recarga com Pix. O código vale por 5 minutos." },
    ],
  }),
  component: PixPage,
});

function FakeQr() {
  const cells = useMemo(() => {
    const n = 25;
    let seed = 7;
    const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
    const finder = (x: number, y: number) =>
      ([[0, 0], [n - 7, 0], [0, n - 7]] as [number, number][]).some(([fx, fy]) => x >= fx && x < fx + 7 && y >= fy && y < fy + 7);
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
    <svg viewBox="-1 -1 27 27" className="h-48 w-48" role="img" aria-label="QR Code do Pix">
      {cells.map((c, i) => (
        <rect key={i} x={c.x} y={c.y} width="1" height="1" className="fill-navy" />
      ))}
      <Finder x={0} y={0} />
      <Finder x={18} y={0} />
      <Finder x={0} y={18} />
    </svg>
  );
}

function PixPage() {
  const { id } = Route.useSearch();
  const wallet = useWallet();
  const navigate = useNavigate();
  const recharge = wallet?.recharges.find((r) => r.id === id);
  const card = recharge ? getCard(recharge.catalogId) : undefined;
  const [now, setNow] = useState(() => Date.now());
  const [copied, setCopied] = useState<"ok" | "fail" | null>(null);
  const [phase, setPhase] = useState<"idle" | "verificando" | "pago">("idle");
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach((timer) => window.clearTimeout(timer)), []);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!wallet) return;
    if (!recharge || !card) navigate({ to: "/", replace: true });
  }, [wallet, recharge, card, navigate]);

  const status = recharge ? resolveStatus(recharge, now) : undefined;
  const left = recharge ? remainingMs(recharge.expiresAt, now) : 0;

  useEffect(() => {
    if (recharge && recharge.status === "aguardando" && left <= 0) expireDue(now);
  }, [recharge, left, now]);

  useEffect(() => {
    if (status === "confirmada" && phase === "idle") {
      navigate({ to: "/confirmacao", search: { id }, replace: true });
    }
  }, [status, phase, navigate, id]);

  if (!recharge || !card || !status) {
    return (
      <div>
        <Steps current={3} />
        <PageTitle title="Pague com Pix" />
        <div className="card-surface h-64 animate-pulse" />
      </div>
    );
  }

  const code = pixCode(recharge);
  const expired = status === "expirada";
  const replaced = status === "substituida";
  const replacement = replaced
    ? wallet?.recharges.find((r) => r.savedCardId === recharge.savedCardId && resolveStatus(r, now) === "aguardando")
    : undefined;
  const waiting = status === "aguardando" && phase === "idle";

  const copy = async () => {
    const ok = await copyText(code);
    setCopied(ok ? "ok" : "fail");
    window.setTimeout(() => setCopied(null), 2000);
  };

  const confirm = () => {
    setPhase("verificando");
    const wait = window.setTimeout(() => {
      const result = confirmRecharge(recharge.id);
      if (!result || result.status !== "confirmada") {
        setPhase("idle");
        expireDue();
        return;
      }
      setPhase("pago");
      timers.current.push(window.setTimeout(() => navigate({ to: "/confirmacao", search: { id: result.id } }), 700));
    }, 1200);
    timers.current.push(wait);
  };

  const renew = () => {
    const saved = wallet?.cards.find((c) => c.id === recharge.savedCardId);
    if (!saved) {
      navigate({ to: "/cartao", search: { card: card.id, saved: undefined } });
      return;
    }
    const next = openRecharge(saved, recharge.amount);
    navigate({ to: "/pagamento", search: { id: next.id }, replace: true });
  };

  return (
    <div>
      <Steps current={3} />
      <PageTitle
        title="Pague com Pix"
        subtitle={`${recharge.nickname} · ${card.name} · ${maskNumber(recharge.number)}`}
      />

      <div className="card-surface p-5 text-center">
        <p className="text-sm text-muted-foreground">Valor total</p>
        <p className="text-3xl font-bold text-navy">{brl(recharge.amount)}</p>

        <div className="sr-only" aria-live="polite">
          {phase === "verificando" && "Verificando pagamento."}
          {phase === "pago" && "Pagamento confirmado."}
          {expired && "O prazo do Pix terminou."}
          {replaced && "Este código foi substituído por outro valor."}
          {waiting && `Aguardando pagamento. Expira em ${formatRemaining(left)}.`}
        </div>

        <div
          className={cn(
            "mx-auto mt-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium",
            phase === "pago" ? "bg-secondary text-secondary-foreground" : "bg-cream text-navy ring-1 ring-navy/10",
          )}
        >
          {phase === "verificando" && (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Verificando pagamento…
            </>
          )}
          {phase === "pago" && (
            <>
              <Check className="h-4 w-4" /> Pagamento confirmado
            </>
          )}
          {phase === "idle" && !expired && !replaced && (
            <>
              <Clock className="h-4 w-4" /> Expira em {formatRemaining(left)}
            </>
          )}
          {phase === "idle" && expired && (
            <>
              <Clock className="h-4 w-4" /> Prazo encerrado
            </>
          )}
          {phase === "idle" && replaced && (
            <>
              <Clock className="h-4 w-4" /> Valor substituído
            </>
          )}
        </div>

        {!expired && !replaced && phase !== "pago" && (
          <>
            <div className={cn("relative mx-auto mt-5 w-fit rounded-2xl border border-border bg-card p-3", phase === "verificando" && "opacity-40")}>
              <FakeQr />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Escaneie o QR Code ou copie o código abaixo.</p>

            <div className="mt-5 text-left">
              <label className="text-sm font-medium text-navy" htmlFor="pix-code">
                Pix Copia e Cola
              </label>
              <div className="mt-2 flex gap-2">
                <input
                  id="pix-code"
                  readOnly
                  value={code}
                  className="h-11 min-w-0 flex-1 truncate rounded-xl border border-border bg-muted px-3 font-mono text-xs"
                />
                <button
                  type="button"
                  onClick={copy}
                  className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-xl border border-primary px-4 text-sm font-semibold text-primary transition hover:bg-secondary"
                >
                  {copied === "ok" ? (
                    <>
                      <Check className="h-4 w-4" /> Copiado
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" /> Copiar
                    </>
                  )}
                </button>
              </div>
              {copied === "fail" && (
                <p role="alert" className="mt-2 text-sm text-destructive">
                  Não foi possível copiar. Selecione o código e copie manualmente.
                </p>
              )}
            </div>
          </>
        )}

        {expired && (
          <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
            Esse código encerrou. Gere outro para continuar a mesma recarga.
          </p>
        )}
        {replaced && (
          <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
            Este valor foi trocado. O código antigo não fica mais em aberto.
          </p>
        )}
      </div>

      <div className="mt-4 flex gap-2 rounded-xl bg-cream p-3 text-sm text-navy ring-1 ring-navy/10">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        O código vale por 5 minutos. Pague o valor exato para a recarga seguir.
      </div>

      {expired ? (
        <PrimaryButton className="mt-6" onClick={renew}>
          Gerar novo código Pix
        </PrimaryButton>
      ) : replaced && replacement ? (
        <Link to="/pagamento" search={{ id: replacement.id }} className={cn(primaryButtonClass, "mt-6")}>
          Ir para o Pix de {brl(replacement.amount)}
        </Link>
      ) : replaced ? (
        <Link
          to="/valor"
          search={{ card: card.id, saved: recharge.savedCardId, amount: undefined }}
          className={cn(primaryButtonClass, "mt-6")}
        >
          Escolher outro valor
        </Link>
      ) : (
        <PrimaryButton className="mt-6" disabled={!waiting} onClick={confirm}>
          {phase === "idle" ? "Já realizei o pagamento" : "Verificando…"}
        </PrimaryButton>
      )}
      <p className="mt-3 text-center text-sm">
        <Link to="/valor" search={{ card: card.id, saved: recharge.savedCardId, amount: recharge.amount }} className="font-semibold text-primary">
          Alterar valor
        </Link>
      </p>
    </div>
  );
}
