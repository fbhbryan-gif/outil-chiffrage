"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BPU_PAR_CODE,
  LOTS,
  postesDuLot,
  rechercherBPU,
  titreLot,
} from "@/lib/bpu";
import {
  INDEXATION,
  calculerSynthese,
  cryptoRandomId,
  ligneDepuisPoste,
  puBaseRetenu,
  versDevisUpdate,
} from "@/lib/engine";
import {
  TYPES_PROJET,
  genererLignesRapide,
  ouvragesPourType,
  selectionsDefaut,
  tvaSuggeree,
  type TypeProjetRapide,
} from "@/lib/rapide";
import type {
  Gamme,
  LigneDevis,
  ParametresDevis,
  PosteBPU,
  TauxTVA,
  TypeClient,
} from "@/lib/types";

const STORAGE_KEY = "lcb-chiffrage-v1";

type Mode = "accueil" | "rapide" | "detaille";

const PARAMS_DEFAUT: ParametresDevis = {
  ref: refDuJour(),
  client: "",
  adresse: "",
  typeProjet: "renovation_appartement",
  typeClient: "particulier",
  gammeDefaut: "MOY",
  tvaDefaut: 10,
  tauxImprevus: 0.04,
};

const eur = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
});

function refDuJour(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `LCB-${d.getFullYear()}-${p(d.getMonth() + 1)}${p(d.getDate())}-CLIENT-V1`;
}

export default function Page() {
  const [mode, setMode] = useState<Mode>("accueil");
  const [params, setParams] = useState<ParametresDevis>(PARAMS_DEFAUT);
  const [lignes, setLignes] = useState<LigneDevis[]>([]);
  const [charge, setCharge] = useState(false);

  // Restauration localStorage.
  useEffect(() => {
    try {
      const brut = localStorage.getItem(STORAGE_KEY);
      if (brut) {
        const data = JSON.parse(brut);
        if (data.params) setParams({ ...PARAMS_DEFAUT, ...data.params });
        if (Array.isArray(data.lignes)) setLignes(data.lignes);
        if (data.mode) setMode(data.mode);
        else if (Array.isArray(data.lignes) && data.lignes.length)
          setMode("detaille");
      }
    } catch {
      /* ignore */
    }
    setCharge(true);
  }, []);

  // Persistance localStorage.
  useEffect(() => {
    if (!charge) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ params, lignes, mode }));
  }, [params, lignes, mode, charge]);

  function genererDepuisRapide(
    type: TypeProjetRapide,
    shab: number,
    gamme: Gamme,
    selections: { code: string; qte: number }[],
  ) {
    const tva = tvaSuggeree(type);
    const nextParams: ParametresDevis = {
      ...params,
      typeProjet: type,
      gammeDefaut: gamme,
      tvaDefaut: tva,
    };
    const nouvelles = genererLignesRapide(selections, nextParams, (c) =>
      BPU_PAR_CODE.get(c),
    );
    setParams(nextParams);
    setLignes((existantes) => {
      if (existantes.length === 0) return nouvelles;
      const remplacer = window.confirm(
        `Un chiffrage de ${existantes.length} poste(s) est en cours.\n\n` +
          `OK = remplacer par le nouveau chiffrage rapide\n` +
          `Annuler = ajouter à la suite`,
      );
      return remplacer ? nouvelles : [...existantes, ...nouvelles];
    });
    setMode("detaille");
  }

  return (
    <div className="space-y-8">
      <ModeNav mode={mode} onChange={setMode} nbLignes={lignes.length} />

      {mode === "accueil" && (
        <Accueil
          nbLignes={lignes.length}
          onRapide={() => setMode("rapide")}
          onDetaille={() => setMode("detaille")}
        />
      )}

      {mode === "rapide" && (
        <WizardRapide
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
/* Accueil — choix du mode                                                 */
/* ======================================================================= */

function Accueil({
  nbLignes,
  onRapide,
  onDetaille,
}: {
  nbLignes: number;
  onRapide: () => void;
  onDetaille: () => void;
}) {
  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-marine-900">
          Nouveau chiffrage
        </h2>
        <p className="mt-1 text-sm text-marine-700/80">
          Choisissez le niveau de détail. Vous pourrez toujours basculer en mode
          détaillé pour affiner.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <CarteMode
          titre="Chiffrage rapide"
          puce="3 questions"
          desc="Premier contact, ordre de grandeur. Un forfait par grand poste (ouvrages complets clé en main : SDB, cuisine, rénovation au m²…)."
          cta="Démarrer le mode rapide"
          onClick={onRapide}
        />
        <CarteMode
          titre="Chiffrage détaillé"
          puce="DPGF / devis ferme"
          desc="Saisie lot par lot, poste élémentaire du BPU. Recherche, navigation par lot, quantités liées entre lots."
          cta={nbLignes > 0 ? `Reprendre (${nbLignes} postes)` : "Démarrer le mode détaillé"}
          onClick={onDetaille}
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
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-marine-900">{titre}</h3>
        <span className="rounded-full bg-or/20 px-2 py-0.5 text-xs font-medium text-or-dark">
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
  onAnnuler,
  onGenerer,
}: {
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

  // Réinitialise les ouvrages proposés quand le projet ou la surface change.
  useEffect(() => {
    setSel(selectionsDefaut(type, shab));
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

  const nbActifs = Object.values(sel).filter(
    (s) => s.actif && s.qte > 0,
  ).length;

  function generer() {
    const selections = Object.entries(sel)
      .filter(([, v]) => v.actif && v.qte > 0)
      .map(([code, v]) => ({ code, qte: v.qte }));
    onGenerer(type, shab, gamme, selections);
  }

  return (
    <section className="space-y-6">
      <Stepper etape={etape} libelles={["Le projet", "La gamme", "Les postes"]} />

      {/* Étape 1 — Projet */}
      {etape === 1 && (
        <div className="space-y-5">
          <div>
            <h3 className="mb-2 text-sm font-semibold text-marine-900">
              Type de projet
            </h3>
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
            <Field label="Surface SHAB / SHON (m²)">
              <input
                className="input"
                type="number"
                min={0}
                step={1}
                value={shab || ""}
                placeholder="ex. 57"
                onChange={(e) => setShab(Number(e.target.value))}
              />
            </Field>
            <p className="mt-1 text-xs text-marine-700/60">
              Sert à préremplir les quantités. TVA suggérée :{" "}
              {String(tvaSuggeree(type)).replace(".", ",")} %.
            </p>
          </div>
          <NavEtapes
            onAnnuler={onAnnuler}
            onSuivant={() => setEtape(2)}
            suivantOk={shab > 0}
          />
        </div>
      )}

      {/* Étape 2 — Gamme */}
      {etape === 2 && (
        <div className="space-y-5">
          <h3 className="text-sm font-semibold text-marine-900">
            Niveau de gamme
          </h3>
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
                  gamme === g
                    ? "border-or bg-or/10"
                    : "border-marine-50 bg-white hover:border-or"
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

      {/* Étape 3 — Postes */}
      {etape === 3 && (
        <div className="space-y-5">
          <div>
            <h3 className="text-sm font-semibold text-marine-900">
              Postes à chiffrer
            </h3>
            <p className="text-xs text-marine-700/60">
              Cochez les ouvrages concernés et ajustez les quantités. Chaque
              ouvrage = un forfait clé en main.
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
                    return (
                      <label
                        key={o.code}
                        className="flex cursor-pointer items-center gap-3 px-3 py-2 hover:bg-marine-50/50"
                      >
                        <input
                          type="checkbox"
                          className="h-4 w-4 accent-[#C8A96A]"
                          checked={s.actif}
                          onChange={(e) =>
                            setSel((p) => ({
                              ...p,
                              [o.code]: { ...s, actif: e.target.checked },
                            }))
                          }
                        />
                        <span className="flex-1 text-sm text-marine-900">
                          {o.label}
                          <span className="ml-2 font-mono text-xs text-marine-700/50">
                            {o.code}
                          </span>
                        </span>
                        <input
                          type="number"
                          min={0}
                          step="any"
                          className="input !w-24 shrink-0 text-right"
                          value={s.qte || ""}
                          onChange={(e) =>
                            setSel((p) => ({
                              ...p,
                              [o.code]: {
                                actif: true,
                                qte: Number(e.target.value),
                              },
                            }))
                          }
                        />
                        <span className="w-28 text-xs text-marine-700/60">
                          {o.aide}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <NavEtapes
            onAnnuler={() => setEtape(2)}
            annulerLabel="← Précédent"
            onSuivant={generer}
            suivantLabel={`Générer le chiffrage (${nbActifs})`}
            suivantOk={nbActifs > 0}
          />
        </div>
      )}
    </section>
  );
}

function Stepper({
  etape,
  libelles,
}: {
  etape: number;
  libelles: string[];
}) {
  return (
    <div className="flex items-center gap-2">
      {libelles.map((lib, i) => {
        const n = i + 1;
        const actif = n === etape;
        const fait = n < etape;
        return (
          <div key={lib} className="flex items-center gap-2">
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                actif
                  ? "bg-marine-900 text-creme"
                  : fait
                    ? "bg-or text-marine-900"
                    : "bg-marine-50 text-marine-700"
              }`}
            >
              {n}
            </span>
            <span
              className={`text-sm ${
                actif ? "font-semibold text-marine-900" : "text-marine-700/70"
              }`}
            >
              {lib}
            </span>
            {n < libelles.length && (
              <span className="mx-1 h-px w-6 bg-marine-50" />
            )}
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
/* Mode détaillé — éditeur                                                 */
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

  const synthese = useMemo(
    () => calculerSynthese(lignes, params, titreLot),
    [lignes, params],
  );
  const attestationTVA = synthese.tvaParTaux.some((t) => t.taux < 20);

  function setParam<K extends keyof ParametresDevis>(
    k: K,
    v: ParametresDevis[K],
  ) {
    setParams((p) => ({ ...p, [k]: v }));
  }

  function ajouterPoste(poste: PosteBPU) {
    setLignes((ls) => [...ls, ligneDepuisPoste(poste, params, qteRef || 1)]);
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

  function supprimer(id: string) {
    setLignes((ls) => ls.filter((l) => l.id !== id));
  }

  function viderTout() {
    if (lignes.length && window.confirm("Vider tout le chiffrage en cours ?")) {
      setLignes([]);
    }
  }

  function exporterJSON() {
    const payload = versDevisUpdate(lignes, params, titreLot);
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
      {/* Paramètres projet */}
      <section>
        <h2 className="rule-or mb-3 pb-1 text-base font-semibold">
          Paramètres du devis
        </h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Field label="Référence">
            <input
              className="input"
              value={params.ref}
              onChange={(e) => setParam("ref", e.target.value)}
            />
          </Field>
          <Field label="Client">
            <input
              className="input"
              value={params.client}
              onChange={(e) => setParam("client", e.target.value)}
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
          <Field label="Type de client">
            <select
              className="input"
              value={params.typeClient}
              onChange={(e) =>
                setParam("typeClient", e.target.value as TypeClient)
              }
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
              onChange={(e) =>
                setParam("tvaDefaut", Number(e.target.value) as TauxTVA)
              }
            >
              <option value={5.5}>5,5 % (énergétique)</option>
              <option value={10}>10 % (rénovation)</option>
              <option value={20}>20 % (neuf / pro)</option>
            </select>
          </Field>
          <Field label="Imprévus (% du HT)">
            <input
              className="input"
              type="number"
              step={1}
              min={0}
              max={10}
              value={Math.round(params.tauxImprevus * 100)}
              onChange={(e) =>
                setParam("tauxImprevus", Number(e.target.value) / 100)
              }
            />
          </Field>
        </div>
        <p className="mt-2 text-xs text-marine-700/60">
          Prix HT du BPU, indexés {INDEXATION}.
        </p>
      </section>

      {/* Ajout de postes */}
      <AjoutPostes
        qteRef={qteRef}
        setQteRef={setQteRef}
        onAjouter={ajouterPoste}
        onAdHoc={ajouterAdHoc}
      />

      {/* Lignes de chiffrage */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="rule-or flex-1 pb-1 text-base font-semibold">
            Chiffrage ({lignes.length} poste{lignes.length > 1 ? "s" : ""})
          </h2>
          {lignes.length > 0 && (
            <button
              className="ml-3 text-xs text-marine-700/50 hover:text-red-600"
              onClick={viderTout}
            >
              Tout vider
            </button>
          )}
        </div>
        <div className="overflow-x-auto rounded-md border border-marine-50">
          <table className="w-full min-w-[900px] text-sm">
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
                  lotLabel={`Lot ${lot.lot} — ${lot.lotTitre}`}
                  total={eur.format(lot.totalHT)}
                  lignes={lot.lignes}
                  onMaj={majLigne}
                  onSupprimer={supprimer}
                />
              ))}
              {lignes.length === 0 && (
                <tr>
                  <td
                    colSpan={10}
                    className="px-3 py-6 text-center text-marine-700/60"
                  >
                    Aucun poste. Ajoutez-en ci-dessus, ou passez par le mode
                    rapide.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Synthèse + export */}
      <section className="grid gap-6 md:grid-cols-2">
        <div>
          <h2 className="rule-or mb-3 pb-1 text-base font-semibold">Synthèse</h2>
          <dl className="space-y-1.5 text-sm">
            <Row label="HT postes" value={eur.format(synthese.htPostes)} />
            <Row
              label={`Imprévus (${Math.round(params.tauxImprevus * 100)} %)`}
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
            <Row
              label="Total TTC"
              value={eur.format(synthese.totalTTC)}
              strong
            />
          </dl>
          {attestationTVA && lignes.length > 0 && (
            <p className="mt-3 rounded-md bg-or/10 px-3 py-2 text-xs text-or-dark">
              ⚠️ TVA &lt; 20 % : attestation TVA simplifiée à joindre au devis.
            </p>
          )}
          <p className="mt-3 text-xs text-marine-700/60">
            PU HT du BPU (gamme {params.gammeDefaut}), indexés {INDEXATION}.
          </p>
        </div>

        <div>
          <h2 className="rule-or mb-3 pb-1 text-base font-semibold">Export</h2>
          <button
            className="btn-or"
            onClick={exporterJSON}
            disabled={lignes.length === 0}
          >
            Exporter [DEVIS_UPDATE]
          </button>
          <p className="mt-3 text-xs text-marine-700/60">
            Format compatible avec le programme historique LCB. Les exports
            Excel / PDF brandés sont prévus en phase suivante.
          </p>
        </div>
      </section>
    </div>
  );
}

/* ---- Ajout de postes : recherche + navigation par lot ---- */

function AjoutPostes({
  qteRef,
  setQteRef,
  onAjouter,
  onAdHoc,
}: {
  qteRef: number;
  setQteRef: (n: number) => void;
  onAjouter: (poste: PosteBPU) => void;
  onAdHoc: () => void;
}) {
  const [vue, setVue] = useState<"recherche" | "lots">("recherche");
  const [query, setQuery] = useState("");
  const [lotOuvert, setLotOuvert] = useState<string | null>(null);

  const resultats = useMemo(() => rechercherBPU(query), [query]);

  return (
    <section>
      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <h2 className="rule-or flex-1 pb-1 text-base font-semibold">
          Ajouter des postes
        </h2>
        <Field label="Quantité de référence (pré-remplie à l'ajout)">
          <input
            className="input !w-40 text-right"
            type="number"
            min={0}
            step="any"
            value={qteRef || ""}
            onChange={(e) => setQteRef(Number(e.target.value))}
          />
        </Field>
      </div>

      {/* Sélecteur de vue */}
      <div className="mb-3 flex gap-1 text-sm">
        {(
          [
            ["recherche", "Recherche"],
            ["lots", "Parcourir par lot"],
          ] as [typeof vue, string][]
        ).map(([v, label]) => (
          <button
            key={v}
            onClick={() => setVue(v)}
            className={`rounded-md px-3 py-1.5 font-medium transition ${
              vue === v
                ? "bg-marine-900 text-creme"
                : "text-marine-700 hover:bg-marine-50"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {vue === "recherche" && (
        <>
          <input
            className="input mb-3"
            placeholder="Rechercher un poste (code ou désignation)…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="max-h-64 overflow-auto rounded-md border border-marine-50">
            <table className="w-full text-sm">
              <tbody>
                {resultats.map((p) => (
                  <PosteLigne key={p.code} poste={p} onAjouter={onAjouter} />
                ))}
                {resultats.length === 0 && (
                  <tr>
                    <td className="px-3 py-4 text-sm text-marine-700/60">
                      Aucun poste trouvé.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {vue === "lots" && (
        <div className="space-y-1.5">
          {LOTS.map((l) => (
            <div
              key={l.lot}
              className="overflow-hidden rounded-md border border-marine-50"
            >
              <button
                onClick={() =>
                  setLotOuvert((cur) => (cur === l.lot ? null : l.lot))
                }
                className="flex w-full items-center justify-between bg-white px-3 py-2 text-left text-sm hover:bg-marine-50/60"
              >
                <span className="font-medium text-marine-900">
                  <span className="font-mono text-xs text-or-dark">{l.lot}</span>
                  {" — "}
                  {l.titre}
                </span>
                <span className="text-xs text-marine-700/50">
                  {l.nb} poste{l.nb > 1 ? "s" : ""}{" "}
                  {lotOuvert === l.lot ? "▾" : "▸"}
                </span>
              </button>
              {lotOuvert === l.lot && (
                <table className="w-full border-t border-marine-50 text-sm">
                  <tbody>
                    {postesDuLot(l.lot).map((p) => (
                      <PosteLigne key={p.code} poste={p} onAjouter={onAjouter} />
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          ))}
        </div>
      )}

      <button className="btn-ghost mt-3" onClick={onAdHoc}>
        + Poste AD-HOC (hors BPU)
      </button>
    </section>
  );
}

function PosteLigne({
  poste,
  onAjouter,
}: {
  poste: PosteBPU;
  onAjouter: (poste: PosteBPU) => void;
}) {
  return (
    <tr className="border-b border-marine-50 last:border-0 hover:bg-marine-50/60">
      <td className="w-24 px-3 py-2 font-mono text-xs text-or-dark">
        {poste.code}
      </td>
      <td className="px-3 py-2">{poste.designation}</td>
      <td className="w-12 px-2 py-2 text-center text-xs text-marine-700">
        {poste.unite}
      </td>
      <td className="w-28 px-3 py-2 text-right text-xs text-marine-700">
        {eur.format(poste.moy)}{" "}
        <span className="text-marine-700/50">MOY</span>
      </td>
      <td className="w-16 px-2 py-2 text-right">
        <button
          className="btn-ghost px-2 py-1"
          onClick={() => onAjouter(poste)}
        >
          +
        </button>
      </td>
    </tr>
  );
}

/* ======================================================================= */
/* Sous-composants partagés                                                */
/* ======================================================================= */

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-marine-700">
        {label}
      </span>
      {children}
    </label>
  );
}

function Th({
  children,
  className = "",
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <th className={`px-2 py-2 text-center text-xs font-semibold ${className}`}>
      {children}
    </th>
  );
}

function Row({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
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

function LotRows({
  lotLabel,
  total,
  lignes,
  onMaj,
  onSupprimer,
}: {
  lotLabel: string;
  total: string;
  lignes: import("@/lib/types").LigneCalculee[];
  onMaj: (id: string, patch: Partial<LigneDevis>) => void;
  onSupprimer: (id: string) => void;
}) {
  return (
    <>
      <tr className="bg-or/15">
        <td
          colSpan={8}
          className="px-3 py-1.5 text-xs font-semibold text-marine-900"
        >
          {lotLabel}
        </td>
        <td className="px-2 py-1.5 text-right text-xs font-semibold tabular-nums">
          {total}
        </td>
        <td />
      </tr>
      {lignes.map((l) => (
        <tr key={l.id} className="border-b border-marine-50">
          <td className="px-2 py-1.5 font-mono text-xs text-or-dark">
            {l.code}
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
              disabled={l.adHoc}
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
              onChange={(e) => onMaj(l.id, { qteBrute: Number(e.target.value) })}
            />
          </td>
          <td className="w-16 px-1 py-1.5">
            <input
              className="input text-right"
              type="number"
              step="0.01"
              value={l.coefQte}
              onChange={(e) => onMaj(l.id, { coefQte: Number(e.target.value) })}
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
                onChange={(e) => onMaj(l.id, { puBase: Number(e.target.value) })}
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
              onChange={(e) =>
                onMaj(l.id, { tva: Number(e.target.value) as TauxTVA })
              }
            >
              <option value={5.5}>5,5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
          </td>
          <td className="px-2 py-1.5 text-right text-sm font-medium tabular-nums">
            {eur.format(l.totalHT)}
          </td>
          <td className="px-1 py-1.5 text-center">
            <button
              className="text-marine-700/50 hover:text-red-600"
              onClick={() => onSupprimer(l.id)}
              aria-label="Supprimer"
            >
              ✕
            </button>
          </td>
        </tr>
      ))}
    </>
  );
}
