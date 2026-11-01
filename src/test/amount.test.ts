import { describe, expect, it } from "vitest";
import { getCard, maskNumber, tripEstimate, validateAmount, validateCardNumber, validateNickname } from "@/lib/catalog";

describe("validateAmount", () => {
  it("rejects empty", () => expect(validateAmount("").error).toBeDefined());
  it("rejects below R$5", () => expect(validateAmount("4,99").error).toBeDefined());
  it("rejects above R$500", () => expect(validateAmount("500,01").error).toBeDefined());
  it("accepts comma decimals", () => expect(validateAmount("25,50").value).toBe(25.5));
  it("uses the limit of the chosen card", () => {
    const bem = getCard("bem-osasco")!;
    expect(validateAmount("150,01", bem).error).toBeDefined();
    expect(validateAmount("150", bem).value).toBe(150);
    expect(validateAmount("10", getCard("bilhete-unico")).value).toBe(10);
    expect(validateAmount("9,99", getCard("bilhete-unico")).error).toBeDefined();
  });
});

describe("card identity", () => {
  const bu = getCard("bilhete-unico")!;

  it("requires a nickname of at least two letters", () => {
    expect(validateNickname("A").error).toBeDefined();
    expect(validateNickname("  Meu BU  ").nickname).toBe("Meu BU");
  });

  it("checks the digit length and masks the number", () => {
    expect(validateCardNumber("123", bu).error).toBeDefined();
    expect(validateCardNumber("0000000000", bu).error).toBeDefined();
    expect(validateCardNumber("1234 5678 90", bu).number).toBe("1234567890");
    expect(maskNumber("1234567890")).toBe("•••• 7890");
  });

  it("estimates whole trips from the reference fare", () => {
    expect(tripEstimate(27, 5)).toBe(5);
    expect(tripEstimate(4, 5)).toBe(0);
  });
});
