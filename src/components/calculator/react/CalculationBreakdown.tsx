export interface BreakdownRow {
  label: string;
  value: string;
}

interface CalculationBreakdownProps {
  title?: string;
  description: string;
  rows: readonly BreakdownRow[];
  explanation: string;
}

export default function CalculationBreakdown({
  title = 'Calculation breakdown',
  description,
  rows,
  explanation,
}: CalculationBreakdownProps) {
  return (
    <section className="calculation-breakdown" aria-live="polite">
      <header className="calculation-breakdown__header">
        <span className="chart-container__eyebrow">What the numbers mean</span>
        <h2>{title}</h2>
        <p>{description}</p>
      </header>
      <dl>
        {rows.map((row) => (
          <div key={row.label}>
            <dt>{row.label}</dt>
            <dd>{row.value}</dd>
          </div>
        ))}
      </dl>
      <p className="calculation-breakdown__explanation">{explanation}</p>
    </section>
  );
}
