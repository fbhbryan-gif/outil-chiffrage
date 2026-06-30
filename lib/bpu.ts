// Accès à la bibliothèque BPU.
// Lit data/bpu.json (généré par `npm run bpu:build`, ou seed par défaut).

import bpuData from "@/data/bpu.json";
import type { PosteBPU } from "./types";

export const BPU: PosteBPU[] = bpuData as PosteBPU[];

/** Map code -> poste, pour recalcul du PU à la volée. */
export const BPU_PAR_CODE: Map<string, PosteBPU> = new Map(
  BPU.map((p) => [p.code, p]),
);

/** Map lot -> intitulé du lot. */
export const LOT_TITRES: Map<string, string> = new Map(
  BPU.map((p) => [p.lot, p.lotTitre]),
);

export function titreLot(lot: string): string {
  return LOT_TITRES.get(lot) ?? lot;
}

/**
 * Ordre canonique TCE des lots (ordre du BPU source `BPU_v10.md`).
 * `data/bpu.json` est trié par code (alphabétique) — on ne peut donc pas
 * déduire l'ordre métier de la donnée : il est fixé ici.
 */
export const ORDRE_LOTS: string[] = [
  "PREP", "VRD", "DEMO", "MAC", "MP", "ISO", "CHAR", "CLO", "MEN", "MEX",
  "SER", "EL", "PLO", "CVC", "RS", "RM", "PEINT", "STAFF", "PIE", "RAV",
  "DEVA", "ENS", "SEC", "ACC", "MSM", "OCMOB", "OCREN", "OCERP", "OCMAC",
  "OCTER", "OCNEUF", "OCCHR", "OCPMR", "AGEN", "EM", "CHR",
];

/** Index d'un lot dans l'ordre canonique (999 si inconnu → en fin). */
export function ordreDuLot(lot: string): number {
  const i = ORDRE_LOTS.indexOf(lot);
  return i === -1 ? 999 : i;
}

/** Lots présents dans la base, triés en ordre TCE, avec leur effectif. */
export const LOTS: { lot: string; titre: string; nb: number }[] = (() => {
  const compte = new Map<string, number>();
  for (const p of BPU) compte.set(p.lot, (compte.get(p.lot) ?? 0) + 1);
  return [...compte.keys()]
    .sort((a, b) => ordreDuLot(a) - ordreDuLot(b))
    .map((lot) => ({ lot, titre: titreLot(lot), nb: compte.get(lot) ?? 0 }));
})();

/** Postes d'un lot donné. */
export function postesDuLot(lot: string): PosteBPU[] {
  return BPU.filter((p) => p.lot === lot);
}

/** Retire les accents/diacritiques et passe en minuscules. */
export function sansAccents(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

/**
 * Synonymes courants → termes présents dans les désignations BPU.
 * Permet de retrouver un poste depuis le vocabulaire chantier.
 */
const SYNONYMES: Record<string, string> = {
  placo: "ba13",
  placoplatre: "ba13",
  cloison: "ba13",
  toilettes: "wc",
  toilette: "wc",
  faience: "faience",
  carrelage: "carrelage",
  parquet: "parquet",
  clim: "climatiseur",
  climatisation: "climatiseur",
  vmc: "vmc",
  isolation: "isolant",
  fenetre: "menuiserie",
  fenetres: "menuiserie",
  prise: "appareillage",
  tableau: "tableau",
  cuisine: "cuisine",
  dressing: "dressing",
  placard: "placard",
  italienne: "douche",
  antiderapant: "r11",
  spots: "spot",
  sanibroyeur: "wc",
  seche: "sèche",
};

/** Étend un mot par son synonyme BPU éventuel (les deux sont testés). */
function variantes(mot: string): string[] {
  const syn = SYNONYMES[mot];
  return syn && syn !== mot ? [mot, syn] : [mot];
}

/**
 * Recherche plein-texte insensible aux accents, avec synonymes.
 * Cherche sur code, lot, intitulé de lot et désignation.
 * Retourne TOUS les résultats (l'appelant décide de la troncature d'affichage).
 */
export function rechercherBPU(query: string): PosteBPU[] {
  const q = sansAccents(query.trim());
  if (!q) return BPU;
  const mots = q.split(/\s+/).filter(Boolean);
  return BPU.filter((p) => {
    const hay = sansAccents(`${p.code} ${p.lot} ${p.lotTitre} ${p.designation}`);
    // Chaque mot saisi doit matcher (lui-même ou un de ses synonymes).
    return mots.every((m) => variantes(m).some((v) => hay.includes(v)));
  });
}
