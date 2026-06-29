// Choix guidés — sélection de variantes / gammes de produits.
// L'utilisateur choisit une PRESTATION (sol, toiture, ventilation…) puis la
// VARIANTE produit voulue : l'outil ajoute le bon code BPU. « Configurer
// plutôt que connaître les codes. » Aucun prix inventé : tout référence le BPU.

import type { PosteBPU } from "./types";

export interface OptionVariante {
  code: string;
  label: string;
}

export interface GroupeVariante {
  id: string;
  titre: string;
  aide?: string;
  options: OptionVariante[];
}

export const VARIANTES: GroupeVariante[] = [
  {
    id: "sol",
    titre: "Revêtement de sol",
    aide: "Au m². De l'éco au haut de gamme et au technique.",
    options: [
      { code: "RS-20", label: "Stratifié clipsable (éco)" },
      { code: "RS-13", label: "PVC clipsable LVT" },
      { code: "RS-03", label: "Parquet contrecollé chêne" },
      { code: "RS-09", label: "Parquet massif" },
      { code: "RS-10", label: "Carrelage grès 120×60" },
      { code: "RS-05", label: "Carrelage hexagonal" },
      { code: "RS-22", label: "Carrelage antidérapant R11 (humide/PMR)" },
      { code: "RS-18", label: "Béton ciré / microciment" },
      { code: "RS-21", label: "Résine époxy / PU" },
      { code: "RS-23", label: "PVC hospitalier U4P3 (soudé)" },
    ],
  },
  {
    id: "toiture_mob",
    titre: "Toiture d'extension (ossature bois)",
    aide: "Au m². Variante substituée dans le forfait.",
    options: [
      { code: "OCMOB-06", label: "Inclinée tuiles ≥20%" },
      { code: "OCMOB-07", label: "Terrasse accessible EPDM" },
      { code: "OCMOB-08", label: "Zinc joint debout" },
    ],
  },
  {
    id: "vmc",
    titre: "Ventilation (VMC)",
    aide: "Du simple flux au double flux haut rendement.",
    options: [
      { code: "PLO-03", label: "Simple flux hygro (3 pièces)" },
      { code: "PLO-42", label: "Hygro compacte (5-6 pièces)" },
      { code: "PLO-98", label: "Double flux haut rendement ≥85%" },
    ],
  },
  {
    id: "plan_travail",
    titre: "Plan de travail cuisine",
    aide: "Au ml.",
    options: [
      { code: "AGEN-23", label: "Stratifié compact (HPL/Fenix)" },
      { code: "AGEN-24", label: "Compact massif (Trespa)" },
      { code: "AGEN-25", label: "Dekton / céramique" },
      { code: "AGEN-26", label: "Pierre (quartz / granit)" },
    ],
  },
  {
    id: "douche",
    titre: "Douche",
    aide: "Receveur, paroi, ou italienne plain-pied (PMR).",
    options: [
      { code: "PLO-92", label: "Italienne plain-pied (PMR)" },
      { code: "PLO-10", label: "Receveur extra-plat" },
      { code: "PLO-25", label: "Paroi fixe" },
      { code: "PLO-09", label: "Porte pliante" },
    ],
  },
];

/** Ne garde que les options dont le code existe dans le BPU. */
export function optionsDisponibles(
  groupe: GroupeVariante,
  getPoste: (code: string) => PosteBPU | undefined,
): { option: OptionVariante; poste: PosteBPU }[] {
  return groupe.options
    .map((option) => ({ option, poste: getPoste(option.code) }))
    .filter((x): x is { option: OptionVariante; poste: PosteBPU } => !!x.poste);
}
