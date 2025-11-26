import Phaser from 'phaser';
import { registerTextures, textureKey } from '../render/TextureFactory';
import { SpecialType, Tile } from '../types';
import { GridManager } from '../core/GridManager';
import { MatchResolver } from '../logic/MatchResolver';
import { GRID_SIZE, TILE_TYPES, TILE_SIZE, TURN_DURATION, DROP_DURATION, IDLE_HINT_MS, GAME_TIME, GEM_SPECS } from '../config/GameConfig';
import { Hud } from '../ui/Hud';
import { TileRenderer } from '../render/TileRenderer';

export class GameScene extends Phaser.Scene {
  private selected: Tile | null = null;
  private isProcessing = false;
  private score = 0;
  private bestScore = 0;
  private timer = GAME_TIME;
  private timerEvent?: Phaser.Time.TimerEvent;
  private lastActionTime = 0;
  private hintTween?: Phaser.Tweens.Tween;
  private hintTiles: Tile[] = [];
  private boardOffset = { x: 0, y: 0 };
  private lastSwap: Tile[] | null = null;
  private specialTriggerType: Map<Tile, number> = new Map();
  private matchResolver = new MatchResolver();
  private gridManager = new GridManager(GRID_SIZE, TILE_TYPES);
  private hud!: Hud;
  private tileRenderer!: TileRenderer;
  private gemSpecs = GEM_SPECS;

  constructor() {
    super('GameScene');
  }

  init(data?: { bestScore?: number }): void {
    this.bestScore = data?.bestScore ?? this.loadBestScore();
  }

  preload(): void {
    registerTextures(this, this.gemSpecs, TILE_SIZE);
  }

  create(): void {
    this.boardOffset.x = (this.scale.width - GRID_SIZE * TILE_SIZE) / 2;
    this.boardOffset.y = (this.scale.height - GRID_SIZE * TILE_SIZE) / 2 + 12;
    this.hud = new Hud(this);
    this.tileRenderer = new TileRenderer(this, this.gemSpecs);
    this.initGrid();
    this.bindUI();
    this.startTimer();
    this.lastActionTime = this.time.now;
    this.time.addEvent({ delay: 650, callback: this.ensurePlayable, callbackScope: this });
    this.time.addEvent({
      delay: 800,
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
    this.timer = GAME_TIME;
    this.specialTriggerType.clear();
    this.gridManager = new GridManager(GRID_SIZE, TILE_TYPES);
  }

  private bindUI(): void {
    this.hud.onNewGame(() => {
      this.scene.restart({ bestScore: this.bestScore });
    });

    this.hud.onDevReset(() => {
      this.timer = GAME_TIME;
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
      delay: 1000,
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
      zoom: { from: 1, to: 1.02 },
      duration: 200,
      yoyo: true,
      ease: 'Sine.easeInOut'
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
      this.tileRenderer.spawnDrop(sprite, glow, start.y, Phaser.Math.Between(DROP_DURATION, DROP_DURATION + 80), col * 12);
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
      scale: isOver ? 1.06 : 1,
      duration: 90,
      ease: 'Sine.easeOut'
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
        scale: 1,
        duration: 90
      });
    }
    this.selected = tile;
    if (tile) {
      this.tweens.add({
        targets: tile.sprite,
        scale: 1.12,
        duration: 110,
        ease: 'Back.easeOut'
      });
    }
  }

  private clearSelection(): void {
    if (this.selected) {
      this.tweens.add({
        targets: this.selected.sprite,
        scale: 1,
        duration: 90,
        ease: 'Sine.easeOut'
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
    if (novaGroup.size >= 3) {
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
      for (let r = 0; r < GRID_SIZE; r += 1) {
        for (let c = 0; c < GRID_SIZE; c += 1) {
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
    return this.tileRenderer.swap(tileA, tileB, TURN_DURATION);
  }

  private bumpTiles(tiles: Tile[]): void {
    this.tileRenderer.bump(tiles);
  }

  private async resolveMatches(groups: { tiles: Tile[]; orientation?: 'row' | 'col'; type?: number }[], chain: number): Promise<void> {
    let cascade = chain;
    let currentGroups = groups;
    while (currentGroups.length > 0) {
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
          await this.delay(260);
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
    const lineBonus = tileCount >= 4 ? tileCount * 4 : 0;
    const cascadeBonus = chain > 1 ? chain * 5 : 0;
    this.addScore(tileCount * 10 + lineBonus + cascadeBonus);
    this.cameras.main.shake(70, 0.0025);
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
      const delay = 18 + tile.col * 6;
      fallPromises.push(this.tileRenderer.moveTo(tile.sprite, destination.x, destination.y, DROP_DURATION, delay));
    });

    spawned.forEach((tile, i) => {
      const destination = this.cellToWorld(tile.row, tile.col);
      tile.sprite.y = destination.y - TILE_SIZE - 80;
      fallPromises.push(this.tileRenderer.moveTo(tile.sprite, destination.x, destination.y, DROP_DURATION, i * 20 + tile.col * 6));
    });

    await Promise.all(fallPromises);
  }

  private cellToWorld(row: number, col: number): { x: number; y: number } {
    return {
      x: this.boardOffset.x + col * TILE_SIZE + TILE_SIZE / 2,
      y: this.boardOffset.y + row * TILE_SIZE + TILE_SIZE / 2
    };
  }

  private addScore(amount: number): void {
    this.score += amount;
    if (this.score > this.bestScore) {
      this.bestScore = this.score;
      localStorage.setItem('runeshards-best', `${this.bestScore}`);
    }
    this.updateHud();
  }

  private updateHud(): void {
    this.hud.updateHud(this.score, this.bestScore, this.timer);
  }

  private loadBestScore(): number {
    const raw = localStorage.getItem('runeshards-best');
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
    while (attempts < 40) {
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
    if (this.time.now - this.lastActionTime < IDLE_HINT_MS) return;
    if (this.hintTween && this.hintTween.isPlaying()) return;
    const pair = this.findHint();
    if (!pair) return;
    this.hintTiles = pair;
    const sprites = pair.map((t) => t.sprite);
    this.hintTween = this.tileRenderer.hintPulse(sprites);
  }

  private findHint(): Tile[] | null {
    for (let row = 0; row < GRID_SIZE; row += 1) {
      for (let col = 0; col < GRID_SIZE; col += 1) {
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
