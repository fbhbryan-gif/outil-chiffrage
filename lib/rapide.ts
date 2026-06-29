// Mode rapide — génération d'un chiffrage en ouvrages complets (Guide §8.1).
// Logique pure et testable : un input (type de projet, surface, gamme, postes
// cochés avec quantités) -> des lignes de devis fondées sur OCREN-* / OCMOB-*.
//
// Le mode rapide ne descend JAMAIS au poste élémentaire : un forfait par grand
// poste, à raffiner ensuite en mode détaillé.

import { ligneDepuisPoste } from "./engine";
import type {
  Gamme,
  LigneDevis,
  ParametresDevis,
  PosteBPU,
  TauxTVA,
} from "./types";

/** Type de projet proposé en mode rapide. */
export type TypeProjetRapide =
  | "renovation_appartement"
  | "renovation_maison"
  | "renovation_energetique"
  | "renovation_studio"
  | "extension"
  | "surelevation"
  | "erp"
  | "neuf";

export const TYPES_PROJET: { value: TypeProjetRapide; label: string }[] = [
  { value: "renovation_appartement", label: "Rénovation appartement" },
  { value: "renovation_maison", label: "Rénovation maison" },
  { value: "renovation_studio", label: "Studio / locatif éco" },
  { value: "renovation_energetique", label: "Rénovation énergétique" },
  { value: "extension", label: "Extension" },
  { value: "surelevation", label: "Surélévation" },
  { value: "erp", label: "ERP / local pro" },
  { value: "neuf", label: "Construction neuve" },
];

/** Un ouvrage complet sélectionnable en mode rapide. */
export interface OuvrageRapide {
  /** Code BPU (ouvrage complet). */
  code: string;
  /** Libellé court orienté client. */
  label: string;
  /** Groupe d'affichage dans le wizard. */
  groupe: string;
  /** Aide à la saisie (ex. "m² de la pièce"). */
  aide: string;
  /** Types de projet pour lesquels l'ouvrage est proposé. */
  pour: TypeProjetRapide[];
  /** Quantité proposée par défaut à partir de la surface SHAB. */
  qteDefaut: (shab: number) => number;
  /** Coché par défaut à l'ouverture du wizard. */
  coche?: boolean;
}

const RENO: TypeProjetRapide[] = [
  "renovation_appartement",
  "renovation_maison",
  "renovation_studio",
  "erp",
];

/** Ouvrages d'amélioration énergétique, proposés au projet "énergétique". */
const ENERGETIQUE: TypeProjetRapide = "renovation_energetique";

/**
 * Catalogue des ouvrages complets du mode rapide.
 * Ne référence que des codes présents dans le BPU (OCREN-*, OCMOB-*).
 */
export const OUVRAGES_RAPIDE: OuvrageRapide[] = [
  {
    code: "OCREN-07",
    label: "Rénovation globale (hors cuisine & SDB)",
    groupe: "Global",
    aide: "m² SHAB concernés",
    pour: RENO,
    qteDefaut: (s) => s,
    coche: true,
  },
  {
    code: "OCREN-06",
    label: "Réfection pièce de vie",
    groupe: "Pièces",
    aide: "m² de la pièce",
    pour: RENO,
    qteDefaut: () => 0,
  },
  {
    code: "OCREN-01",
    label: "Salle de bains clé en main",
    groupe: "Pièces",
    aide: "m² de SDB (cumul)",
    pour: RENO,
    qteDefaut: () => 5,
  },
  {
    code: "OCREN-02",
    label: "Cuisine clé en main",
    groupe: "Pièces",
    aide: "ml de meubles",
    pour: RENO,
    qteDefaut: () => 4,
  },
  {
    code: "OCREN-03",
    label: "WC complet",
    groupe: "Pièces",
    aide: "nombre de WC",
    pour: RENO,
    qteDefaut: () => 1,
  },
  {
    code: "OCREN-13",
    label: "Salle de bains PMR sécurisée clé en main",
    groupe: "Pièces",
    aide: "nombre de SDB PMR",
    pour: RENO,
    qteDefaut: () => 0,
  },
  {
    code: "OCREN-04",
    label: "Isolation intérieure (ITI)",
    groupe: "Enveloppe",
    aide: "m² de murs",
    pour: [...RENO, ENERGETIQUE],
    qteDefaut: () => 0,
  },
  {
    code: "OCREN-05",
    label: "Isolation extérieure (ITE)",
    groupe: "Enveloppe",
    aide: "m² de façade",
    pour: ["renovation_maison", ENERGETIQUE],
    qteDefaut: () => 0,
  },
  {
    code: "OCREN-09",
    label: "Ravalement de façade",
    groupe: "Enveloppe",
    aide: "m² de façade",
    pour: ["renovation_maison", ENERGETIQUE],
    qteDefaut: () => 0,
  },
  {
    code: "OCREN-10",
    label: "Remplacement menuiseries extérieures",
    groupe: "Enveloppe",
    aide: "m² de menuiseries",
    pour: [...RENO, ENERGETIQUE],
    qteDefaut: () => 0,
  },
  {
    code: "OCREN-11",
    label: "Électricité complète (mise aux normes)",
    groupe: "Lots techniques",
    aide: "m² SHAB",
    pour: RENO,
    qteDefaut: () => 0,
  },
  {
    code: "OCREN-12",
    label: "Plomberie complète",
    groupe: "Lots techniques",
    aide: "m² SHAB",
    pour: RENO,
    qteDefaut: () => 0,
  },
  {
    code: "OCREN-14",
    label: "Chauffage PAC air-eau clé en main",
    groupe: "Lots techniques",
    aide: "nombre d'installations",
    pour: [...RENO, ENERGETIQUE],
    qteDefaut: () => 0,
  },
  {
    code: "OCREN-08",
    label: "Mur porteur — création d'ouverture",
    groupe: "Structure",
    aide: "nombre d'ouvertures",
    pour: RENO,
    qteDefaut: () => 1,
  },
  {
    code: "OCMOB-09",
    label: "Extension MOB — hors d'eau / hors d'air",
    groupe: "Extension ossature bois",
    aide: "m² SHON",
    pour: ["extension"],
    qteDefaut: (s) => s,
    coche: true,
  },
  {
    code: "OCMOB-10",
    label: "Extension MOB — clé en main TCE",
    groupe: "Extension ossature bois",
    aide: "m² SHON",
    pour: ["extension", "neuf"],
    qteDefaut: (s) => s,
  },
  {
    code: "OCMOB-11",
    label: "Surélévation MOB — hors d'eau / hors d'air",
    groupe: "Surélévation ossature bois",
    aide: "m² SHON",
    pour: ["surelevation"],
    qteDefaut: (s) => s,
    coche: true,
  },
  {
    code: "OCMOB-12",
    label: "Surélévation MOB — clé en main TCE",
    groupe: "Surélévation ossature bois",
    aide: "m² SHON",
    pour: ["surelevation"],
    qteDefaut: (s) => s,
  },
];

/**
 * Ouvrages proposés pour un type de projet donné.
 * Repli sur tout le catalogue si aucun ouvrage spécifique (robustesse).
 */
export function ouvragesPourType(type: TypeProjetRapide): OuvrageRapide[] {
  const filtres = OUVRAGES_RAPIDE.filter((o) => o.pour.includes(type));
  return filtres.length > 0 ? filtres : OUVRAGES_RAPIDE;
}

/** Types de rénovation de logement existant (TVA réduite éligible). */
const TYPES_RENO_LOGEMENT: TypeProjetRapide[] = [
  "renovation_appartement",
  "renovation_maison",
  "renovation_studio",
  "renovation_energetique",
];

/** TVA par défaut suggérée selon le type de projet (Guide §2.1). */
export function tvaSuggeree(type: TypeProjetRapide): TauxTVA {
  // Énergétique = 5,5 % ; rénovation logement = 10 % ; neuf/extension/pro = 20 %.
  if (type === "renovation_energetique") return 5.5;
  if (TYPES_RENO_LOGEMENT.includes(type)) return 10;
  return 20;
}

/** Ouvrages d'amélioration énergétique (TVA 5,5 % si seuls, Guide §2.1). */
export const CODES_ENERGETIQUES = new Set([
  "OCREN-04", // ITI
  "OCREN-05", // ITE
  "OCREN-09", // ravalement isolant
  "OCREN-10", // menuiseries isolantes
  "OCREN-14", // PAC air-eau
]);

/**
 * TVA suggérée en tenant compte de la sélection : 5,5 % si le chantier est
 * exclusivement énergétique (ITI/ITE/ravalement isolant), sinon règle par type.
 */
export function tvaSuggereeSelection(
  type: TypeProjetRapide,
  codesActifs: string[],
): TauxTVA {
  if (
    TYPES_RENO_LOGEMENT.includes(type) &&
    codesActifs.length > 0 &&
    codesActifs.every((c) => CODES_ENERGETIQUES.has(c))
  ) {
    return 5.5;
  }
  return tvaSuggeree(type);
}

/** Ouvrages dont le périmètre recouvre celui d'un autre (risque double-comptage). */
const RECOUVREMENTS: Record<string, string[]> = {
  // La rénovation globale au m² SHAB recouvre déjà la pièce de vie et les
  // lots techniques pris séparément.
  "OCREN-07": ["OCREN-06", "OCREN-11", "OCREN-12"],
  // Les forfaits "clé en main TCE" englobent leur variante hors d'eau/hors d'air.
  "OCMOB-10": ["OCMOB-09"],
  "OCMOB-12": ["OCMOB-11"],
};

/**
 * Détecte les paires d'ouvrages cochés au périmètre recouvrant.
 * Retourne des messages d'alerte (non bloquants) pour l'UI.
 */
export function detecterRecouvrements(codesActifs: string[]): string[] {
  const set = new Set(codesActifs);
  const msgs: string[] = [];
  for (const [code, recouvre] of Object.entries(RECOUVREMENTS)) {
    if (!set.has(code)) continue;
    for (const r of recouvre) {
      if (set.has(r)) {
        const a = OUVRAGES_RAPIDE.find((o) => o.code === code)?.label ?? code;
        const b = OUVRAGES_RAPIDE.find((o) => o.code === r)?.label ?? r;
        msgs.push(`« ${a} » recouvre déjà « ${b} » — risque de double-comptage.`);
      }
    }
  }
  return msgs;
}

/** Sélection d'un ouvrage en mode rapide (code + quantité saisie). */
export interface SelectionRapide {
  code: string;
  qte: number;
}

/**
 * Génère les lignes de devis à partir des ouvrages sélectionnés.
 * `getPoste` résout un code BPU en poste (injecté pour rester pur/testable).
 * Les ouvrages à quantité nulle ou introuvables sont ignorés.
 */
export function genererLignesRapide(
  selections: SelectionRapide[],
  params: ParametresDevis,
  getPoste: (code: string) => PosteBPU | undefined,
): LigneDevis[] {
  const lignes: LigneDevis[] = [];
  for (const sel of selections) {
    if (!sel.qte || sel.qte <= 0) continue;
    const poste = getPoste(sel.code);
    if (!poste) continue;
    const ligne = ligneDepuisPoste(poste, params, sel.qte);
    // Ouvrage complet clé en main = quantité ferme : pas de coef conservateur.
    ligne.coefQte = 1;
    ligne.ferme = true;
    lignes.push(ligne);
  }
  return lignes;
}

/** Construit les sélections par défaut pour un type de projet + surface. */
export function selectionsDefaut(
  type: TypeProjetRapide,
  shab: number,
): Record<string, { actif: boolean; qte: number }> {
  const out: Record<string, { actif: boolean; qte: number }> = {};
  for (const o of ouvragesPourType(type)) {
    out[o.code] = { actif: !!o.coche, qte: o.qteDefaut(shab) };
  }
  return out;
}

// Réexport pour confort d'import côté UI.
export type { Gamme };
