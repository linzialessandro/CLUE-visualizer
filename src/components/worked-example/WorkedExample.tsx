import { useMemo, useState } from 'react';
import type { Individual } from '../../engine/axiom';
import { distance, formatDistance, minDivergingIndex } from '../../engine/baire-metric';
import { executeStep } from '../../engine/axiom';
import ConceptionGrid from '../visualizations/ConceptionGrid';
import MathBlock from '../shared/MathBlock';
import './WorkedExample.css';

/**
 * Interactive step-by-step replay of the paper's Worked Example (Section 3.1).
 *
 * Shows two agents with their conceptions, distances, and allows stepping
 * through the exchange with animated transitions.
 */
export default function WorkedExample() {
  const initialIndividuals: Individual[] = useMemo(() => [
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
  ], []);

  const [individuals, setIndividuals] = useState<Individual[]>(initialIndividuals);
  const [stepCount, setStepCount] = useState(0);
  const [lastExchanges, setLastExchanges] = useState<ReturnType<typeof executeStep>['exchanges']>([]);

  const d_i = distance(individuals[0].currentConception, individuals[0].idealConception);
  const d_j = distance(individuals[1].currentConception, individuals[1].idealConception);
  const k_i = minDivergingIndex(individuals[0].currentConception, individuals[0].idealConception);
  const k_j = minDivergingIndex(individuals[1].currentConception, individuals[1].idealConception);
  const isConverged = d_i === 0 && d_j === 0;

  const handleStep = () => {
    if (isConverged) return;
    const { newIndividuals, exchanges } = executeStep(individuals);
    setIndividuals(newIndividuals);
    setLastExchanges(exchanges);
    setStepCount(s => s + 1);
  };

  const handleReset = () => {
    setIndividuals(initialIndividuals);
    setStepCount(0);
    setLastExchanges([]);
  };

  return (
    <div className="worked-example">
      {/* Agent cards */}
      <div className="we-agents">
        <AgentCard
          label="i"
          individual={individuals[0]}
          d={d_i}
          k={k_i}
          color="var(--chart-1)"
        />
        <div className="we-exchange-arrow" aria-hidden="true">
          {isConverged ? (
            <span className="we-check" aria-label="converged">=</span>
          ) : (
            <span className="we-arrows" aria-hidden="true">⇋</span>
          )}
        </div>
        <AgentCard
          label="j"
          individual={individuals[1]}
          d={d_j}
          k={k_j}
          color="var(--chart-2)"
        />
      </div>

      {/* Conception Grid */}
      <div className="we-grid card">
        <div className="card__title">Conception State</div>
        <ConceptionGrid individuals={individuals} exchanges={lastExchanges} />
      </div>

      {/* Controls & Status */}
      <div className="we-controls">
        <div className="we-status">
          <div className="stat">
            <span className="stat__label">Time Step</span>
            <span className="stat__value">{stepCount}</span>
          </div>
          <div className="stat">
            <span className="stat__label">Status</span>
            <span className={`badge ${isConverged ? 'badge--converged' : 'badge--active'}`}>
              {isConverged ? 'Converged' : 'Active'}
            </span>
          </div>
        </div>
        <div className="btn-group">
          {!isConverged && (
            <button className="btn btn--primary" onClick={handleStep}>
              Exchange
            </button>
          )}
          <button className="btn" onClick={handleReset}>Reset</button>
        </div>
      </div>
    </div>
  );
}

/* ── Agent Card sub-component ───────────────────────────────────── */

function AgentCard({
  label,
  individual,
  d,
  k,
  color,
}: {
  label: string;
  individual: Individual;
  d: number;
  k: number;
  color: string;
}) {
  const isConverged = d === 0;

  return (
    <div className={`we-agent-card card ${isConverged ? 'we-agent-card--converged' : ''}`}>
      <div className="we-agent-card__header">
        <span className="we-agent-card__dot" style={{ background: color }} />
        <span className="we-agent-card__label">
          Agent <MathBlock tex={label} />
        </span>
      </div>

      <div className="we-agent-card__sequences">
        <div className="we-seq">
          <span className="we-seq__label">
            <MathBlock tex={`C_{${label}}^*`} /> =
          </span>
          <span className="we-seq__values mono">
            ({individual.idealConception.join(', ')}, …)
          </span>
        </div>
        <div className="we-seq">
          <span className="we-seq__label">
            <MathBlock tex={`C_{${label}}(t)`} /> =
          </span>
          <span className="we-seq__values mono">
            ({individual.currentConception.join(', ')}, …)
          </span>
        </div>
      </div>

      <div className="we-agent-card__metrics">
        <div className="stat">
          <span className="stat__label">
            <MathBlock tex={`d(C_{${label}}, C_{${label}}^*)`} />
          </span>
          <span className={`stat__value ${isConverged ? 'stat__value--zero' : ''}`}>
            {formatDistance(d)}
          </span>
        </div>
        {!isConverged && (
          <div className="stat">
            <span className="stat__label">
              <MathBlock tex="k" />
            </span>
            <span className="stat__value">{k}</span>
          </div>
        )}
      </div>
    </div>
  );
}
