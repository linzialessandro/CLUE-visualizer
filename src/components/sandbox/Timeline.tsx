import type { UseSimulationReturn } from '../../hooks/useSimulation';
import './Timeline.css';

interface TimelineProps {
  sim: UseSimulationReturn;
}

/**
 * Scrubable timeline with playback controls.
 * Play replays recorded history from the playhead, then computes new steps
 * if the frontier has not yet converged.
 */
export default function Timeline({ sim }: TimelineProps) {
  const {
    currentStep, totalSteps, isRunning, isConverged, isStalled,
    atFrontier, canPlay, step, toggleRun, seekTo, runAll, speed, setSpeed,
  } = sim;
  const maxStep = Math.max(0, totalSteps - 1);
  const playhead = Math.min(currentStep, maxStep);

  return (
    <div className="timeline">
      <div className="timeline__bar">
        <input
          type="range"
          className="timeline__slider"
          min={0}
          max={maxStep}
          value={playhead}
          onChange={e => seekTo(Number(e.target.value))}
          aria-label="Timeline playhead"
        />
        <div className="timeline__labels">
          <span className="mono">t = {playhead}</span>
          <span className="mono">{maxStep === 0 ? 't = 0' : `horizon ${maxStep}`}</span>
        </div>
      </div>

      <div className="timeline__controls">
        <div className="btn-group">
          <button
            className="btn btn--sm"
            onClick={() => seekTo(0)}
            disabled={playhead === 0}
            title="Return playhead to t = 0"
          >
            t = 0
          </button>
          <button
            className="btn btn--sm"
            onClick={step}
            disabled={!canPlay && !isRunning}
            title="Advance one step"
          >
            Step
          </button>
          <button
            className={`btn btn--sm ${isRunning ? 'btn--primary' : ''}`}
            onClick={toggleRun}
            disabled={!canPlay && !isRunning}
            title={isRunning ? 'Pause' : 'Play from playhead'}
          >
            {isRunning ? 'Pause' : 'Play'}
          </button>
          <button
            className="btn btn--sm"
            onClick={runAll}
            disabled={isConverged || isStalled}
            title="Compute the trajectory to convergence"
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
            style={{ width: 72 }}
            aria-label="Playback speed"
          >
            <option value={0.5}>0.5×</option>
            <option value={1}>1×</option>
            <option value={2}>2×</option>
            <option value={5}>5×</option>
            <option value={10}>10×</option>
          </select>
        </div>

        <div className="timeline__status" aria-live="polite">
          {atFrontier && isConverged && <span className="badge badge--converged">All converged</span>}
          {atFrontier && isStalled && <span className="badge badge--stalled">No mutually beneficial exchange</span>}
        </div>
      </div>
    </div>
  );
}
