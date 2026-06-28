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

/** Lots présents dans la base, dans l'ordre d'apparition, avec leur effectif. */
export const LOTS: { lot: string; titre: string; nb: number }[] = (() => {
  const ordre: string[] = [];
  const compte = new Map<string, number>();
  for (const p of BPU) {
    if (!compte.has(p.lot)) ordre.push(p.lot);
    compte.set(p.lot, (compte.get(p.lot) ?? 0) + 1);
  }
  return ordre.map((lot) => ({
    lot,
    titre: titreLot(lot),
    nb: compte.get(lot) ?? 0,
  }));
})();

/** Postes d'un lot donné. */
export function postesDuLot(lot: string): PosteBPU[] {
  return BPU.filter((p) => p.lot === lot);
}

/** Recherche plein-texte simple sur code et désignation. */
export function rechercherBPU(query: string, limite = 20): PosteBPU[] {
  const q = query.trim().toLowerCase();
  if (!q) return BPU.slice(0, limite);
  const mots = q.split(/\s+/);
  return BPU.filter((p) => {
    const hay = `${p.code} ${p.lot} ${p.designation}`.toLowerCase();
    return mots.every((m) => hay.includes(m));
  }).slice(0, limite);
}
