import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { brl, getCard, maskNumber, PRESET_AMOUNTS, tripEstimate, validateAmount } from "@/lib/catalog";
import { openRecharge } from "@/lib/wallet";
import { useWallet } from "@/hooks/use-wallet";
import { CardBadge, PageTitle, PrimaryButton, Steps, SummaryRow } from "@/components/recarga-ui";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/valor")({
  validateSearch: (s: Record<string, unknown>) => ({
    card: String(s["card"] ?? ""),
    saved: String(s["saved"] ?? ""),
    amount: s["amount"] === undefined || s["amount"] === "" ? undefined : Number(s["amount"]),
  }),
  beforeLoad: ({ search }) => {
    if (!getCard(search.card)) throw redirect({ to: "/cartoes", search: { q: undefined } });
  },
  head: () => ({
    meta: [
      { title: "Valor da recarga — RecargaAí" },
      { name: "description", content: "Escolha o valor da recarga do seu cartão de transporte." },
      { property: "og:title", content: "Valor da recarga — RecargaAí" },
      { property: "og:description", content: "Escolha o valor da recarga do seu cartão de transporte." },
    ],
  }),
  component: AmountPage,
});

function amountToInput(value: number) {
  return value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function AmountPage() {
  const { card: cardId, saved: savedId, amount: initialAmount } = Route.useSearch();
  const card = getCard(cardId)!;
  const wallet = useWallet();
  const navigate = useNavigate();
  const saved = wallet?.cards.find((c) => c.id === savedId && c.catalogId === card.id);
  const presetInitial =
    initialAmount && PRESET_AMOUNTS.includes(initialAmount) && !validateAmount(String(initialAmount), card).error
      ? initialAmount
      : null;
  const [preset, setPreset] = useState<number | null>(presetInitial);
  const [custom, setCustom] = useState(() =>
    initialAmount && !presetInitial && !validateAmount(String(initialAmount).replace(".", ","), card).error
      ? amountToInput(initialAmount)
      : "",
  );
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!wallet) return;
    if (!saved) navigate({ to: "/cartao", search: { card: card.id, saved: savedId || undefined }, replace: true });
  }, [wallet, saved, navigate, card.id, savedId]);

  const raw = preset !== null ? String(preset) : custom;
  const { value, error } = validateAmount(raw, card);
  const showError = touched && !!error;
  const trips = value ? tripEstimate(value, card.referenceFare) : 0;

  if (!saved) {
    return (
      <div>
        <Steps current={2} />
        <PageTitle title="Quanto você quer recarregar?" />
        <div className="card-surface h-28 animate-pulse" />
      </div>
    );
  }

  return (
    <div>
      <Steps current={2} />
      <PageTitle title="Quanto você quer recarregar?" subtitle={`${card.operator} · entre ${brl(card.minAmount)} e ${brl(card.maxAmount)}.`} />

      <div className="card-surface mb-5 flex items-center gap-3 p-4">
        <CardBadge card={card} />
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-navy">{saved.nickname}</p>
          <p className="truncate text-sm text-muted-foreground">
            {card.name} · {maskNumber(saved.number)}
          </p>
        </div>
        <Link to="/cartao" search={{ card: card.id, saved: saved.id }} className="text-sm font-medium text-primary">
          Trocar
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {PRESET_AMOUNTS.map((a) => {
          const allowed = !validateAmount(String(a), card).error;
          return (
            <button
              key={a}
              type="button"
              disabled={!allowed}
              onClick={() => {
                setPreset(a);
                setCustom("");
                setTouched(true);
              }}
              className={cn(
                "card-surface h-16 text-lg font-bold transition",
                preset === a ? "border-primary bg-secondary text-secondary-foreground ring-4 ring-primary/10" : "text-navy hover:border-primary/40",
              )}
            >
              {brl(a).replace(",00", "")}
            </button>
          );
        })}
      </div>

      <label className="mt-5 block text-sm font-medium text-navy" htmlFor="custom">
        Outro valor
      </label>
      <div className="relative mt-2">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-medium text-muted-foreground">R$</span>
        <input
          id="custom"
          inputMode="decimal"
          value={custom}
          onChange={(e) => {
            setCustom(e.target.value.replace(/[^\d,]/g, ""));
            setPreset(null);
          }}
          onBlur={() => setTouched(true)}
          placeholder="0,00"
          aria-invalid={showError}
          aria-describedby="valor-ajuda"
          className={cn(
            "h-12 w-full rounded-xl border bg-card pl-12 pr-4 outline-none focus:ring-4",
            showError ? "border-destructive focus:ring-destructive/10" : "border-border focus:border-primary focus:ring-primary/10",
          )}
        />
      </div>
      <p id="valor-ajuda" className={cn("mt-2 text-xs", showError ? "text-destructive" : "text-muted-foreground")}>
        {showError ? (
          <span role="alert" className="inline-flex items-center gap-1.5 text-sm">
            <AlertCircle className="h-4 w-4" />
            {error}
          </span>
        ) : (
          `Entre ${brl(card.minAmount)} e ${brl(card.maxAmount)} neste cartão.`
        )}
      </p>

      <div className="card-surface mt-6 divide-y divide-border px-4">
        <SummaryRow label="Cartão" value={saved.nickname} />
        <SummaryRow label="Número" value={<span className="font-mono">{maskNumber(saved.number)}</span>} />
        <SummaryRow label="Valor da recarga" value={value ? brl(value) : "—"} />
        <SummaryRow label="Taxa de conveniência" value={<span className="text-primary">{brl(0)}</span>} />
        <SummaryRow label="Total" value={value ? brl(value) : "—"} strong />
      </div>
      {trips > 0 && (
        <p className="mt-3 text-sm text-muted-foreground">
          Cerca de {trips} {trips === 1 ? "viagem" : "viagens"}, pela tarifa de referência de {brl(card.referenceFare)}.
        </p>
      )}

      <PrimaryButton
        className="mt-6"
        onClick={() => {
          setTouched(true);
          if (!value) return;
          const recharge = openRecharge(saved, value);
          navigate({ to: "/pagamento", search: { id: recharge.id } });
        }}
      >
        Continuar para o Pix
      </PrimaryButton>
    </div>
  );
}
