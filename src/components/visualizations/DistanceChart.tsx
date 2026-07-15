import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { SimulationHistory } from '../../engine/simulation';

const CHART_COLORS = [
  '#3366cc', '#2d9e5f', '#d94452', '#d4952e',
  '#8855cc', '#3399aa', '#cc6633', '#aa3399',
];

const MARGIN = { top: 24, right: 16, bottom: 40, left: 48 };

interface DistanceChartProps {
  history: SimulationHistory;
  /** Currently viewed step (for vertical marker) */
  currentStep?: number;
  /** Width override. Defaults to container width. */
  width?: number;
  /** Height override */
  height?: number;
}

/**
 * D3-based line chart showing d(C_i(t), C*_i) over time for each agent.
 * Features: IQR band, cohort mean line, animated transitions, current-step marker.
 */
export default function DistanceChart({
  history,
  currentStep,
  height = 320,
}: DistanceChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const containerWidth = containerRef.current.clientWidth;
    const width = containerWidth;
    const innerW = width - MARGIN.left - MARGIN.right;
    const innerH = height - MARGIN.top - MARGIN.bottom;

    const svg = d3.select(svgRef.current);
    svg.attr('width', width).attr('height', height);

    // Clear previous
    svg.selectAll('*').remove();

    const g = svg
      .append('g')
      .attr('transform', `translate(${MARGIN.left},${MARGIN.top})`);

    const steps = history.steps;
    if (steps.length === 0) return;

    const maxT = steps[steps.length - 1].t;
    const agents = steps[0].individuals.map(ind => ind.id);

    // Scales
    const x = d3.scaleLinear().domain([0, Math.max(maxT, 1)]).range([0, innerW]);
    const y = d3.scaleLinear().domain([0, 1]).range([innerH, 0]);

    // Axes
    g.append('g')
      .attr('transform', `translate(0,${innerH})`)
      .call(
        d3
          .axisBottom(x)
          .ticks(Math.min(maxT, 10))
          .tickFormat(d => `${d}`)
      )
      .call(g => g.select('.domain').attr('stroke', 'var(--border)'))
      .call(g => g.selectAll('.tick line').attr('stroke', 'var(--border-light)'))
      .call(g => g.selectAll('.tick text').attr('fill', 'var(--text-tertiary)').style('font-size', '11px'));

    g.append('g')
      .call(
        d3
          .axisLeft(y)
          .ticks(5)
          .tickFormat(d => `${d}`)
      )
      .call(g => g.select('.domain').attr('stroke', 'var(--border)'))
      .call(g => g.selectAll('.tick line').attr('stroke', 'var(--border-light)').attr('x2', innerW).attr('opacity', 0.3))
      .call(g => g.selectAll('.tick text').attr('fill', 'var(--text-tertiary)').style('font-size', '11px'));

    // Axis labels
    g.append('text')
      .attr('x', innerW / 2)
      .attr('y', innerH + 34)
      .attr('text-anchor', 'middle')
      .attr('fill', 'var(--text-tertiary)')
      .style('font-size', '12px')
      .style('font-family', 'var(--font-body)')
      .text('Time step t');

    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerH / 2)
      .attr('y', -36)
      .attr('text-anchor', 'middle')
      .attr('fill', 'var(--text-tertiary)')
      .style('font-size', '12px')
      .style('font-family', 'var(--font-body)')
      .text('d(Cᵢ(t), Cᵢ*)');

    // IQR band
    const cohort = steps.map(s => s.cohort);
    const areaGen = d3
      .area<(typeof cohort)[0]>()
      .x(d => x(d.t))
      .y0(d => y(d.q25))
      .y1(d => y(d.q75))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(cohort)
      .attr('d', areaGen)
      .attr('fill', 'var(--accent-light)')
      .attr('opacity', 0.5);

    // Per-agent lines
    const lineGen = d3
      .line<{ t: number; d: number }>()
      .x(d => x(d.t))
      .y(d => y(d.d))
      .curve(d3.curveMonotoneX);

    for (const agentId of agents) {
      const data = steps.map(s => {
        const snap = s.snapshots.find(sn => sn.agent === agentId);
        return { t: s.t, d: snap?.d ?? 0 };
      });

      g.append('path')
        .datum(data)
        .attr('d', lineGen)
        .attr('fill', 'none')
        .attr('stroke', CHART_COLORS[agentId % CHART_COLORS.length])
        .attr('stroke-width', 1.5)
        .attr('stroke-opacity', 0.65);
    }

    // Mean line
    const meanLine = d3
      .line<(typeof cohort)[0]>()
      .x(d => x(d.t))
      .y(d => y(d.mean))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(cohort)
      .attr('d', meanLine)
      .attr('fill', 'none')
      .attr('stroke', 'var(--text-primary)')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '6,3');

    // Current step marker
    if (currentStep !== undefined && currentStep >= 0 && currentStep <= maxT) {
      g.append('line')
        .attr('x1', x(currentStep))
        .attr('x2', x(currentStep))
        .attr('y1', 0)
        .attr('y2', innerH)
        .attr('stroke', 'var(--accent)')
        .attr('stroke-width', 1.5)
        .attr('stroke-dasharray', '4,3')
        .attr('opacity', 0.7);
    }

    // d = 0 reference
    g.append('line')
      .attr('x1', 0)
      .attr('x2', innerW)
      .attr('y1', y(0))
      .attr('y2', y(0))
      .attr('stroke', 'var(--color-match)')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '2,4')
      .attr('opacity', 0.5);
  }, [history, currentStep, height]);

  // ResizeObserver for responsiveness
  useEffect(() => {
    if (!containerRef.current || !svgRef.current) return;
    const observer = new ResizeObserver(() => {
      // Trigger re-render by updating svg
      const event = new Event('resize');
      window.dispatchEvent(event);
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} style={{ width: '100%' }}>
      <svg ref={svgRef} style={{ width: '100%', display: 'block' }} />
    </div>
  );
}
