import { Link, useRouterState } from "@tanstack/react-router";
import { Check, CreditCard, HelpCircle, History, Home } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { TransitCard } from "@/lib/catalog";

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <span className="grid h-10 w-10 place-items-center rounded-2xl bg-navy text-warning shadow-card">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
          <path
            d="M4 16c3.2 0 4.2-8 8-8s4.8 8 8 8"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeDasharray="2.2 2.4"
          />
          <circle cx="4" cy="16" r="1.7" fill="var(--cream)" />
          <circle cx="20" cy="16" r="1.7" fill="currentColor" />
        </svg>
      </span>
      <span className="text-lg font-extrabold tracking-tight text-navy">
        Recarga
        <span className="ml-1 inline-block rounded-md bg-navy px-1.5 py-0.5 text-warning">Aí</span>
      </span>
    </Link>
  );
}

const NAV = [
  { to: "/", label: "Início", icon: Home },
  { to: "/cartoes", label: "Recarregar", icon: CreditCard },
  { to: "/historico", label: "Histórico", icon: History },
  { to: "/ajuda", label: "Ajuda", icon: HelpCircle },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const active = (to: string) => (to === "/" ? path === "/" : path.startsWith(to));
  const wide = path === "/";
  return (
    <div className="min-h-screen bg-background pb-24 md:pb-10">
      <header className="sticky top-0 z-20 border-b border-navy/10 bg-cream backdrop-blur">
        <div className={cn("mx-auto flex h-[4.5rem] items-center justify-between gap-3 px-4", wide ? "max-w-5xl" : "max-w-3xl")}>
          <Logo />
          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                aria-current={active(n.to) ? "page" : undefined}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                  active(n.to) ? "bg-primary text-primary-foreground" : "text-navy/70 hover:bg-white/80 hover:text-navy",
                )}
              >
                <span
                  className={cn(
                    "h-2 w-2 rounded-full border-2",
                    active(n.to) ? "border-warning bg-warning" : "border-current bg-transparent",
                  )}
                />
                {n.label}
              </Link>
            ))}
          </nav>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-xs font-bold text-navy ring-1 ring-navy/10 md:hidden">
            <span className="h-1.5 w-1.5 rounded-full bg-warning" />
            Protótipo
          </span>
        </div>
      </header>
      <main className={cn("mx-auto px-4 pt-8", wide ? "max-w-5xl" : "max-w-3xl")}>{children}</main>
      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-navy/10 bg-cream md:hidden">
        <div className="mx-auto grid max-w-md grid-cols-4">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              aria-current={active(n.to) ? "page" : undefined}
              className={cn(
                "relative flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold",
                active(n.to) ? "text-primary" : "text-navy/55",
              )}
            >
              <span className={cn("absolute top-0 h-1 w-6 rounded-full", active(n.to) ? "bg-primary" : "bg-transparent")} />
              <n.icon className="h-5 w-5" />
              {n.label}
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full border-2",
                  active(n.to) ? "border-primary bg-primary" : "border-current bg-transparent",
                )}
              />
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}

export function Steps({ current }: { current: 1 | 2 | 3 | 4 }) {
  const labels = ["Cartão", "Valor", "Pix", "Pronto"];
  return (
    <ol className="mb-6 flex items-center gap-2">
      {labels.map((l, i) => {
        const n = i + 1;
        const done = n < current;
        const on = n === current;
        return (
          <li key={l} className="flex flex-1 items-center gap-2">
            <span
              className={cn(
                "grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold",
                done && "bg-primary text-primary-foreground",
                on && "bg-navy text-cream ring-4 ring-primary/15",
                !done && !on && "border-2 border-dashed border-navy/25 bg-cream text-navy/45",
              )}
            >
              {done ? <Check className="h-4 w-4" /> : n}
            </span>
            <span className={cn("hidden text-sm sm:inline", on ? "font-bold text-navy" : "text-muted-foreground")}>{l}</span>
            {n < 4 && (
              <span
                className={cn(
                  "box-content h-0 flex-1 border-t-2 border-dashed",
                  done ? "border-primary" : "border-navy/25",
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}

export function PageTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-[1.75rem] font-extrabold leading-tight tracking-tight text-navy md:text-3xl">{title}</h1>
      {subtitle && <p className="mt-2 max-w-xl text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

export function CardBadge({ card, size = "md" }: { card: TransitCard; size?: "sm" | "md" }) {
  const initials = card.name
    .replace("Cartão ", "")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2);
  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center rounded-2xl bg-primary font-extrabold text-primary-foreground",
        size === "md" ? "h-12 w-12 text-sm" : "h-10 w-10 text-xs",
      )}
    >
      {initials}
    </span>
  );
}

export function DemoTag({ children = "Demonstrativo" }: { children?: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-cream px-2.5 py-0.5 text-[11px] font-bold text-navy ring-1 ring-navy/10">
      <span className="h-1.5 w-1.5 rounded-full bg-warning" />
      {children}
    </span>
  );
}

export function PrimaryButton({ className, ...p }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...p}
      className={cn(
        "inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 font-bold text-primary-foreground shadow-[0_10px_22px_-14px_var(--primary)] transition hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none",
        className,
      )}
    />
  );
}

export function SummaryRow({ label, value, strong }: { label: string; value: ReactNode; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn(strong ? "text-base font-bold text-navy" : "font-medium text-foreground")}>{value}</span>
    </div>
  );
}
