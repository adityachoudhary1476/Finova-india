import { formatINR } from '../../../lib/formatters';

export interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  segments: readonly DonutSegment[];
  ariaLabel: string;
}

export default function DonutChart({ segments, ariaLabel }: DonutChartProps) {
  const total = segments.reduce((sum, segment) => sum + Math.max(0, segment.value), 0);
  const circumference = 2 * Math.PI * 42;
  let cumulativeRatio = 0;

  return (
    <div className="donut-chart">
      <svg viewBox="0 0 100 100" role="img" aria-label={ariaLabel}>
        <circle className="donut-chart__track" cx="50" cy="50" r="42" />
        {segments.map((segment) => {
          const ratio = total > 0 ? Math.max(0, segment.value) / total : 0;
          const dashLength = ratio * circumference;
          const dashOffset = -cumulativeRatio * circumference;
          cumulativeRatio += ratio;
          return (
            <circle
              key={segment.label}
              className="donut-chart__segment"
              cx="50"
              cy="50"
              r="42"
              stroke={segment.color}
              strokeDasharray={`${dashLength} ${circumference - dashLength}`}
              strokeDashoffset={dashOffset}
            />
          );
        })}
      </svg>
      <ul className="donut-chart__legend" aria-label="Chart values">
        {segments.map((segment) => (
          <li key={segment.label}>
            <span className="donut-chart__swatch" style={{ backgroundColor: segment.color }} aria-hidden="true" />
            <span>{segment.label}</span>
            <strong>{formatINR(segment.value)}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}
