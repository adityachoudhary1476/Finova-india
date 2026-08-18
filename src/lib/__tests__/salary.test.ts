import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateSalary } from '../calculators/salary';

test('estimates in-hand salary from CTC with transparent employer-side costs', () => {
  const result = calculateSalary({
    basis: 'ctc',
    annualAmount: 1_200_000,
    annualBasicSalary: 480_000,
    employerSideBenefits: 57_600,
    employeeEpfRate: 12,
    annualProfessionalTax: 2_400,
    annualOtherDeductions: 12_000,
  });
  assert.equal(result.annualGrossSalary, 1_142_400);
  assert.equal(result.employeeEpfContribution, 57_600);
  assert.equal(result.totalDeductions, 72_000);
  assert.equal(result.annualTakeHome, 1_070_400);
  assert.equal(result.monthlyInHand, 89_200);
});

test('supports gross salary input and zero optional deductions', () => {
  const result = calculateSalary({
    basis: 'gross',
    annualAmount: 600_000,
    annualBasicSalary: 300_000,
    employerSideBenefits: 0,
    employeeEpfRate: 0,
    annualProfessionalTax: 0,
    annualOtherDeductions: 0,
  });
  assert.equal(result.annualGrossSalary, 600_000);
  assert.equal(result.monthlyInHand, 50_000);
});

test('rejects a basic salary above gross salary', () => {
  assert.throws(() => calculateSalary({
    basis: 'gross', annualAmount: 500_000, annualBasicSalary: 600_000,
    employerSideBenefits: 0, employeeEpfRate: 12, annualProfessionalTax: 0, annualOtherDeductions: 0,
  }), RangeError);
});
