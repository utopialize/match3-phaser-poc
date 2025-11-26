/**
 * @fileoverview Grid state container handling tile placement, swapping, matching checks, and gravity.
 * @module src/core/GridManager
 */
import { Tile } from '../types';

/**
 * Manages the logical grid, ensuring swaps, matches, and gravity resolve correctly.
 *
 * @example
 * const grid = new GridManager(8, 5, 3, 3);
 * grid.init(tileFactory);
 * const hasMatch = grid.matchExistsAt(3, 4);
 */
export class GridManager {
  private size: number;
  private tileTypes: number;
  private minMatch: number;
  private supernovaNovaCount: number;
  grid: (Tile | null)[][];

  /**
   * Create a new grid manager for a square board.
   *
   * @param size - Number of rows and columns.
   * @param tileTypes - Available gem types.
   * @param minMatch - Minimum tiles needed for a valid match.
   * @param supernovaNovaCount - Number of novas needed to trigger a supernova chain.
   */
  constructor(size: number, tileTypes: number, minMatch: number, supernovaNovaCount: number) {
    this.size = size;
    this.tileTypes = tileTypes;
    this.minMatch = minMatch;
    this.supernovaNovaCount = supernovaNovaCount;
    this.grid = [];
  }

  /**
   * Get the tile at a given coordinate.
   *
   * @param row - Row index.
   * @param col - Column index.
   * @returns Tile at the coordinate or null.
   */
  getTile(row: number, col: number): Tile | null {
    return this.grid[row]?.[col] ?? null;
  }

  /**
   * Get the current grid matrix.
   *
   * @returns 2D grid of tiles or nulls.
   */
  getGrid(): (Tile | null)[][] {
    return this.grid;
  }

  /**
   * Get the grid size.
   *
   * @returns Number of rows/columns in the square grid.
   */
  getSize(): number {
    return this.size;
  }

  /**
   * Initialize the grid with tiles produced by the provided factory, avoiding pre-existing matches.
   *
   * @param factory - Function that creates a tile at the requested coordinates and type.
   */
  init(factory: (row: number, col: number, type: number) => Tile): void {
    this.grid = [];
    for (let row = 0; row < this.size; row += 1) {
      this.grid[row] = [];
      for (let col = 0; col < this.size; col += 1) {
        const type = this.pickTypeForCell(row, col);
        const tile = factory(row, col, type);
        this.grid[row][col] = tile;
      }
    }
  }

  /**
   * Swap two tiles in the grid, updating their coordinates.
   *
   * @param tileA - First tile to swap.
   * @param tileB - Second tile to swap.
   */
  swap(tileA: Tile, tileB: Tile): void {
    const { row: rowA, col: colA } = tileA;
    const { row: rowB, col: colB } = tileB;
    tileA.row = rowB;
    tileA.col = colB;
    tileB.row = rowA;
    tileB.col = colA;
    this.grid[rowA][colA] = tileB;
    this.grid[rowB][colB] = tileA;
  }

  /**
   * Check if a match exists at a given coordinate.
   *
   * @param row - Row to inspect.
   * @param col - Column to inspect.
   * @returns True if a match of length >= minMatch exists.
   */
  matchExistsAt(row: number, col: number): boolean {
    return this.localMatchExistsAt(row, col);
  }

  /**
   * Determine if any swap on the board would create a match.
   *
   * @returns True if at least one potential swap yields a match.
   */
  hasPossibleMoves(): boolean {
    for (let row = 0; row < this.size; row += 1) {
      for (let col = 0; col < this.size; col += 1) {
        if (this.checkSwapForMatch(row, col, row, col + 1)) return true;
        if (this.checkSwapForMatch(row, col, row + 1, col)) return true;
      }
    }
    return false;
  }

  /**
   * Simulate a swap and check if it would create a match.
   *
   * @param r1 - Row of first tile.
   * @param c1 - Column of first tile.
   * @param r2 - Row of second tile.
   * @param c2 - Column of second tile.
   * @returns True if swapping would create a match.
   */
  checkSwapForMatch(r1: number, c1: number, r2: number, c2: number): boolean {
    if (!this.inBounds(r2, c2)) return false;
    const a = this.grid[r1][c1];
    const b = this.grid[r2][c2];
    if (!a || !b) return false;
    this.grid[r1][c1] = b;
    this.grid[r2][c2] = a;
    const match = this.localMatchExistsAt(r1, c1) || this.localMatchExistsAt(r2, c2);
    this.grid[r1][c1] = a;
    this.grid[r2][c2] = b;
    return match;
  }

  /**
   * Find any horizontal or vertical streak of novas large enough to create a supernova.
   *
   * @returns Set of nova tiles that form a qualifying streak.
   */
  findNovaMatch(): Set<Tile> {
    const result = new Set<Tile>();
    // Scan rows for nova streaks large enough to matter.
    for (let row = 0; row < this.size; row += 1) {
      let streak: Tile[] = [];
      for (let col = 0; col < this.size; col += 1) {
        const tile = this.grid[row][col];
        if (!tile || tile.special !== 'nova') {
          if (streak.length >= this.supernovaNovaCount) streak.forEach((t) => result.add(t));
          streak = [];
          continue;
        }
        streak.push(tile);
      }
      if (streak.length >= this.supernovaNovaCount) streak.forEach((t) => result.add(t));
    }
    // Scan columns for nova streaks large enough to matter.
    for (let col = 0; col < this.size; col += 1) {
      let streak: Tile[] = [];
      for (let row = 0; row < this.size; row += 1) {
        const tile = this.grid[row][col];
        if (!tile || tile.special !== 'nova') {
          if (streak.length >= this.supernovaNovaCount) streak.forEach((t) => result.add(t));
          streak = [];
          continue;
        }
        streak.push(tile);
      }
      if (streak.length >= this.supernovaNovaCount) streak.forEach((t) => result.add(t));
    }
    return result;
  }

  /**
   * Group all matches of length >= minMatch into horizontal or vertical runs.
   *
   * @returns Array of match groups including orientation and type.
   */
  findMatchGroups(): { tiles: Tile[]; orientation: 'row' | 'col'; type: number }[] {
    const groups: { tiles: Tile[]; orientation: 'row' | 'col'; type: number }[] = [];
    // Horizontal scan; breaks streaks on specials to avoid multi-type chains.
    for (let row = 0; row < this.size; row += 1) {
      let streak: Tile[] = [];
      for (let col = 0; col < this.size; col += 1) {
        const tile = this.grid[row][col];
        if (!tile || tile.special) {
          if (streak.length >= this.minMatch) groups.push({ tiles: [...streak], orientation: 'row', type: streak[0].type });
          streak = [];
          continue;
        }
        if (streak.length === 0 || streak[streak.length - 1].type === tile.type) {
          streak.push(tile);
        } else {
          if (streak.length >= this.minMatch) groups.push({ tiles: [...streak], orientation: 'row', type: streak[0].type });
          streak = [tile];
        }
      }
      if (streak.length >= this.minMatch) groups.push({ tiles: [...streak], orientation: 'row', type: streak[0].type });
    }
    // Vertical scan mirrors the row scan; both avoid counting specials.
    for (let col = 0; col < this.size; col += 1) {
      let streak: Tile[] = [];
      for (let row = 0; row < this.size; row += 1) {
        const tile = this.grid[row][col];
        if (!tile || tile.special) {
          if (streak.length >= this.minMatch) groups.push({ tiles: [...streak], orientation: 'col', type: streak[0].type });
          streak = [];
          continue;
        }
        if (streak.length === 0 || streak[streak.length - 1].type === tile.type) {
          streak.push(tile);
        } else {
          if (streak.length >= this.minMatch) groups.push({ tiles: [...streak], orientation: 'col', type: streak[0].type });
          streak = [tile];
        }
      }
      if (streak.length >= this.minMatch) groups.push({ tiles: [...streak], orientation: 'col', type: streak[0].type });
    }
    return groups;
  }

  /**
   * Apply gravity, moving tiles downward and spawning new ones in empty spaces.
   *
   * @param spawn - Factory used to create tiles for empty slots at the top.
   * @returns Moved and spawned tiles for animation.
   */
  applyGravity(spawn: (row: number, col: number, type: number) => Tile): { moved: Tile[]; spawned: Tile[] } {
    const moved: Tile[] = [];
    const spawned: Tile[] = [];

    for (let col = 0; col < this.size; col += 1) {
      let empty = 0;
      for (let row = this.size - 1; row >= 0; row -= 1) {
        // Walk upward; each null increments a gap counter we later fill.
        const tile = this.grid[row][col];
        if (!tile) {
          empty += 1;
          continue;
        }
        if (empty > 0) {
          this.grid[row + empty][col] = tile;
          this.grid[row][col] = null;
          tile.row += empty;
          moved.push(tile);
        }
      }

      for (let i = 0; i < empty; i += 1) {
        const spawnRow = i;
        const type = this.pickTypeForCell(spawnRow, col);
        const tile = spawn(spawnRow, col, type);
        this.grid[spawnRow][col] = tile;
        spawned.push(tile);
      }
    }

    return { moved, spawned };
  }

  /**
   * Destroy all tile sprites and reset the grid matrix.
   */
  clear(): void {
    this.grid.flat().forEach((tile) => tile?.sprite.destroy());
    this.grid = [];
  }

  private pickTypeForCell(row: number, col: number): number {
    let type = Math.floor(Math.random() * this.tileTypes);
    while (this.createsMatch(row, col, type)) {
      type = Math.floor(Math.random() * this.tileTypes);
    }
    return type;
  }

  private createsMatch(row: number, col: number, type: number): boolean {
    const left1 = this.grid[row]?.[col - 1];
    const left2 = this.grid[row]?.[col - 2];
    const up1 = this.grid[row - 1]?.[col];
    const up2 = this.grid[row - 2]?.[col];
    if (
      this.minMatch <= 3 &&
      left1 &&
      left2 &&
      !left1.special &&
      !left2.special &&
      left1.type === type &&
      left2.type === type
    ) {
      return true;
    }
    if (
      this.minMatch <= 3 &&
      up1 &&
      up2 &&
      !up1.special &&
      !up2.special &&
      up1.type === type &&
      up2.type === type
    ) {
      return true;
    }
    return false;
  }

  private inBounds(row: number, col: number): boolean {
    return row >= 0 && row < this.size && col >= 0 && col < this.size;
  }

  private localMatchExistsAt(row: number, col: number): boolean {
    const tile = this.grid[row]?.[col];
    if (!tile || tile.special) return false;
    const type = tile.type;

    let count = 1;
    for (let c = col - 1; c >= 0 && this.grid[row][c]?.type === type && !this.grid[row][c]?.special; c -= 1) count += 1;
    for (let c = col + 1; c < this.size && this.grid[row][c]?.type === type && !this.grid[row][c]?.special; c += 1) count += 1;
    if (count >= this.minMatch) return true;

    count = 1;
    for (let r = row - 1; r >= 0 && this.grid[r][col]?.type === type && !this.grid[r][col]?.special; r -= 1) count += 1;
    for (let r = row + 1; r < this.size && this.grid[r][col]?.type === type && !this.grid[r][col]?.special; r += 1) count += 1;
    return count >= this.minMatch;
  }
}
