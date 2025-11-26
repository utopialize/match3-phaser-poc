import { Tile } from '../types';

export type GridLookup = {
  getTile(row: number, col: number): Tile | null;
  getSize(): number;
};
