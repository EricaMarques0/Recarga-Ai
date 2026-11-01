import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { AlertCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  getCard,
  groupDigits,
  validateCardNumber,
  validateNickname,
} from "@/lib/catalog";
import { upsertSavedCard } from "@/lib/wallet";
import { useWallet } from "@/hooks/use-wallet";
import { CardBadge, PageTitle, PrimaryButton, Steps } from "@/components/recarga-ui";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/cartao")({
  validateSearch: (s: Record<string, unknown>) => ({
    card: String(s["card"] ?? ""),
    saved: typeof s["saved"] === "string" ? s["saved"] : undefined,
  }),
  beforeLoad: ({ search }) => {
    if (!getCard(search.card)) throw redirect({ to: "/cartoes", search: { q: undefined } });
  },
  head: () => ({
    meta: [
      { title: "Identifique seu cartão — RecargaAí" },
      { name: "description", content: "Informe o apelido e o número do cartão que vai recarregar." },
      { property: "og:title", content: "Identifique seu cartão — RecargaAí" },
      { property: "og:description", content: "Informe o apelido e o número do cartão que vai recarregar." },
    ],
  }),
  component: IdentifyPage,
});

function IdentifyPage() {
  const { card: cardId, saved: savedId } = Route.useSearch();
  const card = getCard(cardId)!;
  const wallet = useWallet();
  const navigate = useNavigate();
  const filled = useRef(false);
  const [nickname, setNickname] = useState("");
  const [number, setNumber] = useState("");
  const [chosenId, setChosenId] = useState<string>();
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!wallet || filled.current) return;
    filled.current = true;
    const match = wallet.cards.find((c) => c.id === savedId && c.catalogId === card.id);
    if (!match) return;
    setNickname(match.nickname);
    setNumber(groupDigits(match.number));
    setChosenId(match.id);
  }, [wallet, savedId, card.id]);

  const savedOfType = wallet?.cards.filter((c) => c.catalogId === card.id) ?? [];
  const nick = validateNickname(nickname);
  const num = validateCardNumber(number, card);

  const applySaved = (id: string) => {
    const match = savedOfType.find((c) => c.id === id);
    if (!match) return;
    setChosenId(match.id);
    setNickname(match.nickname);
    setNumber(groupDigits(match.number));
    setTouched(false);
  };

  return (
    <div>
      <Steps current={1} />
      <PageTitle
        title="Identifique seu cartão"
        subtitle="O apelido ajuda a repetir a recarga. O número fica salvo neste aparelho."
      />

      <div className="card-surface mb-5 flex items-center gap-3 p-4">
        <CardBadge card={card} />
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-navy">{card.name}</p>
          <p className="truncate text-sm text-muted-foreground">
            {card.region} · {card.operator}
          </p>
        </div>
        <Link to="/cartoes" search={{ q: undefined }} className="text-sm font-medium text-primary">
          Trocar
        </Link>
      </div>

      {savedOfType.length > 0 && (
        <div className="mb-5">
          <p className="text-sm font-medium text-navy">Cartões já usados</p>
          <div className="mt-2 flex gap-2 overflow-x-auto">
            {savedOfType.map((c) => (
              <button
                key={c.id}
                type="button"
                aria-pressed={chosenId === c.id}
                onClick={() => applySaved(c.id)}
                className={cn(
                  "shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition",
                  chosenId === c.id
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground",
                )}
              >
                {c.nickname}
              </button>
            ))}
          </div>
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setTouched(true);
          if (!nick.nickname || !num.number) return;
          const same = chosenId && wallet?.cards.find((c) => c.id === chosenId)?.number === num.number;
          const saved = upsertSavedCard({
            ...(same && chosenId ? { id: chosenId } : {}),
            catalogId: card.id,
            nickname: nick.nickname,
            number: num.number,
          });
          navigate({ to: "/valor", search: { card: card.id, saved: saved.id, amount: undefined } });
        }}
      >
        <label className="block text-sm font-medium text-navy" htmlFor="apelido">
          Apelido
        </label>
        <input
          id="apelido"
          value={nickname}
          autoComplete="off"
          maxLength={24}
          onChange={(e) => setNickname(e.target.value)}
          onBlur={() => nickname && setTouched(true)}
          placeholder="Ex.: Trabalho, Mãe, Meu BU"
          aria-invalid={touched && !!nick.error}
          aria-describedby={touched && nick.error ? "apelido-erro" : undefined}
          className={cn(
            "mt-2 h-12 w-full rounded-xl border bg-card px-4 outline-none focus:ring-4",
            touched && nick.error
              ? "border-destructive focus:ring-destructive/10"
              : "border-border focus:border-primary focus:ring-primary/10",
          )}
        />
        {touched && nick.error && (
          <p id="apelido-erro" role="alert" className="mt-2 flex items-center gap-1.5 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            {nick.error}
          </p>
        )}

        <label className="mt-5 block text-sm font-medium text-navy" htmlFor="numero">
          Número do cartão
        </label>
        <input
          id="numero"
          inputMode="numeric"
          autoComplete="off"
          value={number}
          onChange={(e) => {
            const digits = e.target.value.replace(/\D/g, "").slice(0, card.numberLength);
            setNumber(groupDigits(digits));
            const chosen = wallet?.cards.find((c) => c.id === chosenId);
            if (!chosen || chosen.number !== digits) setChosenId(undefined);
          }}
          onBlur={() => number && setTouched(true)}
          placeholder={"0".repeat(Math.min(4, card.numberLength)) + " …"}
          aria-invalid={touched && !!num.error}
          aria-describedby="numero-ajuda"
          className={cn(
            "mt-2 h-12 w-full rounded-xl border bg-card px-4 font-mono tracking-wide outline-none focus:ring-4",
            touched && num.error
              ? "border-destructive focus:ring-destructive/10"
              : "border-border focus:border-primary focus:ring-primary/10",
          )}
        />
        <p id="numero-ajuda" className={cn("mt-2 text-xs", touched && num.error ? "text-destructive" : "text-muted-foreground")}>
          {touched && num.error ? (
            <span role="alert" className="inline-flex items-center gap-1.5 text-sm">
              <AlertCircle className="h-4 w-4" />
              {num.error}
            </span>
          ) : (
            `Use ${card.numberLength} dígitos, como no cartão físico.`
          )}
        </p>

        <p className="mt-5 text-sm leading-relaxed text-muted-foreground">{card.validation}</p>

        <PrimaryButton className="mt-6" type="submit">
          Continuar
        </PrimaryButton>
      </form>
    </div>
  );
}
