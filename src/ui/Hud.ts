/**
 * @fileoverview UI helper wiring HTML HUD elements to Phaser scene and dev controls.
 * @module src/ui/Hud
 */
import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/GameConfig';
import { ACTIVE_THEME } from '../config/ThemeConfig';
import { SpecialType } from '../types';

type HudElements = {
  scoreEl?: HTMLElement | null;
  bestEl?: HTMLElement | null;
  timerEl?: HTMLElement | null;
  newGameBtn?: HTMLElement | null;
  devPanel?: HTMLElement | null;
  devToggle?: HTMLElement | null;
  devReset?: HTMLElement | null;
  devType?: HTMLSelectElement | null;
  devSpecial?: HTMLSelectElement | null;
};

/**
 * Bridges DOM HUD controls with Phaser scene state, including dev mutation helpers.
 *
 * @example
 * const hud = new Hud(scene);
 * hud.updateHud(0, 0, 120);
 */
export class Hud {
  private elements: HudElements;
  private scene: Phaser.Scene;
  private devMode = false;

  /**
   * Create the HUD helper and snapshot the DOM elements.
   *
   * @param scene - Scene used to hook keyboard shortcuts.
   */
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.elements = {
      scoreEl: document.getElementById('score'),
      bestEl: document.getElementById('best-score'),
      timerEl: document.getElementById('timer'),
      newGameBtn: document.getElementById('new-game'),
      devPanel: document.getElementById('dev-panel'),
      devToggle: document.getElementById('dev-toggle'),
      devReset: document.getElementById('dev-reset'),
      devType: document.getElementById('dev-type') as HTMLSelectElement | null,
      devSpecial: document.getElementById('dev-special') as HTMLSelectElement | null
    };
  }

  /**
   * Register a callback for the new game button.
   *
   * @param cb - Handler invoked on new game click.
   */
  onNewGame(cb: () => void): void {
    this.elements.newGameBtn?.addEventListener('click', cb);
  }

  /**
   * Register a callback for the dev reset control.
   *
   * @param cb - Handler invoked on dev reset click.
   */
  onDevReset(cb: () => void): void {
    this.elements.devReset?.addEventListener('click', cb);
  }

  /**
   * Toggle dev panel visibility via button or keyboard, optionally notifying listener.
   *
   * @param cb - Optional listener notified when dev mode toggles.
   */
  onToggleDev(cb?: (enabled: boolean) => void): void {
    const toggle = () => {
      this.devMode = !this.devMode;
      if (this.elements.devPanel) this.elements.devPanel.style.display = this.devMode ? 'flex' : 'none';
      cb?.(this.devMode);
    };
    this.elements.devToggle?.addEventListener('click', toggle);
    this.scene.input.keyboard?.on('keydown-D', toggle);
  }

  /**
   * Check whether dev mode is currently enabled.
   *
   * @returns True when dev controls are active.
   */
  isDevMode(): boolean {
    return this.devMode;
  }

  /**
   * Read the dev panel selections to mutate a tile.
   *
   * @param currentType - Current type of the tile being mutated.
   * @param currentSpecial - Current special of the tile being mutated.
   * @returns Selected type and special to apply.
   */
  getDevSelection(currentType: number, currentSpecial: SpecialType | null): {
    type: number;
    special: SpecialType | null;
  } {
    const rawType = this.elements.devType?.value ?? `${currentType}`;
    const parsedType = Number.parseInt(rawType, 10);
    const type = Number.isFinite(parsedType) ? parsedType : currentType;

    const rawSpecial = this.elements.devSpecial?.value ?? (currentSpecial ?? 'none');
    const special = rawSpecial === 'none' ? null : (rawSpecial as SpecialType);

    return { type, special };
  }

  /**
   * Update HUD labels with the latest score, best score, and timer.
   *
   * @param score - Current run score.
   * @param best - Persisted best score.
   * @param timer - Remaining time in seconds.
   */
  updateHud(score: number, best: number, timer: number): void {
    if (this.elements.scoreEl) this.elements.scoreEl.textContent = `${ACTIVE_THEME.ui.scoreLabel}: ${score}`;
    if (this.elements.bestEl) this.elements.bestEl.textContent = `${ACTIVE_THEME.ui.bestLabel}: ${best}`;
    if (this.elements.timerEl) this.elements.timerEl.textContent = `${ACTIVE_THEME.ui.timeLabel}: ${timer}s`;
  }

  /**
   * Initialize the game title element from the active theme.
   */
  setGameTitle(): void {
    const titleEl = document.getElementById('game-title');
    if (titleEl) {
      titleEl.textContent = ACTIVE_THEME.gameTitle;
    }
  }

  /**
   * Initialize the new game button text from the active theme.
   */
  initNewGameButton(): void {
    if (this.elements.newGameBtn) {
      this.elements.newGameBtn.textContent = ACTIVE_THEME.ui.newGameButton;
    }
  }

  /**
   * Populate the dev dropdown with gem names from configuration.
   */
  initDevModeDropdown(): void {
    if (!this.elements.devType) return;
    this.elements.devType.innerHTML = '';
    GAME_CONFIG.gems.specs.forEach((gem, index) => {
      const option = document.createElement('option');
      option.value = `${index}`;
      option.textContent = gem.name.charAt(0).toUpperCase() + gem.name.slice(1);
      this.elements.devType?.appendChild(option);
    });
  }
}
