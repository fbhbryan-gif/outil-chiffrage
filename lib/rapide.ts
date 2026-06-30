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
  /** Sous-bloc à l'intérieur d'un groupe (sous-titre). */
  sousGroupe?: string;
  /**
   * Identifiant de sous-choix : les ouvrages partageant le même sousChoixId
   * (dans un même type) sont MUTUELLEMENT EXCLUSIFS (rendus en radio).
   */
  sousChoixId?: string;
  /** Éligible TVA 5,5 % (amélioration énergétique). Prioritaire sur le set legacy. */
  eligible55?: boolean;
}

const RENO: TypeProjetRapide[] = [
  "renovation_appartement",
  "renovation_maison",
  "renovation_studio",
];

/** Rénovations logement + variantes patrimoniale/PMR (pour les pièces communes). */
const RENO_PLUS: TypeProjetRapide[] = [
  ...RENO,
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
    pour: ["renovation_appartement", "renovation_maison"],
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
    pour: RENO_PLUS,
    qteDefaut: () => 5,
  },
  {
    code: "OCREN-02",
    label: "Cuisine clé en main",
    groupe: "Pièces",
    aide: "ml de meubles",
    pour: RENO_PLUS,
    qteDefaut: () => 4,
  },
  {
    code: "OCREN-03",
    label: "WC complet",
    groupe: "Pièces",
    aide: "nombre de WC",
    pour: RENO_PLUS,
    qteDefaut: () => 1,
  },
  {
    code: "OCREN-13",
    label: "Salle de bains PMR sécurisée clé en main",
    groupe: "Pièces",
    aide: "nombre de SDB PMR",
    pour: RENO_PLUS,
    qteDefaut: () => 1,
  },
  {
    code: "OCREN-04",
    label: "Isolation intérieure (ITI)",
    groupe: "Enveloppe",
    sousGroupe: "Isolation des murs",
    sousChoixId: "iso-murs",
    eligible55: true,
    aide: "m² de murs",
    pour: [...RENO, ENERGETIQUE],
    qteDefaut: (s) => s, // ≈ surface de murs (à ajuster), évite la coche sans quantité
  },
  {
    code: "OCREN-05",
    label: "Isolation extérieure (ITE)",
    groupe: "Enveloppe",
    sousGroupe: "Isolation des murs",
    sousChoixId: "iso-murs",
    eligible55: true,
    aide: "m² de façade",
    pour: ["renovation_maison", ENERGETIQUE],
    qteDefaut: () => 0,
  },
  {
    code: "OCREN-09",
    label: "Ravalement de façade",
    groupe: "Enveloppe",
    aide: "m² de façade",
    pour: ["renovation_maison"], // non isolant -> hors énergétique (ne casse plus la TVA 5,5)
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
    label: "PAC air-eau clé en main",
    groupe: "Lots techniques",
    sousGroupe: "Chauffage",
    sousChoixId: "chauffage",
    eligible55: true,
    aide: "nombre d'installations",
    pour: [...RENO, ENERGETIQUE],
    qteDefaut: () => 0,
  },
  {
    code: "CVC-96",
    label: "Radiateurs gaz / élec (remplacement)",
    groupe: "Lots techniques",
    sousGroupe: "Chauffage",
    sousChoixId: "chauffage",
    aide: "logement",
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
    label: "Ossature bois — hors d'eau / hors d'air",
    groupe: "Extension ossature bois",
    sousGroupe: "Structure & finition (1 au choix)",
    sousChoixId: "ext-fin",
    aide: "m² SHON",
    pour: ["extension"],
    qteDefaut: (s) => s,
  },
  {
    code: "OCMOB-10",
    label: "Ossature bois — clé en main TCE (tuiles)",
    groupe: "Extension ossature bois",
    sousGroupe: "Structure & finition (1 au choix)",
    sousChoixId: "ext-fin",
    aide: "m² SHON",
    pour: ["extension"],
    qteDefaut: (s) => s,
    coche: true,
  },
  {
    code: "OCMOB-16",
    label: "Ossature bois — clé en main TCE (zinc)",
    groupe: "Extension ossature bois",
    sousGroupe: "Structure & finition (1 au choix)",
    sousChoixId: "ext-fin",
    aide: "m² SHON",
    pour: ["extension"],
    qteDefaut: (s) => s,
  },
  {
    code: "OCMOB-15",
    label: "Ossature bois — clé en main TCE (toit-terrasse)",
    groupe: "Extension ossature bois",
    sousGroupe: "Structure & finition (1 au choix)",
    sousChoixId: "ext-fin",
    aide: "m² SHON",
    pour: ["extension"],
    qteDefaut: (s) => s,
  },
  {
    code: "OCMAC-04",
    label: "Maçonnée — hors d'eau / hors d'air",
    groupe: "Extension ossature bois",
    sousGroupe: "Structure & finition (1 au choix)",
    sousChoixId: "ext-fin",
    aide: "m² SHON",
    pour: ["extension"],
    qteDefaut: (s) => s,
  },
  {
    code: "OCMAC-03",
    label: "Maçonnée — clé en main TCE",
    groupe: "Extension ossature bois",
    sousGroupe: "Structure & finition (1 au choix)",
    sousChoixId: "ext-fin",
    aide: "m² SHON",
    pour: ["extension"],
    qteDefaut: (s) => s,
  },
  {
    code: "OCMOB-19",
    label: "Aménagement intérieur (si hors d'air seul)",
    groupe: "Extension ossature bois",
    aide: "m² (compléter un HE/HA)",
    pour: ["extension", "surelevation"],
    qteDefaut: () => 0,
  },
  {
    code: "OCMOB-11",
    label: "Ossature bois — hors d'eau / hors d'air",
    groupe: "Surélévation ossature bois",
    sousGroupe: "Structure & finition (1 au choix)",
    sousChoixId: "sur-fin",
    aide: "m² SHON",
    pour: ["surelevation"],
    qteDefaut: (s) => s,
  },
  {
    code: "OCMOB-12",
    label: "Ossature bois — clé en main TCE",
    groupe: "Surélévation ossature bois",
    sousGroupe: "Structure & finition (1 au choix)",
    sousChoixId: "sur-fin",
    aide: "m² SHON",
    pour: ["surelevation"],
    qteDefaut: (s) => s,
    coche: true,
  },
  {
    code: "OCMOB-18",
    label: "Ossature bois — clé en main TCE (toiture tuiles)",
    groupe: "Surélévation ossature bois",
    sousGroupe: "Structure & finition (1 au choix)",
    sousChoixId: "sur-fin",
    aide: "m² SHON",
    pour: ["surelevation"],
    qteDefaut: (s) => s,
  },
  {
    code: "OCMOB-17",
    label: "Ossature bois — clé en main TCE (toit-terrasse)",
    groupe: "Surélévation ossature bois",
    sousGroupe: "Structure & finition (1 au choix)",
    sousChoixId: "sur-fin",
    aide: "m² SHON",
    pour: ["surelevation"],
    qteDefaut: (s) => s,
  },
  {
    code: "OCMAC-05",
    label: "Maçonnée — clé en main TCE",
    groupe: "Surélévation ossature bois",
    sousGroupe: "Structure & finition (1 au choix)",
    sousChoixId: "sur-fin",
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
    pour: ["amenagement_commercial", "chr_restaurant", "erp_sante"],
    qteDefaut: () => 0,
  },
  {
    code: "OCERP-10",
    label: "Cuisine professionnelle CHR clé en main",
    groupe: "CHR / Restaurant",
    aide: "m² de cuisine (~30 % de la surface par défaut)",
    pour: ["chr_restaurant"],
    qteDefaut: (s) => Math.round(s * 0.3), // la cuisine ≠ toute la SHAB (corrige ×3)
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
    label: "Salle(s) de soin seule(s)",
    groupe: "ERP santé",
    aide: "m² des salles uniquement",
    pour: ["erp_sante"],
    qteDefaut: (s) => Math.round(s * 0.5),
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

  // --- Sous-choix (variantes exclusives) sur codes BPU existants ---
  // Énergétique : isolation toiture/combles (exclusif)
  {
    code: "ISO-08",
    label: "Combles perdus — soufflage R≥7",
    groupe: "Enveloppe",
    sousGroupe: "Isolation toiture",
    sousChoixId: "iso-combles",
    eligible55: true,
    aide: "m² de plancher de combles",
    pour: ["renovation_maison", "renovation_energetique"],
    qteDefaut: () => 0,
  },
  {
    code: "ISO-09",
    label: "Rampants — entre/sous chevrons R≥6",
    groupe: "Enveloppe",
    sousGroupe: "Isolation toiture",
    sousChoixId: "iso-combles",
    eligible55: true,
    aide: "m² de rampants",
    pour: ["renovation_maison", "renovation_energetique"],
    qteDefaut: () => 0,
  },
  // Énergétique / réno : ventilation (exclusif)
  {
    code: "PLO-42",
    label: "VMC simple flux hygro B",
    groupe: "Lots techniques",
    sousGroupe: "Ventilation (VMC)",
    sousChoixId: "vmc",
    aide: "nombre de logements",
    pour: ["renovation_appartement", "renovation_maison", "renovation_energetique"],
    qteDefaut: () => 1,
  },
  {
    code: "PLO-98",
    label: "VMC double flux haut rendement",
    groupe: "Lots techniques",
    sousGroupe: "Ventilation (VMC)",
    sousChoixId: "vmc",
    eligible55: true,
    aide: "nombre de logements",
    pour: ["renovation_appartement", "renovation_maison", "renovation_energetique"],
    qteDefaut: () => 1,
  },
  // Haussmannien : essence & pose du parquet (exclusif)
  {
    code: "RS-16",
    label: "Parquet point de Hongrie (chêne massif)",
    groupe: "Pièces",
    sousGroupe: "Parquet noble",
    sousChoixId: "parquet-hauss",
    aide: "m² de parquet",
    pour: ["renovation_haussmannien"],
    qteDefaut: () => 0,
  },
  {
    code: "RS-17",
    label: "Parquet bâtons rompus / chevrons",
    groupe: "Pièces",
    sousGroupe: "Parquet noble",
    sousChoixId: "parquet-hauss",
    aide: "m² de parquet",
    pour: ["renovation_haussmannien"],
    qteDefaut: () => 0,
  },
  {
    code: "RS-19",
    label: "Rénovation parquet existant (ponçage + vitrification)",
    groupe: "Pièces",
    sousGroupe: "Parquet noble",
    sousChoixId: "parquet-hauss",
    aide: "m² de parquet",
    pour: ["renovation_haussmannien"],
    qteDefaut: () => 0,
  },
  // Tertiaire : cloisonnement (exclusif)
  {
    code: "CLO-40",
    label: "Cloisons amovibles mélaminé/métal",
    groupe: "Tertiaire / bureaux",
    sousGroupe: "Cloisonnement",
    sousChoixId: "cloison-ter",
    aide: "m² de cloison",
    pour: ["amenagement_tertiaire"],
    qteDefaut: () => 0,
  },
  {
    code: "CLO-41",
    label: "Cloisons vitrées toute hauteur",
    groupe: "Tertiaire / bureaux",
    sousGroupe: "Cloisonnement",
    sousChoixId: "cloison-ter",
    aide: "m² de cloison",
    pour: ["amenagement_tertiaire"],
    qteDefaut: () => 0,
  },
  // Tertiaire : climatisation (exclusif)
  {
    code: "CVC-90",
    label: "Climatisation VRF / détente directe",
    groupe: "Tertiaire / bureaux",
    sousGroupe: "Climatisation",
    sousChoixId: "clim-ter",
    aide: "m² traité",
    pour: ["amenagement_tertiaire"],
    qteDefaut: (s) => s,
  },
  {
    code: "CVC-91",
    label: "Centrale double flux (CTA)",
    groupe: "Tertiaire / bureaux",
    sousGroupe: "Climatisation",
    sousChoixId: "clim-ter",
    aide: "m² traité",
    pour: ["amenagement_tertiaire"],
    qteDefaut: (s) => s,
  },
  // Commerce : enseigne (exclusif)
  {
    code: "ENS-01",
    label: "Caisson lumineux LED",
    groupe: "Commerce / ERP",
    sousGroupe: "Enseigne",
    sousChoixId: "enseigne",
    aide: "ml d'enseigne",
    pour: ["amenagement_commercial"],
    qteDefaut: () => 0,
  },
  {
    code: "ENS-02",
    label: "Lettres boîtier / relief",
    groupe: "Commerce / ERP",
    sousGroupe: "Enseigne",
    sousChoixId: "enseigne",
    aide: "nombre de lettres",
    pour: ["amenagement_commercial"],
    qteDefaut: () => 0,
  },
  {
    code: "ENS-03",
    label: "Vitrophanie / covering",
    groupe: "Commerce / ERP",
    sousGroupe: "Enseigne",
    sousChoixId: "enseigne",
    aide: "m² de vitrine",
    pour: ["amenagement_commercial"],
    qteDefaut: () => 0,
  },
  // Neuf maçonné : assainissement (exclusif)
  {
    code: "VRD-03",
    label: "Raccordement assainissement collectif",
    groupe: "Maison maçonnée",
    sousGroupe: "Assainissement",
    sousChoixId: "assainissement",
    aide: "raccordement",
    pour: ["neuf_maconne"],
    qteDefaut: () => 1,
  },
  {
    code: "VRD-04",
    label: "Filière ANC (fosse + épandage)",
    groupe: "Maison maçonnée",
    sousGroupe: "Assainissement",
    sousChoixId: "assainissement",
    aide: "installation",
    pour: ["neuf_maconne"],
    qteDefaut: () => 1,
  },

  // --- Forfaits v0 (vague 3) ---
  // Logement / énergétique compléments
  {
    code: "OCREN-16",
    label: "ITE bardage ventilé (ossature rapportée)",
    groupe: "Enveloppe",
    sousGroupe: "Isolation des murs",
    sousChoixId: "iso-murs",
    eligible55: true,
    aide: "m² de façade",
    pour: ["renovation_maison", "renovation_energetique"],
    qteDefaut: () => 0,
  },
  {
    code: "OCREN-20",
    label: "Studio / locatif — rafraîchissement complet",
    groupe: "Global",
    aide: "m² SHAB",
    pour: ["renovation_studio"],
    qteDefaut: (s) => s,
    coche: true,
  },
  {
    code: "RS-60",
    label: "Réfection sols complète (dépose + ragréage + revêtement + plinthes)",
    groupe: "Pièces",
    aide: "m² de sol",
    pour: RENO_PLUS,
    qteDefaut: () => 0,
  },
  {
    code: "OCREN-21",
    label: "Buanderie / cellier clé en main",
    groupe: "Pièces",
    aide: "nombre",
    pour: RENO_PLUS,
    qteDefaut: () => 0,
  },
  // ERP santé
  {
    code: "OCERP-21",
    label: "Cabinet médical complet clé en main",
    groupe: "ERP santé",
    aide: "m² de cabinet",
    pour: ["erp_sante"],
    qteDefaut: (s) => s,
    coche: true,
  },
  // Accessibilité / sécurité ERP (transverses)
  {
    code: "OCERP-22",
    label: "Bloc accessibilité ERP à la carte",
    groupe: "Accessibilité ERP",
    aide: "forfait",
    pour: ["amenagement_commercial", "chr_restaurant", "erp_sante"],
    qteDefaut: () => 0,
  },
  {
    code: "OCERP-23",
    label: "Mise en sécurité incendie ERP (BAES + alarme + extincteurs)",
    groupe: "Accessibilité ERP",
    aide: "forfait",
    pour: ["amenagement_commercial", "chr_restaurant", "erp_sante"],
    qteDefaut: () => 0,
  },
  // Commerce / retail
  {
    code: "OCERP-30",
    label: "Comptoir caisse / banque d'accueil",
    groupe: "Commerce / ERP",
    aide: "ml",
    pour: ["amenagement_commercial"],
    qteDefaut: () => 0,
  },
  {
    code: "OCERP-31",
    label: "Cabine d'essayage clé en main",
    groupe: "Commerce / ERP",
    aide: "nombre de cabines",
    pour: ["amenagement_commercial"],
    qteDefaut: () => 0,
  },
  {
    code: "OCERP-32",
    label: "Linéaire de présentation (gondoles / étagères)",
    groupe: "Commerce / ERP",
    aide: "ml",
    pour: ["amenagement_commercial"],
    qteDefaut: () => 0,
  },
  {
    code: "OCERP-40",
    label: "Climatisation boutique (PAC réversible)",
    groupe: "Commerce / ERP",
    aide: "m² traité",
    pour: ["amenagement_commercial"],
    qteDefaut: (s) => s,
  },
  // Tertiaire
  {
    code: "OCTER-20",
    label: "Baie de brassage VDI + cœur de réseau",
    groupe: "Tertiaire / bureaux",
    aide: "forfait",
    pour: ["amenagement_tertiaire"],
    qteDefaut: () => 0,
  },
  {
    code: "OCTER-21",
    label: "Salle de réunion équipée clé en main",
    groupe: "Tertiaire / bureaux",
    aide: "nombre de salles",
    pour: ["amenagement_tertiaire"],
    qteDefaut: () => 0,
  },
  // CHR — compléments cuisine pro & salle
  {
    code: "OCCHR-30",
    label: "Comptoir / bar de service CHR",
    groupe: "CHR / Restaurant",
    aide: "ml de bar",
    pour: ["chr_restaurant"],
    qteDefaut: () => 0,
  },
  {
    code: "OCCHR-40",
    label: "Extraction + compensation cuisine ERP",
    groupe: "CHR / Restaurant",
    aide: "nombre d'installations",
    pour: ["chr_restaurant"],
    qteDefaut: () => 0,
  },
  {
    code: "OCCHR-50",
    label: "Sécurité gaz + extinction de hotte",
    groupe: "CHR / Restaurant",
    aide: "forfait",
    pour: ["chr_restaurant"],
    qteDefaut: () => 0,
  },
  {
    code: "OCCHR-60",
    label: "Chambres froides + production frigorifique",
    groupe: "CHR / Restaurant",
    aide: "nombre d'enceintes",
    pour: ["chr_restaurant"],
    qteDefaut: () => 0,
  },
  // Neuf — annexes & extérieurs
  {
    code: "OCNEUF-20",
    label: "Garage / annexe maçonné(e) clé en main",
    groupe: "Annexes & extérieurs",
    aide: "m²",
    pour: ["neuf_maconne"],
    qteDefaut: () => 0,
  },
  {
    code: "OCNEUF-21",
    label: "Carport / abri ossature bois",
    groupe: "Annexes & extérieurs",
    aide: "m²",
    pour: ["neuf_maconne"],
    qteDefaut: () => 0,
  },
  {
    code: "OCNEUF-22",
    label: "Terrasse extérieure dallée",
    groupe: "Annexes & extérieurs",
    aide: "m²",
    pour: ["neuf_maconne"],
    qteDefaut: () => 0,
  },
  {
    code: "OCNEUF-23",
    label: "Aménagement extérieur / VRD de finition",
    groupe: "Annexes & extérieurs",
    aide: "m²",
    pour: ["neuf_maconne"],
    qteDefaut: () => 0,
  },
  // Adaptation PMR
  {
    code: "OCPMR-18",
    label: "Pack adaptation logement PMR / senior",
    groupe: "Pièces",
    aide: "forfait",
    pour: ["adaptation_pmr"],
    qteDefaut: () => 0,
  },
  {
    code: "OCPMR-16",
    label: "Baignoire → douche italienne PMR",
    groupe: "Pièces",
    aide: "nombre",
    pour: ["adaptation_pmr"],
    qteDefaut: () => 0,
  },
  {
    code: "OCPMR-17",
    label: "WC adapté PMR / senior",
    groupe: "Pièces",
    aide: "nombre",
    pour: ["adaptation_pmr"],
    qteDefaut: () => 0,
  },
  {
    code: "OCPMR-19",
    label: "Monte-escalier siège PMR",
    groupe: "Accessibilité ERP",
    aide: "nombre",
    pour: ["adaptation_pmr"],
    qteDefaut: () => 0,
  },
  {
    code: "OCPMR-20",
    label: "Plateforme élévatrice PMR",
    groupe: "Accessibilité ERP",
    aide: "nombre",
    pour: ["adaptation_pmr"],
    qteDefaut: () => 0,
  },
];

/** Ordre canonique d'affichage des blocs (groupe) dans le wizard rapide. */
export const GROUPES_ORDRE: string[] = [
  "Global",
  "Pièces",
  "Enveloppe",
  "Lots techniques",
  "Structure",
  "Extension ossature bois",
  "Surélévation ossature bois",
  "Maison maçonnée",
  "Annexes & extérieurs",
  "Commerce / ERP",
  "CHR / Restaurant",
  "Tertiaire / bureaux",
  "ERP santé",
  "Accessibilité ERP",
];

/** Rang d'un bloc dans l'ordre canonique (999 si inconnu → en fin). */
export function ordreDuGroupe(groupe: string): number {
  const i = GROUPES_ORDRE.indexOf(groupe);
  return i === -1 ? 999 : i;
}

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
  // Énergétique + adaptation PMR = 5,5 % ; rénovation logement = 10 % ; neuf/extension/pro = 20 %.
  // (NB : la sélection réelle est arbitrée par tvaSuggereeSelection — bascule à 10 %
  //  dès qu'un poste non éligible est coché. Ici = suggestion de TYPE, étape 1.)
  if (type === "renovation_energetique" || type === "adaptation_pmr") return 5.5;
  if (TYPES_RENO_LOGEMENT.includes(type)) return 10;
  return 20;
}

/** Ouvrages d'amélioration énergétique (TVA 5,5 % si seuls, Guide §2.1 / CGI 278-0 bis A). */
export const CODES_ENERGETIQUES = new Set([
  "OCREN-04", // ITI
  "OCREN-05", // ITE
  "OCREN-10", // menuiseries isolantes
  "OCREN-14", // PAC air-eau
  "ISO-08", // combles soufflés
  "ISO-09", // rampants
  "PLO-98", // VMC double flux
  // OCREN-09 (ravalement non isolant) EXCLU : relève du 10 %, pas du 5,5 %.
]);

/** Ouvrages d'adaptation à la perte d'autonomie (TVA 5,5 % si seuls, CGI 278-0 bis A). */
export const CODES_ADAPTATION_PMR = new Set([
  "OCREN-13", // SDB PMR sécurisée
  "OCERP-03", // mise en accessibilité
  "OCPMR-16", // baignoire -> douche italienne
  "OCPMR-17", // WC adapté
  "OCPMR-18", // pack adaptation logement
  "OCPMR-19", // monte-escalier siège
  "OCPMR-20", // plateforme élévatrice PMR
]);

/**
 * TVA suggérée en tenant compte de la sélection :
 * - 5,5 % si rénovation logement et sélection 100 % énergétique ;
 * - 5,5 % si adaptation PMR et sélection 100 % postes d'adaptation ;
 * sinon règle par type.
 */
/** Ouvrage du catalogue rapide par code. */
export function ouvrageParCode(code: string): OuvrageRapide | undefined {
  return OUVRAGES_RAPIDE.find((o) => o.code === code);
}

/** Éligibilité TVA 5,5 % : attribut de l'ouvrage prioritaire, sinon set legacy. */
export function estEligible55(code: string): boolean {
  return ouvrageParCode(code)?.eligible55 ?? CODES_ENERGETIQUES.has(code);
}

export function tvaSuggereeSelection(
  type: TypeProjetRapide,
  codesActifs: string[],
): TauxTVA {
  if (codesActifs.length === 0) return tvaSuggeree(type);
  // 5,5 % UNIQUEMENT si la sélection est 100 % éligible (énergétique ou adaptation PMR).
  const tousEnergetiques =
    TYPES_RENO_LOGEMENT.includes(type) && codesActifs.every((c) => estEligible55(c));
  const tousPmr =
    type === "adaptation_pmr" && codesActifs.every((c) => CODES_ADAPTATION_PMR.has(c));
  if (tousEnergetiques || tousPmr) return 5.5;
  // Sinon : 10 % réno logement (y compris énergétique avec un poste non éligible), 20 % neuf/pro.
  return TYPES_RENO_LOGEMENT.includes(type) ? 10 : 20;
}

/** Ouvrages dont le périmètre recouvre celui d'un autre (risque double-comptage). */
const RECOUVREMENTS: Record<string, string[]> = {
  // La rénovation globale au m² SHAB recouvre déjà la pièce de vie et les
  // lots techniques pris séparément.
  "OCREN-07": ["OCREN-06", "OCREN-11", "OCREN-12"],
  // Les forfaits "clé en main TCE" englobent leur variante hors d'eau/hors d'air
  // ET l'aménagement intérieur (OCMOB-19) ; pas les coques HE/HA (qu'OCMOB-19 complète).
  "OCMOB-10": ["OCMOB-09", "OCMOB-19"],
  "OCMOB-16": ["OCMOB-19"],
  "OCMOB-15": ["OCMOB-19"],
  "OCMAC-03": ["OCMOB-19"],
  "OCMOB-12": ["OCMOB-11", "OCMOB-19"],
  "OCMOB-18": ["OCMOB-19"],
  "OCMOB-17": ["OCMOB-19"],
  "OCMAC-05": ["OCMOB-19"],
  "OCMAC-02": ["OCMAC-01"],
  // La réno haussmannienne complète recouvre la réno globale standard.
  "OCREN-15": ["OCREN-07"],
  // La cuisine pro clé en main inclut déjà extraction et sécurité.
  "OCERP-10": ["OCCHR-40", "OCCHR-50"],
  // Le cabinet santé complet recouvre les salles de soin seules.
  "OCERP-21": ["OCERP-20"],
  // Accessibilité ERP : forfait global OU bloc à la carte, pas les deux.
  "OCERP-03": ["OCERP-22"],
  // Le pack adaptation PMR englobe la douche italienne et le WC adapté.
  "OCPMR-18": ["OCPMR-16", "OCPMR-17"],
  // Ravalement non isolant recouvert par l'ITE / le bardage sur la même façade.
  "OCREN-05": ["OCREN-09"],
  "OCREN-16": ["OCREN-09"],
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
    const qte = o.qteDefaut(shab);
    // Défaut coché : ouvrage marqué coche, ou poste « tête » du type spécialisé.
    const tete =
      (type === "renovation_energetique" && o.code === "OCREN-04") ||
      (type === "adaptation_pmr" && o.code === "OCREN-13");
    // Garde-fou : ne jamais ouvrir un ouvrage coché SANS quantité (état d'erreur).
    out[o.code] = { actif: (!!o.coche || tete) && qte > 0, qte };
  }
  return out;
}

// Réexport pour confort d'import côté UI.
export type { Gamme };
