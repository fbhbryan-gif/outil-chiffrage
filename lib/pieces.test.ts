import { describe, expect, it } from "vitest";
import { perimetreEstime, quantitesLiees } from "./pieces";

describe("quantitesLiees", () => {
  it("dérive sol/plinthes/murs/plafond depuis les dimensions saisies", () => {
    const q = quantitesLiees({ surfaceSol: 20, perimetre: 18, hauteur: 2.5 });
    expect(q.sol).toBe(20);
    expect(q.plafond).toBe(20);
    expect(q.plinthes).toBe(18);
    expect(q.murs).toBe(45); // 18 × 2,5
  });

  it("estime le périmètre et utilise 2,50 m par défaut", () => {
    const q = quantitesLiees({ surfaceSol: 25 });
    expect(q.perimetre).toBe(20); // 4 × √25
    expect(q.hauteur).toBe(2.5);
    expect(q.murs).toBe(50); // 20 × 2,5
  });

  it("perimetreEstime renvoie 0 pour une surface nulle", () => {
    expect(perimetreEstime(0)).toBe(0);
  });
});
