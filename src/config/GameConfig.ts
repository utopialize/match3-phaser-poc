/**
 * @fileoverview Centralized game configuration describing viewport, grid, visuals, timings, rules, and UI keys.
 * @module src/config/GameConfig
 */

import Phaser from 'phaser';
import { GemSpec } from '../types';

/**
 * Configuration for the Phaser viewport canvas.
 *
 * @property width - Canvas width in pixels.
 * @property height - Canvas height in pixels.
 * @property backgroundColor - Hex string used for the game background.
 */
export interface ViewportConfig {
  width: number;
  height: number;
  backgroundColor: string;
}

/**
 * Configuration for grid dimensions and tile settings.
 *
 * @property rows - Number of rows in the grid.
 * @property cols - Number of columns in the grid.
 * @property tileTypes - Number of gem variants available.
 * @property tileSize - Size of each tile in pixels.
 * @property boardOffsetY - Additional vertical offset to center the board visually.
 * @property spawnOffset - Extra vertical offset applied to spawning tiles to create a drop effect.
 * @property dropSpawnRange - Min/max random offset applied when tiles spawn above their target.
 * @property columnDelayMs - Delay per column used to stagger fall tweens during gravity.
 * @property spawnColumnDelayMs - Delay per column for initial spawn entrance.
 * @property spawnDelayMs - Delay between tiles spawned in the same column.
 */
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

/**
 * Visual configuration for gem shapes, outlines, runes, and special overlays.
 *
 * @property lineOverlay - Base colors for line specials.
 * @property novaOverlay - Base colors for nova specials.
 * @property superNovaOverlay - Base colors for supernova specials.
 * @property rune - Stroke style used to draw rune lines.
 * @property runeShapes - Geometric definitions for each rune, matching `specs` order.
 * @property spark - Size and color of particle sparks.
 * @property glow - Halo rendering underneath tiles.
 * @property tileShape - Insets and radii for gem body and stroke.
 * @property lineOverlayStyle - Stroke style and glyph offsets for line specials.
 * @property novaStyle - Stroke colors and spike geometry for novas.
 * @property superNovaStyle - Stroke colors and ray geometry for supernovas.
 */
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

/**
 * Parametric description of rune strokes used when drawing gem sigils.
 *
 * @property kind - Shape type; either a set of points or a star pattern.
 * @property points - Sequence of relative coordinates to draw for point-based runes.
 * @property close - Whether to close the path for point-based runes.
 * @property spikes - Number of spikes for star runes.
 * @property outerRadius - Outer radius for star spikes.
 * @property innerRadius - Inner radius for star spikes.
 */
export type RuneShape =
  | { kind: 'points'; points: { x: number; y: number }[]; close: boolean }
  | { kind: 'star'; spikes: number; outerRadius: number; innerRadius: number };

/**
 * Configuration for available gem types and their associated visuals.
 *
 * @property specs - Palette and naming for each gem type.
 * @property visuals - Shared drawing settings for all gem variants.
 */
export interface GemConfig {
  specs: GemSpec[];
  visuals: GemVisualConfig;
}

/**
 * Timing and easing for swap animations.
 *
 * @property durationMs - Swap tween duration in milliseconds.
 * @property ease - Easing identifier for swaps.
 */
export interface SwapAnimationConfig {
  durationMs: number;
  ease: string;
}

/**
 * Timing and easing for drop animations.
 *
 * @property durationMs - Base duration for drops.
 * @property jitterMs - Random extra time added to new tile drops.
 * @property ease - Easing for gravity moves.
 * @property spawnEase - Easing for newly spawned tiles.
 * @property spawnGlow - Glow pulse applied when a tile lands.
 */
export interface DropAnimationConfig {
  durationMs: number;
  jitterMs: number;
  ease: string;
  spawnEase: string;
  spawnGlow: { alpha: number; durationMs: number; ease: string };
}

/**
 * Scaling animation used for hover/select/deselect states.
 *
 * @property scale - Target scale value.
 * @property durationMs - Duration in milliseconds.
 * @property ease - Easing identifier.
 */
export interface HoverAnimationConfig {
  scale: number;
  durationMs: number;
  ease: string;
}

/**
 * Configuration for hint pulse behavior after inactivity.
 *
 * @property idleDelayMs - Delay before showing a hint.
 * @property pulseScale - Scale used for pulsing tiles.
 * @property durationMs - Duration of each pulse tween.
 * @property repeat - Number of pulse repeats.
 * @property ease - Easing identifier.
 * @property checkIntervalMs - Interval used to poll for idle hints.
 */
export interface HintAnimationConfig {
  idleDelayMs: number;
  pulseScale: number;
  durationMs: number;
  repeat: number;
  ease: string;
  checkIntervalMs: number;
}

/**
 * Configuration for reshuffle wobble and attempts.
 *
 * @property wobbleAngle - Angle amplitude for the wobble effect.
 * @property durationMs - Duration of the wobble tween.
 * @property repeat - Number of wobble repeats.
 * @property ease - Easing identifier.
 * @property maxAttempts - Maximum reshuffle attempts to obtain a playable grid.
 */
export interface ReshuffleConfig {
  wobbleAngle: number;
  durationMs: number;
  repeat: number;
  ease: string;
  maxAttempts: number;
}

/**
 * Collection of animation settings for all gameplay events.
 *
 * @property swap - Swap tween settings.
 * @property drop - Drop and spawn settings.
 * @property hover - Hover scaling settings.
 * @property select - Selection scaling settings.
 * @property deselect - Deselect scaling settings.
 * @property bump - Feedback when an invalid swap occurs.
 * @property destroy - Tile destruction tween settings.
 * @property upgrade - Promotion tween settings for specials.
 * @property hint - Idle hint pulse settings.
 * @property cascadeDelayMs - Delay between cascade waves.
 * @property matchWaveDelayMs - Delay base for staggering gravity moves.
 * @property reshuffle - Wobble and iteration settings after reshuffle.
 * @property hoverOutScale - Scale to apply when leaving hover.
 * @property timeUpZoom - Camera zoom pulse when time expires.
 * @property startupEnsurePlayableDelayMs - Delay before first playable check at startup.
 */
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

/**
 * Scoring, timing, and special creation rules.
 *
 * @property minMatch - Minimum contiguous tiles needed for a match.
 * @property lineMatchLength - Required length for line specials.
 * @property novaMatchLength - Required length for nova specials.
 * @property supernovaNovaCount - Number of novas needed to produce a supernova.
 * @property novaBlastRadius - Radius around a nova to include when it triggers.
 * @property pointsPerTile - Base points for each destroyed tile.
 * @property bonusPerTileForLine - Bonus per tile for line-sized matches.
 * @property cascadeBonusPerChain - Bonus scaled by cascade depth.
 * @property timerSeconds - Game duration in seconds.
 * @property timerTickMs - Timer tick resolution.
 */
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

/**
 * Visual effect settings for shakes, flashes, and particles.
 *
 * @property cameraShake - Duration and intensity of camera shake on matches.
 * @property flash - Flash overlay displayed on tile destruction.
 * @property particles - Particle emitter settings for destruction sparks.
 */
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

/**
 * UI-related configuration such as storage keys.
 *
 * @property bestScoreKey - Local storage key for best score.
 */
export interface UiConfig {
  bestScoreKey: string;
}

/**
 * Aggregate configuration grouping all game subsystems.
 *
 * @property viewport - Canvas and background settings.
 * @property grid - Grid dimensions and spawn timings.
 * @property gems - Visual definitions for gem families.
 * @property animations - Timings and easings for gameplay actions.
 * @property rules - Scoring and matching rules.
 * @property effects - Screen and particle effects.
 * @property ui - UI-related keys and metadata.
 *
 * @example
 * const customConfig: GameConfiguration = {
 *   ...GAME_CONFIG,
 *   grid: { ...GAME_CONFIG.grid, tileSize: 72 }
 * };
 */
export interface GameConfiguration {
  viewport: ViewportConfig;
  grid: GridConfig;
  gems: GemConfig;
  animations: AnimationConfig;
  rules: RuleConfig;
  effects: EffectConfig;
  ui: UiConfig;
}

/**
 * Default game configuration used by all systems; tweak values here to reskin or rebalance the match-3.
 */
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
