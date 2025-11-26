import Phaser from 'phaser';
import { GemSpec } from '../types';

export interface ViewportConfig {
  width: number;
  height: number;
  backgroundColor: string;
}

export interface GridConfig {
  rows: number;
  cols: number;
  tileTypes: number;
  tileSize: number;
  boardOffsetY: number;
  spawnOffset: number;
  dropSpawnRange: { min: number; max: number };
  columnDelayMs: number;
  spawnColumnDelayMs: number;
  spawnDelayMs: number;
}

export interface GemVisualConfig {
  lineOverlay: { primary: number; secondary: number };
  novaOverlay: { primary: number; secondary: number };
  superNovaOverlay: { primary: number; secondary: number };
  rune: { color: number; width: number; alpha: number };
  runeShapes: RuneShape[];
  spark: { radius: number; color: number };
  glow: { color: number; alpha: number; cornerRadius: number };
  tileShape: { inset: number; innerInset: number; border: number; innerBorder: number; stroke: { width: number; color: number; alpha: number } };
    lineOverlayStyle: { color: number; width: number; inset: number; alpha: number; sigil: { color: number; width: number; alpha: number }; sigilOffsets: { long: number; mid: number; short: number } };
  novaStyle: { outerColor: number; outerWidth: number; outerAlpha: number; innerColor: number; innerWidth: number; innerAlpha: number; sigil: { color: number; width: number; alpha: number }; spikes: { count: number; innerRadius: number; outerRadius: number } };
  superNovaStyle: { outerColor: number; outerWidth: number; outerAlpha: number; innerColor: number; innerWidth: number; innerAlpha: number; sigil: { color: number; width: number; alpha: number }; rays: { count: number; innerRadius: number; outerRadius: number } };
}

export type RuneShape =
  | { kind: 'points'; points: { x: number; y: number }[]; close: boolean }
  | { kind: 'star'; spikes: number; outerRadius: number; innerRadius: number };

export interface GemConfig {
  specs: GemSpec[];
  visuals: GemVisualConfig;
}

export interface SwapAnimationConfig {
  durationMs: number;
  ease: string;
}

export interface DropAnimationConfig {
  durationMs: number;
  jitterMs: number;
  ease: string;
  spawnEase: string;
  spawnGlow: { alpha: number; durationMs: number; ease: string };
}

export interface HoverAnimationConfig {
  scale: number;
  durationMs: number;
  ease: string;
}

export interface HintAnimationConfig {
  idleDelayMs: number;
  pulseScale: number;
  durationMs: number;
  repeat: number;
  ease: string;
  checkIntervalMs: number;
}

export interface ReshuffleConfig {
  wobbleAngle: number;
  durationMs: number;
  repeat: number;
  ease: string;
  maxAttempts: number;
}

export interface AnimationConfig {
  swap: SwapAnimationConfig;
  drop: DropAnimationConfig;
  hover: HoverAnimationConfig;
  select: HoverAnimationConfig;
  deselect: HoverAnimationConfig;
  bump: { scaleX: number; scaleY: number; durationMs: number; ease: string };
  destroy: { durationMs: number; scale: number; angleJitter: number; ease: string };
  upgrade: { scale: number; durationMs: number; ease: string };
  hint: HintAnimationConfig;
  cascadeDelayMs: number;
  matchWaveDelayMs: number;
  reshuffle: ReshuffleConfig;
  hoverOutScale: number;
  timeUpZoom: { target: number; durationMs: number; ease: string };
  startupEnsurePlayableDelayMs: number;
}

export interface RuleConfig {
  minMatch: number;
  lineMatchLength: number;
  novaMatchLength: number;
  supernovaNovaCount: number;
  novaBlastRadius: number;
  pointsPerTile: number;
  bonusPerTileForLine: number;
  cascadeBonusPerChain: number;
  timerSeconds: number;
  timerTickMs: number;
}

export interface EffectConfig {
  cameraShake: { durationMs: number; intensity: number };
  flash: { color: number; alpha: number; durationMs: number; scale: number; ease: string };
  particles: {
    speed: { min: number; max: number };
    lifespanMs: number;
    scale: { start: number; end: number };
    quantity: number;
    angle: { min: number; max: number };
    blendMode: Phaser.BlendModes | string;
  };
}

export interface UiConfig {
  bestScoreKey: string;
}

export interface GameConfiguration {
  viewport: ViewportConfig;
  grid: GridConfig;
  gems: GemConfig;
  animations: AnimationConfig;
  rules: RuleConfig;
  effects: EffectConfig;
  ui: UiConfig;
}

export const GAME_CONFIG: GameConfiguration = {
  viewport: {
    width: 800, // Largeur de la fenêtre de jeu
    height: 600, // Hauteur de la fenêtre de jeu
    backgroundColor: '#0e1320' // Couleur de fond du canvas
  },
  grid: {
    rows: 8, // Nombre de lignes de la grille
    cols: 8, // Nombre de colonnes de la grille
    tileTypes: 5, // Nombre de types de gemmes disponibles
    tileSize: 68, // Taille d'une tuile en pixels
    boardOffsetY: 12, // Décalage vertical pour centrer la grille
    spawnOffset: 80, // Décalage vertical initial pour l'apparition des nouvelles tuiles
    dropSpawnRange: { min: 150, max: 260 }, // Amplitude du spawn aléatoire pour l'arrivée des tuiles
    columnDelayMs: 6, // Décalage par colonne pour échelonner les chutes
    spawnColumnDelayMs: 12, // Décalage par colonne pour l'apparition initiale
    spawnDelayMs: 20 // Décalage entre les tuiles générées sur la même colonne
  },
  gems: {
    specs: [
      { name: 'rage', primary: 0xff4b55, secondary: 0xa02030 },
      { name: 'vitality', primary: 0x47e47d, secondary: 0x2d7a4f },
      { name: 'arcane', primary: 0x57d4ff, secondary: 0x1d4e89 },
      { name: 'guard', primary: 0xf2d380, secondary: 0xb8860b },
      { name: 'fortune', primary: 0xa875ff, secondary: 0x6b46c1 }
    ], // Spécifications visuelles des gemmes
    visuals: {
      lineOverlay: { primary: 0x352f65, secondary: 0x111827 }, // Couleurs des tuiles ligne
      novaOverlay: { primary: 0xfbf6e3, secondary: 0xd0a857 }, // Couleurs des tuiles nova
      superNovaOverlay: { primary: 0xffffff, secondary: 0x9acdf5 }, // Couleurs des tuiles supernova
      rune: { color: 0xe0e5e9, width: 3, alpha: 0.5 }, // Style des runes dessinées sur les gemmes
      runeShapes: [
        { kind: 'points', points: [{ x: 0, y: -12 }, { x: 10, y: 12 }, { x: -10, y: 12 }], close: true }, // Rune rage
        { kind: 'points', points: [{ x: -10, y: -4 }, { x: 0, y: -12 }, { x: 10, y: 6 }, { x: -2, y: 12 }], close: false }, // Rune vitalité
        { kind: 'points', points: [{ x: 0, y: -14 }, { x: 10, y: 0 }, { x: 0, y: 14 }, { x: -10, y: 0 }], close: true }, // Rune arcane
        { kind: 'points', points: [{ x: 0, y: -12 }, { x: 10, y: -2 }, { x: 6, y: 12 }, { x: -6, y: 12 }, { x: -10, y: -2 }], close: true }, // Rune garde
        { kind: 'star', spikes: 4, outerRadius: 12, innerRadius: 6 } // Rune fortune en étoile
      ],
      spark: { radius: 6, color: 0xffffff }, // Taille et couleur des particules spark
      glow: { color: 0x38e8ff, alpha: 0.14, cornerRadius: 18 }, // Style du halo lumineux sous les tuiles
      tileShape: {
        inset: 2, // Décalage de la bordure extérieure de la gemme
        innerInset: 5, // Décalage de la zone intérieure de la gemme
        border: 12, // Rayon de bordure du cadre extérieur
        innerBorder: 10, // Rayon de bordure du cadre intérieur
        stroke: { width: 2, color: 0x38e8ff, alpha: 0.25 } // Contour lumineux de la gemme
      },
      lineOverlayStyle: {
        color: 0x5b21b6, // Couleur de la bande pour les tuiles ligne
        width: 8, // Épaisseur de la bande pour les tuiles ligne
        inset: 12, // Décalage de la bande par rapport aux bords
        alpha: 0.6, // Opacité de la bande ligne
        sigil: { color: 0xffffff, width: 3, alpha: 0.8 }, // Style du glyphe sur les tuiles ligne
        sigilOffsets: { long: 14, mid: 2, short: 6 } // Coordonnées relatives du glyphe ligne
      },
      novaStyle: {
        outerColor: 0xf5e6c5, // Couleur de l'anneau extérieur nova
        outerWidth: 4, // Épaisseur de l'anneau extérieur nova
        outerAlpha: 0.75, // Opacité de l'anneau extérieur nova
        innerColor: 0xffffff, // Couleur de l'anneau intérieur nova
        innerWidth: 2, // Épaisseur de l'anneau intérieur nova
        innerAlpha: 0.6, // Opacité de l'anneau intérieur nova
        sigil: { color: 0xf4c76c, width: 3, alpha: 0.9 }, // Style du glyphe nova central
        spikes: { count: 8, innerRadius: 6, outerRadius: 16 } // Paramètres des pointes du glyphe nova
      },
      superNovaStyle: {
        outerColor: 0xffffff, // Couleur de l'anneau extérieur supernova
        outerWidth: 4, // Épaisseur de l'anneau extérieur supernova
        outerAlpha: 0.85, // Opacité de l'anneau extérieur supernova
        innerColor: 0x8ddcff, // Couleur de l'anneau intérieur supernova
        innerWidth: 2, // Épaisseur de l'anneau intérieur supernova
        innerAlpha: 0.8, // Opacité de l'anneau intérieur supernova
        sigil: { color: 0x8ddcff, width: 3, alpha: 0.9 }, // Style du glyphe supernova
        rays: { count: 6, innerRadius: 6, outerRadius: 18 } // Longueur et nombre de rayons supernova
      }
    }
  },
  animations: {
    swap: { durationMs: 150, ease: 'Back.easeOut' }, // Durée et easing du swap
    drop: {
      durationMs: 230, // Durée de base de chute
      jitterMs: 80, // Variation de durée pour les chutes spawnées
      ease: 'Back.easeOut', // Easing pour les chutes classiques
      spawnEase: 'Quad.easeOut', // Easing pour les nouvelles tuiles
      spawnGlow: { alpha: 0.16, durationMs: 120, ease: 'Sine.easeOut' } // Flash lumineux lors de l'atterrissage
    },
    hover: { scale: 1.06, durationMs: 90, ease: 'Sine.easeOut' }, // Animation de survol
    select: { scale: 1.12, durationMs: 110, ease: 'Back.easeOut' }, // Mise en avant d'une tuile sélectionnée
    deselect: { scale: 1, durationMs: 90, ease: 'Sine.easeOut' }, // Retour à la normale d'une tuile
    bump: { scaleX: 1.08, scaleY: 0.94, durationMs: 80, ease: 'Back.easeInOut' }, // Rebond subtil pour signaler un swap invalide
    destroy: { durationMs: 220, scale: 1.35, angleJitter: 10, ease: 'Back.easeIn' }, // Animation de destruction d'une tuile
    upgrade: { scale: 1.15, durationMs: 140, ease: 'Back.easeOut' }, // Animation de promotion d'une tuile spéciale
    hint: { idleDelayMs: 10000, pulseScale: 1.12, durationMs: 220, repeat: 5, ease: 'Sine.easeInOut', checkIntervalMs: 800 }, // Paramètres d'affichage des indices
    cascadeDelayMs: 260, // Délai entre deux vagues de destruction
    matchWaveDelayMs: 18, // Délai de base pour échelonner les chutes lors de la gravité
    reshuffle: { wobbleAngle: 6, durationMs: 120, repeat: 1, ease: 'Sine.easeInOut', maxAttempts: 40 }, // Paramètres du wobble après reshuffle
    hoverOutScale: 1, // Échelle cible lorsqu'on quitte un survol
    timeUpZoom: { target: 1.02, durationMs: 200, ease: 'Sine.easeInOut' }, // Effet visuel quand le temps est écoulé
    startupEnsurePlayableDelayMs: 650 // Délai initial avant la première vérification de jouabilité
  },
  rules: {
    minMatch: 3, // Longueur minimale d'un match
    lineMatchLength: 4, // Longueur requise pour générer une tuile ligne
    novaMatchLength: 5, // Longueur requise pour générer une tuile nova
    supernovaNovaCount: 3, // Nombre de novas alignées pour déclencher une supernova
    novaBlastRadius: 1, // Rayon (cases autour) d'effet d'une nova
    pointsPerTile: 10, // Points par tuile détruite
    bonusPerTileForLine: 4, // Bonus par tuile pour les matchs de 4+
    cascadeBonusPerChain: 5, // Bonus par niveau de cascade
    timerSeconds: 120, // Durée de la partie en secondes
    timerTickMs: 1000 // Fréquence d'actualisation du timer
  },
  effects: {
    cameraShake: { durationMs: 70, intensity: 0.0025 }, // Secousse de caméra sur match
    flash: { color: 0xffffff, alpha: 0.25, durationMs: 160, scale: 1.4, ease: 'Sine.easeOut' }, // Flash visuel lors d'une destruction
    particles: {
      speed: { min: 80, max: 140 }, // Vitesse des particules
      lifespanMs: 320, // Durée de vie des particules
      scale: { start: 0.8, end: 0 }, // Évolution de l'échelle des particules
      quantity: 12, // Quantité de particules
      angle: { min: 0, max: 360 }, // Angle de dispersion des particules
      blendMode: 'ADD' // Mode de fusion pour les particules
    }
  },
  ui: {
    bestScoreKey: 'runeshards-best' // Clé de stockage pour le meilleur score
  }
};
