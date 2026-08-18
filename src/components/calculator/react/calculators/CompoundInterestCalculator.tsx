import { useEffect, useMemo, useState } from 'react';
import {
  calculateCompoundInterest,
  compoundingPeriods,
  type CompoundingFrequency,
  type CompoundInterestResult,
} from '../../../../lib/calculators/compoundInterest';
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
import { readNumberParameter, replaceCalculatorQuery } from '../urlState';
import '../calculator-ui.css';

const frequencyOptions = [
  { value: 'yearly', label: 'Yearly' },
  { value: 'half-yearly', label: 'Half-yearly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'daily', label: 'Daily' },
] as const;

const defaults = {
  principal: 100_000,
  rate: 10,
  years: 10,
  frequency: 'yearly' as CompoundingFrequency,
};

function isFrequency(value: string | null): value is CompoundingFrequency {
  return value !== null && value in compoundingPeriods;
}

export default function CompoundInterestCalculator() {
  const [principal, setPrincipal] = useState<number | null>(defaults.principal);
  const [rate, setRate] = useState<number | null>(defaults.rate);
  const [years, setYears] = useState<number | null>(defaults.years);
  const [frequency, setFrequency] = useState<CompoundingFrequency>(defaults.frequency);
  const [urlReady, setUrlReady] = useState(false);

  useEffect(() => {
    const parameters = new URLSearchParams(window.location.search);
    const queryPrincipal = readNumberParameter(parameters, 'principal', 0, 100_000_000);
    const queryRate = readNumberParameter(parameters, 'rate', 0, 100);
    const queryYears = readNumberParameter(parameters, 'years', 0.1, 100);
    const queryFrequency = parameters.get('frequency');
    if (queryPrincipal !== null) setPrincipal(queryPrincipal);
    if (queryRate !== null) setRate(queryRate);
    if (queryYears !== null) setYears(queryYears);
    if (isFrequency(queryFrequency)) setFrequency(queryFrequency);
    setUrlReady(true);
  }, []);

  useEffect(() => {
    if (!urlReady || principal === null || rate === null || years === null) return;
    replaceCalculatorQuery({ principal, rate, years, frequency });
  }, [frequency, principal, rate, urlReady, years]);

  const principalError = validateNumericValue(principal, {
    min: 0,
    max: 100_000_000,
    label: 'Principal',
    allowZero: true,
  });
  const rateError = validateNumericValue(rate, {
    min: 0,
    max: 100,
    label: 'Interest rate',
    allowZero: true,
  });
  const yearsError = validateNumericValue(years, { min: 0.1, max: 100, label: 'Time period' });
  const errors = [principalError, rateError, yearsError] as const;

  const result = useMemo<CompoundInterestResult | null>(() => {
    if (hasValidationErrors(errors) || principal === null || rate === null || years === null) return null;
    try {
      return calculateCompoundInterest({ principal, annualRate: rate, years, frequency });
    } catch {
      return null;
    }
  }, [errors, frequency, principal, rate, years]);

  const reset = () => {
    setPrincipal(defaults.principal);
    setRate(defaults.rate);
    setYears(defaults.years);
    setFrequency(defaults.frequency);
  };

  const frequencyLabel = frequencyOptions.find((option) => option.value === frequency)?.label ?? 'Yearly';

  return (
    <div className="calculator-workspace">
      <div className="calculator-primary-grid">
        <CalculatorInputPanel reference="GROWTH / 01">
          <MoneyInput
            label="Principal amount"
            value={principal}
            onChange={setPrincipal}
            min={0}
            max={100_000_000}
            step={10_000}
            sliderMax={10_000_000}
            sliderStep={10_000}
            helperText={principal === null ? 'Enter the amount at the start.' : `${describeIndianAmount(principal)} rupees at the start`}
            error={principalError}
          />
          <PercentageInput
            label="Annual interest rate"
            value={rate}
            onChange={setRate}
            min={0}
            max={100}
            step={0.1}
            sliderMax={40}
            sliderStep={0.1}
            helperText="The nominal annual rate before compounding."
            error={rateError}
          />
          <DurationInput
            value={years}
            onChange={setYears}
            unit="years"
            min={0.1}
            max={100}
            step={0.5}
            sliderMax={50}
            helperText="Decimal years are supported for shorter or partial periods."
            error={yearsError}
            allowUnitSelection={false}
          />
          <SelectInput
            label="Compounding frequency"
            value={frequency}
            onChange={setFrequency}
            options={frequencyOptions}
            helperText="More frequent compounding applies interest more often."
          />
        </CalculatorInputPanel>

        <div className="calculator-result-column">
          <ResultPanel
            primaryLabel="Final amount"
            primaryValue={result ? formatINR(result.finalAmount) : '—'}
            metrics={[
              { label: 'Principal', value: result ? formatINR(result.principal) : '—' },
              { label: 'Interest earned', value: result ? formatINR(result.interestEarned) : '—' },
            ]}
            note={result ? `${frequencyLabel} compounding · based on the rate and period entered` : 'Complete the highlighted inputs to see a result.'}
          />
          <CalculatorActions onReset={reset} />
        </div>
      </div>

      {result ? (
        <div className="calculator-supporting-grid calculator-supporting-grid--chart-wide">
          <ChartContainer
            title="Compounding over time"
            description="The curve shows how interest begins earning interest as time passes."
          >
            <GrowthChart
              points={result.growth}
              ariaLabel={`Principal ${formatINR(result.principal)} grows to ${formatINR(result.finalAmount)} with ${frequencyLabel.toLowerCase()} compounding`}
            />
          </ChartContainer>
          <CalculationBreakdown
            description="The final amount is the original principal plus accumulated interest."
            rows={[
              { label: 'Starting principal', value: formatINR(result.principal) },
              { label: 'Interest earned', value: formatINR(result.interestEarned) },
              { label: 'Final amount', value: formatINR(result.finalAmount) },
              { label: 'Compounding', value: frequencyLabel },
            ]}
            explanation={`${formatINR(result.principal)} grows by an estimated ${formatINR(result.interestEarned)} to reach ${formatINR(result.finalAmount)}. Increasing the frequency changes how often earned interest is added back to the balance.`}
          />
        </div>
      ) : (
        <div className="calculator-fallback" role="status">Enter valid values to generate the compound growth chart and breakdown.</div>
      )}
    </div>
  );
}
