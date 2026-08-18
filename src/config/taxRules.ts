export type TaxRegime = 'new' | 'old';

export interface TaxSlab {
  upTo: number | null;
  rate: number;
}

export interface TaxRegimeRules {
  label: string;
  slabs: readonly TaxSlab[];
  salaryStandardDeduction: number;
  rebateIncomeLimit: number;
  maximumRebate: number;
  allowEnteredDeductions: boolean;
  deduction80CLimit: number;
  marginalReliefAboveRebateLimit: boolean;
}

export interface TaxYearRules {
  id: string;
  label: string;
  financialYear: string;
  assessmentYear: string;
  cessRate: number;
  maximumIncomeWithoutSurcharge: number;
  regimes: Readonly<Record<TaxRegime, TaxRegimeRules>>;
}

/**
 * AY 2026-27 / FY 2025-26 rules for a resident individual below 60 with
 * normal slab-rate salary/other income. Special-rate income and surcharge
 * are intentionally outside this focused estimator.
 *
 * Sources reviewed:
 * https://www.incometax.gov.in/iec/foportal/help/individual/return-applicable-1
 * https://www.incometax.gov.in/iec/foportal/help/all-topics/e-filing-services/itr-2/itr-2-faqs
 */
export const TAX_RULES: Readonly<Record<string, TaxYearRules>> = {
  'AY-2026-27': {
    id: 'AY-2026-27',
    label: 'AY 2026-27 (FY 2025-26)',
    financialYear: 'FY 2025-26',
    assessmentYear: 'AY 2026-27',
    cessRate: 4,
    maximumIncomeWithoutSurcharge: 5_000_000,
    regimes: {
      new: {
        label: 'New tax regime',
        slabs: [
          { upTo: 400_000, rate: 0 },
          { upTo: 800_000, rate: 5 },
          { upTo: 1_200_000, rate: 10 },
          { upTo: 1_600_000, rate: 15 },
          { upTo: 2_000_000, rate: 20 },
          { upTo: 2_400_000, rate: 25 },
          { upTo: null, rate: 30 },
        ],
        salaryStandardDeduction: 75_000,
        rebateIncomeLimit: 1_200_000,
        maximumRebate: 60_000,
        allowEnteredDeductions: false,
        deduction80CLimit: 0,
        marginalReliefAboveRebateLimit: true,
      },
      old: {
        label: 'Old tax regime',
        slabs: [
          { upTo: 250_000, rate: 0 },
          { upTo: 500_000, rate: 5 },
          { upTo: 1_000_000, rate: 20 },
          { upTo: null, rate: 30 },
        ],
        salaryStandardDeduction: 50_000,
        rebateIncomeLimit: 500_000,
        maximumRebate: 12_500,
        allowEnteredDeductions: true,
        deduction80CLimit: 150_000,
        marginalReliefAboveRebateLimit: false,
      },
    },
  },
};

export const DEFAULT_TAX_YEAR_ID = 'AY-2026-27';
