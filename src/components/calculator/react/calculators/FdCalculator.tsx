import { useMemo, useState } from 'react';
import { calculateFd, type FdCompoundingFrequency, type FdResult } from '../../../../lib/calculators/fd';
import { describeIndianAmount, formatINR } from '../../../../lib/formatters';
import { hasValidationErrors, validateNumericValue } from '../../../../lib/validation';
import CalculationBreakdown from '../CalculationBreakdown';
import CalculatorActions from '../CalculatorActions';
import CalculatorInputPanel from '../CalculatorInputPanel';
import ChartContainer from '../ChartContainer';
import GrowthChart from '../GrowthChart';
import ResultPanel from '../ResultPanel';
import DurationInput from '../inputs/DurationInput';
import MoneyInput from '../inputs/MoneyInput';
import PercentageInput from '../inputs/PercentageInput';
import SelectInput from '../inputs/SelectInput';
import '../calculator-ui.css';

const frequencyOptions = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'half-yearly', label: 'Half-yearly' },
  { value: 'yearly', label: 'Yearly' },
] as const;
const defaults = { amount: 500_000, rate: 7, years: 5, frequency: 'quarterly' as FdCompoundingFrequency };

export default function FdCalculator() {
  const [amount, setAmount] = useState<number | null>(defaults.amount);
  const [rate, setRate] = useState<number | null>(defaults.rate);
  const [years, setYears] = useState<number | null>(defaults.years);
  const [frequency, setFrequency] = useState<FdCompoundingFrequency>(defaults.frequency);

  const amountError = validateNumericValue(amount, { min: 1, max: 100_000_000, label: 'Deposit amount' });
  const rateError = validateNumericValue(rate, { min: 0, max: 50, label: 'Interest rate', allowZero: true });
  const yearsError = validateNumericValue(years, { min: 0.1, max: 25, label: 'Deposit tenure' });
  const errors = [amountError, rateError, yearsError] as const;
  const result = useMemo<FdResult | null>(() => {
    if (hasValidationErrors(errors) || amount === null || rate === null || years === null) return null;
    try { return calculateFd({ depositAmount: amount, annualRate: rate, years, frequency }); } catch { return null; }
  }, [amount, errors, frequency, rate, years]);

  const reset = () => { setAmount(defaults.amount); setRate(defaults.rate); setYears(defaults.years); setFrequency(defaults.frequency); };
  const frequencyLabel = frequencyOptions.find((option) => option.value === frequency)?.label ?? 'Quarterly';

  return (
    <div className="calculator-workspace">
      <div className="calculator-primary-grid">
        <CalculatorInputPanel reference="FD / 01">
          <MoneyInput label="Deposit amount" value={amount} onChange={setAmount} min={1} max={100_000_000} step={10_000} sliderMin={10_000} sliderMax={10_000_000} sliderStep={10_000} helperText={amount === null ? 'Enter the principal deposit.' : `${describeIndianAmount(amount)} rupees deposited`} error={amountError} />
          <PercentageInput label="Annual interest rate" value={rate} onChange={setRate} min={0} max={50} step={0.1} sliderMax={20} sliderStep={0.1} helperText="Enter the rate offered for the deposit; no bank rate is assumed." error={rateError} />
          <DurationInput value={years} onChange={setYears} unit="years" min={0.1} max={25} step={0.5} sliderStep={0.5} helperText="Decimal years are supported for partial-year estimates." error={yearsError} allowUnitSelection={false} />
          <SelectInput label="Compounding frequency" value={frequency} onChange={setFrequency} options={frequencyOptions} helperText="Choose how often interest is added to the FD balance." />
        </CalculatorInputPanel>
        <div className="calculator-result-column">
          <ResultPanel primaryLabel="Maturity amount" primaryValue={result ? formatINR(result.maturityAmount) : '—'} metrics={[
            { label: 'Deposit amount', value: result ? formatINR(result.principal) : '—' },
            { label: 'Interest earned', value: result ? formatINR(result.interestEarned) : '—' },
          ]} note={`${frequencyLabel} compounding · tax and TDS are not included`} />
          <CalculatorActions onReset={reset} />
        </div>
      </div>
      {result ? (
        <div className="calculator-supporting-grid calculator-supporting-grid--chart-wide">
          <ChartContainer title="Deposit growth" description="See the principal grow as interest is compounded over the selected tenure.">
            <GrowthChart points={result.growth} ariaLabel={`Fixed deposit grows from ${formatINR(result.principal)} to ${formatINR(result.maturityAmount)}`} />
          </ChartContainer>
          <CalculationBreakdown description="Principal and earned interest are shown separately." rows={[
            { label: 'Principal', value: formatINR(result.principal) },
            { label: 'Interest earned', value: formatINR(result.interestEarned) },
            { label: 'Maturity amount', value: formatINR(result.maturityAmount) },
            { label: 'Compounding', value: frequencyLabel },
          ]} explanation="The calculation uses the rate and compounding frequency entered. It does not deduct income tax or TDS and does not represent a bank quote." />
        </div>
      ) : <div className="calculator-fallback" role="status">Enter valid deposit details to generate the maturity estimate.</div>}
    </div>
  );
}
