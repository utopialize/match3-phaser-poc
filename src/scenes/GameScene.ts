/**
 * @fileoverview Main Phaser scene orchestrating gameplay loop, grid interactions, rendering, and HUD.
 * @module src/scenes/GameScene
 */
import Phaser from 'phaser';
import { registerTextures, textureKey } from '../render/TextureFactory';
import { SpecialType, Tile } from '../types';
import { GridManager } from '../core/GridManager';
import { MatchResolver } from '../logic/MatchResolver';
import { GAME_CONFIG } from '../config/GameConfig';
import { Hud } from '../ui/Hud';
import { TileRenderer } from '../render/TileRenderer';

/**
 * Primary game scene handling input, swapping, match resolution, rendering, and timers.
 *
 * @example
 * const game = new Phaser.Game({ scene: [GameScene], ... });
 */
export class GameScene extends Phaser.Scene {
  private selected: Tile | null = null;
  private isProcessing = false;
  private score = 0;
  private bestScore = 0;
  private timer = GAME_CONFIG.rules.timerSeconds;
  private timerEvent?: Phaser.Time.TimerEvent;
  private lastActionTime = 0;
  private hintTween?: Phaser.Tweens.Tween;
  private hintTiles: Tile[] = [];
  private boardOffset = { x: 0, y: 0 };
  private lastSwap: Tile[] | null = null;
  private specialTriggerType: Map<Tile, number> = new Map();
  private matchResolver = new MatchResolver(GAME_CONFIG.rules);
  private gridManager = new GridManager(
    GAME_CONFIG.grid.rows,
    GAME_CONFIG.grid.tileTypes,
    GAME_CONFIG.rules.minMatch,
    GAME_CONFIG.rules.supernovaNovaCount
  );
  private hud!: Hud;
  private tileRenderer!: TileRenderer;
  private gemSpecs = GAME_CONFIG.gems.specs;

  /**
   * Instantiate the scene with its key.
   */
  constructor() {
    super('GameScene');
  }

  /**
   * Bootstrap persisted data before the scene starts.
   *
   * @param data - Optional data containing best score.
   */
  init(data?: { bestScore?: number }): void {
    this.bestScore = data?.bestScore ?? this.loadBestScore();
  }

  /**
   * Preload dynamically generated textures prior to scene creation.
   */
  preload(): void {
    registerTextures(this, this.gemSpecs, GAME_CONFIG.grid.tileSize);
  }

  /**
   * Create the scene: grid, HUD, timers, and hint/check loops.
   */
  create(): void {
    this.boardOffset.x = (this.scale.width - GAME_CONFIG.grid.cols * GAME_CONFIG.grid.tileSize) / 2;
    this.boardOffset.y =
      (this.scale.height - GAME_CONFIG.grid.rows * GAME_CONFIG.grid.tileSize) / 2 + GAME_CONFIG.grid.boardOffsetY;
    this.hud = new Hud(this);
    this.hud.setGameTitle();
    this.hud.initNewGameButton();
    this.hud.initDevModeDropdown();
    this.tileRenderer = new TileRenderer(this, this.gemSpecs);
    this.initGrid();
    this.bindUI();
    this.startTimer();
    this.lastActionTime = this.time.now;
    this.time.addEvent({
      delay: GAME_CONFIG.animations.startupEnsurePlayableDelayMs,
      callback: this.ensurePlayable,
      callbackScope: this
    });
    this.time.addEvent({
      delay: GAME_CONFIG.animations.hint.checkIntervalMs,
      loop: true,
      callback: this.maybeShowHint,
      callbackScope: this
    });
    this.updateHud();
  }

  private initGrid(): void {
    this.clearBoard();
    this.gridManager.init((row, col, type) => this.spawnTile(row, col, type, true));
  }

  private clearBoard(): void {
    this.gridManager.clear();
    this.selected = null;
    this.stopHint();
    this.isProcessing = false;
    this.score = 0;
    this.timer = GAME_CONFIG.rules.timerSeconds;
    this.specialTriggerType.clear();
    this.gridManager = new GridManager(
      GAME_CONFIG.grid.rows,
      GAME_CONFIG.grid.tileTypes,
      GAME_CONFIG.rules.minMatch,
      GAME_CONFIG.rules.supernovaNovaCount
    );
  }

  private bindUI(): void {
    this.hud.onNewGame(() => {
      this.scene.restart({ bestScore: this.bestScore });
    });

    this.hud.onDevReset(() => {
      this.timer = GAME_CONFIG.rules.timerSeconds;
      this.isProcessing = false;
      this.startTimer();
      this.lastActionTime = this.time.now;
      this.updateHud();
    });

    this.hud.onToggleDev();
  }

  private startTimer(): void {
    this.timerEvent?.remove(false);
    this.timerEvent = this.time.addEvent({
      delay: GAME_CONFIG.rules.timerTickMs,
      loop: true,
      callback: () => {
        if (this.isProcessing) {
          return;
        }
        this.timer -= 1;
        if (this.timer <= 0) {
          this.timer = 0;
          this.timerEvent?.remove(false);
          this.handleTimeUp();
        }
        this.updateHud();
      }
    });
  }

  private handleTimeUp(): void {
    this.isProcessing = true;
    this.tweens.add({
      targets: this.cameras.main,
      zoom: { from: 1, to: GAME_CONFIG.animations.timeUpZoom.target },
      duration: GAME_CONFIG.animations.timeUpZoom.durationMs,
      yoyo: true,
      ease: GAME_CONFIG.animations.timeUpZoom.ease
    });
  }

  private spawnTile(row: number, col: number, type: number, animateDrop: boolean): Tile {
    const start = this.cellToWorld(row, col);
    const sprite = this.add.sprite(start.x, start.y, textureKey(type));
    sprite.setInteractive({ useHandCursor: true });
    sprite.setDepth(1);
    const glow = this.add.sprite(start.x, start.y, 'tile-glow');
    glow.setAlpha(0);
    glow.setDepth(0);

    const tile: Tile = { sprite, row, col, type, special: null };
    sprite.on('pointerdown', () => this.handleTileInput(tile));
    sprite.on('pointerover', () => this.onHover(tile, true));
    sprite.on('pointerout', () => this.onHover(tile, false));

    if (animateDrop) {
      const dropDuration = Phaser.Math.Between(
        GAME_CONFIG.animations.drop.durationMs,
        GAME_CONFIG.animations.drop.durationMs + GAME_CONFIG.animations.drop.jitterMs
      );
      const dropDelay = col * GAME_CONFIG.grid.spawnColumnDelayMs;
      this.tileRenderer.spawnDrop(sprite, glow, start.y, dropDuration, dropDelay);
    }

    return tile;
  }

  private onHover(tile: Tile, isOver: boolean): void {
    if (this.isProcessing || this.timer <= 0) {
      return;
    }
    if (tile === this.selected) {
      return;
    }
    this.tweens.add({
      targets: tile.sprite,
      scale: isOver ? GAME_CONFIG.animations.hover.scale : GAME_CONFIG.animations.hoverOutScale,
      duration: GAME_CONFIG.animations.hover.durationMs,
      ease: GAME_CONFIG.animations.hover.ease
    });
  }

  private handleTileInput(tile: Tile): void {
    if (this.hud.isDevMode()) {
      this.applyDevMutation(tile);
      return;
    }
    if (this.isProcessing || this.timer <= 0) {
      return;
    }
    this.lastActionTime = this.time.now;
    this.stopHint();
    if (!this.selected) {
      this.setSelected(tile);
      return;
    }
    if (tile === this.selected) {
      this.clearSelection();
      return;
    }
    if (this.areAdjacent(tile, this.selected)) {
      const a = this.selected;
      this.clearSelection();
      void this.processSwap(a, tile);
      return;
    }
    this.setSelected(tile);
  }

  private setSelected(tile: Tile | null): void {
    if (this.selected && this.selected !== tile) {
      this.tweens.add({
        targets: this.selected.sprite,
        scale: GAME_CONFIG.animations.deselect.scale,
        duration: GAME_CONFIG.animations.deselect.durationMs
      });
    }
    this.selected = tile;
    if (tile) {
      this.tweens.add({
        targets: tile.sprite,
        scale: GAME_CONFIG.animations.select.scale,
        duration: GAME_CONFIG.animations.select.durationMs,
        ease: GAME_CONFIG.animations.select.ease
      });
    }
  }

  private clearSelection(): void {
    if (this.selected) {
      this.tweens.add({
        targets: this.selected.sprite,
        scale: GAME_CONFIG.animations.deselect.scale,
        duration: GAME_CONFIG.animations.deselect.durationMs,
        ease: GAME_CONFIG.animations.deselect.ease
      });
    }
    this.selected = null;
  }

  private areAdjacent(a: Tile, b: Tile): boolean {
    const dx = Math.abs(a.col - b.col);
    const dy = Math.abs(a.row - b.row);
    return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
  }

  private async processSwap(tileA: Tile, tileB: Tile): Promise<void> {
    this.isProcessing = true;
    this.lastSwap = [tileA, tileB];
    await this.animateSwap(tileA, tileB);
    this.gridManager.swap(tileA, tileB);

    const novaGroup = this.gridManager.findNovaMatch();
    if (novaGroup.size >= GAME_CONFIG.rules.supernovaNovaCount) {
      const matchesGroups = [{ tiles: Array.from(novaGroup) }];
      await this.resolveMatches(matchesGroups, 1);
      this.isProcessing = false;
      this.lastSwap = null;
      return;
    }

    // Trigger specials if swapped (normals now, specials queued later)
    const specialMatches: Tile[] = [];
    [tileA, tileB].forEach((tile) => {
      if (tile.special) {
        const partner = tile === tileA ? tileB : tileA;
        if (tile.special === 'supernova') {
          this.specialTriggerType.set(tile, partner.type);
        }
        specialMatches.push(tile);
        const area = this.collectSpecialTargets(tile);
        area.normals.forEach((t) => specialMatches.push(t));
      }
    });

    const matchesGroups: { tiles: Tile[]; orientation?: 'row' | 'col'; type?: number }[] =
      specialMatches.length > 0 ? [{ tiles: Array.from(new Set(specialMatches)) }] : this.gridManager.findMatchGroups();

    if (matchesGroups.length === 0) {
      await this.animateSwap(tileA, tileB);
      this.gridManager.swap(tileA, tileB);
      this.bumpTiles([tileA, tileB]);
      this.isProcessing = false;
      this.lastSwap = null;
      return;
    }
    await this.resolveMatches(matchesGroups, 1);
    this.isProcessing = false;
    this.lastSwap = null;
  }

  private collectSpecialTargets(tile: Tile): { normals: Tile[]; specials: Tile[] } {
    const base = this.matchResolver.collectSpecialTargets(tile, this.gridManager);
    if (tile.special === 'supernova') {
      // supernova purge: ajoute la couleur cible sur tous les matches
      const targetType = this.specialTriggerType.get(tile) ?? tile.type;
      for (let r = 0; r < GAME_CONFIG.grid.rows; r += 1) {
        for (let c = 0; c < GAME_CONFIG.grid.cols; c += 1) {
          const t = this.gridManager.getTile(r, c);
          if (t && t.type === targetType && !base.normals.includes(t) && !base.specials.includes(t)) {
            base.normals.push(t);
          }
        }
      }
    }
    return base;
  }

  private animateSwap(tileA: Tile, tileB: Tile): Promise<void> {
    return this.tileRenderer.swap(tileA, tileB, GAME_CONFIG.animations.swap.durationMs);
  }

  private bumpTiles(tiles: Tile[]): void {
    this.tileRenderer.bump(tiles);
  }

  private async resolveMatches(groups: { tiles: Tile[]; orientation?: 'row' | 'col'; type?: number }[], chain: number): Promise<void> {
    let cascade = chain;
    let currentGroups = groups;
    while (currentGroups.length > 0) {
      // Treat each iteration as a cascade layer: resolve current matches, apply gravity, then search for new ones.
      const allTiles = new Set<Tile>();
      currentGroups.forEach((g) => g.tiles.forEach((t) => allTiles.add(t)));
      const { batches: steps, specials: specialAssignments } = this.matchResolver.resolve(
        currentGroups,
        allTiles,
        this.gridManager,
        this.lastSwap || undefined
      );
      for (let i = 0; i < steps.length; i += 1) {
        const batch = steps[i];
        if (i > 0) {
          await this.delay(GAME_CONFIG.animations.cascadeDelayMs);
        }
        const assignments = i === 0 ? specialAssignments : new Map<Tile, SpecialType>();
        await this.handleMatchSet(batch, assignments, cascade);
      }
      await this.applyGravity();
      currentGroups = this.gridManager.findMatchGroups();
      cascade += 1;
    }
    await this.ensurePlayable(true);
  }

  private async handleMatchSet(matchTiles: Set<Tile>, specials: Map<Tile, SpecialType>, chain: number): Promise<void> {
    const tileCount = matchTiles.size;
    const lineBonus =
      tileCount >= GAME_CONFIG.rules.lineMatchLength ? tileCount * GAME_CONFIG.rules.bonusPerTileForLine : 0;
    const cascadeBonus = chain > 1 ? chain * GAME_CONFIG.rules.cascadeBonusPerChain : 0;
    this.addScore(tileCount * GAME_CONFIG.rules.pointsPerTile + lineBonus + cascadeBonus);
    this.cameras.main.shake(GAME_CONFIG.effects.cameraShake.durationMs, GAME_CONFIG.effects.cameraShake.intensity);
    await this.playMatchEffects(matchTiles, specials);
  }

  private playMatchEffects(matchTiles: Set<Tile>, specials: Map<Tile, SpecialType>): Promise<void> {
    const toDestroy: Tile[] = [];
    const toUpgrade: { tile: Tile; special: SpecialType }[] = [];
    matchTiles.forEach((tile) => {
      if (specials.has(tile)) {
        toUpgrade.push({ tile, special: specials.get(tile)! });
      } else {
        toDestroy.push(tile);
      }
    });

    const destroyPromises = toDestroy.map(async (tile) => {
      await this.tileRenderer.destroyTile(tile);
      this.gridManager.grid[tile.row][tile.col] = null;
      this.specialTriggerType.delete(tile);
    });

    const upgradePromises = toUpgrade.map(({ tile, special }) => {
      tile.special = special;
      tile.sprite.setTexture(textureKey(tile.type, special));
      if (special === 'supernova') {
        this.specialTriggerType.set(tile, this.specialTriggerType.get(tile) ?? tile.type);
      }
      return this.tileRenderer.upgradeTile(tile, special);
    });

    return Promise.all([...destroyPromises, ...upgradePromises]).then(() => undefined);
  }

  private async applyGravity(): Promise<void> {
    const fallPromises: Promise<void>[] = [];
    const { moved, spawned } = this.gridManager.applyGravity((row, col, type) => this.spawnTile(row, col, type, false));

    moved.forEach((tile) => {
      const destination = this.cellToWorld(tile.row, tile.col);
      const delay = GAME_CONFIG.animations.matchWaveDelayMs + tile.col * GAME_CONFIG.grid.columnDelayMs;
      fallPromises.push(
        this.tileRenderer.moveTo(
          tile.sprite,
          destination.x,
          destination.y,
          GAME_CONFIG.animations.drop.durationMs,
          delay
        )
      );
    });

    spawned.forEach((tile, i) => {
      const destination = this.cellToWorld(tile.row, tile.col);
      tile.sprite.y = destination.y - GAME_CONFIG.grid.tileSize - GAME_CONFIG.grid.spawnOffset;
      fallPromises.push(
        this.tileRenderer.moveTo(
          tile.sprite,
          destination.x,
          destination.y,
          GAME_CONFIG.animations.drop.durationMs,
          i * GAME_CONFIG.grid.spawnDelayMs + tile.col * GAME_CONFIG.grid.columnDelayMs
        )
      );
    });

    await Promise.all(fallPromises);
  }

  private cellToWorld(row: number, col: number): { x: number; y: number } {
    return {
      x: this.boardOffset.x + col * GAME_CONFIG.grid.tileSize + GAME_CONFIG.grid.tileSize / 2,
      y: this.boardOffset.y + row * GAME_CONFIG.grid.tileSize + GAME_CONFIG.grid.tileSize / 2
    };
  }

  private addScore(amount: number): void {
    this.score += amount;
    if (this.score > this.bestScore) {
      this.bestScore = this.score;
      localStorage.setItem(GAME_CONFIG.ui.bestScoreKey, `${this.bestScore}`);
    }
    this.updateHud();
  }

  private updateHud(): void {
    this.hud.updateHud(this.score, this.bestScore, this.timer);
  }

  private loadBestScore(): number {
    const raw = localStorage.getItem(GAME_CONFIG.ui.bestScoreKey);
    const value = raw ? Number.parseInt(raw, 10) : 0;
    return Number.isFinite(value) ? value : 0;
  }

  private matchExistsAt(row: number, col: number): boolean {
    return this.gridManager.matchExistsAt(row, col);
  }

  private hasPossibleMoves(): boolean {
    return this.gridManager.hasPossibleMoves();
  }

  private checkSwapForMatch(r1: number, c1: number, r2: number, c2: number): boolean {
    return this.gridManager.checkSwapForMatch(r1, c1, r2, c2);
  }

  private async ensurePlayable(force = false): Promise<void> {
    if (this.isProcessing && !force) return;
    const previous = this.isProcessing;
    this.isProcessing = true;
    const groups = this.gridManager.findMatchGroups();
    if (groups.length > 0) {
      await this.resolveMatches(groups, 1);
      this.isProcessing = force ? previous : false;
      return;
    }
    if (!this.hasPossibleMoves()) {
      await this.reshuffle();
    }
    this.isProcessing = force ? previous : false;
  }

  private async reshuffle(): Promise<void> {
    this.isProcessing = true;
    this.stopHint();
    const tiles = this.gridManager.grid.flat().filter(Boolean) as Tile[];
    const types = tiles.map((t) => t.type);
    const shuffle = () => Phaser.Utils.Array.Shuffle(types.slice());
    let shuffled = shuffle();
    let attempts = 0;
    while (attempts < GAME_CONFIG.animations.reshuffle.maxAttempts) {
      tiles.forEach((tile, idx) => {
        tile.type = shuffled[idx];
        tile.special = null;
        tile.sprite.setTexture(textureKey(tile.type));
      });
      if (this.gridManager.findMatchGroups().length === 0 && this.hasPossibleMoves()) {
        break;
      }
      shuffled = shuffle();
      attempts += 1;
    }

    await this.tileRenderer.reshuffleWobble(tiles);
    this.isProcessing = false;
  }

  private maybeShowHint(): void {
    if (this.isProcessing || this.timer <= 0) return;
    if (this.time.now - this.lastActionTime < GAME_CONFIG.animations.hint.idleDelayMs) return;
    if (this.hintTween && this.hintTween.isPlaying()) return;
    const pair = this.findHint();
    if (!pair) return;
    this.hintTiles = pair;
    const sprites = pair.map((t) => t.sprite);
    this.hintTween = this.tileRenderer.hintPulse(sprites);
  }

  private findHint(): Tile[] | null {
    for (let row = 0; row < GAME_CONFIG.grid.rows; row += 1) {
      for (let col = 0; col < GAME_CONFIG.grid.cols; col += 1) {
        const right = this.gridManager.getTile(row, col + 1);
        const down = this.gridManager.getTile(row + 1, col);
        if (right && this.checkSwapForMatch(row, col, row, col + 1)) {
          return [this.gridManager.getTile(row, col)!, right];
        }
        if (down && this.checkSwapForMatch(row, col, row + 1, col)) {
          return [this.gridManager.getTile(row, col)!, down];
        }
      }
    }
    return null;
  }

  private stopHint(): void {
    this.hintTween?.stop();
    this.hintTiles.forEach((tile) => {
      tile.sprite.setScale(1);
    });
    this.hintTiles = [];
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => this.time.delayedCall(ms, () => resolve()));
  }

  private applyDevMutation(tile: Tile): void {
    const { type, special } = this.hud.getDevSelection(tile.type, tile.special ?? null);
    tile.type = type;
    tile.special = special;
    if (tile.special === 'supernova') {
      this.specialTriggerType.set(tile, tile.type);
    }
    tile.sprite.setTexture(textureKey(tile.type, tile.special ?? null));
    tile.sprite.setScale(1);
  }
}
