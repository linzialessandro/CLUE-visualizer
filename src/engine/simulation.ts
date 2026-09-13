/**
 * Simulation runner for the CLUE model.
 *
 * Manages the simulation state, history, and provides time-travel
 * capabilities (rewind to any previous step) for the timeline UI.
 */

import { distance, minDivergingIndex } from './baire-metric';
import { executeStep, allConverged, type Individual, type ExchangeEvent } from './axiom';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface Snapshot {
  /** Time step */
  t: number;
  /** Agent ID */
  agent: number;
  /** d(C_i(t), C*_i) */
  d: number;
  /** Minimal diverging index, or -1 if converged */
  k: number;
}

export interface CohortStats {
  t: number;
  mean: number;
  q25: number;
  q50: number;
  q75: number;
  min: number;
  max: number;
  convergedCount: number;
}

export interface StepRecord {
  t: number;
  individuals: Individual[];
  exchanges: ExchangeEvent[];
  snapshots: Snapshot[];
  cohort: CohortStats;
}

export interface SimulationHistory {
  steps: StepRecord[];
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function quantiles(xs: number[]): { q25: number; q50: number; q75: number } {
  const a = [...xs].sort((p, q) => p - q);
  const q = (p: number) => {
    const idx = (a.length - 1) * p;
    const lo = Math.floor(idx);
    const hi = Math.ceil(idx);
    if (lo === hi) return a[lo];
    const w = idx - lo;
    return a[lo] * (1 - w) + a[hi] * w;
  };
  return { q25: q(0.25), q50: q(0.5), q75: q(0.75) };
}

function computeSnapshots(t: number, individuals: Individual[]): Snapshot[] {
  return individuals.map(ind => ({
    t,
    agent: ind.id,
    d: distance(ind.currentConception, ind.idealConception),
    k: minDivergingIndex(ind.currentConception, ind.idealConception),
  }));
}

function computeCohort(t: number, snapshots: Snapshot[]): CohortStats {
  const ds = snapshots.map(s => s.d);
  if (ds.length === 0) {
    return { t, mean: 0, q25: 0, q50: 0, q75: 0, min: 0, max: 0, convergedCount: 0 };
  }
  const { q25, q50, q75 } = quantiles(ds);
  const convergedCount = snapshots.filter(s => s.d === 0).length;
  return {
    t,
    mean: ds.reduce((a, b) => a + b, 0) / ds.length,
    q25,
    q50,
    q75,
    min: Math.min(...ds),
    max: Math.max(...ds),
    convergedCount,
  };
}

/* ------------------------------------------------------------------ */
/*  Simulation runner                                                  */
/* ------------------------------------------------------------------ */

/**
 * Create the initial simulation history from a set of individuals.
 */
export function createHistory(individuals: Individual[]): SimulationHistory {
  const snapshots = computeSnapshots(0, individuals);
  const cohort = computeCohort(0, snapshots);
  return {
    steps: [{
      t: 0,
      individuals: individuals.map(ind => ({
        ...ind,
        currentConception: [...ind.currentConception],
      })),
      exchanges: [],
      snapshots,
      cohort,
    }],
  };
}

/**
 * Advance the simulation by one step.
 * Returns a new history with the new step appended.
 * If all agents have converged, returns the same history unchanged.
 */
export function advanceStep(history: SimulationHistory): SimulationHistory {
  const lastStep = history.steps[history.steps.length - 1];
  if (allConverged(lastStep.individuals)) return history;

  const t = lastStep.t + 1;
  const { newIndividuals, exchanges } = executeStep(lastStep.individuals);
  const snapshots = computeSnapshots(t, newIndividuals);
  const cohort = computeCohort(t, snapshots);

  return {
    steps: [
      ...history.steps,
      {
        t,
        individuals: newIndividuals,
        exchanges,
        snapshots,
        cohort,
      },
    ],
  };
}

/**
 * Run the simulation to completion (or max steps).
 */
export function runToCompletion(
  history: SimulationHistory,
  maxSteps = 200,
): SimulationHistory {
  let h = history;
  for (let i = 0; i < maxSteps; i++) {
    const next = advanceStep(h);
    if (next === h) break; // no progress (converged or stuck)
    if (next.steps.length === h.steps.length) break; // no new step
    h = next;
  }
  return h;
}

/**
 * Get the step record at a specific time t.
 */
export function getStepAt(history: SimulationHistory, t: number): StepRecord | undefined {
  return history.steps.find(s => s.t === t);
}

/**
 * Get flattened arrays for charting.
 */
export function getChartData(history: SimulationHistory) {
  const allSnapshots = history.steps.flatMap(s => s.snapshots);
  const allCohort = history.steps.map(s => s.cohort);
  const allExchanges = history.steps.flatMap(s => s.exchanges.map(e => ({ ...e, t: s.t })));
  return { snapshots: allSnapshots, cohort: allCohort, exchanges: allExchanges };
}
