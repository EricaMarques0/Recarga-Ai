import { describe, expect, it } from "vitest";
import { validateAmount } from "@/lib/catalog";
describe("validateAmount", () => {
  it("rejects empty", () => expect(validateAmount("").error).toBeDefined());
  it("rejects below R$5", () => expect(validateAmount("4,99").error).toBeDefined());
  it("rejects above R$500", () => expect(validateAmount("500,01").error).toBeDefined());
  it("accepts comma decimals", () => expect(validateAmount("25,50").value).toBe(25.5));
});
