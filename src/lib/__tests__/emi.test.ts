import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateEmi } from '../calculators/emi';

function approximately(actual: number, expected: number, tolerance = 0.01): void {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} is not within ${tolerance} of ${expected}`);
}

test('calculates a standard reducing-balance EMI', () => {
  const result = calculateEmi({ principal: 5_000_000, annualRate: 8.5, tenureMonths: 240 });
  approximately(result.monthlyEmi, 43_391.16, 0.01);
  approximately(result.totalInterest, 5_413_878.80, 0.01);
  assert.equal(result.schedule.length, 20);
  approximately(result.schedule.at(-1)?.closingBalance ?? -1, 0, 0.01);
});

test('supports a mathematically valid zero interest loan', () => {
  const result = calculateEmi({ principal: 120_000, annualRate: 0, tenureMonths: 12 });
  assert.equal(result.monthlyEmi, 10_000);
  assert.equal(result.totalInterest, 0);
  assert.equal(result.totalPayable, 120_000);
});

test('remains finite for a large loan and rejects malformed inputs', () => {
  const result = calculateEmi({ principal: 100_000_000, annualRate: 24, tenureMonths: 480 });
  assert.ok(Number.isFinite(result.monthlyEmi));
  assert.throws(() => calculateEmi({ principal: -1, annualRate: 8, tenureMonths: 120 }), RangeError);
  assert.throws(() => calculateEmi({ principal: 1_000, annualRate: 8, tenureMonths: 0 }), RangeError);
});
