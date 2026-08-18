import assert from 'node:assert/strict';
import test from 'node:test';
import { calculatePpf } from '../calculators/ppf';

function approximately(actual: number, expected: number, tolerance = 1): void {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} is not within ${tolerance} of ${expected}`);
}

test('projects annual PPF deposits with yearly interest credit', () => {
  const result = calculatePpf({ contributionAmount: 150_000, contributionFrequency: 'annual', years: 15, annualRate: 7.1 });
  assert.equal(result.totalDeposits, 2_250_000);
  approximately(result.maturityAmount, 4_068_209.22, 1);
  assert.equal(result.schedule.length, 15);
  assert.equal(result.growth.length, 16);
});

test('supports monthly contributions within the annual limit', () => {
  const result = calculatePpf({ contributionAmount: 5_000, contributionFrequency: 'monthly', years: 15, annualRate: 7.1 });
  assert.equal(result.totalDeposits, 900_000);
  assert.ok(result.interestEarned > 0);
});

test('rejects contributions outside configured annual limits', () => {
  assert.throws(() => calculatePpf({ contributionAmount: 200_000, contributionFrequency: 'annual', years: 15, annualRate: 7.1 }), RangeError);
});
