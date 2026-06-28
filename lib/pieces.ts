// Quantités liées d'une pièce (Guide §8.2 — cohérence inter-lots).
// À partir des dimensions d'une pièce, dérive les quantités cohérentes des
// postes liés : sol/plafond (= surface au sol), plinthes (= périmètre),
// murs (= périmètre × hauteur). Logique pure et testable.

import { round2 } from "./engine";

export interface DimsPiece {
  /** Surface au sol (m²). */
  surfaceSol: number;
  /** Périmètre (ml). Si absent, estimé depuis la surface (pièce ~carrée). */
  perimetre?: number;
  /** Hauteur sous plafond (m). Défaut 2,50. */
  hauteur?: number;
}

export interface QuantitesLiees {
  /** Surface de sol (carrelage, parquet, ragréage). */
  sol: number;
  /** Plinthes (= périmètre). */
  plinthes: number;
  /** Surface de murs (peinture/faïence murale = périmètre × hauteur). */
  murs: number;
  /** Surface de plafond (= surface au sol). */
  plafond: number;
  /** Périmètre retenu (saisi ou estimé). */
  perimetre: number;
  /** Hauteur retenue. */
  hauteur: number;
}

/** Périmètre estimé d'une pièce supposée carrée : 4 × √surface. */
export function perimetreEstime(surfaceSol: number): number {
  if (!surfaceSol || surfaceSol <= 0) return 0;
  return round2(4 * Math.sqrt(surfaceSol));
}

/** Dérive les quantités liées d'une pièce. */
export function quantitesLiees(d: DimsPiece): QuantitesLiees {
  const sol = round2(d.surfaceSol || 0);
  const hauteur = d.hauteur && d.hauteur > 0 ? d.hauteur : 2.5;
  const perimetre =
    d.perimetre && d.perimetre > 0 ? round2(d.perimetre) : perimetreEstime(sol);
  return {
    sol,
    plinthes: perimetre,
    murs: round2(perimetre * hauteur),
    plafond: sol,
    perimetre,
    hauteur,
  };
}
