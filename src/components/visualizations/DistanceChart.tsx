import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { SimulationHistory } from '../../engine/simulation';
import { useContainerWidth } from '../../hooks/useContainerWidth';

const CHART_COLORS = [
  '#3366cc', '#2d9e5f', '#d94452', '#d4952e',
  '#8855cc', '#3399aa', '#cc6633', '#aa3399',
];

const MARGIN = { top: 24, right: 16, bottom: 40, left: 48 };

interface DistanceChartProps {
  history: SimulationHistory;
  currentStep?: number;
  height?: number;
}

/**
 * Line chart of d(C_i(t), C*_i) for each agent, with cohort mean and IQR band.
 */
export default function DistanceChart({
  history,
  currentStep,
  height = 320,
}: DistanceChartProps) {
  const { ref: containerRef, width } = useContainerWidth<HTMLDivElement>();
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || width < 40) return;

    const innerW = width - MARGIN.left - MARGIN.right;
    const innerH = height - MARGIN.top - MARGIN.bottom;

    const svg = d3.select(svgRef.current);
    svg.attr('width', width).attr('height', height);
    svg.selectAll('*').remove();

    const g = svg
      .append('g')
      .attr('transform', `translate(${MARGIN.left},${MARGIN.top})`);

    const steps = history.steps;
    if (steps.length === 0) return;

    const maxT = steps[steps.length - 1].t;
    const agents = steps[0].individuals.map(ind => ind.id);

    const x = d3.scaleLinear().domain([0, Math.max(maxT, 1)]).range([0, innerW]);
    const y = d3.scaleLinear().domain([0, 1]).range([innerH, 0]);

    g.append('g')
      .attr('transform', `translate(0,${innerH})`)
      .call(
        d3
          .axisBottom(x)
          .ticks(Math.min(Math.max(maxT, 1), 10))
          .tickFormat(d => `${d}`),
      )
      .call(sel => sel.select('.domain').attr('stroke', '#d8dce3'))
      .call(sel => sel.selectAll('.tick line').attr('stroke', '#eceef1'))
      .call(sel => sel.selectAll('.tick text').attr('fill', '#7a8190').style('font-size', '11px'));

    g.append('g')
      .call(
        d3
          .axisLeft(y)
          .ticks(5)
          .tickFormat(d => `${d}`),
      )
      .call(sel => sel.select('.domain').attr('stroke', '#d8dce3'))
      .call(sel => sel.selectAll('.tick line').attr('stroke', '#eceef1').attr('x2', innerW).attr('opacity', 0.5))
      .call(sel => sel.selectAll('.tick text').attr('fill', '#7a8190').style('font-size', '11px'));

    g.append('text')
      .attr('x', innerW / 2)
      .attr('y', innerH + 34)
      .attr('text-anchor', 'middle')
      .attr('fill', '#7a8190')
      .style('font-size', '12px')
      .text('Time step t');

    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerH / 2)
      .attr('y', -36)
      .attr('text-anchor', 'middle')
      .attr('fill', '#7a8190')
      .style('font-size', '12px')
      .text('d(Cᵢ(t), Cᵢ*)');

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
      .attr('fill', '#d6e4f5')
      .attr('opacity', 0.85);

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
        .attr('stroke-opacity', 0.7);
    }

    const meanLine = d3
      .line<(typeof cohort)[0]>()
      .x(d => x(d.t))
      .y(d => y(d.mean))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(cohort)
      .attr('d', meanLine)
      .attr('fill', 'none')
      .attr('stroke', '#1c2430')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '6,3');

    if (currentStep !== undefined && currentStep >= 0 && currentStep <= maxT) {
      g.append('line')
        .attr('x1', x(currentStep))
        .attr('x2', x(currentStep))
        .attr('y1', 0)
        .attr('y2', innerH)
        .attr('stroke', '#2b5ea8')
        .attr('stroke-width', 1.5)
        .attr('stroke-dasharray', '4,3')
        .attr('opacity', 0.8);
    }
  }, [history, currentStep, height, width]);

  return (
    <div ref={containerRef} style={{ width: '100%' }}>
      <svg ref={svgRef} role="img" aria-label="Distance to ideal over time" style={{ width: '100%', display: 'block' }} />
      <div className="chart-legend">
        <span className="chart-legend__item">
          <span className="chart-legend__line chart-legend__line--agent" />
          Agents
        </span>
        <span className="chart-legend__item">
          <span className="chart-legend__line chart-legend__line--mean" />
          Mean
        </span>
        <span className="chart-legend__item">
          <span className="chart-legend__swatch chart-legend__swatch--iqr" />
          IQR
        </span>
      </div>
    </div>
  );
}
