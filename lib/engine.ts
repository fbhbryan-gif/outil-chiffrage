// Moteur de chiffrage LCB BAT — règles métier centralisées.
// Source de vérité : Specifications_LCB_BAT.md (§2, §5) + BPU_LCB_BAT_v10.md.
//
// PRINCIPE : tous les prix du BPU sont HT et HORS markup. Le markup (15 %
// particuliers) est appliqué AU MOMENT du calcul du devis, jamais stocké dans
// le BPU et jamais visible côté client.

import type {
  Gamme,
  LigneCalculee,
  LigneDevis,
  ParametresDevis,
  PosteBPU,
  SyntheseDevis,
  TauxTVA,
  TotalLot,
  TotalTVA,
  TypeClient,
} from "./types";

// ---------------------------------------------------------------------------
// Constantes métier (Specifications §2.2, §2.4, §5.1)
// ---------------------------------------------------------------------------

/** Markup appliqué selon le type de client. ERP/pro = à confirmer projet par projet. */
export const MARKUP: Record<TypeClient, number> = {
  particulier: 1.15,
  erp: 1.0,
  pro: 1.0,
};

/**
 * Prix verrouillés à dire d'expert (Specifications §2.4).
 * Valeurs HT hors markup : le markup s'applique ensuite normalement.
 * Ne JAMAIS recalculer ces postes depuis la base composants.
 */
export const PRIX_VERROUILLES: Record<string, number> = {
  "RS-01": 50,
  "RS-09": 50,
};

/** Coefficients conservateurs par défaut selon l'unité (Specifications §5.1). */
export const COEF_QTE_DEFAUT: Record<string, number> = {
  "m²": 1.08, // surfaces : +5 à +10 %
  "m³": 1.08,
  ml: 1.1, // linéaires : +10 %
};

/** Indexation de référence des prix. */
export const INDEXATION = "IDF Q2 2026";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Arrondi monétaire à 2 décimales, robuste aux erreurs de flottant. */
export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

/** Coefficient par défaut pour une unité (1 si non concernée). */
export function coefDefautPourUnite(unite: string): number {
  return COEF_QTE_DEFAUT[unite] ?? 1;
}

/** PU de base d'un poste selon la gamme (HT, hors markup). */
export function puBasePourGamme(poste: PosteBPU, gamme: Gamme): number {
  switch (gamme) {
    case "MIN":
      return poste.min;
    case "MAX":
      return poste.max;
    case "MOY":
    default:
      return poste.moy;
  }
}

/**
 * PU de base retenu pour un code, en tenant compte des prix verrouillés.
 * Si le code est verrouillé, retourne la valeur calée quelle que soit la gamme.
 */
export function puBaseRetenu(poste: PosteBPU, gamme: Gamme): number {
  if (poste.code in PRIX_VERROUILLES) {
    return PRIX_VERROUILLES[poste.code];
  }
  return puBasePourGamme(poste, gamme);
}

/** Applique le markup client à un PU de base. */
export function appliquerMarkup(puBase: number, typeClient: TypeClient): number {
  return round2(puBase * (MARKUP[typeClient] ?? 1));
}

// ---------------------------------------------------------------------------
// Construction d'une ligne depuis le BPU
// ---------------------------------------------------------------------------

/**
 * Crée une ligne de devis à partir d'un poste BPU et des paramètres projet.
 * Applique la gamme par défaut, le prix verrouillé éventuel, le coefficient
 * de quantité par défaut selon l'unité, et la TVA par défaut.
 */
export function ligneDepuisPoste(
  poste: PosteBPU,
  params: ParametresDevis,
  qteBrute = 0,
): LigneDevis {
  return {
    id: cryptoRandomId(),
    code: poste.code,
    designation: poste.designation,
    unite: poste.unite,
    puBase: puBaseRetenu(poste, params.gammeDefaut),
    gamme: params.gammeDefaut,
    qteBrute,
    coefQte: coefDefautPourUnite(poste.unite),
    tva: params.tvaDefaut,
    note: poste.code in PRIX_VERROUILLES ? "Prix calé à dire d'expert" : undefined,
  };
}

/** ID stable et lisible côté client comme côté Node. */
export function cryptoRandomId(): string {
  // globalThis.crypto existe en navigateur ET en Node >= 18.
  const c = (globalThis as { crypto?: Crypto }).crypto;
  if (c?.randomUUID) return c.randomUUID();
  return "id-" + Math.random().toString(36).slice(2, 10);
}

// ---------------------------------------------------------------------------
// Calculs
// ---------------------------------------------------------------------------

/** Calcule une ligne : quantité appliquée, PU final markupé, total HT. */
export function calculerLigne(
  ligne: LigneDevis,
  typeClient: TypeClient,
): LigneCalculee {
  const qteAppliquee = round2(ligne.qteBrute * (ligne.coefQte || 1));
  const puFinal = appliquerMarkup(ligne.puBase, typeClient);
  const totalHT = round2(qteAppliquee * puFinal);
  return { ...ligne, qteAppliquee, puFinal, totalHT };
}

/** Regroupe les lignes calculées par lot (préfixe du code). */
export function regrouperParLot(
  lignes: LigneCalculee[],
  lotTitre: (lot: string) => string,
): TotalLot[] {
  const map = new Map<string, LigneCalculee[]>();
  for (const l of lignes) {
    const lot = l.code.split("-")[0] || "AUTRE";
    const arr = map.get(lot) ?? [];
    arr.push(l);
    map.set(lot, arr);
  }
  return [...map.entries()].map(([lot, lignesLot]) => ({
    lot,
    lotTitre: lotTitre(lot),
    lignes: lignesLot,
    totalHT: round2(lignesLot.reduce((s, l) => s + l.totalHT, 0)),
  }));
}

/**
 * Synthèse financière complète d'un devis.
 * Les imprévus (Specifications §5.1) sont calculés sur le HT des postes et
 * répartis au prorata sur chaque base de TVA pour préserver l'exactitude des
 * taux.
 */
export function calculerSynthese(
  lignes: LigneDevis[],
  params: ParametresDevis,
  lotTitre: (lot: string) => string = (l) => l,
): SyntheseDevis {
  const calculees = lignes.map((l) => calculerLigne(l, params.typeClient));
  const parLot = regrouperParLot(calculees, lotTitre);

  const htPostes = round2(calculees.reduce((s, l) => s + l.totalHT, 0));
  const montantImprevus = round2(htPostes * (params.tauxImprevus || 0));
  const totalHT = round2(htPostes + montantImprevus);

  // Bases HT par taux de TVA (postes uniquement).
  const baseParTaux = new Map<TauxTVA, number>();
  for (const l of calculees) {
    baseParTaux.set(l.tva, round2((baseParTaux.get(l.tva) ?? 0) + l.totalHT));
  }

  const tvaParTaux: TotalTVA[] = [...baseParTaux.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([taux, basePostes]) => {
      // Part d'imprévus attribuée à ce taux, au prorata.
      const partImprevus =
        htPostes > 0 ? round2(montantImprevus * (basePostes / htPostes)) : 0;
      const baseHT = round2(basePostes + partImprevus);
      const montantTVA = round2(baseHT * (taux / 100));
      return { taux, baseHT, montantTVA };
    });

  const totalTVA = round2(tvaParTaux.reduce((s, t) => s + t.montantTVA, 0));
  const totalTTC = round2(totalHT + totalTVA);

  return {
    parLot,
    htPostes,
    montantImprevus,
    totalHT,
    tvaParTaux,
    totalTVA,
    totalTTC,
    markupApplique: MARKUP[params.typeClient] ?? 1,
  };
}

// ---------------------------------------------------------------------------
// Export au format [DEVIS_UPDATE] (Specifications §7)
// ---------------------------------------------------------------------------

/**
 * Produit la charge utile JSON attendue par le programme historique
 * (format [DEVIS_UPDATE]). Les PU exportés sont DÉJÀ markupés.
 */
export function versDevisUpdate(
  lignes: LigneDevis[],
  params: ParametresDevis,
  lotTitre: (lot: string) => string = (l) => l,
): { lots: Array<{ title: string; items: object[] }> } {
  const synthese = calculerSynthese(lignes, params, lotTitre);
  return {
    lots: synthese.parLot.map((lot) => ({
      title: `Lot ${lot.lot} — ${lot.lotTitre}`,
      items: lot.lignes.map((l) => ({
        code: l.code,
        designation: l.designation,
        unit: l.unite,
        qty: l.qteAppliquee,
        pu: l.puFinal,
        total: l.totalHT,
        tva: l.tva,
        note: l.note ?? "",
      })),
    })),
  };
}
