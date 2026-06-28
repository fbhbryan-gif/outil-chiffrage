# LCB BAT — Outil de chiffrage (contexte pour Claude Code)

Application web privée du module de **chiffrage** du bureau d'étude LCB BAT
(construction / rénovation, Île-de-France). Phase 1 d'un outil plus large
(livrables, suivi chantier, contrats à venir).

## Stack

- **Next.js 14** (App Router) + **TypeScript** strict
- **Tailwind CSS** v3 — charte « Luxe Discret » (bleu marine `#0B1F3B` + or `#C8A96A`)
- **Vitest** pour les tests du moteur
- Déploiement cible : **Vercel** (accès privé)

## Architecture

```
app/            UI (page.tsx = écran de chiffrage, client component)
lib/
  types.ts      modèle métier (PosteBPU, LigneDevis, SyntheseDevis…)
  engine.ts     MOTEUR DE CALCUL — toutes les règles métier, pur, testé
  engine.test.ts tests des règles
  bpu.ts        accès à la bibliothèque (recherche, lots)
data/
  bpu.json      bibliothèque BPU utilisée par l'app (généré ou seed)
  bpu.sample.json seed de démonstration (postes réels)
  BPU_v10.md    (à fournir) source markdown pour régénérer bpu.json
scripts/
  parse-bpu.ts  convertit BPU_v10.md -> bpu.json
```

**Le cœur de valeur est `lib/engine.ts`.** Toute règle de prix vit là, jamais
dans l'UI. L'UI ne fait qu'appeler le moteur et afficher.

## Règles métier non négociables (réf. Specifications_LCB_BAT.md)

1. **TVA** : 10 % par défaut (rénovation > 2 ans) ; 5,5 % (énergétique seul) ;
   20 % (neuf / extension / pro / équipements séparés). Attestation TVA si < 20 %.
2. **Markup particuliers : +15 %** appliqué sur les PU du BPU au moment du devis.
   **Jamais visible côté client.** ERP/pro : markup à confirmer projet par projet
   (1.0 par défaut ici).
3. **Prix verrouillés** : `RS-01` et `RS-09` = **50 €/m²**, jamais recalculés
   (constante `PRIX_VERROUILLES`). Le markup s'applique ensuite normalement.
4. **Quantités conservatrices** (§5.1) : surfaces ×1.05–1.10, linéaires ×1.10,
   imprévus 3–5 % du HT. Implémenté via `coefQte` par ligne + `tauxImprevus` global
   (réparti au prorata sur les bases de TVA).
5. **Indexation IDF Q2 2026** ; clause de révision si chantier > 6 mois.
6. **BPU** : tous les prix sont **HT et HORS markup**. Trois gammes MIN/MOY/MAX
   (MOY = défaut).

## Décisions ouvertes (à valider avec le métier)

- Les onglets **Agencement & SM** (67 postes) et **Détail Composants** (136) ne
  sont pas encore dans la base — cible v11.
- Exports **Excel/PDF** brandés : phase suivante (l'app exporte aujourd'hui le
  format `[DEVIS_UPDATE]`).
- **Accès privé** : protection Vercel (mot de passe) en V1 ; comptes par
  collaborateur ensuite.
- Hypothèse à confirmer : pour un poste **AD-HOC**, le PU saisi est HT **hors**
  markup (le markup s'applique). À trancher si on préfère saisir le prix final.

## Commandes

- `npm run dev` — serveur de dev
- `npm test` — tests du moteur (Vitest)
- `npm run bpu:build` — régénère `data/bpu.json` depuis `data/BPU_v10.md`
- `npm run build` — build de production

## Conventions de réponse (préférence métier)

Direct, abréviatif, terminologie BTP rigoureuse (DPGF, BPU, BET, lot/poste, TCE,
ERP, NF C 15-100). Itérations à versions nommées. Validation par chiffres clés.
