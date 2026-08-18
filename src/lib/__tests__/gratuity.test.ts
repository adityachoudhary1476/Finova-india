import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateGratuity } from '../calculators/gratuity';

function approximately(actual: number, expected: number, tolerance = 0.01): void {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} is not within ${tolerance} of ${expected}`);
}

test('uses basic plus DA and rounds service over six months to the next year', () => {
  const result = calculateGratuity({
    monthlyBasicSalary: 50_000,
    monthlyDearnessAllowance: 5_000,
    serviceYears: 7,
    serviceMonths: 7,
  });
  assert.equal(result.eligibleMonthlyWage, 55_000);
  assert.equal(result.completedServiceYears, 8);
  approximately(result.estimatedGratuity, 253_846.153846);
  assert.equal(result.meetsStandardEligibility, true);
});

test('does not round exactly six additional months', () => {
  const result = calculateGratuity({ monthlyBasicSalary: 40_000, monthlyDearnessAllowance: 0, serviceYears: 5, serviceMonths: 6 });
  assert.equal(result.completedServiceYears, 5);
});

test('flags standard eligibility and applies the configured cap', () => {
  const ineligible = calculateGratuity({ monthlyBasicSalary: 30_000, monthlyDearnessAllowance: 0, serviceYears: 3, serviceMonths: 0 });
  assert.equal(ineligible.meetsStandardEligibility, false);
  const capped = calculateGratuity({ monthlyBasicSalary: 1_000_000, monthlyDearnessAllowance: 0, serviceYears: 40, serviceMonths: 0 });
  assert.equal(capped.estimatedGratuity, 2_000_000);
  assert.equal(capped.statutoryCapApplied, true);
});
