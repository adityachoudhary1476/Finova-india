import { FINANCIAL_RULES } from '../../config/financialRules';
import { assertFiniteNonNegative, assertFinitePositive, type GrowthPoint } from './shared';

export type PpfContributionFrequency = 'annual' | 'monthly';

export interface PpfInput {
  contributionAmount: number;
  contributionFrequency: PpfContributionFrequency;
  years: number;
  annualRate: number;
}

export interface PpfScheduleYear {
  year: number;
  openingBalance: number;
  deposits: number;
  interestEarned: number;
  closingBalance: number;
}

export interface PpfResult {
  totalDeposits: number;
  interestEarned: number;
  maturityAmount: number;
  schedule: readonly PpfScheduleYear[];
  growth: readonly GrowthPoint[];
}

export function calculatePpf(input: PpfInput): PpfResult {
  assertFiniteNonNegative(input.contributionAmount, 'PPF contribution');
  assertFinitePositive(input.years, 'PPF duration');
  assertFiniteNonNegative(input.annualRate, 'PPF interest rate');
  if (!Number.isInteger(input.years)) throw new RangeError('PPF duration must be a whole number of years.');

  const rules = FINANCIAL_RULES.ppf;
  const annualContribution = input.contributionFrequency === 'annual'
    ? input.contributionAmount
    : input.contributionAmount * 12;
  if (annualContribution < rules.minimumAnnualContribution || annualContribution > rules.maximumAnnualContribution) {
    throw new RangeError('Annualised PPF contribution is outside the supported PPF limits.');
  }

  let balance = 0;
  let totalDeposits = 0;
  const schedule: PpfScheduleYear[] = [];
  const growth: GrowthPoint[] = [{ label: 'Start', period: 0, contributed: 0, value: 0 }];
  const monthlyRate = input.annualRate / 12 / 100;

  for (let year = 1; year <= input.years; year += 1) {
    const openingBalance = balance;
    let deposits = 0;
    let accruedInterest = 0;
    for (let month = 1; month <= 12; month += 1) {
      const deposit = input.contributionFrequency === 'annual'
        ? (month === 1 ? input.contributionAmount : 0)
        : input.contributionAmount;
      balance += deposit;
      deposits += deposit;
      totalDeposits += deposit;
      accruedInterest += balance * monthlyRate;
    }
    balance += accruedInterest;
    schedule.push({
      year,
      openingBalance,
      deposits,
      interestEarned: accruedInterest,
      closingBalance: balance,
    });
    growth.push({
      label: `Year ${year}`,
      period: year,
      contributed: totalDeposits,
      value: balance,
    });
  }

  return {
    totalDeposits,
    interestEarned: Math.max(0, balance - totalDeposits),
    maturityAmount: balance,
    schedule,
    growth,
  };
}
