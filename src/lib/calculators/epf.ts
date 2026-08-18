import { assertFiniteNonNegative, assertFinitePositive, type GrowthPoint } from './shared';

export interface EpfInput {
  monthlyBasicSalary: number;
  employeeContributionRate: number;
  employerEpfContributionRate: number;
  annualSalaryIncreaseRate: number;
  currentEpfBalance: number;
  years: number;
  annualInterestRate: number;
}

export interface EpfScheduleYear {
  year: number;
  monthlyBasicSalary: number;
  employeeContribution: number;
  employerContribution: number;
  interestEarned: number;
  closingBalance: number;
}

export interface EpfResult {
  currentBalance: number;
  employeeContribution: number;
  employerContribution: number;
  totalNewContributions: number;
  estimatedInterest: number;
  estimatedCorpus: number;
  schedule: readonly EpfScheduleYear[];
  growth: readonly GrowthPoint[];
}

export function calculateEpf(input: EpfInput): EpfResult {
  assertFiniteNonNegative(input.monthlyBasicSalary, 'Monthly basic salary');
  assertFiniteNonNegative(input.employeeContributionRate, 'Employee contribution rate');
  assertFiniteNonNegative(input.employerEpfContributionRate, 'Employer EPF contribution rate');
  assertFiniteNonNegative(input.annualSalaryIncreaseRate, 'Annual salary increase');
  assertFiniteNonNegative(input.currentEpfBalance, 'Current EPF balance');
  assertFinitePositive(input.years, 'Years to retirement');
  assertFiniteNonNegative(input.annualInterestRate, 'EPF interest rate');
  if (!Number.isInteger(input.years)) throw new RangeError('Years to retirement must be a whole number.');
  if (input.employeeContributionRate > 100 || input.employerEpfContributionRate > 100) {
    throw new RangeError('Contribution rates cannot exceed 100%.');
  }

  let balance = input.currentEpfBalance;
  let monthlyBasic = input.monthlyBasicSalary;
  let employeeContribution = 0;
  let employerContribution = 0;
  let totalInterest = 0;
  const monthlyInterestRate = input.annualInterestRate / 12 / 100;
  const schedule: EpfScheduleYear[] = [];
  const growth: GrowthPoint[] = [{
    label: 'Current',
    period: 0,
    contributed: input.currentEpfBalance,
    value: input.currentEpfBalance,
  }];

  for (let year = 1; year <= input.years; year += 1) {
    const salaryForYear = monthlyBasic;
    let employeeForYear = 0;
    let employerForYear = 0;
    let interestForYear = 0;
    for (let month = 1; month <= 12; month += 1) {
      const employee = monthlyBasic * input.employeeContributionRate / 100;
      const employer = monthlyBasic * input.employerEpfContributionRate / 100;
      balance += employee + employer;
      employeeForYear += employee;
      employerForYear += employer;
      employeeContribution += employee;
      employerContribution += employer;
      const interest = balance * monthlyInterestRate;
      balance += interest;
      interestForYear += interest;
      totalInterest += interest;
    }
    schedule.push({
      year,
      monthlyBasicSalary: salaryForYear,
      employeeContribution: employeeForYear,
      employerContribution: employerForYear,
      interestEarned: interestForYear,
      closingBalance: balance,
    });
    growth.push({
      label: `Year ${year}`,
      period: year,
      contributed: input.currentEpfBalance + employeeContribution + employerContribution,
      value: balance,
    });
    monthlyBasic *= 1 + input.annualSalaryIncreaseRate / 100;
  }

  return {
    currentBalance: input.currentEpfBalance,
    employeeContribution,
    employerContribution,
    totalNewContributions: employeeContribution + employerContribution,
    estimatedInterest: totalInterest,
    estimatedCorpus: balance,
    schedule,
    growth,
  };
}
