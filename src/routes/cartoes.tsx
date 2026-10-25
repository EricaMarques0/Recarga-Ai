import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CheckCircle2, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { CARDS, type Category } from "@/lib/data";
import { CardBadge, DemoTag, PageTitle, PrimaryButton, Steps } from "@/components/app-ui";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/cartoes")({
  validateSearch: (s: Record<string, unknown>) => ({ q: typeof s["q"] === "string" ? s["q"] : undefined }),
  head: () => ({
    meta: [
      { title: "Escolha seu cartão — RecargaAí" },
      { name: "description", content: "Busque e selecione o cartão de transporte que deseja recarregar." },
      { property: "og:title", content: "Escolha seu cartão — RecargaAí" },
      { property: "og:description", content: "Busque e selecione o cartão de transporte que deseja recarregar." },
    ],
  }),
  component: CardsPage,
});

const FILTERS: { id: "all" | Category; label: string }[] = [
  { id: "all", label: "Todos" },
  { id: "municipal", label: "Municipais" },
  { id: "metropolitano", label: "Metropolitanos" },
];

function CardsPage() {
  const { q: initial } = Route.useSearch();
  const [q, setQ] = useState(initial ?? "");
  const [filter, setFilter] = useState<"all" | Category>("all");
  const [selected, setSelected] = useState<string>();
  const navigate = useNavigate();

  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    return CARDS.filter(
      (c) =>
        (filter === "all" || c.category === filter) &&
        (!t || [c.name, c.region, c.operator].some((f) => f.toLowerCase().includes(t))),
    );
  }, [q, filter]);

  return (
    <div>
      <Steps current={1} />
      <PageTitle title="Qual cartão você quer recarregar?" />
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Busque por cartão, cidade ou operadora"
          className="h-12 w-full rounded-xl border border-border bg-card pl-12 pr-4 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
        />
      </div>
      <div className="mt-3 flex gap-2 overflow-x-auto">
        {FILTERS.map((f) => (
          <button
            key={f.id}
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

      <div className="mt-5 grid gap-3 sm:grid-cols-2" role="radiogroup">
        {list.map((c) => {
          const on = selected === c.id;
          return (
            <button
              key={c.id}
              role="radio"
              aria-checked={on}
              onClick={() => setSelected(c.id)}
              className={cn(
                "card-surface flex items-center gap-3 p-4 text-left transition",
                on ? "border-primary ring-4 ring-primary/10" : "hover:border-primary/40",
              )}
            >
              <CardBadge card={c} />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-navy">{c.name}</p>
                <p className="text-sm text-muted-foreground">{c.region} · {c.operator}</p>
              </div>
              <CheckCircle2 className={cn("h-5 w-5 transition", on ? "text-primary" : "text-border")} />
            </button>
          );
        })}
      </div>
      {list.length === 0 && (
        <p className="card-surface mt-5 p-6 text-center text-sm text-muted-foreground">Nenhum cartão encontrado para “{q}”.</p>
      )}
      <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground"><DemoTag /> Lista ilustrativa.</p>

      <div className="sticky bottom-20 mt-6 md:bottom-4">
        <PrimaryButton disabled={!selected} onClick={() => navigate({ to: "/valor", search: { card: selected! } })}>
          {selected ? "Continuar" : "Selecione um cartão"}
        </PrimaryButton>
      </div>
    </div>
  );
}
