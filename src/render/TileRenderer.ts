import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/GameConfig';
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
    const startOffset = Phaser.Math.Between(GAME_CONFIG.grid.dropSpawnRange.min, GAME_CONFIG.grid.dropSpawnRange.max);
    sprite.y = targetY - startOffset;
    this.scene.tweens.add({
      targets: [sprite],
      y: targetY,
      duration,
      ease: GAME_CONFIG.animations.drop.spawnEase,
      delay,
      onComplete: () => {
        this.scene.tweens.add({
          targets: glow,
          alpha: GAME_CONFIG.animations.drop.spawnGlow.alpha,
          duration: GAME_CONFIG.animations.drop.spawnGlow.durationMs,
          ease: GAME_CONFIG.animations.drop.spawnGlow.ease,
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
        ease: GAME_CONFIG.animations.drop.ease,
        onComplete: () => resolve()
      });
    });
  }

  bump(tiles: Tile[]): void {
    this.scene.tweens.add({
      targets: tiles.map((t) => t.sprite),
      scaleX: { from: 1, to: GAME_CONFIG.animations.bump.scaleX },
      scaleY: { from: 1, to: GAME_CONFIG.animations.bump.scaleY },
      yoyo: true,
      duration: GAME_CONFIG.animations.bump.durationMs,
      ease: GAME_CONFIG.animations.bump.ease
    });
  }

  destroyTile(tile: Tile): Promise<void> {
    const pos = { x: tile.sprite.x, y: tile.sprite.y };
    const flash = this.scene.add.rectangle(
      pos.x,
      pos.y,
      tile.sprite.width,
      tile.sprite.height,
      GAME_CONFIG.effects.flash.color,
      GAME_CONFIG.effects.flash.alpha
    );
    flash.setDepth(2);
    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      scale: GAME_CONFIG.effects.flash.scale,
      duration: GAME_CONFIG.effects.flash.durationMs,
      ease: GAME_CONFIG.effects.flash.ease,
      onComplete: () => flash.destroy()
    });

    const emitter = this.scene.add.particles(tile.sprite.x, tile.sprite.y, 'spark', {
      speed: { ...GAME_CONFIG.effects.particles.speed },
      lifespan: GAME_CONFIG.effects.particles.lifespanMs,
      scale: { ...GAME_CONFIG.effects.particles.scale },
      quantity: GAME_CONFIG.effects.particles.quantity,
      angle: { ...GAME_CONFIG.effects.particles.angle },
      tint: this.colorFor(tile.type),
      blendMode: GAME_CONFIG.effects.particles.blendMode
    });

    return new Promise<void>((resolve) => {
      this.scene.tweens.add({
        targets: tile.sprite,
        scale: GAME_CONFIG.animations.destroy.scale,
        alpha: 0,
        angle: Phaser.Math.Between(-GAME_CONFIG.animations.destroy.angleJitter, GAME_CONFIG.animations.destroy.angleJitter),
        duration: GAME_CONFIG.animations.destroy.durationMs,
        ease: GAME_CONFIG.animations.destroy.ease,
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
        scale: GAME_CONFIG.animations.upgrade.scale,
        duration: GAME_CONFIG.animations.upgrade.durationMs,
        yoyo: true,
        ease: GAME_CONFIG.animations.upgrade.ease,
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
              angle: { from: -GAME_CONFIG.animations.reshuffle.wobbleAngle, to: GAME_CONFIG.animations.reshuffle.wobbleAngle },
              duration: GAME_CONFIG.animations.reshuffle.durationMs,
              ease: GAME_CONFIG.animations.reshuffle.ease,
              yoyo: true,
              repeat: GAME_CONFIG.animations.reshuffle.repeat,
              onComplete: () => resolve()
            });
          })
      )
    ).then(() => undefined);
  }

  hintPulse(sprites: Phaser.GameObjects.Sprite[]): Phaser.Tweens.Tween {
    return this.scene.tweens.add({
      targets: sprites,
      scale: GAME_CONFIG.animations.hint.pulseScale,
      duration: GAME_CONFIG.animations.hint.durationMs,
      ease: GAME_CONFIG.animations.hint.ease,
      yoyo: true,
      repeat: GAME_CONFIG.animations.hint.repeat
    });
  }
}
