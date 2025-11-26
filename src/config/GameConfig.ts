import { GemSpec } from '../types';

export const GRID_SIZE = 8;
export const TILE_TYPES = 5;
export const TILE_SIZE = 68;
export const GEM_SPECS: GemSpec[] = [
  { name: 'rage', primary: 0xff4b55, secondary: 0xa02030 },
  { name: 'vitality', primary: 0x47e47d, secondary: 0x2d7a4f },
  { name: 'arcane', primary: 0x57d4ff, secondary: 0x1d4e89 },
  { name: 'guard', primary: 0xf2d380, secondary: 0xb8860b },
  { name: 'fortune', primary: 0xa875ff, secondary: 0x6b46c1 }
];

export const TURN_DURATION = 150;
export const DROP_DURATION = 230;
export const IDLE_HINT_MS = 10000;
export const GAME_TIME = 120;
