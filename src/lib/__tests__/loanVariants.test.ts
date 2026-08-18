import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateCarLoan, calculateHomeLoan } from '../calculators/loanVariants';

function approximately(actual: number, expected: number, tolerance = 0.1): void {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} is not within ${tolerance} of ${expected}`);
}

test('home loan reuses reducing-balance EMI and adds the processing fee transparently', () => {
  const result = calculateHomeLoan({
    loanAmount: 5_000_000,
    annualRate: 8.5,
    tenureMonths: 240,
    processingFee: 10_000,
  });
  approximately(result.emi.monthlyEmi, 43_391.16);
  approximately(result.totalOutflow, result.emi.totalPayable + 10_000, 0.01);
  assert.equal(result.emi.schedule.length, 20);
});

test('car loan subtracts down payment before calculating EMI', () => {
  const result = calculateCarLoan({
    vehicleAmount: 1_000_000,
    downPayment: 200_000,
    annualRate: 9,
    tenureMonths: 60,
    processingFee: 5_000,
  });
  assert.equal(result.financedAmount, 800_000);
  approximately(result.emi.monthlyEmi, 16_606.68);
  approximately(result.emi.totalInterest, 196_400.62, 1);
});

test('loan variants reject invalid fees and down payments', () => {
  assert.throws(() => calculateHomeLoan({ loanAmount: 1_000_000, annualRate: 8, tenureMonths: 120, processingFee: -1 }), RangeError);
  assert.throws(() => calculateCarLoan({ vehicleAmount: 500_000, downPayment: 500_000, annualRate: 9, tenureMonths: 60, processingFee: 0 }), RangeError);
});
