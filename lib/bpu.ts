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
