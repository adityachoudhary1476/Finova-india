import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateIncomeTax } from '../tax/incomeTax';

const baseInput = {
  taxYearId: 'AY-2026-27',
  otherIncome: 0,
  deduction80C: 0,
  otherOldRegimeDeductions: 0,
};

test('applies the AY 2026-27 new-regime rebate to salaried income of ₹12.75 lakh', () => {
  const result = calculateIncomeTax({ ...baseInput, salaryIncome: 1_275_000 });
  assert.equal(result.newRegime.taxableIncome, 1_200_000);
  assert.equal(result.newRegime.taxBeforeRebate, 60_000);
  assert.equal(result.newRegime.rebate, 60_000);
  assert.equal(result.newRegime.totalTax, 0);
  assert.equal(result.oldRegime.totalTax, 187_200);
});

test('calculates new-regime tax and 4% cess above the rebate range', () => {
  const result = calculateIncomeTax({ ...baseInput, salaryIncome: 1_500_000 });
  assert.equal(result.newRegime.taxableIncome, 1_425_000);
  assert.equal(result.newRegime.taxAfterRebate, 93_750);
  assert.equal(result.newRegime.cess, 3_750);
  assert.equal(result.newRegime.totalTax, 97_500);
});

test('applies old-regime 80C and other deductions only to the old regime', () => {
  const result = calculateIncomeTax({
    ...baseInput,
    salaryIncome: 1_000_000,
    deduction80C: 200_000,
    otherOldRegimeDeductions: 50_000,
  });
  assert.equal(result.oldRegime.enteredDeductions, 200_000);
  assert.equal(result.oldRegime.taxableIncome, 750_000);
  assert.equal(result.newRegime.enteredDeductions, 0);
});

test('applies new-regime marginal relief just above ₹12 lakh taxable income', () => {
  const result = calculateIncomeTax({
    ...baseInput,
    salaryIncome: 0,
    otherIncome: 1_210_000,
  });
  assert.equal(result.newRegime.taxBeforeRebate, 61_500);
  assert.equal(result.newRegime.marginalRelief, 51_500);
  assert.equal(result.newRegime.taxAfterRebate, 10_000);
  assert.equal(result.newRegime.totalTax, 10_400);
});

test('calculates old-regime rebate and regime comparison', () => {
  const result = calculateIncomeTax({ ...baseInput, salaryIncome: 0, otherIncome: 500_000 });
  assert.equal(result.oldRegime.taxBeforeRebate, 12_500);
  assert.equal(result.oldRegime.rebate, 12_500);
  assert.equal(result.oldRegime.totalTax, 0);
  assert.equal(result.lowerTaxRegime, 'same');
});

test('rejects unsupported surcharge-range and invalid income', () => {
  assert.throws(() => calculateIncomeTax({ ...baseInput, salaryIncome: 5_000_001 }), RangeError);
  assert.throws(() => calculateIncomeTax({ ...baseInput, salaryIncome: -1 }), RangeError);
});
