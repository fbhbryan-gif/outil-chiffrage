# Rapport de calage BPU v0 → propositions v1

**LCB BAT — Outil de chiffrage — base `data/bpu.json`**
**Date : 2026-06-30 | Indexation IDF Q2 2026 | Prix HT, gammes MIN/MOY/MAX**

> ⚠️ Document de travail. Les propositions v1 sont des fourchettes indicatives de
> calage, à valider par le métier poste par poste avant tout usage client. Méthode :
> audit multi-agents (8 familles + cross-cut forfaits) puis **vérification adverse de
> chaque anomalie** (réfutation HdG) ; seules les 41 anomalies confirmées sont listées.

---

## 0. Corrections appliquées — lot « défauts de saisie sûrs » (2026-06-30, v1)

Sous-ensemble non ambigu corrigé dans `data/BPU_v10.md` (régénéré) — **marqué v1, à valider** :

| Code | Avant | Après (v1) | Nature |
|---|---|---|---|
| **DEMO-43** | U / 8000/**13896**/20000 | **m² / 25/35/50** | Artefact d'import + unité corrigée (ouvrage surfacique) |
| **PEINT-03** (maison) | U / 4000/5500/9500 | **U / 5500/7700/13000** | Copier-coller cassé (maison ≈ 1,4× appart PEINT-01) |
| **CLO-17** (coffrage Geberit) | F / 130/190/320 | **F / 150/220/380** | Copier-coller cassé (distinct de CLO-12) |
| **OCMOB-13** (surélévation) | m² / 1400/1900/2900 | **m² / 2050/2750/4200** | Monotonie rétablie (OCMOB-11 2400 < 13 2750 < 12 4200) |
| **MEX-11 / CHAR-05 / RS-15 / PLO-52 / DEMO-35** | MOY à centimes (126,25 ; 193,75 ; 132,5 ; 428,75 ; 52,5) | **MOY arrondie** (126 ; 194 ; 133 ; 429 ; 53) | Nettoyage décimal. NB : hypothèse « reliquat markup ×1,25 » **réfutée** (markup = ×1,15) → simple arrondi à l'euro, **pas** de division. |

> **NON traités** (réclament un prix sourcé ou une décision structurante — cf. §4) :
> CVC-72/73 (F+P vs fourniture seule), RM-31 (ITE ?), CLO-10/11 (forfait→m²),
> OCREN-20/03/02, OCPMR-19 (scission), CVC-95/96, RAV-05, PREP-03, DEMO-28,
> et tout le double-comptage forfait/détail (OCERP/OCCHR/ACC).

---

## 1. Synthèse exécutive

**41 anomalies confirmées** par double vérification (audit + réfutation adverse).
Aucune n'a été inventée ; chacune repose sur une valeur réelle de la base, un
benchmark IDF ou une incohérence interne entre postes.

| Sévérité | Nb | Nature dominante | Risque devis |
|---|---|---|---|
| **HAUTE** | 7 | Unité fausse (forfait U sans surface), inversion de prix intra-famille, copier-coller, sous-/sur-facturation matérielle | Erreur de plusieurs k€ par devis ; poste inexploitable |
| **MOYENNE** | 18 | Niveau de prix à recaler, double comptage forfait/détail, unité ambiguë, calibration MOY systémique | Dérive de gamme, double emploi, biais de défaut |
| **BASSE** | 16 | Cohérence relative mineure, gammes trop larges, reliquats markup, granularité par taille | Impact marginal sur HT |

**Points les plus à risque (à traiter en premier) :**
- **DEMO-43** : forfait à l'unité `13 896 €/U` pour un piochage d'enduits de façade (ouvrage surfacique sans surface de rattachement) — fausse mécaniquement tout devis façade.
- **CVC-72 / CVC-73** : VMC/gainables F+P+réseau 3 à 4× sous le marché (un 14 kW tri à 2 400 € MOY < monosplit 7 kW à 4 800 €) — sous-facture le lot CVC de plusieurs k€.
- **OCREN-20** : rafraîchissement léger à `700 €/m²` MOY, soit 2,2× plus cher que la réfection lourde OCREN-06 (320 €/m²) — surfacturation client directe.
- **CLO-10/11/12** et **PEINT-01/03** : forfaits U pour des ouvrages proportionnels à la surface → écart de plusieurs k€ selon la pièce.
- **OCMOB-13** : surélévation superset moins chère que son socle OCMOB-11 — sous-facturation si sélectionné.

---

## 2. Tableau priorisé — HAUTE

| Code | Désignation courte | Champ | Actuel | Proposé v1 | Pourquoi |
|---|---|---|---|---|---|
| **DEMO-43** | Piochage enduits façade + grillage anti-fissure | unité + moy | U / 8000-**13896**-20000 | m² : 25/35/50 €/m² | Ouvrage surfacique chiffré à l'U sans surface ; MOY 13896 = artefact d'import non arrondi. Finition déjà cotée au m² (RM-31, OCREN-09). Non exploitable. |
| **CVC-72** | Gainable DUCT-24 7 kW mono F+P+réseau+MSE | gamme entière | 1400/1800/3000 | 4000/5500/9000 | Libellé annonce F+P complet, mais 3-4× sous CVC-31 (gainable 5 kW = 5800 MOY). Étiquetage ou saisie erronés. |
| **CVC-73** | Gainable DUCT-48 14 kW tri F+P+réseau+MSE | gamme entière | 1800/2400/4200 | 6500/9000/15000 | 14 kW tri à 2400 MOY < monosplit 7 kW CVC-13 (4800). Matériellement impossible. |
| **CLO-10 / 11 / 12** | Cloisons 72/48 phonique, hydrofuge, doublage | unité | F (forfait) 420/600/980 | m² : CLO-10 55-80, CLO-11 50-75, CLO-12 30-50 €/m² | Coût proportionnel à la surface ; le lot prouve le m² attendu (CLO-32/40/41). Forfait fixe faux selon pièce (WC ~4 m² vs séjour ~25 m²). |
| **PEINT-01 / 03** | Peinture complète appartement / maison | unité + valeurs | U, identiques 4000/5500/9500 | Différencier ; maison ~1,3-1,6× appart ; ou basculer au m² (RM-15/16/17 existent) | Grille strictement identique appart=maison = copier-coller. Forfait U sans surface. |
| **RM-31** | Enduit monocouche façade 3 passes (nu) | moy | 155 €/m² | 40/60-65/90 €/m² | 155 €/m² = territoire ITE (120-250), or libellé = enduit projeté nu sans isolant. Sur-chiffrage ravalement. |
| **OCMOB-13** | Surélévation HO-HA + iso + plâtrerie | gamme entière | 1400/1900/2900 | ~2050/2750/4200 €/m² | Superset de OCMOB-11 (HO-HA seul = 1750/2400/3800) mais moins cher sur les 3 gammes. Ordre 13<11<12 incohérent. |
| **OCREN-20** | Rafraîchissement léger (peinture + sol) | gamme entière | 450/700/1100 €/m² | 150/220/350 €/m² | 2,2× plus cher que OCREN-06 (réfection lourde, 210/320/520). Somme des élémentaires ~169 €/m². Surfacturation directe. |
| **OCPMR-19** | Monte-escalier / élévateur PMR ERP | poste à scinder | 3500/6500/14000 €/U | Scinder : (a) monte-escalier 3500/4800/7000 ; (b) élévateur 8000/12000/18000 | Deux familles disjointes sous un code → erreur de sélection de gamme sur poste à fort montant. |

---

## 3. Tableau priorisé — MOYENNE

### Lot PREP / DEMO (évacuation, démolition)
| Code | Désignation courte | Champ | Actuel | Proposé v1 | Pourquoi |
|---|---|---|---|---|---|
| **PREP-03** | Évacuation gravats décharge agréée BSD | moy + ordre | 80/160/220 €/m³ | moy ~100-130 ; recaler **sous** PREP-13 | Décharge inertes ressort plus chère que centre de tri DIB (PREP-13 = 115 MOY) — inversion de logique. Bench inertes 40-120. |
| **DEMO-28** | Dépose sol global (carrelage OU parquet) | gamme/doublon | 6/10/20 €/m² | Supprimer au profit de DEMO-06/07, ou 10/15/30 | Tarifé au prix du sol le moins cher (flottant) alors qu'il couvre le carrelage (DEMO-07 = 20 MOY). Sous-facture ~40-50%. |

### Lot RAV / RM / RS (ravalement, revêtements muraux/sol)
| Code | Désignation courte | Champ | Actuel | Proposé v1 | Pourquoi |
|---|---|---|---|---|---|
| **RAV-05** | Étanchéité cour/courette (membrane) | gamme entière | 150/210/360 €/m² | 95/130/200 €/m² | MIN 150 > MAX 140 de l'étanchéité comparable MAC-07 ; MOY = 2,5× MAC-07. Premium cour justifie le MAX, pas le MIN/MOY. |
| **RM-15** | Murs : prépa + impression + 2 couches | cohérence | 39 €/m² moy | ~48-55 ou documenter | RM-15 (complet) < RM-23 prépa (19) + RM-24 2C (29) = 48, alors qu'il inclut EN PLUS l'impression. Inversion somme/tout. |
| **RS-20** | Sol stratifié AC4/AC5 F+P | gamme | moy 40 €/m² | ~32/42-45/55 €/m² | Pose seule parquet verrouillée RS-51 (50) > revêtement livré-posé (40) : déroutant client. Bas de fourchette IDF. |

### Lot CLO / MEX (cloisons, menuiseries ext.)
| Code | Désignation courte | Champ | Actuel | Proposé v1 | Pourquoi |
|---|---|---|---|---|---|
| **CLO-12 / 17** | Doublage simple face / coffrage Geberit | valeurs + unité | F 130/190/320 (identiques) | CLO-17 : U ~150-280 ; CLO-12 : m² ~30-50 | Valeurs identiques au centime pour deux ouvrages sans rapport (copier-coller). CLO-17 fait aussi doublon avec CLO-02. |

### Lot CVC / OC (génie climatique, ouvrages complets)
| Code | Désignation courte | Champ | Actuel | Proposé v1 | Pourquoi |
|---|---|---|---|---|---|
| **CVC-95** | VMC logement complet simple flux hygro B | gamme + doublon | 1800/3200/6500 €/U | 1500/2200/3500 | Triple emploi avec PLO-03 / PLO-42 ; MAX 6500 = double flux. Risque double comptage. |
| **CVC-96** | Remplacement émetteurs (radiateurs) | unité | 2500/4500/9000 €/U | Requalifier en « ens »/logement, ou 400/700/1400 €/U si par émetteur | À 4500 MOY = ensemble d'émetteurs, pas une unité (cf. PLO-74/75/76 plafonnent ~1500). « U » trompeur. |
| **OCREN-03** | WC suspendu clé-en-main | niveau | 2200/3200/5500 €/U | 1500/2200/3800 €/U | MOY 3200 > OCREN-21 (buanderie clé-en-main, périmètre plus large, 2800). Surévaluation. |
| **OCREN-02** | Cuisine clé-en-main | min/floor | 1100/1650/... €/ml | 1600/2400/3800 €/ml | Clé-en-main MOY (1650) < caissons seuls AGEN-06 (1750) ; MIN (1100) < MIN caissons (1200). Floor faux. |
| **OCCHR-40** | Cuisine pro CHR (forfait U) | double comptage | 9000/15000/28000 €/U | Exclusion bloquante vs OCERP-10 | OCERP-10 (m²) facture déjà extraction+compensation ; OCCHR-40 la refacture. |
| **OCERP-22** | Pack accessibilité ERP partiel | hiérarchie | 2000/3500/6500 | Rendre mutuellement exclusif ACC-* / OCERP-22 / OCERP-03 | Trois niveaux de granularité sans règle d'exclusion → triple comptage possible. |

### Lots AGEN / DEVA / études
| Code | Désignation courte | Champ | Actuel | Proposé v1 | Pourquoi |
|---|---|---|---|---|---|
| **AGEN-\*** (famille) | Agencement / staff / ENS (63 postes) | position MOY | MOY ~30% du span (max 37%) | Recentrer MOY ~45-55% pour postes structurants, ou documenter politique | MOY systématiquement basse = biais bas structurel sur tout devis agencement par défaut (cuisines/dressings à 1750-2400 €/ml en défaut). |
| **AGEN-38** | Étude d'agencement (relevé + plans) | gamme + min | 300/600/1500 €/ens (5,0×) | 500-600/900-1100/1800-2000 (~3×) | Ratio 5× sur prestation intellectuelle ; MIN 300 < coût plancher MO d'un BE. |
| **DEVA-04** | Store-banne motorisé | unité/libellé | 300/500/900 €/ml | Préciser ml = largeur, ou basculer U 1500-4000 | Prix plausible, mais « ml » non dimensionné (largeur ? projection ?) = piège de quantité. |

---

## 4. Données à demander au métier (prix/périmètre à sourcer)

Postes où la proposition v1 ne peut pas être tranchée sans information métier réelle :

| Code(s) | Information à fournir |
|---|---|
| **DEMO-43 / RM-31** | Surface de référence façade ; périmètre exact (préparation seule vs finition incluse) ; confirmer si RM-31 couvre un ITE (alors renommer). |
| **CVC-72 / CVC-73** | Trancher : fourniture seule (corriger le libellé) **ou** F+P complet (recaler aux valeurs proposées). Décision structurante. |
| **PEINT-01 / 03** | Surface de référence (m² développé) pour basculer au m², ou ratio maison/appartement retenu. |
| **OCREN-02 / OCREN-03 / OCREN-14** | Gamme de caissons cuisine (entrée vs HdG) ; périmètre faïence/plomberie WC ; périmètre émetteurs (conservés vs neufs) pour OCREN-14. |
| **OCREN-20** | Périmètre réel du « rafraîchissement léger » (composantes incluses). |
| **OCMOB-13** | Delta iso+plâtrerie au-dessus du HO-HA (typiquement +350 à +500 €/m²). |
| **OCPMR-19** | Confirmer scission monte-escalier / élévateur et fourchettes par produit. |
| **CVC-95 / CVC-96** | Périmètre « logement complet » vs PLO-03/42 ; nature unitaire vs ensemble des émetteurs. |
| **RAV-05** | Périmètre étanchéité cour (relevés, forme de pente, EP, surface réelle). |
| **OCERP-22 / OCERP-23 / OCERP-03 / OCCHR-40/50/60/30** | Règles d'exclusion mutuelle forfait ↔ détail (anti-double-comptage) à formaliser dans l'UX/doc. |
| **OCERP-40 / SEC-06** | Profil de clientèle ERP (5e catégorie majoritaire ?) pour positionner MIN/MOY. |

---

## 5. Postes BASSE (calage de confort — à traiter en dernier)

Sans urgence, n'altèrent pas un devis en gamme par défaut :
- **DEMO-16** : DEMO-16 (faïence + plan de travail) < DEMO-23 (faïence seule) — hiérarchie à corriger ou fusionner.
- **PREP-04** : MOY étude structure collée au plancher (1800, pos 20%) ; vérifier périmètre vs PREP-24.
- **CLO-32** : MOY 110 / MAX 175 €/m² au-dessus de l'ordre de grandeur sauf variante CF/acoustique renforcée à préciser.
- **MEX-23** : seule menuiserie ext au m² ; ajouter un minimum de facturation (~600-800 €/U plancher).
- **EL-45** : ratio ×4 ; vérifier le MIN 1200 € (bas pour tableau IP55 + diff par circuit).
- **RM-17** : plafond mat (45) > plafond satiné (30) sans justification matière.
- **STAFF-05** : ratio 4,4× (raccord simple vs modénature ouvragée) — scinder ou resserrer.
- **OCERP-40** : MIN 90 €/m² ne capte pas l'effet d'échelle des grands plateaux.
- **OCREN-14** : périmètre émetteurs à trancher (cf. §4).
- **OCCHR-30 / 50 / 60**, **OCERP-23** : prix légitimes ; manque uniquement la règle d'exclusion forfait/détail.
- **MEX-11 / CHAR-05 / RS-15 / PLO-52 / DEMO-35** : MOY à décimales (×1,25) = **reliquats de l'ancien markup +15%** supprimé le 2026-06-28, jamais nettoyés. Arrondir à valeur ronde. **Nettoyage de lisibilité, sans impact métier.** (NB : MEX-10, MAC-17, DEMO-12 sont déjà ronds — hors cluster.)

---

## 6. Note de prudence

- **Tous les prix de la base sont des « v0 à dire d'expert » non validés métier.** Les propositions v1 ci-dessus sont des **fourchettes indicatives de calage**, à valider, jamais à injecter en l'état dans un devis client.
- Les benchmarks IDF Q2 2026 cités servent uniquement de **test de vraisemblance** (ordres de grandeur), pas de barème.
- **Aucune valeur de `data/bpu.json` n'a été modifiée** dans le cadre de cet audit. La correction effective relève d'une décision métier explicite, poste par poste.
- Rappel règle 3 : **RS-50 / RS-51 verrouillés à 50 €/m²** (`PRIX_VERROUILLES`) — toute proposition adjacente (ex. RS-20) recale l'autre poste, jamais le verrou.
- Le cluster « reliquats markup » (§5) confirme que la suppression du markup +15% (déc. 2026-06-28) n'a pas été propagée à 5 MOYs en base — à nettoyer indépendamment du calage métier.

---

**Synthèse chiffrée du risque :** 7 postes HAUTE peuvent fausser un devis de
**plusieurs k€ chacun** (DEMO-43, CVC-72/73, OCREN-20, CLO-10/11/12, PEINT, OCMOB-13).
Les 18 MOYENNE relèvent surtout du **double comptage** (forfait + détail) et de la
**dérive de gamme par défaut**. Priorité absolue : **DEMO-43** (poste inexploitable)
et **CVC-72/73** (sous-facturation lot CVC).
