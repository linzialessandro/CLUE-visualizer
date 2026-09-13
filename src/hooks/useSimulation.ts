import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Individual } from '../engine/axiom';
import {
  createHistory,
  advanceStep,
  runToCompletion,
  type SimulationHistory,
} from '../engine/simulation';

export interface UseSimulationReturn {
  history: SimulationHistory;
  currentStep: number;
  totalSteps: number;
  isRunning: boolean;
  isConverged: boolean;
  isStalled: boolean;
  /** True when the playhead is on the last computed step. */
  atFrontier: boolean;
  /** Play/step are meaningful: either history remains, or a new step can be computed. */
  canPlay: boolean;
  step: () => void;
  runAll: () => void;
  toggleRun: () => void;
  seekTo: (t: number) => void;
  reset: (individuals: Individual[]) => void;
  setSpeed: (speed: number) => void;
  speed: number;
}

function isAllConverged(history: SimulationHistory): boolean {
  const last = history.steps[history.steps.length - 1];
  return last.cohort.convergedCount === last.individuals.length;
}

/**
 * Hook that manages the full simulation lifecycle:
 * stepping, auto-play through recorded history and the frontier, rewind, seek.
 */
export function useSimulation(initialIndividuals: Individual[]): UseSimulationReturn {
  const [history, setHistory] = useState<SimulationHistory>(() =>
    createHistory(initialIndividuals),
  );
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(1);

  const rafRef = useRef<number | null>(null);
  const lastFrameRef = useRef(0);
  const speedRef = useRef(speed);
  const historyRef = useRef(history);
  const currentStepRef = useRef(currentStep);
  const isRunningRef = useRef(isRunning);

  speedRef.current = speed;
  historyRef.current = history;
  currentStepRef.current = currentStep;
  isRunningRef.current = isRunning;

  const totalSteps = history.steps.length;
  const lastStep = history.steps[totalSteps - 1];
  const isConverged = lastStep.cohort.convergedCount === lastStep.individuals.length;
  const isStalled =
    totalSteps > 1 &&
    lastStep.exchanges.length === 0 &&
    !isConverged;
  const atFrontier = currentStep >= totalSteps - 1;
  const canPlay = !atFrontier || (!isConverged && !isStalled);

  const stopLoop = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    isRunningRef.current = false;
    setIsRunning(false);
  }, []);

  /**
   * Advance the playhead by one: replay recorded history if available,
   * otherwise compute a new frontier step. Returns whether playback should continue.
   */
  const advancePlayhead = useCallback((): boolean => {
    const hist = historyRef.current;
    const cur = currentStepRef.current;
    const lastIdx = hist.steps.length - 1;

    if (cur < lastIdx) {
      const next = cur + 1;
      currentStepRef.current = next;
      setCurrentStep(next);
      return true;
    }

    if (isAllConverged(hist)) return false;

    const nextHist = advanceStep(hist);
    if (nextHist === hist) return false;

    historyRef.current = nextHist;
    setHistory(nextHist);
    const newIdx = nextHist.steps.length - 1;
    currentStepRef.current = newIdx;
    setCurrentStep(newIdx);

    const produced = nextHist.steps[newIdx];
    const remaining =
      produced.cohort.convergedCount < produced.individuals.length;
    // A step with no exchanges and remaining distance is a stall: show it, then stop.
    return remaining && produced.exchanges.length > 0;
  }, []);

  const step = useCallback(() => {
    advancePlayhead();
  }, [advancePlayhead]);

  const runAll = useCallback(() => {
    stopLoop();
    setHistory(prev => {
      const result = runToCompletion(prev);
      historyRef.current = result;
      const end = result.steps.length - 1;
      currentStepRef.current = end;
      setCurrentStep(end);
      return result;
    });
  }, [stopLoop]);

  const toggleRun = useCallback(() => {
    if (isRunningRef.current) {
      stopLoop();
      return;
    }

    isRunningRef.current = true;
    setIsRunning(true);
    lastFrameRef.current = performance.now();

    const loop = (now: number) => {
      if (!isRunningRef.current) return;
      const interval = 1000 / (2 * speedRef.current);
      if (now - lastFrameRef.current >= interval) {
        lastFrameRef.current = now;
        const more = advancePlayhead();
        if (!more) {
          stopLoop();
          return;
        }
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
  }, [advancePlayhead, stopLoop]);

  const seekTo = useCallback((t: number) => {
    const lastIdx = historyRef.current.steps.length - 1;
    const clamped = Math.max(0, Math.min(t, lastIdx));
    currentStepRef.current = clamped;
    setCurrentStep(clamped);
  }, []);

  const reset = useCallback((individuals: Individual[]) => {
    stopLoop();
    const next = createHistory(individuals);
    historyRef.current = next;
    currentStepRef.current = 0;
    setHistory(next);
    setCurrentStep(0);
  }, [stopLoop]);

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return useMemo(
    () => ({
      history,
      currentStep,
      totalSteps,
      isRunning,
      isConverged,
      isStalled,
      atFrontier,
      canPlay,
      step,
      runAll,
      toggleRun,
      seekTo,
      reset,
      setSpeed,
      speed,
    }),
    [
      history, currentStep, totalSteps, isRunning, isConverged, isStalled,
      atFrontier, canPlay, step, runAll, toggleRun, seekTo, reset, speed,
    ],
  );
}
