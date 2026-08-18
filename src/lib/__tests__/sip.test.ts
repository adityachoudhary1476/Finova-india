import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateSip } from '../calculators/sip';

function approximately(actual: number, expected: number, tolerance = 1): void {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} is not within ${tolerance} of ${expected}`);
}

test('calculates monthly SIP contributions at the beginning of each month', () => {
  const result = calculateSip({ monthlyInvestment: 10_000, annualRate: 12, years: 15 });
  assert.equal(result.totalInvested, 1_800_000);
  approximately(result.futureValue, 5_045_760.02, 1);
  approximately(result.estimatedReturns, 3_245_760.02, 1);
  assert.equal(result.growth.length, 16);
});

test('supports a zero-return estimate', () => {
  const result = calculateSip({ monthlyInvestment: 5_000, annualRate: 0, years: 2.5 });
  assert.equal(result.totalInvested, 150_000);
  assert.equal(result.futureValue, 150_000);
  assert.equal(result.estimatedReturns, 0);
});

test('rejects invalid durations and remains finite for high values', () => {
  const result = calculateSip({ monthlyInvestment: 1_000_000, annualRate: 30, years: 50 });
  assert.ok(Number.isFinite(result.futureValue));
  assert.throws(() => calculateSip({ monthlyInvestment: 5_000, annualRate: 12, years: 0 }), RangeError);
});
