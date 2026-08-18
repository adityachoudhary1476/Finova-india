import { assertFiniteNonNegative } from './shared';

export type GstDirection = 'add' | 'remove';

export interface GstInput {
  amount: number;
  rate: number;
  direction: GstDirection;
}

export interface GstResult {
  direction: GstDirection;
  baseAmount: number;
  gstAmount: number;
  inclusiveAmount: number;
  rate: number;
}

export function calculateGst(input: GstInput): GstResult {
  assertFiniteNonNegative(input.amount, 'Amount');
  assertFiniteNonNegative(input.rate, 'GST rate');
  if (input.rate > 100) throw new RangeError('GST rate cannot exceed 100%.');

  if (input.direction === 'add') {
    const gstAmount = input.amount * input.rate / 100;
    return {
      direction: input.direction,
      baseAmount: input.amount,
      gstAmount,
      inclusiveAmount: input.amount + gstAmount,
      rate: input.rate,
    };
  }
  if (input.direction !== 'remove') throw new RangeError('Choose a valid GST direction.');

  const baseAmount = input.amount / (1 + input.rate / 100);
  return {
    direction: input.direction,
    baseAmount,
    gstAmount: input.amount - baseAmount,
    inclusiveAmount: input.amount,
    rate: input.rate,
  };
}
