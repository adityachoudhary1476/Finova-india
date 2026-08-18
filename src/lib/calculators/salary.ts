import { assertFiniteNonNegative } from './shared';

export type SalaryBasis = 'ctc' | 'gross';

export interface SalaryInput {
  basis: SalaryBasis;
  annualAmount: number;
  annualBasicSalary: number;
  employerSideBenefits: number;
  employeeEpfRate: number;
  annualProfessionalTax: number;
  annualOtherDeductions: number;
}

export interface SalaryResult {
  annualCtc: number | null;
  annualGrossSalary: number;
  monthlyGrossSalary: number;
  employeeEpfContribution: number;
  professionalTax: number;
  otherDeductions: number;
  totalDeductions: number;
  annualTakeHome: number;
  monthlyInHand: number;
}

export function calculateSalary(input: SalaryInput): SalaryResult {
  assertFiniteNonNegative(input.annualAmount, 'Annual salary amount');
  assertFiniteNonNegative(input.annualBasicSalary, 'Basic salary');
  assertFiniteNonNegative(input.employerSideBenefits, 'Employer-side benefits');
  assertFiniteNonNegative(input.employeeEpfRate, 'Employee EPF rate');
  assertFiniteNonNegative(input.annualProfessionalTax, 'Professional tax');
  assertFiniteNonNegative(input.annualOtherDeductions, 'Other deductions');
  if (input.employeeEpfRate > 100) throw new RangeError('Employee EPF rate cannot exceed 100%.');

  const annualGrossSalary = input.basis === 'ctc'
    ? Math.max(0, input.annualAmount - input.employerSideBenefits)
    : input.annualAmount;
  if (input.annualBasicSalary > annualGrossSalary) {
    throw new RangeError('Basic salary cannot exceed annual gross salary.');
  }

  const employeeEpfContribution = input.annualBasicSalary * input.employeeEpfRate / 100;
  const totalDeductions = employeeEpfContribution
    + input.annualProfessionalTax
    + input.annualOtherDeductions;
  const annualTakeHome = Math.max(0, annualGrossSalary - totalDeductions);

  return {
    annualCtc: input.basis === 'ctc' ? input.annualAmount : null,
    annualGrossSalary,
    monthlyGrossSalary: annualGrossSalary / 12,
    employeeEpfContribution,
    professionalTax: input.annualProfessionalTax,
    otherDeductions: input.annualOtherDeductions,
    totalDeductions,
    annualTakeHome,
    monthlyInHand: annualTakeHome / 12,
  };
}
