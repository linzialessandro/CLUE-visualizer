import { useMemo } from 'react';
import type { Individual } from '../../engine/axiom';
import { minDivergingIndex } from '../../engine/baire-metric';
import type { ExchangeEvent } from '../../engine/axiom';
import MathBlock from '../shared/MathBlock';
import './ConceptionGrid.css';

interface ConceptionGridProps {
  individuals: Individual[];
  /** Exchanges that occurred at the current step (to highlight swapped cells) */
  exchanges?: ExchangeEvent[];
  /** If true, show a compact version without ideals */
  compact?: boolean;
}

const CHART_COLORS = [
  'var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)',
  'var(--chart-5)', 'var(--chart-6)', 'var(--chart-7)', 'var(--chart-8)',
];

/**
 * ConceptionGrid — Matrix view of all agents' current sequences.
 *
 * Rows = agents, Columns = sequence positions.
 * Cells are colored by match status:
 *   ✓ Green: matches ideal
 *   ✗ Rose:  diverges from ideal
 *   ★ Amber: minimal diverging index (next exchange target)
 *   ⟷ Gold border: just exchanged
 */
export default function ConceptionGrid({ individuals, exchanges = [], compact = false }: ConceptionGridProps) {
  const seqLength = individuals.length > 0 ? individuals[0].currentConception.length : 0;

  // Pre-compute per-agent data
  const agentData = useMemo(() => {
    return individuals.map(ind => {
      const k = minDivergingIndex(ind.currentConception, ind.idealConception);
      return { ind, k };
    });
  }, [individuals]);

  // Build set of exchanged cells for highlighting
  const exchangedCells = useMemo(() => {
    const set = new Set<string>();
    for (const ex of exchanges) {
      set.add(`${ex.i}-${ex.k}`);
      set.add(`${ex.j}-${ex.k}`);
    }
    return set;
  }, [exchanges]);

  return (
    <div className="conception-grid-wrapper">
      <div className="conception-grid-scroll">
        <table className="conception-grid" role="table">
          <thead>
            <tr>
              <th className="cg-header cg-header--agent">Agent</th>
              {Array.from({ length: seqLength }, (_, n) => (
                <th key={n} className="cg-header cg-header--index">
                  <MathBlock tex={`n_{${n}}`} />
                </th>
              ))}
              <th className="cg-header cg-header--dist">
                <MathBlock tex="d" />
              </th>
            </tr>
          </thead>
          <tbody>
            {agentData.map(({ ind, k }, idx) => {
              const isConverged = k === -1;
              const d = isConverged ? 0 : 1 / (k + 1);

              return (
                <tr
                  key={ind.id}
                  className={`cg-row ${isConverged ? 'cg-row--converged' : ''}`}
                >
                  {/* Agent label */}
                  <td className="cg-agent">
                    <span
                      className="cg-agent__dot"
                      style={{ background: CHART_COLORS[ind.id % CHART_COLORS.length] }}
                    />
                    <MathBlock tex={`i_{${ind.id}}`} />
                  </td>

                  {/* Sequence cells */}
                  {ind.currentConception.map((val, n) => {
                    const idealVal = ind.idealConception[n];
                    const matches = val === idealVal;
                    const isMinK = n === k;
                    const justExchanged = exchangedCells.has(`${idx}-${n}`);

                    let cellClass = 'cg-cell';
                    if (matches) cellClass += ' cg-cell--match';
                    else if (isMinK) cellClass += ' cg-cell--min-k';
                    else cellClass += ' cg-cell--diverge';
                    if (justExchanged) cellClass += ' cg-cell--exchanged';

                    return (
                      <td key={n} className={cellClass}>
                        <span className="cg-cell__value">{val}</span>
                        {!compact && !matches && (
                          <span className="cg-cell__ideal" title={`Ideal: ${idealVal}`}>
                            {idealVal}
                          </span>
                        )}
                      </td>
                    );
                  })}

                  {/* Distance */}
                  <td className="cg-dist">
                    <span className={`cg-dist__value ${isConverged ? 'cg-dist__value--zero' : ''}`}>
                      {isConverged ? '0' : d.toFixed(3)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="cg-legend">
        <span className="cg-legend__item">
          <span className="cg-legend__swatch cg-legend__swatch--match" />
          Matches ideal
        </span>
        <span className="cg-legend__item">
          <span className="cg-legend__swatch cg-legend__swatch--min-k" />
          Min diverging index <MathBlock tex="k" />
        </span>
        <span className="cg-legend__item">
          <span className="cg-legend__swatch cg-legend__swatch--diverge" />
          Diverges
        </span>
        {!compact && (
          <span className="cg-legend__item cg-legend__item--note">
            <small>Small numbers = ideal values</small>
          </span>
        )}
      </div>
    </div>
  );
}
