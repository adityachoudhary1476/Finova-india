import {
  calculateCompoundInterest,
  type CompoundingFrequency,
} from './compoundInterest';

export type FdCompoundingFrequency = Exclude<CompoundingFrequency, 'daily'>;

export interface FdInput {
  depositAmount: number;
  annualRate: number;
  years: number;
  frequency: FdCompoundingFrequency;
}

export interface FdResult {
  principal: number;
  interestEarned: number;
  maturityAmount: number;
  growth: ReturnType<typeof calculateCompoundInterest>['growth'];
}

export function calculateFd(input: FdInput): FdResult {
  const result = calculateCompoundInterest({
    principal: input.depositAmount,
    annualRate: input.annualRate,
    years: input.years,
    frequency: input.frequency,
  });
  return {
    principal: result.principal,
    interestEarned: result.interestEarned,
    maturityAmount: result.finalAmount,
    growth: result.growth,
  };
}
