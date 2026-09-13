import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { SimulationHistory } from '../../engine/simulation';
import { distance } from '../../engine/baire-metric';
import { useContainerWidth } from '../../hooks/useContainerWidth';

const CHART_COLORS = [
  '#3366cc', '#2d9e5f', '#d94452', '#d4952e',
  '#8855cc', '#3399aa', '#cc6633', '#aa3399',
];

interface NetworkGraphProps {
  history: SimulationHistory;
  currentStep: number;
  height?: number;
}

interface NodeDatum {
  id: number;
  d: number;
  converged: boolean;
  x: number;
  y: number;
}

/**
 * Circular layout of agents. Edges record mutually beneficial exchanges
 * up to the current playhead. Positions are deterministic so scrubbing
 * the timeline does not reshuffle the figure.
 */
export default function NetworkGraph({ history, currentStep, height = 320 }: NetworkGraphProps) {
  const { ref: containerRef, width } = useContainerWidth<HTMLDivElement>();
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || width < 40) return;

    const svg = d3.select(svgRef.current);
    svg.attr('width', width).attr('height', height);
    svg.selectAll('*').remove();

    const steps = history.steps;
    if (steps.length === 0) return;

    const stepIdx = Math.min(currentStep, steps.length - 1);
    const currentStepData = steps[stepIdx];
    const individuals = currentStepData.individuals;

    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.max(40, Math.min(width, height) * 0.32);
    const n = individuals.length;

    const nodes: NodeDatum[] = individuals.map((ind, i) => {
      const angle = n === 0 ? 0 : (2 * Math.PI * i) / n - Math.PI / 2;
      const dVal = distance(ind.currentConception, ind.idealConception);
      return {
        id: ind.id,
        d: dVal,
        converged: dVal === 0,
        x: cx + radius * Math.cos(angle),
        y: cy + radius * Math.sin(angle),
      };
    });

    const nodeByIndex = new Map(nodes.map((node, i) => [i, node]));

    const linkMap = new Map<string, { source: number; target: number; count: number; lastT: number }>();
    for (let t = 0; t <= stepIdx; t++) {
      for (const ex of steps[t].exchanges) {
        const key = `${Math.min(ex.i, ex.j)}-${Math.max(ex.i, ex.j)}`;
        const existing = linkMap.get(key);
        if (existing) {
          existing.count++;
          existing.lastT = t;
        } else {
          linkMap.set(key, { source: ex.i, target: ex.j, count: 1, lastT: t });
        }
      }
    }
    const links = Array.from(linkMap.values());

    const g = svg.append('g');

    g.selectAll('line')
      .data(links)
      .join('line')
      .attr('x1', d => nodeByIndex.get(d.source)?.x ?? 0)
      .attr('y1', d => nodeByIndex.get(d.source)?.y ?? 0)
      .attr('x2', d => nodeByIndex.get(d.target)?.x ?? 0)
      .attr('y2', d => nodeByIndex.get(d.target)?.y ?? 0)
      .attr('stroke', d => {
        const recency = 1 - (stepIdx - d.lastT) / Math.max(stepIdx, 1);
        return d3.interpolateRgb('#d8dce3', '#e0a020')(Math.max(0.25, recency));
      })
      .attr('stroke-width', d => Math.min(d.count * 1.5 + 0.5, 4))
      .attr('stroke-opacity', 0.85);

    g.selectAll('circle')
      .data(nodes)
      .join('circle')
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
      .attr('r', d => (d.converged ? 6 : 8 + d.d * 12))
      .attr('fill', d => (d.converged ? '#2d9e5f' : CHART_COLORS[d.id % CHART_COLORS.length]))
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 2)
      .attr('opacity', d => (d.converged ? 0.65 : 1));

    g.selectAll('text')
      .data(nodes)
      .join('text')
      .text(d => `i${d.id}`)
      .attr('x', d => d.x)
      .attr('y', d => d.y)
      .attr('dy', d => (d.converged ? 18 : 8 + d.d * 12 + 12))
      .attr('font-size', '10px')
      .attr('font-family', 'ui-monospace, SFMono-Regular, Menlo, monospace')
      .attr('fill', '#5c6470')
      .attr('text-anchor', 'middle');
  }, [history, currentStep, height, width]);

  return (
    <div ref={containerRef} style={{ width: '100%' }}>
      <svg ref={svgRef} role="img" aria-label="Interaction network of agents" style={{ width: '100%', display: 'block' }} />
      <div className="chart-legend">
        <span className="chart-legend__item">Node size ∝ remaining distance</span>
        <span className="chart-legend__item">Green = converged</span>
        <span className="chart-legend__item">Edge = exchange (thicker = more frequent)</span>
      </div>
    </div>
  );
}
