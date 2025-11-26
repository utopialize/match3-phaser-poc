# Moteur Match-3 pour Phaser 3

Moteur match-3 complet et prêt pour la production avec Phaser 3 et TypeScript. Inclut cascades, gemmes spéciales, architecture modulaire et personnalisation totale via la configuration et le thème.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue.svg)](https://www.typescriptlang.org/)
[![Phaser](https://img.shields.io/badge/Phaser-3.80-green.svg)](https://phaser.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 🎮 Essayez-le Maintenant

[![Jouer à la Démo](https://img.shields.io/badge/▶️_Jouer_à_la_Démo-En_ligne_sur_Netlify-00C7B7?style=for-the-badge)](https://match3-phaser-poc.netlify.app/)

Aucune installation requise - cliquez et jouez ! 🚀

---

## ✨ Fonctionnalités

- Coeur match-3 : échanges, validation, cascades, indices.
- Gemmes spéciales : ligne (rang/colonne), nova (3x3), supernova (enchaîne les novas).
- Architecture modulaire : grille, résolveur, rendu, textures, scène, HUD.
- Configuration centralisée : règles et visuels dans `src/config/GameConfig.ts`.
- Système de thème : couleurs, labels, préfixe de stockage dans `src/config/ThemeConfig.ts`.
- TSDoc et mode dev (touche `D`) pour tester rapidement.

---

## 🚀 Démarrage rapide

```bash
git clone https://github.com/your-username/phaser-match3-engine.git
cd phaser-match3-engine
npm install
npm run dev
```

Ouvrez http://localhost:5173 dans votre navigateur.

Build production :

```bash
npm run build
```

---

## 📐 Configuration

Fichiers clés :

- `src/config/GameConfig.ts` : grille, gemmes, animations, règles, effets, clés UI.
- `src/config/ThemeConfig.ts` : titre, préfixe de stockage, palette, labels HUD.

Voir `docs/CONFIGURATION.md` pour le guide complet et des exemples.

---

## 🧩 Architecture

```
src/
├─ config/
│  ├─ GameConfig.ts      # Configuration du jeu
│  └─ ThemeConfig.ts     # Thème (couleurs, labels, storage)
├─ core/
│  └─ GridManager.ts     # Grille et détection de matches
├─ logic/
│  ├─ MatchResolver.ts   # Résolution des tuiles spéciales
│  └─ types.ts           # Types logiques
├─ render/
│  ├─ TextureFactory.ts  # Textures procédurales
│  └─ TileRenderer.ts    # Animations et effets
├─ scenes/
│  └─ GameScene.ts       # Orchestrateur principal
├─ ui/
│  └─ Hud.ts             # HUD DOM
├─ types.ts              # Types partagés
└─ main.ts               # Entrée
```

---

## 🎨 Personnalisation

- Modifier le thème : `ThemeConfig.ts` (titre, palette, labels, prefix storage).
- Ajuster règles/visuels : `GameConfig.ts` (grille, gemmes, animations, scoring, effets).
- Adapter symboles/couleurs : `TextureFactory.ts` et `gems.specs`.

Exemple de thème :

```ts
export const DEFAULT_THEME: Theme = {
  name: 'mon-theme',
  gameTitle: 'Mon Match-3',
  storagePrefix: 'mon-match3',
  colors: { background: '#000000', panel: '#111111', accent: '#ff0000', text: '#ffffff' },
  ui: { scoreLabel: 'Score', bestLabel: 'Best', timeLabel: 'Temps', newGameButton: 'Rejouer' }
};
```

---

## 📦 Utilisation comme bibliothèque

```ts
import { GridManager } from './src/core/GridManager';

const grid = new GridManager(8, 5, 3, 3);
grid.init(factoryFn);
const hasMatch = grid.matchExistsAt(3, 4);
```

```ts
import { MatchResolver } from './src/logic/MatchResolver';

const resolver = new MatchResolver();
const result = resolver.resolve(groups, tiles, grid);
```

---

## 🤝 Contribution

Les contributions sont bienvenues ! Voir [CONTRIBUTING.md](CONTRIBUTING.md) pour les règles.

---

## 📜 Licence

MIT © 2025 Utopialize
