// Types métier — Outil de chiffrage LCB BAT
// Référentiel : Specifications_LCB_BAT.md + BPU_LCB_BAT_v10.md

/** Gamme de prix dans le BPU. MOY = valeur par défaut. */
export type Gamme = "MIN" | "MOY" | "MAX";

/** Unité de quantité d'un poste. */
export type Unite = "m²" | "ml" | "m³" | "U" | "F" | "J" | "ens";

/** Taux de TVA applicables (Specifications §2.1). */
export type TauxTVA = 5.5 | 10 | 20;

/** Type de client (métadonnée projet ; n'influe plus sur le prix). */
export type TypeClient = "particulier" | "erp" | "pro";

/** Un poste de la bibliothèque BPU. Prix HT. */
export interface PosteBPU {
  /** Code unique, ex. "RS-01", "OCREN-07". */
  code: string;
  /** Code de lot (préfixe), ex. "RS", "OCREN". */
  lot: string;
  /** Intitulé du lot, ex. "Revêtements de sols". */
  lotTitre: string;
  /** Désignation technique du poste. */
  designation: string;
  unite: Unite;
  /** Prix unitaire gamme économique (HT). */
  min: number;
  /** Prix unitaire standard (HT, hors markup) — défaut. */
  moy: number;
  /** Prix unitaire haut de gamme (HT). */
  max: number;
}

/** Ligne de chiffrage saisie par l'utilisateur. */
export interface LigneDevis {
  id: string;
  code: string;
  designation: string;
  unite: Unite;
  /** Prix unitaire de base retenu (HT). Repris du BPU selon la gamme, ou saisi (AD-HOC). */
  puBase: number;
  /** Gamme retenue pour cette ligne. */
  gamme: Gamme;
  /** Quantité brute saisie (surface utile / linéaire mesuré). */
  qteBrute: number;
  /**
   * Coefficient conservateur appliqué à la quantité (Specifications §5.1).
   * 1 = pas de majoration. Ex. 1.10 = +10 %.
   */
  coefQte: number;
  /** Taux de TVA de la ligne. */
  tva: TauxTVA;
  /** Quantité ferme : si true, le coefficient conservateur est ignoré (coef = 1). */
  ferme?: boolean;
  /** Pièce / zone d'affichage (métadonnée, n'influe pas sur le prix). */
  zone?: string;
  /** Groupe de consolidation côté client (ex. "Cuisine", "Salle de bains"). */
  groupeClient?: string;
  /** Note interne (non destinée au client). */
  note?: string;
  /** Poste hors BPU créé à la volée. */
  adHoc?: boolean;
}

/** Mentions contractuelles d'un lot (Guide §8.3). Reprises sur les exports. */
export interface MentionsLot {
  inclus?: string;
  exclus?: string;
  conditions?: string;
}

/** Paramètres globaux du devis. */
export interface ParametresDevis {
  ref: string;
  client: string;
  adresse: string;
  /** Type de projet (libre, ex. "renovation_appartement"). */
  typeProjet: string;
  typeClient: TypeClient;
  /** Gamme par défaut appliquée aux nouveaux postes. */
  gammeDefaut: Gamme;
  /** Taux de TVA par défaut appliqué aux nouveaux postes. */
  tvaDefaut: TauxTVA;
  /**
   * Pourcentage d'imprévus appliqué au HT global (Specifications §5.1 : 3 à 5 %).
   * 0 = aucun. Ex. 0.04 = +4 %.
   */
  tauxImprevus: number;
  /** Surface SHAB/SHON de référence (m²), pour le ratio €/m². */
  surfaceShab?: number;
  /** Date d'émission de la version (ISO yyyy-mm-dd). */
  dateEmission?: string;
  /** Date prévisionnelle de démarrage du chantier (ISO). */
  dateDemarragePrev?: string;
  /** Mentions INCLUS/EXCLUS/CONDITIONS par code de lot. */
  mentionsParLot?: Record<string, MentionsLot>;
}

/** Résultat calculé d'une ligne. */
export interface LigneCalculee extends LigneDevis {
  /** Quantité appliquée = qteBrute × coefQte (arrondie). */
  qteAppliquee: number;
  /** PU final HT appliqué (= PU de base, sans majoration). */
  puFinal: number;
  /** Total ligne HT = qteAppliquee × puFinal. */
  totalHT: number;
}

/** Sous-total d'un lot. */
export interface TotalLot {
  lot: string;
  lotTitre: string;
  lignes: LigneCalculee[];
  totalHT: number;
}

/** Total de TVA pour un taux donné. */
export interface TotalTVA {
  taux: TauxTVA;
  baseHT: number;
  montantTVA: number;
}

/** Synthèse financière complète d'un devis. */
export interface SyntheseDevis {
  parLot: TotalLot[];
  /** HT des postes (hors imprévus). */
  htPostes: number;
  /** Montant des imprévus (sur HT des postes). */
  montantImprevus: number;
  /** HT total = htPostes + imprévus. */
  totalHT: number;
  tvaParTaux: TotalTVA[];
  totalTVA: number;
  totalTTC: number;
  /** Ratio €/m² HT (Total HT / surface SHAB) si la surface est connue. */
  ratioM2?: number;
}
