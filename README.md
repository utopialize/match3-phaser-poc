# Match-3 Engine for Phaser 3

A fully featured, production-ready match-3 engine built with Phaser 3 and TypeScript. Includes cascading matches, special gems, modular architecture, and full customization through a theme and configuration system.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue.svg)](https://www.typescriptlang.org/)
[![Phaser](https://img.shields.io/badge/Phaser-3.80-green.svg)](https://phaser.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## ✨ Features

- Match-3 core: swaps, validation, cascades, hints.
- Special gems: line (row/col), nova (3x3), supernova (chain novas).
- Modular architecture: grid logic, match resolver, renderer, texture factory, scene, HUD.
- Central configuration: all rules/visuals in `src/config/GameConfig.ts`.
- Theme system: colors, labels, storage keys in `src/config/ThemeConfig.ts`.
- TSDoc coverage and dev tools (press `D`) for rapid testing.

---

## 🚀 Quick Start

```bash
git clone https://github.com/your-username/phaser-match3-engine.git
cd phaser-match3-engine
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

Build for production:

```bash
npm run build
```

---

## 📐 Configuration

Key files:

- `src/config/GameConfig.ts`: grid size, gem specs, animations, rules, effects, UI keys.
- `src/config/ThemeConfig.ts`: title, storage prefix, palette, HUD labels.

See `docs/CONFIGURATION.md` for a full reference and examples.

---

## 🧩 Architecture

```
src/
├─ config/
│  ├─ GameConfig.ts      # Core game configuration
│  └─ ThemeConfig.ts     # Theme system (colors, labels, storage)
├─ core/
│  └─ GridManager.ts     # Grid state and matching logic
├─ logic/
│  ├─ MatchResolver.ts   # Special tile resolution and waves
│  └─ types.ts           # Logic types
├─ render/
│  ├─ TextureFactory.ts  # Procedural textures
│  └─ TileRenderer.ts    # Animations and effects
├─ scenes/
│  └─ GameScene.ts       # Main orchestrator
├─ ui/
│  └─ Hud.ts             # DOM HUD controller
├─ types.ts              # Shared types
└─ main.ts               # Entry point
```

---

## 🎨 Customization

- Change the theme: edit `ThemeConfig.ts` (title, palette, labels, storage prefix).
- Adjust rules/visuals: edit `GameConfig.ts` (grid, gems, animations, scoring, effects).
- Update symbols/colors: tweak `TextureFactory.ts` and `gems.specs`.

Example theme snippet:

```ts
export const DEFAULT_THEME: Theme = {
  name: 'my-theme',
  gameTitle: 'My Match-3',
  storagePrefix: 'my-match3',
  colors: { background: '#000000', panel: '#111111', accent: '#ff0000', text: '#ffffff' },
  ui: { scoreLabel: 'Score', bestLabel: 'Best', timeLabel: 'Time', newGameButton: 'Restart' }
};
```

---

## 📦 Using as a Library

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

## 🤝 Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## 📜 License

MIT © 2025 Your Name
