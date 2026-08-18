import ResultMetric from './ResultMetric';

export interface ResultMetricItem {
  label: string;
  value: string;
}

interface ResultPanelProps {
  eyebrow?: string;
  primaryLabel: string;
  primaryValue: string;
  metrics: readonly ResultMetricItem[];
  note?: string;
}

export default function ResultPanel({
  eyebrow = 'Your result',
  primaryLabel,
  primaryValue,
  metrics,
  note,
}: ResultPanelProps) {
  return (
    <section className="calculator-panel result-panel" aria-live="polite" aria-atomic="true">
      <header className="calculator-panel__header">
        <span>{eyebrow}</span>
        <small className="result-panel__status">Updated instantly</small>
      </header>
      <div className="result-panel__primary">
        <span>{primaryLabel}</span>
        <strong>{primaryValue}</strong>
      </div>
      <div className="result-panel__metrics">
        {metrics.map((metric) => (
          <ResultMetric key={metric.label} label={metric.label} value={metric.value} />
        ))}
      </div>
      {note && <p className="result-panel__note">{note}</p>}
    </section>
  );
}
