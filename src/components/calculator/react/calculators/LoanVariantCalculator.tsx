import { useEffect, useMemo, useState } from 'react';
import {
  calculateCarLoan,
  calculateHomeLoan,
  type CarLoanResult,
  type HomeLoanResult,
} from '../../../../lib/calculators/loanVariants';
import { describeIndianAmount, formatDuration, formatINR } from '../../../../lib/formatters';
import { hasValidationErrors, validateNumericValue } from '../../../../lib/validation';
import AmortisationTable from '../AmortisationTable';
import CalculationBreakdown from '../CalculationBreakdown';
import CalculatorActions from '../CalculatorActions';
import CalculatorInputPanel from '../CalculatorInputPanel';
import ChartContainer from '../ChartContainer';
import DonutChart from '../DonutChart';
import ResultPanel from '../ResultPanel';
import DurationInput, { type DurationUnit } from '../inputs/DurationInput';
import MoneyInput from '../inputs/MoneyInput';
import PercentageInput from '../inputs/PercentageInput';
import { readNumberParameter, replaceCalculatorQuery } from '../urlState';
import '../calculator-ui.css';

interface LoanVariantCalculatorProps {
  variant: 'home' | 'car';
}

const homeDefaults = { amount: 5_000_000, rate: 8.5, tenure: 20, unit: 'years' as DurationUnit, fee: 10_000, downPayment: 0 };
const carDefaults = { amount: 1_000_000, rate: 9, tenure: 5, unit: 'years' as DurationUnit, fee: 5_000, downPayment: 200_000 };

export default function LoanVariantCalculator({ variant }: LoanVariantCalculatorProps) {
  const defaults = variant === 'home' ? homeDefaults : carDefaults;
  const [amount, setAmount] = useState<number | null>(defaults.amount);
  const [rate, setRate] = useState<number | null>(defaults.rate);
  const [tenure, setTenure] = useState<number | null>(defaults.tenure);
  const [unit, setUnit] = useState<DurationUnit>(defaults.unit);
  const [processingFee, setProcessingFee] = useState<number | null>(defaults.fee);
  const [downPayment, setDownPayment] = useState<number | null>(defaults.downPayment);
  const [urlReady, setUrlReady] = useState(false);

  useEffect(() => {
    const parameters = new URLSearchParams(window.location.search);
    const queryUnit: DurationUnit = parameters.get('unit') === 'months' ? 'months' : 'years';
    const values = {
      amount: readNumberParameter(parameters, 'amount', 1_000, 100_000_000),
      rate: readNumberParameter(parameters, 'rate', 0, 50),
      tenure: readNumberParameter(parameters, 'tenure', 1, queryUnit === 'years' ? 40 : 480),
      fee: readNumberParameter(parameters, 'fee', 0, 5_000_000),
      down: readNumberParameter(parameters, 'down', 0, 100_000_000),
    };
    if (values.amount !== null) setAmount(values.amount);
    if (values.rate !== null) setRate(values.rate);
    if (values.tenure !== null) setTenure(values.tenure);
    if (values.fee !== null) setProcessingFee(values.fee);
    if (variant === 'car' && values.down !== null) setDownPayment(values.down);
    setUnit(queryUnit);
    setUrlReady(true);
  }, [variant]);

  useEffect(() => {
    if (!urlReady || amount === null || rate === null || tenure === null || processingFee === null) return;
    const values: Record<string, string | number> = { amount, rate, tenure, unit, fee: processingFee };
    if (variant === 'car' && downPayment !== null) values.down = downPayment;
    replaceCalculatorQuery(values);
  }, [amount, downPayment, processingFee, rate, tenure, unit, urlReady, variant]);

  const amountLabel = variant === 'home' ? 'Home loan amount' : 'Car price / amount';
  const amountError = validateNumericValue(amount, { min: 1_000, max: 100_000_000, label: amountLabel });
  const rateError = validateNumericValue(rate, { min: 0, max: 50, label: 'Interest rate', allowZero: true });
  const tenureError = validateNumericValue(tenure, { min: 1, max: unit === 'years' ? 40 : 480, label: 'Loan tenure' });
  const feeError = validateNumericValue(processingFee, { min: 0, max: 5_000_000, label: 'Processing fee', allowZero: true });
  const basicDownError = variant === 'car'
    ? validateNumericValue(downPayment, { min: 0, max: 100_000_000, label: 'Down payment', allowZero: true })
    : null;
  const downPaymentError = variant === 'car' && basicDownError === null && amount !== null && downPayment !== null && downPayment >= amount
    ? 'Down payment must be less than the car amount.'
    : basicDownError;
  const errors = [amountError, rateError, tenureError, feeError, downPaymentError] as const;

  const result = useMemo<HomeLoanResult | CarLoanResult | null>(() => {
    if (hasValidationErrors(errors) || amount === null || rate === null || tenure === null || processingFee === null) return null;
    const tenureMonths = Math.round(unit === 'years' ? tenure * 12 : tenure);
    try {
      return variant === 'home'
        ? calculateHomeLoan({ loanAmount: amount, annualRate: rate, tenureMonths, processingFee })
        : calculateCarLoan({
          vehicleAmount: amount,
          downPayment: downPayment ?? 0,
          annualRate: rate,
          tenureMonths,
          processingFee,
        });
    } catch {
      return null;
    }
  }, [amount, downPayment, errors, processingFee, rate, tenure, unit, variant]);

  const emi = result?.emi;
  const financedAmount = result && 'financedAmount' in result ? result.financedAmount : emi?.principal;

  const handleUnitChange = (nextUnit: DurationUnit) => {
    if (nextUnit === unit) return;
    if (tenure !== null) setTenure(nextUnit === 'months' ? Math.round(tenure * 12) : Number((tenure / 12).toFixed(2)));
    setUnit(nextUnit);
  };

  const reset = () => {
    setAmount(defaults.amount);
    setRate(defaults.rate);
    setTenure(defaults.tenure);
    setUnit(defaults.unit);
    setProcessingFee(defaults.fee);
    setDownPayment(defaults.downPayment);
  };

  return (
    <div className="calculator-workspace">
      <div className="calculator-primary-grid">
        <CalculatorInputPanel reference={variant === 'home' ? 'HOME / 01' : 'CAR / 01'}>
          <MoneyInput
            label={amountLabel}
            value={amount}
            onChange={setAmount}
            min={1_000}
            max={100_000_000}
            step={10_000}
            sliderMin={100_000}
            sliderMax={variant === 'home' ? 30_000_000 : 10_000_000}
            sliderStep={50_000}
            helperText={amount === null ? 'Enter the amount.' : `${describeIndianAmount(amount)} rupees ${variant === 'car' ? 'before down payment' : 'borrowed'}`}
            error={amountError}
          />
          {variant === 'car' && (
            <MoneyInput
              label="Down payment"
              value={downPayment}
              onChange={setDownPayment}
              min={0}
              max={100_000_000}
              step={5_000}
              sliderMax={Math.max(100_000, Math.min(amount ?? 1_000_000, 5_000_000))}
              sliderStep={5_000}
              helperText="Subtracted from the car amount before EMI is calculated."
              error={downPaymentError}
            />
          )}
          <PercentageInput
            label="Annual interest rate"
            value={rate}
            onChange={setRate}
            min={0}
            max={50}
            step={0.1}
            sliderMax={30}
            sliderStep={0.1}
            helperText="Use the reducing-balance annual rate offered by the lender."
            error={rateError}
          />
          <DurationInput
            value={tenure}
            onChange={setTenure}
            unit={unit}
            onUnitChange={handleUnitChange}
            min={1}
            max={unit === 'years' ? 40 : 480}
            step={1}
            helperText="Choose years or months; repayments are calculated monthly."
            error={tenureError}
          />
          <MoneyInput
            label="Processing fee"
            value={processingFee}
            onChange={setProcessingFee}
            min={0}
            max={5_000_000}
            step={1_000}
            sliderMax={500_000}
            sliderStep={1_000}
            helperText="Optional upfront fee; it does not change the financed principal."
            error={feeError}
          />
        </CalculatorInputPanel>

        <div className="calculator-result-column">
          <ResultPanel
            primaryLabel="Monthly EMI"
            primaryValue={emi ? formatINR(emi.monthlyEmi) : '—'}
            metrics={[
              { label: 'Total interest', value: emi ? formatINR(emi.totalInterest) : '—' },
              { label: variant === 'home' ? 'Total repayment' : 'Financed loan amount', value: variant === 'home' ? (emi ? formatINR(emi.totalPayable) : '—') : (financedAmount !== undefined ? formatINR(financedAmount) : '—') },
            ]}
            note={emi ? `${formatDuration(emi.tenureMonths)} · processing fee shown separately` : 'Complete the highlighted inputs to see a result.'}
          />
          <CalculatorActions onReset={reset} />
        </div>
      </div>

      {result && emi && financedAmount !== undefined ? (
        <>
          <div className="calculator-supporting-grid">
            <ChartContainer title="Principal vs interest" description="Compare the financed principal with interest over the full tenure.">
              <DonutChart
                ariaLabel={`Principal ${formatINR(financedAmount)} and interest ${formatINR(emi.totalInterest)}`}
                segments={[
                  { label: 'Principal', value: financedAmount, color: 'var(--pc-accent)' },
                  { label: 'Interest', value: emi.totalInterest, color: '#44403c' },
                ]}
              />
            </ChartContainer>
            <CalculationBreakdown
              description="The loan cost based on the current inputs."
              rows={[
                ...(variant === 'car' && 'downPayment' in result ? [
                  { label: 'Car amount', value: formatINR(result.vehicleAmount) },
                  { label: 'Down payment', value: formatINR(result.downPayment) },
                ] : []),
                { label: 'Financed principal', value: formatINR(financedAmount) },
                { label: 'Monthly EMI', value: formatINR(emi.monthlyEmi) },
                { label: 'Total interest', value: formatINR(emi.totalInterest) },
                { label: 'Processing fee', value: formatINR(result.processingFee) },
                { label: 'Estimated total outflow', value: formatINR(result.totalOutflow) },
              ]}
              explanation={variant === 'home'
                ? `The estimated repayment is ${formatINR(emi.totalPayable)} plus the entered processing fee of ${formatINR(result.processingFee)}.`
                : `After the down payment, ${formatINR(financedAmount)} is financed. Total outflow includes down payment, loan repayments and the entered processing fee.`}
            />
          </div>
          <AmortisationTable rows={emi.schedule} />
        </>
      ) : (
        <div className="calculator-fallback" role="status">Enter valid loan details to generate the repayment breakdown and schedule.</div>
      )}
    </div>
  );
}
