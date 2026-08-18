import assert from 'node:assert/strict';
import test from 'node:test';
import { formatIndianNumber, formatINR, parseNumericInput } from '../formatters';

test('formats numbers with Indian comma grouping', () => {
  assert.equal(formatIndianNumber(1_000), '1,000');
  assert.equal(formatIndianNumber(100_000), '1,00,000');
  assert.equal(formatIndianNumber(1_000_000), '10,00,000');
  assert.equal(formatIndianNumber(10_000_000), '1,00,00,000');
  assert.equal(formatINR(1_000_000), '₹10,00,000');
});

test('parses formatted financial input without using the display string in calculations', () => {
  assert.equal(parseNumericInput('₹10,00,000'), 1_000_000);
  assert.equal(parseNumericInput('8.5%'), 8.5);
  assert.equal(parseNumericInput(''), null);
  assert.equal(parseNumericInput('not a number'), null);
});
