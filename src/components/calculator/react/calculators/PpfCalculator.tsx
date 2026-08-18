import { useMemo, useState } from 'react';
import { FINANCIAL_RULES } from '../../../../config/financialRules';
import { calculatePpf, type PpfContributionFrequency, type PpfResult } from '../../../../lib/calculators/ppf';
import { describeIndianAmount, formatINR } from '../../../../lib/formatters';
import { hasValidationErrors, validateNumericValue } from '../../../../lib/validation';
import BreakdownTable from '../BreakdownTable';
import CalculationBreakdown from '../CalculationBreakdown';
import CalculatorActions from '../CalculatorActions';
import CalculatorInputPanel from '../CalculatorInputPanel';
import ChartContainer from '../ChartContainer';
import GrowthChart from '../GrowthChart';
import ResultPanel from '../ResultPanel';
import MoneyInput from '../inputs/MoneyInput';
import NumberInput from '../inputs/NumberInput';
import PercentageInput from '../inputs/PercentageInput';
import SelectInput from '../inputs/SelectInput';
import '../calculator-ui.css';

const frequencyOptions = [
  { value: 'annual', label: 'Annual contribution' },
  { value: 'monthly', label: 'Monthly contribution' },
] as const;
const defaults = { amount: 150_000, frequency: 'annual' as PpfContributionFrequency, years: 15, rate: FINANCIAL_RULES.ppf.defaultAnnualRate };

export default function PpfCalculator() {
  const [amount, setAmount] = useState<number | null>(defaults.amount);
  const [frequency, setFrequency] = useState<PpfContributionFrequency>(defaults.frequency);
  const [years, setYears] = useState<number | null>(defaults.years);
  const [rate, setRate] = useState<number | null>(defaults.rate);
  const minAmount = frequency === 'annual' ? FINANCIAL_RULES.ppf.minimumAnnualContribution : FINANCIAL_RULES.ppf.minimumAnnualContribution / 12;
  const maxAmount = frequency === 'annual' ? FINANCIAL_RULES.ppf.maximumAnnualContribution : FINANCIAL_RULES.ppf.maximumAnnualContribution / 12;
  const amountError = validateNumericValue(amount, { min: minAmount, max: maxAmount, label: `${frequency === 'annual' ? 'Annual' : 'Monthly'} contribution` });
  const yearsBaseError = validateNumericValue(years, { min: FINANCIAL_RULES.ppf.standardMinimumYears, max: 50, label: 'PPF duration' });
  const yearsError = yearsBaseError === null && years !== null && !Number.isInteger(years) ? 'PPF duration must be a whole number of years.' : yearsBaseError;
  const rateError = validateNumericValue(rate, { min: 0, max: 20, label: 'Interest rate assumption', allowZero: true });
  const errors = [amountError, yearsError, rateError] as const;

  const result = useMemo<PpfResult | null>(() => {
    if (hasValidationErrors(errors) || amount === null || years === null || rate === null) return null;
    try { return calculatePpf({ contributionAmount: amount, contributionFrequency: frequency, years, annualRate: rate }); } catch { return null; }
  }, [amount, errors, frequency, rate, years]);

  const changeFrequency = (next: PpfContributionFrequency) => {
    if (next === frequency) return;
    if (amount !== null) setAmount(next === 'monthly' ? Number((amount / 12).toFixed(2)) : amount * 12);
    setFrequency(next);
  };
  const reset = () => { setAmount(defaults.amount); setFrequency(defaults.frequency); setYears(defaults.years); setRate(defaults.rate); };

  return (
    <div className="calculator-workspace">
      <div className="calculator-primary-grid">
        <CalculatorInputPanel reference="PPF / 01">
          <SelectInput label="Contribution frequency" value={frequency} onChange={changeFrequency} options={frequencyOptions} helperText="Choose one annual deposit or regular monthly deposits." />
          <MoneyInput label={frequency === 'annual' ? 'Annual investment' : 'Monthly investment'} value={amount} onChange={setAmount} min={minAmount} max={maxAmount} step={frequency === 'annual' ? 500 : 100} sliderMin={500} sliderMax={maxAmount} sliderStep={frequency === 'annual' ? 500 : 100} helperText={amount === null ? 'Enter a contribution.' : `${describeIndianAmount(amount)} rupees ${frequency === 'annual' ? 'per year' : 'per month'}`} error={amountError} />
          <NumberInput label="Investment duration" value={years} onChange={setYears} min={FINANCIAL_RULES.ppf.standardMinimumYears} max={50} step={1} maximumFractionDigits={0} helperText="The standard PPF term begins at 15 years; extensions are illustrated as whole years." error={yearsError} />
          <PercentageInput label="Annual interest rate assumption" value={rate} onChange={setRate} min={0} max={20} step={0.1} sliderMax={15} sliderStep={0.1} helperText="Editable because notified PPF rates can change. The default is a current assumption, not a permanent promise." error={rateError} />
        </CalculatorInputPanel>
        <div className="calculator-result-column">
          <ResultPanel eyebrow="Estimated maturity" primaryLabel="Maturity amount" primaryValue={result ? formatINR(result.maturityAmount) : '—'} metrics={[
            { label: 'Total deposits', value: result ? formatINR(result.totalDeposits) : '—' },
            { label: 'Interest earned', value: result ? formatINR(result.interestEarned) : '—' },
          ]} note={rate === null ? 'Enter an interest-rate assumption.' : `${rate}% annual rate assumption · government-notified rates may change`} />
          <CalculatorActions onReset={reset} />
        </div>
      </div>
      {result ? (
        <>
          <div className="calculator-supporting-grid calculator-supporting-grid--chart-wide">
            <ChartContainer title="PPF corpus growth" description="The line shows the projected balance while the dashed line shows cumulative deposits.">
              <GrowthChart points={result.growth} ariaLabel={`PPF deposits of ${formatINR(result.totalDeposits)} grow to an estimated ${formatINR(result.maturityAmount)}`} showContributed />
            </ChartContainer>
            <CalculationBreakdown description="Deposits and estimated interest are separated clearly." rows={[
              { label: 'Total deposits', value: formatINR(result.totalDeposits) },
              { label: 'Interest earned', value: formatINR(result.interestEarned) },
              { label: 'Maturity amount', value: formatINR(result.maturityAmount) },
              { label: 'Rate assumption', value: `${rate}%` },
            ]} explanation="This projection assumes contributions are made early enough in each contribution period to earn interest and that the entered annual rate remains unchanged. Actual notified rates can vary." />
          </div>
          <BreakdownTable
            title="PPF year-wise schedule"
            description="Annual opening balance, deposits, credited interest and closing value."
            regionLabel="PPF year-wise schedule"
            columns={[
              { key: 'year', label: 'Year', align: 'left' },
              { key: 'opening', label: 'Opening balance' },
              { key: 'deposits', label: 'Deposits' },
              { key: 'interest', label: 'Interest' },
              { key: 'closing', label: 'Closing balance' },
            ]}
            rows={result.schedule.map((row) => ({ year: row.year, opening: formatINR(row.openingBalance), deposits: formatINR(row.deposits), interest: formatINR(row.interestEarned), closing: formatINR(row.closingBalance) }))}
          />
        </>
      ) : <div className="calculator-fallback" role="status">Enter valid PPF assumptions to generate the projection.</div>}
    </div>
  );
}
