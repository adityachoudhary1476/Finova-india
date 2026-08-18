import { useMemo, useState } from 'react';
import { FINANCIAL_RULES } from '../../../../config/financialRules';
import { calculateGratuity, type GratuityResult } from '../../../../lib/calculators/gratuity';
import { formatINR } from '../../../../lib/formatters';
import { hasValidationErrors, validateNumericValue } from '../../../../lib/validation';
import CalculationBreakdown from '../CalculationBreakdown';
import CalculatorActions from '../CalculatorActions';
import CalculatorInputPanel from '../CalculatorInputPanel';
import ResultPanel from '../ResultPanel';
import MoneyInput from '../inputs/MoneyInput';
import NumberInput from '../inputs/NumberInput';
import '../calculator-ui.css';

const defaults = { basic: 50_000, da: 0, years: 7, months: 0 };

export default function GratuityCalculator() {
  const [basic, setBasic] = useState<number | null>(defaults.basic);
  const [da, setDa] = useState<number | null>(defaults.da);
  const [years, setYears] = useState<number | null>(defaults.years);
  const [months, setMonths] = useState<number | null>(defaults.months);

  const basicError = validateNumericValue(basic, { min: 1, max: 10_000_000, label: 'Basic salary' });
  const daError = validateNumericValue(da, { min: 0, max: 10_000_000, label: 'Dearness allowance', allowZero: true });
  const yearsError = validateNumericValue(years, { min: 0, max: 60, label: 'Years of service', allowZero: true });
  const monthsBaseError = validateNumericValue(months, { min: 0, max: 11, label: 'Additional months', allowZero: true });
  const monthsError = monthsBaseError === null && months !== null && !Number.isInteger(months) ? 'Additional months must be a whole number.' : monthsBaseError;
  const errors = [basicError, daError, yearsError, monthsError] as const;
  const result = useMemo<GratuityResult | null>(() => {
    if (hasValidationErrors(errors) || basic === null || da === null || years === null || months === null) return null;
    try { return calculateGratuity({ monthlyBasicSalary: basic, monthlyDearnessAllowance: da, serviceYears: Math.floor(years), serviceMonths: Math.floor(months) }); } catch { return null; }
  }, [basic, da, errors, months, years]);

  const reset = () => { setBasic(defaults.basic); setDa(defaults.da); setYears(defaults.years); setMonths(defaults.months); };

  return (
    <div className="calculator-workspace">
      <div className="calculator-primary-grid">
        <CalculatorInputPanel reference="GRATUITY / 01">
          <MoneyInput label="Last drawn monthly basic salary" value={basic} onChange={setBasic} min={1} max={10_000_000} step={1_000} sliderMin={5_000} sliderMax={1_000_000} sliderStep={1_000} helperText="Use the monthly basic salary included in eligible wages." error={basicError} />
          <MoneyInput label="Monthly dearness allowance" value={da} onChange={setDa} min={0} max={10_000_000} step={500} sliderMax={500_000} sliderStep={500} helperText="Enter DA only where it forms part of eligible wages; otherwise leave zero." error={daError} />
          <NumberInput label="Completed years of service" value={years} onChange={setYears} min={0} max={60} step={1} maximumFractionDigits={0} helperText="Standard eligibility is generally assessed separately from the formula." error={yearsError} />
          <NumberInput label="Additional completed months" value={months} onChange={setMonths} min={0} max={11} step={1} maximumFractionDigits={0} helperText="More than six additional months rounds up to another completed year in this estimate." error={monthsError} />
        </CalculatorInputPanel>
        <div className="calculator-result-column">
          <ResultPanel eyebrow="Estimated benefit" primaryLabel="Estimated gratuity" primaryValue={result ? formatINR(result.estimatedGratuity) : '—'} metrics={[
            { label: 'Eligible monthly wage', value: result ? formatINR(result.eligibleMonthlyWage) : '—' },
            { label: 'Service used in formula', value: result ? `${result.completedServiceYears} years` : '—' },
          ]} note={result ? (result.meetsStandardEligibility ? 'Standard five-year eligibility threshold met.' : 'Standard five-year threshold not met; exceptions may apply.') : 'Complete the inputs to see an estimate.'} />
          <CalculatorActions onReset={reset} />
        </div>
      </div>
      {result ? (
        <>
          <CalculationBreakdown description="The estimate uses eligible wage, statutory day factor and rounded completed service." rows={[
            { label: 'Basic + DA', value: formatINR(result.eligibleMonthlyWage) },
            { label: 'Completed service used', value: `${result.completedServiceYears} years` },
            { label: 'Uncapped formula amount', value: formatINR(result.uncappedGratuity) },
            { label: 'Configured maximum', value: formatINR(FINANCIAL_RULES.gratuity.currentMaximumRupees) },
            { label: 'Estimated gratuity', value: formatINR(result.estimatedGratuity) },
          ]} explanation={`Formula: eligible monthly wage × ${FINANCIAL_RULES.gratuity.daysOfWagesPerYear} ÷ ${FINANCIAL_RULES.gratuity.workingDaysDivisor} × completed service years. Eligibility and final payment depend on employment circumstances and applicable law.`} />
          {!result.meetsStandardEligibility && <div className="calculator-section-note">The usual five-year continuous-service condition is not met by these inputs. Death, disablement, fixed-term employment and other circumstances can have different rules; this result is not a legal entitlement.</div>}
        </>
      ) : <div className="calculator-fallback" role="status">Enter valid salary and service details to estimate gratuity.</div>}
    </div>
  );
}
