"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import {
  BPU_PAR_CODE,
  LOTS,
  ordreDuLot,
  postesDuLot,
  rechercherBPU,
  titreLot,
} from "@/lib/bpu";
import {
  INDEXATION,
  calculerSynthese,
  clauseRevisionRequise,
  cryptoRandomId,
  isVerrouille,
  ligneDepuisPoste,
  parseDevisUpdate,
  puBaseRetenu,
  versDevisUpdate,
} from "@/lib/engine";
import { quantitesLiees } from "@/lib/pieces";
import {
  TEMPLATES_PIECE,
  genererPanier,
  lignesDepuisPanier,
  type ElementPanier,
} from "@/lib/templates-piece";
import { bumpVersion, genRef, versionDeRef } from "@/lib/ref";
import {
  TYPES_PROJET,
  detecterRecouvrements,
  genererLignesRapide,
  ouvragesPourType,
  selectionsDefaut,
  tvaSuggeree,
  tvaSuggereeSelection,
  type TypeProjetRapide,
} from "@/lib/rapide";
import type {
  Gamme,
  LigneCalculee,
  LigneDevis,
  ParametresDevis,
  PosteBPU,
  TauxTVA,
  TypeClient,
} from "@/lib/types";

const STORAGE_KEY = "lcb-chiffrage-v1";
const RECENTS_KEY = "lcb-recents-v1";

type Mode = "accueil" | "rapide" | "detaille" | "import";

function isoToday(): string {
  return new Date().toISOString().slice(0, 10);
}

const PARAMS_DEFAUT: ParametresDevis = {
  ref: genRef("", 1),
  client: "",
  adresse: "",
  typeProjet: "renovation_appartement",
  typeClient: "particulier",
  gammeDefaut: "MOY",
  tvaDefaut: 10,
  tauxImprevus: 0.04,
  surfaceShab: undefined,
  dateEmission: isoToday(),
  dateDemarragePrev: undefined,
  mentionsParLot: {},
};

const eur = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
});
const eur0 = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

/** Parse robuste d'un champ number (gère "", "-", "1,5", NaN → fallback). */
function num(v: string, fb = 0): number {
  const n = parseFloat(v.replace(",", "."));
  return Number.isFinite(n) ? n : fb;
}

/* Récents (localStorage) ------------------------------------------------- */
function lireRecents(): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(RECENTS_KEY) || "[]");
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}
function pousserRecent(code: string) {
  if (code === "AD-HOC") return;
  const cur = lireRecents().filter((c) => c !== code);
  cur.unshift(code);
  localStorage.setItem(RECENTS_KEY, JSON.stringify(cur.slice(0, 12)));
}

export default function Page() {
  const [mode, setMode] = useState<Mode>("accueil");
  const [params, setParams] = useState<ParametresDevis>(PARAMS_DEFAUT);
  const [lignes, setLignes] = useState<LigneDevis[]>([]);
  const [charge, setCharge] = useState(false);
  const [pendingRapide, setPendingRapide] = useState<LigneDevis[] | null>(null);

  useEffect(() => {
    try {
      const brut = localStorage.getItem(STORAGE_KEY);
      if (brut) {
        const data = JSON.parse(brut);
        if (data.params) setParams({ ...PARAMS_DEFAUT, ...data.params });
        if (Array.isArray(data.lignes)) setLignes(data.lignes);
        // L'état du wizard n'est pas persisté : ne pas rouvrir 'rapide' vide.
        if (data.mode === "detaille" || data.mode === "import") setMode(data.mode);
        else if (Array.isArray(data.lignes) && data.lignes.length)
          setMode("detaille");
      }
    } catch {
      /* ignore */
    }
    setCharge(true);
  }, []);

  useEffect(() => {
    if (!charge) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ params, lignes, mode }));
  }, [params, lignes, mode, charge]);

  function appliquerLignesGenerees(nouvelles: LigneDevis[]) {
    if (lignes.length === 0) {
      setLignes(nouvelles);
      setMode("detaille");
    } else {
      // Décision explicite via modale (remplacer / ajouter).
      setPendingRapide(nouvelles);
    }
  }

  function genererDepuisRapide(
    type: TypeProjetRapide,
    shab: number,
    gamme: Gamme,
    selections: { code: string; qte: number }[],
  ) {
    const tva = tvaSuggereeSelection(type, selections.map((s) => s.code));
    const nextParams: ParametresDevis = {
      ...params,
      typeProjet: type,
      gammeDefaut: gamme,
      tvaDefaut: tva,
      surfaceShab: shab > 0 ? shab : params.surfaceShab,
    };
    const nouvelles = genererLignesRapide(selections, nextParams, (c) =>
      BPU_PAR_CODE.get(c),
    );
    setParams(nextParams);
    appliquerLignesGenerees(nouvelles);
  }

  function importerLignes(nouvelles: LigneDevis[]) {
    appliquerLignesGenerees(nouvelles);
  }

  return (
    <div className="space-y-8">
      <ModeNav mode={mode} onChange={setMode} nbLignes={lignes.length} />

      {mode === "accueil" && (
        <Accueil
          nbLignes={lignes.length}
          onRapide={() => setMode("rapide")}
          onDetaille={() => setMode("detaille")}
          onImport={() => setMode("import")}
        />
      )}

      {mode === "rapide" && (
        <WizardRapide
          baseParams={params}
          onAnnuler={() => setMode("accueil")}
          onGenerer={genererDepuisRapide}
        />
      )}

      {mode === "detaille" && (
        <Detaille
          params={params}
          setParams={setParams}
          lignes={lignes}
          setLignes={setLignes}
        />
      )}

      {mode === "import" && (
        <ImportDevis
          onAnnuler={() => setMode("accueil")}
          onImporter={importerLignes}
        />
      )}

      {pendingRapide && (
        <Modale
          titre="Un chiffrage est déjà en cours"
          message={`${lignes.length} poste(s) sont déjà saisis. Que faire des nouveaux postes générés ?`}
          actions={[
            {
              label: "Remplacer",
              variant: "or",
              onClick: () => {
                setLignes(pendingRapide);
                setPendingRapide(null);
                setMode("detaille");
              },
            },
            {
              label: "Ajouter à la suite",
              variant: "ghost",
              onClick: () => {
                setLignes((ls) => [...ls, ...pendingRapide]);
                setPendingRapide(null);
                setMode("detaille");
              },
            },
            {
              label: "Annuler",
              variant: "ghost",
              onClick: () => setPendingRapide(null),
            },
          ]}
        />
      )}
    </div>
  );
}

/* ======================================================================= */
/* Navigation des modes                                                    */
/* ======================================================================= */

function ModeNav({
  mode,
  onChange,
  nbLignes,
}: {
  mode: Mode;
  onChange: (m: Mode) => void;
  nbLignes: number;
}) {
  const onglets: { id: Mode; label: string; badge?: number }[] = [
    { id: "accueil", label: "Accueil" },
    { id: "rapide", label: "Chiffrage rapide" },
    { id: "detaille", label: "Chiffrage détaillé", badge: nbLignes || undefined },
    { id: "import", label: "Importer" },
  ];
  return (
    <nav className="flex flex-wrap gap-1 rounded-lg border border-marine-50 bg-white p-1">
      {onglets.map((o) => (
        <button
          key={o.id}
          onClick={() => onChange(o.id)}
          className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition ${
            mode === o.id
              ? "bg-marine-900 text-creme"
              : "text-marine-700 hover:bg-marine-50"
          }`}
        >
          {o.label}
          {o.badge != null && (
            <span
              className={`rounded-full px-1.5 text-xs ${
                mode === o.id ? "bg-or text-marine-900" : "bg-marine-50 text-marine-700"
              }`}
            >
              {o.badge}
            </span>
          )}
        </button>
      ))}
    </nav>
  );
}

/* ======================================================================= */
/* Accueil                                                                 */
/* ======================================================================= */

function Accueil({
  nbLignes,
  onRapide,
  onDetaille,
  onImport,
}: {
  nbLignes: number;
  onRapide: () => void;
  onDetaille: () => void;
  onImport: () => void;
}) {
  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-marine-900">Nouveau chiffrage</h2>
        <p className="mt-1 text-sm text-marine-700/80">
          Choisissez le niveau de détail. Vous pourrez toujours basculer en mode
          détaillé pour affiner.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <CarteMode
          titre="Chiffrage rapide"
          puce="3 questions"
          desc="Ordre de grandeur en ouvrages complets clé en main (SDB, cuisine, rénovation au m²), avec total estimé en direct."
          cta="Démarrer le mode rapide"
          onClick={onRapide}
        />
        <CarteMode
          titre="Chiffrage détaillé"
          puce="DPGF / devis ferme"
          desc="Saisie lot par lot, poste élémentaire du BPU. Recherche, navigation par lot, pièces liées, vue client."
          cta={nbLignes > 0 ? `Reprendre (${nbLignes} postes)` : "Démarrer le mode détaillé"}
          onClick={onDetaille}
        />
        <CarteMode
          titre="Importer un devis"
          puce="[DEVIS_UPDATE]"
          desc="Coller un bloc [DEVIS_UPDATE] (programme historique) pour peupler le chiffrage et l'affiner."
          cta="Importer"
          onClick={onImport}
        />
      </div>
    </section>
  );
}

function CarteMode({
  titre,
  puce,
  desc,
  cta,
  onClick,
}: {
  titre: string;
  puce: string;
  desc: string;
  cta: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group flex h-full flex-col rounded-lg border border-marine-50 bg-white p-5 text-left transition hover:border-or hover:shadow-sm"
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="text-lg font-semibold text-marine-900">{titre}</h3>
        <span className="shrink-0 rounded-full bg-or/20 px-2 py-0.5 text-xs font-medium text-or-dark">
          {puce}
        </span>
      </div>
      <p className="flex-1 text-sm text-marine-700/80">{desc}</p>
      <span className="rule-or mt-4 inline-block pt-3 text-sm font-semibold text-marine-900 group-hover:text-or-dark">
        {cta} →
      </span>
    </button>
  );
}

/* ======================================================================= */
/* Mode rapide — wizard 3 étapes                                           */
/* ======================================================================= */

function WizardRapide({
  baseParams,
  onAnnuler,
  onGenerer,
}: {
  baseParams: ParametresDevis;
  onAnnuler: () => void;
  onGenerer: (
    type: TypeProjetRapide,
    shab: number,
    gamme: Gamme,
    selections: { code: string; qte: number }[],
  ) => void;
}) {
  const [etape, setEtape] = useState(1);
  const [type, setType] = useState<TypeProjetRapide>("renovation_appartement");
  const [shab, setShab] = useState(0);
  const [gamme, setGamme] = useState<Gamme>("MOY");
  const [sel, setSel] = useState<Record<string, { actif: boolean; qte: number }>>(
    () => selectionsDefaut("renovation_appartement", 0),
  );
  const prev = useRef({ type, shab });

  // Préserve la saisie manuelle : reset complet seulement si le TYPE change ;
  // sur changement de surface, ne met à jour que les quantités encore à leur défaut.
  useEffect(() => {
    setSel((cur) => {
      if (type !== prev.current.type) return selectionsDefaut(type, shab);
      const anciensDef = selectionsDefaut(type, prev.current.shab);
      const nouveauxDef = selectionsDefaut(type, shab);
      const next = { ...cur };
      for (const code of Object.keys(nouveauxDef)) {
        const c = cur[code];
        if (!c) {
          next[code] = nouveauxDef[code];
        } else if (anciensDef[code] && c.qte === anciensDef[code].qte) {
          next[code] = { ...c, qte: nouveauxDef[code].qte };
        }
      }
      return next;
    });
    prev.current = { type, shab };
  }, [type, shab]);

  const ouvrages = useMemo(() => ouvragesPourType(type), [type]);
  const groupes = useMemo(() => {
    const m = new Map<string, typeof ouvrages>();
    for (const o of ouvrages) {
      const arr = m.get(o.groupe) ?? [];
      arr.push(o);
      m.set(o.groupe, arr);
    }
    return [...m.entries()];
  }, [ouvrages]);

  const codesActifs = Object.entries(sel)
    .filter(([, v]) => v.actif && v.qte > 0)
    .map(([code]) => code);
  const nbActifs = codesActifs.length;
  const aQteManquante = Object.values(sel).some((v) => v.actif && !(v.qte > 0));
  const recouvrements = detecterRecouvrements(codesActifs);

  // Aperçu live (utilise le même moteur que la génération réelle).
  const apercu = useMemo(() => {
    const selections = codesActifs.map((code) => ({ code, qte: sel[code].qte }));
    const tva = tvaSuggereeSelection(type, selections.map((s) => s.code));
    const p: ParametresDevis = {
      ...baseParams,
      typeProjet: type,
      gammeDefaut: gamme,
      tvaDefaut: tva,
      surfaceShab: shab > 0 ? shab : undefined,
    };
    const lignes = genererLignesRapide(selections, p, (c) => BPU_PAR_CODE.get(c));
    return { synthese: calculerSynthese(lignes, p, titreLot, ordreDuLot), tva };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(sel), type, gamme, shab]);

  function generer() {
    onGenerer(
      type,
      shab,
      gamme,
      codesActifs.map((code) => ({ code, qte: sel[code].qte })),
    );
  }

  return (
    <section className="space-y-6">
      <Stepper
        etape={etape}
        libelles={["Le projet", "La gamme", "Les postes"]}
        onAller={(n) => n < etape && setEtape(n)}
      />

      {etape === 1 && (
        <div className="space-y-5">
          <div>
            <h3 className="mb-2 text-sm font-semibold text-marine-900">Type de projet</h3>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
              {TYPES_PROJET.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setType(t.value)}
                  className={`rounded-md border px-3 py-3 text-sm font-medium transition ${
                    type === t.value
                      ? "border-or bg-or/10 text-marine-900"
                      : "border-marine-50 bg-white text-marine-700 hover:border-or"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <div className="max-w-xs">
            <Field label="Surface SHAB / SHON (m²) — optionnel">
              <input
                className="input"
                type="number"
                min={0}
                step={1}
                value={shab || ""}
                placeholder="ex. 57"
                onChange={(e) => setShab(num(e.target.value))}
              />
            </Field>
            <p className="mt-1 text-xs text-marine-700/60">
              Préremplit les quantités et donne le ratio €/m². TVA suggérée :{" "}
              {String(tvaSuggeree(type)).replace(".", ",")} %.
            </p>
          </div>
          <NavEtapes onAnnuler={onAnnuler} onSuivant={() => setEtape(2)} suivantOk />
        </div>
      )}

      {etape === 2 && (
        <div className="space-y-5">
          <h3 className="text-sm font-semibold text-marine-900">Niveau de gamme</h3>
          <div className="grid gap-3 md:grid-cols-3">
            {(
              [
                ["MIN", "Économique", "Solutions d'entrée, optimisation budget"],
                ["MOY", "Standard", "Référence du BPU — le plus courant"],
                ["MAX", "Haut de gamme", "Prestations premium, finitions soignées"],
              ] as [Gamme, string, string][]
            ).map(([g, titre, desc]) => (
              <button
                key={g}
                onClick={() => setGamme(g)}
                className={`rounded-lg border p-4 text-left transition ${
                  gamme === g ? "border-or bg-or/10" : "border-marine-50 bg-white hover:border-or"
                }`}
              >
                <div className="font-semibold text-marine-900">{titre}</div>
                <div className="mt-1 text-xs text-marine-700/70">{desc}</div>
                <div className="mt-2 font-mono text-xs text-or-dark">{g}</div>
              </button>
            ))}
          </div>
          <NavEtapes
            onAnnuler={() => setEtape(1)}
            annulerLabel="← Précédent"
            onSuivant={() => setEtape(3)}
            suivantOk
          />
        </div>
      )}

      {etape === 3 && (
        <div className="space-y-5">
          <div>
            <h3 className="text-sm font-semibold text-marine-900">Postes à chiffrer</h3>
            <p className="text-xs text-marine-700/60">
              Cochez les ouvrages concernés et ajustez les quantités. Chaque ouvrage
              = un forfait clé en main (quantité ferme, sans coefficient).
            </p>
          </div>

          <div className="space-y-4">
            {groupes.map(([groupe, items]) => (
              <div key={groupe}>
                <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-or-dark">
                  {groupe}
                </div>
                <div className="divide-y divide-marine-50 rounded-md border border-marine-50">
                  {items.map((o) => {
                    const s = sel[o.code] ?? { actif: false, qte: 0 };
                    const unite = BPU_PAR_CODE.get(o.code)?.unite ?? "";
                    const alerte = s.actif && !(s.qte > 0);
                    return (
                      <label
                        key={o.code}
                        className={`flex cursor-pointer items-start gap-3 px-3 py-2 hover:bg-marine-50/50 ${
                          alerte ? "bg-or/5" : ""
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="mt-1 h-4 w-4 accent-[#C8A96A]"
                          checked={s.actif}
                          onChange={(e) =>
                            setSel((p) => ({ ...p, [o.code]: { ...s, actif: e.target.checked } }))
                          }
                        />
                        <span className="flex-1">
                          <span className="text-sm text-marine-900">
                            {o.label}
                            <span className="ml-2 font-mono text-xs text-marine-700/50">
                              {o.code}
                            </span>
                          </span>
                          <span className="block text-xs text-marine-700/55">{o.aide}</span>
                          {alerte && (
                            <span className="block text-xs text-or-dark">
                              Coché sans quantité — saisissez une valeur.
                            </span>
                          )}
                        </span>
                        <span className="flex shrink-0 items-center gap-1">
                          <input
                            type="number"
                            min={0}
                            step="any"
                            className="input !w-24 text-right"
                            value={s.qte || ""}
                            onChange={(e) =>
                              setSel((p) => ({
                                ...p,
                                [o.code]: { actif: true, qte: num(e.target.value) },
                              }))
                            }
                          />
                          <span className="w-6 text-xs text-marine-700/60">{unite}</span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {recouvrements.length > 0 && (
            <div className="rounded-md bg-or/10 px-3 py-2 text-xs text-or-dark">
              {recouvrements.map((m, i) => (
                <div key={i}>⚠️ {m}</div>
              ))}
            </div>
          )}

          {/* Aperçu live */}
          <div className="rounded-lg border border-marine-50 bg-marine-50/40 p-4">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-marine-700">
              Estimation en direct
            </div>
            {nbActifs === 0 ? (
              <p className="text-sm text-marine-700/60">
                Cochez au moins un poste pour voir l'estimation.
              </p>
            ) : (
              <div className="flex flex-wrap items-end justify-between gap-4 text-sm">
                <dl className="space-y-0.5">
                  <ApercuRow label="Total HT" value={eur.format(apercu.synthese.totalHT)} />
                  <ApercuRow
                    label={`TVA ${String(apercu.tva).replace(".", ",")} %`}
                    value={eur.format(apercu.synthese.totalTVA)}
                  />
                  <ApercuRow
                    label="Total TTC"
                    value={eur.format(apercu.synthese.totalTTC)}
                    strong
                  />
                </dl>
                {apercu.synthese.ratioM2 != null && (
                  <div className="text-right">
                    <div className="text-2xl font-semibold text-marine-900 tabular-nums">
                      {eur0.format(apercu.synthese.ratioM2)}
                    </div>
                    <div className="text-xs text-marine-700/60">par m² HT</div>
                  </div>
                )}
              </div>
            )}
          </div>

          <NavEtapes
            onAnnuler={() => setEtape(2)}
            annulerLabel="← Précédent"
            onSuivant={generer}
            suivantLabel={
              nbActifs > 0
                ? `Générer — ${eur0.format(apercu.synthese.totalTTC)} TTC`
                : "Générer le chiffrage"
            }
            suivantOk={nbActifs > 0 && !aQteManquante}
          />
        </div>
      )}
    </section>
  );
}

function ApercuRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-6">
      <dt className={strong ? "font-semibold text-marine-900" : "text-marine-700"}>{label}</dt>
      <dd className={`tabular-nums ${strong ? "font-semibold text-marine-900" : "text-marine-700"}`}>
        {value}
      </dd>
    </div>
  );
}

function Stepper({
  etape,
  libelles,
  onAller,
}: {
  etape: number;
  libelles: string[];
  onAller?: (n: number) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      {libelles.map((lib, i) => {
        const n = i + 1;
        const actif = n === etape;
        const fait = n < etape;
        return (
          <div key={lib} className="flex items-center gap-2">
            <button
              onClick={() => onAller?.(n)}
              disabled={!fait}
              aria-current={actif ? "step" : undefined}
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition ${
                actif
                  ? "bg-marine-900 text-creme"
                  : fait
                    ? "bg-or text-marine-900 hover:bg-or-dark"
                    : "bg-marine-50 text-marine-700"
              }`}
            >
              {n}
            </button>
            <span className={`text-sm ${actif ? "font-semibold text-marine-900" : "text-marine-700/70"}`}>
              {lib}
            </span>
            {n < libelles.length && <span className="mx-1 h-px w-6 bg-marine-50" />}
          </div>
        );
      })}
    </div>
  );
}

function NavEtapes({
  onAnnuler,
  annulerLabel = "Annuler",
  onSuivant,
  suivantLabel = "Suivant →",
  suivantOk,
}: {
  onAnnuler: () => void;
  annulerLabel?: string;
  onSuivant: () => void;
  suivantLabel?: string;
  suivantOk: boolean;
}) {
  return (
    <div className="flex items-center justify-between border-t border-marine-50 pt-4">
      <button className="btn-ghost" onClick={onAnnuler}>
        {annulerLabel}
      </button>
      <button className="btn-or" onClick={onSuivant} disabled={!suivantOk}>
        {suivantLabel}
      </button>
    </div>
  );
}

/* ======================================================================= */
/* Import [DEVIS_UPDATE]                                                    */
/* ======================================================================= */

function ImportDevis({
  onAnnuler,
  onImporter,
}: {
  onAnnuler: () => void;
  onImporter: (lignes: LigneDevis[]) => void;
}) {
  const [texte, setTexte] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);

  function lancer() {
    try {
      const lignes = parseDevisUpdate(texte);
      if (lignes.length === 0) {
        setErreur("Aucune ligne trouvée dans le bloc.");
        return;
      }
      setErreur(null);
      onImporter(lignes);
    } catch {
      setErreur("Format invalide : collez un bloc [DEVIS_UPDATE] ou un JSON conforme.");
    }
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-marine-900">Importer un devis</h2>
        <p className="mt-1 text-sm text-marine-700/80">
          Collez un bloc <code className="font-mono text-xs">[DEVIS_UPDATE]…[/DEVIS_UPDATE]</code>{" "}
          (les quantités sont reprises telles quelles, sans re-majoration).
        </p>
      </div>
      <textarea
        className="input min-h-48 font-mono text-xs"
        placeholder={`[DEVIS_UPDATE]\n{"lots":[{"title":"Lot RS — …","items":[{"code":"RS-01","designation":"…","unit":"m²","qty":25,"pu":50,"total":1250,"tva":10,"note":""}]}]}\n[/DEVIS_UPDATE]`}
        value={texte}
        onChange={(e) => setTexte(e.target.value)}
      />
      {erreur && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">{erreur}</p>
      )}
      <div className="flex items-center justify-between border-t border-marine-50 pt-4">
        <button className="btn-ghost" onClick={onAnnuler}>
          Annuler
        </button>
        <button className="btn-or" onClick={lancer} disabled={!texte.trim()}>
          Importer dans le chiffrage
        </button>
      </div>
    </section>
  );
}

/* ======================================================================= */
/* Mode détaillé — éditeur                                                  */
/* ======================================================================= */

function Detaille({
  params,
  setParams,
  lignes,
  setLignes,
}: {
  params: ParametresDevis;
  setParams: React.Dispatch<React.SetStateAction<ParametresDevis>>;
  lignes: LigneDevis[];
  setLignes: React.Dispatch<React.SetStateAction<LigneDevis[]>>;
}) {
  const [qteRef, setQteRef] = useState(1);
  const [filtre, setFiltre] = useState("");
  const [vueClient, setVueClient] = useState(false);
  const [aSupprimer, setASupprimer] = useState<string | null>(null);
  const [viderDemande, setViderDemande] = useState(false);

  const synthese = useMemo(
    () => calculerSynthese(lignes, params, titreLot, ordreDuLot),
    [lignes, params],
  );
  const attestationTVA = synthese.tvaParTaux.some((t) => t.taux < 20);
  const revision = clauseRevisionRequise(params.dateEmission, params.dateDemarragePrev);
  const codesPresents = useMemo(() => new Set(lignes.map((l) => l.code)), [lignes]);

  function setParam<K extends keyof ParametresDevis>(k: K, v: ParametresDevis[K]) {
    setParams((p) => ({ ...p, [k]: v }));
  }

  // Vrai si la réf est encore celle qu'aurait produite genRef (non éditée à la main).
  function refEstAuto(p: ParametresDevis): boolean {
    return (
      p.ref ===
      genRef(p.client, versionDeRef(p.ref), new Date(p.dateEmission || isoToday()))
    );
  }

  function majClient(client: string) {
    setParams((p) => ({
      ...p,
      client,
      ref: refEstAuto(p)
        ? genRef(client, versionDeRef(p.ref), new Date(p.dateEmission || isoToday()))
        : p.ref, // réf éditée manuellement : préservée
    }));
  }

  function majDateEmission(date: string | undefined) {
    setParams((p) => ({
      ...p,
      dateEmission: date,
      ref: refEstAuto(p)
        ? genRef(p.client, versionDeRef(p.ref), new Date(date || isoToday()))
        : p.ref,
    }));
  }

  function nouvelleVersion() {
    setParam("ref", bumpVersion(params.ref));
  }

  function ajouterPoste(poste: PosteBPU) {
    setLignes((ls) => [...ls, ligneDepuisPoste(poste, params, qteRef || 1)]);
    pousserRecent(poste.code);
  }

  function ajouterPanier(
    selection: ElementPanier[],
    occurrences: number,
    zone: string,
  ) {
    const nouvelles = lignesDepuisPanier(selection, occurrences, zone, (code, qte) => {
      const poste = BPU_PAR_CODE.get(code);
      return poste ? ligneDepuisPoste(poste, params, qte) : null;
    });
    if (!nouvelles.length) return;
    setLignes((ls) => [...ls, ...nouvelles]);
    nouvelles.forEach((l) => pousserRecent(l.code));
  }

  function ajouterAdHoc() {
    setLignes((ls) => [
      ...ls,
      {
        id: cryptoRandomId(),
        code: "AD-HOC",
        designation: "",
        unite: "F",
        puBase: 0,
        gamme: params.gammeDefaut,
        qteBrute: qteRef || 1,
        coefQte: 1,
        tva: params.tvaDefaut,
        adHoc: true,
      },
    ]);
  }

  function majLigne(id: string, patch: Partial<LigneDevis>) {
    setLignes((ls) =>
      ls.map((l) => {
        if (l.id !== id) return l;
        const next = { ...l, ...patch };
        if (patch.gamme && !l.adHoc) {
          const poste = BPU_PAR_CODE.get(l.code);
          if (poste) next.puBase = puBaseRetenu(poste, patch.gamme);
        }
        return next;
      }),
    );
  }

  function dupliquer(id: string) {
    setLignes((ls) => {
      const i = ls.findIndex((l) => l.id === id);
      if (i === -1) return ls;
      const copie = { ...ls[i], id: cryptoRandomId() };
      return [...ls.slice(0, i + 1), copie, ...ls.slice(i + 1)];
    });
  }

  function supprimer(id: string) {
    setLignes((ls) => ls.filter((l) => l.id !== id));
  }

  function appliquerGammeLot(lot: string, gamme: Gamme) {
    setLignes((ls) =>
      ls.map((l) => {
        const cle = l.adHoc || l.code === "AD-HOC" ? "DIV" : l.code.split("-")[0];
        // On épargne les postes hors BPU et les prix verrouillés (gamme sans effet).
        if (cle !== lot || l.adHoc || isVerrouille(l.code)) return l;
        const poste = BPU_PAR_CODE.get(l.code);
        return poste ? { ...l, gamme, puBase: puBaseRetenu(poste, gamme) } : { ...l, gamme };
      }),
    );
  }

  function setMentions(lot: string, patch: Partial<{ inclus: string; exclus: string; conditions: string }>) {
    setParams((p) => {
      const m = { ...(p.mentionsParLot ?? {}) };
      m[lot] = { ...m[lot], ...patch };
      return { ...p, mentionsParLot: m };
    });
  }

  function exporterJSON() {
    const payload = versDevisUpdate(lignes, params, titreLot, ordreDuLot);
    const txt = `[DEVIS_UPDATE]\n${JSON.stringify(payload)}\n[/DEVIS_UPDATE]`;
    const blob = new Blob([txt], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${params.ref}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-8">
      {/* Bandeau récap collant */}
      {lignes.length > 0 && (
        <div className="sticky top-0 z-10 -mx-1 flex flex-wrap items-center justify-between gap-3 rounded-md border border-or/40 bg-creme/95 px-4 py-2 text-sm shadow-sm backdrop-blur">
          <span className="font-mono text-xs text-marine-700/70">{params.ref}</span>
          <div className="flex flex-wrap items-center gap-4">
            <RecapPill label="HT" value={eur0.format(synthese.totalHT)} />
            <RecapPill label="TTC" value={eur0.format(synthese.totalTTC)} strong />
            {synthese.ratioM2 != null && (
              <RecapPill label="€/m²" value={eur0.format(synthese.ratioM2)} />
            )}
          </div>
        </div>
      )}

      {/* Paramètres projet */}
      <section>
        <h2 className="rule-or mb-3 pb-1 text-base font-semibold">Paramètres du devis</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Field label="Référence">
            <div className="flex gap-1">
              <input
                className="input"
                value={params.ref}
                onChange={(e) => setParam("ref", e.target.value)}
              />
              <button
                className="btn-ghost shrink-0 px-2"
                title="Nouvelle version (V+1)"
                onClick={nouvelleVersion}
              >
                V+1
              </button>
            </div>
          </Field>
          <Field label="Client">
            <input
              className="input"
              value={params.client}
              onChange={(e) => majClient(e.target.value)}
            />
          </Field>
          <Field label="Adresse chantier">
            <input
              className="input"
              value={params.adresse}
              onChange={(e) => setParam("adresse", e.target.value)}
            />
          </Field>
          <Field label="Type de projet">
            <input
              className="input"
              value={params.typeProjet}
              onChange={(e) => setParam("typeProjet", e.target.value)}
            />
          </Field>
          <Field label="Surface SHAB (m²)">
            <input
              className="input"
              type="number"
              min={0}
              step={1}
              value={params.surfaceShab ?? ""}
              onChange={(e) =>
                setParam("surfaceShab", e.target.value === "" ? undefined : num(e.target.value))
              }
            />
          </Field>
          <Field label="Type de client">
            <select
              className="input"
              value={params.typeClient}
              onChange={(e) => setParam("typeClient", e.target.value as TypeClient)}
            >
              <option value="particulier">Particulier</option>
              <option value="erp">ERP</option>
              <option value="pro">Professionnel</option>
            </select>
          </Field>
          <Field label="Gamme par défaut">
            <select
              className="input"
              value={params.gammeDefaut}
              onChange={(e) => setParam("gammeDefaut", e.target.value as Gamme)}
            >
              <option value="MIN">Économique (MIN)</option>
              <option value="MOY">Standard (MOY)</option>
              <option value="MAX">Haut de gamme (MAX)</option>
            </select>
          </Field>
          <Field label="TVA par défaut">
            <select
              className="input"
              value={params.tvaDefaut}
              onChange={(e) => setParam("tvaDefaut", Number(e.target.value) as TauxTVA)}
            >
              <option value={5.5}>5,5 % (énergétique)</option>
              <option value={10}>10 % (rénovation)</option>
              <option value={20}>20 % (neuf / pro)</option>
            </select>
          </Field>
          <Field label="Imprévus (% du HT) — reco 3 à 5 %">
            <input
              className="input"
              type="number"
              step={0.5}
              min={0}
              max={10}
              value={Math.round(params.tauxImprevus * 1000) / 10}
              onChange={(e) =>
                setParam("tauxImprevus", Math.min(0.1, Math.max(0, num(e.target.value) / 100)))
              }
            />
          </Field>
          <Field label="Date d'émission">
            <input
              className="input"
              type="date"
              value={params.dateEmission ?? ""}
              onChange={(e) => majDateEmission(e.target.value || undefined)}
            />
          </Field>
          <Field label="Démarrage prévisionnel">
            <input
              className="input"
              type="date"
              value={params.dateDemarragePrev ?? ""}
              onChange={(e) => setParam("dateDemarragePrev", e.target.value || undefined)}
            />
          </Field>
        </div>
        <p className="mt-2 text-xs text-marine-700/60">Prix HT du BPU, indexés {INDEXATION}.</p>
        {revision && (
          <p className="mt-2 rounded-md bg-or/10 px-3 py-2 text-xs text-or-dark">
            ⚠️ Démarrage &gt; 6 mois après émission : prévoir une clause de révision
            (indices BT).
          </p>
        )}
      </section>

      {/* Ajout de postes */}
      <AjoutPostes
        qteRef={qteRef}
        setQteRef={setQteRef}
        onAjouter={ajouterPoste}
        onAdHoc={ajouterAdHoc}
        onAjouterPanier={ajouterPanier}
        codesPresents={codesPresents}
      />

      {/* Lignes de chiffrage */}
      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="rule-or flex-1 pb-1 text-base font-semibold">
            Chiffrage ({lignes.length} poste{lignes.length > 1 ? "s" : ""})
          </h2>
          <input
            className="input !w-56"
            placeholder="Filtrer le chiffrage…"
            value={filtre}
            onChange={(e) => setFiltre(e.target.value)}
          />
          <button
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
              vueClient ? "bg-marine-900 text-creme" : "border border-marine-50 text-marine-700 hover:border-or"
            }`}
            onClick={() => setVueClient((v) => !v)}
          >
            {vueClient ? "Vue interne" : "Vue client"}
          </button>
          {lignes.length > 0 && (
            <button
              className="text-xs text-marine-700/50 hover:text-red-600"
              onClick={() => setViderDemande(true)}
            >
              Tout vider
            </button>
          )}
        </div>

        {vueClient ? (
          <VueClient synthese={synthese} tauxImprevus={params.tauxImprevus} eur={eur} />
        ) : (
          <div className="overflow-x-auto rounded-md border border-marine-50">
            <table className="w-full min-w-[940px] text-sm">
              <thead className="bg-marine-900 text-creme">
                <tr>
                  <Th>Code</Th>
                  <Th className="text-left">Désignation</Th>
                  <Th>Gamme</Th>
                  <Th>Qté</Th>
                  <Th>Coef</Th>
                  <Th>Qté ret.</Th>
                  <Th>PU HT</Th>
                  <Th>TVA</Th>
                  <Th>Total HT</Th>
                  <Th></Th>
                </tr>
              </thead>
              <tbody>
                {synthese.parLot.map((lot) => (
                  <LotRows
                    key={lot.lot}
                    lot={lot}
                    filtre={filtre}
                    mentions={params.mentionsParLot?.[lot.lot]}
                    onMentions={(patch) => setMentions(lot.lot, patch)}
                    onAppliquerGamme={(g) => appliquerGammeLot(lot.lot, g)}
                    onMaj={majLigne}
                    onDupliquer={dupliquer}
                    onSupprimer={(id) => setASupprimer(id)}
                  />
                ))}
                {lignes.length === 0 && (
                  <tr>
                    <td colSpan={10} className="px-3 py-6 text-center text-marine-700/60">
                      Aucun poste. Ajoutez-en ci-dessus, ou passez par le mode rapide.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Synthèse + export */}
      <section className="grid gap-6 md:grid-cols-2">
        <div>
          <h2 className="rule-or mb-3 pb-1 text-base font-semibold">Synthèse</h2>
          <dl className="space-y-1.5 text-sm">
            <Row label="HT postes" value={eur.format(synthese.htPostes)} />
            <Row
              label={`Imprévus (${Math.round(params.tauxImprevus * 1000) / 10} %)`}
              value={eur.format(synthese.montantImprevus)}
            />
            <Row label="Total HT" value={eur.format(synthese.totalHT)} strong />
            {synthese.tvaParTaux.map((t) => (
              <Row
                key={t.taux}
                label={`TVA ${String(t.taux).replace(".", ",")} %`}
                value={eur.format(t.montantTVA)}
              />
            ))}
            <Row label="Total TVA" value={eur.format(synthese.totalTVA)} />
            <Row label="Total TTC" value={eur.format(synthese.totalTTC)} strong />
            {synthese.ratioM2 != null && (
              <Row label="Ratio €/m² HT" value={eur.format(synthese.ratioM2)} />
            )}
          </dl>
          {attestationTVA && lignes.length > 0 && (
            <p className="mt-3 rounded-md bg-or/10 px-3 py-2 text-xs text-or-dark">
              ⚠️ TVA &lt; 20 % : attestation TVA simplifiée à joindre au devis.
            </p>
          )}
          <p className="mt-3 text-xs text-marine-700/60">Prix HT du BPU, indexés {INDEXATION}.</p>
        </div>

        <div>
          <h2 className="rule-or mb-3 pb-1 text-base font-semibold">Export</h2>
          <button className="btn-or" onClick={exporterJSON} disabled={lignes.length === 0}>
            Exporter [DEVIS_UPDATE]
          </button>
          <p className="mt-3 text-xs text-marine-700/60">
            Format compatible avec le programme historique LCB. Les exports Excel / PDF
            brandés sont prévus en phase suivante.
          </p>
        </div>
      </section>

      {aSupprimer && (
        <Modale
          titre="Supprimer la ligne ?"
          message="Cette ligne sera retirée du chiffrage."
          actions={[
            {
              label: "Supprimer",
              variant: "or",
              onClick: () => {
                supprimer(aSupprimer);
                setASupprimer(null);
              },
            },
            { label: "Annuler", variant: "ghost", onClick: () => setASupprimer(null) },
          ]}
        />
      )}
      {viderDemande && (
        <Modale
          titre="Vider tout le chiffrage ?"
          message={`Les ${lignes.length} postes seront supprimés.`}
          actions={[
            {
              label: "Tout vider",
              variant: "or",
              onClick: () => {
                setLignes([]);
                setViderDemande(false);
              },
            },
            { label: "Annuler", variant: "ghost", onClick: () => setViderDemande(false) },
          ]}
        />
      )}
    </div>
  );
}

function RecapPill({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <span className="flex items-baseline gap-1.5">
      <span className="text-xs uppercase text-marine-700/60">{label}</span>
      <span className={`tabular-nums ${strong ? "text-base font-semibold text-marine-900" : "text-marine-700"}`}>
        {value}
      </span>
    </span>
  );
}

/* ---- Vue consolidée client ---- */
function VueClient({
  synthese,
  tauxImprevus,
  eur,
}: {
  synthese: ReturnType<typeof calculerSynthese>;
  tauxImprevus: number;
  eur: Intl.NumberFormat;
}) {
  // Regroupe par groupeClient si présent, sinon par intitulé de lot.
  const groupes = new Map<string, number>();
  for (const lot of synthese.parLot) {
    for (const l of lot.lignes) {
      const cle = l.groupeClient?.trim() || lot.lotTitre;
      groupes.set(cle, (groupes.get(cle) ?? 0) + l.totalHT);
    }
  }
  const lignes = [...groupes.entries()];
  return (
    <div className="overflow-hidden rounded-md border border-marine-50">
      <table className="w-full text-sm">
        <thead className="bg-marine-900 text-creme">
          <tr>
            <th className="px-3 py-2 text-left text-xs font-semibold">Prestation</th>
            <th className="px-3 py-2 text-right text-xs font-semibold">Montant HT</th>
          </tr>
        </thead>
        <tbody>
          {lignes.map(([cle, total]) => (
            <tr key={cle} className="border-b border-marine-50 last:border-0">
              <td className="px-3 py-2 text-marine-900">{cle}</td>
              <td className="px-3 py-2 text-right tabular-nums">{eur.format(total)}</td>
            </tr>
          ))}
          {lignes.length === 0 && (
            <tr>
              <td colSpan={2} className="px-3 py-6 text-center text-marine-700/60">
                Aucun poste.
              </td>
            </tr>
          )}
          {synthese.montantImprevus > 0 && lignes.length > 0 && (
            <tr className="border-b border-marine-50">
              <td className="px-3 py-2 text-marine-900">
                Imprévus / aléas ({Math.round(tauxImprevus * 1000) / 10} %)
              </td>
              <td className="px-3 py-2 text-right tabular-nums">
                {eur.format(synthese.montantImprevus)}
              </td>
            </tr>
          )}
        </tbody>
        <tfoot>
          <tr className="bg-or/15 font-semibold text-marine-900">
            <td className="px-3 py-2">Total HT</td>
            <td className="px-3 py-2 text-right tabular-nums">{eur.format(synthese.totalHT)}</td>
          </tr>
        </tfoot>
      </table>
      <p className="px-3 py-2 text-xs text-marine-700/60">
        Vue client consolidée — codes BPU et notes internes masqués.
      </p>
    </div>
  );
}

/* ---- Ajout de postes : recherche + lots + récents + pièce ---- */

function AjoutPostes({
  qteRef,
  setQteRef,
  onAjouter,
  onAdHoc,
  onAjouterPanier,
  codesPresents,
}: {
  qteRef: number;
  setQteRef: (n: number) => void;
  onAjouter: (poste: PosteBPU) => void;
  onAdHoc: () => void;
  onAjouterPanier: (selection: ElementPanier[], occurrences: number, zone: string) => void;
  codesPresents: Set<string>;
}) {
  const [vue, setVue] = useState<"recherche" | "lots" | "recents" | "piece">("recherche");
  const [query, setQuery] = useState("");
  const [lotOuvert, setLotOuvert] = useState<string | null>(null);
  const [filtreLot, setFiltreLot] = useState("");
  const [recents, setRecents] = useState<string[]>([]);

  // Configurateur de pièce
  const [pType, setPType] = useState(TEMPLATES_PIECE[0].id);
  const [pSurf, setPSurf] = useState(0);
  const [pPerim, setPPerim] = useState(0);
  const [pHaut, setPHaut] = useState(2.5);
  const [pNb, setPNb] = useState(1);
  const [pZone, setPZone] = useState("");
  const [panier, setPanier] = useState<ElementPanier[]>([]);

  useEffect(() => {
    if (vue === "recents") setRecents(lireRecents());
  }, [vue]);

  // Régénère le panier quand le type ou les dimensions changent.
  const template = TEMPLATES_PIECE.find((t) => t.id === pType) ?? TEMPLATES_PIECE[0];
  useEffect(() => {
    setPanier(
      genererPanier(
        template,
        { surfaceSol: pSurf, perimetre: pPerim || undefined, hauteur: pHaut },
        (c) => BPU_PAR_CODE.get(c),
      ),
    );
    if (!pZone) setPZone(template.nom);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pType, pSurf, pPerim, pHaut]);

  const tousResultats = useMemo(() => rechercherBPU(query), [query]);
  const resultats = tousResultats.slice(0, 30);
  const panierCoche = panier.filter((e) => e.coche && e.qte > 0);

  return (
    <section>
      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <h2 className="rule-or flex-1 pb-1 text-base font-semibold">Ajouter des postes</h2>
        <Field label="Quantité de référence (pré-remplie à l'ajout)">
          <input
            className="input !w-40 text-right"
            type="number"
            min={0}
            step="any"
            value={qteRef || ""}
            onChange={(e) => setQteRef(num(e.target.value, 1))}
          />
        </Field>
      </div>

      <div className="mb-3 flex flex-wrap gap-1 text-sm">
        {(
          [
            ["recherche", "Recherche"],
            ["lots", "Parcourir par lot"],
            ["recents", "Récents"],
            ["piece", "Configurer une pièce"],
          ] as [typeof vue, string][]
        ).map(([v, label]) => (
          <button
            key={v}
            onClick={() => setVue(v)}
            className={`rounded-md px-3 py-1.5 font-medium transition ${
              vue === v ? "bg-marine-900 text-creme" : "text-marine-700 hover:bg-marine-50"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {vue === "recherche" && (
        <>
          <input
            className="input mb-2"
            placeholder="Rechercher (code, désignation — accents et synonymes gérés : placo, vmc…)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {tousResultats.length > 30 && (
            <p className="mb-2 text-xs text-marine-700/60">
              {tousResultats.length} résultats — 30 premiers affichés, affinez la recherche.
            </p>
          )}
          <PostesTable postes={resultats} codesPresents={codesPresents} onAjouter={onAjouter} />
        </>
      )}

      {vue === "lots" && (
        <div className="space-y-1.5">
          {LOTS.map((l) => {
            const postes = postesDuLot(l.lot);
            const fil = filtreLot.trim()
              ? postes.filter((p) =>
                  `${p.code} ${p.designation}`
                    .toLowerCase()
                    .includes(filtreLot.toLowerCase()),
                )
              : postes;
            return (
              <div key={l.lot} className="overflow-hidden rounded-md border border-marine-50">
                <button
                  onClick={() => setLotOuvert((c) => (c === l.lot ? null : l.lot))}
                  className="flex w-full items-center justify-between bg-white px-3 py-2 text-left text-sm hover:bg-marine-50/60"
                >
                  <span className="font-medium text-marine-900">
                    <span className="font-mono text-xs text-or-dark">{l.lot}</span>
                    {" — "}
                    {l.titre}
                  </span>
                  <span className="text-xs text-marine-700/50">
                    {l.nb} poste{l.nb > 1 ? "s" : ""} {lotOuvert === l.lot ? "▾" : "▸"}
                  </span>
                </button>
                {lotOuvert === l.lot && (
                  <div className="border-t border-marine-50">
                    {l.nb > 8 && (
                      <input
                        className="input m-2 !w-[calc(100%-1rem)]"
                        placeholder={`Filtrer dans ${l.lot}…`}
                        value={filtreLot}
                        onChange={(e) => setFiltreLot(e.target.value)}
                      />
                    )}
                    <PostesTable postes={fil} codesPresents={codesPresents} onAjouter={onAjouter} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {vue === "recents" && (
        <PostesTable
          postes={recents.map((c) => BPU_PAR_CODE.get(c)).filter(Boolean) as PosteBPU[]}
          codesPresents={codesPresents}
          onAjouter={onAjouter}
          vide="Aucun poste récent — ajoutez des postes pour les retrouver ici."
        />
      )}

      {vue === "piece" && (
        <div className="rounded-md border border-marine-50 p-4">
          <p className="mb-3 text-xs text-marine-700/70">
            Choisissez un <b>type de pièce</b> et ses dimensions : l'outil pré-coche les
            postes pertinents avec leurs quantités (sol = surface, plinthes = périmètre,
            faïence = murs, équipements à l'unité). Ajustez, puis ajoutez la sélection —
            multipliée par le nombre de pièces identiques.
          </p>

          {/* Type de pièce */}
          <div className="mb-3 flex flex-wrap gap-2">
            {TEMPLATES_PIECE.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setPType(t.id);
                  setPZone(t.nom);
                }}
                className={`rounded-md border px-3 py-1.5 text-sm font-medium transition ${
                  pType === t.id
                    ? "border-or bg-or/10 text-marine-900"
                    : "border-marine-50 bg-white text-marine-700 hover:border-or"
                }`}
              >
                {t.nom}
              </button>
            ))}
          </div>
          {template.note && (
            <p className="mb-3 text-xs text-marine-700/55">{template.note}</p>
          )}

          {/* Dimensions + occurrences + zone */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
            <Field label="Surface sol (m²)">
              <input
                className="input text-right"
                type="number"
                min={0}
                step="any"
                value={pSurf || ""}
                onChange={(e) => setPSurf(num(e.target.value))}
              />
            </Field>
            <Field label="Périmètre (ml)">
              <input
                className="input text-right"
                type="number"
                min={0}
                step="any"
                value={pPerim || ""}
                placeholder={pSurf ? `≈ ${quantitesLiees({ surfaceSol: pSurf }).perimetre}` : ""}
                onChange={(e) => setPPerim(num(e.target.value))}
              />
            </Field>
            <Field label="Hauteur (m)">
              <input
                className="input text-right"
                type="number"
                min={0}
                step="any"
                value={pHaut || ""}
                onChange={(e) => setPHaut(num(e.target.value, 2.5))}
              />
            </Field>
            <Field label="Pièces identiques (×N)">
              <input
                className="input text-right"
                type="number"
                min={1}
                step={1}
                value={pNb || ""}
                onChange={(e) => setPNb(Math.max(1, Math.floor(num(e.target.value, 1))))}
              />
            </Field>
            <Field label="Nom de zone (vue client)">
              <input
                className="input"
                value={pZone}
                placeholder={template.nom}
                onChange={(e) => setPZone(e.target.value)}
              />
            </Field>
          </div>

          {/* Panier de postes */}
          {pSurf > 0 ? (
            <>
              <div className="mt-3 max-h-72 divide-y divide-marine-50 overflow-auto rounded-md border border-marine-50">
                {panier.map((el, i) => (
                  <label
                    key={el.code}
                    className="flex items-center gap-3 px-3 py-1.5 hover:bg-marine-50/40"
                  >
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-[#C8A96A]"
                      checked={el.coche}
                      onChange={(e) =>
                        setPanier((p) =>
                          p.map((x, j) => (j === i ? { ...x, coche: e.target.checked } : x)),
                        )
                      }
                    />
                    <span className="w-20 shrink-0 font-mono text-xs text-or-dark">
                      {el.code}
                    </span>
                    <span className="flex-1 text-sm text-marine-900">{el.designation}</span>
                    <input
                      type="number"
                      min={0}
                      step="any"
                      className="input !w-20 text-right"
                      value={el.qte || ""}
                      onChange={(e) =>
                        setPanier((p) =>
                          p.map((x, j) => (j === i ? { ...x, qte: num(e.target.value) } : x)),
                        )
                      }
                    />
                    <span className="w-6 text-xs text-marine-700/60">{el.unite}</span>
                  </label>
                ))}
                {panier.length === 0 && (
                  <p className="px-3 py-3 text-sm text-marine-700/60">
                    Aucun poste disponible pour ce type.
                  </p>
                )}
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-marine-700/60">
                  {panierCoche.length} poste{panierCoche.length > 1 ? "s" : ""} sélectionné
                  {panierCoche.length > 1 ? "s" : ""}
                  {pNb > 1 ? ` × ${pNb} pièces` : ""}
                </span>
                <button
                  className="btn-or"
                  disabled={panierCoche.length === 0}
                  onClick={() => onAjouterPanier(panierCoche, pNb, pZone.trim() || template.nom)}
                >
                  Ajouter au chiffrage ({panierCoche.length * pNb} lignes)
                </button>
              </div>
            </>
          ) : (
            <p className="mt-3 text-sm text-marine-700/60">
              Saisissez la surface au sol pour générer le panier de postes.
            </p>
          )}
        </div>
      )}

      <button className="btn-ghost mt-3" onClick={onAdHoc}>
        + Poste AD-HOC (hors BPU)
      </button>
    </section>
  );
}

function PostesTable({
  postes,
  codesPresents,
  onAjouter,
  vide = "Aucun poste trouvé.",
}: {
  postes: PosteBPU[];
  codesPresents: Set<string>;
  onAjouter: (poste: PosteBPU) => void;
  vide?: string;
}) {
  return (
    <div className="max-h-64 overflow-auto rounded-md border border-marine-50">
      <table className="w-full text-sm">
        <tbody>
          {postes.map((p) => (
            <tr
              key={p.code}
              className="border-b border-marine-50 last:border-0 hover:bg-marine-50/60"
            >
              <td className="w-24 px-3 py-2 font-mono text-xs text-or-dark">{p.code}</td>
              <td className="px-3 py-2">
                {p.designation}
                {codesPresents.has(p.code) && (
                  <span className="ml-2 rounded bg-marine-50 px-1.5 text-xs text-marine-700">
                    déjà au devis
                  </span>
                )}
              </td>
              <td className="w-12 px-2 py-2 text-center text-xs text-marine-700">{p.unite}</td>
              <td className="w-28 px-3 py-2 text-right text-xs text-marine-700">
                {eur.format(p.moy)} <span className="text-marine-700/50">MOY</span>
              </td>
              <td className="w-16 px-2 py-2 text-right">
                <button className="btn-ghost px-2 py-1" onClick={() => onAjouter(p)}>
                  +
                </button>
              </td>
            </tr>
          ))}
          {postes.length === 0 && (
            <tr>
              <td className="px-3 py-4 text-sm text-marine-700/60">{vide}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

/* ======================================================================= */
/* Sous-composants partagés                                                */
/* ======================================================================= */

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-marine-700">{label}</span>
      {children}
    </label>
  );
}

function Th({ children, className = "" }: { children?: React.ReactNode; className?: string }) {
  return (
    <th className={`px-2 py-2 text-center text-xs font-semibold ${className}`}>{children}</th>
  );
}

function Row({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div
      className={`flex items-center justify-between border-b border-marine-50 pb-1.5 ${
        strong ? "text-base font-semibold text-marine-900" : "text-marine-700"
      }`}
    >
      <dt>{label}</dt>
      <dd className="tabular-nums">{value}</dd>
    </div>
  );
}

/* ---- Modale maison (charte Luxe Discret) ---- */
function Modale({
  titre,
  message,
  actions,
}: {
  titre: string;
  message: string;
  actions: { label: string; variant: "or" | "ghost"; onClick: () => void }[];
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-marine-900/40 p-4">
      <div className="w-full max-w-md rounded-lg border border-marine-50 bg-white p-5 shadow-lg">
        <h3 className="text-base font-semibold text-marine-900">{titre}</h3>
        <p className="mt-2 text-sm text-marine-700">{message}</p>
        <div className="mt-5 flex justify-end gap-2">
          {actions.map((a) => (
            <button
              key={a.label}
              className={a.variant === "or" ? "btn-or" : "btn-ghost"}
              onClick={a.onClick}
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---- Lignes d'un lot ---- */
function LotRows({
  lot,
  filtre,
  mentions,
  onMentions,
  onAppliquerGamme,
  onMaj,
  onDupliquer,
  onSupprimer,
}: {
  lot: { lot: string; lotTitre: string; lignes: LigneCalculee[]; totalHT: number };
  filtre: string;
  mentions?: { inclus?: string; exclus?: string; conditions?: string };
  onMentions: (patch: Partial<{ inclus: string; exclus: string; conditions: string }>) => void;
  onAppliquerGamme: (g: Gamme) => void;
  onMaj: (id: string, patch: Partial<LigneDevis>) => void;
  onDupliquer: (id: string) => void;
  onSupprimer: (id: string) => void;
}) {
  const [detail, setDetail] = useState<Set<string>>(new Set());
  const [mentionsOuvert, setMentionsOuvert] = useState(false);

  const f = filtre.trim().toLowerCase();
  const lignes = f
    ? lot.lignes.filter((l) => `${l.code} ${l.designation}`.toLowerCase().includes(f))
    : lot.lignes;
  if (lignes.length === 0) return null;

  function toggleDetail(id: string) {
    setDetail((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  return (
    <>
      <tr className="bg-or/15">
        <td colSpan={2} className="px-3 py-1.5 text-xs font-semibold text-marine-900">
          Lot {lot.lot} — {lot.lotTitre}
        </td>
        <td colSpan={6} className="px-2 py-1.5">
          {lot.lot !== "DIV" && (
            <span className="flex items-center gap-1 text-xs text-marine-700/70">
              Gamme du lot :
              {(["MIN", "MOY", "MAX"] as Gamme[]).map((g) => (
                <button
                  key={g}
                  className="rounded border border-marine-50 bg-white px-1.5 py-0.5 hover:border-or"
                  onClick={() => onAppliquerGamme(g)}
                >
                  {g}
                </button>
              ))}
              <button
                className="ml-2 underline decoration-dotted hover:text-or-dark"
                onClick={() => setMentionsOuvert((v) => !v)}
              >
                INCLUS/EXCLUS
              </button>
            </span>
          )}
        </td>
        <td className="px-2 py-1.5 text-right text-xs font-semibold tabular-nums">
          {eur.format(lot.totalHT)}
        </td>
        <td />
      </tr>

      {mentionsOuvert && lot.lot !== "DIV" && (
        <tr className="bg-marine-50/40">
          <td colSpan={10} className="px-3 py-2">
            <div className="grid gap-2 md:grid-cols-3">
              {(
                [
                  ["inclus", "Inclus"],
                  ["exclus", "Exclus"],
                  ["conditions", "Conditions"],
                ] as ["inclus" | "exclus" | "conditions", string][]
              ).map(([k, label]) => (
                <label key={k} className="block">
                  <span className="mb-1 block text-xs font-medium text-marine-700">{label}</span>
                  <textarea
                    className="input min-h-16 text-xs"
                    value={mentions?.[k] ?? ""}
                    onChange={(e) => onMentions({ [k]: e.target.value })}
                  />
                </label>
              ))}
            </div>
          </td>
        </tr>
      )}

      {lignes.map((l) => {
        const verrou = isVerrouille(l.code);
        const ouvert = detail.has(l.id);
        return (
          <Fragment key={l.id}>
            <tr className="border-b border-marine-50">
              <td className="px-2 py-1.5 font-mono text-xs text-or-dark">
                {l.code}
                {verrou && <span title="Prix calé à dire d'expert (50 €/m²)"> 🔒</span>}
              </td>
              <td className="px-2 py-1.5">
                {l.adHoc ? (
                  <input
                    className="input"
                    value={l.designation}
                    placeholder="Désignation technique…"
                    onChange={(e) => onMaj(l.id, { designation: e.target.value })}
                  />
                ) : (
                  <span>{l.designation}</span>
                )}
              </td>
              <td className="px-1 py-1.5">
                <select
                  className="input"
                  value={l.gamme}
                  disabled={l.adHoc || verrou}
                  title={verrou ? "Prix verrouillé : gamme sans effet" : undefined}
                  onChange={(e) => onMaj(l.id, { gamme: e.target.value as Gamme })}
                >
                  <option value="MIN">MIN</option>
                  <option value="MOY">MOY</option>
                  <option value="MAX">MAX</option>
                </select>
              </td>
              <td className="w-20 px-1 py-1.5">
                <input
                  className="input text-right"
                  type="number"
                  step="any"
                  value={l.qteBrute}
                  onChange={(e) => onMaj(l.id, { qteBrute: num(e.target.value) })}
                />
              </td>
              <td className="w-16 px-1 py-1.5">
                <input
                  className="input text-right"
                  type="number"
                  step="0.01"
                  disabled={l.ferme}
                  title={l.ferme ? "Quantité ferme (coef 1)" : "Coefficient conservateur"}
                  value={l.ferme ? 1 : l.coefQte}
                  onChange={(e) => onMaj(l.id, { coefQte: num(e.target.value, 1) })}
                />
              </td>
              <td className="px-2 py-1.5 text-right text-xs tabular-nums text-marine-700">
                {l.qteAppliquee} {l.unite}
              </td>
              <td className="w-24 px-1 py-1.5">
                {l.adHoc ? (
                  <input
                    className="input text-right"
                    type="number"
                    step="any"
                    value={l.puBase}
                    onChange={(e) => onMaj(l.id, { puBase: num(e.target.value) })}
                  />
                ) : (
                  <span className="block text-right text-xs tabular-nums">
                    {eur.format(l.puFinal)}
                  </span>
                )}
              </td>
              <td className="w-20 px-1 py-1.5">
                <select
                  className="input"
                  value={l.tva}
                  onChange={(e) => onMaj(l.id, { tva: Number(e.target.value) as TauxTVA })}
                >
                  <option value={5.5}>5,5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                </select>
              </td>
              <td className="px-2 py-1.5 text-right text-sm font-medium tabular-nums">
                {eur.format(l.totalHT)}
              </td>
              <td className="whitespace-nowrap px-1 py-1.5 text-center">
                <button
                  className="text-marine-700/50 hover:text-marine-900"
                  onClick={() => toggleDetail(l.id)}
                  title="Détails (note, groupe client, ferme)"
                >
                  ⋯
                </button>
                <button
                  className="ml-1 text-marine-700/50 hover:text-or-dark"
                  onClick={() => onDupliquer(l.id)}
                  title="Dupliquer"
                >
                  ⧉
                </button>
                <button
                  className="ml-1 text-marine-700/50 hover:text-red-600"
                  onClick={() => onSupprimer(l.id)}
                  title="Supprimer"
                >
                  ✕
                </button>
              </td>
            </tr>
            {ouvert && (
              <tr className="bg-marine-50/30">
                <td colSpan={10} className="px-3 py-2">
                  <div className="grid gap-3 md:grid-cols-3">
                    <label className="block md:col-span-1">
                      <span className="mb-1 block text-xs font-medium text-marine-700">
                        Groupe client (consolidation)
                      </span>
                      <input
                        className="input"
                        value={l.groupeClient ?? ""}
                        placeholder="ex. Salle de bains"
                        onChange={(e) => onMaj(l.id, { groupeClient: e.target.value })}
                      />
                    </label>
                    <label className="block md:col-span-2">
                      <span className="mb-1 block text-xs font-medium text-marine-700">
                        Note interne (jamais côté client)
                      </span>
                      <input
                        className="input"
                        value={l.note ?? ""}
                        onChange={(e) => onMaj(l.id, { note: e.target.value })}
                      />
                    </label>
                    <label className="flex items-center gap-2 text-sm text-marine-700">
                      <input
                        type="checkbox"
                        className="h-4 w-4 accent-[#C8A96A]"
                        checked={!!l.ferme}
                        onChange={(e) => onMaj(l.id, { ferme: e.target.checked })}
                      />
                      Quantité ferme (sans coefficient)
                    </label>
                  </div>
                </td>
              </tr>
            )}
          </Fragment>
        );
      })}
    </>
  );
}
