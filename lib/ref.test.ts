import { describe, expect, it } from "vitest";
import { bumpVersion, genRef, slugClient, versionDeRef } from "./ref";

describe("slugClient", () => {
  it("retire accents/espaces et passe en majuscules", () => {
    expect(slugClient("Lélia Martin")).toBe("LELIAMARTIN");
    expect(slugClient("Café & Co")).toBe("CAFECO");
    expect(slugClient("")).toBe("CLIENT");
  });
});

describe("genRef", () => {
  it("formate LCB-AAAA-MMJJ-CLIENT-Vn", () => {
    const d = new Date("2026-06-28T10:00:00");
    expect(genRef("Lélia Martin", 3, d)).toBe("LCB-2026-0628-LELIAMARTIN-V3");
  });
  it("repli V1 si version invalide", () => {
    const d = new Date("2026-01-05T10:00:00");
    expect(genRef("X", 0, d)).toBe("LCB-2026-0105-X-V1");
  });
});

describe("versionnement", () => {
  it("versionDeRef et bumpVersion", () => {
    expect(versionDeRef("LCB-2026-0628-X-V3")).toBe(3);
    expect(bumpVersion("LCB-2026-0628-X-V3")).toBe("LCB-2026-0628-X-V4");
    expect(versionDeRef("sans-version")).toBe(1);
  });
});
