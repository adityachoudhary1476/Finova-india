import { calculateEmi, type EmiResult } from './emi';
import { assertFiniteNonNegative } from './shared';

export interface HomeLoanInput {
  loanAmount: number;
  annualRate: number;
  tenureMonths: number;
  processingFee: number;
}

export interface HomeLoanResult {
  emi: EmiResult;
  processingFee: number;
  totalOutflow: number;
}

export interface CarLoanInput {
  vehicleAmount: number;
  downPayment: number;
  annualRate: number;
  tenureMonths: number;
  processingFee: number;
}

export interface CarLoanResult {
  vehicleAmount: number;
  downPayment: number;
  financedAmount: number;
  emi: EmiResult;
  processingFee: number;
  totalOutflow: number;
}

export function calculateHomeLoan(input: HomeLoanInput): HomeLoanResult {
  assertFiniteNonNegative(input.processingFee, 'Processing fee');
  const emi = calculateEmi({
    principal: input.loanAmount,
    annualRate: input.annualRate,
    tenureMonths: input.tenureMonths,
  });
  return {
    emi,
    processingFee: input.processingFee,
    totalOutflow: emi.totalPayable + input.processingFee,
  };
}

export function calculateCarLoan(input: CarLoanInput): CarLoanResult {
  assertFiniteNonNegative(input.vehicleAmount, 'Car amount');
  assertFiniteNonNegative(input.downPayment, 'Down payment');
  assertFiniteNonNegative(input.processingFee, 'Processing fee');
  if (input.downPayment >= input.vehicleAmount) {
    throw new RangeError('Down payment must be less than the car amount.');
  }
  const financedAmount = input.vehicleAmount - input.downPayment;
  const emi = calculateEmi({
    principal: financedAmount,
    annualRate: input.annualRate,
    tenureMonths: input.tenureMonths,
  });
  return {
    vehicleAmount: input.vehicleAmount,
    downPayment: input.downPayment,
    financedAmount,
    emi,
    processingFee: input.processingFee,
    totalOutflow: input.downPayment + emi.totalPayable + input.processingFee,
  };
}
