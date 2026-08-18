import type { GuideDefinition } from './types';

export const guides: readonly GuideDefinition[] = [
  {
    slug: 'how-does-emi-work',
    category: 'Loans',
    title: 'How Does EMI Actually Work?',
    readTime: '6 min read',
    description: 'Principal, reducing balance and interest—explained without the banking jargon.',
    seoTitle: 'How Does EMI Work? Principal, Interest and Amortisation | Finova',
    seoDescription: 'Understand how EMI is calculated, why the interest share changes, and how rate, tenure and prepayments affect a loan.',
    updatedDate: '2026-08-17',
    relatedCalculatorIds: ['emi-calculator', 'home-loan-emi-calculator', 'car-loan-emi-calculator'],
    sections: [
      {
        title: 'EMI in one sentence',
        paragraphs: [
          'An equated monthly instalment is a scheduled payment that repays part of a loan principal and pays interest on the outstanding balance. If the rate and tenure stay fixed, the EMI normally stays the same while its internal principal-and-interest split changes.',
          'The lender is not charging the full-loan interest every month. Interest is calculated on the balance still unpaid, which is why a reducing-balance schedule matters.',
        ],
      },
      {
        title: 'Why early EMIs contain more interest',
        paragraphs: [
          'At the start of a loan, the outstanding principal is at its highest. The first month’s interest is therefore larger. After each payment reduces the principal, the next month’s interest is calculated on a slightly smaller balance.',
          'Over time, more of the same EMI goes toward principal. An amortisation schedule makes that change visible year by year.',
        ],
      },
      {
        title: 'What changes the EMI or total cost?',
        paragraphs: ['Three inputs drive the standard reducing-balance calculation.'],
        bullets: [
          'Principal: borrowing more raises the EMI and total interest.',
          'Interest rate: a higher rate increases the cost of every remaining instalment.',
          'Tenure: a longer tenure can reduce the monthly EMI but may increase total interest because the balance remains outstanding for longer.',
        ],
      },
      {
        title: 'Where prepayments fit',
        paragraphs: [
          'A prepayment reduces the outstanding principal earlier than scheduled. Future interest is then calculated on a smaller balance. Depending on the lender, a prepayment may reduce the tenure, reduce the EMI, or allow a choice between the two.',
          'Always check the loan agreement for prepayment charges and the lender’s method. A general EMI calculator does not model every lender-specific rule.',
        ],
      },
    ],
    faqs: [
      { question: 'Is EMI the same as total loan cost?', answer: 'No. EMI is the monthly payment. Total loan cost also depends on the number of payments, total interest, processing fees and any other lender charges.' },
      { question: 'Why can a lender quote differ from a calculator?', answer: 'Payment dates, daily interest conventions, rounding, fees, insurance and floating-rate resets can create differences.' },
      { question: 'Does a lower EMI always mean a cheaper loan?', answer: 'No. A lower EMI caused by a longer tenure can lead to more total interest even though the monthly payment is easier to manage.' },
    ],
  },
  {
    slug: 'sip-vs-lump-sum',
    category: 'Investing',
    title: "SIP vs Lump Sum: What’s the Difference?",
    readTime: '7 min read',
    description: 'A practical comparison of regular investing and one-time investing without product recommendations.',
    seoTitle: 'SIP vs Lump Sum: What Is the Difference? | Finova',
    seoDescription: 'Compare SIP and lump-sum investing by contribution timing, compounding, volatility and the assumptions behind return projections.',
    updatedDate: '2026-08-17',
    relatedCalculatorIds: ['sip-calculator', 'compound-interest-calculator', 'fd-calculator'],
    sections: [
      {
        title: 'The difference is contribution timing',
        paragraphs: [
          'A systematic investment plan contributes a fixed amount at regular intervals, commonly every month. A lump-sum investment contributes a larger amount once. Both can grow or fall with the underlying investment; the label describes how money is contributed, not a guaranteed return.',
          'A SIP calculation contains many contributions with different growth periods. A lump sum has one contribution that is exposed for the full selected period.',
        ],
      },
      {
        title: 'How compounding differs',
        paragraphs: [
          'With a lump sum, the entire amount can compound from the beginning. In a SIP, the first instalment compounds for the longest period and the final instalment for the shortest.',
          'This is why comparing the same rupee amount without considering when it was invested can be misleading. The cash-flow timing is different.',
        ],
      },
      {
        title: 'Volatility and timing',
        paragraphs: [
          'Regular contributions buy at different market levels. This spreads entry timing, but it does not remove market risk or ensure a profit. A lump sum is exposed to the market level at one entry date.',
          'Which contribution pattern is practical depends on when money is available, cash-flow needs, time horizon and risk tolerance. A calculator can compare scenarios but should not decide for the user.',
        ],
      },
      {
        title: 'Read projected returns carefully',
        paragraphs: [
          'SIP and compound-interest calculators usually apply one constant annual return to make scenarios comparable. Actual market returns vary from period to period and may be negative.',
          'Treat the result as an illustration based on the rate entered. Separate total contributions from estimated growth so it is clear which part came from the user and which part came from the assumption.',
        ],
      },
    ],
    faqs: [
      { question: 'Does SIP guarantee better returns than lump sum?', answer: 'No. Returns depend on the underlying investment and market path. SIP changes contribution timing; it does not guarantee a better outcome.' },
      { question: 'Why does a lump sum sometimes show a higher value?', answer: 'If the same total amount is invested earlier, more money has more time to compound. That comparison may not reflect when the money was actually available.' },
      { question: 'Are calculator return rates forecasts?', answer: 'No. They are user-entered assumptions used to illustrate a scenario. Actual returns can be higher, lower or negative.' },
    ],
  },
  {
    slug: 'in-hand-salary-from-ctc',
    category: 'Salary',
    title: 'How Is In-Hand Salary Calculated From CTC?',
    readTime: '8 min read',
    description: 'Understand how employer costs, gross salary and deductions turn CTC into monthly take-home pay.',
    seoTitle: 'How Is In-Hand Salary Calculated From CTC? | Finova',
    seoDescription: 'Understand CTC, gross salary, EPF, professional tax, income tax and other deductions that affect monthly in-hand salary.',
    updatedDate: '2026-08-17',
    relatedCalculatorIds: ['salary-calculator', 'epf-calculator', 'income-tax-calculator', 'gratuity-calculator'],
    sections: [
      {
        title: 'CTC is not take-home pay',
        paragraphs: [
          'Cost to company is the employer’s total annual cost associated with an employee. It can include gross salary, employer provident-fund contributions, gratuity provisions, insurance, bonuses and other benefits.',
          'Some CTC components are paid monthly, some are paid later, and some are employer-side costs rather than cash received by the employee.',
        ],
      },
      {
        title: 'From CTC to gross salary',
        paragraphs: [
          'To estimate gross salary, separate employer-side benefits and non-cash components from the total CTC. The remaining annual gross is the starting point for payroll deductions.',
          'Offer letters use different structures, so there is no universal percentage that converts CTC into gross salary. Use the actual compensation breakup wherever possible.',
        ],
      },
      {
        title: 'Common employee deductions',
        paragraphs: ['Monthly and annual deductions vary, but common entries include:'],
        bullets: [
          'Employee EPF, often calculated from eligible basic salary.',
          'Professional tax, where applicable under state rules.',
          'Income-tax withholding based on declared income, deductions and regime.',
          'Insurance, loan recovery, meal benefits or other employer-specific deductions.',
        ],
      },
      {
        title: 'Estimate first, verify with the payslip',
        paragraphs: [
          'A salary calculator is most useful when each visible deduction comes from the offer letter or payslip. If a field is unknown, leave it at zero rather than inventing an amount and note that the estimate will be incomplete.',
          'Variable pay, joining bonuses, reimbursements and annual adjustments can make one month different from another. The payslip and employer payroll policy remain the authoritative records.',
        ],
      },
    ],
    faqs: [
      { question: 'Why is in-hand salary lower than CTC divided by 12?', answer: 'CTC may include employer-side benefits, while monthly gross salary is also reduced by employee deductions and tax withholding.' },
      { question: 'Is employer EPF deducted from in-hand salary?', answer: 'The employer share is normally an employer-side cost, while the employee share is deducted from salary. Exact presentation varies by compensation structure.' },
      { question: 'Does the salary calculator include income tax?', answer: 'Finova’s salary calculator keeps income tax separate so users can estimate it with the dedicated income-tax calculator and avoid hiding assumptions.' },
    ],
  },
] as const;

export const guideBySlug = new Map(guides.map((guide) => [guide.slug, guide]));
export const guidePreviews = guides;
