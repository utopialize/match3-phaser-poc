import Phaser from 'phaser';
import { GemSpec, SpecialType, Tile } from '../types';

export class TileRenderer {
  private scene: Phaser.Scene;
  private gemSpecs: GemSpec[];

  constructor(scene: Phaser.Scene, gemSpecs: GemSpec[]) {
    this.scene = scene;
    this.gemSpecs = gemSpecs;
  }

  private colorFor(type: number): number {
    const spec = this.gemSpecs[type % this.gemSpecs.length];
    return spec.primary;
  }

  spawnDrop(sprite: Phaser.GameObjects.Sprite, glow: Phaser.GameObjects.Sprite, targetY: number, duration: number, delay: number): void {
    sprite.y = targetY - Phaser.Math.Between(150, 260);
    this.scene.tweens.add({
      targets: [sprite],
      y: targetY,
      duration,
      ease: 'Quad.easeOut',
      delay,
      onComplete: () => {
        this.scene.tweens.add({
          targets: glow,
          alpha: 0.16,
          duration: 120,
          yoyo: true
        });
      }
    });
  }

  swap(tileA: Tile, tileB: Tile, duration: number): Promise<void> {
    const tweenA = this.moveTo(tileA.sprite, tileB.sprite.x, tileB.sprite.y, duration);
    const tweenB = this.moveTo(tileB.sprite, tileA.sprite.x, tileA.sprite.y, duration);
    return Promise.all([tweenA, tweenB]).then(() => undefined);
  }

  moveTo(target: Phaser.GameObjects.Sprite, x: number, y: number, duration: number, delay = 0): Promise<void> {
    return new Promise<void>((resolve) => {
      this.scene.tweens.add({
        targets: target,
        x,
        y,
        duration,
        delay,
        ease: 'Back.easeOut',
        onComplete: () => resolve()
      });
    });
  }

  bump(tiles: Tile[]): void {
    this.scene.tweens.add({
      targets: tiles.map((t) => t.sprite),
      scaleX: { from: 1, to: 1.08 },
      scaleY: { from: 1, to: 0.94 },
      yoyo: true,
      duration: 80,
      ease: 'Back.easeInOut'
    });
  }

  destroyTile(tile: Tile): Promise<void> {
    const pos = { x: tile.sprite.x, y: tile.sprite.y };
    const flash = this.scene.add.rectangle(pos.x, pos.y, tile.sprite.width, tile.sprite.height, 0xffffff, 0.25);
    flash.setDepth(2);
    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      scale: 1.4,
      duration: 160,
      ease: 'Sine.easeOut',
      onComplete: () => flash.destroy()
    });

    const emitter = this.scene.add.particles(tile.sprite.x, tile.sprite.y, 'spark', {
      speed: { min: 80, max: 140 },
      lifespan: 320,
      scale: { start: 0.8, end: 0 },
      quantity: 12,
      angle: { min: 0, max: 360 },
      tint: this.colorFor(tile.type),
      blendMode: 'ADD'
    });

    return new Promise<void>((resolve) => {
      this.scene.tweens.add({
        targets: tile.sprite,
        scale: 1.35,
        alpha: 0,
        angle: Phaser.Math.Between(-10, 10),
        duration: 220,
        ease: 'Back.easeIn',
        onComplete: () => {
          emitter.destroy();
          tile.sprite.destroy();
          resolve();
        }
      });
    });
  }

  upgradeTile(tile: Tile, special: SpecialType): Promise<void> {
    return new Promise<void>((resolve) => {
      tile.special = special;
      this.scene.tweens.add({
        targets: tile.sprite,
        scale: 1.15,
        duration: 140,
        yoyo: true,
        ease: 'Back.easeOut',
        onComplete: () => resolve()
      });
    });
  }

  reshuffleWobble(tiles: Tile[]): Promise<void> {
    return Promise.all(
      tiles.map(
        (tile) =>
          new Promise<void>((resolve) => {
            this.scene.tweens.add({
              targets: tile.sprite,
              angle: { from: -6, to: 6 },
              duration: 120,
              ease: 'Sine.easeInOut',
              yoyo: true,
              repeat: 1,
              onComplete: () => resolve()
            });
          })
      )
    ).then(() => undefined);
  }

  hintPulse(sprites: Phaser.GameObjects.Sprite[]): Phaser.Tweens.Tween {
    return this.scene.tweens.add({
      targets: sprites,
      scale: 1.12,
      duration: 220,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: 5
    });
  }
}
