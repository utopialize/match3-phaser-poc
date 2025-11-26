/**
 * @fileoverview Shared game types for tiles and specials used across rendering, logic, and scenes.
 * @module src/types
 */

/**
 * Categories of special tiles created by matches of varying lengths.
 */
export type SpecialType = 'line-h' | 'line-v' | 'nova' | 'supernova';

/**
 * Visual definition for a gem type, mapping a name to its palette.
 */
export type GemSpec = {
  name: string;
  primary: number;
  secondary: number;
};

import Phaser from 'phaser';

/**
 * Runtime representation of a tile on the board, including its sprite and logical coordinates.
 */
export type Tile = {
  sprite: Phaser.GameObjects.Sprite;
  row: number;
  col: number;
  type: number;
  special?: SpecialType | null;
};
