"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BPU_PAR_CODE,
  rechercherBPU,
  titreLot,
} from "@/lib/bpu";
import {
  calculerSynthese,
  cryptoRandomId,
  ligneDepuisPoste,
  puBaseRetenu,
  versDevisUpdate,
} from "@/lib/engine";
import type {
  Gamme,
  LigneDevis,
  ParametresDevis,
  PosteBPU,
  TauxTVA,
  TypeClient,
} from "@/lib/types";

const STORAGE_KEY = "lcb-chiffrage-v1";

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
  const [params, setParams] = useState<ParametresDevis>(PARAMS_DEFAUT);
  const [lignes, setLignes] = useState<LigneDevis[]>([]);
  const [query, setQuery] = useState("");
  const [charge, setCharge] = useState(false);

  // Restauration localStorage.
  useEffect(() => {
    try {
      const brut = localStorage.getItem(STORAGE_KEY);
      if (brut) {
        const data = JSON.parse(brut);
        if (data.params) setParams({ ...PARAMS_DEFAUT, ...data.params });
        if (Array.isArray(data.lignes)) setLignes(data.lignes);
      }
    } catch {
      /* ignore */
    }
    setCharge(true);
  }, []);

  // Persistance localStorage.
  useEffect(() => {
    if (!charge) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ params, lignes }));
  }, [params, lignes, charge]);

  const synthese = useMemo(
    () => calculerSynthese(lignes, params, titreLot),
    [lignes, params],
  );

  const resultats = useMemo(() => rechercherBPU(query), [query]);

  function setParam<K extends keyof ParametresDevis>(
    k: K,
    v: ParametresDevis[K],
  ) {
    setParams((p) => ({ ...p, [k]: v }));
  }

  function ajouterPoste(poste: PosteBPU) {
    setLignes((ls) => [...ls, ligneDepuisPoste(poste, params, 1)]);
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
        qteBrute: 1,
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
        // Recalcul du PU de base si la gamme change sur un poste BPU.
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
              <option value="particulier">Particulier (markup 15 %)</option>
              <option value="erp">ERP (à confirmer)</option>
              <option value="pro">Professionnel (à confirmer)</option>
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
      </section>

      {/* Recherche BPU */}
      <section>
        <h2 className="rule-or mb-3 pb-1 text-base font-semibold">
          Bibliothèque BPU
        </h2>
        <input
          className="input mb-3"
          placeholder="Rechercher un poste (code ou désignation)…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="max-h-56 overflow-auto rounded-md border border-marine-50">
          <table className="w-full text-sm">
            <tbody>
              {resultats.map((p) => (
                <tr
                  key={p.code}
                  className="border-b border-marine-50 last:border-0 hover:bg-marine-50/60"
                >
                  <td className="w-24 px-3 py-2 font-mono text-xs text-or-dark">
                    {p.code}
                  </td>
                  <td className="px-3 py-2">{p.designation}</td>
                  <td className="w-12 px-2 py-2 text-center text-xs text-marine-700">
                    {p.unite}
                  </td>
                  <td className="w-28 px-3 py-2 text-right text-xs text-marine-700">
                    {eur.format(p.moy)} <span className="text-marine-700/50">MOY</span>
                  </td>
                  <td className="w-16 px-2 py-2 text-right">
                    <button className="btn-ghost px-2 py-1" onClick={() => ajouterPoste(p)}>
                      +
                    </button>
                  </td>
                </tr>
              ))}
              {resultats.length === 0 && (
                <tr>
                  <td className="px-3 py-4 text-sm text-marine-700/60">
                    Aucun poste. Vérifiez la base (npm run bpu:build).
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <button className="btn-ghost mt-3" onClick={ajouterAdHoc}>
          + Poste AD-HOC (hors BPU)
        </button>
      </section>

      {/* Lignes de chiffrage */}
      <section>
        <h2 className="rule-or mb-3 pb-1 text-base font-semibold">
          Chiffrage ({lignes.length} poste{lignes.length > 1 ? "s" : ""})
        </h2>
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
                  <td colSpan={10} className="px-3 py-6 text-center text-marine-700/60">
                    Ajoutez des postes depuis la bibliothèque ci-dessus.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Synthèse */}
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
            <Row label="Total TTC" value={eur.format(synthese.totalTTC)} strong />
          </dl>
          <p className="mt-3 text-xs text-marine-700/60">
            Markup interne appliqué : ×{synthese.markupApplique} — jamais affiché
            côté client.
          </p>
        </div>

        <div>
          <h2 className="rule-or mb-3 pb-1 text-base font-semibold">Export</h2>
          <button className="btn-or" onClick={exporterJSON} disabled={lignes.length === 0}>
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

/* ---- Sous-composants ---- */

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-marine-700">{label}</span>
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
        <td colSpan={8} className="px-3 py-1.5 text-xs font-semibold text-marine-900">
          {lotLabel}
        </td>
        <td className="px-2 py-1.5 text-right text-xs font-semibold tabular-nums">
          {total}
        </td>
        <td />
      </tr>
      {lignes.map((l) => (
        <tr key={l.id} className="border-b border-marine-50">
          <td className="px-2 py-1.5 font-mono text-xs text-or-dark">{l.code}</td>
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
