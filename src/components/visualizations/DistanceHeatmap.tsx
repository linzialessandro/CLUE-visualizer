import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { SimulationHistory } from '../../engine/simulation';

const MARGIN = { top: 24, right: 16, bottom: 40, left: 60 };

interface DistanceHeatmapProps {
  history: SimulationHistory;
  /** Currently viewed step */
  currentStep?: number;
  height?: number;
}

/**
 * D3-based heatmap showing d(C_i(t), C*_i) for each agent × time step.
 * Color scale: white (d=0, converged) → deep rose (d=1, max divergence).
 */
export default function DistanceHeatmap({ history, currentStep, height: propHeight }: DistanceHeatmapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const steps = history.steps;
    if (steps.length === 0) return;

    const agents = steps[0].individuals.map(ind => ind.id);
    const times = steps.map(s => s.t);
    const height = propHeight ?? Math.max(200, agents.length * 28 + MARGIN.top + MARGIN.bottom);

    const containerWidth = containerRef.current.clientWidth;
    const width = containerWidth;
    const innerW = width - MARGIN.left - MARGIN.right;
    const innerH = height - MARGIN.top - MARGIN.bottom;

    const svg = d3.select(svgRef.current);
    svg.attr('width', width).attr('height', height);
    svg.selectAll('*').remove();

    const g = svg
      .append('g')
      .attr('transform', `translate(${MARGIN.left},${MARGIN.top})`);

    // Scales
    const x = d3.scaleBand<number>().domain(times).range([0, innerW]).padding(0.04);
    const y = d3.scaleBand<number>().domain(agents).range([0, innerH]).padding(0.08);
    const color = d3.scaleSequential(d3.interpolateRgb('#f0f7f0', '#c94455')).domain([0, 1]);

    // Build data
    const data: { agent: number; t: number; d: number }[] = [];
    for (const step of steps) {
      for (const snap of step.snapshots) {
        data.push({ agent: snap.agent, t: snap.t, d: snap.d });
      }
    }

    // Cells
    g.selectAll('rect.cell')
      .data(data)
      .join('rect')
      .attr('class', 'cell')
      .attr('x', d => x(d.t) ?? 0)
      .attr('y', d => y(d.agent) ?? 0)
      .attr('width', x.bandwidth())
      .attr('height', y.bandwidth())
      .attr('rx', 2)
      .attr('fill', d => color(d.d))
      .attr('stroke', d => {
        if (currentStep !== undefined && d.t === currentStep) return 'var(--accent)';
        return 'none';
      })
      .attr('stroke-width', d => {
        if (currentStep !== undefined && d.t === currentStep) return 1.5;
        return 0;
      });

    // X axis
    const maxTicks = Math.min(times.length, 15);
    const tickEvery = Math.max(1, Math.ceil(times.length / maxTicks));
    const tickValues = times.filter((_, i) => i % tickEvery === 0);

    g.append('g')
      .attr('transform', `translate(0,${innerH})`)
      .call(
        d3
          .axisBottom(x)
          .tickValues(tickValues)
          .tickFormat(d => `${d}`)
      )
      .call(g => g.select('.domain').attr('stroke', 'var(--border)'))
      .call(g => g.selectAll('.tick line').remove())
      .call(g => g.selectAll('.tick text').attr('fill', 'var(--text-tertiary)').style('font-size', '10px'));

    g.append('text')
      .attr('x', innerW / 2)
      .attr('y', innerH + 32)
      .attr('text-anchor', 'middle')
      .attr('fill', 'var(--text-tertiary)')
      .style('font-size', '12px')
      .style('font-family', 'var(--font-body)')
      .text('Time step t');

    // Y axis
    g.append('g')
      .call(
        d3
          .axisLeft(y)
          .tickFormat(d => `i${d}`)
      )
      .call(g => g.select('.domain').attr('stroke', 'var(--border)'))
      .call(g => g.selectAll('.tick line').remove())
      .call(g =>
        g.selectAll('.tick text')
          .attr('fill', 'var(--text-tertiary)')
          .style('font-size', '10px')
          .style('font-family', 'var(--font-mono)')
      );

    // Color legend
    const legendW = Math.min(innerW * 0.3, 120);
    const legendH = 8;
    const legendX = innerW - legendW;
    const legendY = -16;

    const defs = svg.append('defs');
    const gradientId = 'heatmap-gradient';
    const gradient = defs
      .append('linearGradient')
      .attr('id', gradientId)
      .attr('x1', '0%')
      .attr('x2', '100%');

    gradient.append('stop').attr('offset', '0%').attr('stop-color', '#f0f7f0');
    gradient.append('stop').attr('offset', '100%').attr('stop-color', '#c94455');

    const lg = g.append('g').attr('transform', `translate(${legendX},${legendY})`);

    lg.append('rect')
      .attr('width', legendW)
      .attr('height', legendH)
      .attr('rx', 2)
      .attr('fill', `url(#${gradientId})`);

    lg.append('text')
      .attr('x', -4)
      .attr('y', legendH / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'end')
      .attr('fill', 'var(--text-tertiary)')
      .style('font-size', '9px')
      .text('0');

    lg.append('text')
      .attr('x', legendW + 4)
      .attr('y', legendH / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'start')
      .attr('fill', 'var(--text-tertiary)')
      .style('font-size', '9px')
      .text('1');

    lg.append('text')
      .attr('x', legendW / 2)
      .attr('y', -4)
      .attr('text-anchor', 'middle')
      .attr('fill', 'var(--text-tertiary)')
      .style('font-size', '9px')
      .text('d');
  }, [history, currentStep, propHeight]);

  return (
    <div ref={containerRef} style={{ width: '100%' }}>
      <svg ref={svgRef} style={{ width: '100%', display: 'block' }} />
    </div>
  );
}
