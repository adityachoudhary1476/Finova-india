import { useMemo, useState } from 'react';
import { DEFAULT_TAX_YEAR_ID, TAX_RULES, type TaxRegime } from '../../../../config/taxRules';
import { calculateIncomeTax, type IncomeTaxComparison, type TaxRegimeResult } from '../../../../lib/tax/incomeTax';
import { describeIndianAmount, formatINR, formatPercentage } from '../../../../lib/formatters';
import { hasValidationErrors, validateNumericValue } from '../../../../lib/validation';
import BreakdownTable from '../BreakdownTable';
import CalculationBreakdown from '../CalculationBreakdown';
import CalculatorActions from '../CalculatorActions';
import CalculatorInputPanel from '../CalculatorInputPanel';
import ChartContainer from '../ChartContainer';
import DonutChart from '../DonutChart';
import ResultPanel from '../ResultPanel';
import MoneyInput from '../inputs/MoneyInput';
import SelectInput from '../inputs/SelectInput';
import '../calculator-ui.css';

const yearOptions = Object.values(TAX_RULES).map((rules) => ({ value: rules.id, label: rules.label }));
const regimeOptions = [
  { value: 'new', label: 'New tax regime' },
  { value: 'old', label: 'Old tax regime' },
] as const;
const defaults = { year: DEFAULT_TAX_YEAR_ID, regime: 'new' as TaxRegime, salary: 1_500_000, other: 0, deduction80C: 150_000, otherDeductions: 0 };

function slabLabel(from: number, to: number | null): string {
  return to === null ? `Above ${formatINR(from)}` : `${formatINR(from)} – ${formatINR(to)}`;
}

export default function IncomeTaxCalculator() {
  const [taxYearId, setTaxYearId] = useState(defaults.year);
  const [selectedRegime, setSelectedRegime] = useState<TaxRegime>(defaults.regime);
  const [salaryIncome, setSalaryIncome] = useState<number | null>(defaults.salary);
  const [otherIncome, setOtherIncome] = useState<number | null>(defaults.other);
  const [deduction80C, setDeduction80C] = useState<number | null>(defaults.deduction80C);
  const [otherDeductions, setOtherDeductions] = useState<number | null>(defaults.otherDeductions);
  const rules = TAX_RULES[taxYearId] ?? TAX_RULES[DEFAULT_TAX_YEAR_ID];

  const salaryError = validateNumericValue(salaryIncome, { min: 0, max: 5_000_000, label: 'Salary income', allowZero: true });
  const otherErrorBase = validateNumericValue(otherIncome, { min: 0, max: 5_000_000, label: 'Other income', allowZero: true });
  const grossIncome = (salaryIncome ?? 0) + (otherIncome ?? 0);
  const otherError = otherErrorBase === null && grossIncome > 5_000_000 ? 'Combined income must be ₹50 lakh or less because surcharge is not modelled.' : otherErrorBase;
  const deduction80CError = validateNumericValue(deduction80C, { min: 0, max: 5_000_000, label: '80C deduction', allowZero: true });
  const otherDeductionError = validateNumericValue(otherDeductions, { min: 0, max: 5_000_000, label: 'Other deductions', allowZero: true });
  const errors = [salaryError, otherError, deduction80CError, otherDeductionError] as const;

  const comparison = useMemo<IncomeTaxComparison | null>(() => {
    if (hasValidationErrors(errors) || salaryIncome === null || otherIncome === null || deduction80C === null || otherDeductions === null) return null;
    try { return calculateIncomeTax({ taxYearId, salaryIncome, otherIncome, deduction80C, otherOldRegimeDeductions: otherDeductions }); } catch { return null; }
  }, [deduction80C, errors, otherDeductions, otherIncome, salaryIncome, taxYearId]);
  const result: TaxRegimeResult | null = comparison
    ? (selectedRegime === 'new' ? comparison.newRegime : comparison.oldRegime)
    : null;

  const reset = () => { setTaxYearId(defaults.year); setSelectedRegime(defaults.regime); setSalaryIncome(defaults.salary); setOtherIncome(defaults.other); setDeduction80C(defaults.deduction80C); setOtherDeductions(defaults.otherDeductions); };
  const regimeLabel = selectedRegime === 'new' ? 'New tax regime' : 'Old tax regime';

  return (
    <div className="calculator-workspace">
      <div className="calculator-primary-grid">
        <CalculatorInputPanel reference="TAX / 01">
          <SelectInput label="Assessment year" value={taxYearId} onChange={setTaxYearId} options={yearOptions} helperText="Rules are versioned so future assessment years can be added independently." />
          <SelectInput label="Result regime" value={selectedRegime} onChange={setSelectedRegime} options={regimeOptions} helperText="Both regimes are calculated; this selection controls the detailed result and slab table." />
          <MoneyInput label="Annual salary income" value={salaryIncome} onChange={setSalaryIncome} min={0} max={5_000_000} step={10_000} sliderMax={5_000_000} sliderStep={10_000} helperText={salaryIncome === null ? 'Enter salary income before standard deduction.' : `${describeIndianAmount(salaryIncome)} rupees salary income`} error={salaryError} />
          <MoneyInput label="Other normal-rate income" value={otherIncome} onChange={setOtherIncome} min={0} max={5_000_000} step={10_000} sliderMax={5_000_000} sliderStep={10_000} helperText="Interest and other income taxed at normal slab rates. Do not include special-rate capital gains." error={otherError} />
          <MoneyInput label="Section 80C deduction entered" value={deduction80C} onChange={setDeduction80C} min={0} max={5_000_000} step={5_000} sliderMax={150_000} sliderStep={5_000} helperText="Applied only to the old-regime comparison and capped at ₹1,50,000 by this rule set." error={deduction80CError} />
          <MoneyInput label="Other eligible old-regime deductions" value={otherDeductions} onChange={setOtherDeductions} min={0} max={5_000_000} step={5_000} sliderMax={1_000_000} sliderStep={5_000} helperText="Enter only deductions you have independently confirmed as eligible. Ignored under the new regime here." error={otherDeductionError} />
        </CalculatorInputPanel>

        <div className="calculator-result-column">
          <ResultPanel eyebrow={`${regimeLabel} estimate`} primaryLabel="Estimated total tax" primaryValue={result ? formatINR(result.totalTax) : '—'} metrics={[
            { label: 'Taxable income', value: result ? formatINR(result.taxableIncome) : '—' },
            { label: 'Effective tax rate', value: result ? formatPercentage(result.effectiveTaxRate) : '—' },
          ]} note={rules ? `${rules.assessmentYear} · includes ${rules.cessRate}% cess · excludes surcharge and special-rate income` : 'Tax rules unavailable.'} />
          <CalculatorActions onReset={reset} />
        </div>
      </div>

      {comparison && result && rules ? (
        <>
          <div className="calculator-supporting-grid">
            <ChartContainer title="Income vs estimated tax" description={`Visual share of gross income under the ${regimeLabel.toLowerCase()}.`}>
              <DonutChart ariaLabel={`Gross income ${formatINR(result.grossIncome)} and estimated total tax ${formatINR(result.totalTax)}`} segments={[
                { label: 'Income after estimated tax', value: Math.max(0, result.grossIncome - result.totalTax), color: 'var(--pc-accent)' },
                { label: 'Estimated tax', value: result.totalTax, color: '#44403c' },
              ]} />
            </ChartContainer>
            <CalculationBreakdown title="Tax calculation breakdown" description={`How the ${regimeLabel.toLowerCase()} estimate was built.`} rows={[
              { label: 'Total income included', value: formatINR(result.grossIncome) },
              { label: 'Standard deduction', value: formatINR(result.standardDeduction) },
              { label: 'Other deductions applied', value: formatINR(result.enteredDeductions) },
              { label: 'Taxable income', value: formatINR(result.taxableIncome) },
              { label: 'Tax before rebate', value: formatINR(result.taxBeforeRebate) },
              { label: 'Rebate / marginal relief', value: formatINR(result.rebate + result.marginalRelief) },
              { label: `Cess at ${rules.cessRate}%`, value: formatINR(result.cess) },
              { label: 'Estimated total tax', value: formatINR(result.totalTax) },
            ]} explanation="Salary and other normal-rate income are combined. The selected regime’s standard deduction and permitted entered deductions are subtracted, slab tax is calculated, then eligible rebate or marginal relief and health and education cess are applied." />
          </div>

          <CalculationBreakdown title="Old vs new regime comparison" description="Both estimates use the same income inputs; old-regime deductions are applied only to the old regime." rows={[
            { label: 'New regime total tax', value: formatINR(comparison.newRegime.totalTax) },
            { label: 'Old regime total tax', value: formatINR(comparison.oldRegime.totalTax) },
            { label: 'Difference', value: formatINR(comparison.taxDifference) },
            { label: 'Lower estimate', value: comparison.lowerTaxRegime === 'same' ? 'Same estimate' : `${comparison.lowerTaxRegime === 'new' ? 'New' : 'Old'} regime` },
          ]} explanation="The lower estimate is not a recommendation. Eligibility for deductions, exemptions and regime selection can depend on personal circumstances and filing rules." />

          <BreakdownTable title={`${regimeLabel} slab calculation`} description="Only the portion of taxable income falling inside each slab is taxed at that slab’s rate." regionLabel={`${regimeLabel} income tax slab breakdown`} columns={[
            { key: 'slab', label: 'Income slab', align: 'left' },
            { key: 'rate', label: 'Rate' },
            { key: 'taxable', label: 'Amount in slab' },
            { key: 'tax', label: 'Tax from slab' },
          ]} rows={result.slabs.map((slab) => ({ slab: slabLabel(slab.from, slab.to), rate: `${slab.rate}%`, taxable: formatINR(slab.taxableInSlab), tax: formatINR(slab.tax) }))} />

          <div className="calculator-section-note">Scope: resident individual below age 60 with salary and other income taxed at normal slab rates, up to ₹50 lakh. Capital gains, special-rate income, surcharge, reliefs and many exemptions are outside this estimator.</div>
        </>
      ) : <div className="calculator-fallback" role="status">Enter valid income and deduction values to compare tax regimes.</div>}
    </div>
  );
}
