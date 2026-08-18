import { FINANCIAL_RULES } from '../../config/financialRules';
import { assertFiniteNonNegative } from './shared';

export interface GratuityInput {
  monthlyBasicSalary: number;
  monthlyDearnessAllowance: number;
  serviceYears: number;
  serviceMonths: number;
}

export interface GratuityResult {
  eligibleMonthlyWage: number;
  completedServiceYears: number;
  uncappedGratuity: number;
  estimatedGratuity: number;
  statutoryCapApplied: boolean;
  meetsStandardEligibility: boolean;
}

export function calculateGratuity(input: GratuityInput): GratuityResult {
  assertFiniteNonNegative(input.monthlyBasicSalary, 'Basic salary');
  assertFiniteNonNegative(input.monthlyDearnessAllowance, 'Dearness allowance');
  assertFiniteNonNegative(input.serviceYears, 'Years of service');
  assertFiniteNonNegative(input.serviceMonths, 'Months of service');
  if (!Number.isInteger(input.serviceYears) || !Number.isInteger(input.serviceMonths)) {
    throw new RangeError('Service years and months must be whole numbers.');
  }
  if (input.serviceMonths > 11) throw new RangeError('Service months must be between 0 and 11.');

  const rules = FINANCIAL_RULES.gratuity;
  const completedServiceYears = input.serviceYears
    + (input.serviceMonths > rules.roundUpAfterCompletedMonths ? 1 : 0);
  const eligibleMonthlyWage = input.monthlyBasicSalary + input.monthlyDearnessAllowance;
  const uncappedGratuity = eligibleMonthlyWage
    * rules.daysOfWagesPerYear
    / rules.workingDaysDivisor
    * completedServiceYears;
  const estimatedGratuity = Math.min(uncappedGratuity, rules.currentMaximumRupees);

  return {
    eligibleMonthlyWage,
    completedServiceYears,
    uncappedGratuity,
    estimatedGratuity,
    statutoryCapApplied: estimatedGratuity < uncappedGratuity,
    meetsStandardEligibility: input.serviceYears >= rules.standardEligibilityYears,
  };
}
