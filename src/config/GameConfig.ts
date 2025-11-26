/**
 * @fileoverview Centralized game configuration describing viewport, grid, visuals, timings, rules, and UI keys.
 * @module src/config/GameConfig
 */

import Phaser from 'phaser';
import { GemSpec } from '../types';
import { ACTIVE_THEME } from './ThemeConfig';

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
 * @property kind - Shape type: point list, star, or circle.
 * @property points - Sequence of relative coordinates to draw for point-based runes.
 * @property close - Whether to close the path for point-based runes.
 * @property spikes - Number of spikes for star runes.
 * @property outerRadius - Outer radius for star spikes.
 * @property innerRadius - Inner radius for star spikes.
 * @property radius - Radius for circular runes.
 */
export type RuneShape =
  | { kind: 'points'; points: { x: number; y: number }[]; close: boolean }
  | { kind: 'star'; spikes: number; outerRadius: number; innerRadius: number }
  | { kind: 'circle'; radius: number };

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
    width: 800, // Game canvas width
    height: 600, // Game canvas height
    backgroundColor: ACTIVE_THEME.colors.background // Canvas background color (theme-driven)
  },
  grid: {
    rows: 8, // Grid rows
    cols: 8, // Grid columns
    tileTypes: 5, // Number of gem families
    tileSize: 68, // Tile size in pixels
    boardOffsetY: 12, // Vertical offset to center the board
    spawnOffset: 80, // Vertical offset for new tiles entering
    dropSpawnRange: { min: 150, max: 260 }, // Randomized spawn height range for drops
    columnDelayMs: 6, // Per-column staggering for gravity
    spawnColumnDelayMs: 12, // Per-column staggering for initial spawn
    spawnDelayMs: 20 // Delay between spawns within a column
  },
  gems: {
    specs: [
      { name: 'red', primary: 0xff0000, secondary: 0xff4d4d },
      { name: 'green', primary: 0x00ff00, secondary: 0x4dff4d },
      { name: 'blue', primary: 0x0000ff, secondary: 0x4d4dff },
      { name: 'yellow', primary: 0xffff00, secondary: 0xffff66 },
      { name: 'purple', primary: 0xff00ff, secondary: 0xff66ff }
    ], // Visual specs for each gem type
    visuals: {
      lineOverlay: { primary: 0x352f65, secondary: 0x111827 }, // Line special palette
      novaOverlay: { primary: 0xfbf6e3, secondary: 0xd0a857 }, // Nova palette
      superNovaOverlay: { primary: 0xffffff, secondary: 0x9acdf5 }, // Supernova palette
      rune: { color: 0xe0e5e9, width: 3, alpha: 0.5 }, // Rune stroke style
      runeShapes: [
        { kind: 'circle', radius: 10 }, // Basic circle
        { kind: 'points', points: [{ x: -10, y: -10 }, { x: 10, y: -10 }, { x: 10, y: 10 }, { x: -10, y: 10 }], close: true }, // Square
        { kind: 'points', points: [{ x: 0, y: -12 }, { x: 12, y: 12 }, { x: -12, y: 12 }], close: true }, // Triangle
        { kind: 'points', points: [{ x: 0, y: -12 }, { x: 12, y: 0 }, { x: 0, y: 12 }, { x: -12, y: 0 }], close: true }, // Diamond
        { kind: 'star', spikes: 5, outerRadius: 12, innerRadius: 6 } // Star
      ],
      spark: { radius: 6, color: 0xffffff }, // Particle size and color
      glow: { color: 0x38e8ff, alpha: 0.14, cornerRadius: 18 }, // Glow halo under tiles
      tileShape: {
        inset: 2, // Outer border inset
        innerInset: 5, // Inner body inset
        border: 12, // Outer corner radius
        innerBorder: 10, // Inner corner radius
        stroke: { width: 2, color: 0xffffff, alpha: 0.16 } // Neutral highlight stroke
      },
      lineOverlayStyle: {
        color: 0x5b21b6, // Line stripe color
        width: 8, // Line stripe thickness
        inset: 12, // Stripe inset from edges
        alpha: 0.6, // Stripe opacity
        sigil: { color: 0xffffff, width: 3, alpha: 0.8 }, // Line glyph style
        sigilOffsets: { long: 14, mid: 2, short: 6 } // Glyph coordinate presets
      },
      novaStyle: {
        outerColor: 0xf5e6c5, // Outer ring color
        outerWidth: 4, // Outer ring thickness
        outerAlpha: 0.75, // Outer ring opacity
        innerColor: 0xffffff, // Inner ring color
        innerWidth: 2, // Inner ring thickness
        innerAlpha: 0.6, // Inner ring opacity
        sigil: { color: 0xf4c76c, width: 3, alpha: 0.9 }, // Central nova glyph
        spikes: { count: 8, innerRadius: 6, outerRadius: 16 } // Nova glyph spikes
      },
      superNovaStyle: {
        outerColor: 0xffffff, // Supernova outer ring color
        outerWidth: 4, // Supernova outer ring thickness
        outerAlpha: 0.85, // Supernova outer ring opacity
        innerColor: 0x8ddcff, // Supernova inner ring color
        innerWidth: 2, // Supernova inner ring thickness
        innerAlpha: 0.8, // Supernova inner ring opacity
        sigil: { color: 0x8ddcff, width: 3, alpha: 0.9 }, // Supernova glyph
        rays: { count: 6, innerRadius: 6, outerRadius: 18 } // Supernova ray geometry
      }
    }
  },
  animations: {
    swap: { durationMs: 150, ease: 'Back.easeOut' }, // Swap timing
    drop: {
      durationMs: 230, // Base drop duration
      jitterMs: 80, // Random variation for new drops
      ease: 'Back.easeOut', // Gravity easing
      spawnEase: 'Quad.easeOut', // Easing for newly spawned tiles
      spawnGlow: { alpha: 0.16, durationMs: 120, ease: 'Sine.easeOut' } // Landing glow pulse
    },
    hover: { scale: 1.06, durationMs: 90, ease: 'Sine.easeOut' }, // Hover pulse
    select: { scale: 1.12, durationMs: 110, ease: 'Back.easeOut' }, // Selection emphasis
    deselect: { scale: 1, durationMs: 90, ease: 'Sine.easeOut' }, // Reset after deselect
    bump: { scaleX: 1.08, scaleY: 0.94, durationMs: 80, ease: 'Back.easeInOut' }, // Invalid swap feedback
    destroy: { durationMs: 220, scale: 1.35, angleJitter: 10, ease: 'Back.easeIn' }, // Tile destruction
    upgrade: { scale: 1.15, durationMs: 140, ease: 'Back.easeOut' }, // Special promotion
    hint: { idleDelayMs: 10000, pulseScale: 1.12, durationMs: 220, repeat: 5, ease: 'Sine.easeInOut', checkIntervalMs: 800 }, // Idle hint
    cascadeDelayMs: 260, // Delay between cascade waves
    matchWaveDelayMs: 18, // Base delay to stagger gravity
    reshuffle: { wobbleAngle: 6, durationMs: 120, repeat: 1, ease: 'Sine.easeInOut', maxAttempts: 40 }, // Reshuffle wobble
    hoverOutScale: 1, // Scale when leaving hover
    timeUpZoom: { target: 1.02, durationMs: 200, ease: 'Sine.easeInOut' }, // Time-up camera pulse
    startupEnsurePlayableDelayMs: 650 // Initial playable check delay
  },
  rules: {
    minMatch: 3, // Minimum contiguous tiles for a match
    lineMatchLength: 4, // Length required for line specials
    novaMatchLength: 5, // Length required for nova specials
    supernovaNovaCount: 3, // Number of novas to trigger a supernova
    novaBlastRadius: 1, // Blast radius (in tiles) for novas
    pointsPerTile: 10, // Base points per destroyed tile
    bonusPerTileForLine: 4, // Bonus per tile for line-length matches
    cascadeBonusPerChain: 5, // Bonus per cascade depth
    timerSeconds: 120, // Game duration in seconds
    timerTickMs: 1000 // Timer tick frequency
  },
  effects: {
    cameraShake: { durationMs: 70, intensity: 0.0025 }, // Camera shake on matches
    flash: { color: 0xffffff, alpha: 0.25, durationMs: 160, scale: 1.4, ease: 'Sine.easeOut' }, // Destruction flash
    particles: {
      speed: { min: 80, max: 140 }, // Particle speed range
      lifespanMs: 320, // Particle lifetime
      scale: { start: 0.8, end: 0 }, // Particle scale transition
      quantity: 12, // Particle count
      angle: { min: 0, max: 360 }, // Spread angle
      blendMode: 'ADD' // Particle blend mode
    }
  },
  ui: {
    bestScoreKey: `${ACTIVE_THEME.storagePrefix}-best-score` // Local storage key for best score (theme-driven)
  }
};
