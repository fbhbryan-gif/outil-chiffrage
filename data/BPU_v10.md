# BPU LCB BAT v10 — Bibliothèque de Prix Unitaires

> Référentiel de chiffrage interne LCB BAT, indexé **Île-de-France Q2 2026**.
> Source : programme `LCB_BAT_Bureau_Etudes_v8.html`, 284 postes consolidés sur 20 lots.
> Dernière mise à jour : avril 2026.

---

## 1. Conventions de notation

### 1.1 Préfixes de codes (lots)

| Préfixe | Lot |
|---|---|
| `PREP` | Préparation, études et installations |
| `DEMO` | Démolition et dépose |
| `MAC` | Maçonnerie et structure |
| `MP` | Murs porteurs |
| `ISO` | Isolation thermique |
| `CHAR` | Charpente et couverture |
| `CLO` | Cloisons et faux-plafonds |
| `MEN` | Menuiserie intérieure |
| `MEX` | Menuiserie extérieure |
| `SER` | Serrurerie et métallerie |
| `EL` | Électricité courants forts et faibles |
| `PLO` | Plomberie et sanitaire |
| `CVC` | Chauffage / Ventilation / Climatisation |
| `RS` | Revêtements de sols |
| `RM` | Revêtements muraux |
| `PEINT` | Peinture |
| `RAV` | Ravalement de façade |
| `MSM` | Mobilier sur mesure (postes legacy) |
| `OCMOB` | Ouvrages complets — Maison Ossature Bois |
| `OCREN` | Ouvrages complets — Rénovation |

### 1.2 Unités

| Code | Unité |
|---|---|
| `m²` | mètre carré (surface) |
| `ml` | mètre linéaire |
| `m³` | mètre cube (volume) |
| `U` | unité (pièce) |
| `F` | forfait |
| `J` | journée |
| `ens` | ensemble (lot indivisible) |

### 1.3 Fourchettes de prix

Trois prix unitaires par poste, **HT et hors markup** :

- **PU_MIN** → gamme économique, chantier simple, accès facile, faibles imprévus
- **PU_MOY** → standard, **valeur par défaut** si la gamme n'est pas précisée
- **PU_MAX** → haut de gamme, chantier complexe, accès difficile, contraintes fortes

Le **markup particuliers de +15 %** est appliqué au moment de la génération du devis client, jamais référencé sur le document final.

---

## 2. Prix manuellement validés

Ces postes ont été calés à dire d'expert. Ils s'appliquent **sans recalcul** depuis la base composants, quel que soit le contexte.

| Code | Désignation | PU |
|---|---|---|
| **RS-01** | Pose carrelage sol standard (grès cérame 60×60, pose collée + joints) | **50 €/m²** |
| **RS-09** | Pose parquet flottant standard | **50 €/m²** |

---

## 3. Bibliothèque complète par lot

### Lot PREP — Préparation, études et installations

*Études BET, autorisations, installation/repli de chantier, cantonnement, évacuation gravats* — **14 postes**

| Code | Désignation | U | MIN | MOY | MAX |
|---|---|---|---:|---:|---:|
| `PREP-01` | Installation/repli de chantier (amenée, nettoyage, signalisation) | U | 1200 | 1600 | 2500 |
| `PREP-02` | Location mini-pelle avec opérateur (journée complète, carburant inclus) | F | 1200 | 1800 | 2800 |
| `PREP-03` | Évacuation gravats en décharge agréée (BSD CERFA inclus) | m³ | 80 | 160 | 220 |
| `PREP-04` | Rapport BET structure (notes de calcul, plans d'exécution) | U | 1500 | 1800 | 3000 |
| `PREP-05` | Étude géotechnique de sol (mission G2 AVP ou G2 PRO) | U | 1200 | 1600 | 2500 |
| `PREP-06` | Plans architecturaux + dépôt PC ou déclaration préalable | U | 600 | 900 | 1800 |
| `PREP-07` | Constat huissier avant travaux (contradictoire MOA/syndic) | F | 350 | 490 | 700 |
| `PREP-08` | Installation chantier (clôture, balisage, protection des ouvrages) | F | 400 | 600 | 1200 |
| `PREP-09` | Évacuation gravois (déchetterie, transport inclus) | m³ | 60 | 90 | 150 |
| `PREP-12` | Protection chantier + ménage complet de fin de chantier | F | 800 | 1450 | 2500 |
| `PREP-13` | Gestion déchets centre tri agréé (BSD CERFA numérique) | m³ | 80 | 115 | 180 |
| `PREP-14` | Dossier DP + autorisation domaine public pour échafaudage | F | 600 | 850 | 1500 |
| `PREP-16` | Cantonnement base vie roulotte 4 compagnons (par mois) | U | 350 | 525 | 800 |
| `PREP-24` | Mission BET structure complète (G2 PRO + plans + suivi chantier) | ENS | 1800 | 2500 | 5000 |

### Lot DEMO — Démolition et dépose

*Dépose, démolition, terrassement, fouilles, évacuation des matériaux* — **21 postes**

| Code | Désignation | U | MIN | MOY | MAX |
|---|---|---|---:|---:|---:|
| `DEMO-01` | Décaissement terres végétales + chargement + évacuation | m³ | 10 | 15 | 25 |
| `DEMO-02` | Démolition dalle béton armé ép.20cm (outillage électroportatif) | m² | 45 | 70 | 120 |
| `DEMO-03` | Fouille en rigole pour semelles filantes | ml | 25 | 35 | 60 |
| `DEMO-04` | Terrassement + préparation sols (concassé, grave, géotextile) | m² | 50 | 75 | 120 |
| `DEMO-05` | Dépose cuisine complète avec consignation réseaux EU/EF | F | 300 | 400 | 700 |
| `DEMO-06` | Dépose parquet flottant + plinthes (mise à nu plancher porteur) | m² | 6 | 10 | 18 |
| `DEMO-07` | Dépose carrelage sol + plinthes (mise à nu plancher porteur) | m² | 12 | 20 | 35 |
| `DEMO-08` | Dépose cloisons non conservées + évacuation | F | 500 | 800 | 1500 |
| `DEMO-09` | Dépose + curage WC avec consignation des réseaux | F | 150 | 250 | 450 |
| `DEMO-10` | Dépose salle de bains complète (consignation + évacuation) | F | 600 | 900 | 1800 |
| `DEMO-11` | Dépose soigneuse bloc-porte (conservation ou évacuation) | U | 40 | 70 | 130 |
| `DEMO-12` | Dépose cloison avec bâti + porte (prix au mètre linéaire) | ml | 30 | 49 | 80 |
| `DEMO-16` | Dépose carrelage faïence mural + plan de travail | F | 120 | 190 | 350 |
| `DEMO-17` | Dépose cheminée + coffrage + évacuation | F | 280 | 420 | 700 |
| `DEMO-19` | Dépose plafond suspendu en lames PVC | m² | 8 | 15 | 25 |
| `DEMO-22` | Dépose SDB complète (receveur, vasque, mitigeur) | F | 300 | 450 | 800 |
| `DEMO-23` | Dépose faïences murales (burinage + mise à nu support) | F | 120 | 200 | 380 |
| `DEMO-26` | Dépose doublages BA13 muraux (pour ITI) | m² | 12 | 20 | 35 |
| `DEMO-28` | Dépose sol global carrelage ou parquet | m² | 6 | 10 | 20 |
| `DEMO-35` | Dépose radiateur existant + obturation raccords | U | 35 | 52,5 | 90 |
| `DEMO-43` | Piochage intégral enduits façade + grillage galvanisé anti-fissure | U | 8000 | 13896 | 20000 |

### Lot MAC — Maçonnerie et structure

*Béton, étanchéité, escaliers, ouvrages structurels, dallages* — **21 postes**

| Code | Désignation | U | MIN | MOY | MAX |
|---|---|---|---:|---:|---:|
| `MAC-01` | Semelle filante béton armé C25/30 (0,40×0,50m) | U | 1800 | 2610 | 4000 |
| `MAC-02` | Dalle pleine vide sanitaire ép.12cm (treillis ST15 + béton C25/30) | m² | 80 | 120 | 200 |
| `MAC-05` | Plancher poutrelles précontraintes 12+4cm (DTU 23.1) | m² | 130 | 185 | 280 |
| `MAC-06` | Plancher toit-terrasse poutrelles + entrevous (acrotère inclus) | m² | 130 | 185 | 280 |
| `MAC-07` | Étanchéité toit-terrasse bicouche Soprema ou EPDM (DTU 43.1) | m² | 60 | 85 | 140 |
| `MAC-08` | Couvertine aluminium prélaqué sur relevé d'acrotère | ml | 70 | 100 | 160 |
| `MAC-09` | Naissance EP + descente EP + raccordement réseau drainage | ml | 80 | 115 | 180 |
| `MAC-10` | Élévation maçonnée aggloméré 20×20×50 (joint bâtard) | m² | 45 | 65 | 100 |
| `MAC-11` | Linteau béton armé 20×20 (ferraillage + coulage C20/25) | ml | 100 | 145 | 220 |
| `MAC-14` | Chaînage horizontal plancher (agglo U + béton + HA) | ml | 45 | 65 | 100 |
| `MAC-15` | Crépis façade taloché ou grésé (gobetis + corps + finition) | m² | 35 | 55 | 90 |
| `MAC-16` | Escalier ext. béton balancé 6-7 marches (largeur ≤90cm) | U | 600 | 800 | 1400 |
| `MAC-17` | Ouverture mur façade + pose poutre métal UPE/IPN (selon BET) | U | 1800 | 2590 | 4500 |
| `MAC-18` | Terrasse haute béton armé (dalle + fondation + préparation) | U | 1000 | 1450 | 2500 |
| `MAC-19` | Terrasse basse béton armé sur terre plein | U | 600 | 900 | 1600 |
| `MAC-21` | Carrelage ext. anti-dérapant R11 (dalle pierre naturelle) | m² | 75 | 110 | 180 |
| `MAC-23` | Chape fibrée + ragréage sol (ensemble du niveau, DTU 26.2) | m² | 20 | 30 | 50 |
| `MAC-24` | Ragréage autonivelant fibré (niveau complémentaire, DTU 26.2) | m² | 15 | 25 | 45 |
| `MAC-25` | Escalier béton armé 4 marches + sas (coffrage + coulage) | U | 1000 | 1490 | 2500 |
| `MAC-29` | Dalle béton terre plein intérieur (ST25 + polyane 150µ) | m² | 80 | 115 | 180 |
| `MAC-30` | Dalle béton terrasse extérieure (ST25 + grave drainante) | m² | 80 | 115 | 180 |

### Lot MP — Murs porteurs

*Ouvertures dans murs porteurs, poutres IPN, sommiers (avec BET)* — **5 postes**

| Code | Désignation | U | MIN | MOY | MAX |
|---|---|---|---:|---:|---:|
| `MP-01` | Découpe mur porteur scie diamant + étaiement bastaings | U | 1000 | 1460 | 2500 |
| `MP-02` | Sommier BA (coffrage + ferraillage + SikaGrout sans retrait) | U | 800 | 1130 | 1800 |
| `MP-04` | Coffrage BA13 PLACOFLAMM CF1h poutre + bandes calicots | U | 550 | 830 | 1400 |
| `MP-05` | Dépose cloison porteuse (étaiement + IPN + 2 sommiers + coffrage BA13) | F | 3200 | 4960 | 8000 |
| `MP-06` | Renforcement mur porteur (étaiement lourd + HEA + matage mortier) | ml | 600 | 900 | 1500 |

### Lot ISO — Isolation thermique

*ITI, ITE, isolation toiture (à enrichir en v11)* — **6 postes**

| Code | Désignation | U | MIN | MOY | MAX |
|---|---|---|---:|---:|---:|
| `ISO-01` | Doublage LV ISOVER GR32 ép.100mm + BA13 (R=3,15 m².K/W) | m² | 45 | 60 | 90 |
| `ISO-02` | Doublage PU Placotherm 13+60 R=2,80 m².K/W collé | m² | 55 | 75 | 115 |
| `ISO-03` | Doublage murs + rampants LV GR32 ép.100mm + BA13 | m² | 50 | 70 | 110 |
| `ISO-04` | Doublage ITI GR30 ép.9cm + BA13 + frein-vapeur INTELLO+ | m² | 45 | 60 | 90 |
| `ISO-06` | Doublage ossature bois 140mm + polyuréthane haute densité | m² | 75 | 105 | 165 |
| `ISO-07` | Doublage ossature bois 140mm + laine de bois STEICO | m² | 75 | 105 | 165 |

### Lot CHAR — Charpente et couverture

*Charpente bois/métal, couverture zinc/tuile, gouttières* — **6 postes**

| Code | Désignation | U | MIN | MOY | MAX |
|---|---|---|---:|---:|---:|
| `CHAR-01` | Dépose partielle charpente/couverture (jonction extension) | U | 550 | 800 | 1400 |
| `CHAR-02` | Reprise charpente-couverture extension (EP + gouttière) | U | 1400 | 1900 | 3200 |
| `CHAR-03` | Gouttière zinc demi-ronde (crochets universels + crapaudines) | ml | 90 | 125 | 200 |
| `CHAR-04` | Descente EP zinc (tubes + colliers + dauphin fonte peint) | ml | 75 | 110 | 180 |
| `CHAR-05` | Charpente + couverture zinc extension (pigmenté ou naturel) | m² | 140 | 193,75 | 320 |
| `CHAR-06` | Chéneau zinc carré (jonction extension/mur de clôture) | ml | 300 | 420 | 700 |

### Lot CLO — Cloisons et faux-plafonds

*BA13, faux-plafonds, galandages, doublages, ossatures* — **16 postes**

| Code | Désignation | U | MIN | MOY | MAX |
|---|---|---|---:|---:|---:|
| `CLO-01` | Niche de rangement encastrée en BA13 (par niche) | U | 250 | 350 | 600 |
| `CLO-02` | Coffrage BA13 divers (poutre, soffite, WC suspendu) | U | 180 | 250 | 420 |
| `CLO-06` | Faux-plafond acoustique BA13 + TECSOUND (spots LED intégrés) | m² | 60 | 80 | 130 |
| `CLO-08` | Faux-plafond BA13 plan sur fourrures F47 (prêt à peindre) | m² | 55 | 75 | 120 |
| `CLO-10` | Cloison 7cm BA13 phonique recto-verso sur rail métallique | F | 420 | 600 | 980 |
| `CLO-11` | Cloison 7cm BA13 hydrofuge sur rail métallique (pièces humides) | F | 420 | 600 | 980 |
| `CLO-12` | Doublage mur intérieur BA13 hydrofuge simple face | F | 130 | 190 | 320 |
| `CLO-14` | Création demi-arche décorative BA13 sur ossature métallique | F | 170 | 250 | 430 |
| `CLO-15` | Faux-plafond cuisine BA13 sur fourrures (prêt à peindre) | m² | 45 | 65 | 105 |
| `CLO-16` | Cloison WC avec galandage (BA13 recto-verso + châssis encastré) | F | 550 | 790 | 1300 |
| `CLO-17` | Coffrage bâti Geberit en BA13 hydrofuge (WC suspendu) | F | 130 | 190 | 320 |
| `CLO-28` | Faux-plafond hydrofuge SDE/SDB (BA13H sur fourrures F47) | m² | 45 | 65 | 105 |
| `CLO-30` | Enduit réparation fissure plafond suite dépose cloisons (ml) | ml | 7 | 10 | 18 |
| `CLO-32` | Cloison 100mm double BA13 (Rw≥46dB, DTU 25.41) | m² | 80 | 110 | 175 |
| `CLO-33` | Faux-plafond rampant BA13 + laine de bois (combles aménagés) | m² | 60 | 85 | 140 |
| `CLO-35` | Reprise plâtres suite dépose faïence ou crédence | m² | 30 | 45 | 75 |

### Lot MEN — Menuiserie intérieure

*Portes intérieures, blocs-portes, placards, plinthes* — **15 postes**

| Code | Désignation | U | MIN | MOY | MAX |
|---|---|---|---:|---:|---:|
| `MEN-02` | Pose cuisine IKEA METOD (branchements + raccordements TCE) | F | 2000 | 2800 | 4500 |
| `MEN-03` | Bibliothèque MDF toute hauteur H≈275cm (bandeau LED inclus) | U | 3000 | 4250 | 7000 |
| `MEN-05` | Pont de lit MDF à peindre (penderies + éclairage tête de lit) | U | 2800 | 3800 | 6500 |
| `MEN-06` | Porte galandage âme pleine passage 65cm (inox brossé) | U | 1100 | 1490 | 2500 |
| `MEN-07` | Bibliothèque MDF placage chêne H≈275cm (bandeau LED) | U | 1400 | 1900 | 3200 |
| `MEN-08` | Repose porte mise en réserve (pose seule) | U | 80 | 130 | 220 |
| `MEN-10` | Porte coulissante rail applique à peindre passage 63cm | U | 230 | 320 | 550 |
| `MEN-11` | Porte galandage à peindre passage 73cm (châssis + quincaillerie) | U | 450 | 650 | 1100 |
| `MEN-13` | Fenêtre PVC + imposte basse fixe (DV 4/16/4 argon Uw≤1,30) | U | 900 | 1250 | 2200 |
| `MEN-14` | Velux 118×114 + stores opaque + solaire ext. + modif. charpente | F | 2400 | 3200 | 5500 |
| `MEN-15` | Velux remplacement 98×78 + store tamisant intérieur | F | 700 | 950 | 1600 |
| `MEN-16` | Fenêtre PVC DV 2 vantaux 129×80cm (4/16/4 argon) | U | 450 | 650 | 1100 |
| `MEN-17` | Porte intérieure LM Matild passage 73cm (fourniture + pose) | U | 380 | 550 | 950 |
| `MEN-18` | Porte coulissante bois galandage 63cm + quincaillerie design | U | 650 | 890 | 1500 |
| `MEN-20` | Remise en état escalier (décapage + sablage + peinture + vernis) | U | 1000 | 1400 | 2500 |

### Lot MEX — Menuiserie extérieure

*Fenêtres, baies, volets, pergolas (à enrichir en v11)* — **5 postes**

| Code | Désignation | U | MIN | MOY | MAX |
|---|---|---|---:|---:|---:|
| `MEX-01` | Porte bois 1V + tierce fixe petits bois doucine (dito exist.) | U | 1200 | 1650 | 2800 |
| `MEX-02` | Porte alu 1V thermolaquée RAL (vert lichen ou autre) | U | 1300 | 1800 | 3200 |
| `MEX-06` | Velux toiture plate 78×98cm avec store intérieur DKL | U | 1000 | 1400 | 2500 |
| `MEX-10` | Fenêtre bois 2V SP10 petits bois (dito menuiseries existantes) | U | 550 | 755 | 1400 |
| `MEX-11` | Store roulant micro-perforé L=135cm (fourniture + pose) | U | 90 | 126,25 | 220 |

### Lot SER — Serrurerie et métallerie

*Garde-corps, verrières, portails (à enrichir en v11)* — **2 postes**

| Code | Désignation | U | MIN | MOY | MAX |
|---|---|---|---:|---:|---:|
| `SER-01` | Clôture fer forgé barreaudage dito existant (fourniture + pose) | ml | 300 | 425 | 750 |
| `SER-02` | Portail fer forgé 90cm barreaudage dito existant (fourniture + pose) | ml | 380 | 515 | 950 |

### Lot EL — Électricité courants forts et faibles

*NF C 15-100, tableaux Schneider Resi9, prises Odace, éclairage, RJ45* — **22 postes**

| Code | Désignation | U | MIN | MOY | MAX |
|---|---|---|---:|---:|---:|
| `EL-01` | Distribution électrique générale semi-encastrée (NFC15100) | U | 1000 | 1400 | 2400 |
| `EL-02` | Prise PC-16A+T (appareillage + raccordement, par prise) | U | 35 | 50 | 90 |
| `EL-03` | Point lumineux (sortie de fil plafond ou applique murale) | U | 85 | 120 | 200 |
| `EL-05` | TGBT neuf appartement (Legrand/Schneider + CONSUEL inclus) | U | 2200 | 2900 | 5000 |
| `EL-06` | Sèche-serviettes Atlantic Adélis 750W (ligne directe + pose) | U | 500 | 690 | 1200 |
| `EL-08` | TGBT complet maison 3 niveaux (GTL + 3 tableaux + CONSUEL) | F | 4000 | 5300 | 9000 |
| `EL-09` | Alimentation PAC (ligne TGBT + sectionneur IP55 extérieur) | U | 600 | 800 | 1400 |
| `EL-10` | Ligne dédiée moteur volet électrique (par volet) | U | 100 | 140 | 240 |
| `EL-11` | Prise PC-16 RDC encastrée (Dooxie Legrand blanc) | U | 90 | 120 | 200 |
| `EL-12` | Double prise PC-16 encastrée (Dooxie Legrand) | U | 100 | 140 | 240 |
| `EL-13` | Triple prise PC-16 encastrée (Dooxie Legrand) | U | 120 | 160 | 270 |
| `EL-15` | Prise PC-20 spécialisée (LV, SL, frigo, ligne directe dédiée) | U | 90 | 120 | 200 |
| `EL-16` | Prise PC-32A plaque de cuisson (câble 6mm², disjoncteur 32A) | U | 100 | 140 | 240 |
| `EL-18` | Sortie de fil plafond RDC (suspension ou plafonnier) | U | 80 | 110 | 190 |
| `EL-22` | Interrupteur simple RDC (Dooxie Legrand blanc) | U | 95 | 130 | 220 |
| `EL-24` | Interrupteur va-et-vient RDC | U | 100 | 140 | 240 |
| `EL-29` | Prise RJ45 cat.6 RDC (câblée sur coffret VDI) | U | 110 | 150 | 260 |
| `EL-31` | Boîtier multimédia VDI 8 pots encastré (grade 2/3) | U | 130 | 180 | 320 |
| `EL-32` | Spot LED encastré Ø85mm 3000K IRC≥80 (pièces sèches) | U | 350 | 480 | 800 |
| `EL-33` | Spot LED étanche IP65 Ø85mm 3000K (pièces humides) | U | 175 | 240 | 420 |
| `EL-36` | Électricité véranda (2 appliques IP44 + 2 PC16 + 1 interrupteur) | F | 600 | 800 | 1400 |
| `EL-42` | Luminaire ou suspension au choix MOA (fourniture + pose) | U | 350 | 480 | 850 |

### Lot PLO — Plomberie et sanitaire

*EF/ECS, EU/EV, sanitaires, robinetterie, ballons, chaudières* — **50 postes**

| Code | Désignation | U | MIN | MOY | MAX |
|---|---|---|---:|---:|---:|
| `PLO-01` | Conduit extraction VMC façade (carottage + manchon + grille) | U | 600 | 850 | 1400 |
| `PLO-02` | Chauffe-eau Atlantic Lineo 100L pose murale (raccordements inclus) | U | 900 | 1200 | 2000 |
| `PLO-03` | VMC centralisée Aldes EasyHome hygro (3 pièces humides) | F | 1200 | 1600 | 2800 |
| `PLO-04` | Distribution EF/ECS multicouche serti (par appareil) | U | 130 | 190 | 320 |
| `PLO-05` | Évacuation PVC DN40 ou DN100 (par appareil sanitaire) | U | 160 | 230 | 380 |
| `PLO-06` | Bâti-support Geberit DuoFix H=112cm + réservoir UP230 | U | 320 | 450 | 750 |
| `PLO-07` | WC suspendu Geberit Renova Compact 48cm + abattant softclose | U | 700 | 950 | 1600 |
| `PLO-08` | Mitigeur lavabo Grohe Essence S bronze (fourniture + pose) | U | 350 | 490 | 850 |
| `PLO-09` | Porte douche pliante 70cm Mexen Mist-F (cuivre brossé) | U | 300 | 400 | 700 |
| `PLO-10` | Receveur résine + bonde réglette extra-plate (fourniture + pose) | U | 320 | 450 | 750 |
| `PLO-11` | Meuble sous-vasque 80cm 2 tiroirs (chêne Coast Evoke LM) | U | 350 | 490 | 850 |
| `PLO-14` | Pack bâti Geberit DuoFix + cuvette Villeroy & Boch faible profondeur | U | 850 | 1150 | 2000 |
| `PLO-15` | Ajustement réseaux douche + lave-mains (reconfiguration) | F | 650 | 900 | 1600 |
| `PLO-16` | Étanchéité zone douche KERDI ou Sika (natte + bandes d'about) | F | 380 | 500 | 850 |
| `PLO-17` | Receveur douche 90×80cm + bonde extra-plate (fourniture seule) | U | 550 | 740 | 1300 |
| `PLO-19` | Receveur douche 140×90cm + bonde extra-plate (fourniture seule) | U | 350 | 470 | 850 |
| `PLO-25` | Paroi douche fixe 80cm profilé doré brossé (fourniture seule) | U | 430 | 590 | 1050 |
| `PLO-28` | Meuble vasque suspendu Panthéon ou équivalent (pose incluse) | U | 520 | 720 | 1300 |
| `PLO-29` | Baignoire îlot ovale + robinet bain-douche de plage Châtelet | U | 1200 | 1600 | 3000 |
| `PLO-30` | Réseau EV + EF pour WC en création (canalisations complètes) | U | 500 | 690 | 1200 |
| `PLO-33` | Attente EF/EC + EU (par point — évier ou lave-mains) | U | 140 | 200 | 340 |
| `PLO-42` | VMC hygro compacte Aldes EasyHome 5-6 pièces humides | U | 1350 | 1850 | 3200 |
| `PLO-44` | Réseaux EF/ECS complets (multicouche serti + réducteur pression) | ENS | 1800 | 2500 | 4500 |
| `PLO-45` | Réseaux EU/EV intérieurs en PVC (canalisations vidange) | ENS | 420 | 600 | 1100 |
| `PLO-52` | Robinet ext. mural (fourniture + pose + distribution EF) | U | 300 | 428,75 | 750 |
| `PLO-60` | PAC air-eau monoblock 6-8 kW chauffage+ECS R32 COP≥3,8 — Atlantic Extensa 6 AOYA06LALL ou Daikin Altherma 3 ERLA06DV3 ou Mitsubishi Ecodan PUHZ-SW50VHA — fourniture+pose+raccordements hydrauliques+MSE | U | 7000 | 9500 | 14000 |
| `PLO-61` | PAC air-eau monoblock 10-12 kW chauffage+ECS R32 COP≥3,5 — Atlantic Extensa 12 AOYA12LALL ou Daikin Altherma 3 ERLA12DV3 ou Mitsubishi Ecodan PUHZ-SW120VHA — fourniture+pose+raccordements hydrauliques+MSE | U | 9500 | 12500 | 18000 |
| `PLO-62` | Ballon tampon hydraulique 200L — Atlantic Sauvegarde 200 ou Daikin BUH200GW ou Mitsubishi EHST20D-MEC — calorifugeage PU 50mm + raccordements — fourniture+pose | U | 2000 | 2800 | 5000 |
| `PLO-63` | Groupe hydraulique PAC — circulateur Grundfos UPM3 ou Wilo Stratos Pico + vase 12L + soupape 3b + filtre maillage — fourniture+pose+raccordement | U | 850 | 1200 | 2200 |
| `PLO-64` | Chaudière gaz condensation murale 24-28 kW ECS instantanée ErP A+ — Viessmann Vitodens 100-W B1HF024 ou Atlantic Naéa Condens 24 ou De Dietrich MCR3-24 — fourniture+pose+raccord gaz/eau/condensats+évacuation PPs Ø80/125+MSE | U | 4000 | 5500 | 9000 |
| `PLO-65` | Chaudière gaz condensation sol 30-35 kW ErP A+ rendement 109% PCI — Viessmann Vitodens 200-W B2HF035 ou De Dietrich MCR5-34 ou Buderus Logamax Plus GB172i-35 — fourniture+pose+TCE+évacuation+MSE+1 an entretien inclus | U | 5500 | 7200 | 12000 |
| `PLO-66` | Ballon ECS 200L inox couplé chaudière — Viessmann Vitocell 100-W CVAA200 ou Atlantic Corhydro 200 ou De Dietrich ST-160-E — calorifugeage+raccordement serpentin+MSE — fourniture+pose | U | 1200 | 1800 | 3200 |
| `PLO-67` | Entretien annuel chaudière gaz — ramonage+réglage combustion+contrôle sécurités+attestation obligatoire (arrêté 15/09/2009) — compatible Viessmann/Atlantic/De Dietrich/toutes marques | U | 280 | 420 | 750 |
| `PLO-68` | Ballon thermodynamique 200L COP≥2,9 mono 230V — Atlantic Calypso VM 200 (050302) ou Ariston Nuos Plus 200 ou Thermor Aeromax 4 200L — fourniture+pose+raccordements eau+électrique ligne dédiée 16A+MSE | U | 1800 | 2400 | 4000 |
| `PLO-69` | Ballon thermodynamique 270L COP≥3,0 mono 230V — Atlantic Calypso VM 270 ou Thermor Aeromax 4 270L ou Stiebel Eltron WWK 301 — fourniture+pose+raccordements eau+électrique+MSE | U | 2200 | 2900 | 5000 |
| `PLO-70` | Plancher chauffant hydraulique BT tubes PER Ø16 e=15cm — isolant PSE Noma Confort 20mm Knauf ou Uponor Uni Pipe PLUS ou Rehau RAUTHERM S — film polyane+agrafage DTU 65.14 — pose seule hors chape | m² | 40 | 55 | 90 |
| `PLO-71` | Collecteur PCH 3-6 circuits vannes équilibrage+débitmètres+têtes thermo — Uponor Vario S ou Rehau Rautitan ou Giacomini R553 — fourniture+pose+équilibrage hydraulique | U | 1200 | 1800 | 3200 |
| `PLO-72` | Chape fluide anhydrite ép.5cm sur plancher chauffant — Lafarge Agilia Sol A5 ou Chryso Self-sol ou Knauf FE50 — pompage+mise à niveau+mise à l'eau+contrôle humidité avant revêtement — fourniture+pose DTU 26.2 | m² | 22 | 30 | 55 |
| `PLO-73` | Vanne mélangeuse 3 voies+circulateur régulation PCH — Grundfos MAGNA3+vanne Watts Aquamix ou Wilo Yonos PICO+Oventrop Aquastrom — fourniture+pose+réglage courbe chauffe | U | 250 | 380 | 700 |
| `PLO-74` | Radiateur acier tubulaire 500-1000W eau chaude — robinet thermostatique Danfoss RA2000 inclus — Zehnder Charleston 2-col H600 ou Acova Clarian TRD ou Runtal Rondal — fourniture+pose+raccordement+purge | U | 320 | 480 | 950 |
| `PLO-75` | Radiateur acier tubulaire 1000-2000W eau chaude — robinet thermostatique+té de réglage — Zehnder Charleston 3-col H600 ou Acova Atoll ou Runtal Vertical — fourniture+pose+raccordement+purge | U | 480 | 680 | 1400 |
| `PLO-76` | Sèche-serviettes eau chaude 500-750W — Zehnder Zeno H1217 ou Acova Kerberos Duo 750W ou Atlantic Adelis H750 — robinet thermostatique Danfoss RTD-N inclus — fourniture+pose+raccordement | U | 500 | 750 | 1500 |
| `PLO-77` | Robinet thermostatique remplacement — Danfoss RA 2000 ou Oventrop Uni LD ou Giacomini R470 — fourniture+pose+purge+réglage (par radiateur) | U | 120 | 180 | 350 |
| `PLO-78` | Adoucisseur eau bi-bloc 12-15L résine TH IDF 30-40°f — Fleck 5600SXT 12L ou BWT Perla Silk 12L ou Culligan Mark 89 — by-pass inox+sel 25kg inclus — fourniture+pose+raccordement+MSE | U | 1600 | 2200 | 4000 |
| `PLO-79` | Entretien annuel adoucisseur — rechargement sel 25kg+contrôle TH+réglage capacité — compatible Fleck/BWT/Culligan/toutes marques | U | 120 | 180 | 320 |
| `PLO-80` | Pompe de relevage EU — Grundfos Unilift KP250-A1 ou Wilo Drain TP50 ou SFA Saninivea — installation sous-sol/local technique — fourniture+pose+raccordement EU+alarme niveau | U | 580 | 850 | 1600 |
| `PLO-81` | Disconnecteur anti-pollution type BA ou EA — Watts 007 DN20 ou Honeywell D06FN 3/4" ou Socla Hydromat — conformité NF EN 1717 — fourniture+pose+test étanchéité | U | 200 | 320 | 580 |
| `PLO-82` | Régulation multizone chauffage 3 zones WiFi+appli — Netatmo Smart NRH01+3x NVP-PRG ou Honeywell Evohome ATF600 ou Nest Thermostat 3e gén T3028EF — fourniture+pose+programmation+MSE | U | 1000 | 1400 | 2600 |
| `PLO-83` | Désembouage circuit chauffage — Fernox F3 ou Sentinel X400+rinçage+inhibiteur Fernox F1 — fourniture produits+main d'oeuvre — avant remplacement chaudière ou PAC — toutes installations | U | 180 | 290 | 550 |
| `PLO-84` | Mise en service installation chauffage — réglages températures départ/retour+courbes chauffe+équilibrage hydraulique+formation utilisateur — Atlantic/Daikin/Mitsubishi/Viessmann/De Dietrich ou toutes marques — main d'oeuvre seule | U | 260 | 380 | 680 |

### Lot CVC — Chauffage / Ventilation / Climatisation

*PAC air-air et air-eau Tekno Point, VMC, radiateurs, climatisation gainable* — **39 postes**

| Code | Désignation | U | MIN | MOY | MAX |
|---|---|---|---:|---:|---:|
| `CVC-01` | Split RDC inverter A++ + unité ext. (fourniture + pose + mise en service) | U | 2500 | 3500 | 6500 |
| `CVC-02` | Split chambre inverter A++ (fourniture + pose + mise en service) | U | 1800 | 2500 | 4500 |
| `CVC-05` | Modification installation chauffage existante (dévoiement) | ENS | 650 | 960 | 1800 |
| `CVC-06` | Dépose + réinstallation chaudière (purge + raccordements) | U | 500 | 715 | 1300 |
| `CVC-10` | Split mural monosplit inverter 2,5kW A+++ — Daikin FTXM25R/RXM25R ou Mitsubishi MSZ-AP25VGK/MUZ-AP25VG ou Atlantic ASYG09KMCE/AOYG09KMCE ou Hitachi RAK-25RPE/RAC-25WPE — fourniture + pose + mise en service | U | 2200 | 3200 | 5500 |
| `CVC-11` | Split mural monosplit inverter 3,5kW A+++ — Daikin FTXM35R/RXM35R ou Mitsubishi MSZ-AP35VGK/MUZ-AP35VG ou Atlantic ASYG12KMCE/AOYG12KMCE ou Hitachi RAK-35RPE/RAC-35WPE — fourniture + pose + mise en service | U | 2600 | 3600 | 6200 |
| `CVC-12` | Split mural monosplit inverter 5,0kW A+++ — Daikin FTXM50R/RXM50R ou Mitsubishi MSZ-AP50VGK/MUZ-AP50VG ou Atlantic ASYG18KMCE/AOYG18KMCE ou Hitachi RAK-50RPE/RAC-50WPE — fourniture + pose + mise en service | U | 3000 | 4100 | 7000 |
| `CVC-13` | Split mural monosplit inverter 7,0kW A+++ — Daikin FTXM71R/RXM71R ou Mitsubishi MSZ-AP71VGK/MUZ-AP71VG ou Atlantic ASYG24KMCE/AOYG24KMCE ou Hitachi RAK-70RPE/RAC-70WPE — fourniture + pose + mise en service | U | 3500 | 4800 | 8500 |
| `CVC-20` | Multi-split 2 pièces 2×2,5kW — Daikin 2MXM40A+2×CTXM25R ou Mitsubishi MXZ-2HA40VF+2×MSZ-AP25VGK ou Atlantic AOYG14KBTB+2×ASYG09KMCE ou Hitachi RAM-40NP2B+2×RAK-25RPE — fourniture + pose + mise en service | ENS | 5200 | 7200 | 12000 |
| `CVC-21` | Multi-split 3 pièces 3×2,5kW — Daikin 3MXM52A+3×CTXM25R ou Mitsubishi MXZ-3HA52VF+3×MSZ-AP25VGK ou Atlantic AOYG18KBTA3+3×ASYG09KMCE ou Hitachi RAM-55NP3B+3×RAK-25RPE — fourniture + pose + mise en service | ENS | 7000 | 9500 | 16000 |
| `CVC-22` | Multi-split 4 pièces 4×2,5kW — Daikin 4MXM68A+4×CTXM25R ou Mitsubishi MXZ-4HA83VF+4×MSZ-AP25VGK ou Atlantic AOYG24KBTA4+4×ASYG09KMCE ou Hitachi RAM-68NP4B+4×RAK-25RPE — fourniture + pose + mise en service | ENS | 8500 | 11500 | 19000 |
| `CVC-23` | Unité intérieure murale additionnelle multi-split — Daikin CTXM25R/35R ou Mitsubishi MSZ-AP25VGK/35VGK ou Atlantic ASYG09KMCE/12KMCE ou Hitachi RAK-25RPE/35RPE — fourniture + pose + raccordement | U | 1300 | 1800 | 3200 |
| `CVC-30` | Climatiseur console au sol 3,5kW A++ — Daikin FVXM35F/RXM35R ou Mitsubishi MFZ-KT35VG/MUZ-KT35VG ou Atlantic AGYG12KVCA/AOYG12KVCA ou Hitachi RPC-3.5FSNM/ROC-3.5FSNM — fourniture + pose + mise en service | U | 3000 | 4200 | 7200 |
| `CVC-31` | Climatiseur gainable monozone 5,0kW — Daikin FDXS50F/RXS50L ou Mitsubishi SEZ-M50DA/SUZ-M50VA ou Atlantic ARXG18KMLA/AOYG18KBTB ou Hitachi RPI-5.0FSRE/RAS-5HVNPE — fourniture + pose + réseau soufflage/reprise + mise en service | U | 4200 | 5800 | 9500 |
| `CVC-32` | Climatiseur gainable multizone 7,0kW 2-4 bouches — Daikin FDXS71F/RXS71L ou Mitsubishi SEZ-M71DA/SUZ-M71VA ou Atlantic ARXG24KMLA/AOYG24KBTB ou Hitachi RPI-7.0FSRE/RAS-7HVNPE — fourniture + pose + réseau complet + mise en service | U | 6000 | 8500 | 14000 |
| `CVC-33` | Cassette plafond 4 directions 3,5kW — Daikin FCAHG35B/RXM35R ou Mitsubishi SLZ-M35FA/SUZ-M35VA ou Atlantic AUYG12LVLB/AOYG12KVCA ou Hitachi RCI-3.5XNPE/RAS-3HVNPE — fourniture + pose + mise en service | U | 2800 | 3900 | 6500 |
| `CVC-40` | Liaison frigorifique cuivre isolée ≤3/8+1/2 — au mètre linéaire posé (aller + retour) | ml | 60 | 85 | 150 |
| `CVC-41` | Liaison frigorifique cuivre isolée ≤1/2+5/8 — au mètre linéaire posé (aller + retour) | ml | 75 | 110 | 190 |
| `CVC-42` | Goulotte PVC blanche 60×40mm habillage liaisons frigorifiques — pose murale | ml | 30 | 45 | 80 |
| `CVC-43` | Support unité extérieure — console murale galva + chevilles chimiques + anti-vibratoires — pose façade | U | 120 | 180 | 350 |
| `CVC-44` | Support unité extérieure — platine toit terrasse inox + lestage — pose toiture | U | 200 | 280 | 520 |
| `CVC-45` | Conduit évacuation condensats PVC Ø22mm — depuis unité intérieure jusqu'à EU existante | ml | 22 | 35 | 65 |
| `CVC-46` | Raccordement électrique dédié climatiseur — câble 3G2,5mm² + disjoncteur bipolaire 16A depuis tableau | U | 90 | 140 | 260 |
| `CVC-47` | Carottage façade Ø80mm pour passage liaisons — rebouchage + manchon étanche (par traversée) | U | 45 | 65 | 120 |
| `CVC-50` | Entretien annuel monosplit — nettoyage filtres + échangeurs + vérification pression + attestation F-Gaz (toutes marques) | U | 130 | 180 | 320 |
| `CVC-51` | Entretien annuel multi-split — nettoyage 1 unité ext. + jusqu'à 4 unités int. + attestation (toutes marques) | U | 190 | 260 | 480 |
| `CVC-52` | Entretien annuel gainable — nettoyage réseau gaines + filtres + vérification + attestation (toutes marques) | U | 280 | 380 | 680 |
| `CVC-53` | Recharge fluide frigorigène R32 (300g) — détection fuite préalable incluse — attestation F-Gaz (compatible Daikin/Mitsubishi/Atlantic/Hitachi) | U | 200 | 290 | 520 |
| `CVC-60` | Dépose monosplit existant — pompage fluide R32/R410A + dépose unités int./ext. + obturation — technicien certifié F-Gaz (toutes marques) | U | 280 | 380 | 680 |
| `CVC-61` | Dépose multi-split existant — pompage + dépose complète jusqu'à 3 unités int. — technicien certifié F-Gaz (toutes marques) | U | 380 | 520 | 950 |
| `CVC-70` | Unité intérieure condensation à eau invisible monosplit 7kW (24000 BTU) R32 — Tekno Point IDRA-24C (ISKV-24C9) — mono 220V — raccord eau 1/2" — fourniture + pose + raccordement hydraulique + MSE | U | 3400 | 4150 | 6500 |
| `CVC-71` | Unité intérieure condensation à eau invisible monosplit 10,5kW (35800 BTU) R32 — Tekno Point IDRA-36C (ISKV-36C9) — mono 220V — raccord eau 1/2" — fourniture + pose + raccordement hydraulique + MSE | U | 4500 | 5500 | 8000 |
| `CVC-72` | Gainable DC inverter 7kW froid+chaud (DUCT-24) — Tekno Point DUCT-24-V — mono 220V — liaisons frigo 1/4"-5/8" — fourniture + pose en faux-plafond + réseau + MSE | U | 1400 | 1800 | 3000 |
| `CVC-73` | Gainable DC inverter 14kW froid+chaud (DUCT-48) — Tekno Point DUCT-36-48-V — triphasé 380V — liaisons frigo 3/8"-3/4" — fourniture + pose en faux-plafond + réseau + MSE | U | 1800 | 2400 | 4200 |
| `CVC-74` | Kit régulation zonée AIRZONE 3 zones WiFi — Tekno Point KIT AIRZONE 3 WIFI : centrale Flexa 4.0 + 3x thermostats radio + 3x registres motorisés 150mm + bypass + serveur cloud — fourniture + pose + programmation + MSE | ENS | 2500 | 3050 | 4800 |
| `CVC-75` | Kit anti-coup de bélier hydraulique — Tekno Point KIT AWHAM — fourniture + pose sur réseau eau | U | 90 | 150 | 220 |
| `CVC-76` | Réducteur de pression 3/4" M-F avec manomètre et thermomètre intégrés — Tekno Point RID-PR2 — fourniture + pose | U | 160 | 200 | 380 |
| `CVC-77` | Réducteur de pression 1" M-F avec manomètre et thermomètre intégrés — Tekno Point RID-PR3 — fourniture + pose | U | 200 | 300 | 450 |
| `CVC-78` | Vanne de sécurité hydraulique — Tekno Point VALSIC — fourniture + pose sur réseau eau | U | 90 | 150 | 230 |

### Lot RS — Revêtements de sols

*Carrelage, parquet, PVC, ragréage, ratissage* — **14 postes**

| Code | Désignation | U | MIN | MOY | MAX |
|---|---|---|---:|---:|---:|
| `RS-01` | Chape allégée ciment ép.5cm CT-C25-F5 (parquet collé) | m² | 20 | **50** | 50 |
| `RS-02` | Chape allégée granulats ép.5cm CT-C20-F4 (carrelage collé) | m² | 22 | 35 | 55 |
| `RS-03` | Parquet contrecollé chêne naturel huilé (pose pont de bateau) | m² | 75 | 105 | 165 |
| `RS-04` | Plinthe MDF H=10cm prête à peindre | ml | 10 | 15 | 25 |
| `RS-05` | Carrelage sol hexagonal 21×18 grès céram (type Equipe Coimbra) | m² | 90 | 130 | 200 |
| `RS-07` | Natte d'étanchéité Schluter KERDI zone douche (DTU 52.2) | U | 250 | 350 | 600 |
| `RS-08` | Ragréage fibré autonivelant (ép. 3-10mm, planéité ≤3mm) | m² | 22 | 35 | 60 |
| `RS-09` | Parquet toutes essences (fourniture + pose, sous-couche incluse) | m² | 60 | **50** | 140 |
| `RS-10` | Carrelage sol 120×60 grès céram rectifié (Marazzi Travertino) | m² | 80 | 115 | 190 |
| `RS-11` | Plinthe carrelage 6cm bord carré | ml | 10 | 15 | 25 |
| `RS-12` | Carrelage sol 75×75 grès céram rectifié (Mystone berrici) | m² | 75 | 110 | 180 |
| `RS-13` | Sol PVC clipsable LVT (Floorify chêne cognac + sous-couche IXPE) | m² | 70 | 100 | 160 |
| `RS-14` | Carrelage ext. 120×60 R11 (travertino, terrasse ou véranda) | m² | 70 | 105 | 175 |
| `RS-15` | Terre cuite ancienne dito existant (pose + colle + joint) | m² | 95 | 132,5 | 220 |

### Lot RM — Revêtements muraux

*Faïence, carrelage mural, papier peint, lambris* — **15 postes**

| Code | Désignation | U | MIN | MOY | MAX |
|---|---|---|---:|---:|---:|
| `RM-01` | Faïence zellige WC bâti Geberit (forfait avec baguettes finition) | U | 280 | 390 | 650 |
| `RM-03` | Faïence zellige douche toute hauteur + retours + crédence | F | 600 | 850 | 1400 |
| `RM-04` | Carrelage mural granito 60×60 douche 2 pans (forfait) | U | 680 | 950 | 1600 |
| `RM-07` | Faïence LUME BONE bâti Geberit + crédence évier (WC/buanderie) | F | 320 | 450 | 750 |
| `RM-14` | Pose papier peint fourni client (encollage + pose + découpes) | F | 130 | 200 | 380 |
| `RM-15` | Peinture murs (enduit lissage + impression + 2C satiné, DTU 59.1) | m² | 28 | 39 | 60 |
| `RM-16` | Peinture plafond (enduit lissage + impression + 2C satiné) | m² | 22 | 30 | 48 |
| `RM-17` | Peinture plafond mat (enduit lissage + impression + 2C mat) | m² | 32 | 45 | 70 |
| `RM-19` | Peinture murs grandes surfaces velouté (séjour, cuisine) | m² | 25 | 35 | 55 |
| `RM-21` | Mise en peinture porte (impression + ponçage + 2 couches satiné) | F | 95 | 140 | 220 |
| `RM-23` | Préparation complète surfaces avant peinture (DTU 59.1) | m² | 12 | 19 | 32 |
| `RM-24` | Peinture acrylique mat 2 couches finition (type A DTU 59.1) | m² | 20 | 29 | 48 |
| `RM-28` | Peinture ferronneries ext. (antirouille + 2C glycéro laque) | ml | 40 | 61 | 100 |
| `RM-29` | Peinture bois façade (lessivage + impression + 2C microporeuse) | U | 110 | 160 | 270 |
| `RM-31` | Enduit façade monocouche 3 passes (gobetis + corps + finition W2) | m² | 110 | 155 | 240 |

### Lot PEINT — Peinture

*Murs et plafonds, préparation des supports, finitions* — **3 postes**

| Code | Désignation | U | MIN | MOY | MAX |
|---|---|---|---:|---:|---:|
| `PEINT-01` | Peinture complète appartement (rebouchage + enduit + 2C mat) | U | 4000 | 5500 | 9500 |
| `PEINT-02` | Peinture huisseries bois + mobilier + plinthes médium | U | 580 | 800 | 1400 |
| `PEINT-03` | Peinture complète maison (enduit lissage + impression + 2C) | U | 4000 | 5500 | 9500 |

### Lot RAV — Ravalement de façade

*Façades enduits, ITE enduit (à enrichir en v11)* — **3 postes**

| Code | Désignation | U | MIN | MOY | MAX |
|---|---|---|---:|---:|---:|
| `RAV-01` | Échafaudage pied classe 4 (300kg/m², par m² façade, 3 mois) | m² | 22 | 32 | 55 |
| `RAV-02` | Pare-gravois filets mailles serrées (rétention chutes) | ml | 8 | 12 | 22 |
| `RAV-05` | Étanchéité cour EPDM 1,5mm + pare-vapeur + isolant PSE 10cm | m² | 150 | 210 | 360 |

### Lot MSM — Mobilier sur mesure (postes legacy)

*Postes résiduels — voir BPU Agencement v10 pour la production courante "Atelier Blanc"* — **3 postes**

| Code | Désignation | U | MIN | MOY | MAX |
|---|---|---|---:|---:|---:|
| `MSM-01` | Vestiaire sur-mesure MDF laqué (LED intégré + tiroirs push) | U | 4500 | 6500 | 12000 |
| `MSM-03` | Bibliothèque + porte coulissante miroir sur-mesure (ébéniste) | U | 3500 | 4900 | 8500 |
| `MSM-05` | Tête de lit sur-mesure MDF à peindre (fixation murale renforcée) | U | 900 | 1280 | 2400 |

### Lot OCMOB — Ouvrages complets — Maison Ossature Bois

*Forfaits globaux extension/surélévation MOB, du HO-HA au clé en main* — **12 postes**

| Code | Désignation | U | MIN | MOY | MAX |
|---|---|---|---:|---:|---:|
| `OCMOB-01` | Paroi ext. MOB R=3,80 — KVH145+LB 145mm+OSB+pare-pluie+bardage douglas | m² | 195 | 285 | 420 |
| `OCMOB-02` | Paroi ext. MOB R=5,50 — KVH200+ouate cellulose+Shou Sugi Ban carbonisé | m² | 295 | 420 | 640 |
| `OCMOB-03` | Refend MOB porteur — KVH120+LR MW 120mm+BA13 double face | m² | 115 | 175 | 265 |
| `OCMOB-04` | Plancher bois entre niveaux — solives KVH+LB 100mm+chape sèche Fermacell | m² | 130 | 195 | 300 |
| `OCMOB-05` | Plancher bas hors sol — plots béton+KVH 220mm+ouate 200mm+Fermacell | m² | 165 | 245 | 380 |
| `OCMOB-06` | Toiture inclinée bois ≥20% — charpente+PIR sarking 120mm+tuiles TC | m² | 245 | 365 | 560 |
| `OCMOB-07` | Toiture terrasse accessible — CLT 100mm+PIR 160mm+EPDM+dalles plots | m² | 285 | 420 | 650 |
| `OCMOB-08` | Toiture zinc joint debout ≥3% — OSB4+Solitex WA++Rheinzink 0,70mm | m² | 210 | 310 | 480 |
| `OCMOB-09` | Extension MOB hors d'eau hors d'air — fondations+parois+toiture+menuiseries (SHON) | m² | 1350 | 1850 | 2800 |
| `OCMOB-10` | Extension MOB clé en main TCE complète — HO-HA+plaquisterie+TCE (SHON) | m² | 2400 | 3200 | 4800 |
| `OCMOB-11` | Surélévation MOB hors d'eau hors d'air — dépose+sablière LVL+levage grue (SHON) | m² | 1750 | 2400 | 3800 |
| `OCMOB-12` | Surélévation MOB clé en main TCE — HO-HA+TCE+escalier (SHON) | m² | 3200 | 4200 | 6500 |

### Lot OCREN — Ouvrages complets — Rénovation

*Forfaits globaux par pièce ou SHAB, rénovation logement existant* — **12 postes**

| Code | Désignation | U | MIN | MOY | MAX |
|---|---|---|---:|---:|---:|
| `OCREN-01` | SDB complète clé en main — dépose+étanchéité+carrelage+sanitaires+robinetterie | m² | 1200 | 1850 | 3200 |
| `OCREN-02` | Cuisine complète clé en main — dépose+meubles+plan de travail+plomberie+élec | ml | 1100 | 1650 | 3200 |
| `OCREN-03` | WC complet — bâti Geberit+cuvette+faïence+coffrage+raccordements | U | 2200 | 3200 | 5500 |
| `OCREN-04` | ITI complète prête à peindre — dépose+ossature métallique+LV GR32+BA13 | m² | 60 | 90 | 135 |
| `OCREN-05` | ITE enduit sur isolant — piochage+PSE 100mm+sous-enduit armé+finition W2 | m² | 135 | 195 | 320 |
| `OCREN-06` | Réfection pièce de vie — dépose sol+ragréage+parquet+peinture murs+plafond | m² | 210 | 320 | 520 |
| `OCREN-07` | Rénovation appartement complète (m² SHAB — hors cuisine et SDB) | m² | 1100 | 1650 | 2800 |
| `OCREN-08` | Mur porteur clé en main — BET+étaiement+sciage+poutre+sommiers+coffrage BA13 | U | 4500 | 6500 | 11000 |
| `OCREN-09` | Ravalement complet — piochage+enduit 3 passes+modénatures+peinture bois | m² | 185 | 280 | 450 |
| `OCREN-10` | Remplacement menuiseries ext. — dépose+alu RPT DV argon+calfeutrement | m² | 750 | 1100 | 1800 |
| `OCREN-11` | Électricité appartement complète — tableau NFC15100+distribution+CONSUEL | m² | 95 | 155 | 280 |
| `OCREN-12` | Plomberie appartement complète — EF/ECS multicouche+EU/EV PVC+CES 100L | m² | 120 | 185 | 320 |

---

## 4. Annexe — Ratios Main d'œuvre / Fourniture

Pour chaque code BPU, ratio `[%MO, note de fiabilité 1-10]` permettant de calculer le **déboursé sec**.

- **%MO** = part main d'œuvre dans le PU_MOY (le complément étant fourniture + matériel)
- **Note** = fiabilité de l'estimation (échelle 1-10). Note ≥ 7 = ratio considéré fiable

Pour un poste donné, le déboursé sec MO se calcule : `Déboursé MO = PU_MOY × (%MO / 100) × (1 - marge_MO)`

**281 codes documentés.**

| Code | %MO | Note | Code | %MO | Note | Code | %MO | Note |
|---|---:|---:|---|---:|---:|---|---:|---:|
| `CHAR-01` | 72 | 7 | `CHAR-02` | 48 | 7 | `CHAR-03` | 42 | 9 |
| `CHAR-04` | 40 | 9 | `CHAR-05` | 45 | 7 | `CHAR-06` | 40 | 8 |
| `CLO-01` | 68 | 7 | `CLO-02` | 65 | 7 | `CLO-06` | 55 | 9 |
| `CLO-08` | 52 | 9 | `CLO-10` | 55 | 7 | `CLO-11` | 55 | 7 |
| `CLO-12` | 62 | 7 | `CLO-14` | 70 | 7 | `CLO-15` | 52 | 9 |
| `CLO-16` | 58 | 7 | `CLO-17` | 62 | 7 | `CLO-28` | 52 | 9 |
| `CLO-30` | 75 | 8 | `CLO-32` | 52 | 8 | `CLO-33` | 50 | 8 |
| `CLO-35` | 72 | 8 | `CVC-01` | 28 | 8 | `CVC-02` | 28 | 8 |
| `CVC-05` | 75 | 7 | `CVC-06` | 68 | 7 | `CVC-10` | 32 | 9 |
| `CVC-11` | 30 | 9 | `CVC-12` | 28 | 9 | `CVC-13` | 26 | 9 |
| `CVC-20` | 30 | 9 | `CVC-21` | 28 | 9 | `CVC-22` | 26 | 9 |
| `CVC-23` | 35 | 8 | `CVC-30` | 30 | 8 | `CVC-31` | 40 | 8 |
| `CVC-32` | 42 | 8 | `CVC-33` | 38 | 8 | `CVC-40` | 75 | 9 |
| `CVC-41` | 72 | 9 | `CVC-42` | 85 | 9 | `CVC-43` | 65 | 9 |
| `CVC-44` | 60 | 8 | `CVC-45` | 80 | 9 | `CVC-46` | 78 | 9 |
| `CVC-47` | 70 | 8 | `CVC-50` | 92 | 9 | `CVC-51` | 90 | 9 |
| `CVC-52` | 85 | 8 | `CVC-53` | 60 | 8 | `CVC-60` | 70 | 9 |
| `CVC-61` | 65 | 9 | `CVC-70` | 35 | 8 | `CVC-71` | 33 | 8 |
| `CVC-72` | 48 | 8 | `CVC-73` | 45 | 8 | `CVC-74` | 42 | 8 |
| `CVC-75` | 65 | 8 | `CVC-76` | 62 | 8 | `CVC-77` | 60 | 8 |
| `CVC-78` | 65 | 8 | `DEMO-01` | 78 | 8 | `DEMO-02` | 75 | 8 |
| `DEMO-03` | 85 | 8 | `DEMO-04` | 68 | 7 | `DEMO-05` | 92 | 9 |
| `DEMO-06` | 95 | 9 | `DEMO-07` | 88 | 9 | `DEMO-08` | 90 | 8 |
| `DEMO-09` | 90 | 8 | `DEMO-10` | 90 | 8 | `DEMO-11` | 90 | 8 |
| `DEMO-12` | 90 | 8 | `DEMO-16` | 85 | 8 | `DEMO-17` | 85 | 7 |
| `DEMO-19` | 90 | 8 | `DEMO-22` | 90 | 8 | `DEMO-23` | 85 | 8 |
| `DEMO-26` | 90 | 8 | `DEMO-28` | 92 | 8 | `DEMO-35` | 85 | 8 |
| `DEMO-43` | 52 | 7 | `EL-01` | 65 | 8 | `EL-02` | 70 | 7 |
| `EL-03` | 72 | 8 | `EL-05` | 38 | 9 | `EL-06` | 30 | 8 |
| `EL-08` | 38 | 9 | `EL-09` | 58 | 8 | `EL-10` | 62 | 7 |
| `EL-11` | 65 | 9 | `EL-12` | 65 | 9 | `EL-13` | 65 | 9 |
| `EL-15` | 65 | 8 | `EL-16` | 62 | 8 | `EL-18` | 72 | 9 |
| `EL-22` | 70 | 9 | `EL-24` | 70 | 9 | `EL-29` | 68 | 8 |
| `EL-31` | 45 | 7 | `EL-32` | 38 | 8 | `EL-33` | 40 | 8 |
| `EL-36` | 65 | 7 | `EL-42` | 40 | 7 | `ISO-01` | 52 | 9 |
| `ISO-02` | 58 | 8 | `ISO-03` | 50 | 8 | `ISO-04` | 52 | 9 |
| `ISO-06` | 38 | 8 | `ISO-07` | 38 | 8 | `MAC-01` | 42 | 8 |
| `MAC-02` | 40 | 9 | `MAC-05` | 35 | 9 | `MAC-06` | 35 | 9 |
| `MAC-07` | 35 | 9 | `MAC-08` | 42 | 8 | `MAC-09` | 50 | 7 |
| `MAC-10` | 52 | 8 | `MAC-11` | 50 | 8 | `MAC-14` | 50 | 8 |
| `MAC-15` | 60 | 8 | `MAC-16` | 55 | 7 | `MAC-17` | 35 | 7 |
| `MAC-18` | 45 | 7 | `MAC-19` | 45 | 7 | `MAC-21` | 42 | 8 |
| `MAC-23` | 58 | 8 | `MAC-24` | 60 | 8 | `MAC-25` | 55 | 7 |
| `MAC-29` | 40 | 8 | `MAC-30` | 40 | 8 | `MEN-02` | 70 | 8 |
| `MEN-03` | 45 | 7 | `MEN-05` | 42 | 7 | `MEN-06` | 38 | 8 |
| `MEN-07` | 38 | 8 | `MEN-08` | 85 | 7 | `MEN-10` | 38 | 8 |
| `MEN-11` | 35 | 8 | `MEN-13` | 28 | 8 | `MEN-14` | 35 | 7 |
| `MEN-15` | 30 | 7 | `MEN-16` | 28 | 8 | `MEN-17` | 30 | 8 |
| `MEN-18` | 32 | 8 | `MEN-20` | 72 | 7 | `MEX-01` | 22 | 8 |
| `MEX-02` | 20 | 8 | `MEX-06` | 25 | 7 | `MEX-10` | 22 | 8 |
| `MEX-11` | 30 | 7 | `MP-01` | 55 | 8 | `MP-02` | 48 | 8 |
| `MP-04` | 55 | 8 | `MP-05` | 53 | 8 | `MP-06` | 45 | 8 |
| `MSM-01` | 42 | 7 | `MSM-03` | 40 | 7 | `MSM-05` | 55 | 7 |
| `OCMOB-01` | 40 | 9 | `OCMOB-02` | 38 | 9 | `OCMOB-03` | 55 | 9 |
| `OCMOB-04` | 45 | 9 | `OCMOB-05` | 42 | 8 | `OCMOB-06` | 42 | 9 |
| `OCMOB-07` | 32 | 9 | `OCMOB-08` | 38 | 9 | `OCMOB-09` | 40 | 9 |
| `OCMOB-10` | 42 | 9 | `OCMOB-11` | 38 | 9 | `OCMOB-12` | 40 | 9 |
| `OCREN-01` | 42 | 9 | `OCREN-02` | 40 | 9 | `OCREN-03` | 45 | 9 |
| `OCREN-04` | 52 | 9 | `OCREN-05` | 55 | 9 | `OCREN-06` | 55 | 9 |
| `OCREN-07` | 45 | 9 | `OCREN-08` | 42 | 9 | `OCREN-09` | 58 | 9 |
| `OCREN-10` | 22 | 9 | `OCREN-11` | 65 | 9 | `OCREN-12` | 60 | 9 |
| `PEINT-01` | 68 | 8 | `PEINT-02` | 72 | 7 | `PEINT-03` | 68 | 8 |
| `PLO-01` | 48 | 8 | `PLO-02` | 28 | 9 | `PLO-03` | 32 | 8 |
| `PLO-04` | 62 | 8 | `PLO-05` | 62 | 8 | `PLO-06` | 35 | 8 |
| `PLO-07` | 30 | 8 | `PLO-08` | 35 | 8 | `PLO-09` | 28 | 7 |
| `PLO-10` | 40 | 8 | `PLO-11` | 30 | 7 | `PLO-14` | 30 | 8 |
| `PLO-15` | 72 | 8 | `PLO-16` | 45 | 8 | `PLO-28` | 30 | 7 |
| `PLO-29` | 28 | 7 | `PLO-30` | 68 | 8 | `PLO-33` | 65 | 8 |
| `PLO-42` | 30 | 8 | `PLO-44` | 58 | 8 | `PLO-45` | 62 | 8 |
| `PLO-52` | 45 | 8 | `PLO-60` | 28 | 8 | `PLO-61` | 25 | 8 |
| `PLO-62` | 40 | 8 | `PLO-63` | 45 | 8 | `PLO-64` | 30 | 9 |
| `PLO-65` | 28 | 8 | `PLO-66` | 38 | 8 | `PLO-67` | 88 | 9 |
| `PLO-68` | 32 | 9 | `PLO-69` | 30 | 9 | `PLO-70` | 65 | 8 |
| `PLO-71` | 55 | 8 | `PLO-72` | 35 | 8 | `PLO-73` | 50 | 8 |
| `PLO-74` | 42 | 8 | `PLO-75` | 38 | 8 | `PLO-76` | 40 | 8 |
| `PLO-77` | 65 | 8 | `PLO-78` | 35 | 9 | `PLO-79` | 75 | 8 |
| `PLO-80` | 45 | 8 | `PLO-81` | 60 | 8 | `PLO-82` | 55 | 8 |
| `PLO-83` | 70 | 8 | `PLO-84` | 90 | 9 | `PREP-01` | 85 | 8 |
| `PREP-02` | 70 | 7 | `PREP-03` | 65 | 8 | `PREP-04` | 100 | 7 |
| `PREP-05` | 100 | 7 | `PREP-06` | 100 | 7 | `PREP-07` | 100 | 7 |
| `PREP-08` | 70 | 7 | `PREP-09` | 65 | 8 | `PREP-12` | 88 | 8 |
| `PREP-13` | 65 | 8 | `PREP-14` | 0 | 5 | `PREP-16` | 15 | 7 |
| `PREP-24` | 100 | 7 | `RAV-01` | 35 | 9 | `RAV-02` | 45 | 8 |
| `RAV-05` | 38 | 8 | `RM-01` | 42 | 8 | `RM-03` | 38 | 8 |
| `RM-04` | 38 | 7 | `RM-07` | 40 | 7 | `RM-14` | 62 | 7 |
| `RM-15` | 68 | 9 | `RM-16` | 70 | 9 | `RM-17` | 70 | 9 |
| `RM-19` | 72 | 9 | `RM-21` | 78 | 8 | `RM-23` | 78 | 9 |
| `RM-24` | 70 | 9 | `RM-28` | 65 | 8 | `RM-29` | 60 | 8 |
| `RM-31` | 60 | 9 | `RS-01` | 62 | 9 | `RS-02` | 60 | 9 |
| `RS-03` | 48 | 9 | `RS-04` | 55 | 8 | `RS-05` | 42 | 9 |
| `RS-07` | 45 | 8 | `RS-08` | 62 | 8 | `RS-09` | 45 | 8 |
| `RS-10` | 40 | 9 | `RS-11` | 55 | 8 | `RS-12` | 40 | 9 |
| `RS-13` | 45 | 9 | `RS-14` | 40 | 8 | `RS-15` | 42 | 8 |
| `SER-01` | 32 | 7 | `SER-02` | 32 | 7 |  |  |  |

---

## 5. Notes de version et écarts spec

**Périmètre actuel du programme v8 (cette extraction) :**
- 284 postes répartis sur 20 lots
- Lots `OCMOB` et `OCREN` intégrés (24 ouvrages complets)
- 281 codes documentés en ratios MO/Fourniture

**Écarts par rapport à la fiche `Specifications_LCB_BAT.md` :**

| Élément | Spec | Programme v8 | À traiter en v11 |
|---|---|---|---|
| Préfixe peinture | `PEI` | `PEINT` | Aligner les conventions |
| Lot `MSM` | Retiré du BPU principal | 3 postes encore présents | Migrer vers BPU Agencement v10 |
| Onglet Agencement & SM (67 postes Atelier Blanc/HdG) | Documenté | **Absent** du programme | À intégrer |
| Onglet Détail Composants (136 postes) | Documenté | **Absent** du programme | À intégrer |
| Lot `PMR` (accessibilité) | Mentionné | **Absent** | À créer |
| Lot `EXT` (aménagements ext.) | Mentionné | **Absent** | À créer |

**Total cible v11 : 385+ postes** une fois les onglets Agencement, Composants, PMR et EXT intégrés.

---

*Document généré automatiquement à partir de `LCB_BAT_Bureau_Etudes_v8.html`. À régénérer à chaque évolution du programme source.*

---

### Lot AGEN — Agencement sur mesure (Atelier Blanc)

> **⚠️ Brouillon v0 à dire d'expert — À VALIDER par le métier avant usage client.**
> Catalogue standard de la production interne « Atelier Blanc ». Prix **HT et hors markup**, indexés **IDF Q2 2026**.
> Gammes : **MIN** = entrée (mélaminé/MDF laqué, quincaillerie Hettich/Häfele) · **MOY** = standard ·
> **MAX** = haut de gamme « HdG » (essences nobles/chêne plaqué, tiroirs Blum Legrabox/Blumotion, finitions spéciales, LED).
> Caler sur devis fournisseur réel ou ratio chantier comparable avant remise. — **40 postes**

**Dressings, placards, rangements**

| Code | Désignation | U | MIN | MOY | MAX |
|---|---|---|---:|---:|---:|
| `AGEN-01` | Placard intégré portes battantes — caissons mélaminé + façades MDF laqué, aménagement standard (étagères + penderie) | ml | 650 | 950 | 1500 |
| `AGEN-02` | Placard portes coulissantes — rail Häfele + façades MDF laqué | ml | 750 | 1100 | 1700 |
| `AGEN-03` | Dressing ouvert sur-mesure — caissons + façades laquées, tiroirs Blum | ml | 900 | 1350 | 2200 |
| `AGEN-04` | Dressing fermé haut de gamme — chêne plaqué, tiroirs Blum Legrabox, LED, miroir | ml | 1300 | 1900 | 3200 |
| `AGEN-05` | Module tiroirs supplémentaire amorti Blum push-to-open | U | 280 | 420 | 800 |

**Cuisine (hors électroménager et plan de travail)**

| Code | Désignation | U | MIN | MOY | MAX |
|---|---|---|---:|---:|---:|
| `AGEN-06` | Cuisine Atelier Blanc — caissons + façades laquées mates, charnières Blum | ml | 1200 | 1750 | 2900 |
| `AGEN-07` | Cuisine essences nobles (chêne massif/plaqué) — tiroirs Legrabox, push | ml | 1700 | 2400 | 3900 |
| `AGEN-08` | Îlot central sur-mesure — caisson + habillage + déport de plan | U | 2500 | 3800 | 6500 |
| `AGEN-09` | Colonne four/frigo encastrée sur-mesure | U | 900 | 1300 | 2200 |
| `AGEN-10` | Meuble haut vitré / vitrine sur-mesure | ml | 600 | 900 | 1600 |

**Meubles salle de bains (panneaux hydrofuges)**

| Code | Désignation | U | MIN | MOY | MAX |
|---|---|---|---:|---:|---:|
| `AGEN-11` | Meuble vasque suspendu sur-mesure — plan + tiroirs Blum, hydrofuge | ml | 800 | 1200 | 2000 |
| `AGEN-12` | Colonne / rangement SDB sur-mesure laqué hydrofuge | U | 600 | 900 | 1600 |
| `AGEN-13` | Miroir LED sur-mesure avec cadre/habillage intégré | U | 350 | 550 | 1100 |

**Séjour, bibliothèques, rangements**

| Code | Désignation | U | MIN | MOY | MAX |
|---|---|---|---:|---:|---:|
| `AGEN-14` | Bibliothèque sur-mesure murale MDF peint, toute hauteur | m² | 350 | 520 | 900 |
| `AGEN-15` | Meuble TV / banc média sur-mesure laqué, passage câbles | ml | 700 | 1050 | 1800 |
| `AGEN-16` | Bibliothèque + porte coulissante miroir sur-mesure (ébéniste) | U | 3500 | 4900 | 8500 |
| `AGEN-17` | Habillage de niche / renfoncement sur-mesure | ml | 300 | 480 | 850 |

**Entrée, vestiaire**

| Code | Désignation | U | MIN | MOY | MAX |
|---|---|---|---:|---:|---:|
| `AGEN-18` | Vestiaire d'entrée sur-mesure MDF laqué — LED + tiroirs push | U | 4500 | 6500 | 12000 |
| `AGEN-19` | Banc / banquette sur-mesure avec coffre de rangement | ml | 500 | 750 | 1300 |

**Chambre**

| Code | Désignation | U | MIN | MOY | MAX |
|---|---|---|---:|---:|---:|
| `AGEN-20` | Tête de lit sur-mesure MDF à peindre — fixation murale renforcée | U | 900 | 1280 | 2400 |
| `AGEN-21` | Tête de lit capitonnée tissu (gamme tissu standard) | U | 1100 | 1600 | 2900 |
| `AGEN-22` | Lit-estrade / couchage sur-mesure avec rangements intégrés | U | 2200 | 3200 | 5500 |

**Plans de travail (fournis + posés, profondeur ~65 cm)**

| Code | Désignation | U | MIN | MOY | MAX |
|---|---|---|---:|---:|---:|
| `AGEN-23` | Plan de travail stratifié compact (HPL/Fenix) ép.12 mm | ml | 250 | 380 | 650 |
| `AGEN-24` | Plan de travail compact massif (Trespa/Compact) ép.20 mm | ml | 350 | 520 | 850 |
| `AGEN-25` | Plan de travail Dekton/céramique ép.12-20 mm — chants + découpes | ml | 550 | 800 | 1400 |
| `AGEN-26` | Plan de travail pierre (quartz/granit) | ml | 600 | 900 | 1600 |
| `AGEN-27` | Crédence assortie au plan (même matériau, H 60 cm) | ml | 200 | 320 | 600 |

**Menuiserie déco — claustras, verrières, habillages bois**

| Code | Désignation | U | MIN | MOY | MAX |
|---|---|---|---:|---:|---:|
| `AGEN-28` | Verrière atelier bois sur-mesure — cadre + vitrage clair | m² | 600 | 850 | 1400 |
| `AGEN-29` | Claustra / séparation tasseaux bois sur ossature | m² | 350 | 520 | 950 |
| `AGEN-30` | Habillage mural tasseaux acoustique sur-mesure | m² | 250 | 400 | 750 |
| `AGEN-31` | Porte à galandage habillée assortie agencement | U | 900 | 1300 | 2300 |
| `AGEN-32` | Habillage radiateur / cache-conduit sur-mesure ajouré | U | 250 | 400 | 750 |

**Bureau, étagères, divers**

| Code | Désignation | U | MIN | MOY | MAX |
|---|---|---|---:|---:|---:|
| `AGEN-33` | Bureau / plan intégré sur-mesure avec passe-câbles | ml | 450 | 680 | 1200 |
| `AGEN-34` | Étagères murales sur-mesure — tablette épaisse, fixation invisible | ml | 120 | 190 | 350 |

**Options et prestations transverses**

| Code | Désignation | U | MIN | MOY | MAX |
|---|---|---|---:|---:|---:|
| `AGEN-35` | Éclairage LED intégré agencement — réglette + transfo + variateur | ml | 60 | 95 | 180 |
| `AGEN-36` | Supplément façade laquée haut de gamme — RAL spécial, mat soft-touch | m² | 80 | 130 | 240 |
| `AGEN-37` | Supplément quincaillerie premium Blum Blumotion (vs std Hettich/Häfele) | ens | 150 | 280 | 600 |
| `AGEN-38` | Étude + plans d'exécution agencement sur-mesure (Atelier Blanc) | ens | 300 | 600 | 1500 |
| `AGEN-39` | Pose et réglage sur site — MO atelier, par jour compagnon | J | 350 | 480 | 750 |
| `AGEN-40` | Dépose ancien agencement + évacuation | ml | 40 | 70 | 130 |

---

## Compléments v0 — sous-ensemble prioritaire

> **⚠️ Brouillon v0 à dire d'expert — À VALIDER par le métier avant usage client.**
> Postes issus de l'analyse des chiffrages-types (SDB PMR, PAC, électroménager,
> sols techniques, sécurité/accessibilité ERP). Prix **HT hors markup**, **IDF Q2 2026**.

### Lot PLO — Plomberie et sanitaire
*(compléments PMR / cuisine / énergie)*

| Code | Désignation | U | MIN | MOY | MAX |
|---|---|---|---:|---:|---:|
| `PLO-90` | Barre d'appui PMR inox/époxy (droite/coudée) sur renfort | U | 90 | 140 | 240 |
| `PLO-91` | Siège de douche rabattable mural PMR sur renfort | U | 180 | 260 | 450 |
| `PLO-92` | Douche italienne plain-pied — forme de pente + siphon/caniveau + étanchéité SEL (DTU 52.2) | U | 800 | 1200 | 2000 |
| `PLO-93` | WC surélevé PMR (cuvette H 480-500mm ou bâti réglable) | U | 450 | 650 | 1100 |
| `PLO-94` | Mitigeur thermostatique de douche anti-brûlure | U | 180 | 280 | 480 |
| `PLO-96` | Évier cuisine inox/résine sous-plan + bonde (1 à 2 bacs) | U | 150 | 280 | 600 |
| `PLO-97` | Mitigeur cuisine bec haut + douchette | U | 120 | 220 | 450 |
| `PLO-98` | VMC double flux individuelle haut rendement (échangeur ≥85%, réseau + bouches) | F | 4500 | 6500 | 9000 |
| `PLO-100` | Calorifugeage canalisations chauffage/ECS — coquille laine minérale + finition | ml | 18 | 28 | 45 |
| `PLO-101` | Dépose baignoire + tablier + raccordements (consignation EF/ECS/EV) | U | 250 | 380 | 650 |

### Lot RS — Revêtements de sols
*(compléments techniques)*

| Code | Désignation | U | MIN | MOY | MAX |
|---|---|---|---:|---:|---:|
| `RS-18` | Sol béton ciré / microciment (primaire + 2 passes + vernis PU) | m² | 90 | 140 | 220 |
| `RS-20` | Sol stratifié clipsable AC4/AC5 + sous-couche (pose flottante) | m² | 25 | 40 | 65 |
| `RS-21` | Sol résine époxy / PU coulé (décoratif ou technique antidérapant) | m² | 55 | 90 | 160 |
| `RS-22` | Carrelage sol intérieur antidérapant R10/R11 (zone humide / PMR) | m² | 45 | 70 | 120 |
| `RS-23` | Sol PVC/lino acoustique en lé soudé à chaud U4P3 (hospitalier/commercial) | m² | 40 | 70 | 120 |
| `RS-25` | Remontée en plinthe à gorge soudée H10 + quart-de-rond | ml | 12 | 20 | 35 |

### Lot EM — Électroménager (fourniture + pose)

| Code | Désignation | U | MIN | MOY | MAX |
|---|---|---|---:|---:|---:|
| `EM-01` | Four encastrable pyrolyse | U | 400 | 700 | 1500 |
| `EM-02` | Table de cuisson induction 3-4 foyers | U | 350 | 650 | 1400 |
| `EM-03` | Hotte décorative / plan aspirante | U | 300 | 600 | 1500 |
| `EM-04` | Lave-vaisselle tout-intégrable | U | 400 | 650 | 1200 |
| `EM-05` | Réfrigérateur américain / combiné encastré | U | 700 | 1200 | 2800 |
| `EM-06` | Micro-ondes / combiné encastré | U | 200 | 350 | 700 |
| `EM-07` | Cave à vin de service | U | 400 | 800 | 2000 |

### Lot SEC — Sécurité incendie (ERP)

| Code | Désignation | U | MIN | MOY | MAX |
|---|---|---|---:|---:|---:|
| `SEC-01` | BAES évacuation/ambiance SATI | U | 80 | 130 | 220 |
| `SEC-02` | Bloc autonome alarme sonore incendie type 4 ERP | U | 250 | 400 | 700 |
| `SEC-03` | Extincteur EP6 / CO2 + plan + signalétique | U | 60 | 95 | 160 |
| `SEC-05` | Bloc-porte coupe-feu EI30/EI60 + ferme-porte | U | 450 | 750 | 1400 |
| `SEC-06` | Mission coordination SSI / passage commission de sécurité | F | 800 | 1500 | 3500 |

### Lot ACC — Accessibilité PMR

| Code | Désignation | U | MIN | MOY | MAX |
|---|---|---|---:|---:|---:|
| `ACC-01` | Bloc sanitaire PMR ERP complet (cuvette surélevée + barre + lave-mains accessible + aire de giration) | U | 1800 | 2800 | 4800 |
| `ACC-02` | Rampe d'accès PMR pente ≤5% + main courante | ml | 250 | 400 | 750 |
| `ACC-03` | Élargissement passage de porte ≥0,90 m | U | 350 | 550 | 950 |
| `ACC-05` | Signalétique réglementaire ERP (braille/relief, pictos PMR, fléchage) + Ad'AP | F | 500 | 900 | 1800 |

### Lot OCREN — Ouvrages complets — Rénovation
*(compléments)*

| Code | Désignation | U | MIN | MOY | MAX |
|---|---|---|---:|---:|---:|
| `OCREN-13` | SDB PMR sécurisée clé en main (douche italienne plain-pied + barres + siège + WC surélevé + sol antidérapant + thermostatique) | U | 6500 | 9500 | 15000 |
| `OCREN-14` | Chauffage PAC air-eau clé en main (chauffage + ECS + émetteurs + désembouage + mise en service) | U | 9000 | 13000 | 19000 |
| `OCREN-15` | Rénovation patrimoniale / haussmannienne complète (modénatures + parquet point de Hongrie + cheminées + grande hauteur) au m² SHAB | m² | 1800 | 2500 | 3500 |

### Lot OCERP — Ouvrages complets — ERP / commerce

| Code | Désignation | U | MIN | MOY | MAX |
|---|---|---|---:|---:|---:|
| `OCERP-01` | Aménagement boutique / retail clé en main (sols + cloisons + élec + éclairage + peinture) au m² | m² | 600 | 900 | 1500 |
| `OCERP-02` | Local commercial coque nue → prêt à exploiter (second œuvre complet) au m² | m² | 800 | 1200 | 2000 |
| `OCERP-03` | Mise en accessibilité PMR d'un ERP existant (forfait global) | U | 3500 | 6000 | 12000 |
| `OCERP-10` | Cuisine professionnelle CHR clé en main (extraction + compensation + bac à graisses + sol résine + faïence pleine hauteur) au m² | m² | 1200 | 1800 | 3000 |
| `OCERP-11` | Sanitaires publics ERP H/F + PMR clé en main (forfait) | U | 8000 | 12000 | 20000 |
| `OCERP-20` | Salle de soin clé en main (sol PVC U4 à gorge + lave-mains hygiénique + élec médicale + éclairage 500 lux) au m² | m² | 700 | 1050 | 1700 |

### Lot OCMAC — Ouvrages complets — Maison maçonnée

| Code | Désignation | U | MIN | MOY | MAX |
|---|---|---|---:|---:|---:|
| `OCMAC-01` | Maison maçonnée hors d'eau / hors d'air (fondations + dallage + parpaing + charpente tuile + menuiseries) au m² SHAB | m² | 1100 | 1450 | 1900 |
| `OCMAC-02` | Maison maçonnée clé en main TCE au m² SHAB | m² | 1900 | 2400 | 3000 |

### Lot OCTER — Ouvrages complets — Tertiaire / bureaux

| Code | Désignation | U | MIN | MOY | MAX |
|---|---|---|---:|---:|---:|
| `OCTER-01` | Aménagement plateau de bureaux clé en main (cloisons + faux-plafond + sol technique + CVC + courants faibles) au m² | m² | 500 | 750 | 1200 |
| `OCTER-10` | Kitchenette / tisanerie tertiaire clé en main (forfait) | U | 2500 | 4000 | 7000 |

## Compléments v0 — menuiseries, escaliers, cloisons, devanture

> **⚠️ Brouillon v0 à dire d'expert — À VALIDER par le métier avant usage client.**
> Prix **HT hors markup**, **IDF Q2 2026**.

### Lot MEX — Menuiserie extérieure
*(compléments baies / triple vitrage / portes)*

| Code | Désignation | U | MIN | MOY | MAX |
|---|---|---|---:|---:|---:|
| `MEX-20` | Baie coulissante alu RPT 2 vantaux DV argon Uw≤1,4 (L≤2,4m) | U | 1400 | 2000 | 3200 |
| `MEX-21` | Baie coulissante alu 3 vantaux / 2 rails (L≤3,6m) | U | 2200 | 3200 | 5000 |
| `MEX-22` | Baie alu à galandage 1 vantail mobile | U | 2800 | 4000 | 6500 |
| `MEX-23` | Fenêtre triple vitrage Uw≤0,9 (PVC/alu RPT/bois) au m² | m² | 550 | 750 | 1100 |
| `MEX-24` | Porte d'entrée alu/acier isolante | U | 1500 | 2500 | 4500 |
| `MEX-25` | Porte de garage sectionnelle motorisée | U | 1200 | 1900 | 3200 |

### Lot MEN — Menuiserie intérieure
*(compléments escaliers)*

| Code | Désignation | U | MIN | MOY | MAX |
|---|---|---|---:|---:|---:|
| `MEN-30` | Escalier intérieur droit bois (13-14 marches, limon crémaillère) | U | 2500 | 3800 | 6500 |
| `MEN-31` | Escalier quart-tournant bois | U | 3200 | 4800 | 8000 |

### Lot SER — Serrurerie et métallerie
*(compléments escaliers / garde-corps)*

| Code | Désignation | U | MIN | MOY | MAX |
|---|---|---|---:|---:|---:|
| `SER-10` | Escalier métal limon central + marches bois | U | 4000 | 6000 | 11000 |
| `SER-11` | Garde-corps intérieur trémie acier + lisses | ml | 250 | 400 | 700 |
| `SER-12` | Rampe d'escalier bois / métal sur volée | ml | 180 | 300 | 550 |
| `SER-13` | Garde-corps verre + pinces inox | ml | 450 | 700 | 1200 |

### Lot CLO — Cloisons et faux-plafonds
*(compléments amovibles / vitrées)*

| Code | Désignation | U | MIN | MOY | MAX |
|---|---|---|---:|---:|---:|
| `CLO-40` | Cloison amovible mélaminé/métal toute hauteur sous-plafond | m² | 120 | 180 | 300 |
| `CLO-41` | Cloison vitrée toute hauteur profilé alu + verre clair | m² | 350 | 550 | 900 |
| `CLO-42` | Bloc-porte vitré sur cloison amovible | U | 800 | 1200 | 2000 |

### Lot DEVA — Devanture commerciale

| Code | Désignation | U | MIN | MOY | MAX |
|---|---|---|---:|---:|---:|
| `DEVA-01` | Châssis vitrine commercial alu/acier + vitrage de sécurité | m² | 450 | 700 | 1200 |
| `DEVA-02` | Porte d'entrée commerciale vitrée 1V/2V | U | 1500 | 2500 | 4500 |
| `DEVA-03` | Rideau métallique motorisé / grille extensible | m² | 180 | 300 | 550 |
| `DEVA-04` | Store-banne coffre motorisé | ml | 300 | 500 | 900 |

### Lot ENS — Enseigne et signalétique

| Code | Désignation | U | MIN | MOY | MAX |
|---|---|---|---:|---:|---:|
| `ENS-01` | Caisson lumineux LED d'enseigne | ml | 350 | 600 | 1200 |
| `ENS-02` | Lettres boîtier / relief + pose | U | 150 | 300 | 700 |
| `ENS-03` | Vitrophanie / covering vitrine | m² | 40 | 70 | 130 |

## Compléments v0 — patrimonial / haussmannien

> **⚠️ Brouillon v0 à dire d'expert — À VALIDER par le métier avant usage client.**
> Prix **HT hors markup**, **IDF Q2 2026**.

### Lot STAFF — Staff et modénatures

| Code | Désignation | U | MIN | MOY | MAX |
|---|---|---|---:|---:|---:|
| `STAFF-01` | Restauration corniche moulurée existante (rebouchage + restitution profil) | ml | 60 | 110 | 200 |
| `STAFF-02` | Corniche staff neuve sur tracé (gorge / doucine) | ml | 45 | 80 | 150 |
| `STAFF-03` | Rosace de plafond staff Ø60-120 (dépose/repose ou neuve) | U | 150 | 300 | 650 |
| `STAFF-04` | Moulure murale / cimaise / soubassement staff | ml | 30 | 55 | 110 |
| `STAFF-05` | Réparation ponctuelle de modénature (raccord) | U | 80 | 150 | 350 |

### Lot PIE — Pierre et cheminées marbre

| Code | Désignation | U | MIN | MOY | MAX |
|---|---|---|---:|---:|---:|
| `PIE-01` | Protection + calage cheminée marbre conservée pendant travaux | U | 120 | 200 | 400 |
| `PIE-02` | Nettoyage + rebouchage + lustrage marbre | U | 150 | 300 | 600 |
| `PIE-03` | Dépose soigneuse + repose cheminée marbre | U | 400 | 700 | 1400 |
| `PIE-04` | Remplacement tablette marbre sur mesure | ml | 200 | 350 | 700 |

### Lot RS — Revêtements de sols
*(compléments parquet patrimonial)*

| Code | Désignation | U | MIN | MOY | MAX |
|---|---|---|---:|---:|---:|
| `RS-16` | Parquet massif chêne pose point de Hongrie (fourniture + pose collée) | m² | 90 | 140 | 240 |
| `RS-17` | Parquet massif pose à bâtons rompus / chevrons | m² | 95 | 150 | 260 |
| `RS-19` | Rénovation parquet existant — ponçage 3 passes + vitrification 2C ou huilage | m² | 35 | 55 | 90 |
| `RS-27` | Plinthe bois massif/MDF H≥12cm profil mouluré (fourniture + pose) | ml | 18 | 30 | 55 |

## Compléments v0 — neuf maçonné et VRD

> **⚠️ Brouillon v0 à dire d'expert — À VALIDER par le métier avant usage client.**
> Prix **HT hors markup**, **IDF Q2 2026**.

### Lot MAC — Maçonnerie et structure
*(compléments fondations / dallage / plancher neuf)*

| Code | Désignation | U | MIN | MOY | MAX |
|---|---|---|---:|---:|---:|
| `MAC-31` | Soubassement parpaing de fondation + arase étanche | ml | 90 | 140 | 220 |
| `MAC-32` | Hérisson + polyane + dallage BA sur terre-plein (isolant sous-dalle) | m² | 70 | 110 | 170 |
| `MAC-33` | Plancher hourdis sur vide sanitaire (poutrelles + entrevous PSE + dalle compression) | m² | 90 | 135 | 200 |

### Lot CHAR — Charpente et couverture
*(compléments neuf)*

| Code | Désignation | U | MIN | MOY | MAX |
|---|---|---|---:|---:|---:|
| `CHAR-10` | Charpente fermettes industrielles (fourniture + pose, contreventement) | m² | 45 | 70 | 110 |
| `CHAR-11` | Charpente traditionnelle bois (pannes / chevrons / arbalétriers) | m² | 80 | 130 | 210 |
| `CHAR-12` | Couverture tuiles terre cuite + écran HPV + liteaunage + faîtage ventilé | m² | 55 | 85 | 140 |

### Lot VRD — Voirie et réseaux divers

| Code | Désignation | U | MIN | MOY | MAX |
|---|---|---|---:|---:|---:|
| `VRD-01` | Tranchée + fourreaux réseaux secs (EDF / télécom) | ml | 35 | 55 | 90 |
| `VRD-02` | Branchement et raccordement eau potable | U | 1200 | 2000 | 3500 |
| `VRD-03` | Raccordement assainissement collectif (boîte + regard) | U | 1500 | 2500 | 4500 |
| `VRD-04` | Filière ANC (fosse toutes eaux + épandage) | U | 4500 | 7000 | 12000 |
| `VRD-05` | Drainage périphérique + regard | ml | 40 | 65 | 110 |