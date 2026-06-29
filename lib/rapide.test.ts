import { describe, expect, it } from "vitest";
import {
  detecterRecouvrements,
  genererLignesRapide,
  ouvragesPourType,
  selectionsDefaut,
  tvaSuggeree,
  tvaSuggereeSelection,
} from "./rapide";
import type { ParametresDevis, PosteBPU } from "./types";

const params: ParametresDevis = {
  ref: "LCB-TEST-V1",
  client: "Test",
  adresse: "",
  typeProjet: "renovation_appartement",
  typeClient: "particulier",
  gammeDefaut: "MOY",
  tvaDefaut: 10,
  tauxImprevus: 0,
};

const POSTES: Record<string, PosteBPU> = {
  "OCREN-07": {
    code: "OCREN-07",
    lot: "OCREN",
    lotTitre: "Ouvrages complets — Rénovation",
    designation: "Rénovation appartement complète",
    unite: "m²",
    min: 1200,
    moy: 1650,
    max: 2400,
  },
  "OCREN-01": {
    code: "OCREN-01",
    lot: "OCREN",
    lotTitre: "Ouvrages complets — Rénovation",
    designation: "SDB complète clé en main",
    unite: "m²",
    min: 1300,
    moy: 1850,
    max: 2800,
  },
};

const getPoste = (code: string) => POSTES[code];

describe("tvaSuggeree", () => {
  it("10 % en rénovation, 20 % sinon", () => {
    expect(tvaSuggeree("renovation_appartement")).toBe(10);
    expect(tvaSuggeree("renovation_maison")).toBe(10);
    expect(tvaSuggeree("extension")).toBe(20);
    expect(tvaSuggeree("neuf")).toBe(20);
    expect(tvaSuggeree("erp")).toBe(20);
  });
});

describe("tvaSuggereeSelection", () => {
  it("5,5 % si la sélection rénovation est 100 % énergétique", () => {
    expect(tvaSuggereeSelection("renovation_maison", ["OCREN-04"])).toBe(5.5);
    expect(
      tvaSuggereeSelection("renovation_maison", ["OCREN-04", "OCREN-05"]),
    ).toBe(5.5);
  });
  it("10 % dès qu'un poste non énergétique est présent", () => {
    expect(
      tvaSuggereeSelection("renovation_appartement", ["OCREN-04", "OCREN-07"]),
    ).toBe(10);
  });
  it("20 % hors rénovation même si énergétique", () => {
    expect(tvaSuggereeSelection("extension", ["OCREN-04"])).toBe(20);
  });
  it("ravalement non isolant OCREN-09 = 10 % (pas 5,5 %)", () => {
    expect(tvaSuggereeSelection("renovation_maison", ["OCREN-09"])).toBe(10);
  });
  it("adaptation PMR exclusivement = 5,5 %", () => {
    expect(tvaSuggereeSelection("adaptation_pmr", ["OCREN-13"])).toBe(5.5);
    expect(tvaSuggereeSelection("adaptation_pmr", ["OCREN-13", "OCREN-02"])).toBe(10);
  });
});

describe("selectionsDefaut — parcours par type (corrigés)", () => {
  it("haussmannien : OCREN-15 coché, OCREN-07 NON coché (plus de double-comptage)", () => {
    const s = selectionsDefaut("renovation_haussmannien", 60);
    expect(s["OCREN-15"].actif).toBe(true);
    expect(s["OCREN-07"]?.actif ?? false).toBe(false);
  });
  it("énergétique : ITI coché AVEC une quantité (plus d'état d'erreur)", () => {
    const s = selectionsDefaut("renovation_energetique", 80);
    expect(s["OCREN-04"].actif).toBe(true);
    expect(s["OCREN-04"].qte).toBeGreaterThan(0);
  });
  it("CHR : cuisine pro à ~30 % de la surface, pas 100 %", () => {
    const s = selectionsDefaut("chr_restaurant", 150);
    expect(s["OCERP-10"].qte).toBe(45); // round(150 × 0.3)
  });
  it("adaptation PMR : SDB PMR cochée par défaut, pas la réno globale", () => {
    const s = selectionsDefaut("adaptation_pmr", 60);
    expect(s["OCREN-13"].actif).toBe(true);
    expect(s["OCREN-07"]?.actif ?? false).toBe(false);
  });
  it("garde-fou : aucun ouvrage coché sans quantité (surface 0)", () => {
    const s = selectionsDefaut("amenagement_commercial", 0);
    for (const v of Object.values(s)) {
      if (v.actif) expect(v.qte).toBeGreaterThan(0);
    }
  });
});

describe("detecterRecouvrements", () => {
  it("alerte quand global + pièce de vie sont cochés ensemble", () => {
    const msgs = detecterRecouvrements(["OCREN-07", "OCREN-06"]);
    expect(msgs.length).toBeGreaterThan(0);
  });
  it("aucune alerte sans recouvrement", () => {
    expect(detecterRecouvrements(["OCREN-01", "OCREN-03"])).toHaveLength(0);
  });
});

describe("ouvragesPourType", () => {
  it("filtre les ouvrages rénovation", () => {
    const reno = ouvragesPourType("renovation_appartement").map((o) => o.code);
    expect(reno).toContain("OCREN-07");
    expect(reno).not.toContain("OCMOB-09"); // extension only
  });

  it("propose les ouvrages MOB en extension", () => {
    const ext = ouvragesPourType("extension").map((o) => o.code);
    expect(ext).toContain("OCMOB-09");
    expect(ext).toContain("OCMOB-10");
  });

  it("expose des ouvrages dédiés aux domaines ERP/neuf (plus de repli RENO)", () => {
    expect(ouvragesPourType("chr_restaurant").map((o) => o.code)).toContain("OCERP-10");
    expect(ouvragesPourType("amenagement_commercial").map((o) => o.code)).toContain("OCERP-01");
    expect(ouvragesPourType("amenagement_tertiaire").map((o) => o.code)).toContain("OCTER-01");
    expect(ouvragesPourType("erp_sante").map((o) => o.code)).toContain("OCERP-20");
    expect(ouvragesPourType("neuf_maconne").map((o) => o.code)).toContain("OCMAC-01");
    // un domaine ERP ne retombe PAS sur la rénovation logement
    expect(ouvragesPourType("chr_restaurant").map((o) => o.code)).not.toContain("OCREN-07");
  });
});

describe("tvaSuggeree — nouveaux types", () => {
  it("10 % pour haussmannien et PMR, 5,5 % énergétique, 20 % ERP/neuf", () => {
    expect(tvaSuggeree("renovation_haussmannien")).toBe(10);
    expect(tvaSuggeree("adaptation_pmr")).toBe(10);
    expect(tvaSuggeree("renovation_energetique")).toBe(5.5);
    expect(tvaSuggeree("amenagement_commercial")).toBe(20);
    expect(tvaSuggeree("chr_restaurant")).toBe(20);
    expect(tvaSuggeree("neuf_maconne")).toBe(20);
    expect(tvaSuggeree("erp_sante")).toBe(20);
  });
});

describe("selectionsDefaut", () => {
  it("préremplit la rénovation globale avec la surface SHAB", () => {
    const sel = selectionsDefaut("renovation_appartement", 57);
    expect(sel["OCREN-07"].actif).toBe(true);
    expect(sel["OCREN-07"].qte).toBe(57);
    expect(sel["OCREN-01"].actif).toBe(false); // proposé, non coché
  });
});

describe("genererLignesRapide", () => {
  it("crée une ligne par ouvrage à quantité > 0, en quantité ferme (coef 1)", () => {
    const lignes = genererLignesRapide(
      [
        { code: "OCREN-07", qte: 57 },
        { code: "OCREN-01", qte: 5 },
      ],
      params,
      getPoste,
    );
    expect(lignes).toHaveLength(2);
    expect(lignes[0].code).toBe("OCREN-07");
    expect(lignes[0].qteBrute).toBe(57);
    // Forfait clé en main : pas de coef conservateur.
    expect(lignes[0].coefQte).toBe(1);
    expect(lignes[0].ferme).toBe(true);
    expect(lignes[0].tva).toBe(10);
  });

  it("ignore les quantités nulles et les codes inconnus", () => {
    const lignes = genererLignesRapide(
      [
        { code: "OCREN-07", qte: 0 },
        { code: "INCONNU-99", qte: 10 },
        { code: "OCREN-01", qte: 5 },
      ],
      params,
      getPoste,
    );
    expect(lignes).toHaveLength(1);
    expect(lignes[0].code).toBe("OCREN-01");
  });
});
