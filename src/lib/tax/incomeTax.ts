import {
  DEFAULT_TAX_YEAR_ID,
  TAX_RULES,
  type TaxRegime,
  type TaxRegimeRules,
  type TaxYearRules,
} from '../../config/taxRules';
import { assertFiniteNonNegative } from '../calculators/shared';

export interface IncomeTaxInput {
  taxYearId: string;
  salaryIncome: number;
  otherIncome: number;
  deduction80C: number;
  otherOldRegimeDeductions: number;
}

export interface TaxSlabBreakdown {
  from: number;
  to: number | null;
  rate: number;
  taxableInSlab: number;
  tax: number;
}

export interface TaxRegimeResult {
  regime: TaxRegime;
  grossIncome: number;
  standardDeduction: number;
  enteredDeductions: number;
  totalDeductions: number;
  taxableIncome: number;
  taxBeforeRebate: number;
  rebate: number;
  marginalRelief: number;
  taxAfterRebate: number;
  cess: number;
  totalTax: number;
  effectiveTaxRate: number;
  slabs: readonly TaxSlabBreakdown[];
}

export interface IncomeTaxComparison {
  rules: TaxYearRules;
  newRegime: TaxRegimeResult;
  oldRegime: TaxRegimeResult;
  lowerTaxRegime: TaxRegime | 'same';
  taxDifference: number;
}

function calculateSlabTax(taxableIncome: number, rules: TaxRegimeRules): {
  tax: number;
  breakdown: readonly TaxSlabBreakdown[];
} {
  let lowerBound = 0;
  let tax = 0;
  const breakdown: TaxSlabBreakdown[] = [];

  for (const slab of rules.slabs) {
    const upperBound = slab.upTo ?? taxableIncome;
    const taxableInSlab = Math.max(0, Math.min(taxableIncome, upperBound) - lowerBound);
    const slabTax = taxableInSlab * slab.rate / 100;
    breakdown.push({
      from: lowerBound,
      to: slab.upTo,
      rate: slab.rate,
      taxableInSlab,
      tax: slabTax,
    });
    tax += slabTax;
    if (taxableIncome <= upperBound || slab.upTo === null) break;
    lowerBound = upperBound;
  }

  return { tax, breakdown };
}

function calculateRegime(
  input: IncomeTaxInput,
  yearRules: TaxYearRules,
  regime: TaxRegime,
): TaxRegimeResult {
  const rules = yearRules.regimes[regime];
  const grossIncome = input.salaryIncome + input.otherIncome;
  const standardDeduction = Math.min(input.salaryIncome, rules.salaryStandardDeduction);
  const enteredDeductions = rules.allowEnteredDeductions
    ? Math.min(input.deduction80C, rules.deduction80CLimit) + input.otherOldRegimeDeductions
    : 0;
  const totalDeductions = Math.min(grossIncome, standardDeduction + enteredDeductions);
  const taxableIncome = Math.max(0, grossIncome - totalDeductions);
  const slab = calculateSlabTax(taxableIncome, rules);

  let rebate = 0;
  let marginalRelief = 0;
  if (taxableIncome <= rules.rebateIncomeLimit) {
    rebate = Math.min(slab.tax, rules.maximumRebate);
  } else if (rules.marginalReliefAboveRebateLimit) {
    const excessIncome = taxableIncome - rules.rebateIncomeLimit;
    const taxWithoutRelief = slab.tax;
    if (taxWithoutRelief > excessIncome) marginalRelief = taxWithoutRelief - excessIncome;
  }
  const taxAfterRebate = Math.max(0, slab.tax - rebate - marginalRelief);
  const cess = taxAfterRebate * yearRules.cessRate / 100;
  const totalTax = taxAfterRebate + cess;

  return {
    regime,
    grossIncome,
    standardDeduction,
    enteredDeductions,
    totalDeductions,
    taxableIncome,
    taxBeforeRebate: slab.tax,
    rebate,
    marginalRelief,
    taxAfterRebate,
    cess,
    totalTax,
    effectiveTaxRate: grossIncome === 0 ? 0 : totalTax / grossIncome * 100,
    slabs: slab.breakdown,
  };
}

export function calculateIncomeTax(input: IncomeTaxInput): IncomeTaxComparison {
  assertFiniteNonNegative(input.salaryIncome, 'Salary income');
  assertFiniteNonNegative(input.otherIncome, 'Other income');
  assertFiniteNonNegative(input.deduction80C, '80C deduction');
  assertFiniteNonNegative(input.otherOldRegimeDeductions, 'Other deductions');

  const rules = TAX_RULES[input.taxYearId] ?? TAX_RULES[DEFAULT_TAX_YEAR_ID];
  if (!rules) throw new RangeError('Tax rules are unavailable for the selected year.');
  const grossIncome = input.salaryIncome + input.otherIncome;
  if (grossIncome > rules.maximumIncomeWithoutSurcharge) {
    throw new RangeError('This estimator currently supports total income up to ₹50 lakh without surcharge.');
  }

  const newRegime = calculateRegime(input, rules, 'new');
  const oldRegime = calculateRegime(input, rules, 'old');
  const taxDifference = Math.abs(newRegime.totalTax - oldRegime.totalTax);
  const lowerTaxRegime = newRegime.totalTax === oldRegime.totalTax
    ? 'same'
    : (newRegime.totalTax < oldRegime.totalTax ? 'new' : 'old');

  return { rules, newRegime, oldRegime, lowerTaxRegime, taxDifference };
}
