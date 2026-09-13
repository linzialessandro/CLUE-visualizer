/**
 * Core axiom — Necessary and Reciprocal Exchange
 *
 * For each individual i, at each time t, if C_i* ≠ C_i(t), then there exists
 * an individual j such that C_j* ≠ C_j(t) and the exchange at index
 * k = min{n | C*_{i,n} ≠ C_{i,n}(t)} yields:
 *   d(C*_i, C_i(t+1)) < d(C*_i, C_i(t))  AND  d(C*_j, C_j(t+1)) < d(C*_j, C_j(t))
 *
 * CORRECTNESS NOTE: The old implementation only checked that j holds i's needed
 * value. The corrected version verifies mutual benefit — both agents must have
 * the SAME minimal diverging index k, and each must hold the other's ideal
 * value at that position. This is the only configuration where a single-index
 * swap can strictly decrease both distances.
 *
 * Reference: CLUE paper, Section 3 — The core axiom and convergence theorem
 */

import { type Conception, distance, minDivergingIndex } from './baire-metric';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface Individual {
  id: number;
  idealConception: Conception;
  currentConception: Conception;
}

export interface ExchangeEvent {
  /** Index of the first agent in the individuals array */
  i: number;
  /** Index of the second agent in the individuals array */
  j: number;
  /** The sequence position at which the exchange occurs */
  k: number;
  /** d(C*_i, C_i) before the exchange */
  d_i_before: number;
  /** d(C*_i, C_i) after the exchange */
  d_i_after: number;
  /** d(C*_j, C_j) before the exchange */
  d_j_before: number;
  /** d(C*_j, C_j) after the exchange */
  d_j_after: number;
}

/* ------------------------------------------------------------------ */
/*  Core logic                                                         */
/* ------------------------------------------------------------------ */

/**
 * Search for a partner j that satisfies Axiom 1 for individual i.
 *
 * Returns an ExchangeEvent describing the mutually beneficial exchange,
 * or null if no such partner exists among the available individuals.
 *
 * The mutual-benefit condition requires:
 *   1. j has not reached its ideal (C_j(t) ≠ C*_j)
 *   2. k_i = k_j (both share the same minimal diverging index)
 *   3. C_{j,k}(t) = C*_{i,k}  (j holds what i needs)
 *   4. C_{i,k}(t) = C*_{j,k}  (i holds what j needs)
 *
 * When all four conditions hold, swapping at index k corrects both agents
 * at their most fundamental level of divergence simultaneously.
 */
export function findBeneficialPartner(
  iIdx: number,
  individuals: ReadonlyArray<Individual>,
  exclude?: ReadonlySet<number>,
): ExchangeEvent | null {
  const indI = individuals[iIdx];
  const k_i = minDivergingIndex(indI.currentConception, indI.idealConception);
  if (k_i === -1) return null; // already at ideal

  const d_i_before = distance(indI.currentConception, indI.idealConception);

  for (let jIdx = 0; jIdx < individuals.length; jIdx++) {
    if (jIdx === iIdx) continue;
    if (exclude?.has(jIdx)) continue;

    const indJ = individuals[jIdx];
    const k_j = minDivergingIndex(indJ.currentConception, indJ.idealConception);

    // Condition 1: j must not be at ideal
    if (k_j === -1) continue;
    // Condition 2: same minimal diverging index
    if (k_j !== k_i) continue;

    const k = k_i;

    // Conditions 3 & 4: mutual complementarity at index k
    if (
      indJ.currentConception[k] === indI.idealConception[k] &&
      indI.currentConception[k] === indJ.idealConception[k]
    ) {
      // Verify distances actually decrease (should always be true given conditions,
      // but we verify explicitly for safety)
      const newCI = [...indI.currentConception];
      const newCJ = [...indJ.currentConception];
      newCI[k] = indJ.currentConception[k];
      newCJ[k] = indI.currentConception[k];

      const d_i_after = distance(newCI, indI.idealConception);
      const d_j_before = distance(indJ.currentConception, indJ.idealConception);
      const d_j_after = distance(newCJ, indJ.idealConception);

      if (d_i_after < d_i_before && d_j_after < d_j_before) {
        return { i: iIdx, j: jIdx, k, d_i_before, d_i_after, d_j_before, d_j_after };
      }
    }
  }

  return null;
}

/**
 * Execute a single simulation step per Axiom 1.
 *
 * Scans all individuals and identifies all mutually beneficial exchange pairs
 * from the CURRENT state (snapshot semantics). Each agent participates in at
 * most one exchange per step. All exchanges are then applied simultaneously.
 *
 * Returns the updated individuals and all exchanges that occurred.
 */
export function executeStep(individuals: ReadonlyArray<Individual>): {
  newIndividuals: Individual[];
  exchanges: ExchangeEvent[];
} {
  // Phase 1: Find all exchanges based on the current state (snapshot)
  const exchanges: ExchangeEvent[] = [];
  const claimed = new Set<number>();

  for (let iIdx = 0; iIdx < individuals.length; iIdx++) {
    if (claimed.has(iIdx)) continue;

    const result = findBeneficialPartner(iIdx, individuals, claimed);
    if (!result) continue;

    claimed.add(iIdx);
    claimed.add(result.j);
    exchanges.push(result);
  }

  // Phase 2: Apply all exchanges simultaneously to produce the next state
  const newIndividuals = individuals.map(ind => ({
    ...ind,
    currentConception: [...ind.currentConception],
  }));

  for (const ex of exchanges) {
    const temp = newIndividuals[ex.i].currentConception[ex.k];
    newIndividuals[ex.i].currentConception[ex.k] =
      newIndividuals[ex.j].currentConception[ex.k];
    newIndividuals[ex.j].currentConception[ex.k] = temp;
  }

  return { newIndividuals, exchanges };
}

/**
 * Check whether all individuals have reached their ideal conceptions.
 */
export function allConverged(individuals: ReadonlyArray<Individual>): boolean {
  return individuals.every(
    ind => minDivergingIndex(ind.currentConception, ind.idealConception) === -1,
  );
}

/**
 * Check whether the axiom is satisfiable for a given configuration:
 * for every individual not at ideal, does a beneficial partner exist?
 */
export function axiomSatisfied(individuals: ReadonlyArray<Individual>): boolean {
  for (let i = 0; i < individuals.length; i++) {
    const k = minDivergingIndex(
      individuals[i].currentConception,
      individuals[i].idealConception,
    );
    if (k === -1) continue; // at ideal, skip

    const partner = findBeneficialPartner(i, individuals);
    if (!partner) return false;
  }
  return true;
}
