import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { AlertCircle } from "lucide-react";
import { useState } from "react";
import { brl, getCard, PRESET_AMOUNTS, validateAmount } from "@/lib/data";
import { CardBadge, PageTitle, PrimaryButton, Steps, SummaryRow } from "@/components/app-ui";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/valor")({
  validateSearch: (s: Record<string, unknown>) => ({ card: String(s.card ?? "") }),
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

function AmountPage() {
  const { card: cardId } = Route.useSearch();
  const card = getCard(cardId)!;
  const [preset, setPreset] = useState<number | null>(null);
  const [custom, setCustom] = useState("");
  const [touched, setTouched] = useState(false);
  const navigate = useNavigate();

  const raw = preset !== null ? String(preset) : custom;
  const { value, error } = validateAmount(raw);
  const showError = touched && error;

  return (
    <div>
      <Steps current={2} />
      <PageTitle title="Quanto você quer recarregar?" />

      <div className="card-surface mb-5 flex items-center gap-3 p-4">
        <CardBadge card={card} />
        <div className="flex-1">
          <p className="font-semibold text-navy">{card.name}</p>
          <p className="text-sm text-muted-foreground">{card.region}</p>
        </div>
        <Link to="/cartoes" search={{ q: undefined }} className="text-sm font-medium text-primary">Trocar</Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {PRESET_AMOUNTS.map((a) => (
          <button
            key={a}
            onClick={() => { setPreset(a); setCustom(""); setTouched(true); }}
            className={cn(
              "card-surface h-16 text-lg font-bold transition",
              preset === a ? "border-primary bg-secondary text-secondary-foreground ring-4 ring-primary/10" : "text-navy hover:border-primary/40",
            )}
          >
            {brl(a).replace(",00", "")}
          </button>
        ))}
      </div>

      <label className="mt-5 block text-sm font-medium text-navy" htmlFor="custom">Outro valor</label>
      <div className="relative mt-2">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-medium text-muted-foreground">R$</span>
        <input
          id="custom"
          inputMode="decimal"
          value={custom}
          onChange={(e) => { setCustom(e.target.value.replace(/[^\d,]/g, "")); setPreset(null); }}
          onBlur={() => setTouched(true)}
          placeholder="0,00"
          aria-invalid={!!showError}
          className={cn(
            "h-12 w-full rounded-xl border bg-card pl-12 pr-4 outline-none focus:ring-4",
            showError ? "border-destructive focus:ring-destructive/10" : "border-border focus:border-primary focus:ring-primary/10",
          )}
        />
      </div>
      {showError ? (
        <p className="mt-2 flex items-center gap-1.5 text-sm text-destructive"><AlertCircle className="h-4 w-4" />{error}</p>
      ) : (
        <p className="mt-2 text-xs text-muted-foreground">Entre R$ 5,00 e R$ 500,00.</p>
      )}

      <div className="card-surface mt-6 divide-y divide-border px-4">
        <SummaryRow label="Cartão" value={card.name} />
        <SummaryRow label="Valor da recarga" value={value ? brl(value) : "—"} />
        <SummaryRow label="Taxa de conveniência" value={<span className="text-primary">{brl(0)}</span>} />
        <SummaryRow label="Total" value={value ? brl(value) : "—"} strong />
      </div>

      <PrimaryButton
        className="mt-6"
        onClick={() => {
          setTouched(true);
          if (value) navigate({ to: "/pagamento", search: { card: card.id, amount: value } });
        }}
      >
        Continuar para pagamento
      </PrimaryButton>
    </div>
  );
}
