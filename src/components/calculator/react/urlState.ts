export function readNumberParameter(
  parameters: URLSearchParams,
  key: string,
  min: number,
  max: number,
): number | null {
  const rawValue = parameters.get(key);
  if (rawValue === null || rawValue.trim() === '') return null;
  const value = Number(rawValue);
  return Number.isFinite(value) && value >= min && value <= max ? value : null;
}

export function replaceCalculatorQuery(values: Readonly<Record<string, string | number>>): void {
  if (typeof window === 'undefined') return;
  const parameters = new URLSearchParams();
  Object.entries(values).forEach(([key, value]) => parameters.set(key, String(value)));
  const nextUrl = `${window.location.pathname}?${parameters.toString()}`;
  window.history.replaceState(null, '', nextUrl);
}
