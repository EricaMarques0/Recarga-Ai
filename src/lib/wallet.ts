import { brl, maskNumber, type TransitCard } from "@/lib/catalog";

const KEY = "recargaai.wallet.v1";
export const WALLET_EVENT = "recargaai-wallet";
/** Prazo do código Pix. */
export const PIX_TTL_MS = 5 * 60 * 1000;

export type RechargeStatus = "aguardando" | "confirmada" | "expirada" | "substituida";

export interface SavedCard {
  id: string;
  catalogId: string;
  nickname: string;
  number: string;
  updatedAt: string;
}

export interface Recharge {
  id: string;
  catalogId: string;
  savedCardId: string;
  nickname: string;
  number: string;
  amount: number;
  status: RechargeStatus;
  createdAt: string;
  expiresAt: string;
  paidAt?: string;
}

export interface Wallet {
  cards: SavedCard[];
  recharges: Recharge[];
}

export const STATUS_LABEL: Record<RechargeStatus, string> = {
  aguardando: "Aguardando Pix",
  confirmada: "Confirmada",
  expirada: "Expirada",
  substituida: "Substituída",
};

const empty = (): Wallet => ({ cards: [], recharges: [] });

export function readWallet(): Wallet {
  if (typeof localStorage === "undefined") return empty();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty();
    const data = JSON.parse(raw) as Partial<Wallet>;
    return {
      cards: Array.isArray(data.cards) ? data.cards : [],
      recharges: Array.isArray(data.recharges) ? data.recharges : [],
    };
  } catch {
    return empty();
  }
}

export function writeWallet(wallet: Wallet) {
  localStorage.setItem(KEY, JSON.stringify(wallet));
  if (typeof window !== "undefined") window.dispatchEvent(new Event(WALLET_EVENT));
}

/** Um cartão só pode ter o Pix mais recente em aberto. Os anteriores ficam substituídos. */
export function syncWallet(now = Date.now()): Wallet {
  const wallet = expireDue(now);
  const settled = new Set<string>();
  let changed = false;
  for (const recharge of wallet.recharges) {
    if (recharge.status === "confirmada" || recharge.status === "substituida") {
      settled.add(recharge.savedCardId);
      continue;
    }
    if (recharge.status !== "aguardando") continue;
    if (settled.has(recharge.savedCardId)) {
      recharge.status = "substituida";
      changed = true;
    } else {
      settled.add(recharge.savedCardId);
    }
  }
  if (changed) writeWallet(wallet);
  return wallet;
}

export function expireDue(now = Date.now()): Wallet {
  const wallet = readWallet();
  let changed = false;
  for (const recharge of wallet.recharges) {
    if (recharge.status === "aguardando" && new Date(recharge.expiresAt).getTime() <= now) {
      recharge.status = "expirada";
      changed = true;
    }
  }
  if (changed) writeWallet(wallet);
  return wallet;
}

export function resolveStatus(recharge: Recharge, now = Date.now()): RechargeStatus {
  if (recharge.status === "confirmada" || recharge.status === "substituida" || recharge.status === "expirada") {
    return recharge.status;
  }
  if (new Date(recharge.expiresAt).getTime() <= now) return "expirada";
  return "aguardando";
}

export function remainingMs(expiresAt: string, now = Date.now()) {
  return new Date(expiresAt).getTime() - now;
}

export function formatRemaining(ms: number) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function formatWhen(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

function rechargeId() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(5));
  return "RA-" + [...bytes].map((b) => alphabet[b % alphabet.length]).join("");
}

export function removeRecharge(id: string) {
  const wallet = readWallet();
  const recharges = wallet.recharges.filter((r) => r.id !== id);
  if (recharges.length === wallet.recharges.length) return;
  wallet.recharges = recharges;
  writeWallet(wallet);
}

export function clearHistory() {
  const wallet = readWallet();
  if (wallet.recharges.length === 0) return;
  wallet.recharges = [];
  writeWallet(wallet);
}

export function removeSavedCard(id: string) {
  const wallet = readWallet();
  const cards = wallet.cards.filter((c) => c.id !== id);
  if (cards.length === wallet.cards.length) return;
  wallet.cards = cards;
  writeWallet(wallet);
}

export function upsertSavedCard(input: {
  catalogId: string;
  nickname: string;
  number: string;
  id?: string;
}): SavedCard {
  const wallet = readWallet();
  const now = new Date().toISOString();
  const existing = input.id
    ? wallet.cards.find((c) => c.id === input.id)
    : wallet.cards.find((c) => c.catalogId === input.catalogId && c.number === input.number);
  if (existing) {
    existing.nickname = input.nickname;
    existing.number = input.number;
    existing.catalogId = input.catalogId;
    existing.updatedAt = now;
    wallet.cards = [existing, ...wallet.cards.filter((c) => c.id !== existing.id)];
    writeWallet(wallet);
    return existing;
  }
  const card: SavedCard = {
    id: crypto.randomUUID(),
    catalogId: input.catalogId,
    nickname: input.nickname,
    number: input.number,
    updatedAt: now,
  };
  wallet.cards.unshift(card);
  writeWallet(wallet);
  return card;
}

export function createRecharge(saved: SavedCard, amount: number, now = Date.now()): Recharge {
  const wallet = readWallet();
  const recharge: Recharge = {
    id: rechargeId(),
    catalogId: saved.catalogId,
    savedCardId: saved.id,
    nickname: saved.nickname,
    number: saved.number,
    amount,
    status: "aguardando",
    createdAt: new Date(now).toISOString(),
    expiresAt: new Date(now + PIX_TTL_MS).toISOString(),
  };
  wallet.recharges.unshift(recharge);
  writeWallet(wallet);
  return recharge;
}

export function openRecharge(saved: SavedCard, amount: number, now = Date.now()): Recharge {
  const wallet = expireDue(now);
  const existing = wallet.recharges.find(
    (r) => r.savedCardId === saved.id && r.amount === amount && r.status === "aguardando",
  );
  if (existing) return existing;
  let replaced = false;
  for (const recharge of wallet.recharges) {
    if (recharge.savedCardId === saved.id && recharge.status === "aguardando") {
      recharge.status = "substituida";
      replaced = true;
    }
  }
  if (replaced) writeWallet(wallet);
  return createRecharge(saved, amount, now);
}

export function confirmRecharge(id: string, now = Date.now()): Recharge | undefined {
  const wallet = expireDue(now);
  const recharge = wallet.recharges.find((r) => r.id === id);
  if (!recharge) return undefined;
  if (recharge.status !== "aguardando") return recharge;
  recharge.status = "confirmada";
  recharge.paidAt = new Date(now).toISOString();
  writeWallet(wallet);
  return recharge;
}

export function pixCode(recharge: Recharge) {
  const cents = Math.round(recharge.amount * 100)
    .toString()
    .padStart(6, "0");
  return `RECARGAAI${recharge.id.replace("-", "")}${cents}`;
}

export function receiptLines(recharge: Recharge, card: TransitCard) {
  return [
    "RecargaAí",
    "Comprovante de recarga",
    "",
    `Identificador: ${recharge.id}`,
    `Data: ${formatWhen(recharge.paidAt ?? recharge.createdAt)}`,
    `Cartão: ${card.name}`,
    `Apelido: ${recharge.nickname}`,
    `Número: ${maskNumber(recharge.number)}`,
    `Operadora: ${card.operator}`,
    `Região: ${card.region}`,
    `Valor: ${brl(recharge.amount)}`,
    `Taxa de conveniência: ${brl(0)}`,
    `Total: ${brl(recharge.amount)}`,
    "Status: Pagamento confirmado",
    "",
    card.creditTime,
    card.validation,
  ];
}

export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
