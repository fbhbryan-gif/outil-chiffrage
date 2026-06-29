import { describe, expect, it } from "vitest";
import { BPU_PAR_CODE } from "./bpu";
import {
  TEMPLATES_PIECE,
  forfaitsRecouvrantsPresents,
  genererPanier,
  lignesDepuisPanier,
  type ElementPanier,
} from "./templates-piece";
import type { PosteBPU } from "./types";

const poste = (code: string, unite: PosteBPU["unite"]): PosteBPU => ({
  code,
  lot: code.split("-")[0],
  lotTitre: "",
  designation: `Désignation ${code}`,
  unite,
  min: 10,
  moy: 20,
  max: 30,
});

const STUB: Record<string, PosteBPU> = {
  "RS-10": poste("RS-10", "m²"),
  "RS-11": poste("RS-11", "ml"),
  "PLO-07": poste("PLO-07", "U"),
  "EL-33": poste("EL-33", "U"),
};
const getStub = (c: string) => STUB[c];

const sdb = TEMPLATES_PIECE.find((t) => t.id === "sdb")!;

describe("genererPanier", () => {
  it("dérive les quantités par mode géométrique", () => {
    const tpl = {
      id: "t",
      nom: "t",
      elements: [
        { code: "RS-10", geo: "surface" as const },
        { code: "RS-11", geo: "perimetre" as const },
        { code: "PLO-07", geo: "fixe" as const, ratio: 1 },
        { code: "EL-33", geo: "parM2" as const, ratio: 0.5 },
      ],
    };
    const panier = genererPanier(tpl, { surfaceSol: 6, perimetre: 10, hauteur: 2.5 }, getStub);
    const q = (c: string) => panier.find((p) => p.code === c)!.qte;
    expect(q("RS-10")).toBe(6); // surface
    expect(q("RS-11")).toBe(10); // périmètre
    expect(q("PLO-07")).toBe(1); // fixe
    expect(q("EL-33")).toBe(3); // ceil(6 × 0.5)
  });

  it("ignore les codes absents du BPU", () => {
    const tpl = { id: "t", nom: "t", elements: [{ code: "INCONNU-1", geo: "fixe" as const }] };
    expect(genererPanier(tpl, { surfaceSol: 6 }, getStub)).toHaveLength(0);
  });
});

describe("lignesDepuisPanier", () => {
  it("multiplie par le nombre d'occurrences et applique la zone", () => {
    const sel: ElementPanier[] = [
      { code: "RS-10", designation: "x", unite: "m²", qte: 6, coche: true },
      { code: "RS-11", designation: "y", unite: "ml", qte: 10, coche: false }, // décoché
    ];
    const lignes = lignesDepuisPanier(sel, 3, "SDB étage", (code, qte) => ({
      id: code + qte,
      code,
      designation: code,
      unite: "m²",
      puBase: 0,
      gamme: "MOY",
      qteBrute: qte,
      coefQte: 1,
      tva: 10,
    }));
    // 1 poste coché × 3 occurrences
    expect(lignes).toHaveLength(3);
    expect(lignes.every((l) => l.zone === "SDB étage")).toBe(true);
    expect(lignes.every((l) => l.groupeClient === "SDB étage")).toBe(true);
  });
});

describe("intégrité des templates (codes réels)", () => {
  it("la SDB référence au moins 12 postes existants dans le BPU", () => {
    const panier = genererPanier(
      sdb,
      { surfaceSol: 6, perimetre: 10, hauteur: 2.5 },
      (c) => BPU_PAR_CODE.get(c),
    );
    expect(panier.length).toBeGreaterThanOrEqual(12);
  });

  it("tous les templates résolvent une majorité de leurs codes", () => {
    for (const t of TEMPLATES_PIECE) {
      const panier = genererPanier(t, { surfaceSol: 10 }, (c) => BPU_PAR_CODE.get(c));
      expect(panier.length).toBeGreaterThanOrEqual(Math.ceil(t.elements.length * 0.6));
    }
  });

  it("cohérence geo↔unité : perimetre⇒ml, surface/murs/plafond⇒m²", () => {
    const attendu: Record<string, string> = {
      perimetre: "ml",
      surface: "m²",
      murs: "m²",
      plafond: "m²",
    };
    for (const t of TEMPLATES_PIECE) {
      for (const el of t.elements) {
        const u = attendu[el.geo];
        if (!u) continue; // fixe / parM2 : unité libre
        const poste = BPU_PAR_CODE.get(el.code);
        if (!poste) continue;
        expect(poste.unite, `${t.id}/${el.code} geo=${el.geo}`).toBe(u);
      }
    }
  });
});

describe("forfaitsRecouvrantsPresents (anti-double-comptage)", () => {
  it("détecte le forfait recouvrant présent au devis", () => {
    expect(forfaitsRecouvrantsPresents("cuisine_pro", ["OCERP-10", "RS-21"])).toEqual([
      "OCERP-10",
    ]);
    expect(forfaitsRecouvrantsPresents("salle_reunion", ["OCTER-01"])).toEqual(["OCTER-01"]);
  });
  it("rien si aucun forfait recouvrant n'est présent", () => {
    expect(forfaitsRecouvrantsPresents("cuisine_pro", ["RS-21", "CHR-01"])).toHaveLength(0);
    expect(forfaitsRecouvrantsPresents("inconnu", ["OCERP-10"])).toHaveLength(0);
  });
});
