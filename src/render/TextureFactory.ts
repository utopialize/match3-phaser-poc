import Phaser from 'phaser';
import { GemSpec, SpecialType } from '../types';

const DEFAULT_TILE_SIZE = 68;

export const textureKey = (type: number, special?: SpecialType | null): string => {
  if (special === 'line-h') return `tile-${type}-line-h`;
  if (special === 'line-v') return `tile-${type}-line-v`;
  if (special === 'nova') return `tile-${type}-nova`;
  if (special === 'supernova') return `tile-${type}-supernova`;
  return `tile-${type}`;
};

export const registerTextures = (
  scene: Phaser.Scene,
  specs: GemSpec[],
  tileSize: number = DEFAULT_TILE_SIZE
): void => {
  const circle = scene.add.graphics({ x: 0, y: 0 });
  circle.fillStyle(0xffffff, 1);
  circle.fillCircle(6, 6, 6);
  circle.generateTexture('spark', 12, 12);
  circle.destroy();

  specs.forEach((spec, i) => {
    const base = scene.add.graphics({ x: 0, y: 0 });
    drawGemRect(base, spec.primary, spec.secondary, tileSize);
    drawRune(base, i, tileSize);
    base.generateTexture(`tile-${i}`, tileSize, tileSize);
    base.destroy();

    const linePrimary = 0x352f65;
    const lineSecondary = 0x111827;
    const lineH = scene.add.graphics({ x: 0, y: 0 });
    drawGemRect(lineH, linePrimary, lineSecondary, tileSize);
    drawLineOverlay(lineH, true, tileSize);
    drawLineSigil(lineH, true, tileSize);
    lineH.generateTexture(`tile-${i}-line-h`, tileSize, tileSize);
    lineH.destroy();

    const lineV = scene.add.graphics({ x: 0, y: 0 });
    drawGemRect(lineV, linePrimary, lineSecondary, tileSize);
    drawLineOverlay(lineV, false, tileSize);
    drawLineSigil(lineV, false, tileSize);
    lineV.generateTexture(`tile-${i}-line-v`, tileSize, tileSize);
    lineV.destroy();

    const novaPrimary = 0xfbf6e3;
    const novaSecondary = 0xd0a857;
    const nova = scene.add.graphics({ x: 0, y: 0 });
    drawGemRect(nova, novaPrimary, novaSecondary, tileSize);
    drawNovaOverlay(nova, tileSize);
    drawNovaSigil(nova, tileSize);
    nova.generateTexture(`tile-${i}-nova`, tileSize, tileSize);
    nova.destroy();

    const superNovaPrimary = 0xffffff;
    const superNovaSecondary = 0x9acdf5;
    const supernova = scene.add.graphics({ x: 0, y: 0 });
    drawGemRect(supernova, superNovaPrimary, superNovaSecondary, tileSize);
    drawSuperNovaOverlay(supernova, tileSize);
    drawSuperNovaSigil(supernova, tileSize);
    supernova.generateTexture(`tile-${i}-supernova`, tileSize, tileSize);
    supernova.destroy();
  });

  const glowSize = tileSize;
  const glow = scene.add.graphics({ x: 0, y: 0 });
  glow.fillStyle(0x38e8ff, 0.14);
  glow.fillRoundedRect(0, 0, glowSize, glowSize, 18);
  glow.generateTexture('tile-glow', glowSize, glowSize);
  glow.destroy();
};

const drawGemRect = (gfx: Phaser.GameObjects.Graphics, primary: number, secondary: number, size: number): void => {
  gfx.fillStyle(secondary, 1);
  gfx.fillRoundedRect(2, 2, size - 4, size - 4, 12);
  gfx.fillStyle(primary, 1);
  gfx.fillRoundedRect(5, 5, size - 10, size - 10, 10);
  gfx.lineStyle(2, 0x38e8ff, 0.25);
  gfx.strokeRoundedRect(6, 6, size - 12, size - 12, 10);
};

const drawRune = (gfx: Phaser.GameObjects.Graphics, index: number, size: number): void => {
  const center = size / 2;
  const runeColor = 0xe0e5e9;
  gfx.lineStyle(3, runeColor, 0.5);
  gfx.beginPath();
  switch (index) {
    case 0: // Rage
      gfx.moveTo(center, center - 12);
      gfx.lineTo(center + 10, center + 12);
      gfx.lineTo(center - 10, center + 12);
      gfx.closePath();
      break;
    case 1: // Vitalite
      gfx.moveTo(center - 10, center - 4);
      gfx.lineTo(center, center - 12);
      gfx.lineTo(center + 10, center + 6);
      gfx.lineTo(center - 2, center + 12);
      break;
    case 2: // Arcane
      gfx.moveTo(center, center - 14);
      gfx.lineTo(center + 10, center);
      gfx.lineTo(center, center + 14);
      gfx.lineTo(center - 10, center);
      gfx.closePath();
      break;
    case 3: // Garde
      gfx.moveTo(center, center - 12);
      gfx.lineTo(center + 10, center - 2);
      gfx.lineTo(center + 6, center + 12);
      gfx.lineTo(center - 6, center + 12);
      gfx.lineTo(center - 10, center - 2);
      gfx.closePath();
      break;
    case 4: // Fortune
      {
        const spikes = 4;
        const outerRadius = 12;
        const innerRadius = 6;
        for (let i = 0; i < spikes * 2; i += 1) {
          const radius = i % 2 === 0 ? outerRadius : innerRadius;
          const angle = (Math.PI * i) / spikes - Math.PI / 2;
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
      break;
    default:
      gfx.moveTo(center - 10, center);
      gfx.lineTo(center + 10, center);
  }
  gfx.strokePath();
};

const drawLineOverlay = (gfx: Phaser.GameObjects.Graphics, horizontal: boolean, size: number): void => {
  gfx.lineStyle(8, 0x5b21b6, 0.6);
  const inset = 12;
  if (horizontal) {
    gfx.moveTo(inset, size / 2);
    gfx.lineTo(size - inset, size / 2);
  } else {
    gfx.moveTo(size / 2, inset);
    gfx.lineTo(size / 2, size - inset);
  }
  gfx.strokePath();
};

const drawLineSigil = (gfx: Phaser.GameObjects.Graphics, horizontal: boolean, size: number): void => {
  const center = size / 2;
  gfx.lineStyle(3, 0xffffff, 0.8);
  gfx.beginPath();
  if (horizontal) {
    gfx.moveTo(center - 14, center);
    gfx.lineTo(center - 2, center);
    gfx.lineTo(center - 8, center - 6);
    gfx.moveTo(center - 2, center);
    gfx.lineTo(center - 8, center + 6);
    gfx.moveTo(center + 2, center);
    gfx.lineTo(center + 14, center);
    gfx.lineTo(center + 8, center - 6);
    gfx.moveTo(center + 14, center);
    gfx.lineTo(center + 8, center + 6);
  } else {
    gfx.moveTo(center, center - 14);
    gfx.lineTo(center, center - 2);
    gfx.lineTo(center - 6, center - 8);
    gfx.moveTo(center, center - 2);
    gfx.lineTo(center + 6, center - 8);
    gfx.moveTo(center, center + 2);
    gfx.lineTo(center, center + 14);
    gfx.lineTo(center - 6, center + 8);
    gfx.moveTo(center, center + 14);
    gfx.lineTo(center + 6, center + 8);
  }
  gfx.strokePath();
};

const drawNovaOverlay = (gfx: Phaser.GameObjects.Graphics, size: number): void => {
  gfx.lineStyle(4, 0xf5e6c5, 0.75);
  gfx.strokeCircle(size / 2, size / 2, size / 3);
  gfx.lineStyle(2, 0xffffff, 0.6);
  gfx.strokeCircle(size / 2, size / 2, size / 2 - 6);
};

const drawNovaSigil = (gfx: Phaser.GameObjects.Graphics, size: number): void => {
  const center = size / 2;
  gfx.lineStyle(3, 0xf4c76c, 0.9);
  gfx.beginPath();
  for (let i = 0; i < 8; i += 1) {
    const angle = (Math.PI * i) / 4;
    const x1 = center + Math.cos(angle) * 6;
    const y1 = center + Math.sin(angle) * 6;
    const x2 = center + Math.cos(angle) * 16;
    const y2 = center + Math.sin(angle) * 16;
    gfx.moveTo(x1, y1);
    gfx.lineTo(x2, y2);
  }
  gfx.strokePath();
};

const drawSuperNovaOverlay = (gfx: Phaser.GameObjects.Graphics, size: number): void => {
  gfx.lineStyle(4, 0xffffff, 0.85);
  gfx.strokeCircle(size / 2, size / 2, size / 2 - 4);
  gfx.lineStyle(2, 0x8ddcff, 0.8);
  gfx.strokeCircle(size / 2, size / 2, size / 3);
};

const drawSuperNovaSigil = (gfx: Phaser.GameObjects.Graphics, size: number): void => {
  const center = size / 2;
  gfx.lineStyle(3, 0x8ddcff, 0.9);
  gfx.beginPath();
  for (let i = 0; i < 6; i += 1) {
    const angle = (Math.PI * 2 * i) / 6;
    const x1 = center + Math.cos(angle) * 6;
    const y1 = center + Math.sin(angle) * 6;
    const x2 = center + Math.cos(angle) * 18;
    const y2 = center + Math.sin(angle) * 18;
    gfx.moveTo(x1, y1);
    gfx.lineTo(x2, y2);
  }
  gfx.strokePath();
};
