interface ResultMetricProps {
  label: string;
  value: string;
}

export default function ResultMetric({ label, value }: ResultMetricProps) {
  return (
    <div className="result-metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
