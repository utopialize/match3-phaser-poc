/**
 * @fileoverview Texture generation for gems, specials, and supporting VFX textures.
 * @module src/render/TextureFactory
 */
import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/GameConfig';
import { GemSpec, SpecialType } from '../types';

/**
 * Compute the texture key for a tile based on type and optional special.
 *
 * @param type - Gem type index.
 * @param special - Optional special variant.
 * @returns Texture key string used by Phaser.
 */
export const textureKey = (type: number, special?: SpecialType | null): string => {
  if (special === 'line-h') return `tile-${type}-line-h`;
  if (special === 'line-v') return `tile-${type}-line-v`;
  if (special === 'nova') return `tile-${type}-nova`;
  if (special === 'supernova') return `tile-${type}-supernova`;
  return `tile-${type}`;
};

/**
 * Register all tile textures (base, specials, glow, and particles) on the provided scene.
 *
 * @param scene - Phaser scene used to generate textures.
 * @param specs - Visual specs for each gem type.
 * @param tileSize - Tile size to render textures at.
 */
export const registerTextures = (
  scene: Phaser.Scene,
  specs: GemSpec[],
  tileSize: number = GAME_CONFIG.grid.tileSize
): void => {
  const visuals = GAME_CONFIG.gems.visuals;
  const spark = scene.add.graphics({ x: 0, y: 0 });
  spark.fillStyle(visuals.spark.color, 1);
  spark.fillCircle(visuals.spark.radius, visuals.spark.radius, visuals.spark.radius);
  spark.generateTexture('spark', visuals.spark.radius * 2, visuals.spark.radius * 2);
  spark.destroy();

  specs.forEach((spec, i) => {
    const base = scene.add.graphics({ x: 0, y: 0 });
    drawGemRect(base, spec.primary, spec.secondary, tileSize);
    drawRune(base, i, tileSize);
    base.generateTexture(`tile-${i}`, tileSize, tileSize);
    base.destroy();

    const lineH = scene.add.graphics({ x: 0, y: 0 });
    drawGemRect(lineH, visuals.lineOverlay.primary, visuals.lineOverlay.secondary, tileSize);
    drawLineOverlay(lineH, true, tileSize);
    drawLineSigil(lineH, true, tileSize);
    lineH.generateTexture(`tile-${i}-line-h`, tileSize, tileSize);
    lineH.destroy();

    const lineV = scene.add.graphics({ x: 0, y: 0 });
    drawGemRect(lineV, visuals.lineOverlay.primary, visuals.lineOverlay.secondary, tileSize);
    drawLineOverlay(lineV, false, tileSize);
    drawLineSigil(lineV, false, tileSize);
    lineV.generateTexture(`tile-${i}-line-v`, tileSize, tileSize);
    lineV.destroy();

    const nova = scene.add.graphics({ x: 0, y: 0 });
    drawGemRect(nova, visuals.novaOverlay.primary, visuals.novaOverlay.secondary, tileSize);
    drawNovaOverlay(nova, tileSize);
    drawNovaSigil(nova, tileSize);
    nova.generateTexture(`tile-${i}-nova`, tileSize, tileSize);
    nova.destroy();

    const supernova = scene.add.graphics({ x: 0, y: 0 });
    drawGemRect(supernova, visuals.superNovaOverlay.primary, visuals.superNovaOverlay.secondary, tileSize);
    drawSuperNovaOverlay(supernova, tileSize);
    drawSuperNovaSigil(supernova, tileSize);
    supernova.generateTexture(`tile-${i}-supernova`, tileSize, tileSize);
    supernova.destroy();
  });

  const glow = scene.add.graphics({ x: 0, y: 0 });
  glow.fillStyle(visuals.glow.color, visuals.glow.alpha);
  glow.fillRoundedRect(0, 0, tileSize, tileSize, visuals.glow.cornerRadius);
  glow.generateTexture('tile-glow', tileSize, tileSize);
  glow.destroy();
};

const drawGemRect = (gfx: Phaser.GameObjects.Graphics, primary: number, secondary: number, size: number): void => {
  const shape = GAME_CONFIG.gems.visuals.tileShape;
  gfx.fillStyle(secondary, 1);
  gfx.fillRoundedRect(shape.inset, shape.inset, size - shape.inset * 2, size - shape.inset * 2, shape.border);
  gfx.fillStyle(primary, 1);
  gfx.fillRoundedRect(shape.innerInset, shape.innerInset, size - shape.innerInset * 2, size - shape.innerInset * 2, shape.innerBorder);
  const strokeOffset = shape.innerInset + shape.stroke.width;
  const strokeSize = size - strokeOffset * 2;
  gfx.lineStyle(shape.stroke.width, shape.stroke.color, shape.stroke.alpha);
  gfx.strokeRoundedRect(strokeOffset, strokeOffset, strokeSize, shape.innerBorder);
};

const drawRune = (gfx: Phaser.GameObjects.Graphics, index: number, size: number): void => {
  const center = size / 2;
  const visuals = GAME_CONFIG.gems.visuals;
  const runeStyle = visuals.rune;
  const shape = visuals.runeShapes[index] ?? visuals.runeShapes[0];
  gfx.lineStyle(runeStyle.width, runeStyle.color, runeStyle.alpha);
  gfx.beginPath();
  if (shape.kind === 'points') {
    shape.points.forEach((point, i) => {
      const x = center + point.x;
      const y = center + point.y;
      if (i === 0) {
        gfx.moveTo(x, y);
      } else {
        gfx.lineTo(x, y);
      }
    });
    if (shape.close) {
      gfx.closePath();
    }
  } else {
    for (let i = 0; i < shape.spikes * 2; i += 1) {
      const radius = i % 2 === 0 ? shape.outerRadius : shape.innerRadius;
      const angle = (Math.PI * i) / shape.spikes - Math.PI / 2;
      const x = center + Math.cos(angle) * radius;
      const y = center + Math.sin(angle) * radius;
      if (i === 0) {
        gfx.moveTo(x, y);
      } else {
        gfx.lineTo(x, y);
      }
    }
    gfx.closePath();
  }
  gfx.strokePath();
};

const drawLineOverlay = (gfx: Phaser.GameObjects.Graphics, horizontal: boolean, size: number): void => {
  const style = GAME_CONFIG.gems.visuals.lineOverlayStyle;
  gfx.lineStyle(style.width, style.color, style.alpha);
  if (horizontal) {
    gfx.moveTo(style.inset, size / 2);
    gfx.lineTo(size - style.inset, size / 2);
  } else {
    gfx.moveTo(size / 2, style.inset);
    gfx.lineTo(size / 2, size - style.inset);
  }
  gfx.strokePath();
};

const drawLineSigil = (gfx: Phaser.GameObjects.Graphics, horizontal: boolean, size: number): void => {
  const center = size / 2;
  const style = GAME_CONFIG.gems.visuals.lineOverlayStyle;
  const sigil = style.sigil;
  const offsets = style.sigilOffsets;
  const diag = offsets.mid + offsets.short;
  gfx.lineStyle(sigil.width, sigil.color, sigil.alpha);
  gfx.beginPath();
  if (horizontal) {
    gfx.moveTo(center - offsets.long, center);
    gfx.lineTo(center - offsets.mid, center);
    gfx.lineTo(center - diag, center - offsets.short);
    gfx.moveTo(center - offsets.mid, center);
    gfx.lineTo(center - diag, center + offsets.short);
    gfx.moveTo(center + offsets.mid, center);
    gfx.lineTo(center + offsets.long, center);
    gfx.lineTo(center + diag, center - offsets.short);
    gfx.moveTo(center + offsets.long, center);
    gfx.lineTo(center + diag, center + offsets.short);
  } else {
    gfx.moveTo(center, center - offsets.long);
    gfx.lineTo(center, center - offsets.mid);
    gfx.lineTo(center - offsets.short, center - diag);
    gfx.moveTo(center, center - offsets.mid);
    gfx.lineTo(center + offsets.short, center - diag);
    gfx.moveTo(center, center + offsets.mid);
    gfx.lineTo(center, center + offsets.long);
    gfx.lineTo(center - offsets.short, center + diag);
    gfx.moveTo(center, center + offsets.long);
    gfx.lineTo(center + offsets.short, center + diag);
  }
  gfx.strokePath();
};

const drawNovaOverlay = (gfx: Phaser.GameObjects.Graphics, size: number): void => {
  const style = GAME_CONFIG.gems.visuals.novaStyle;
  gfx.lineStyle(style.outerWidth, style.outerColor, style.outerAlpha);
  gfx.strokeCircle(size / 2, size / 2, size / 3);
  gfx.lineStyle(style.innerWidth, style.innerColor, style.innerAlpha);
  const padding = GAME_CONFIG.gems.visuals.tileShape.innerInset + 1;
  gfx.strokeCircle(size / 2, size / 2, size / 2 - padding);
};

const drawNovaSigil = (gfx: Phaser.GameObjects.Graphics, size: number): void => {
  const center = size / 2;
  const style = GAME_CONFIG.gems.visuals.novaStyle;
  gfx.lineStyle(style.sigil.width, style.sigil.color, style.sigil.alpha);
  gfx.beginPath();
  for (let i = 0; i < style.spikes.count; i += 1) {
    const angle = (Math.PI * i) / (style.spikes.count / 2);
    const x1 = center + Math.cos(angle) * style.spikes.innerRadius;
    const y1 = center + Math.sin(angle) * style.spikes.innerRadius;
    const x2 = center + Math.cos(angle) * style.spikes.outerRadius;
    const y2 = center + Math.sin(angle) * style.spikes.outerRadius;
    gfx.moveTo(x1, y1);
    gfx.lineTo(x2, y2);
  }
  gfx.strokePath();
};

const drawSuperNovaOverlay = (gfx: Phaser.GameObjects.Graphics, size: number): void => {
  const style = GAME_CONFIG.gems.visuals.superNovaStyle;
  gfx.lineStyle(style.outerWidth, style.outerColor, style.outerAlpha);
  const padding = GAME_CONFIG.gems.visuals.tileShape.innerInset - 1;
  gfx.strokeCircle(size / 2, size / 2, size / 2 - padding);
  gfx.lineStyle(style.innerWidth, style.innerColor, style.innerAlpha);
  gfx.strokeCircle(size / 2, size / 2, size / 3);
};

const drawSuperNovaSigil = (gfx: Phaser.GameObjects.Graphics, size: number): void => {
  const center = size / 2;
  const style = GAME_CONFIG.gems.visuals.superNovaStyle;
  gfx.lineStyle(style.sigil.width, style.sigil.color, style.sigil.alpha);
  gfx.beginPath();
  for (let i = 0; i < style.rays.count; i += 1) {
    const angle = (Math.PI * 2 * i) / style.rays.count;
    const x1 = center + Math.cos(angle) * style.rays.innerRadius;
    const y1 = center + Math.sin(angle) * style.rays.innerRadius;
    const x2 = center + Math.cos(angle) * style.rays.outerRadius;
    const y2 = center + Math.sin(angle) * style.rays.outerRadius;
    gfx.moveTo(x1, y1);
    gfx.lineTo(x2, y2);
  }
  gfx.strokePath();
};
