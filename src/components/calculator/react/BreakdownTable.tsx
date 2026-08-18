export interface BreakdownColumn {
  key: string;
  label: string;
  align?: 'left' | 'right';
}

export type BreakdownTableRow = Readonly<Record<string, string | number>>;

interface BreakdownTableProps {
  title: string;
  description: string;
  columns: readonly BreakdownColumn[];
  rows: readonly BreakdownTableRow[];
  regionLabel: string;
}

export default function BreakdownTable({
  title,
  description,
  columns,
  rows,
  regionLabel,
}: BreakdownTableProps) {
  return (
    <section className="breakdown-table">
      <header className="breakdown-table__header">
        <span className="chart-container__eyebrow">Year by year</span>
        <h2>{title}</h2>
        <p>{description}</p>
      </header>
      <div className="breakdown-table__scroll" tabIndex={0} role="region" aria-label={regionLabel}>
        <table>
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key} scope="col" className={column.align === 'left' ? 'align-left' : undefined}>
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map((column) => (
                  <td key={column.key} className={column.align === 'left' ? 'align-left' : undefined}>
                    {row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="breakdown-table__note">On a small screen, swipe horizontally to see every column.</p>
    </section>
  );
}
