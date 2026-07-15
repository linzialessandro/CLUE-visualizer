import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { SimulationHistory } from '../../engine/simulation';
import { distance } from '../../engine/baire-metric';

const CHART_COLORS = [
  '#3366cc', '#2d9e5f', '#d94452', '#d4952e',
  '#8855cc', '#3399aa', '#cc6633', '#aa3399',
];

interface NetworkGraphProps {
  history: SimulationHistory;
  currentStep: number;
  height?: number;
}

interface NodeDatum extends d3.SimulationNodeDatum {
  id: number;
  d: number;
  converged: boolean;
}

interface LinkDatum extends d3.SimulationLinkDatum<NodeDatum> {
  count: number;
  lastT: number;
}

/**
 * Force-directed network graph showing agent interactions.
 * Nodes = agents (sized by progress), Edges = exchanges.
 */
export default function NetworkGraph({ history, currentStep, height = 320 }: NetworkGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const containerWidth = containerRef.current.clientWidth;
    const width = containerWidth;

    const svg = d3.select(svgRef.current);
    svg.attr('width', width).attr('height', height);
    svg.selectAll('*').remove();

    const steps = history.steps;
    if (steps.length === 0) return;

    const stepIdx = Math.min(currentStep, steps.length - 1);
    const currentStepData = steps[stepIdx];
    const individuals = currentStepData.individuals;

    // Build nodes
    const nodes: NodeDatum[] = individuals.map(ind => {
      const d_val = distance(ind.currentConception, ind.idealConception);
      return {
        id: ind.id,
        d: d_val,
        converged: d_val === 0,
      };
    });

    // Build links from all exchanges up to currentStep
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
    const links: LinkDatum[] = Array.from(linkMap.values());

    // Force simulation
    const simulation = d3.forceSimulation<NodeDatum>(nodes)
      .force('link', d3.forceLink<NodeDatum, LinkDatum>(links).id(d => d.id).distance(80))
      .force('charge', d3.forceManyBody().strength(-200))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(d => radiusFn(d as NodeDatum) + 4));

    const g = svg.append('g');

    // Links
    const link = g
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', d => {
        const recency = 1 - (stepIdx - d.lastT) / Math.max(stepIdx, 1);
        return d3.interpolateRgb('var(--border-light)', 'var(--color-exchange)')(Math.max(0.2, recency));
      })
      .attr('stroke-width', d => Math.min(d.count * 1.5 + 0.5, 4))
      .attr('stroke-opacity', 0.6);

    // Nodes
    const node = g
      .selectAll('circle')
      .data(nodes)
      .join('circle')
      .attr('r', d => radiusFn(d))
      .attr('fill', d => d.converged ? 'var(--color-match)' : CHART_COLORS[d.id % CHART_COLORS.length])
      .attr('stroke', d => d.converged ? 'var(--color-match)' : 'var(--bg-surface)')
      .attr('stroke-width', 2)
      .attr('opacity', d => d.converged ? 0.5 : 1);

    // Labels
    const label = g
      .selectAll('text')
      .data(nodes)
      .join('text')
      .text(d => `i${d.id}`)
      .attr('font-size', '10px')
      .attr('font-family', 'var(--font-mono)')
      .attr('fill', 'var(--text-secondary)')
      .attr('text-anchor', 'middle')
      .attr('dy', d => radiusFn(d) + 14);

    simulation.on('tick', () => {
      link
        .attr('x1', d => ((d.source as NodeDatum).x ?? 0))
        .attr('y1', d => ((d.source as NodeDatum).y ?? 0))
        .attr('x2', d => ((d.target as NodeDatum).x ?? 0))
        .attr('y2', d => ((d.target as NodeDatum).y ?? 0));

      node
        .attr('cx', d => d.x ?? 0)
        .attr('cy', d => d.y ?? 0);

      label
        .attr('x', d => d.x ?? 0)
        .attr('y', d => d.y ?? 0);
    });

    return () => { simulation.stop(); };
  }, [history, currentStep, height]);

  return (
    <div ref={containerRef} style={{ width: '100%' }}>
      <svg ref={svgRef} style={{ width: '100%', display: 'block' }} />
    </div>
  );
}

/** Node radius based on progress: bigger = more distance remaining */
function radiusFn(d: NodeDatum): number {
  if (d.converged) return 6;
  return 8 + d.d * 14; // 8px when d≈0, up to 22px when d=1
}
