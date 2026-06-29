// Moteur de chiffrage LCB BAT — règles métier centralisées.
// Source de vérité : Specifications_LCB_BAT.md (§2, §5) + BPU_LCB_BAT_v10.md.
//
// PRINCIPE : le PU appliqué d'une ligne est le PU du BPU selon la gamme retenue
// (ou le prix verrouillé). Aucune majoration n'est appliquée par le moteur —
// une éventuelle majoration globale du devis sera gérée séparément.

import type {
  Gamme,
  LigneCalculee,
  LigneDevis,
  MentionsLot,
  ParametresDevis,
  PosteBPU,
  SyntheseDevis,
  TauxTVA,
  TotalLot,
  TotalTVA,
  Unite,
} from "./types";

// ---------------------------------------------------------------------------
// Constantes métier (Specifications §2.4, §5.1)
// ---------------------------------------------------------------------------

/**
 * Prix verrouillés à dire d'expert (Specifications §2.4).
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

/** Arrondi monétaire à 2 décimales, robuste aux flottants ET aux NaN (→ 0). */
export function round2(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

/** Code à prix verrouillé (RS-01 / RS-09) : gamme sans effet, 50 €/m². */
export function isVerrouille(code: string): boolean {
  return code in PRIX_VERROUILLES;
}

/** Coefficient par défaut pour une unité (1 si non concernée). */
export function coefDefautPourUnite(unite: string): number {
  return COEF_QTE_DEFAUT[unite] ?? 1;
}

/** PU de base d'un poste selon la gamme (HT). */
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

/** Calcule une ligne : quantité appliquée, PU final, total HT.
 * Robuste aux saisies vides/NaN ; `ferme` force le coefficient à 1. */
export function calculerLigne(ligne: LigneDevis): LigneCalculee {
  const coef = ligne.ferme ? 1 : ligne.coefQte || 1;
  const qteAppliquee = round2((ligne.qteBrute || 0) * coef);
  const puFinal = round2(ligne.puBase || 0);
  const totalHT = round2(qteAppliquee * puFinal);
  return { ...ligne, qteAppliquee, puFinal, totalHT };
}

/** Clé de lot d'une ligne : lot de rattachement AD-HOC, sinon préfixe du code, sinon "DIV". */
function cleLot(l: LigneCalculee): string {
  if (l.adHoc || l.code === "AD-HOC") return l.adHocLot || "DIV";
  return l.code.split("-")[0] || "DIV";
}

/**
 * Regroupe les lignes calculées par lot, triées dans l'ordre canonique TCE.
 * `ordreLot` donne l'index d'affichage d'un lot (par défaut : ordre d'insertion).
 * Les postes hors BPU sont regroupés sous "DIV — Divers / hors BPU", en fin.
 */
export function regrouperParLot(
  lignes: LigneCalculee[],
  lotTitre: (lot: string) => string,
  ordreLot: (lot: string) => number = () => 0,
): TotalLot[] {
  const map = new Map<string, LigneCalculee[]>();
  for (const l of lignes) {
    const lot = cleLot(l);
    const arr = map.get(lot) ?? [];
    arr.push(l);
    map.set(lot, arr);
  }
  const rang = (lot: string) => (lot === "DIV" ? 1000 : ordreLot(lot));
  return [...map.entries()]
    .sort((a, b) => rang(a[0]) - rang(b[0]))
    .map(([lot, lignesLot]) => ({
      lot,
      lotTitre: lot === "DIV" ? "Divers / hors BPU" : lotTitre(lot),
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
  ordreLot: (lot: string) => number = () => 0,
): SyntheseDevis {
  const calculees = lignes.map((l) => calculerLigne(l));
  const parLot = regrouperParLot(calculees, lotTitre, ordreLot);

  const htPostes = round2(calculees.reduce((s, l) => s + l.totalHT, 0));
  const montantImprevus = round2(htPostes * (params.tauxImprevus || 0));
  const totalHT = round2(htPostes + montantImprevus);

  // Bases HT par taux de TVA (postes uniquement).
  const baseParTaux = new Map<TauxTVA, number>();
  for (const l of calculees) {
    baseParTaux.set(l.tva, round2((baseParTaux.get(l.tva) ?? 0) + l.totalHT));
  }

  // Imprévus répartis au prorata, le résidu d'arrondi étant affecté au dernier
  // taux pour garantir Σ baseHT === totalHT au centime.
  const tauxTries = [...baseParTaux.entries()].sort((a, b) => a[0] - b[0]);
  let imprevusRestant = montantImprevus;
  const tvaParTaux: TotalTVA[] = tauxTries.map(([taux, basePostes], i) => {
    const partImprevus =
      i === tauxTries.length - 1
        ? round2(imprevusRestant)
        : htPostes > 0
          ? round2(montantImprevus * (basePostes / htPostes))
          : 0;
    imprevusRestant = round2(imprevusRestant - partImprevus);
    const baseHT = round2(basePostes + partImprevus);
    const montantTVA = round2(baseHT * (taux / 100));
    return { taux, baseHT, montantTVA };
  });

  const totalTVA = round2(tvaParTaux.reduce((s, t) => s + t.montantTVA, 0));
  const totalTTC = round2(totalHT + totalTVA);

  const surface = params.surfaceShab || 0;
  const ratioM2 = surface > 0 ? round2(totalHT / surface) : undefined;

  const montantAides = params.aides && params.aides > 0 ? round2(params.aides) : undefined;
  const resteACharge = montantAides ? round2(totalTTC - montantAides) : undefined;

  return {
    parLot,
    htPostes,
    montantImprevus,
    totalHT,
    tvaParTaux,
    totalTVA,
    totalTTC,
    ratioM2,
    montantAides,
    resteACharge,
  };
}

// ---------------------------------------------------------------------------
// Clause de révision (Specifications §2.4 / Guide §2.4)
// ---------------------------------------------------------------------------

/** Vrai si le démarrage prévisionnel est > 6 mois après l'émission. */
export function clauseRevisionRequise(
  dateEmission?: string,
  dateDemarrage?: string,
): boolean {
  if (!dateEmission || !dateDemarrage) return false;
  const e = new Date(dateEmission);
  const d = new Date(dateDemarrage);
  if (Number.isNaN(e.getTime()) || Number.isNaN(d.getTime())) return false;
  const seuil = new Date(e);
  const jour = seuil.getDate();
  seuil.setMonth(seuil.getMonth() + 6);
  // Évite le débordement (31 août + 6 mois ≠ 3 mars) : caler en fin de mois cible.
  if (seuil.getDate() !== jour) seuil.setDate(0);
  return d.getTime() > seuil.getTime();
}

// ---------------------------------------------------------------------------
// Export au format [DEVIS_UPDATE] (Specifications §7)
// ---------------------------------------------------------------------------

/**
 * Produit la charge utile JSON attendue par le programme historique
 * (format [DEVIS_UPDATE]). Les PU exportés sont les PU HT du BPU.
 */
export function versDevisUpdate(
  lignes: LigneDevis[],
  params: ParametresDevis,
  lotTitre: (lot: string) => string = (l) => l,
  ordreLot: (lot: string) => number = () => 0,
): { lots: Array<{ title: string; mentions?: MentionsLot; items: object[] }> } {
  const synthese = calculerSynthese(lignes, params, lotTitre, ordreLot);
  return {
    lots: synthese.parLot.map((lot) => ({
      title: `Lot ${lot.lot} — ${lot.lotTitre}`,
      mentions: params.mentionsParLot?.[lot.lot],
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

/**
 * Parse un bloc [DEVIS_UPDATE] (ou un JSON brut équivalent) en lignes de devis.
 * Le `qty` source est DÉJÀ chiffré (Guide §13) : on pose donc coefQte = 1 pour
 * ne pas re-majorer, et `pu` devient le PU de base.
 * Lève une erreur si le contenu n'est pas exploitable.
 */
export function parseDevisUpdate(texte: string): LigneDevis[] {
  const bloc = texte.match(/\[DEVIS_UPDATE\]([\s\S]*?)\[\/DEVIS_UPDATE\]/);
  const json = (bloc ? bloc[1] : texte).trim();
  const data = JSON.parse(json) as {
    lots?: Array<{ items?: Array<Record<string, unknown>> }>;
  };
  const tvaValide = (n: number): TauxTVA =>
    n === 5.5 || n === 20 ? n : 10;
  const lignes: LigneDevis[] = [];
  for (const lot of data.lots ?? []) {
    for (const it of lot.items ?? []) {
      const code = String(it.code ?? "").trim() || "AD-HOC";
      lignes.push({
        id: cryptoRandomId(),
        code,
        designation: String(it.designation ?? ""),
        unite: (String(it.unit ?? "F") as Unite) || "F",
        puBase: Number(it.pu) || 0,
        gamme: "MOY",
        qteBrute: Number(it.qty) || 0,
        coefQte: 1, // qty déjà chiffré côté source
        tva: tvaValide(Number(it.tva)),
        note: it.note ? String(it.note) : undefined,
        adHoc: code === "AD-HOC",
      });
    }
  }
  return lignes;
}
