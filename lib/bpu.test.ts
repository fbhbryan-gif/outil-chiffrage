import { describe, expect, it } from "vitest";
import {
  BPU,
  ORDRE_LOTS,
  ordreDuLot,
  rechercherBPU,
  sansAccents,
} from "./bpu";
import { isVerrouille } from "./engine";

describe("sansAccents", () => {
  it("retire diacritiques et passe en minuscules", () => {
    expect(sansAccents("Plâtre Façade Câble")).toBe("platre facade cable");
  });
});

describe("rechercherBPU", () => {
  it("trouve malgré l'absence d'accents dans la requête", () => {
    const avec = rechercherBPU("revêtements");
    const sans = rechercherBPU("revetements");
    expect(sans.length).toBeGreaterThan(0);
    expect(sans.length).toBe(avec.length);
  });

  it("résout un synonyme courant (placo → BA13)", () => {
    const r = rechercherBPU("placo");
    expect(r.length).toBeGreaterThan(0);
    // Le synonyme ramène bien des postes BA13 (le terme n'existe pas tel quel).
    expect(r.some((p) => /ba\s?13/i.test(p.designation))).toBe(true);
  });

  it("requête vide renvoie toute la base", () => {
    expect(rechercherBPU("").length).toBeGreaterThan(300);
  });
});

describe("intégrité des prix BPU", () => {
  it("MIN ≤ MOY ≤ MAX pour tout poste non verrouillé", () => {
    const viol = BPU.filter(
      (p) => !isVerrouille(p.code) && !(p.min <= p.moy && p.moy <= p.max),
    ).map((p) => `${p.code} {${p.min}/${p.moy}/${p.max}}`);
    expect(viol, `postes incohérents: ${viol.join(", ")}`).toHaveLength(0);
  });
});

describe("ordre des lots", () => {
  it("ORDRE_LOTS commence par PREP et contient AGEN", () => {
    expect(ORDRE_LOTS[0]).toBe("PREP");
    expect(ORDRE_LOTS).toContain("AGEN");
  });
  it("ordreDuLot croît dans l'ordre TCE et inconnu en fin", () => {
    expect(ordreDuLot("DEMO")).toBeGreaterThan(ordreDuLot("PREP"));
    expect(ordreDuLot("ZZZ")).toBe(999);
  });
});
