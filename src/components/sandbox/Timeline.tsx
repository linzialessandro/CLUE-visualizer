import type { UseSimulationReturn } from '../../hooks/useSimulation';
import './Timeline.css';

interface TimelineProps {
  sim: UseSimulationReturn;
}

/**
 * Scrubable timeline bar with playback controls.
 */
export default function Timeline({ sim }: TimelineProps) {
  const { currentStep, totalSteps, isRunning, isConverged, isStalled, step, toggleRun, seekTo, runAll, speed, setSpeed } = sim;
  const maxStep = totalSteps - 1;

  return (
    <div className="timeline">
      <div className="timeline__bar">
        <input
          type="range"
          className="timeline__slider"
          min={0}
          max={maxStep}
          value={Math.min(currentStep, maxStep)}
          onChange={e => seekTo(Number(e.target.value))}
          aria-label="Timeline scrubber"
        />
        <div className="timeline__labels">
          <span className="mono">t = {Math.min(currentStep, maxStep)}</span>
          <span className="mono">/ {maxStep}</span>
        </div>
      </div>

      <div className="timeline__controls">
        <div className="btn-group">
          <button
            className="btn btn--icon"
            onClick={step}
            disabled={isConverged || isStalled}
            title="Single step"
            aria-label="Step forward"
          >
            ⏭
          </button>
          <button
            className={`btn btn--icon ${isRunning ? 'btn--primary' : ''}`}
            onClick={toggleRun}
            disabled={isConverged || isStalled}
            title={isRunning ? 'Pause' : 'Play'}
            aria-label={isRunning ? 'Pause' : 'Play'}
          >
            {isRunning ? '⏸' : '▶'}
          </button>
          <button
            className="btn btn--sm"
            onClick={runAll}
            disabled={isConverged || isStalled}
            title="Run to completion"
          >
            Run all
          </button>
        </div>

        <div className="timeline__speed">
          <label className="control-label" htmlFor="speed-select">Speed</label>
          <select
            id="speed-select"
            className="control-select"
            value={speed}
            onChange={e => setSpeed(Number(e.target.value))}
            style={{ width: 64 }}
          >
            <option value={0.5}>0.5×</option>
            <option value={1}>1×</option>
            <option value={2}>2×</option>
            <option value={5}>5×</option>
            <option value={10}>10×</option>
          </select>
        </div>

        <div className="timeline__status">
          {isConverged && <span className="badge badge--converged">✓ All Converged</span>}
          {isStalled && <span className="badge badge--stalled">⚠ No exchanges available</span>}
        </div>
      </div>
    </div>
  );
}
