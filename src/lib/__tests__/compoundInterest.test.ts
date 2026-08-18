import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateCompoundInterest } from '../calculators/compoundInterest';

function approximately(actual: number, expected: number, tolerance = 0.01): void {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} is not within ${tolerance} of ${expected}`);
}

test('calculates quarterly compound interest', () => {
  const result = calculateCompoundInterest({
    principal: 100_000,
    annualRate: 10,
    years: 5,
    frequency: 'quarterly',
  });
  approximately(result.finalAmount, 163_861.64, 0.1);
  approximately(result.interestEarned, 63_861.64, 0.1);
  assert.equal(result.growth.length, 6);
});

test('higher compounding frequency produces a higher final amount', () => {
  const yearly = calculateCompoundInterest({ principal: 100_000, annualRate: 8, years: 10, frequency: 'yearly' });
  const monthly = calculateCompoundInterest({ principal: 100_000, annualRate: 8, years: 10, frequency: 'monthly' });
  const daily = calculateCompoundInterest({ principal: 100_000, annualRate: 8, years: 10, frequency: 'daily' });
  assert.ok(monthly.finalAmount > yearly.finalAmount);
  assert.ok(daily.finalAmount > monthly.finalAmount);
});

test('supports zero rates and decimal time periods', () => {
  const result = calculateCompoundInterest({ principal: 250_000, annualRate: 0, years: 2.5, frequency: 'monthly' });
  assert.equal(result.finalAmount, 250_000);
  assert.equal(result.interestEarned, 0);
  assert.equal(result.growth.at(-1)?.period, 2.5);
});

test('rejects invalid principal and duration values', () => {
  assert.throws(() => calculateCompoundInterest({ principal: Number.NaN, annualRate: 8, years: 5, frequency: 'yearly' }), RangeError);
  assert.throws(() => calculateCompoundInterest({ principal: 1_000, annualRate: 8, years: -2, frequency: 'yearly' }), RangeError);
});
