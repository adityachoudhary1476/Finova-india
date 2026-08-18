export interface NumericConstraints {
  min: number;
  max: number;
  label: string;
  allowZero?: boolean;
}

export function validateNumericValue(
  value: number | null,
  constraints: NumericConstraints,
): string | null {
  if (value === null || !Number.isFinite(value)) return `Enter ${constraints.label.toLowerCase()}.`;
  if (!constraints.allowZero && value === 0) return `${constraints.label} must be greater than zero.`;
  if (value < constraints.min) return `${constraints.label} must be at least ${constraints.min}.`;
  if (value > constraints.max) return `${constraints.label} must be ${constraints.max} or less.`;
  return null;
}

export function hasValidationErrors(errors: readonly (string | null)[]): boolean {
  return errors.some((error) => error !== null);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
