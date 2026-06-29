/**
 * Parseur BPU — convertit BPU_LCB_BAT_v10.md en data/bpu.json.
 *
 * Source de vérité : le fichier markdown du BPU LCB BAT (référentiel projet).
 * On NE retranscrit JAMAIS les prix à la main : ce script extrait les tables
 * lot par lot pour garantir l'exactitude.
 *
 * Usage :
 *   1. Copier votre BPU dans  data/BPU_v10.md
 *      (ou passer le chemin :  BPU_SRC=/chemin/BPU.md npm run bpu:build)
 *   2. npm run bpu:build
 *      -> écrit data/bpu.json
 *
 * Format de table attendu (par lot) :
 *   ### Lot RS — Revêtements de sols
 *   | Code | Désignation | U | MIN | MOY | MAX |
 *   |---|---|---|---:|---:|---:|
 *   | `RS-50` | Pose carrelage... | m² | 50 | 50 | 50 |
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

interface PosteBPU {
  code: string;
  lot: string;
  lotTitre: string;
  designation: string;
  unite: string;
  min: number;
  moy: number;
  max: number;
}

const UNITES = new Set(["m²", "m2", "ml", "m³", "m3", "U", "F", "J", "ens"]);

const SRC = resolve(process.env.BPU_SRC ?? "data/BPU_v10.md");
const OUT = resolve("data/bpu.json");

function normUnite(u: string): string {
  // Normalisation insensible à la casse (le BPU mélange "ENS"/"ens", "U"/"u"…).
  const map: Record<string, string> = {
    m2: "m²",
    m3: "m³",
    ens: "ens",
    u: "U",
    f: "F",
    j: "J",
  };
  return map[u.toLowerCase()] ?? u;
}

/** Convertit "1 200", "1200", "1.850" -> nombre. Retourne NaN si non numérique. */
function toNumber(raw: string): number {
  const cleaned = raw.replace(/\s| /g, "").replace(/[^\d.,-]/g, "");
  if (cleaned === "" || !/\d/.test(cleaned)) return NaN;
  // Les valeurs du BPU sont des entiers ; on retire séparateurs de milliers.
  return Number(cleaned.replace(/[.,](?=\d{3}\b)/g, "").replace(",", "."));
}

function stripBackticks(s: string): string {
  return s.replace(/`/g, "").trim();
}

function parse(md: string): PosteBPU[] {
  const lines = md.split(/\r?\n/);
  const postes: PosteBPU[] = [];
  const seen = new Set<string>();
  let lot = "";
  let lotTitre = "";

  // Capture "### Lot CODE — Titre" (tirets em/en ou simple).
  const lotRe = /^#{2,4}\s+Lot\s+([A-Z]+)\s*[—–-]\s*(.+?)\s*$/;

  for (const line of lines) {
    const lotMatch = line.match(lotRe);
    if (lotMatch) {
      lot = lotMatch[1].trim();
      lotTitre = lotMatch[2].trim();
      continue;
    }

    const trimmed = line.trim();
    if (!trimmed.startsWith("|")) continue;

    const cells = trimmed
      .slice(1, trimmed.endsWith("|") ? -1 : undefined)
      .split("|")
      .map((c) => c.trim());

    // On attend au moins 6 colonnes : code, désignation, U, MIN, MOY, MAX.
    if (cells.length < 6) continue;

    const code = stripBackticks(cells[0]);
    // Code de poste : LETTRES-CHIFFRES (ex. RS-01, OCREN-12).
    if (!/^[A-Z]+-\d+[A-Za-z]?$/.test(code)) continue;

    const designation = cells[1].trim();
    const unite = normUnite(cells[2].trim());
    if (!designation || !UNITES.has(cells[2].trim()) && !UNITES.has(unite)) continue;

    const min = toNumber(cells[3]);
    const moy = toNumber(cells[4]);
    const max = toNumber(cells[5]);
    if ([min, moy, max].some((n) => Number.isNaN(n))) continue;

    if (seen.has(code)) continue; // premier emporté (évite doublons annexe)
    seen.add(code);

    postes.push({
      code,
      lot: lot || code.split("-")[0],
      lotTitre: lotTitre || "",
      designation,
      unite,
      min,
      moy,
      max,
    });
  }

  return postes;
}

function main(): void {
  if (!existsSync(SRC)) {
    console.error(
      `\n[parse-bpu] Fichier source introuvable : ${SRC}\n` +
        `Copiez votre BPU_LCB_BAT_v10.md dans data/BPU_v10.md, ` +
        `ou définissez BPU_SRC.\n`,
    );
    process.exit(1);
  }

  const md = readFileSync(SRC, "utf8");
  const postes = parse(md);

  if (postes.length === 0) {
    console.error("[parse-bpu] Aucun poste extrait — vérifiez le format des tables.");
    process.exit(1);
  }

  postes.sort((a, b) => a.code.localeCompare(b.code, "fr", { numeric: true }));
  writeFileSync(OUT, JSON.stringify(postes, null, 2) + "\n", "utf8");

  const lots = [...new Set(postes.map((p) => p.lot))];
  console.log(
    `[parse-bpu] ${postes.length} postes extraits sur ${lots.length} lots ` +
      `(${lots.join(", ")})\n           -> ${OUT}`,
  );
}

main();
