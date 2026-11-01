import { beforeEach, describe, expect, it } from "vitest";
import {
  PIX_TTL_MS,
  confirmRecharge,
  createRecharge,
  formatRemaining,
  openRecharge,
  pixCode,
  clearHistory,
  readWallet,
  removeRecharge,
  removeSavedCard,
  resolveStatus,
  syncWallet,
  upsertSavedCard,
} from "@/lib/wallet";

beforeEach(() => localStorage.clear());

describe("formatRemaining", () => {
  it("formats minutes and seconds", () => expect(formatRemaining(65_000)).toBe("01:05"));
  it("clamps a finished timer", () => expect(formatRemaining(-10)).toBe("00:00"));
});

describe("wallet", () => {
  const now = Date.parse("2026-11-01T15:00:00.000Z");

  it("updates the nickname when the number is the same", () => {
    const first = upsertSavedCard({ catalogId: "bilhete-unico", nickname: "Trabalho", number: "1234567890" });
    const second = upsertSavedCard({ catalogId: "bilhete-unico", nickname: "Casa", number: "1234567890" });
    expect(second.id).toBe(first.id);
    expect(readWallet().cards).toHaveLength(1);
    expect(second.nickname).toBe("Casa");
  });

  it("confirms a pix inside the window and expires it afterwards", () => {
    const saved = upsertSavedCard({ catalogId: "top", nickname: "Metrô", number: "123456789012" });
    const recharge = createRecharge(saved, 30, now);
    const code = pixCode(recharge);
    expect(code.startsWith("RECARGAAI")).toBe(true);
    expect(code.includes("br.gov.bcb.pix")).toBe(false);
    expect(code.startsWith("000201")).toBe(false);
    expect(resolveStatus(recharge, now + 1000)).toBe("aguardando");

    const paid = confirmRecharge(recharge.id, now + 1000);
    expect(paid?.status).toBe("confirmada");
    expect(paid?.paidAt).toBeDefined();
    expect(confirmRecharge(recharge.id, now + 2000)?.status).toBe("confirmada");

    const pending = createRecharge(saved, 20, now);
    expect(confirmRecharge(pending.id, now + PIX_TTL_MS + 1)?.status).toBe("expirada");
  });

  it("removes one recharge and can clear the rest without deleting the card", () => {
    const saved = upsertSavedCard({ catalogId: "bilhete-unico", nickname: "Trabalho", number: "1234567890" });
    const first = createRecharge(saved, 20, now);
    createRecharge(saved, 30, now + 1000);
    removeRecharge(first.id);
    expect(readWallet().recharges).toHaveLength(1);
    expect(readWallet().cards).toHaveLength(1);
    clearHistory();
    expect(readWallet().recharges).toHaveLength(0);
    expect(readWallet().cards).toHaveLength(1);
  });

  it("removes a saved card and keeps the recharges", () => {
    const saved = upsertSavedCard({ catalogId: "bilhete-unico", nickname: "Trabalho", number: "1234567890" });
    createRecharge(saved, 20, now);
    removeSavedCard(saved.id);
    const wallet = readWallet();
    expect(wallet.cards).toHaveLength(0);
    expect(wallet.recharges).toHaveLength(1);
  });

  it("closes an older open pix when a newer one was already paid", () => {
    const saved = upsertSavedCard({ catalogId: "legal-sbc", nickname: "Casa", number: "123456789" });
    const older = createRecharge(saved, 20, now);
    const newer = createRecharge(saved, 50, now + 1000);
    confirmRecharge(newer.id, now + 2000);
    const wallet = syncWallet(now + 3000);
    expect(wallet.recharges.find((r) => r.id === older.id)?.status).toBe("substituida");
    expect(wallet.recharges.find((r) => r.id === newer.id)?.status).toBe("confirmada");
  });

  it("replaces the open pix when the amount changes", () => {
    const saved = upsertSavedCard({ catalogId: "bem-osasco", nickname: "Casa", number: "1234567890" });
    const first = openRecharge(saved, 30, now);
    const second = openRecharge(saved, 50, now + 1000);
    const wallet = readWallet();
    expect(second.id).not.toBe(first.id);
    expect(wallet.recharges.find((r) => r.id === first.id)?.status).toBe("substituida");
    expect(wallet.recharges.find((r) => r.id === second.id)?.status).toBe("aguardando");
    expect(wallet.recharges.filter((r) => r.status === "aguardando")).toHaveLength(1);
  });

  it("reuses an open pix for the same card and amount", () => {
    const saved = upsertSavedCard({ catalogId: "bom", nickname: "EMTU", number: "109876543210" });
    const first = openRecharge(saved, 50, now);
    const second = openRecharge(saved, 50, now + 1000);
    expect(second.id).toBe(first.id);
    expect(readWallet().recharges).toHaveLength(1);
  });
});