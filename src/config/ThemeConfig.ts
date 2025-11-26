/**
 * @fileoverview Theme definitions used to skin the match-3 starter with neutral or custom palettes.
 * @module src/config/ThemeConfig
 */

/**
 * Complete theme definition including colors, labels, and storage keys.
 *
 * @property name - Theme identifier.
 * @property gameTitle - Title displayed in the UI.
 * @property storagePrefix - Prefix for localStorage keys.
 * @property colors - Palette for background, panel, accent, and text.
 * @property ui - UI labels for HUD and buttons.
 */
export interface Theme {
  name: string;
  gameTitle: string;
  storagePrefix: string;
  colors: {
    background: string;
    panel: string;
    accent: string;
    text: string;
  };
  ui: {
    scoreLabel: string;
    bestLabel: string;
    timeLabel: string;
    newGameButton: string;
  };
}

/**
 * Default neutral theme for the match-3 engine.
 */
export const DEFAULT_THEME: Theme = {
  name: 'default',
  gameTitle: 'Match-3 Game',
  storagePrefix: 'phaser-match3',
  colors: {
    background: '#1a1a1a',
    panel: '#2a2a2a',
    accent: '#4a90e2',
    text: '#ffffff'
  },
  ui: {
    scoreLabel: 'Score',
    bestLabel: 'Best',
    timeLabel: 'Time',
    newGameButton: 'New Game'
  }
};

/**
 * Active theme applied throughout the game; replace with a custom theme to reskin everything.
 */
export const ACTIVE_THEME: Theme = DEFAULT_THEME;
