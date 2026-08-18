import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateEpf } from '../calculators/epf';

test('separates employee and employer EPF contributions', () => {
  const result = calculateEpf({
    monthlyBasicSalary: 50_000,
    employeeContributionRate: 12,
    employerEpfContributionRate: 3.67,
    annualSalaryIncreaseRate: 0,
    currentEpfBalance: 100_000,
    years: 1,
    annualInterestRate: 0,
  });
  assert.equal(result.employeeContribution, 72_000);
  assert.equal(result.employerContribution, 22_020);
  assert.equal(result.estimatedCorpus, 194_020);
  assert.equal(result.estimatedInterest, 0);
});

test('projects salary growth and interest over multiple years', () => {
  const result = calculateEpf({
    monthlyBasicSalary: 40_000,
    employeeContributionRate: 12,
    employerEpfContributionRate: 3.67,
    annualSalaryIncreaseRate: 5,
    currentEpfBalance: 250_000,
    years: 20,
    annualInterestRate: 8.25,
  });
  assert.equal(result.schedule.length, 20);
  assert.ok(result.estimatedCorpus > result.currentBalance + result.totalNewContributions);
  assert.ok(Number.isFinite(result.estimatedCorpus));
});

test('rejects invalid rates and durations', () => {
  assert.throws(() => calculateEpf({
    monthlyBasicSalary: 40_000, employeeContributionRate: 101, employerEpfContributionRate: 3.67,
    annualSalaryIncreaseRate: 5, currentEpfBalance: 0, years: 20, annualInterestRate: 8.25,
  }), RangeError);
});
