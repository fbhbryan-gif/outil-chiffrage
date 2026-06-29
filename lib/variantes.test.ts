import { describe, expect, it } from "vitest";
import { BPU_PAR_CODE } from "./bpu";
import { VARIANTES, optionsDisponibles } from "./variantes";

describe("VARIANTES", () => {
  it("chaque groupe résout toutes ses options dans le BPU", () => {
    for (const g of VARIANTES) {
      const dispo = optionsDisponibles(g, (c) => BPU_PAR_CODE.get(c));
      expect(dispo.length, `groupe ${g.id}`).toBe(g.options.length);
    }
  });
});
