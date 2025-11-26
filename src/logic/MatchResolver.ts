/**
 * @fileoverview Resolves match groups into destruction and special creation waves.
 * @module src/logic/MatchResolver
 */
import { GAME_CONFIG, RuleConfig } from '../config/GameConfig';
import { SpecialType, Tile } from '../types';
import { GridLookup } from './types';

type MatchGroup = { tiles: Tile[]; orientation?: 'row' | 'col'; type?: number };

export type ResolveResult = {
  batches: Set<Tile>[]; // destruction/promotions par vague
  specials: Map<Tile, SpecialType>;
  suppressed: Set<Tile>;
};

/**
 * Computes special tile assignments and orders their resolution into cascading waves.
 *
 * @example
 * const resolver = new MatchResolver();
 * const result = resolver.resolve(groups, matchedTiles, grid);
 */
export class MatchResolver {
  private rules: RuleConfig;

  /**
   * Build a resolver with the provided rule set.
   *
   * @param rules - Rule configuration controlling match thresholds and radii.
   */
  constructor(rules: RuleConfig = GAME_CONFIG.rules) {
    this.rules = rules;
  }

  /**
   * Resolve raw match groups into batches of destruction and special promotions.
   *
   * @param groups - Matched tile groups with orientation metadata.
   * @param initialTiles - Set of tiles participating in the first wave.
   * @param grid - Grid lookup helpers.
   * @param lastSwap - Optional pair of tiles that were just swapped to bias special origin.
   * @returns Ordered waves of tiles plus special assignments and suppressed specials.
   */
  resolve(groups: MatchGroup[], initialTiles: Set<Tile>, grid: GridLookup, lastSwap?: Tile[]): ResolveResult {
    const specials = this.computeSpecialAssignments(groups, initialTiles, lastSwap);
    const suppressed = this.buildSuppressedSpecials(initialTiles, specials);
    const batches = this.buildSpecialStages(initialTiles, specials, suppressed, grid);
    return { batches, specials, suppressed };
  }

  /**
   * Decide which tiles become specials based on shape (lines, L/T, or nova streaks).
   *
   * @param groups - Raw match groups with orientation.
   * @param allTiles - All tiles involved in the initial match wave.
   * @param lastSwap - Optional last swap to prioritize origins.
   * @returns Mapping of tiles to their assigned special types.
   */
  private computeSpecialAssignments(groups: MatchGroup[], allTiles: Set<Tile>, lastSwap?: Tile[]): Map<Tile, SpecialType> {
    const specials = new Map<Tile, SpecialType>();
    const rowGroups = groups.filter((g) => g.orientation === 'row' && g.type !== undefined);
    const colGroups = groups.filter((g) => g.orientation === 'col' && g.type !== undefined);

    // Straight lines
    [...rowGroups, ...colGroups].forEach((group) => {
      const length = group.tiles.length;
      if (length < this.rules.lineMatchLength || !group.orientation) return;
      const origin = this.pickSpecialOrigin(group.tiles, lastSwap);
      if (!origin) return;
      if (length >= this.rules.novaMatchLength) {
        specials.set(origin, 'nova');
      } else if (length === this.rules.lineMatchLength) {
        specials.set(origin, group.orientation === 'row' ? 'line-h' : 'line-v');
      }
    });

    // L / T / cross patterns: intersection of row+col of same type large enough yields nova.
    rowGroups.forEach((r) => {
      colGroups
        .filter((c) => c.type === r.type && c.tiles.some((t) => r.tiles.includes(t)))
        .forEach((c) => {
          const union = new Set<Tile>([...r.tiles, ...c.tiles]);
          if (union.size >= this.rules.novaMatchLength) {
            const origin = this.pickSpecialOrigin([...union], lastSwap);
            if (origin) specials.set(origin, 'nova');
          }
        });
    });

    // Supernova: multiple novas combined in the same wave.
    const novaTiles = [...allTiles].filter((t) => t.special === 'nova');
    if (novaTiles.length >= this.rules.supernovaNovaCount) {
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

  /**
   * Build wave-ordered sets of tiles affected by specials firing off each other.
   *
   * @param base - Tiles in the initial match wave.
   * @param assignments - Special upgrades to apply on first wave.
   * @param suppressed - Specials that should not trigger due to supernova dominance.
   * @param grid - Grid helper for neighbor lookups.
   * @returns Ordered batches of tiles to process sequentially.
   */
  private buildSpecialStages(base: Set<Tile>, assignments: Map<Tile, SpecialType>, suppressed: Set<Tile>, grid: GridLookup): Set<Tile>[] {
    const steps: Set<Tile>[] = [];
    const seen = new Set<Tile>(base);
    steps.push(new Set<Tile>(base));

    // BFS-like expansion: gather new tiles hit by each special wave until no new ones appear.
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

  /**
   * Collect all tiles targeted by a special tile firing (normals vs specials separated).
   *
   * @param tile - Special tile that is firing.
   * @param grid - Grid lookup used to fetch neighbors and lines.
   * @returns Normal and special targets hit by the special.
   */
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
      // Supernova chains every other special on the board; color purge handled by the scene.
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
      for (let dr = -this.rules.novaBlastRadius; dr <= this.rules.novaBlastRadius; dr += 1) {
        for (let dc = -this.rules.novaBlastRadius; dc <= this.rules.novaBlastRadius; dc += 1) {
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
