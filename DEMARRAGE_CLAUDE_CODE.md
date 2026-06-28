# Passer le projet sur Claude Code → Vercel

Guide pas à pas, de zéro jusqu'à l'application en ligne (accès privé).
Le projet est déjà prêt dans ce dossier `outil-chiffrage/`.

---

## Étape 0 — Installer les pré-requis (une seule fois)

### Node.js (obligatoire)

- Aller sur https://nodejs.org → télécharger la version **LTS** → installer.
- Vérifier dans un terminal :
  ```bash
  node --version
  ```
  (doit afficher v18 ou plus)

### Claude Code

- Dans un terminal :
  ```bash
  npm install -g @anthropic-ai/claude-code
  ```
- Se connecter :
  ```bash
  claude
  ```
  (suivre l'invite de connexion au compte Anthropic)

### Où ouvrir le terminal ?

- **Mac** : Applications → Utilitaires → **Terminal**.
- **Windows** : menu Démarrer → **PowerShell** (ou **Terminal**).

---

## Étape 1 — Ouvrir le projet dans Claude Code

Dans le terminal, se placer dans le dossier du projet puis lancer Claude Code :

**Mac :**
```bash
cd ~/Documents/Claude/Projects/"Bureau d'étude"/outil-chiffrage
claude
```

**Windows :**
```powershell
cd "$HOME\Documents\Claude\Projects\Bureau d'étude\outil-chiffrage"
claude
```

Claude Code lit automatiquement le fichier `CLAUDE.md` : il a tout le contexte
métier (règles TVA, markup, BPU, décisions ouvertes).

---

## Étape 2 — Lancer l'app en local

Dans Claude Code, demandez simplement :

> Installe les dépendances et lance le serveur de dev.

ou faites-le à la main :
```bash
npm install
npm run dev
```
Puis ouvrir http://localhost:3000 dans le navigateur.

Vérifier que les tests passent :
```bash
npm test
```

---

## Étape 3 — Charger le BPU complet (optionnel)

1. Copier votre `BPU_LCB_BAT_v10.md` dans `data/BPU_v10.md`.
2. ```bash
   npm run bpu:build
   ```

---

## Étape 4 — Mettre en ligne sur Vercel (accès privé)

1. Créer un dépôt sur https://github.com (privé) et y pousser le projet.
   Dans Claude Code : « Initialise git et pousse sur un nouveau dépôt GitHub privé. »
2. Aller sur https://vercel.com → **Add New → Project** → importer le dépôt.
   (Framework détecté automatiquement : Next.js — rien à configurer.)
3. Après le premier déploiement : **Settings → Deployment Protection**
   → activer **Vercel Authentication** (équipe) ou **Password Protection**.

À chaque `git push`, Vercel redéploie tout seul.

---

## En cas de blocage

Dans Claude Code, décrivez l'erreur affichée dans le terminal : il corrige en
direct. Vous pouvez aussi revenir ici (Cowork) pour faire évoluer le code des
fonctionnalités, puis repousser sur GitHub.
