export type Category = "municipal" | "metropolitano";

export interface TransitCard {
  id: string;
  name: string;
  region: string;
  operator: string;
  category: Category;
}

// Dados demonstrativos — nenhuma integração homologada.
export const CARDS: TransitCard[] = [
  { id: "bilhete-unico", name: "Bilhete Único", region: "São Paulo", operator: "SPTrans", category: "municipal" },
  { id: "top", name: "Cartão TOP", region: "Região Metropolitana", operator: "Metrô / CPTM / EMTU", category: "metropolitano" },
  { id: "bem-osasco", name: "Cartão BEM", region: "Osasco", operator: "Transporte municipal", category: "municipal" },
  { id: "legal-sbc", name: "Cartão Legal", region: "São Bernardo do Campo", operator: "Transporte municipal", category: "municipal" },
  { id: "cidadao", name: "Cartão Cidadão", region: "ABC Paulista", operator: "Transporte municipal", category: "municipal" },
  { id: "bom", name: "Cartão BOM", region: "Região Metropolitana", operator: "EMTU", category: "metropolitano" },
];

export const getCard = (id?: string) => CARDS.find((c) => c.id === id);

export const PRESET_AMOUNTS = [20, 30, 50, 100];
export const MIN_AMOUNT = 5;
export const MAX_AMOUNT = 500;

export const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function validateAmount(raw: string): { value?: number; error?: string } {
  if (!raw.trim()) return { error: "Informe um valor para a recarga." };
  const value = Number(raw.replace(/\./g, "").replace(",", "."));
  if (!Number.isFinite(value)) return { error: "Valor inválido." };
  if (value < MIN_AMOUNT) return { error: `O valor mínimo é ${brl(MIN_AMOUNT)}.` };
  if (value > MAX_AMOUNT) return { error: `O valor máximo é ${brl(MAX_AMOUNT)}.` };
  return { value: Math.round(value * 100) / 100 };
}

export const HISTORY = [
  { id: "RA-7F3K2", date: "22/10/2026 08:14", cardId: "bilhete-unico", amount: 50, status: "Concluída" },
  { id: "RA-6D9Q1", date: "15/10/2026 19:02", cardId: "top", amount: 30, status: "Concluída" },
  { id: "RA-5B2X8", date: "09/10/2026 12:40", cardId: "bem-osasco", amount: 20, status: "Em processamento" },
  { id: "RA-4H7M5", date: "01/10/2026 07:55", cardId: "bilhete-unico", amount: 100, status: "Concluída" },
  { id: "RA-3C1T9", date: "24/09/2026 18:21", cardId: "legal-sbc", amount: 30, status: "Expirada" },
];
