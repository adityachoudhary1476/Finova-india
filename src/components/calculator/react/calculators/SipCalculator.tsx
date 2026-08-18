import { useEffect, useMemo, useState } from 'react';
import { calculateSip, type SipResult } from '../../../../lib/calculators/sip';
import { describeIndianAmount, formatINR } from '../../../../lib/formatters';
import { hasValidationErrors, validateNumericValue } from '../../../../lib/validation';
import CalculationBreakdown from '../CalculationBreakdown';
import CalculatorActions from '../CalculatorActions';
import CalculatorInputPanel from '../CalculatorInputPanel';
import ChartContainer from '../ChartContainer';
import DonutChart from '../DonutChart';
import GrowthChart from '../GrowthChart';
import ResultPanel from '../ResultPanel';
import DurationInput from '../inputs/DurationInput';
import MoneyInput from '../inputs/MoneyInput';
import PercentageInput from '../inputs/PercentageInput';
import { readNumberParameter, replaceCalculatorQuery } from '../urlState';
import '../calculator-ui.css';

const defaults = { amount: 10_000, rate: 12, years: 15 };

export default function SipCalculator() {
  const [amount, setAmount] = useState<number | null>(defaults.amount);
  const [rate, setRate] = useState<number | null>(defaults.rate);
  const [years, setYears] = useState<number | null>(defaults.years);
  const [urlReady, setUrlReady] = useState(false);

  useEffect(() => {
    const parameters = new URLSearchParams(window.location.search);
    const queryAmount = readNumberParameter(parameters, 'amount', 100, 10_000_000);
    const queryRate = readNumberParameter(parameters, 'rate', 0, 50);
    const queryYears = readNumberParameter(parameters, 'years', 0.1, 60);
    if (queryAmount !== null) setAmount(queryAmount);
    if (queryRate !== null) setRate(queryRate);
    if (queryYears !== null) setYears(queryYears);
    setUrlReady(true);
  }, []);

  useEffect(() => {
    if (!urlReady || amount === null || rate === null || years === null) return;
    replaceCalculatorQuery({ amount, rate, years });
  }, [amount, rate, years, urlReady]);

  const amountError = validateNumericValue(amount, { min: 100, max: 10_000_000, label: 'Monthly investment' });
  const rateError = validateNumericValue(rate, { min: 0, max: 50, label: 'Expected return', allowZero: true });
  const yearsError = validateNumericValue(years, { min: 0.1, max: 60, label: 'Investment duration' });
  const errors = [amountError, rateError, yearsError] as const;

  const result = useMemo<SipResult | null>(() => {
    if (hasValidationErrors(errors) || amount === null || rate === null || years === null) return null;
    try {
      return calculateSip({ monthlyInvestment: amount, annualRate: rate, years });
    } catch {
      return null;
    }
  }, [amount, errors, rate, years]);

  const reset = () => {
    setAmount(defaults.amount);
    setRate(defaults.rate);
    setYears(defaults.years);
  };

  return (
    <div className="calculator-workspace">
      <div className="calculator-primary-grid">
        <CalculatorInputPanel reference="SIP / 01">
          <MoneyInput
            label="Monthly investment"
            value={amount}
            onChange={setAmount}
            min={100}
            max={10_000_000}
            step={500}
            sliderMin={500}
            sliderMax={500_000}
            sliderStep={500}
            helperText={amount === null ? 'Enter your planned monthly contribution.' : `${describeIndianAmount(amount)} rupees each month`}
            error={amountError}
          />
          <PercentageInput
            label="Expected annual return"
            value={rate}
            onChange={setRate}
            min={0}
            max={50}
            step={0.1}
            sliderMax={30}
            sliderStep={0.1}
            helperText="This is an assumption, not a promised market return."
            error={rateError}
          />
          <DurationInput
            value={years}
            onChange={setYears}
            unit="years"
            min={0.1}
            max={60}
            step={0.5}
            sliderStep={0.5}
            helperText="The projection rounds the duration to the nearest month."
            error={yearsError}
            allowUnitSelection={false}
          />
        </CalculatorInputPanel>

        <div className="calculator-result-column">
          <ResultPanel
            eyebrow="Estimated result"
            primaryLabel="Estimated future value"
            primaryValue={result ? formatINR(result.futureValue) : '—'}
            metrics={[
              { label: 'Total invested', value: result ? formatINR(result.totalInvested) : '—' },
              { label: 'Estimated returns', value: result ? formatINR(result.estimatedReturns) : '—' },
            ]}
            note={result ? `Projection over ${result.months} monthly contributions. Actual returns may be higher or lower.` : 'Complete the highlighted inputs to see an estimate.'}
          />
          <CalculatorActions onReset={reset} />
        </div>
      </div>

      {result ? (
        <>
          <div className="calculator-supporting-grid calculator-supporting-grid--chart-wide">
            <ChartContainer
              title="Growth over time"
              description="The solid line is the estimated value; the dashed line is the money contributed."
            >
              <GrowthChart
                points={result.growth}
                ariaLabel={`SIP estimated to grow from zero to ${formatINR(result.futureValue)} over ${result.months} months`}
                showContributed
              />
            </ChartContainer>
            <ChartContainer
              title="Contributions vs growth"
              description="See how much comes from your deposits and how much is estimated growth."
            >
              <DonutChart
                ariaLabel={`Total invested ${formatINR(result.totalInvested)} and estimated returns ${formatINR(result.estimatedReturns)}`}
                segments={[
                  { label: 'Invested amount', value: result.totalInvested, color: 'var(--pc-accent)' },
                  { label: 'Estimated returns', value: result.estimatedReturns, color: '#44403c' },
                ]}
              />
            </ChartContainer>
          </div>
          <CalculationBreakdown
            title="SIP breakdown"
            description="Contributions and estimated market growth are shown separately."
            rows={[
              { label: 'Amount invested', value: formatINR(result.totalInvested) },
              { label: 'Estimated growth', value: formatINR(result.estimatedReturns) },
              { label: 'Estimated total value', value: formatINR(result.futureValue) },
            ]}
            explanation={`Your contributions add up to ${formatINR(result.totalInvested)}. At the return rate entered, compounding adds an estimated ${formatINR(result.estimatedReturns)}, producing a projected value of ${formatINR(result.futureValue)}. This is an illustration, not a guarantee.`}
          />
        </>
      ) : (
        <div className="calculator-fallback" role="status">Enter valid SIP details to generate the projection and growth breakdown.</div>
      )}
    </div>
  );
}
