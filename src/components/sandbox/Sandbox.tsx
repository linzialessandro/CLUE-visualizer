import { useCallback, useMemo } from 'react';
import type { Individual } from '../../engine/axiom';
import { formatDistance } from '../../engine/baire-metric';
import { SCENARIOS } from '../../engine/scenarios';
import { useSimulation } from '../../hooks/useSimulation';
import Controls from './Controls';
import Timeline from './Timeline';
import ConceptionGrid from '../visualizations/ConceptionGrid';
import DistanceChart from '../visualizations/DistanceChart';
import DistanceHeatmap from '../visualizations/DistanceHeatmap';
import NetworkGraph from '../visualizations/NetworkGraph';
import './Sandbox.css';

/**
 * Full simulation sandbox with controls, visualizations, and timeline.
 */
export default function Sandbox() {
  const defaultScenario = SCENARIOS.find(s => s.id === 'paper-3-3') ?? SCENARIOS[0];
  const defaultIndividuals = useMemo(() =>
    defaultScenario.individuals.map(ind => ({
      ...ind,
      currentConception: [...ind.currentConception],
      idealConception: [...ind.idealConception],
    })),
  [defaultScenario],
  );

  const sim = useSimulation(defaultIndividuals);
  const { history, currentStep, totalSteps, reset } = sim;

  // Get the state at the currently viewed step
  const stepIdx = Math.min(currentStep, totalSteps - 1);
  const currentStepData = history.steps[stepIdx];
  const individuals = currentStepData.individuals;
  const exchanges = currentStepData.exchanges;
  const cohort = currentStepData.cohort;

  const handleApply = useCallback(
    (newIndividuals: Individual[]) => {
      reset(newIndividuals);
    },
    [reset],
  );

  return (
    <div className="sandbox">
      <div className="sandbox-layout">
        {/* Sidebar */}
        <div className="sandbox-sidebar">
          <Controls onApply={handleApply} />

          {/* Stats */}
          <div className="card sandbox-stats">
            <div className="card__title">Statistics</div>
            <div className="stat-row">
              <div className="stat">
                <span className="stat__label">Step</span>
                <span className="stat__value">{stepIdx}</span>
              </div>
              <div className="stat">
                <span className="stat__label">Converged</span>
                <span className="stat__value">
                  {cohort.convergedCount}/{individuals.length}
                </span>
              </div>
            </div>
            <div className="stat-row" style={{ marginTop: 'var(--space-3)' }}>
              <div className="stat">
                <span className="stat__label">Mean d</span>
                <span className="stat__value">{formatDistance(cohort.mean)}</span>
              </div>
              <div className="stat">
                <span className="stat__label">Exchanges</span>
                <span className="stat__value">{exchanges.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main visualization area */}
        <div className="sandbox-main">
          {/* Conception Grid */}
          <div className="card">
            <div className="card__title">Conception Grid</div>
            <ConceptionGrid
              individuals={individuals}
              exchanges={exchanges}
              compact={individuals.length > 8}
            />
          </div>

          {/* Charts row */}
          <div className="chart-grid">
            <div className="card">
              <div className="card__title">Distance to ideal</div>
              <DistanceChart history={history} currentStep={stepIdx} />
            </div>
            <div className="card">
              <div className="card__title">Interaction network</div>
              <NetworkGraph history={history} currentStep={stepIdx} />
            </div>
          </div>

          {/* Heatmap (full width) */}
          <div className="card">
            <div className="card__title">Distance heatmap</div>
            <DistanceHeatmap history={history} currentStep={stepIdx} />
          </div>

          {/* Timeline */}
          <Timeline sim={sim} />
        </div>
      </div>
    </div>
  );
}
