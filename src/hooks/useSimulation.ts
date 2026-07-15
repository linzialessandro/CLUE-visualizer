import { useCallback, useMemo, useRef, useState } from 'react';
import type { Individual } from '../engine/axiom';
import {
  createHistory,
  advanceStep,
  runToCompletion,
  type SimulationHistory,
} from '../engine/simulation';

export interface UseSimulationReturn {
  /** The full simulation history */
  history: SimulationHistory;
  /** The currently viewed time step index */
  currentStep: number;
  /** Total number of computed steps */
  totalSteps: number;
  /** Whether the simulation is auto-playing */
  isRunning: boolean;
  /** Whether all agents have converged */
  isConverged: boolean;
  /** Whether the simulation made no progress in the last step */
  isStalled: boolean;
  /** Advance by one step */
  step: () => void;
  /** Run to completion */
  runAll: () => void;
  /** Start/stop auto-play */
  toggleRun: () => void;
  /** Jump to a specific time step */
  seekTo: (t: number) => void;
  /** Reset the simulation with new individuals */
  reset: (individuals: Individual[]) => void;
  /** Set the playback speed multiplier */
  setSpeed: (speed: number) => void;
  /** Current playback speed */
  speed: number;
}

/**
 * Hook that manages the full simulation lifecycle:
 * - Steps, auto-play, rewind, seek
 * - Stores complete history for timeline scrubbing
 */
export function useSimulation(initialIndividuals: Individual[]): UseSimulationReturn {
  const [history, setHistory] = useState<SimulationHistory>(() =>
    createHistory(initialIndividuals),
  );
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(1);
  const rafRef = useRef<number | null>(null);
  const lastFrameRef = useRef<number>(0);

  const totalSteps = history.steps.length;
  const lastStep = history.steps[totalSteps - 1];
  const isConverged = lastStep.cohort.convergedCount === lastStep.individuals.length;
  const isStalled =
    totalSteps > 1 &&
    lastStep.exchanges.length === 0 &&
    !isConverged;

  /* ── Single step ───────────────────────────────────────────── */
  const step = useCallback(() => {
    setHistory(prev => {
      const prevLast = prev.steps[prev.steps.length - 1];
      const allDone =
        prevLast.cohort.convergedCount === prevLast.individuals.length;
      if (allDone) return prev;

      const next = advanceStep(prev);
      if (next === prev) return prev; // no change
      return next;
    });
    setCurrentStep(prev => prev + 1);
  }, []);

  /* ── Run all ───────────────────────────────────────────────── */
  const runAll = useCallback(() => {
    setHistory(prev => {
      const result = runToCompletion(prev);
      setCurrentStep(result.steps.length - 1);
      return result;
    });
    setIsRunning(false);
  }, []);

  /* ── Auto-play toggle ──────────────────────────────────────── */
  const toggleRun = useCallback(() => {
    setIsRunning(prev => {
      const next = !prev;
      if (next) {
        // Start auto-play
        lastFrameRef.current = performance.now();
        const loop = (now: number) => {
          const elapsed = now - lastFrameRef.current;
          // Speed: steps per second (1x = 2 steps/sec, 5x = 10/sec, etc.)
          const interval = 1000 / (2 * speed);
          if (elapsed >= interval) {
            lastFrameRef.current = now;
            setHistory(prev => {
              const prevLast = prev.steps[prev.steps.length - 1];
              const allDone =
                prevLast.cohort.convergedCount === prevLast.individuals.length;
              if (allDone || prevLast.exchanges.length === 0) {
                setIsRunning(false);
                return prev;
              }
              const advanced = advanceStep(prev);
              if (advanced === prev) {
                setIsRunning(false);
                return prev;
              }
              setCurrentStep(advanced.steps.length - 1);
              return advanced;
            });
          }
          rafRef.current = requestAnimationFrame(loop);
        };
        rafRef.current = requestAnimationFrame(loop);
      } else {
        // Stop
        if (rafRef.current !== null) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }
      }
      return next;
    });
  }, [speed]);

  /* ── Seek ──────────────────────────────────────────────────── */
  const seekTo = useCallback(
    (t: number) => {
      const clamped = Math.max(0, Math.min(t, totalSteps - 1));
      setCurrentStep(clamped);
    },
    [totalSteps],
  );

  /* ── Reset ─────────────────────────────────────────────────── */
  const reset = useCallback((individuals: Individual[]) => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    setIsRunning(false);
    setHistory(createHistory(individuals));
    setCurrentStep(0);
  }, []);

  return useMemo(
    () => ({
      history,
      currentStep,
      totalSteps,
      isRunning,
      isConverged,
      isStalled,
      step,
      runAll,
      toggleRun,
      seekTo,
      reset,
      setSpeed,
      speed,
    }),
    [
      history, currentStep, totalSteps, isRunning, isConverged,
      isStalled, step, runAll, toggleRun, seekTo, reset, speed,
    ],
  );
}
