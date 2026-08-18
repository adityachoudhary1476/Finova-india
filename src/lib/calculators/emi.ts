import { assertFiniteNonNegative, assertFinitePositive } from './shared';

export interface EmiInput {
  principal: number;
  annualRate: number;
  tenureMonths: number;
}

export interface AmortisationYear {
  year: number;
  openingBalance: number;
  principalPaid: number;
  interestPaid: number;
  totalPayment: number;
  closingBalance: number;
}

export interface EmiResult {
  principal: number;
  monthlyEmi: number;
  totalInterest: number;
  totalPayable: number;
  tenureMonths: number;
  schedule: readonly AmortisationYear[];
}

function createAmortisationSchedule(input: EmiInput, monthlyEmi: number): readonly AmortisationYear[] {
  const monthlyRate = input.annualRate / 12 / 100;
  let balance = input.principal;
  const rows: AmortisationYear[] = [];
  let currentYear = 1;
  let openingBalance = balance;
  let principalPaid = 0;
  let interestPaid = 0;
  let totalPayment = 0;

  for (let month = 1; month <= input.tenureMonths; month += 1) {
    const interestForMonth = balance * monthlyRate;
    const plannedPrincipal = monthlyEmi - interestForMonth;
    const principalForMonth = month === input.tenureMonths
      ? balance
      : Math.min(Math.max(plannedPrincipal, 0), balance);
    const paymentForMonth = principalForMonth + interestForMonth;

    balance = Math.max(0, balance - principalForMonth);
    principalPaid += principalForMonth;
    interestPaid += interestForMonth;
    totalPayment += paymentForMonth;

    const isYearEnd = month % 12 === 0 || month === input.tenureMonths;
    if (isYearEnd) {
      rows.push({
        year: currentYear,
        openingBalance,
        principalPaid,
        interestPaid,
        totalPayment,
        closingBalance: balance,
      });
      currentYear += 1;
      openingBalance = balance;
      principalPaid = 0;
      interestPaid = 0;
      totalPayment = 0;
    }
  }

  return rows;
}

export function calculateEmi(input: EmiInput): EmiResult {
  assertFiniteNonNegative(input.principal, 'Loan amount');
  assertFiniteNonNegative(input.annualRate, 'Annual interest rate');
  assertFinitePositive(input.tenureMonths, 'Loan tenure');

  const numberOfPayments = Math.round(input.tenureMonths);
  if (numberOfPayments !== input.tenureMonths) {
    throw new RangeError('Loan tenure must be a whole number of months.');
  }

  const monthlyRate = input.annualRate / 12 / 100;
  const monthlyEmi = monthlyRate === 0
    ? input.principal / numberOfPayments
    : input.principal * monthlyRate * ((1 + monthlyRate) ** numberOfPayments)
      / (((1 + monthlyRate) ** numberOfPayments) - 1);

  const totalPayable = monthlyEmi * numberOfPayments;
  const totalInterest = Math.max(0, totalPayable - input.principal);

  return {
    principal: input.principal,
    monthlyEmi,
    totalInterest,
    totalPayable,
    tenureMonths: numberOfPayments,
    schedule: createAmortisationSchedule(
      { ...input, tenureMonths: numberOfPayments },
      monthlyEmi,
    ),
  };
}
