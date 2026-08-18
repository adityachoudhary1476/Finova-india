import { assertFiniteNonNegative, assertFinitePositive, type GrowthPoint } from './shared';

export interface SipInput {
  monthlyInvestment: number;
  annualRate: number;
  years: number;
}

export interface SipResult {
  totalInvested: number;
  estimatedReturns: number;
  futureValue: number;
  months: number;
  growth: readonly GrowthPoint[];
}

export function calculateSip(input: SipInput): SipResult {
  assertFiniteNonNegative(input.monthlyInvestment, 'Monthly investment');
  assertFiniteNonNegative(input.annualRate, 'Expected annual return');
  assertFinitePositive(input.years, 'Investment duration');

  const months = Math.max(1, Math.round(input.years * 12));
  const monthlyRate = input.annualRate / 12 / 100;
  const totalInvested = input.monthlyInvestment * months;
  const futureValue = monthlyRate === 0
    ? totalInvested
    : input.monthlyInvestment
      * ((((1 + monthlyRate) ** months) - 1) / monthlyRate)
      * (1 + monthlyRate);

  let balance = 0;
  let contributed = 0;
  const growth: GrowthPoint[] = [{ label: 'Start', period: 0, contributed: 0, value: 0 }];

  for (let month = 1; month <= months; month += 1) {
    contributed += input.monthlyInvestment;
    balance = (balance + input.monthlyInvestment) * (1 + monthlyRate);
    if (month % 12 === 0 || month === months) {
      const year = month / 12;
      growth.push({
        label: Number.isInteger(year) ? `Year ${year}` : `${year.toFixed(1)} years`,
        period: month,
        contributed,
        value: balance,
      });
    }
  }

  return {
    totalInvested,
    estimatedReturns: Math.max(0, futureValue - totalInvested),
    futureValue,
    months,
    growth,
  };
}
