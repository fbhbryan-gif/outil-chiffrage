import { describe, expect, it } from "vitest";
import {
  calculerLigne,
  calculerSynthese,
  clauseRevisionRequise,
  coefDefautPourUnite,
  isVerrouille,
  ligneDepuisPoste,
  parseDevisUpdate,
  puBaseRetenu,
  regrouperParLot,
  round2,
  versDevisUpdate,
} from "./engine";
import type { LigneDevis, ParametresDevis, PosteBPU } from "./types";

const params = (over: Partial<ParametresDevis> = {}): ParametresDevis => ({
  ref: "LCB-TEST-V1",
  client: "Test",
  adresse: "",
  typeProjet: "renovation_appartement",
  typeClient: "particulier",
  gammeDefaut: "MOY",
  tvaDefaut: 10,
  tauxImprevus: 0,
  ...over,
});

const posteRS01: PosteBPU = {
  code: "RS-01",
  lot: "RS",
  lotTitre: "Revêtements de sols",
  designation: "Pose carrelage sol standard",
  unite: "m²",
  min: 999,
  moy: 999,
  max: 999, // valeurs piégées : doivent être ignorées (prix verrouillé 50)
};

const posteOCREN04: PosteBPU = {
  code: "OCREN-04",
  lot: "OCREN",
  lotTitre: "Ouvrages complets — Rénovation",
  designation: "ITI complète prête à peindre",
  unite: "m²",
  min: 60,
  moy: 90,
  max: 135,
};

describe("helpers", () => {
  it("round2 gère les flottants et coalesce NaN → 0", () => {
    expect(round2(183.816)).toBe(183.82);
    expect(round2(0.1 + 0.2)).toBe(0.3);
    expect(round2(NaN)).toBe(0);
    expect(round2(Number("") * 2)).toBe(0);
  });

  it("isVerrouille repère RS-01/RS-09", () => {
    expect(isVerrouille("RS-01")).toBe(true);
    expect(isVerrouille("RS-09")).toBe(true);
    expect(isVerrouille("OCREN-07")).toBe(false);
  });

  it("coefDefautPourUnite suit les règles §5.1", () => {
    expect(coefDefautPourUnite("m²")).toBe(1.08);
    expect(coefDefautPourUnite("ml")).toBe(1.1);
    expect(coefDefautPourUnite("F")).toBe(1);
    expect(coefDefautPourUnite("U")).toBe(1);
  });
});

describe("PU de base et prix verrouillés", () => {
  it("sélectionne le PU selon la gamme", () => {
    expect(puBaseRetenu(posteOCREN04, "MIN")).toBe(60);
    expect(puBaseRetenu(posteOCREN04, "MOY")).toBe(90);
    expect(puBaseRetenu(posteOCREN04, "MAX")).toBe(135);
  });

  it("force 50 €/m² pour RS-01 quelle que soit la gamme", () => {
    expect(puBaseRetenu(posteRS01, "MIN")).toBe(50);
    expect(puBaseRetenu(posteRS01, "MOY")).toBe(50);
    expect(puBaseRetenu(posteRS01, "MAX")).toBe(50);
  });
});

describe("ligneDepuisPoste", () => {
  it("hérite gamme/TVA des paramètres et coef selon l'unité", () => {
    const l = ligneDepuisPoste(posteOCREN04, params({ gammeDefaut: "MIN", tvaDefaut: 20 }), 10);
    expect(l.puBase).toBe(60);
    expect(l.tva).toBe(20);
    expect(l.coefQte).toBe(1.08);
    expect(l.qteBrute).toBe(10);
  });

  it("ajoute une note pour un prix verrouillé", () => {
    const l = ligneDepuisPoste(posteRS01, params());
    expect(l.puBase).toBe(50);
    expect(l.note).toMatch(/expert/i);
  });
});

describe("calculerLigne", () => {
  it("applique le coef quantité ; le PU final est le PU du BPU (sans majoration)", () => {
    const ligne: LigneDevis = {
      id: "1",
      code: "RS-01",
      designation: "Carrelage",
      unite: "m²",
      puBase: 50,
      gamme: "MOY",
      qteBrute: 20,
      coefQte: 1.08,
      tva: 10,
    };
    const c = calculerLigne(ligne);
    expect(c.qteAppliquee).toBe(21.6); // 20 × 1.08
    expect(c.puFinal).toBe(50); // PU du BPU, aucune majoration
    expect(c.totalHT).toBe(1080); // 21.6 × 50
  });
});

describe("calculerSynthese", () => {
  const lignes: LigneDevis[] = [
    {
      id: "1",
      code: "RS-01",
      designation: "Carrelage",
      unite: "m²",
      puBase: 50,
      gamme: "MOY",
      qteBrute: 20,
      coefQte: 1.08,
      tva: 10,
    },
    {
      id: "2",
      code: "OCREN-04",
      designation: "ITI",
      unite: "m²",
      puBase: 90,
      gamme: "MOY",
      qteBrute: 30,
      coefQte: 1.08,
      tva: 10,
    },
  ];

  it("totalise HT, imprévus, TVA et TTC (taux unique)", () => {
    const s = calculerSynthese(lignes, params({ tauxImprevus: 0.04 }), (l) => l);
    expect(s.htPostes).toBe(3996); // 1080 + 2916
    expect(s.montantImprevus).toBe(159.84);
    expect(s.totalHT).toBe(4155.84);
    expect(s.tvaParTaux).toHaveLength(1);
    expect(s.tvaParTaux[0].taux).toBe(10);
    expect(s.tvaParTaux[0].montantTVA).toBe(415.58);
    expect(s.totalTTC).toBe(4571.42);
  });

  it("répartit les imprévus au prorata sur deux taux de TVA", () => {
    const deuxTaux: LigneDevis[] = [
      { id: "a", code: "AD-1", designation: "A", unite: "F", puBase: 100, gamme: "MOY", qteBrute: 10, coefQte: 1, tva: 10 },
      { id: "b", code: "AD-2", designation: "B", unite: "F", puBase: 100, gamme: "MOY", qteBrute: 10, coefQte: 1, tva: 20 },
    ];
    const s = calculerSynthese(deuxTaux, params({ typeClient: "erp", tauxImprevus: 0.05 }), (l) => l);
    expect(s.htPostes).toBe(2000);
    expect(s.montantImprevus).toBe(100);
    const t10 = s.tvaParTaux.find((t) => t.taux === 10)!;
    const t20 = s.tvaParTaux.find((t) => t.taux === 20)!;
    expect(t10.baseHT).toBe(1050);
    expect(t10.montantTVA).toBe(105);
    expect(t20.baseHT).toBe(1050);
    expect(t20.montantTVA).toBe(210);
    expect(s.totalTVA).toBe(315);
    expect(s.totalTTC).toBe(2415);
  });

  it("regroupe les lignes par lot", () => {
    const s = calculerSynthese(lignes, params(), (l) => l);
    const lots = s.parLot.map((p) => p.lot).sort();
    expect(lots).toEqual(["OCREN", "RS"]);
  });
});

describe("versDevisUpdate", () => {
  it("produit les PU HT et la structure attendue", () => {
    const lignes: LigneDevis[] = [
      { id: "1", code: "RS-01", designation: "Carrelage", unite: "m²", puBase: 50, gamme: "MOY", qteBrute: 20, coefQte: 1.08, tva: 10 },
    ];
    const out = versDevisUpdate(lignes, params(), (l) => l);
    expect(out.lots).toHaveLength(1);
    const item = out.lots[0].items[0] as { pu: number; qty: number; total: number };
    expect(item.pu).toBe(50);
    expect(item.qty).toBe(21.6);
    expect(item.total).toBe(1080);
  });
});

describe("calculerLigne — robustesse et ferme", () => {
  const base: LigneDevis = {
    id: "x",
    code: "OCREN-04",
    designation: "ITI",
    unite: "m²",
    puBase: 90,
    gamme: "MOY",
    qteBrute: 10,
    coefQte: 1.08,
    tva: 10,
  };

  it("ferme=true force le coefficient à 1", () => {
    const c = calculerLigne({ ...base, ferme: true });
    expect(c.qteAppliquee).toBe(10);
    expect(c.totalHT).toBe(900);
  });

  it("coefQte/qteBrute invalides ne produisent pas de NaN", () => {
    const c = calculerLigne({
      ...base,
      coefQte: NaN as unknown as number,
      qteBrute: NaN as unknown as number,
    });
    expect(c.qteAppliquee).toBe(0);
    expect(c.totalHT).toBe(0);
  });
});

describe("regrouperParLot — ordre TCE et bucket Divers", () => {
  const L = (code: string, adHoc = false): LigneDevis => ({
    id: code,
    code,
    designation: code,
    unite: "F",
    puBase: 100,
    gamme: "MOY",
    qteBrute: 1,
    coefQte: 1,
    tva: 10,
    adHoc,
  });
  const ordre = (lot: string) => ["DEMO", "RS", "PEINT"].indexOf(lot);

  it("trie les lots selon l'ordre fourni, indépendamment de la saisie", () => {
    const calc = [L("PEINT-01"), L("DEMO-01"), L("RS-01")].map(calculerLigne);
    const lots = regrouperParLot(calc, (l) => l, ordre).map((g) => g.lot);
    expect(lots).toEqual(["DEMO", "RS", "PEINT"]);
  });

  it("regroupe les postes hors BPU sous DIV en fin", () => {
    const calc = [L("AD-HOC", true), L("DEMO-01")].map(calculerLigne);
    const groupes = regrouperParLot(calc, (l) => l, ordre);
    expect(groupes[groupes.length - 1].lot).toBe("DIV");
    expect(groupes[groupes.length - 1].lotTitre).toMatch(/Divers/);
  });
});

describe("calculerSynthese — ratio €/m²", () => {
  it("calcule le ratio HT/surface quand surfaceShab est connue", () => {
    const lignes: LigneDevis[] = [
      { id: "1", code: "OCREN-07", designation: "Réno", unite: "m²", puBase: 1650, gamme: "MOY", qteBrute: 57, coefQte: 1, tva: 10, ferme: true },
    ];
    const s = calculerSynthese(lignes, params({ surfaceShab: 57 }), (l) => l);
    expect(s.htPostes).toBe(94050); // 57 × 1650, sans coef
    expect(s.ratioM2).toBe(1650);
  });

  it("ratio absent sans surface", () => {
    const s = calculerSynthese([], params(), (l) => l);
    expect(s.ratioM2).toBeUndefined();
  });
});

describe("clauseRevisionRequise", () => {
  it("vrai si démarrage > 6 mois après émission", () => {
    expect(clauseRevisionRequise("2026-01-01", "2026-08-01")).toBe(true);
    expect(clauseRevisionRequise("2026-01-01", "2026-05-01")).toBe(false);
    expect(clauseRevisionRequise(undefined, "2026-08-01")).toBe(false);
  });
});

describe("parseDevisUpdate", () => {
  it("round-trip export → import (lignes équivalentes)", () => {
    const lignes: LigneDevis[] = [
      { id: "1", code: "OCREN-04", designation: "ITI", unite: "m²", puBase: 90, gamme: "MOY", qteBrute: 30, coefQte: 1.08, tva: 10 },
    ];
    const out = versDevisUpdate(lignes, params(), (l) => l);
    const txt = `[DEVIS_UPDATE]\n${JSON.stringify(out)}\n[/DEVIS_UPDATE]`;
    const re = parseDevisUpdate(txt);
    expect(re).toHaveLength(1);
    expect(re[0].code).toBe("OCREN-04");
    expect(re[0].puBase).toBe(90); // pu source devient puBase
    expect(re[0].qteBrute).toBe(32.4); // qty déjà chiffré
    expect(re[0].coefQte).toBe(1); // pas de re-majoration
    expect(re[0].tva).toBe(10);
  });

  it("marque AD-HOC et tolère l'absence de bloc", () => {
    const re = parseDevisUpdate(
      JSON.stringify({ lots: [{ items: [{ code: "AD-HOC", unit: "F", qty: 1, pu: 500, tva: 20 }] }] }),
    );
    expect(re[0].adHoc).toBe(true);
    expect(re[0].tva).toBe(20);
  });
});
