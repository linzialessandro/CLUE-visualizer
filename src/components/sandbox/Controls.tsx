import { useState, useCallback } from 'react';
import type { Individual } from '../../engine/axiom';
import { SCENARIOS, generateScenario } from '../../engine/scenarios';
import './Controls.css';

interface ControlsProps {
  onApply: (individuals: Individual[]) => void;
}

/**
 * Sidebar parameter panel for the sandbox simulation.
 */
export default function Controls({ onApply }: ControlsProps) {
  const [scenarioId, setScenarioId] = useState('community-six');
  const [N, setN] = useState(6);
  const [L, setL] = useState(6);
  const [V, setV] = useState(6);
  const [depth, setDepth] = useState(3);
  const [seed, setSeed] = useState(42);
  const [mode, setMode] = useState<'preset' | 'random'>('preset');

  const handleApply = useCallback(() => {
    if (mode === 'preset') {
      const scenario = SCENARIOS.find(s => s.id === scenarioId);
      if (scenario) {
        // Deep copy to avoid mutation
        const inds = scenario.individuals.map(ind => ({
          ...ind,
          currentConception: [...ind.currentConception],
          idealConception: [...ind.idealConception],
        }));
        onApply(inds);
      }
    } else {
      const inds = generateScenario(N, L, V, depth, seed);
      onApply(inds);
    }
  }, [mode, scenarioId, N, L, V, depth, seed, onApply]);

  return (
    <div className="controls card">
      <div className="card__title">Configuration</div>

      {/* Mode selector */}
      <div className="controls__tabs">
        <button
          className={`controls__tab ${mode === 'preset' ? 'controls__tab--active' : ''}`}
          onClick={() => setMode('preset')}
        >
          Presets
        </button>
        <button
          className={`controls__tab ${mode === 'random' ? 'controls__tab--active' : ''}`}
          onClick={() => setMode('random')}
        >
          Custom
        </button>
      </div>

      {mode === 'preset' ? (
        <div className="control-group">
          <label className="control-label" htmlFor="scenario-select">Scenario</label>
          <select
            id="scenario-select"
            className="control-select"
            value={scenarioId}
            onChange={e => setScenarioId(e.target.value)}
          >
            {SCENARIOS.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <small className="controls__desc">
            {SCENARIOS.find(s => s.id === scenarioId)?.description}
          </small>
        </div>
      ) : (
        <>
          <div className="control-group">
            <label className="control-label" htmlFor="ctrl-n">
              N — Agents
            </label>
            <input
              id="ctrl-n"
              className="control-input"
              type="number"
              min={2}
              max={50}
              step={2}
              value={N}
              onChange={e => setN(Math.max(2, parseInt(e.target.value) || 2))}
            />
          </div>

          <div className="control-group">
            <label className="control-label" htmlFor="ctrl-l">
              L — Sequence length
            </label>
            <input
              id="ctrl-l"
              className="control-input"
              type="number"
              min={2}
              max={20}
              value={L}
              onChange={e => setL(Math.max(2, parseInt(e.target.value) || 2))}
            />
          </div>

          <div className="control-group">
            <label className="control-label" htmlFor="ctrl-v">
              V — Value range (1…V)
            </label>
            <input
              id="ctrl-v"
              className="control-input"
              type="number"
              min={2}
              max={10}
              value={V}
              onChange={e => setV(Math.max(2, parseInt(e.target.value) || 2))}
            />
          </div>

          <div className="control-group">
            <label className="control-label" htmlFor="ctrl-depth">
              Depth — Diverging positions
            </label>
            <input
              id="ctrl-depth"
              className="control-input"
              type="number"
              min={1}
              max={L}
              value={depth}
              onChange={e => setDepth(Math.max(1, parseInt(e.target.value) || 1))}
            />
          </div>

          <div className="control-group">
            <label className="control-label" htmlFor="ctrl-seed">
              Seed — RNG seed
            </label>
            <input
              id="ctrl-seed"
              className="control-input"
              type="number"
              value={seed}
              onChange={e => setSeed(parseInt(e.target.value) || 0)}
            />
          </div>
        </>
      )}

      <button className="btn btn--primary controls__apply" onClick={handleApply}>
        Apply & Reset
      </button>
    </div>
  );
}
