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
  {
    id: "baie",
    titre: "Baie vitrée / coulissante",
    aide: "À l'unité.",
    options: [
      { code: "MEX-20", label: "Coulissante 2 vantaux (L≤2,4m)" },
      { code: "MEX-21", label: "Coulissante 3 vantaux (L≤3,6m)" },
      { code: "MEX-22", label: "Galandage 1 vantail" },
    ],
  },
  {
    id: "escalier",
    titre: "Escalier intérieur",
    aide: "À l'unité.",
    options: [
      { code: "MEN-30", label: "Droit bois" },
      { code: "MEN-31", label: "Quart-tournant bois" },
      { code: "SER-10", label: "Métal limon central + marches bois" },
    ],
  },
  {
    id: "cloison",
    titre: "Cloison",
    aide: "Au m².",
    options: [
      { code: "CLO-32", label: "Double BA13 (Rw≥46dB)" },
      { code: "CLO-40", label: "Amovible mélaminé/métal" },
      { code: "CLO-41", label: "Vitrée toute hauteur (alu + verre)" },
    ],
  },
  {
    id: "garde_corps",
    titre: "Garde-corps / rampe",
    aide: "Au ml.",
    options: [
      { code: "SER-11", label: "Acier + lisses (trémie)" },
      { code: "SER-12", label: "Rampe bois/métal sur volée" },
      { code: "SER-13", label: "Verre + pinces inox" },
    ],
  },
  {
    id: "devanture",
    titre: "Devanture / fermeture commerciale",
    aide: "Vitrine au m², porte à l'unité, rideau au m².",
    options: [
      { code: "DEVA-01", label: "Châssis vitrine + vitrage sécurité" },
      { code: "DEVA-02", label: "Porte commerciale vitrée" },
      { code: "DEVA-03", label: "Rideau métallique motorisé" },
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
