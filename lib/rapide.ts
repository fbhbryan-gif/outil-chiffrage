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
  | "renovation_studio"
  | "renovation_haussmannien"
  | "renovation_energetique"
  | "adaptation_pmr"
  | "extension"
  | "surelevation"
  | "neuf_maconne"
  | "amenagement_commercial"
  | "chr_restaurant"
  | "amenagement_tertiaire"
  | "erp_sante"
  // Conservés pour compatibilité (anciens devis) ; non affichés.
  | "erp"
  | "neuf";

export const TYPES_PROJET: { value: TypeProjetRapide; label: string }[] = [
  { value: "renovation_appartement", label: "Rénovation appartement" },
  { value: "renovation_maison", label: "Rénovation maison" },
  { value: "renovation_studio", label: "Studio / locatif éco" },
  { value: "renovation_haussmannien", label: "Haussmannien / patrimonial" },
  { value: "renovation_energetique", label: "Rénovation énergétique" },
  { value: "adaptation_pmr", label: "Adaptation PMR / senior" },
  { value: "extension", label: "Extension" },
  { value: "surelevation", label: "Surélévation" },
  { value: "neuf_maconne", label: "Maison neuve maçonnée" },
  { value: "amenagement_commercial", label: "Commerce / boutique (ERP)" },
  { value: "chr_restaurant", label: "CHR / Restaurant (ERP)" },
  { value: "amenagement_tertiaire", label: "Bureaux / tertiaire" },
  { value: "erp_sante", label: "ERP de santé (cabinet)" },
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
  "renovation_haussmannien",
  "adaptation_pmr",
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
  {
    code: "OCREN-15",
    label: "Rénovation patrimoniale / haussmannienne complète",
    groupe: "Global",
    aide: "m² SHAB concernés",
    pour: ["renovation_haussmannien"],
    qteDefaut: (s) => s,
    coche: true,
  },
  {
    code: "OCERP-01",
    label: "Aménagement boutique / retail clé en main",
    groupe: "Commerce / ERP",
    aide: "m² de surface",
    pour: ["amenagement_commercial"],
    qteDefaut: (s) => s,
    coche: true,
  },
  {
    code: "OCERP-02",
    label: "Local commercial coque nue → prêt à exploiter",
    groupe: "Commerce / ERP",
    aide: "m² de surface",
    pour: ["amenagement_commercial"],
    qteDefaut: () => 0,
  },
  {
    code: "OCERP-03",
    label: "Mise en accessibilité PMR (ERP existant)",
    groupe: "Accessibilité ERP",
    aide: "forfait",
    pour: ["amenagement_commercial", "chr_restaurant", "erp_sante", "adaptation_pmr"],
    qteDefaut: () => 0,
  },
  {
    code: "OCERP-10",
    label: "Cuisine professionnelle CHR clé en main",
    groupe: "CHR / Restaurant",
    aide: "m² de cuisine",
    pour: ["chr_restaurant"],
    qteDefaut: (s) => s,
    coche: true,
  },
  {
    code: "OCERP-11",
    label: "Sanitaires publics ERP H/F + PMR",
    groupe: "CHR / Restaurant",
    aide: "nombre de blocs",
    pour: ["chr_restaurant", "amenagement_commercial", "erp_sante"],
    qteDefaut: () => 1,
  },
  {
    code: "OCERP-20",
    label: "Salle de soin clé en main",
    groupe: "ERP santé",
    aide: "m² (cumul des salles)",
    pour: ["erp_sante"],
    qteDefaut: (s) => s,
    coche: true,
  },
  {
    code: "OCMAC-01",
    label: "Maison maçonnée — hors d'eau / hors d'air",
    groupe: "Maison maçonnée",
    aide: "m² SHAB",
    pour: ["neuf_maconne"],
    qteDefaut: (s) => s,
    coche: true,
  },
  {
    code: "OCMAC-02",
    label: "Maison maçonnée — clé en main TCE",
    groupe: "Maison maçonnée",
    aide: "m² SHAB",
    pour: ["neuf_maconne"],
    qteDefaut: (s) => s,
  },
  {
    code: "OCTER-01",
    label: "Aménagement plateau de bureaux clé en main",
    groupe: "Tertiaire / bureaux",
    aide: "m² de plateau",
    pour: ["amenagement_tertiaire"],
    qteDefaut: (s) => s,
    coche: true,
  },
  {
    code: "OCTER-10",
    label: "Kitchenette / tisanerie tertiaire",
    groupe: "Tertiaire / bureaux",
    aide: "nombre",
    pour: ["amenagement_tertiaire"],
    qteDefaut: () => 0,
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
  "renovation_haussmannien",
  "renovation_energetique",
  "adaptation_pmr",
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
  "OCREN-10", // menuiseries isolantes
  "OCREN-14", // PAC air-eau
  // OCREN-09 (ravalement non isolant) EXCLU : relève du 10 %, pas du 5,5 %.
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
  "OCMAC-02": ["OCMAC-01"],
  // La réno haussmannienne complète recouvre la réno globale standard.
  "OCREN-15": ["OCREN-07"],
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
    // Énergétique : pré-cocher l'ITI pour ne pas ouvrir le wizard sans aucun poste.
    const actif =
      !!o.coche || (type === "renovation_energetique" && o.code === "OCREN-04");
    out[o.code] = { actif, qte: o.qteDefaut(shab) };
  }
  return out;
}

// Réexport pour confort d'import côté UI.
export type { Gamme };
