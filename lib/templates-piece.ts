// Templates de pièce — chiffrage avancé par SÉLECTION DE CHOIX + quantités par
// élément (Guide §8.2 étendu). À partir d'un TYPE de pièce et de ses dimensions,
// on génère un panier de postes BPU pré-cochés, chacun avec sa quantité dérivée
// (sol = surface, plinthes = périmètre, murs = périmètre × hauteur, ou compté à
// l'unité). L'utilisateur ajuste puis ajoute la sélection en une fois.
//
// Tous les codes référencés DOIVENT exister dans le BPU (sinon ignorés) :
// ce module n'invente aucun prix.

import { round2 } from "./engine";
import { quantitesLiees, type DimsPiece } from "./pieces";
import type { LigneDevis, PosteBPU } from "./types";

/** Mode de dérivation de la quantité d'un élément depuis la géométrie. */
export type Geo = "surface" | "perimetre" | "murs" | "plafond" | "parM2" | "fixe";

export interface ElementPiece {
  code: string;
  geo: Geo;
  /** Pour 'parM2' : nb par m² (ex. 0.5 = 1 pour 2 m²). Pour 'fixe' : la quantité. */
  ratio?: number;
  /** Décoché par défaut si false. */
  coche?: boolean;
}

export interface TemplatePiece {
  id: string;
  nom: string;
  /** Aide affichée. */
  note?: string;
  elements: ElementPiece[];
}

/** Un poste du panier, prêt à présenter/éditer puis ajouter. */
export interface ElementPanier {
  code: string;
  designation: string;
  unite: string;
  qte: number;
  coche: boolean;
}

/**
 * Catalogue des types de pièce. Codes vérifiés présents dans data/bpu.json.
 * Quantités : surface=sol, perimetre=plinthes/gorge, murs=périmètre×hauteur,
 * plafond=sol, parM2=ceil(sol×ratio), fixe=ratio (compté à l'unité).
 */
export const TEMPLATES_PIECE: TemplatePiece[] = [
  {
    id: "sdb",
    nom: "Salle de bains",
    note: "Douche, vasque, WC suspendu, faïence, étanchéité, VMC, spots IP65.",
    elements: [
      { code: "RS-08", geo: "surface" }, // ragréage
      { code: "RS-10", geo: "surface" }, // carrelage sol
      { code: "RS-11", geo: "perimetre" }, // plinthe carrelage
      { code: "CLO-28", geo: "surface" }, // faux-plafond hydrofuge
      { code: "CLO-11", geo: "fixe", ratio: 1 }, // cloison hydro
      { code: "PLO-16", geo: "fixe", ratio: 1 }, // étanchéité douche
      { code: "RM-03", geo: "fixe", ratio: 1 }, // faïence douche
      { code: "PLO-10", geo: "fixe", ratio: 1 }, // receveur
      { code: "PLO-25", geo: "fixe", ratio: 1 }, // paroi douche
      { code: "PLO-28", geo: "fixe", ratio: 1 }, // meuble vasque
      { code: "PLO-08", geo: "fixe", ratio: 1 }, // mitigeur lavabo
      { code: "PLO-07", geo: "fixe", ratio: 1 }, // WC suspendu
      { code: "CLO-17", geo: "fixe", ratio: 1 }, // bâti Geberit
      { code: "RM-01", geo: "fixe", ratio: 1 }, // faïence WC
      { code: "PLO-76", geo: "fixe", ratio: 1 }, // sèche-serviettes
      { code: "PLO-01", geo: "fixe", ratio: 1 }, // VMC conduit
      { code: "EL-33", geo: "parM2", ratio: 0.5 }, // spots IP65
      { code: "EL-12", geo: "fixe", ratio: 1 }, // double prise
      { code: "EL-22", geo: "fixe", ratio: 1 }, // interrupteur
    ],
  },
  {
    id: "cuisine",
    nom: "Cuisine",
    note: "Meubles Atelier Blanc, plan, crédence, évier, lignes spécialisées, VMC. Électroménager à cocher selon besoin.",
    elements: [
      { code: "RS-08", geo: "surface" }, // ragréage
      { code: "RS-10", geo: "surface" }, // carrelage sol
      { code: "CLO-15", geo: "surface" }, // faux-plafond cuisine
      { code: "RM-19", geo: "murs" }, // peinture murs
      { code: "AGEN-06", geo: "fixe", ratio: 4 }, // meubles (ml, à ajuster)
      { code: "AGEN-25", geo: "fixe", ratio: 4 }, // plan de travail
      { code: "AGEN-27", geo: "fixe", ratio: 3 }, // crédence
      { code: "PLO-96", geo: "fixe", ratio: 1 }, // évier
      { code: "PLO-97", geo: "fixe", ratio: 1 }, // mitigeur cuisine
      { code: "EL-16", geo: "fixe", ratio: 1 }, // prise 32A plaque
      { code: "EL-15", geo: "fixe", ratio: 2 }, // prises spécialisées four/LV
      { code: "EL-12", geo: "fixe", ratio: 2 }, // doubles prises plan
      { code: "EL-32", geo: "parM2", ratio: 0.4 }, // spots
      { code: "PLO-03", geo: "fixe", ratio: 1 }, // VMC
      // Électroménager (décoché par défaut — à sélectionner)
      { code: "EM-01", geo: "fixe", ratio: 1, coche: false }, // four
      { code: "EM-02", geo: "fixe", ratio: 1, coche: false }, // induction
      { code: "EM-03", geo: "fixe", ratio: 1, coche: false }, // hotte
      { code: "EM-04", geo: "fixe", ratio: 1, coche: false }, // lave-vaisselle
      { code: "EM-05", geo: "fixe", ratio: 1, coche: false }, // frigo
    ],
  },
  {
    id: "sdb_pmr",
    nom: "SDB PMR / douche sécurisée",
    note: "Douche italienne plain-pied, barres d'appui, siège, WC surélevé, mitigeur thermostatique, sol antidérapant.",
    elements: [
      { code: "PLO-101", geo: "fixe", ratio: 1 }, // dépose baignoire
      { code: "RS-08", geo: "surface" }, // ragréage
      { code: "RS-22", geo: "surface" }, // carrelage antidérapant R11
      { code: "RS-25", geo: "perimetre" }, // remontée à gorge
      { code: "CLO-28", geo: "surface" }, // faux-plafond hydro
      { code: "PLO-16", geo: "fixe", ratio: 1 }, // étanchéité
      { code: "PLO-92", geo: "fixe", ratio: 1 }, // douche italienne plain-pied
      { code: "RM-03", geo: "fixe", ratio: 1 }, // faïence douche
      { code: "PLO-90", geo: "fixe", ratio: 2 }, // barres d'appui (×2)
      { code: "PLO-91", geo: "fixe", ratio: 1 }, // siège de douche
      { code: "PLO-94", geo: "fixe", ratio: 1 }, // mitigeur thermostatique
      { code: "PLO-28", geo: "fixe", ratio: 1 }, // meuble vasque
      { code: "PLO-08", geo: "fixe", ratio: 1 }, // mitigeur lavabo
      { code: "PLO-93", geo: "fixe", ratio: 1 }, // WC surélevé PMR
      { code: "PLO-01", geo: "fixe", ratio: 1 }, // VMC
      { code: "EL-33", geo: "parM2", ratio: 0.5 }, // spots IP65
    ],
  },
  {
    id: "wc",
    nom: "WC",
    note: "WC suspendu, bâti, faïence, sol, VMC.",
    elements: [
      { code: "PLO-07", geo: "fixe", ratio: 1 },
      { code: "CLO-17", geo: "fixe", ratio: 1 },
      { code: "RM-01", geo: "fixe", ratio: 1 },
      { code: "RS-05", geo: "surface" },
      { code: "RS-11", geo: "perimetre" },
      { code: "PLO-01", geo: "fixe", ratio: 1 },
      { code: "EL-03", geo: "fixe", ratio: 1 },
      { code: "EL-11", geo: "fixe", ratio: 1 },
    ],
  },
  {
    id: "chambre",
    nom: "Chambre",
    note: "Parquet, plinthes, peinture murs + plafond, prises, points lumineux.",
    elements: [
      { code: "RS-08", geo: "surface" },
      { code: "RS-09", geo: "surface" }, // parquet
      { code: "RS-04", geo: "perimetre" }, // plinthe MDF
      { code: "RM-15", geo: "murs" }, // peinture murs
      { code: "RM-16", geo: "plafond" }, // peinture plafond
      { code: "EL-12", geo: "parM2", ratio: 0.3 }, // prises
      { code: "EL-03", geo: "fixe", ratio: 1 },
      { code: "EL-24", geo: "fixe", ratio: 1 },
    ],
  },
  {
    id: "sejour",
    nom: "Séjour / pièce de vie",
    note: "Parquet, plinthes, peinture, davantage de prises et d'éclairage.",
    elements: [
      { code: "RS-08", geo: "surface" },
      { code: "RS-09", geo: "surface" },
      { code: "RS-04", geo: "perimetre" },
      { code: "RM-19", geo: "murs" }, // peinture murs séjour
      { code: "RM-16", geo: "plafond" },
      { code: "EL-12", geo: "parM2", ratio: 0.4 },
      { code: "EL-03", geo: "parM2", ratio: 0.2 },
      { code: "EL-29", geo: "fixe", ratio: 1 }, // RJ45
    ],
  },
  {
    id: "haussmannien",
    nom: "Pièce haussmannienne",
    note: "Parquet point de Hongrie, plinthe moulurée, corniche, rosace, peinture grande hauteur, cheminée marbre protégée.",
    elements: [
      { code: "RS-08", geo: "surface" }, // ragréage
      { code: "RS-16", geo: "surface" }, // parquet point de Hongrie
      { code: "RS-27", geo: "perimetre" }, // plinthe moulurée
      { code: "STAFF-01", geo: "perimetre" }, // corniche restaurée
      { code: "STAFF-03", geo: "fixe", ratio: 1 }, // rosace
      { code: "RM-15", geo: "murs" }, // peinture murs
      { code: "RM-16", geo: "plafond" }, // peinture plafond
      { code: "PIE-01", geo: "fixe", ratio: 1 }, // protection cheminée marbre
      { code: "EL-12", geo: "parM2", ratio: 0.3 }, // prises
      { code: "EL-03", geo: "fixe", ratio: 1 }, // point lumineux
    ],
  },
  {
    id: "cabine",
    nom: "Cabine d'essayage (ERP)",
    note: "Micro-pièce répétitive — utilisez ×N pour le nombre de cabines.",
    elements: [
      { code: "CLO-10", geo: "fixe", ratio: 1 }, // cloison
      { code: "EL-03", geo: "fixe", ratio: 1 }, // point lumineux
      { code: "EL-12", geo: "fixe", ratio: 1 }, // prise
      { code: "AGEN-34", geo: "fixe", ratio: 1 }, // tablette/patère
    ],
  },
  {
    id: "salle_soin",
    nom: "Salle de soin (ERP santé)",
    note: "Sol PVC à gorge, électricité dédiée, éclairage — utilisez ×N pour plusieurs salles identiques.",
    elements: [
      { code: "RS-08", geo: "surface" }, // ragréage
      { code: "RS-23", geo: "surface" }, // PVC hospitalier
      { code: "RS-25", geo: "perimetre" }, // remontée à gorge
      { code: "EL-02", geo: "parM2", ratio: 0.5 }, // PC
      { code: "EL-03", geo: "parM2", ratio: 0.4 }, // éclairage
      { code: "EL-29", geo: "fixe", ratio: 1 }, // RJ45
    ],
  },
];

/** Quantité d'un élément selon son mode géométrique. */
function qteElement(el: ElementPiece, q: ReturnType<typeof quantitesLiees>): number {
  switch (el.geo) {
    case "surface":
      return q.sol;
    case "perimetre":
      return q.perimetre;
    case "murs":
      return q.murs;
    case "plafond":
      return q.plafond;
    case "parM2":
      return Math.max(1, Math.ceil(q.sol * (el.ratio ?? 0.5)));
    case "fixe":
    default:
      return el.ratio ?? 1;
  }
}

/**
 * Génère le panier de postes d'un template pour des dimensions données.
 * `getPoste` résout un code en poste BPU ; les codes absents sont ignorés.
 */
export function genererPanier(
  template: TemplatePiece,
  dims: DimsPiece,
  getPoste: (code: string) => PosteBPU | undefined,
): ElementPanier[] {
  const q = quantitesLiees(dims);
  const out: ElementPanier[] = [];
  for (const el of template.elements) {
    const poste = getPoste(el.code);
    if (!poste) continue;
    out.push({
      code: el.code,
      designation: poste.designation,
      unite: poste.unite,
      qte: round2(qteElement(el, q)),
      coche: el.coche !== false,
    });
  }
  return out;
}

/** Construit les lignes de devis à ajouter à partir d'une sélection de panier. */
export function lignesDepuisPanier(
  selection: ElementPanier[],
  occurrences: number,
  zone: string,
  ligneFromCode: (code: string, qte: number) => LigneDevis | null,
): LigneDevis[] {
  const n = Math.max(1, Math.floor(occurrences || 1));
  const lignes: LigneDevis[] = [];
  for (let i = 0; i < n; i++) {
    for (const el of selection) {
      if (!el.coche || !(el.qte > 0)) continue;
      const ligne = ligneFromCode(el.code, el.qte);
      if (!ligne) continue;
      if (zone) {
        ligne.zone = zone;
        ligne.groupeClient = zone;
      }
      lignes.push(ligne);
    }
  }
  return lignes;
}
