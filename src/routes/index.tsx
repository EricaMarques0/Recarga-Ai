import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Banknote, Clock, CreditCard, QrCode, Search, ShieldCheck, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { brl, CARDS, getCard, maskNumber } from "@/lib/catalog";
import { expireDue, formatRemaining, remainingMs, removeSavedCard, resolveStatus } from "@/lib/wallet";
import { useWallet } from "@/hooks/use-wallet";
import { CardBadge, primaryButtonClass } from "@/components/recarga-ui";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RecargaAí — Sua recarga começa aqui." },
      { name: "description", content: "Encontre seu cartão de transporte, escolha o valor e siga seu caminho." },
      { property: "og:title", content: "Sua recarga começa aqui." },
      { property: "og:description", content: "Encontre seu cartão de transporte, escolha o valor e siga seu caminho." },
    ],
  }),
  component: Index,
});

const POPULAR = ["bilhete-unico", "top", "bem-osasco", "legal-sbc", "cidadao"];

const STOPS = [
  {
    icon: CreditCard,
    title: "Escolha do cartão",
    text: "Encontre o bilhete da sua cidade e comece a recarga por ele.",
  },
  {
    icon: Banknote,
    title: "Seleção do valor",
    text: "Defina quanto vai carregar. A taxa de conveniência fica em zero.",
  },
  {
    icon: QrCode,
    title: "Pagamento via Pix",
    text: "O código fica disponível por alguns minutos. A confirmação e o comprovante aparecem em seguida.",
  },
];

function PendingClock({ expiresAt }: { expiresAt: string }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  useEffect(() => {
    if (remainingMs(expiresAt, now) <= 0) expireDue(now);
  }, [expiresAt, now]);
  const left = remainingMs(expiresAt, now);
  if (left <= 0) return null;
  return <span className="font-mono text-sm">Expira em {formatRemaining(left)}</span>;
}

function Index() {
  const [q, setQ] = useState("");
  const [pendingRemoval, setPendingRemoval] = useState<string | null>(null);
  const navigate = useNavigate();
  const wallet = useWallet();
  const suggestions = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return [];
    return CARDS.filter((c) => [c.name, c.region, c.operator].some((f) => f.toLowerCase().includes(term))).slice(0, 5);
  }, [q]);
  const pending = wallet?.recharges.find((r) => resolveStatus(r) === "aguardando");
  const pendingCard = pending ? getCard(pending.catalogId) : undefined;
  const last = wallet?.recharges.find((r) => r.status === "confirmada");
  const lastCard = last ? getCard(last.catalogId) : undefined;
  const lastSaved = last ? wallet?.cards.find((c) => c.id === last.savedCardId) : undefined;
  return (
    <div className="space-y-14 pb-4">
      <section className="relative rounded-[2rem] bg-cream shadow-card">
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[2rem]" aria-hidden>
          <svg viewBox="0 0 420 300" className="absolute -right-8 top-2 h-44 w-52 text-primary/20 sm:h-52 sm:w-64 md:right-8 md:top-6 md:h-72 md:w-[22rem] md:text-primary/30" fill="none">
            <path
              d="M24 230C90 230 100 48 190 48s120 170 200 150"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="7 9"
            />
            <circle cx="24" cy="230" r="8" className="fill-primary" />
            <circle cx="190" cy="48" r="6" fill="var(--warning)" />
            <circle cx="390" cy="198" r="11" className="fill-navy" />
            <circle cx="390" cy="198" r="4" fill="var(--cream)" />
          </svg>
        </div>
        <div className="relative max-w-xl bg-cream px-5 pb-8 pt-10 sm:px-8 md:px-12 md:pb-12 md:pt-14">
          <h1 className="text-4xl font-extrabold leading-[0.98] tracking-tight text-navy sm:text-5xl md:text-6xl">
            Sua recarga
            <span className="block text-primary">começa aqui.</span>
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-navy/80 md:text-lg">
            Encontre seu cartão de transporte, escolha o valor e siga seu caminho.
          </p>

          <form
            className="relative mt-8"
            onSubmit={(e) => {
              e.preventDefault();
              navigate({ to: "/cartoes", search: { q } });
            }}
          >
            <label htmlFor="busca-cartao" className="sr-only">
              Busque por cartão, cidade ou operadora
            </label>
            <div className="flex flex-col gap-3 sm:block">
              <Search className="pointer-events-none absolute left-5 top-7 h-5 w-5 -translate-y-1/2 text-navy/45 sm:top-1/2" />
              <input
                id="busca-cartao"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Busque por cartão, cidade ou operadora"
                role="combobox"
                aria-expanded={suggestions.length > 0}
                aria-controls="sugestoes-cartao"
                aria-autocomplete="list"
                className="h-14 w-full rounded-full border border-navy/10 bg-white pl-14 pr-5 text-base font-medium text-navy shadow-[0_12px_30px_-18px_oklch(0.327_0.051_173.1/0.45)] outline-none transition placeholder:font-normal placeholder:text-navy/40 focus:border-primary focus:ring-4 focus:ring-primary/15 sm:h-16 sm:pr-32"
              />
              <button
                type="submit"
                className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-5 text-sm font-bold text-primary-foreground transition hover:brightness-110 sm:absolute sm:right-2 sm:top-2 sm:h-12"
              >
                Buscar
              </button>
            </div>
            {suggestions.length > 0 && (
              <ul
                id="sugestoes-cartao"
                role="listbox"
                className="absolute z-10 mt-2 w-full overflow-hidden rounded-3xl bg-white py-2 shadow-card ring-1 ring-navy/10"
              >
                {suggestions.map((c) => (
                  <li key={c.id} role="option" aria-selected={false}>
                    <Link
                      to="/cartao"
                      search={{ card: c.id, saved: undefined }}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-cream"
                    >
                      <CardBadge card={c} size="sm" />
                      <span className="min-w-0">
                        <span className="block truncate font-bold text-navy">{c.name}</span>
                        <span className="block truncate text-sm text-muted-foreground">
                          {c.region} · {c.operator}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </form>

          <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-white py-1.5 pl-1.5 pr-4 text-sm font-bold text-navy shadow-sm ring-1 ring-navy/10">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-primary text-primary-foreground">
              <ShieldCheck className="h-4 w-4" />
            </span>
            Sem taxa de conveniência para o usuário
          </p>
        </div>
      </section>

      {pending && pendingCard && (
        <section className="card-surface flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-cream text-navy">
            <Clock className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-extrabold text-navy">Pix em aberto</p>
            <p className="mt-0.5 truncate text-sm text-muted-foreground">
              {pending.nickname} · {pendingCard.name} · {brl(pending.amount)}
            </p>
            <p className="mt-1 text-navy/80">
              <PendingClock expiresAt={pending.expiresAt} />
            </p>
          </div>
          <Link to="/pagamento" search={{ id: pending.id }} className={cn(primaryButtonClass, "sm:w-auto")}>
            Continuar pagamento
          </Link>
        </section>
      )}

      {last && lastCard && lastSaved && (
        <section className="rounded-[1.6rem] bg-navy p-5 text-cream shadow-card sm:p-6">
          <p className="text-sm font-bold text-warning">Repetir recarga</p>
          <p className="mt-1 text-2xl font-extrabold tracking-tight">{last.nickname}</p>
          <p className="mt-1 text-sm text-cream/75">
            {lastCard.name} · {maskNumber(last.number)} · {brl(last.amount)}
          </p>
          <Link
            to="/valor"
            search={{ card: last.catalogId, saved: last.savedCardId, amount: last.amount }}
            className="mt-4 inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-warning px-5 font-bold text-navy transition hover:brightness-105"
          >
            Repetir {brl(last.amount).replace(",00", "")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      )}

      {wallet && wallet.cards.length > 0 && (
        <section>
          <h2 className="text-2xl font-extrabold tracking-tight text-navy md:text-3xl">Seus cartões</h2>
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {wallet.cards.map((saved) => {
              const c = getCard(saved.catalogId);
              if (!c) return null;
              if (pendingRemoval === saved.id) {
                return (
                  <div key={saved.id} className="rounded-[1.5rem] bg-card p-4 shadow-card ring-1 ring-navy/5">
                    <p className="font-extrabold text-navy">Remover {saved.nickname}?</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      O cartão sai desta lista. As recargas já feitas continuam no histórico.
                    </p>
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setPendingRemoval(null)}
                        className="h-11 rounded-2xl border border-border font-semibold text-navy"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          removeSavedCard(saved.id);
                          setPendingRemoval(null);
                        }}
                        className="h-11 rounded-2xl bg-destructive font-semibold text-destructive-foreground"
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                );
              }
              return (
                <div
                  key={saved.id}
                  className="flex items-center gap-1 rounded-[1.5rem] bg-card p-2 pl-4 shadow-card ring-1 ring-navy/5"
                >
                  <Link
                    to="/valor"
                    search={{ card: c.id, saved: saved.id, amount: undefined }}
                    className="group flex min-w-0 flex-1 items-center gap-3 py-2"
                  >
                    <CardBadge card={c} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-extrabold text-navy">{saved.nickname}</span>
                      <span className="mt-0.5 block truncate text-sm text-muted-foreground">
                        {c.name} · {maskNumber(saved.number)}
                      </span>
                    </span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-navy/30 transition group-hover:translate-x-0.5 group-hover:text-primary" />
                  </Link>
                  <button
                    type="button"
                    aria-label={`Remover ${saved.nickname}`}
                    onClick={() => setPendingRemoval(saved.id)}
                    className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-navy/45 transition hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section>
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="text-2xl font-extrabold tracking-tight text-navy md:text-3xl">Cartões populares</h2>
          <Link
            to="/cartoes"
            search={{ q: undefined }}
            className="inline-flex shrink-0 items-center gap-2 text-sm font-bold text-primary transition-colors hover:text-navy"
          >
            <span className="box-content hidden h-0 w-10 border-t-2 border-dashed border-primary sm:block" />
            Ver todos
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {POPULAR.map((id) => {
            const c = CARDS.find((x) => x.id === id)!;
            return (
              <Link
                key={id}
                to="/cartao"
                search={{ card: id, saved: undefined }}
                className="group flex overflow-hidden rounded-[1.5rem] bg-card shadow-card ring-1 ring-navy/5 transition duration-200 hover:-translate-y-0.5 hover:ring-primary/25"
              >
                <span className="w-1.5 shrink-0 bg-primary" />
                <span className="flex min-w-0 flex-1 items-center gap-3 p-4">
                  <CardBadge card={c} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-extrabold text-navy">{c.name}</span>
                    <span className="mt-0.5 block truncate text-sm text-muted-foreground">{c.region}</span>
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-navy/30 transition group-hover:translate-x-0.5 group-hover:text-primary" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-extrabold tracking-tight text-navy md:text-3xl">Como recarregar</h2>
        <ol className="mt-6 grid gap-4 md:grid-cols-3">
          {STOPS.map((s, i) => (
            <li key={s.title} className="flex flex-col">
              <div className="relative mb-3 hidden h-12 items-center md:flex" aria-hidden>
                <span
                  className={cn(
                    "absolute top-1/2 box-content h-0 border-t-2 border-dashed border-primary/40",
                    i === 0 && "left-1/2 right-0",
                    i === 1 && "inset-x-0",
                    i === 2 && "left-0 right-1/2",
                  )}
                />
                <span className="relative z-10 mx-auto grid h-12 w-12 place-items-center rounded-full bg-primary text-lg font-extrabold text-primary-foreground ring-4 ring-background">
                  {i + 1}
                </span>
              </div>
              <div className="relative flex-1 rounded-[1.6rem] bg-card p-5 shadow-card ring-1 ring-navy/5">
                <div className="flex items-center justify-between">
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-primary text-lg font-extrabold text-primary-foreground md:hidden">
                    {i + 1}
                  </span>
                  <s.icon className="h-5 w-5 text-primary md:ml-auto" />
                </div>
                <h3 className="mt-6 text-lg font-extrabold text-navy md:mt-4">{s.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-navy/75">{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
