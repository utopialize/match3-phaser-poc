import { Tile } from '../types';

export class GridManager {
  private size: number;
  private tileTypes: number;
  grid: (Tile | null)[][];

  constructor(size: number, tileTypes: number) {
    this.size = size;
    this.tileTypes = tileTypes;
    this.grid = [];
  }

  getTile(row: number, col: number): Tile | null {
    return this.grid[row]?.[col] ?? null;
  }

  getGrid(): (Tile | null)[][] {
    return this.grid;
  }

  getSize(): number {
    return this.size;
  }

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

  matchExistsAt(row: number, col: number): boolean {
    return this.localMatchExistsAt(row, col);
  }

  hasPossibleMoves(): boolean {
    for (let row = 0; row < this.size; row += 1) {
      for (let col = 0; col < this.size; col += 1) {
        if (this.checkSwapForMatch(row, col, row, col + 1)) return true;
        if (this.checkSwapForMatch(row, col, row + 1, col)) return true;
      }
    }
    return false;
  }

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

  findNovaMatch(): Set<Tile> {
    const result = new Set<Tile>();
    // rows
    for (let row = 0; row < this.size; row += 1) {
      let streak: Tile[] = [];
      for (let col = 0; col < this.size; col += 1) {
        const tile = this.grid[row][col];
        if (!tile || tile.special !== 'nova') {
          if (streak.length >= 3) streak.forEach((t) => result.add(t));
          streak = [];
          continue;
        }
        streak.push(tile);
      }
      if (streak.length >= 3) streak.forEach((t) => result.add(t));
    }
    // cols
    for (let col = 0; col < this.size; col += 1) {
      let streak: Tile[] = [];
      for (let row = 0; row < this.size; row += 1) {
        const tile = this.grid[row][col];
        if (!tile || tile.special !== 'nova') {
          if (streak.length >= 3) streak.forEach((t) => result.add(t));
          streak = [];
          continue;
        }
        streak.push(tile);
      }
      if (streak.length >= 3) streak.forEach((t) => result.add(t));
    }
    return result;
  }

  findMatchGroups(): { tiles: Tile[]; orientation: 'row' | 'col'; type: number }[] {
    const groups: { tiles: Tile[]; orientation: 'row' | 'col'; type: number }[] = [];
    // Rows
    for (let row = 0; row < this.size; row += 1) {
      let streak: Tile[] = [];
      for (let col = 0; col < this.size; col += 1) {
        const tile = this.grid[row][col];
        if (!tile || tile.special) {
          if (streak.length >= 3) groups.push({ tiles: [...streak], orientation: 'row', type: streak[0].type });
          streak = [];
          continue;
        }
        if (streak.length === 0 || streak[streak.length - 1].type === tile.type) {
          streak.push(tile);
        } else {
          if (streak.length >= 3) groups.push({ tiles: [...streak], orientation: 'row', type: streak[0].type });
          streak = [tile];
        }
      }
      if (streak.length >= 3) groups.push({ tiles: [...streak], orientation: 'row', type: streak[0].type });
    }
    // Columns
    for (let col = 0; col < this.size; col += 1) {
      let streak: Tile[] = [];
      for (let row = 0; row < this.size; row += 1) {
        const tile = this.grid[row][col];
        if (!tile || tile.special) {
          if (streak.length >= 3) groups.push({ tiles: [...streak], orientation: 'col', type: streak[0].type });
          streak = [];
          continue;
        }
        if (streak.length === 0 || streak[streak.length - 1].type === tile.type) {
          streak.push(tile);
        } else {
          if (streak.length >= 3) groups.push({ tiles: [...streak], orientation: 'col', type: streak[0].type });
          streak = [tile];
        }
      }
      if (streak.length >= 3) groups.push({ tiles: [...streak], orientation: 'col', type: streak[0].type });
    }
    return groups;
  }

  applyGravity(spawn: (row: number, col: number, type: number) => Tile): { moved: Tile[]; spawned: Tile[] } {
    const moved: Tile[] = [];
    const spawned: Tile[] = [];

    for (let col = 0; col < this.size; col += 1) {
      let empty = 0;
      for (let row = this.size - 1; row >= 0; row -= 1) {
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
    if (left1 && left2 && !left1.special && !left2.special && left1.type === type && left2.type === type) {
      return true;
    }
    if (up1 && up2 && !up1.special && !up2.special && up1.type === type && up2.type === type) {
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
    if (count >= 3) return true;

    count = 1;
    for (let r = row - 1; r >= 0 && this.grid[r][col]?.type === type && !this.grid[r][col]?.special; r -= 1) count += 1;
    for (let r = row + 1; r < this.size && this.grid[r][col]?.type === type && !this.grid[r][col]?.special; r += 1) count += 1;
    return count >= 3;
  }
}
