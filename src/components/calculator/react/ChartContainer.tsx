import type { ReactNode } from 'react';

interface ChartContainerProps {
  title: string;
  description: string;
  children: ReactNode;
}

export default function ChartContainer({ title, description, children }: ChartContainerProps) {
  return (
    <section className="chart-container">
      <header className="chart-container__header">
        <span className="chart-container__eyebrow">Visual breakdown</span>
        <h2>{title}</h2>
        <p>{description}</p>
      </header>
      {children}
    </section>
  );
}
