import { Link, useRouterState } from "@tanstack/react-router";
import { Check, CreditCard, HelpCircle, History, Home } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { TransitCard } from "@/lib/data";

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
          <path d="M4 16c3 0 4-8 8-8s5 8 8 8" />
          <circle cx="4" cy="16" r="1.6" fill="currentColor" />
          <circle cx="20" cy="16" r="1.6" fill="currentColor" />
        </svg>
      </span>
      <span className="text-lg font-bold tracking-tight text-navy">
        Recarga<span className="text-primary">Aí</span>
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
  return (
    <div className="min-h-screen bg-background pb-24 md:pb-10">
      <header className="sticky top-0 z-20 border-b border-border bg-card/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4">
          <Logo />
          <nav className="hidden gap-1 md:flex">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active(n.to) ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {n.label}
              </Link>
            ))}
          </nav>
          <span className="rounded-full bg-warning-soft px-2.5 py-1 text-xs font-medium text-navy md:hidden">Protótipo</span>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 pt-6">{children}</main>
      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-card md:hidden">
        <div className="mx-auto grid max-w-md grid-cols-4">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className={cn(
                "flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium",
                active(n.to) ? "text-primary" : "text-muted-foreground",
              )}
            >
              <n.icon className="h-5 w-5" />
              {n.label}
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
                "grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-semibold",
                done || on ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
              )}
            >
              {done ? <Check className="h-4 w-4" /> : n}
            </span>
            <span className={cn("hidden text-sm sm:inline", on ? "font-semibold text-navy" : "text-muted-foreground")}>{l}</span>
            {n < 4 && <span className={cn("h-px flex-1", done ? "bg-primary" : "bg-border")} />}
          </li>
        );
      })}
    </ol>
  );
}

export function PageTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold tracking-tight text-navy md:text-3xl">{title}</h1>
      {subtitle && <p className="mt-1.5 text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

export function CardBadge({ card, size = "md" }: { card: TransitCard; size?: "sm" | "md" }) {
  const initials = card.name.replace("Cartão ", "").split(" ").map((w) => w[0]).join("").slice(0, 2);
  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center rounded-xl font-bold",
        card.category === "metropolitano" ? "bg-navy text-navy-foreground" : "bg-secondary text-secondary-foreground",
        size === "md" ? "h-11 w-11 text-sm" : "h-9 w-9 text-xs",
      )}
    >
      {initials}
    </span>
  );
}

export function DemoTag({ children = "Demonstrativo" }: { children?: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-warning-soft px-2 py-0.5 text-[11px] font-medium text-navy">
      {children}
    </span>
  );
}

export function PrimaryButton({ className, ...p }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...p}
      className={cn(
        "inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 font-semibold text-primary-foreground transition hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40",
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
