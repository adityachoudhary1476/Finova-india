/**
 * Central assumptions used by calculators whose statutory or notified values can change.
 * Review these values before each financial year release.
 */
export const FINANCIAL_RULES = {
  gratuity: {
    daysOfWagesPerYear: 15,
    workingDaysDivisor: 26,
    standardEligibilityYears: 5,
    roundUpAfterCompletedMonths: 6,
    currentMaximumRupees: 2_000_000,
    sourceUpdated: '2026-01',
  },
  ppf: {
    defaultAnnualRate: 7.1,
    minimumAnnualContribution: 500,
    maximumAnnualContribution: 150_000,
    standardMinimumYears: 15,
    sourceUpdated: '2026-05',
  },
  epf: {
    defaultAnnualRate: 8.25,
    defaultEmployeeContributionRate: 12,
    defaultEmployerEpfContributionRate: 3.67,
    defaultAnnualSalaryIncrease: 5,
    sourceUpdated: '2025-10',
  },
} as const;
