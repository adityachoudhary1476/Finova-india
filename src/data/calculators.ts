import type { CalculatorCategory, CalculatorItem } from './types';

type CalculatorSeed = Omit<
  CalculatorItem,
  'slug' | 'availability' | 'route' | 'seoTitle' | 'seoDescription' | 'relatedCalculatorIds'
>;

type LiveCalculatorMetadata = Pick<
  CalculatorItem,
  'slug' | 'route' | 'seoTitle' | 'seoDescription' | 'relatedCalculatorIds'
>;

const liveCalculatorMetadata: Readonly<Record<string, LiveCalculatorMetadata>> = {
  'emi-calculator': {
    slug: 'emi',
    route: '/calculators/emi',
    seoTitle: 'EMI Calculator — Calculate Monthly Loan Payments | Finova',
    seoDescription: 'Calculate loan EMI, total interest and repayment amount with an annual amortisation schedule. Free, instant and formatted for India.',
    relatedCalculatorIds: ['home-loan-emi-calculator', 'car-loan-emi-calculator'],
  },
  'sip-calculator': {
    slug: 'sip',
    route: '/calculators/sip',
    seoTitle: 'SIP Calculator — Estimate Investment Growth | Finova',
    seoDescription: 'Estimate SIP future value, total contributions and potential returns with Indian rupee formatting. No signup required.',
    relatedCalculatorIds: ['compound-interest-calculator', 'ppf-calculator', 'fd-calculator'],
  },
  'compound-interest-calculator': {
    slug: 'compound-interest',
    route: '/calculators/compound-interest',
    seoTitle: 'Compound Interest Calculator — Calculate Investment Growth | Finova',
    seoDescription: 'Calculate compound interest for yearly, half-yearly, quarterly, monthly or daily compounding and see growth over time.',
    relatedCalculatorIds: ['sip-calculator', 'fd-calculator', 'ppf-calculator'],
  },
  'home-loan-emi-calculator': {
    slug: 'home-loan-emi',
    route: '/calculators/home-loan-emi',
    seoTitle: 'Home Loan EMI Calculator — Calculate Monthly EMI | Finova',
    seoDescription: 'Calculate home loan EMI, total interest, repayment cost and an annual amortisation schedule with Indian rupee formatting.',
    relatedCalculatorIds: ['emi-calculator', 'car-loan-emi-calculator'],
  },
  'car-loan-emi-calculator': {
    slug: 'car-loan-emi',
    route: '/calculators/car-loan-emi',
    seoTitle: 'Car Loan EMI Calculator — Calculate Car Loan EMI | Finova',
    seoDescription: 'Estimate car loan EMI after down payment, total interest, processing fee and repayment schedule.',
    relatedCalculatorIds: ['emi-calculator', 'home-loan-emi-calculator'],
  },
  'salary-calculator': {
    slug: 'salary',
    route: '/calculators/salary',
    seoTitle: 'Salary Calculator — Calculate In-Hand Salary | Finova',
    seoDescription: 'Estimate monthly in-hand salary from CTC or gross salary after EPF, professional tax and other deductions.',
    relatedCalculatorIds: ['epf-calculator', 'gratuity-calculator', 'income-tax-calculator'],
  },
  'fd-calculator': {
    slug: 'fd',
    route: '/calculators/fd',
    seoTitle: 'FD Calculator — Calculate Fixed Deposit Maturity | Finova',
    seoDescription: 'Calculate fixed deposit maturity amount and interest for monthly, quarterly, half-yearly or yearly compounding.',
    relatedCalculatorIds: ['ppf-calculator', 'compound-interest-calculator'],
  },
  'gratuity-calculator': {
    slug: 'gratuity',
    route: '/calculators/gratuity',
    seoTitle: 'Gratuity Calculator — Estimate Gratuity | Finova',
    seoDescription: 'Estimate gratuity from last drawn basic salary, dearness allowance and completed service using configurable Indian rules.',
    relatedCalculatorIds: ['salary-calculator', 'epf-calculator', 'income-tax-calculator'],
  },
  'ppf-calculator': {
    slug: 'ppf',
    route: '/calculators/ppf',
    seoTitle: 'PPF Calculator — Calculate PPF Maturity | Finova',
    seoDescription: 'Estimate PPF deposits, interest and maturity value with an editable interest-rate assumption and year-wise schedule.',
    relatedCalculatorIds: ['fd-calculator', 'sip-calculator', 'compound-interest-calculator'],
  },
  'epf-calculator': {
    slug: 'epf',
    route: '/calculators/epf',
    seoTitle: 'EPF Calculator — Estimate EPF Corpus | Finova',
    seoDescription: 'Estimate EPF employee and employer contributions, interest and retirement corpus with salary growth assumptions.',
    relatedCalculatorIds: ['salary-calculator', 'ppf-calculator'],
  },
  'gst-calculator': {
    slug: 'gst',
    route: '/calculators/gst',
    seoTitle: 'GST Calculator — Add or Remove GST | Finova',
    seoDescription: 'Add GST to a base amount or remove GST from an inclusive amount using common or custom GST rates.',
    relatedCalculatorIds: ['income-tax-calculator'],
  },
  'income-tax-calculator': {
    slug: 'income-tax',
    route: '/calculators/income-tax',
    seoTitle: 'Income Tax Calculator — Estimate Indian Income Tax | Finova',
    seoDescription: 'Compare estimated old and new regime income tax for AY 2026-27 with deductions, rebate, slab breakdown and cess.',
    relatedCalculatorIds: ['salary-calculator', 'epf-calculator', 'gst-calculator'],
  },
};

function slugFromId(id: string): string {
  return id.replace(/-calculator$/, '');
}

function createCalculator(seed: CalculatorSeed): CalculatorItem {
  const liveMetadata = liveCalculatorMetadata[seed.id];
  const slug = liveMetadata?.slug ?? slugFromId(seed.id);

  return {
    ...seed,
    slug,
    availability: liveMetadata ? 'live' : 'planned',
    route: liveMetadata?.route ?? `/calculators/${slug}`,
    seoTitle: liveMetadata?.seoTitle ?? `${seed.name} | Finova`,
    seoDescription: liveMetadata?.seoDescription ?? seed.description,
    relatedCalculatorIds: liveMetadata?.relatedCalculatorIds ?? [],
  };
}

const calculatorSeeds: readonly CalculatorSeed[] = [
  {
    id: 'emi-calculator',
    name: 'EMI Calculator',
    shortName: 'EMI',
    description: 'Calculate your monthly loan payment and total interest.',
    category: 'loans',
    icon: 'calculator',
    aliases: ['loan', 'monthly instalment', 'equated monthly installment'],
    status: 'popular',
  },
  {
    id: 'home-loan-emi-calculator',
    name: 'Home Loan EMI Calculator',
    shortName: 'Home Loan EMI',
    description: 'Plan monthly repayments for a home loan.',
    category: 'loans',
    icon: 'landmark',
    aliases: ['home', 'housing loan', 'mortgage', 'house loan', 'home emi'],
    status: 'catalogue',
  },
  {
    id: 'car-loan-emi-calculator',
    name: 'Car Loan EMI Calculator',
    shortName: 'Car Loan EMI',
    description: 'Estimate repayments for a new or used car loan.',
    category: 'loans',
    icon: 'calculator',
    aliases: ['car', 'vehicle loan', 'auto loan', 'car emi'],
    status: 'catalogue',
  },
  {
    id: 'personal-loan-emi-calculator',
    name: 'Personal Loan EMI Calculator',
    shortName: 'Personal Loan EMI',
    description: 'Work out monthly repayments for a personal loan.',
    category: 'loans',
    icon: 'wallet',
    aliases: ['unsecured loan'],
    status: 'catalogue',
  },
  {
    id: 'sip-calculator',
    name: 'SIP Calculator',
    shortName: 'SIP',
    description: 'Estimate how your monthly investments could grow.',
    category: 'investments',
    icon: 'trending-up',
    aliases: ['mutual fund', 'monthly investment', 'systematic investment plan'],
    status: 'popular',
  },
  {
    id: 'lumpsum-calculator',
    name: 'Lumpsum Calculator',
    shortName: 'Lumpsum',
    description: 'Project growth on a one-time investment.',
    category: 'investments',
    icon: 'chart',
    aliases: ['one time investment', 'mutual fund'],
    status: 'catalogue',
  },
  {
    id: 'cagr-calculator',
    name: 'CAGR Calculator',
    shortName: 'CAGR',
    description: 'Measure annualised investment growth over time.',
    category: 'investments',
    icon: 'percent',
    aliases: ['annual growth', 'return rate'],
    status: 'catalogue',
  },
  {
    id: 'roi-calculator',
    name: 'ROI Calculator',
    shortName: 'ROI',
    description: 'Compare the return earned against investment cost.',
    category: 'investments',
    icon: 'percent',
    aliases: ['return on investment', 'profit'],
    status: 'catalogue',
  },
  {
    id: 'compound-interest-calculator',
    name: 'Compound Interest Calculator',
    shortName: 'Compound Interest',
    description: 'See how your money compounds over time.',
    category: 'investments',
    icon: 'chart',
    aliases: ['compounding', 'interest growth'],
    status: 'popular',
  },
  {
    id: 'income-tax-calculator',
    name: 'Income Tax Calculator',
    shortName: 'Income Tax',
    description: 'Estimate tax under the new and old regimes.',
    category: 'tax',
    icon: 'receipt',
    aliases: ['tax', 'income tax', 'new regime', 'old regime', 'itr', 'tax comparison'],
    status: 'popular',
  },
  {
    id: 'gst-calculator',
    name: 'GST Calculator',
    shortName: 'GST',
    description: 'Add or remove Goods and Services Tax from an amount.',
    category: 'tax',
    icon: 'percent',
    aliases: ['gst', 'goods and services tax', 'inclusive tax', 'add gst', 'remove gst'],
    status: 'catalogue',
  },
  {
    id: 'tds-calculator',
    name: 'TDS Calculator',
    shortName: 'TDS',
    description: 'Estimate tax deducted at source on common payments.',
    category: 'tax',
    icon: 'receipt',
    aliases: ['tax deducted at source'],
    status: 'catalogue',
  },
  {
    id: 'capital-gains-tax-calculator',
    name: 'Capital Gains Tax Calculator',
    shortName: 'Capital Gains',
    description: 'Estimate tax on eligible asset gains.',
    category: 'tax',
    icon: 'chart',
    aliases: ['ltcg', 'stcg', 'stocks tax', 'property tax'],
    status: 'catalogue',
  },
  {
    id: 'salary-calculator',
    name: 'Salary Calculator',
    shortName: 'Salary',
    description: 'Estimate monthly in-hand salary from CTC.',
    category: 'salary-payroll',
    icon: 'briefcase',
    aliases: ['salary', 'ctc', 'take home', 'take-home', 'in hand salary', 'net salary', 'paycheck'],
    status: 'popular',
  },
  {
    id: 'hra-calculator',
    name: 'HRA Calculator',
    shortName: 'HRA',
    description: 'Estimate eligible House Rent Allowance exemption.',
    category: 'salary-payroll',
    icon: 'briefcase',
    aliases: ['house rent allowance', 'rent exemption'],
    status: 'catalogue',
  },
  {
    id: 'gratuity-calculator',
    name: 'Gratuity Calculator',
    shortName: 'Gratuity',
    description: 'Estimate gratuity based on salary and service.',
    category: 'salary-payroll',
    icon: 'wallet',
    aliases: ['gratuity', 'retirement benefit', 'years of service', 'last drawn salary'],
    status: 'catalogue',
  },
  {
    id: 'epf-calculator',
    name: 'EPF Calculator',
    shortName: 'EPF',
    description: 'Project your Employees’ Provident Fund balance.',
    category: 'salary-payroll',
    icon: 'piggy-bank',
    aliases: ['epf', 'pf', 'provident fund', 'employee provident fund', 'retirement corpus'],
    status: 'catalogue',
  },
  {
    id: 'fd-calculator',
    name: 'FD Calculator',
    shortName: 'Fixed Deposit',
    description: 'Estimate maturity value and interest on a fixed deposit.',
    category: 'investments',
    icon: 'landmark',
    aliases: ['fd', 'fixed deposit', 'bank deposit', 'deposit maturity'],
    status: 'catalogue',
  },
  {
    id: 'rd-calculator',
    name: 'RD Calculator',
    shortName: 'Recurring Deposit',
    description: 'Estimate maturity value of regular bank deposits.',
    category: 'savings',
    icon: 'piggy-bank',
    aliases: ['recurring deposit', 'monthly deposit'],
    status: 'catalogue',
  },
  {
    id: 'ppf-calculator',
    name: 'PPF Calculator',
    shortName: 'PPF',
    description: 'Project Public Provident Fund contributions and maturity.',
    category: 'investments',
    icon: 'shield',
    aliases: ['ppf', 'public provident fund', '80c', 'ppf maturity'],
    status: 'catalogue',
  },
  {
    id: 'scss-calculator',
    name: 'SCSS Calculator',
    shortName: 'SCSS',
    description: 'Estimate Senior Citizens’ Savings Scheme returns.',
    category: 'savings',
    icon: 'landmark',
    aliases: ['senior citizens savings scheme'],
    status: 'catalogue',
  },
  {
    id: 'nps-calculator',
    name: 'NPS Calculator',
    shortName: 'NPS',
    description: 'Project retirement corpus and pension from NPS.',
    category: 'planning',
    icon: 'target',
    aliases: ['national pension system', 'retirement'],
    status: 'catalogue',
  },
  {
    id: 'retirement-calculator',
    name: 'Retirement Calculator',
    shortName: 'Retirement',
    description: 'Estimate the corpus needed for retirement.',
    category: 'planning',
    icon: 'target',
    aliases: ['retirement planning', 'pension', 'corpus'],
    status: 'catalogue',
  },
  {
    id: 'inflation-calculator',
    name: 'Inflation Calculator',
    shortName: 'Inflation',
    description: 'Understand how rising prices affect future value.',
    category: 'planning',
    icon: 'trending-up',
    aliases: ['purchasing power', 'future cost'],
    status: 'catalogue',
  },
  {
    id: 'goal-planner',
    name: 'Financial Goal Planner',
    shortName: 'Goal Planner',
    description: 'Estimate what to save for a future money goal.',
    category: 'planning',
    icon: 'compass',
    aliases: ['goal calculator', 'financial planning'],
    status: 'catalogue',
  },
  {
    id: 'simple-interest-calculator',
    name: 'Simple Interest Calculator',
    shortName: 'Simple Interest',
    description: 'Calculate interest without compounding.',
    category: 'other',
    icon: 'percent',
    aliases: ['interest rate'],
    status: 'catalogue',
  },
  {
    id: 'percentage-calculator',
    name: 'Percentage Calculator',
    shortName: 'Percentage',
    description: 'Work out percentages, changes and differences.',
    category: 'other',
    icon: 'percent',
    aliases: ['percent change', 'percentage difference'],
    status: 'catalogue',
  },
  {
    id: 'net-worth-calculator',
    name: 'Net Worth Calculator',
    shortName: 'Net Worth',
    description: 'Compare your total assets and liabilities.',
    category: 'other',
    icon: 'equal',
    aliases: ['assets', 'liabilities', 'wealth'],
    status: 'catalogue',
  },
];

export const calculators: readonly CalculatorItem[] = calculatorSeeds.map(createCalculator);

export const categories: readonly CalculatorCategory[] = [
  {
    id: 'loans',
    title: 'Loans',
    description: 'Understand repayments, interest and borrowing costs.',
    icon: 'calculator',
    calculatorIds: ['emi-calculator', 'home-loan-emi-calculator', 'car-loan-emi-calculator', 'personal-loan-emi-calculator'],
  },
  {
    id: 'investments',
    title: 'Investments',
    description: 'Project growth and compare investment returns.',
    icon: 'trending-up',
    calculatorIds: ['sip-calculator', 'fd-calculator', 'ppf-calculator', 'compound-interest-calculator', 'lumpsum-calculator', 'cagr-calculator', 'roi-calculator'],
  },
  {
    id: 'tax',
    title: 'Tax',
    description: 'Make sense of common Indian tax calculations.',
    icon: 'receipt',
    calculatorIds: ['income-tax-calculator', 'gst-calculator', 'tds-calculator', 'capital-gains-tax-calculator'],
  },
  {
    id: 'salary-payroll',
    title: 'Salary & Payroll',
    description: 'Understand take-home pay and employment benefits.',
    icon: 'briefcase',
    calculatorIds: ['salary-calculator', 'hra-calculator', 'gratuity-calculator', 'epf-calculator'],
  },
  {
    id: 'savings',
    title: 'Savings',
    description: 'Plan deposits and government-backed savings.',
    icon: 'piggy-bank',
    calculatorIds: ['rd-calculator', 'scss-calculator'],
  },
  {
    id: 'planning',
    title: 'Planning',
    description: 'Turn long-term goals into clearer monthly steps.',
    icon: 'compass',
    calculatorIds: ['nps-calculator', 'retirement-calculator', 'inflation-calculator', 'goal-planner'],
  },
  {
    id: 'other',
    title: 'Other',
    description: 'Everyday number tools for a complete financial picture.',
    icon: 'grid',
    calculatorIds: ['simple-interest-calculator', 'percentage-calculator', 'net-worth-calculator'],
  },
] as const;

export const liveCalculators = calculators.filter((calculator) => calculator.availability === 'live');
export const popularCalculators = liveCalculators.filter((calculator) => calculator.status === 'popular');

export function isLiveCalculator(calculator: CalculatorItem | undefined): calculator is CalculatorItem {
  return calculator !== undefined && calculator.availability === 'live';
}

export const calculatorById = new Map(calculators.map((calculator) => [calculator.id, calculator]));
export const calculatorBySlug = new Map(calculators.map((calculator) => [calculator.slug, calculator]));
export const categoryById = new Map(categories.map((category) => [category.id, category]));

export function getLiveCalculatorsByCategory(categoryId: string): readonly CalculatorItem[] {
  return liveCalculators.filter((calculator) => calculator.category === categoryId);
}

export const liveCategories = categories.filter(
  (category) => getLiveCalculatorsByCategory(category.id).length > 0,
);
