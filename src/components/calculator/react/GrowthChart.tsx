import type { GrowthPoint } from '../../../lib/calculators/shared';
import { formatINR } from '../../../lib/formatters';

interface GrowthChartProps {
  points: readonly GrowthPoint[];
  ariaLabel: string;
  showContributed?: boolean;
}

const WIDTH = 640;
const HEIGHT = 240;
const LEFT = 16;
const RIGHT = 16;
const TOP = 18;
const BOTTOM = 32;

function createPath(values: readonly number[], maximum: number): string {
  if (values.length === 0) return '';
  const drawableWidth = WIDTH - LEFT - RIGHT;
  const drawableHeight = HEIGHT - TOP - BOTTOM;
  return values.map((value, index) => {
    const x = LEFT + (index / Math.max(1, values.length - 1)) * drawableWidth;
    const y = TOP + drawableHeight - ((maximum === 0 ? 0 : value / maximum) * drawableHeight);
    return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
  }).join(' ');
}

export default function GrowthChart({ points, ariaLabel, showContributed = false }: GrowthChartProps) {
  const values = points.map((point) => Math.max(0, point.value));
  const contributed = points.map((point) => Math.max(0, point.contributed));
  const maximum = Math.max(1, ...values, ...(showContributed ? contributed : []));
  const valuePath = createPath(values, maximum);
  const contributionPath = createPath(contributed, maximum);
  const areaPath = `${valuePath} L ${WIDTH - RIGHT} ${HEIGHT - BOTTOM} L ${LEFT} ${HEIGHT - BOTTOM} Z`;
  const lastPoint = points.at(-1);

  return (
    <div className="growth-chart">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={ariaLabel}>
        {[0, 1, 2, 3].map((line) => {
          const y = TOP + (line / 3) * (HEIGHT - TOP - BOTTOM);
          return <line key={line} className="growth-chart__grid" x1={LEFT} y1={y} x2={WIDTH - RIGHT} y2={y} />;
        })}
        <path className="growth-chart__area" d={areaPath} />
        {showContributed && <path className="growth-chart__contributed" d={contributionPath} />}
        <path className="growth-chart__line" d={valuePath} />
        <text x={LEFT} y={HEIGHT - 10}>{points[0]?.label ?? 'Start'}</text>
        <text x={WIDTH - RIGHT} y={HEIGHT - 10} textAnchor="end">{lastPoint?.label ?? ''}</text>
        <text x={WIDTH - RIGHT} y={TOP + 2} textAnchor="end">{formatINR(lastPoint?.value ?? 0)}</text>
      </svg>
      <div className="growth-chart__legend" aria-hidden="true">
        <span><i></i> Estimated value</span>
        {showContributed && <span><i className="dashed"></i> Contributions</span>}
      </div>
    </div>
  );
}
