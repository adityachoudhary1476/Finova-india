import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateGst } from '../calculators/gst';

function approximately(actual: number, expected: number, tolerance = 0.01): void {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} is not within ${tolerance} of ${expected}`);
}

test('adds GST to a base amount', () => {
  const result = calculateGst({ amount: 100_000, rate: 18, direction: 'add' });
  assert.equal(result.baseAmount, 100_000);
  assert.equal(result.gstAmount, 18_000);
  assert.equal(result.inclusiveAmount, 118_000);
});

test('removes GST from an inclusive amount', () => {
  const result = calculateGst({ amount: 118_000, rate: 18, direction: 'remove' });
  approximately(result.baseAmount, 100_000);
  approximately(result.gstAmount, 18_000);
});

test('supports multiple and zero GST rates and rejects invalid rates', () => {
  assert.equal(calculateGst({ amount: 1_000, rate: 5, direction: 'add' }).gstAmount, 50);
  assert.equal(calculateGst({ amount: 1_000, rate: 0, direction: 'add' }).inclusiveAmount, 1_000);
  assert.throws(() => calculateGst({ amount: 1_000, rate: 101, direction: 'add' }), RangeError);
});
