const indianNumberFormatter = new Intl.NumberFormat('en-IN', {
  maximumFractionDigits: 2,
});

const indianIntegerFormatter = new Intl.NumberFormat('en-IN', {
  maximumFractionDigits: 0,
});

const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  currencyDisplay: 'symbol',
  maximumFractionDigits: 0,
});

export function formatIndianNumber(value: number, maximumFractionDigits = 2): string {
  if (!Number.isFinite(value)) return '—';
  if (maximumFractionDigits === 0) return indianIntegerFormatter.format(value);
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits }).format(value);
}

export function formatINR(value: number, maximumFractionDigits = 0): string {
  if (!Number.isFinite(value)) return '—';
  if (maximumFractionDigits === 0) return inrFormatter.format(value).replace(/\s/g, '');
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    currencyDisplay: 'symbol',
    minimumFractionDigits: 0,
    maximumFractionDigits,
  }).format(value).replace(/\s/g, '');
}

export function formatPercentage(value: number, maximumFractionDigits = 2): string {
  if (!Number.isFinite(value)) return '—';
  return `${formatIndianNumber(value, maximumFractionDigits)}%`;
}

export function formatDuration(months: number): string {
  if (!Number.isFinite(months) || months < 0) return '—';
  const roundedMonths = Math.round(months);
  const years = Math.floor(roundedMonths / 12);
  const remainingMonths = roundedMonths % 12;
  const yearLabel = years === 1 ? 'year' : 'years';
  const monthLabel = remainingMonths === 1 ? 'month' : 'months';

  if (years === 0) return `${remainingMonths} ${monthLabel}`;
  if (remainingMonths === 0) return `${years} ${yearLabel}`;
  return `${years} ${yearLabel} ${remainingMonths} ${monthLabel}`;
}

export function formatInputNumber(value: number, maximumFractionDigits = 2): string {
  if (!Number.isFinite(value)) return '';
  return maximumFractionDigits === 0
    ? indianIntegerFormatter.format(value)
    : indianNumberFormatter.format(value);
}

export function parseNumericInput(value: string): number | null {
  const normalized = value.replace(/[₹,%\s]/g, '').replace(/,/g, '');
  if (normalized === '' || normalized === '-' || normalized === '.') return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

export function describeIndianAmount(value: number): string {
  if (!Number.isFinite(value) || value < 0) return '';
  if (value >= 10_000_000) return `${formatIndianNumber(value / 10_000_000, 2)} crore`;
  if (value >= 100_000) return `${formatIndianNumber(value / 100_000, 2)} lakh`;
  return formatIndianNumber(value, 0);
}
