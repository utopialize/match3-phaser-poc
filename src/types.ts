export type SpecialType = 'line-h' | 'line-v' | 'nova' | 'supernova';

export type GemSpec = {
  name: string;
  primary: number;
  secondary: number;
};

import Phaser from 'phaser';

export type Tile = {
  sprite: Phaser.GameObjects.Sprite;
  row: number;
  col: number;
  type: number;
  special?: SpecialType | null;
};
