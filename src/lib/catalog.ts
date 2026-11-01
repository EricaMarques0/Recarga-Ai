export type Category = "municipal" | "metropolitano";

export interface TransitCard {
  id: string;
  name: string;
  region: string;
  operator: string;
  category: Category;
  /** Quantidade de dígitos aceita para este tipo de cartão. */
  numberLength: number;
  minAmount: number;
  maxAmount: number;
  /** Tarifa de referência só para estimar viagens. Não é a tarifa vigente. */
  referenceFare: number;
  creditTime: string;
  validation: string;
}

// Cartões da Grande São Paulo atendidos pelo RecargaAí.
export const CARDS: TransitCard[] = [
  {
    id: "bilhete-unico",
    name: "Bilhete Único",
    region: "São Paulo",
    operator: "SPTrans",
    category: "municipal",
    numberLength: 10,
    minAmount: 10,
    maxAmount: 350,
    referenceFare: 5,
    creditTime: "O repasse para a SPTrans leva alguns minutos.",
    validation: "Encoste o cartão num validador de ônibus, num terminal ou no bloqueio da estação.",
  },
  {
    id: "top",
    name: "Cartão TOP",
    region: "Região Metropolitana",
    operator: "Metrô / CPTM / EMTU",
    category: "metropolitano",
    numberLength: 12,
    minAmount: 5,
    maxAmount: 200,
    referenceFare: 5.2,
    creditTime: "O repasse para trilhos e ônibus metropolitanos aparece como uma etapa de alguns minutos.",
    validation: "Aproxime o cartão de um validador do Metrô, da CPTM ou da EMTU.",
  },
  {
    id: "bem-osasco",
    name: "Cartão BEM",
    region: "Osasco",
    operator: "Transporte municipal",
    category: "municipal",
    numberLength: 10,
    minAmount: 5,
    maxAmount: 150,
    referenceFare: 5,
    creditTime: "O repasse do transporte de Osasco aparece como uma etapa de alguns minutos.",
    validation: "Aproxime o cartão de um validador ou terminal do transporte de Osasco.",
  },
  {
    id: "legal-sbc",
    name: "Cartão Legal",
    region: "São Bernardo do Campo",
    operator: "Transporte municipal",
    category: "municipal",
    numberLength: 9,
    minAmount: 5,
    maxAmount: 150,
    referenceFare: 5.2,
    creditTime: "O repasse em São Bernardo do Campo aparece como uma etapa de alguns minutos.",
    validation: "Aproxime o cartão de um validador municipal de São Bernardo do Campo.",
  },
  {
    id: "cidadao",
    name: "Cartão Cidadão",
    region: "ABC Paulista",
    operator: "Transporte municipal",
    category: "municipal",
    numberLength: 10,
    minAmount: 5,
    maxAmount: 150,
    referenceFare: 5,
    creditTime: "O repasse no ABC Paulista aparece como uma etapa de alguns minutos.",
    validation: "Aproxime o cartão de um validador do transporte municipal.",
  },
  {
    id: "bom",
    name: "Cartão BOM",
    region: "Região Metropolitana",
    operator: "EMTU",
    category: "metropolitano",
    numberLength: 12,
    minAmount: 10,
    maxAmount: 400,
    referenceFare: 5.4,
    creditTime: "O repasse para a EMTU aparece como uma etapa de alguns minutos.",
    validation: "Aproxime o cartão de um validador da EMTU.",
  },
];

export const getCard = (id?: string) => CARDS.find((c) => c.id === id);

export const PRESET_AMOUNTS = [20, 30, 50, 100];
export const MIN_AMOUNT = 5;
export const MAX_AMOUNT = 500;

export const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function cardLimits(card?: TransitCard) {
  return { min: card?.minAmount ?? MIN_AMOUNT, max: card?.maxAmount ?? MAX_AMOUNT };
}

export function validateAmount(raw: string, card?: TransitCard): { value?: number; error?: string } {
  const { min, max } = cardLimits(card);
  if (!raw.trim()) return { error: "Informe um valor para a recarga." };
  const value = Number(raw.replace(/\./g, "").replace(",", "."));
  if (!Number.isFinite(value)) return { error: "Valor inválido." };
  const where = card ? " neste cartão" : "";
  if (value < min) return { error: `O valor mínimo${where} é ${brl(min)}.` };
  if (value > max) return { error: `O valor máximo${where} é ${brl(max)}.` };
  return { value: Math.round(value * 100) / 100 };
}

export function tripEstimate(amount: number, fare: number) {
  if (!Number.isFinite(amount) || !Number.isFinite(fare) || fare <= 0) return 0;
  return Math.floor(amount / fare);
}

export function validateNickname(raw: string): { nickname?: string; error?: string } {
  const nickname = raw.trim().replace(/\s+/g, " ");
  if (nickname.length < 2) return { error: "Dê um apelido com pelo menos 2 letras." };
  if (nickname.length > 24) return { error: "Use um apelido de até 24 caracteres." };
  return { nickname };
}

export function validateCardNumber(raw: string, card: TransitCard): { number?: string; error?: string } {
  const digits = raw.replace(/\D/g, "");
  if (!digits || /^0+$/.test(digits)) return { error: "Informe o número impresso no cartão." };
  if (digits.length !== card.numberLength) {
    return { error: `Neste cartão, o número tem ${card.numberLength} dígitos.` };
  }
  return { number: digits };
}

export function groupDigits(digits: string) {
  return digits.replace(/\D/g, "").replace(/(\d{4})(?=\d)/g, "$1 ");
}

export function maskNumber(number: string) {
  const digits = number.replace(/\D/g, "");
  return `•••• ${digits.slice(-4)}`;
}
