import { useMemo, useState } from 'react';
import { calculateSalary, type SalaryBasis, type SalaryResult } from '../../../../lib/calculators/salary';
import { describeIndianAmount, formatINR } from '../../../../lib/formatters';
import { hasValidationErrors, validateNumericValue } from '../../../../lib/validation';
import CalculationBreakdown from '../CalculationBreakdown';
import CalculatorActions from '../CalculatorActions';
import CalculatorInputPanel from '../CalculatorInputPanel';
import ChartContainer from '../ChartContainer';
import DonutChart from '../DonutChart';
import ResultPanel from '../ResultPanel';
import MoneyInput from '../inputs/MoneyInput';
import PercentageInput from '../inputs/PercentageInput';
import SelectInput from '../inputs/SelectInput';
import '../calculator-ui.css';

const basisOptions = [
  { value: 'ctc', label: 'Annual CTC' },
  { value: 'gross', label: 'Annual gross salary' },
] as const;

const defaults = {
  basis: 'ctc' as SalaryBasis,
  annualAmount: 1_200_000,
  basicSalary: 480_000,
  employerBenefits: 57_600,
  epfRate: 12,
  professionalTax: 2_400,
  otherDeductions: 0,
};

export default function SalaryCalculator() {
  const [basis, setBasis] = useState<SalaryBasis>(defaults.basis);
  const [annualAmount, setAnnualAmount] = useState<number | null>(defaults.annualAmount);
  const [basicSalary, setBasicSalary] = useState<number | null>(defaults.basicSalary);
  const [employerBenefits, setEmployerBenefits] = useState<number | null>(defaults.employerBenefits);
  const [epfRate, setEpfRate] = useState<number | null>(defaults.epfRate);
  const [professionalTax, setProfessionalTax] = useState<number | null>(defaults.professionalTax);
  const [otherDeductions, setOtherDeductions] = useState<number | null>(defaults.otherDeductions);

  const amountError = validateNumericValue(annualAmount, { min: 1, max: 100_000_000, label: basis === 'ctc' ? 'Annual CTC' : 'Annual gross salary' });
  const benefitsError = basis === 'ctc'
    ? validateNumericValue(employerBenefits, { min: 0, max: 20_000_000, label: 'Employer-side benefits', allowZero: true })
    : null;
  const estimatedGross = annualAmount === null ? null : Math.max(0, annualAmount - (basis === 'ctc' ? (employerBenefits ?? 0) : 0));
  const basicErrorBase = validateNumericValue(basicSalary, { min: 0, max: 100_000_000, label: 'Basic salary', allowZero: true });
  const basicError = basicErrorBase === null && basicSalary !== null && estimatedGross !== null && basicSalary > estimatedGross
    ? 'Basic salary cannot exceed estimated annual gross salary.'
    : basicErrorBase;
  const epfError = validateNumericValue(epfRate, { min: 0, max: 100, label: 'Employee EPF rate', allowZero: true });
  const professionalTaxError = validateNumericValue(professionalTax, { min: 0, max: 100_000, label: 'Professional tax', allowZero: true });
  const otherError = validateNumericValue(otherDeductions, { min: 0, max: 20_000_000, label: 'Other deductions', allowZero: true });
  const errors = [amountError, benefitsError, basicError, epfError, professionalTaxError, otherError] as const;

  const result = useMemo<SalaryResult | null>(() => {
    if (hasValidationErrors(errors) || annualAmount === null || basicSalary === null || epfRate === null || professionalTax === null || otherDeductions === null) return null;
    try {
      return calculateSalary({
        basis,
        annualAmount,
        annualBasicSalary: basicSalary,
        employerSideBenefits: basis === 'ctc' ? (employerBenefits ?? 0) : 0,
        employeeEpfRate: epfRate,
        annualProfessionalTax: professionalTax,
        annualOtherDeductions: otherDeductions,
      });
    } catch {
      return null;
    }
  }, [annualAmount, basicSalary, basis, employerBenefits, epfRate, errors, otherDeductions, professionalTax]);

  const reset = () => {
    setBasis(defaults.basis);
    setAnnualAmount(defaults.annualAmount);
    setBasicSalary(defaults.basicSalary);
    setEmployerBenefits(defaults.employerBenefits);
    setEpfRate(defaults.epfRate);
    setProfessionalTax(defaults.professionalTax);
    setOtherDeductions(defaults.otherDeductions);
  };

  return (
    <div className="calculator-workspace">
      <div className="calculator-primary-grid">
        <CalculatorInputPanel reference="PAY / 01">
          <SelectInput label="Salary input type" value={basis} onChange={setBasis} options={basisOptions} helperText="Choose whether the top-line amount is CTC or gross salary." />
          <MoneyInput
            label={basis === 'ctc' ? 'Annual CTC' : 'Annual gross salary'}
            value={annualAmount}
            onChange={setAnnualAmount}
            min={1}
            max={100_000_000}
            step={10_000}
            sliderMin={100_000}
            sliderMax={10_000_000}
            sliderStep={10_000}
            helperText={annualAmount === null ? 'Enter the annual amount.' : `${describeIndianAmount(annualAmount)} rupees per year`}
            error={amountError}
          />
          {basis === 'ctc' && (
            <MoneyInput
              label="Employer-side benefits in CTC"
              value={employerBenefits}
              onChange={setEmployerBenefits}
              min={0}
              max={20_000_000}
              step={1_000}
              sliderMax={1_000_000}
              sliderStep={1_000}
              helperText="Employer PF, gratuity or benefits included in CTC but not paid as monthly gross salary."
              error={benefitsError}
            />
          )}
          <MoneyInput
            label="Annual basic salary"
            value={basicSalary}
            onChange={setBasicSalary}
            min={0}
            max={100_000_000}
            step={10_000}
            sliderMax={5_000_000}
            sliderStep={10_000}
            helperText="Used only to estimate the employee EPF deduction."
            error={basicError}
          />
          <PercentageInput
            label="Employee EPF contribution"
            value={epfRate}
            onChange={setEpfRate}
            min={0}
            max={100}
            step={0.1}
            sliderMax={20}
            sliderStep={0.1}
            helperText="Enter the percentage of basic salary deducted as employee EPF."
            error={epfError}
          />
          <MoneyInput
            label="Annual professional tax"
            value={professionalTax}
            onChange={setProfessionalTax}
            min={0}
            max={100_000}
            step={100}
            sliderMax={10_000}
            sliderStep={100}
            helperText="Enter only if professional tax applies in your state or payroll."
            error={professionalTaxError}
          />
          <MoneyInput
            label="Other annual deductions"
            value={otherDeductions}
            onChange={setOtherDeductions}
            min={0}
            max={20_000_000}
            step={1_000}
            sliderMax={1_000_000}
            sliderStep={1_000}
            helperText="Optional payroll deductions such as insurance or recoveries. Income tax is not included here."
            error={otherError}
          />
        </CalculatorInputPanel>

        <div className="calculator-result-column">
          <ResultPanel
            eyebrow="Estimated salary"
            primaryLabel="Monthly in-hand salary"
            primaryValue={result ? formatINR(result.monthlyInHand) : '—'}
            metrics={[
              { label: 'Monthly gross salary', value: result ? formatINR(result.monthlyGrossSalary) : '—' },
              { label: 'Annual take-home', value: result ? formatINR(result.annualTakeHome) : '—' },
            ]}
            note="Income tax is not deducted in this salary estimate. Employer salary structures vary."
          />
          <CalculatorActions onReset={reset} />
        </div>
      </div>

      {result ? (
        <div className="calculator-supporting-grid">
          <ChartContainer title="Take-home vs deductions" description="See the estimated annual take-home and the deductions entered above.">
            <DonutChart
              ariaLabel={`Annual take-home ${formatINR(result.annualTakeHome)} and total deductions ${formatINR(result.totalDeductions)}`}
              segments={[
                { label: 'Annual take-home', value: result.annualTakeHome, color: 'var(--pc-accent)' },
                { label: 'Deductions', value: result.totalDeductions, color: '#44403c' },
              ]}
            />
          </ChartContainer>
          <CalculationBreakdown
            title="Salary breakdown"
            description="A transparent bridge from the top-line salary amount to estimated take-home."
            rows={[
              { label: 'Annual gross salary', value: formatINR(result.annualGrossSalary) },
              { label: 'Monthly gross salary', value: formatINR(result.monthlyGrossSalary) },
              { label: 'Employee EPF', value: formatINR(result.employeeEpfContribution) },
              { label: 'Professional tax', value: formatINR(result.professionalTax) },
              { label: 'Other deductions', value: formatINR(result.otherDeductions) },
              { label: 'Estimated annual take-home', value: formatINR(result.annualTakeHome) },
            ]}
            explanation="CTC can include employer-side costs that are not part of gross salary. In-hand salary is estimated by subtracting only the deductions explicitly shown here; payroll tax and employer-specific components may change the actual payslip."
          />
        </div>
      ) : (
        <div className="calculator-fallback" role="status">Enter a valid salary structure to generate the in-hand estimate.</div>
      )}
    </div>
  );
}
