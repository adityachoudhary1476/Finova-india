import { useEffect, useMemo, useState } from 'react';
import { calculateEmi, type EmiResult } from '../../../../lib/calculators/emi';
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

const defaults = {
  amount: 2_500_000,
  rate: 8.5,
  tenure: 20,
  unit: 'years' as DurationUnit,
};

export default function EmiCalculator() {
  const [amount, setAmount] = useState<number | null>(defaults.amount);
  const [rate, setRate] = useState<number | null>(defaults.rate);
  const [tenure, setTenure] = useState<number | null>(defaults.tenure);
  const [unit, setUnit] = useState<DurationUnit>(defaults.unit);
  const [urlReady, setUrlReady] = useState(false);

  useEffect(() => {
    const parameters = new URLSearchParams(window.location.search);
    const queryAmount = readNumberParameter(parameters, 'amount', 1_000, 100_000_000);
    const queryRate = readNumberParameter(parameters, 'rate', 0, 50);
    const queryUnit = parameters.get('unit') === 'months' ? 'months' : 'years';
    const queryTenure = readNumberParameter(
      parameters,
      'tenure',
      queryUnit === 'years' ? 1 : 1,
      queryUnit === 'years' ? 40 : 480,
    );
    if (queryAmount !== null) setAmount(queryAmount);
    if (queryRate !== null) setRate(queryRate);
    if (queryTenure !== null) setTenure(queryTenure);
    setUnit(queryUnit);
    setUrlReady(true);
  }, []);

  useEffect(() => {
    if (!urlReady || amount === null || rate === null || tenure === null) return;
    replaceCalculatorQuery({ amount, rate, tenure, unit });
  }, [amount, rate, tenure, unit, urlReady]);

  const amountError = validateNumericValue(amount, {
    min: 1_000,
    max: 100_000_000,
    label: 'Loan amount',
  });
  const rateError = validateNumericValue(rate, {
    min: 0,
    max: 50,
    label: 'Interest rate',
    allowZero: true,
  });
  const tenureError = validateNumericValue(tenure, {
    min: 1,
    max: unit === 'years' ? 40 : 480,
    label: 'Loan tenure',
  });
  const errors = [amountError, rateError, tenureError] as const;

  const result = useMemo<EmiResult | null>(() => {
    if (hasValidationErrors(errors) || amount === null || rate === null || tenure === null) return null;
    const tenureMonths = unit === 'years' ? Math.round(tenure * 12) : Math.round(tenure);
    try {
      return calculateEmi({ principal: amount, annualRate: rate, tenureMonths });
    } catch {
      return null;
    }
  }, [amount, errors, rate, tenure, unit]);

  const handleUnitChange = (nextUnit: DurationUnit) => {
    if (nextUnit === unit) return;
    if (tenure !== null) {
      setTenure(nextUnit === 'months' ? Math.round(tenure * 12) : Number((tenure / 12).toFixed(2)));
    }
    setUnit(nextUnit);
  };

  const reset = () => {
    setAmount(defaults.amount);
    setRate(defaults.rate);
    setTenure(defaults.tenure);
    setUnit(defaults.unit);
  };

  const primaryValue = result ? formatINR(result.monthlyEmi) : '—';
  const totalInterest = result ? formatINR(result.totalInterest) : '—';
  const totalPayable = result ? formatINR(result.totalPayable) : '—';

  return (
    <div className="calculator-workspace">
      <div className="calculator-primary-grid">
        <CalculatorInputPanel reference="LOAN / 01">
          <MoneyInput
            label="Loan amount"
            value={amount}
            onChange={setAmount}
            min={1_000}
            max={100_000_000}
            step={10_000}
            sliderMin={100_000}
            sliderMax={20_000_000}
            sliderStep={50_000}
            helperText={amount === null ? 'Enter the amount you plan to borrow.' : `${describeIndianAmount(amount)} rupees`}
            error={amountError}
          />
          <PercentageInput
            label="Annual interest rate"
            value={rate}
            onChange={setRate}
            min={0}
            max={50}
            step={0.1}
            sliderMax={30}
            sliderStep={0.1}
            helperText="Use the annual reducing-balance rate offered by the lender."
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
            helperText="Choose years or months. The calculation always uses monthly payments."
            error={tenureError}
          />
        </CalculatorInputPanel>

        <div className="calculator-result-column">
          <ResultPanel
            primaryLabel="Monthly EMI"
            primaryValue={primaryValue}
            metrics={[
              { label: 'Total interest', value: totalInterest },
              { label: 'Total amount payable', value: totalPayable },
            ]}
            note={result ? `${formatDuration(result.tenureMonths)} · fixed-rate reducing-balance estimate` : 'Complete the highlighted inputs to see a result.'}
          />
          <CalculatorActions onReset={reset} />
        </div>
      </div>

      {result ? (
        <>
          <div className="calculator-supporting-grid">
            <ChartContainer
              title="Principal vs interest"
              description="Compare the amount borrowed with the interest paid over the full tenure."
            >
              <DonutChart
                ariaLabel={`Principal ${formatINR(result.principal)} and total interest ${formatINR(result.totalInterest)}`}
                segments={[
                  { label: 'Principal', value: result.principal, color: 'var(--pc-accent)' },
                  { label: 'Interest', value: result.totalInterest, color: '#44403c' },
                ]}
              />
            </ChartContainer>
            <CalculationBreakdown
              description="The complete repayment picture based on your current inputs."
              rows={[
                { label: 'Loan amount', value: formatINR(result.principal) },
                { label: 'Monthly payment', value: formatINR(result.monthlyEmi) },
                { label: 'Total interest', value: formatINR(result.totalInterest) },
                { label: 'Total repayment', value: formatINR(result.totalPayable) },
              ]}
              explanation={`You borrow ${formatINR(result.principal)} and repay approximately ${formatINR(result.totalPayable)} over ${formatDuration(result.tenureMonths)}. The difference—${formatINR(result.totalInterest)}—is the estimated interest cost.`}
            />
          </div>
          <AmortisationTable rows={result.schedule} />
        </>
      ) : (
        <div className="calculator-fallback" role="status">Enter valid loan details to generate the visual breakdown and amortisation schedule.</div>
      )}
    </div>
  );
}
