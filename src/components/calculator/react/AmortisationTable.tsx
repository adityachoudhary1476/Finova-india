import { useState } from 'react';
import type { AmortisationYear } from '../../../lib/calculators/emi';
import { formatINR } from '../../../lib/formatters';

interface AmortisationTableProps {
  rows: readonly AmortisationYear[];
}

const COLLAPSED_ROWS = 5;

export default function AmortisationTable({ rows }: AmortisationTableProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const visibleRows = isExpanded ? rows : rows.slice(0, COLLAPSED_ROWS);
  const canExpand = rows.length > COLLAPSED_ROWS;

  return (
    <section className="amortisation">
      <header className="amortisation__header amortisation__heading-row">
        <div>
          <span className="chart-container__eyebrow">Year by year</span>
          <h2>Amortisation schedule</h2>
          <p>See how each year’s payments reduce the balance and pay interest.</p>
        </div>
        {canExpand && (
          <button
            className="amortisation__toggle"
            type="button"
            aria-expanded={isExpanded}
            onClick={() => setIsExpanded((current) => !current)}
          >
            {isExpanded ? 'Show less' : `Show all ${rows.length} years`}
          </button>
        )}
      </header>
      <div className="amortisation__scroll" tabIndex={0} role="region" aria-label="Loan amortisation schedule table">
        <table>
          <thead>
            <tr>
              <th scope="col">Year</th>
              <th scope="col">Opening balance</th>
              <th scope="col">Principal paid</th>
              <th scope="col">Interest paid</th>
              <th scope="col">Total payment</th>
              <th scope="col">Closing balance</th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row) => (
              <tr key={row.year}>
                <td>{row.year}</td>
                <td>{formatINR(row.openingBalance)}</td>
                <td>{formatINR(row.principalPaid)}</td>
                <td>{formatINR(row.interestPaid)}</td>
                <td>{formatINR(row.totalPayment)}</td>
                <td>{formatINR(row.closingBalance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="amortisation__mobile-note">On a small screen, swipe the table horizontally to see every column.</p>
    </section>
  );
}
