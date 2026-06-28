# LCB BAT — Outil de chiffrage

Module de chiffrage du bureau d'étude LCB BAT, en application web (Next.js),
destiné à un hébergement privé sur Vercel. **Phase 1** : moteur de chiffrage +
bibliothèque BPU + interface de saisie de devis.

Le cœur métier (règles TVA, markup, gammes, prix verrouillés, quantités) est
isolé et testé dans `lib/engine.ts`.

---

## Démarrage rapide

Pré-requis : **Node.js 18+**.

```bash
cd outil-chiffrage
npm install
npm run dev
```

Ouvrir http://localhost:3000. L'app charge le **BPU LCB BAT v10**
(`data/bpu.json`, **284 postes sur 20 lots**, généré depuis `data/BPU_v10.md`).

### Lancer les tests du moteur

```bash
npm test
```

Les tests valident les règles métier : markup 15 %, prix verrouillés RS-01/09 à
50 €/m², coefficients de quantité, TVA multi-taux, imprévus au prorata.

---

## Charger le BPU complet (385+ postes)

L'app lit `data/bpu.json`. Pour le générer depuis votre référentiel :

1. Copier votre `BPU_LCB_BAT_v10.md` dans `data/BPU_v10.md`.
2. Lancer :

   ```bash
   npm run bpu:build
   ```

Le script `scripts/parse-bpu.ts` extrait les tables lot par lot (source de
vérité = le markdown ; aucun prix n'est retranscrit à la main) et écrit
`data/bpu.json`.

> Note : les onglets *Agencement & SM* et *Détail Composants* ne sont pas encore
> dans le markdown de référence (cible v11).

---

## Déploiement Vercel (accès privé)

1. Pousser ce dossier sur un dépôt GitHub.
2. Sur Vercel : **New Project** → importer le dépôt (framework détecté : Next.js).
3. Activer l'accès privé : **Settings → Deployment Protection → Vercel
   Authentication** (réservé à votre équipe Vercel) ou **Password Protection**.

Pour un vrai multi-comptes par collaborateur (phase ultérieure), prévoir
Auth.js ou Clerk + une base (Vercel Postgres / Supabase).

---

## Structure

| Chemin | Rôle |
|--------|------|
| `lib/engine.ts` | Moteur de calcul — **toutes les règles métier** |
| `lib/types.ts` | Modèle de données |
| `lib/bpu.ts` | Accès / recherche bibliothèque |
| `app/page.tsx` | Interface de chiffrage |
| `data/bpu.json` | Bibliothèque BPU active |
| `scripts/parse-bpu.ts` | Générateur BPU (md → json) |
| `CLAUDE.md` | Contexte métier pour Claude Code |

---

## Feuille de route

- [x] Moteur de chiffrage testé (TVA, markup, gammes, verrouillages, imprévus)
- [x] Bibliothèque BPU + recherche + saisie de devis
- [x] Export `[DEVIS_UPDATE]`
- [x] Import du BPU v10 complet (284 postes, 20 lots)
- [ ] Onglets Agencement & SM (67) + Détail Composants (136) — cible v11
- [ ] Exports Excel / PDF brandés (charte Luxe Discret)
- [ ] Authentification multi-collaborateurs + persistance serveur
- [ ] Phases suivantes : livrables, suivi chantier, contrats
