/**
 * Pre-built scenarios for the CLUE model.
 *
 * Each scenario is carefully constructed so that Axiom 1 is satisfiable:
 * for every agent not at ideal, a mutually beneficial partner exists.
 */

import type { Individual } from './axiom';

export interface Scenario {
  id: string;
  name: string;
  description: string;
  individuals: Individual[];
}

/* ------------------------------------------------------------------ */
/*  Paper Worked Example — Section 3.1                                 */
/* ------------------------------------------------------------------ */

const paperExample: Scenario = {
  id: 'paper-example',
  name: 'Paper §3.1 — Two Agents',
  description:
    'Exact reproduction of the worked example from Section 3.1. ' +
    'Two agents converge to their ideals in a single exchange.',
  individuals: [
    {
      id: 0,
      idealConception:   [2, 3, 1, 5],
      currentConception: [1, 3, 1, 5],
    },
    {
      id: 1,
      idealConception:   [1, 4, 2, 3],
      currentConception: [2, 4, 2, 3],
    },
  ],
};

/* ------------------------------------------------------------------ */
/*  Two-Step Chain — 4 agents, 2 time steps                            */
/* ------------------------------------------------------------------ */

const twoStepChain: Scenario = {
  id: 'two-step-chain',
  name: 'Two-Step Chain — 4 Agents',
  description:
    'Two pairs exchange at k=0 in step 1, then at k=1 in step 2. ' +
    'Demonstrates sequential convergence.',
  individuals: [
    {
      id: 0,
      idealConception:   [1, 3, 2, 4],
      currentConception: [2, 1, 2, 4],
    },
    {
      id: 1,
      idealConception:   [2, 1, 3, 4],
      currentConception: [1, 3, 3, 4],
    },
    {
      id: 2,
      idealConception:   [3, 4, 1, 2],
      currentConception: [4, 2, 1, 2],
    },
    {
      id: 3,
      idealConception:   [4, 2, 3, 1],
      currentConception: [3, 4, 3, 1],
    },
  ],
};

/* ------------------------------------------------------------------ */
/*  Community of Six — staggered convergence                           */
/* ------------------------------------------------------------------ */

const communitySix: Scenario = {
  id: 'community-six',
  name: 'Community of Six',
  description:
    'Six agents with staggered convergence times: one pair converges ' +
    'in 1 step, another in 2, and a third in 3. Shows transient ' +
    'group dynamics.',
  individuals: [
    // Pair A: diverge at k=0,1,2 → converge in 3 steps
    {
      id: 0,
      idealConception:   [1, 2, 3, 4, 5, 6],
      currentConception: [2, 1, 4, 4, 5, 6],
    },
    {
      id: 1,
      idealConception:   [2, 1, 4, 3, 5, 6],
      currentConception: [1, 2, 3, 3, 5, 6],
    },
    // Pair B: diverge at k=0,1 → converge in 2 steps
    {
      id: 2,
      idealConception:   [3, 5, 1, 2, 4, 6],
      currentConception: [4, 3, 1, 2, 4, 6],
    },
    {
      id: 3,
      idealConception:   [4, 3, 2, 1, 5, 6],
      currentConception: [3, 5, 2, 1, 5, 6],
    },
    // Pair C: diverge at k=0 → converge in 1 step
    {
      id: 4,
      idealConception:   [5, 6, 1, 2, 3, 4],
      currentConception: [6, 6, 1, 2, 3, 4],
    },
    {
      id: 5,
      idealConception:   [6, 5, 2, 1, 4, 3],
      currentConception: [5, 5, 2, 1, 4, 3],
    },
  ],
};

/* ------------------------------------------------------------------ */
/*  Large Community — 10 agents, rich dynamics                         */
/* ------------------------------------------------------------------ */

const largeCommunity: Scenario = {
  id: 'large-community',
  name: 'Large Community — 10 Agents',
  description:
    'Ten agents with varying depths of divergence. ' +
    'Shows complex convergence patterns across multiple time steps.',
  individuals: [
    // Pair 1: diverge at k=0,1,2,3 → 4 steps
    { id: 0, idealConception: [1,2,3,4,5,6,7,8], currentConception: [2,1,4,3,5,6,7,8] },
    { id: 1, idealConception: [2,1,4,3,6,5,8,7], currentConception: [1,2,3,4,6,5,8,7] },
    // Pair 2: diverge at k=0,1,2 → 3 steps
    { id: 2, idealConception: [3,4,5,6,1,2,7,8], currentConception: [4,3,6,6,1,2,7,8] },
    { id: 3, idealConception: [4,3,6,5,2,1,8,7], currentConception: [3,4,5,5,2,1,8,7] },
    // Pair 3: diverge at k=0,1 → 2 steps
    { id: 4, idealConception: [5,6,1,2,3,4,7,8], currentConception: [6,5,1,2,3,4,7,8] },
    { id: 5, idealConception: [6,5,2,1,4,3,8,7], currentConception: [5,6,2,1,4,3,8,7] },
    // Pair 4: diverge at k=0 → 1 step
    { id: 6, idealConception: [7,8,1,2,3,4,5,6], currentConception: [8,8,1,2,3,4,5,6] },
    { id: 7, idealConception: [8,7,2,1,4,3,6,5], currentConception: [7,7,2,1,4,3,6,5] },
    // Pair 5: diverge at k=0,1 → 2 steps
    { id: 8, idealConception: [1,4,7,2,5,8,3,6], currentConception: [3,1,7,2,5,8,3,6] },
    { id: 9, idealConception: [3,1,8,7,6,5,4,2], currentConception: [1,4,8,7,6,5,4,2] },
  ],
};

/* ------------------------------------------------------------------ */
/*  Random scenario generator                                          */
/* ------------------------------------------------------------------ */

/** Simple seeded PRNG (LCG) for reproducible scenarios. */
function seededRNG(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (1664525 * s + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

/**
 * Generate a random scenario where agents are created in complementary pairs.
 * Each pair shares exchangeable values, ensuring the axiom is satisfiable.
 *
 * @param N  Number of agents (will be rounded up to even)
 * @param L  Sequence length
 * @param V  Value range (alphabet size: values 1..V)
 * @param depth  Max number of diverging positions per pair (1..L)
 * @param seed  RNG seed for reproducibility
 */
export function generateScenario(
  N: number,
  L: number,
  V: number,
  depth: number,
  seed: number,
): Individual[] {
  const rng = seededRNG(seed);
  const actualN = N % 2 === 0 ? N : N + 1;
  const actualDepth = Math.min(depth, L);
  const individuals: Individual[] = [];

  for (let p = 0; p < actualN; p += 2) {
    // Generate two distinct ideal conceptions
    const idealA: number[] = [];
    const idealB: number[] = [];
    for (let k = 0; k < L; k++) {
      idealA.push(Math.floor(rng() * V) + 1);
      let bVal = Math.floor(rng() * V) + 1;
      // Ensure ideals differ at positions we want to diverge
      if (k < actualDepth) {
        while (bVal === idealA[k]) {
          bVal = (bVal % V) + 1;
        }
      }
      idealB.push(bVal);
    }

    // Create current conceptions by swapping values at diverging positions
    const currentA = [...idealA];
    const currentB = [...idealB];
    for (let k = 0; k < actualDepth; k++) {
      currentA[k] = idealB[k];
      currentB[k] = idealA[k];
    }

    individuals.push(
      { id: p,     idealConception: idealA, currentConception: currentA },
      { id: p + 1, idealConception: idealB, currentConception: currentB },
    );
  }

  return individuals;
}

/* ------------------------------------------------------------------ */
/*  Exports                                                            */
/* ------------------------------------------------------------------ */

export const SCENARIOS: Scenario[] = [
  paperExample,
  twoStepChain,
  communitySix,
  largeCommunity,
];

export function getScenario(id: string): Scenario | undefined {
  return SCENARIOS.find(s => s.id === id);
}
