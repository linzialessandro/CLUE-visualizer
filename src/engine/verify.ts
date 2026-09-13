/**
 * Headless checks of the CLUE engine against the paper's illustrations.
 * Run with: npx tsx src/engine/verify.ts
 */
import { distance, formatDistance, minDivergingIndex } from './baire-metric';
import { axiomSatisfied, executeStep } from './axiom';
import { createHistory, runToCompletion } from './simulation';
import { generateScenario, getScenario } from './scenarios';

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

function run(name: string, fn: () => void) {
  fn();
  console.log(`ok  ${name}`);
}

run('Baire metric: agreement and first mismatch', () => {
  assert(distance([1, 2, 3], [1, 2, 3]) === 0, 'equal sequences have d = 0');
  assert(minDivergingIndex([1, 2, 3], [1, 2, 3]) === -1, 'no mismatch');
  assert(distance([2, 3, 1, 5], [1, 3, 1, 5]) === 1, 'mismatch at 0 => d = 1');
  assert(distance([1, 1, 2, 4], [1, 3, 2, 4]) === 1 / 2, 'mismatch at 1 => d = 1/2');
  assert(formatDistance(1) === '1', 'format 1');
  assert(formatDistance(0.5) === '1/2', 'format 1/2');
  assert(formatDistance(0) === '0', 'format 0');
});

run('Paper §3.1 — single exchange', () => {
  const scenario = getScenario('paper-example');
  assert(scenario, 'missing paper-example');
  assert(axiomSatisfied(scenario.individuals), 'axiom should hold at t = 0');
  const { newIndividuals, exchanges } = executeStep(scenario.individuals);
  assert(exchanges.length === 1, 'exactly one exchange');
  assert(exchanges[0].k === 0, 'exchange at k = 0');
  for (const ind of newIndividuals) {
    assert(distance(ind.currentConception, ind.idealConception) === 0, `agent ${ind.id} should have converged`);
  }
});

run('Paper §3.3 — two rounds, mean 1 → 1/2 → 0', () => {
  const scenario = getScenario('paper-3-3');
  assert(scenario, 'missing paper-3-3');
  let hist = createHistory(scenario.individuals);
  assert(hist.steps[0].cohort.mean === 1, 'mean at t = 0 is 1');
  hist = runToCompletion(hist);
  assert(hist.steps.length === 3, `expected 3 records (t = 0,1,2), got ${hist.steps.length}`);
  assert(hist.steps[1].cohort.mean === 0.5, 'mean at t = 1 is 1/2');
  assert(hist.steps[2].cohort.mean === 0, 'mean at t = 2 is 0');
  assert(
    hist.steps[2].cohort.convergedCount === scenario.individuals.length,
    'all four agents converge',
  );
  // prefix monotonicity: k strictly increases until convergence
  for (const agent of scenario.individuals) {
    const ks = hist.steps.map(s => s.snapshots.find(sn => sn.agent === agent.id)!.k);
    for (let t = 1; t < ks.length; t++) {
      if (ks[t - 1] === -1) {
        assert(ks[t] === -1, 'once converged, remains converged');
      } else if (ks[t] !== -1) {
        assert(ks[t] > ks[t - 1], `k should increase for agent ${agent.id}`);
      }
    }
  }
});

run('Community of six converges in 3 steps', () => {
  const scenario = getScenario('community-six');
  assert(scenario, 'missing community-six');
  const hist = runToCompletion(createHistory(scenario.individuals));
  const last = hist.steps[hist.steps.length - 1];
  assert(last.cohort.mean === 0, 'mean 0');
  assert(last.cohort.convergedCount === 6, 'six agents');
  assert(hist.steps.length === 4, 't = 0 plus 3 exchanges');
});

run('Custom generator remains axiom-satisfiable until convergence', () => {
  const individuals = generateScenario(8, 6, 5, 3, 7);
  let hist = createHistory(individuals);
  assert(axiomSatisfied(hist.steps[0].individuals), 'axiom at t = 0');
  hist = runToCompletion(hist);
  const last = hist.steps[hist.steps.length - 1];
  assert(last.cohort.mean === 0, 'generated community converges');
});

console.log('\nAll engine checks passed.');
