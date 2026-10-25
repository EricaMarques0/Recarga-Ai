import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, BadgeCheck, CreditCard, QrCode, Search, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { CARDS } from "@/lib/data";
import { CardBadge, DemoTag } from "@/components/app-ui";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RecargaAí — Mobilidade mais simples, recarga sem complicação" },
      { name: "description", content: "Encontre seu cartão de transporte e recarregue via Pix em poucos passos." },
      { property: "og:title", content: "RecargaAí" },
      { property: "og:description", content: "Mobilidade mais simples, recarga sem complicação." },
    ],
  }),
  component: Index,
});

const POPULAR = ["bilhete-unico", "top", "bem-osasco", "legal-sbc", "cidadao"];

function Index() {
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-bold tracking-tight text-navy md:text-4xl">Olá, vamos recarregar?</h1>
        <p className="mt-2 text-muted-foreground">Encontre seu cartão e faça sua recarga em poucos passos.</p>
        <form
          className="relative mt-5"
          onSubmit={(e) => {
            e.preventDefault();
            navigate({ to: "/cartoes", search: { q } });
          }}
        >
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Busque por cartão, cidade ou operadora"
            className="h-14 w-full rounded-xl border border-border bg-card pl-12 pr-4 shadow-card outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
          />
        </form>
        <p className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-secondary-foreground">
          <ShieldCheck className="h-4 w-4" /> Sem taxa de conveniência para o usuário
        </p>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-navy">Cartões populares</h2>
          <Link to="/cartoes" search={{ q: undefined }} className="text-sm font-medium text-primary">Ver todos</Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {POPULAR.map((id) => {
            const c = CARDS.find((x) => x.id === id)!;
            return (
              <Link
                key={id}
                to="/valor"
                search={{ card: id }}
                className="card-surface group flex items-center gap-3 p-4 transition hover:border-primary/40"
              >
                <CardBadge card={c} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-navy">{c.name}</p>
                  <p className="truncate text-sm text-muted-foreground">{c.region}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
              </Link>
            );
          })}
        </div>
        <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <DemoTag /> Opções ilustrativas para prototipagem; integrações não homologadas.
        </p>
      </section>

      <section className="card-surface p-5">
        <h2 className="mb-4 text-lg font-semibold text-navy">Como funciona</h2>
        <ol className="grid gap-4 md:grid-cols-3">
          {[
            { icon: CreditCard, t: "Escolha seu cartão." },
            { icon: QrCode, t: "Defina o valor e pague via Pix." },
            { icon: BadgeCheck, t: "Acompanhe a confirmação e siga as instruções de validação do crédito." },
          ].map((s, i) => (
            <li key={i} className="flex gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-secondary text-secondary-foreground">
                <s.icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">Passo {i + 1}</p>
                <p className="text-sm text-foreground">{s.t}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
