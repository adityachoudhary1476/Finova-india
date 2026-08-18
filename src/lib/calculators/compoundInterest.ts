import { assertFiniteNonNegative, assertFinitePositive, type GrowthPoint } from './shared';

export type CompoundingFrequency = 'yearly' | 'half-yearly' | 'quarterly' | 'monthly' | 'daily';

export const compoundingPeriods: Readonly<Record<CompoundingFrequency, number>> = {
  yearly: 1,
  'half-yearly': 2,
  quarterly: 4,
  monthly: 12,
  daily: 365,
};

export interface CompoundInterestInput {
  principal: number;
  annualRate: number;
  years: number;
  frequency: CompoundingFrequency;
}

export interface CompoundInterestResult {
  principal: number;
  interestEarned: number;
  finalAmount: number;
  growth: readonly GrowthPoint[];
}

function amountAtTime(input: CompoundInterestInput, elapsedYears: number): number {
  const periodsPerYear = compoundingPeriods[input.frequency];
  const periodicRate = input.annualRate / 100 / periodsPerYear;
  return input.principal * ((1 + periodicRate) ** (periodsPerYear * elapsedYears));
}

export function calculateCompoundInterest(input: CompoundInterestInput): CompoundInterestResult {
  assertFiniteNonNegative(input.principal, 'Principal');
  assertFiniteNonNegative(input.annualRate, 'Annual interest rate');
  assertFinitePositive(input.years, 'Time period');

  if (!(input.frequency in compoundingPeriods)) {
    throw new RangeError('Choose a valid compounding frequency.');
  }

  const finalAmount = amountAtTime(input, input.years);
  const growth: GrowthPoint[] = [{
    label: 'Start',
    period: 0,
    contributed: input.principal,
    value: input.principal,
  }];
  const wholeYears = Math.floor(input.years);

  for (let year = 1; year <= wholeYears; year += 1) {
    growth.push({
      label: `Year ${year}`,
      period: year,
      contributed: input.principal,
      value: amountAtTime(input, year),
    });
  }

  if (!Number.isInteger(input.years)) {
    growth.push({
      label: `${input.years.toFixed(1)} years`,
      period: input.years,
      contributed: input.principal,
      value: finalAmount,
    });
  }

  return {
    principal: input.principal,
    interestEarned: Math.max(0, finalAmount - input.principal),
    finalAmount,
    growth,
  };
}
