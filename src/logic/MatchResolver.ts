import { SpecialType, Tile } from '../types';
import { GridLookup } from './types';

type MatchGroup = { tiles: Tile[]; orientation?: 'row' | 'col'; type?: number };

export type ResolveResult = {
  batches: Set<Tile>[]; // destruction/promotions par vague
  specials: Map<Tile, SpecialType>;
  suppressed: Set<Tile>;
};

export class MatchResolver {
  resolve(groups: MatchGroup[], initialTiles: Set<Tile>, grid: GridLookup, lastSwap?: Tile[]): ResolveResult {
    const specials = this.computeSpecialAssignments(groups, initialTiles, lastSwap);
    const suppressed = this.buildSuppressedSpecials(initialTiles, specials);
    const batches = this.buildSpecialStages(initialTiles, specials, suppressed, grid);
    return { batches, specials, suppressed };
  }

  private computeSpecialAssignments(groups: MatchGroup[], allTiles: Set<Tile>, lastSwap?: Tile[]): Map<Tile, SpecialType> {
    const specials = new Map<Tile, SpecialType>();
    const rowGroups = groups.filter((g) => g.orientation === 'row' && g.type !== undefined);
    const colGroups = groups.filter((g) => g.orientation === 'col' && g.type !== undefined);

    // Straight lines
    [...rowGroups, ...colGroups].forEach((group) => {
      const length = group.tiles.length;
      if (length < 4 || !group.orientation) return;
      const origin = this.pickSpecialOrigin(group.tiles, lastSwap);
      if (!origin) return;
      if (length >= 5) {
        specials.set(origin, 'nova');
      } else if (length === 4) {
        specials.set(origin, group.orientation === 'row' ? 'line-h' : 'line-v');
      }
    });

    // L / T / croix : intersection row + col même couleur total >=5 -> nova
    rowGroups.forEach((r) => {
      colGroups
        .filter((c) => c.type === r.type && c.tiles.some((t) => r.tiles.includes(t)))
        .forEach((c) => {
          const union = new Set<Tile>([...r.tiles, ...c.tiles]);
          if (union.size >= 5) {
            const origin = this.pickSpecialOrigin([...union], lastSwap);
            if (origin) specials.set(origin, 'nova');
          }
        });
    });

    // Supernova : 3+ nova specials matchés ensemble
    const novaTiles = [...allTiles].filter((t) => t.special === 'nova');
    if (novaTiles.length >= 3) {
      const origin = this.pickSpecialOrigin(novaTiles, lastSwap);
      if (origin) specials.set(origin, 'supernova');
    }
    return specials;
  }

  private pickSpecialOrigin(groupTiles: Tile[], lastSwap?: Tile[]): Tile | null {
    if (lastSwap) {
      const found = lastSwap.find((t) => groupTiles.includes(t));
      if (found) return found;
    }
    return groupTiles[0] ?? null;
  }

  private buildSpecialStages(base: Set<Tile>, assignments: Map<Tile, SpecialType>, suppressed: Set<Tile>, grid: GridLookup): Set<Tile>[] {
    const steps: Set<Tile>[] = [];
    const seen = new Set<Tile>(base);
    steps.push(new Set<Tile>(base));

    let queue: Tile[] = [...base].filter((t) => t.special && !suppressed.has(t));

    while (queue.length > 0) {
      const nextWave = new Set<Tile>();
      const push = (t: Tile | null) => {
        if (!t || seen.has(t)) return;
        seen.add(t);
        nextWave.add(t);
      };

      queue.forEach((tile) => {
        if (!tile.special || suppressed.has(tile)) return;
        const { normals, specials } = this.collectSpecialTargets(tile, grid);
        normals.forEach((t) => push(t));
        specials.forEach((t) => {
          if (!suppressed.has(t)) push(t);
        });
      });

      if (nextWave.size === 0) break;

      steps.push(nextWave);
      queue = [...nextWave].filter((t) => t.special && !suppressed.has(t));
    }

    return steps;
  }

  collectSpecialTargets(tile: Tile, grid: GridLookup): { normals: Tile[]; specials: Tile[] } {
    const normals: Tile[] = [];
    const specials: Tile[] = [];
    if (!tile.special) return { normals, specials };

    const size = grid.getSize();

    const push = (t: Tile | null) => {
      if (!t) return;
      if (t.special) specials.push(t);
      else normals.push(t);
    };

    if (tile.special === 'supernova') {
      // supernova: chain every other spécial; color purge géré dans la scène
      for (let r = 0; r < size; r += 1) {
        for (let c = 0; c < size; c += 1) {
          const target = grid.getTile(r, c);
          if (target && target !== tile && target.special) specials.push(target);
        }
      }
      return { normals, specials };
    }

    if (tile.special === 'line-h') {
      for (let c = 0; c < size; c += 1) {
        push(grid.getTile(tile.row, c));
      }
    } else if (tile.special === 'line-v') {
      for (let r = 0; r < size; r += 1) {
        push(grid.getTile(r, tile.col));
      }
    } else if (tile.special === 'nova') {
      for (let dr = -1; dr <= 1; dr += 1) {
        for (let dc = -1; dc <= 1; dc += 1) {
          const r = tile.row + dr;
          const c = tile.col + dc;
          if (r >= 0 && r < size && c >= 0 && c < size) {
            push(grid.getTile(r, c));
          }
        }
      }
    }

    return { normals, specials };
  }

  private buildSuppressedSpecials(allTiles: Set<Tile>, assignments: Map<Tile, SpecialType>): Set<Tile> {
    const suppressed = new Set<Tile>();
    if ([...assignments.values()].includes('supernova')) {
      allTiles.forEach((t) => {
        if (t.special === 'nova') suppressed.add(t);
      });
      const supernovaTile = [...assignments.keys()].find((t) => assignments.get(t) === 'supernova');
      if (supernovaTile && suppressed.has(supernovaTile)) suppressed.delete(supernovaTile);
    }
    return suppressed;
  }
}
