import { describe, expect, it } from "vitest";
import {
  genererLignesRapide,
  ouvragesPourType,
  selectionsDefaut,
  tvaSuggeree,
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
  it("crée une ligne par ouvrage à quantité > 0", () => {
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
    expect(lignes[0].coefQte).toBe(1.08); // m² => +8 %
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
