import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateFd } from '../calculators/fd';

function approximately(actual: number, expected: number, tolerance = 0.1): void {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} is not within ${tolerance} of ${expected}`);
}

test('calculates a quarterly-compounded fixed deposit', () => {
  const result = calculateFd({ depositAmount: 100_000, annualRate: 7, years: 5, frequency: 'quarterly' });
  approximately(result.maturityAmount, 141_477.82);
  approximately(result.interestEarned, 41_477.82);
});

test('supports zero interest and decimal tenure', () => {
  const result = calculateFd({ depositAmount: 250_000, annualRate: 0, years: 1.5, frequency: 'monthly' });
  assert.equal(result.maturityAmount, 250_000);
  assert.equal(result.interestEarned, 0);
});

test('rejects negative deposits', () => {
  assert.throws(() => calculateFd({ depositAmount: -1, annualRate: 7, years: 2, frequency: 'yearly' }), RangeError);
});
