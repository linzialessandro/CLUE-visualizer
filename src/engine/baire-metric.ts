/**
 * Baire metric utilities for the CLUE model.
 *
 * The space of conceptions S = ℕ^ℕ (Baire space) admits the metric:
 *   d(x, y) = 0           if x = y
 *   d(x, y) = 1/(k + 1)   if x ≠ y, where k = min{n ∈ ℕ | x_n ≠ y_n}
 *
 * Two sequences are close when they agree on a long initial segment.
 * Discrepancies at earlier indices indicate greater conceptual divergence.
 *
 * Reference: CLUE paper, Section 3 — Formalization of the CLUE model
 */

export type Conception = number[];

/**
 * Returns the minimal diverging index k = min{n | x_n ≠ y_n},
 * or -1 if the sequences agree on all positions.
 */
export function minDivergingIndex(x: Conception, y: Conception): number {
  const len = Math.min(x.length, y.length);
  for (let i = 0; i < len; i++) {
    if (x[i] !== y[i]) return i;
  }
  if (x.length !== y.length) return len;
  return -1;
}

/**
 * Baire metric: d(x, y) = 1/(k + 1) where k = min{n | x_n ≠ y_n}.
 * Returns 0 if the sequences are equal.
 */
export function distance(x: Conception, y: Conception): number {
  const k = minDivergingIndex(x, y);
  return k === -1 ? 0 : 1 / (k + 1);
}

/**
 * Length of the initial agreement segment between two conceptions.
 * If they agree on all positions, returns the sequence length.
 */
export function agreementPrefix(x: Conception, y: Conception): number {
  const k = minDivergingIndex(x, y);
  return k === -1 ? Math.min(x.length, y.length) : k;
}

/**
 * Returns an array of booleans indicating which positions match the ideal.
 */
export function matchMask(current: Conception, ideal: Conception): boolean[] {
  const len = Math.min(current.length, ideal.length);
  const mask: boolean[] = [];
  for (let i = 0; i < len; i++) {
    mask.push(current[i] === ideal[i]);
  }
  return mask;
}

/**
 * Fraction of positions that match the ideal (0 to 1).
 */
export function matchFraction(current: Conception, ideal: Conception): number {
  const mask = matchMask(current, ideal);
  if (mask.length === 0) return 1;
  return mask.filter(Boolean).length / mask.length;
}

/**
 * Format a Baire distance for display.
 * Exact values of the form 1/(k+1) are shown as rationals (1, 1/2, 1/3, …).
 */
export function formatDistance(d: number): string {
  if (d === 0) return '0';
  const inv = 1 / d;
  const rounded = Math.round(inv);
  if (Math.abs(inv - rounded) < 1e-9) {
    return rounded === 1 ? '1' : `1/${rounded}`;
  }
  return d.toFixed(3);
}
