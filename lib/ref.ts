// Numérotation et versionnement des devis (Guide §12).
// Référence : LCB-AAAA-MMJJ-{CLIENT}-V{n}
//   - {CLIENT} en MAJUSCULES, sans accent ni espace
//   - MMJJ = date d'émission DE CETTE VERSION
//   - V{n} incrémenté à chaque changement structurel

/** Slug client : NFD + majuscules + uniquement A-Z0-9 (repli "CLIENT"). */
export function slugClient(client: string): string {
  const s = (client ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
  return s || "CLIENT";
}

/** Génère une référence LCB-AAAA-MMJJ-CLIENT-Vn. */
export function genRef(client: string, version: number, date = new Date()): string {
  const p = (n: number) => String(n).padStart(2, "0");
  const mmjj = `${p(date.getMonth() + 1)}${p(date.getDate())}`;
  const v = Number.isFinite(version) && version > 0 ? Math.floor(version) : 1;
  return `LCB-${date.getFullYear()}-${mmjj}-${slugClient(client)}-V${v}`;
}

/** Extrait le numéro de version d'une référence (1 par défaut). */
export function versionDeRef(ref: string): number {
  const m = ref.match(/V(\d+)$/);
  return m ? Number(m[1]) : 1;
}

/** Incrémente la version d'une référence (V2 → V3). */
export function bumpVersion(ref: string): string {
  if (/V\d+$/.test(ref)) {
    return ref.replace(/V(\d+)$/, (_, n) => `V${Number(n) + 1}`);
  }
  return `${ref}-V2`;
}
