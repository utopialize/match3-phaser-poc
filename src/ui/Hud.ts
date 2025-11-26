import Phaser from 'phaser';
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

export class Hud {
  private elements: HudElements;
  private scene: Phaser.Scene;
  private devMode = false;

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

  onNewGame(cb: () => void): void {
    this.elements.newGameBtn?.addEventListener('click', cb);
  }

  onDevReset(cb: () => void): void {
    this.elements.devReset?.addEventListener('click', cb);
  }

  onToggleDev(cb?: (enabled: boolean) => void): void {
    const toggle = () => {
      this.devMode = !this.devMode;
      if (this.elements.devPanel) this.elements.devPanel.style.display = this.devMode ? 'flex' : 'none';
      cb?.(this.devMode);
    };
    this.elements.devToggle?.addEventListener('click', toggle);
    this.scene.input.keyboard?.on('keydown-D', toggle);
  }

  isDevMode(): boolean {
    return this.devMode;
  }

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

  updateHud(score: number, best: number, timer: number): void {
    if (this.elements.scoreEl) this.elements.scoreEl.textContent = `Flux: ${score}`;
    if (this.elements.bestEl) this.elements.bestEl.textContent = `Record: ${best}`;
    if (this.elements.timerEl) this.elements.timerEl.textContent = `Cycle: ${timer}s`;
  }
}
