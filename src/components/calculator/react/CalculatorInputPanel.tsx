import type { ReactNode } from 'react';

interface CalculatorInputPanelProps {
  children: ReactNode;
  reference: string;
}

export default function CalculatorInputPanel({ children, reference }: CalculatorInputPanelProps) {
  return (
    <section className="calculator-panel">
      <header className="calculator-panel__header">
        <span>Your inputs</span>
        <small>{reference}</small>
      </header>
      <div className="calculator-inputs">{children}</div>
    </section>
  );
}
