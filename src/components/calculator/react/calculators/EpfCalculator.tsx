import { useMemo, useState } from 'react';
import { FINANCIAL_RULES } from '../../../../config/financialRules';
import { calculateEpf, type EpfResult } from '../../../../lib/calculators/epf';
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
import '../calculator-ui.css';

const defaults = {
  basic: 50_000,
  employeeRate: FINANCIAL_RULES.epf.defaultEmployeeContributionRate,
  employerRate: FINANCIAL_RULES.epf.defaultEmployerEpfContributionRate,
  salaryIncrease: FINANCIAL_RULES.epf.defaultAnnualSalaryIncrease,
  currentBalance: 200_000,
  years: 25,
  interestRate: FINANCIAL_RULES.epf.defaultAnnualRate,
};

export default function EpfCalculator() {
  const [basic, setBasic] = useState<number | null>(defaults.basic);
  const [employeeRate, setEmployeeRate] = useState<number | null>(defaults.employeeRate);
  const [employerRate, setEmployerRate] = useState<number | null>(defaults.employerRate);
  const [salaryIncrease, setSalaryIncrease] = useState<number | null>(defaults.salaryIncrease);
  const [currentBalance, setCurrentBalance] = useState<number | null>(defaults.currentBalance);
  const [years, setYears] = useState<number | null>(defaults.years);
  const [interestRate, setInterestRate] = useState<number | null>(defaults.interestRate);

  const basicError = validateNumericValue(basic, { min: 1, max: 10_000_000, label: 'Monthly basic salary' });
  const employeeError = validateNumericValue(employeeRate, { min: 0, max: 100, label: 'Employee contribution rate', allowZero: true });
  const employerError = validateNumericValue(employerRate, { min: 0, max: 100, label: 'Employer EPF contribution rate', allowZero: true });
  const increaseError = validateNumericValue(salaryIncrease, { min: 0, max: 50, label: 'Annual salary increase', allowZero: true });
  const balanceError = validateNumericValue(currentBalance, { min: 0, max: 100_000_000, label: 'Current EPF balance', allowZero: true });
  const yearsBaseError = validateNumericValue(years, { min: 1, max: 50, label: 'Years to retirement' });
  const yearsError = yearsBaseError === null && years !== null && !Number.isInteger(years) ? 'Years to retirement must be a whole number.' : yearsBaseError;
  const interestError = validateNumericValue(interestRate, { min: 0, max: 20, label: 'EPF interest rate', allowZero: true });
  const errors = [basicError, employeeError, employerError, increaseError, balanceError, yearsError, interestError] as const;

  const result = useMemo<EpfResult | null>(() => {
    if (hasValidationErrors(errors) || basic === null || employeeRate === null || employerRate === null || salaryIncrease === null || currentBalance === null || years === null || interestRate === null) return null;
    try { return calculateEpf({ monthlyBasicSalary: basic, employeeContributionRate: employeeRate, employerEpfContributionRate: employerRate, annualSalaryIncreaseRate: salaryIncrease, currentEpfBalance: currentBalance, years, annualInterestRate: interestRate }); } catch { return null; }
  }, [balanceError, basic, currentBalance, employeeRate, employerRate, errors, interestRate, salaryIncrease, years]);

  const reset = () => { setBasic(defaults.basic); setEmployeeRate(defaults.employeeRate); setEmployerRate(defaults.employerRate); setSalaryIncrease(defaults.salaryIncrease); setCurrentBalance(defaults.currentBalance); setYears(defaults.years); setInterestRate(defaults.interestRate); };

  return (
    <div className="calculator-workspace">
      <div className="calculator-primary-grid">
        <CalculatorInputPanel reference="EPF / 01">
          <MoneyInput label="Monthly basic salary" value={basic} onChange={setBasic} min={1} max={10_000_000} step={1_000} sliderMin={5_000} sliderMax={1_000_000} sliderStep={1_000} helperText={basic === null ? 'Enter monthly basic salary.' : `${describeIndianAmount(basic)} rupees basic per month`} error={basicError} />
          <PercentageInput label="Employee EPF contribution" value={employeeRate} onChange={setEmployeeRate} min={0} max={100} step={0.1} sliderMax={20} sliderStep={0.1} helperText="Percentage of basic salary contributed by the employee." error={employeeError} />
          <PercentageInput label="Employer contribution credited to EPF" value={employerRate} onChange={setEmployerRate} min={0} max={100} step={0.01} sliderMax={20} sliderStep={0.01} helperText="Enter only the employer share credited to EPF; EPS allocation and wage ceilings can change this value." error={employerError} />
          <PercentageInput label="Annual basic salary increase" value={salaryIncrease} onChange={setSalaryIncrease} min={0} max={50} step={0.1} sliderMax={25} sliderStep={0.1} helperText="Used to increase the basic salary assumption after each year." error={increaseError} />
          <MoneyInput label="Current EPF balance" value={currentBalance} onChange={setCurrentBalance} min={0} max={100_000_000} step={10_000} sliderMax={10_000_000} sliderStep={10_000} helperText="Existing EPF balance at the start of this projection." error={balanceError} />
          <NumberInput label="Years to retirement" value={years} onChange={setYears} min={1} max={50} step={1} maximumFractionDigits={0} helperText="Projection period in whole years." error={yearsError} />
          <PercentageInput label="Annual EPF interest assumption" value={interestRate} onChange={setInterestRate} min={0} max={20} step={0.1} sliderMax={15} sliderStep={0.1} helperText="Editable because EPF rates are notified and can change." error={interestError} />
        </CalculatorInputPanel>
        <div className="calculator-result-column">
          <ResultPanel eyebrow="Estimated retirement corpus" primaryLabel="Estimated EPF corpus" primaryValue={result ? formatINR(result.estimatedCorpus) : '—'} metrics={[
            { label: 'Total new contributions', value: result ? formatINR(result.totalNewContributions) : '—' },
            { label: 'Estimated interest', value: result ? formatINR(result.estimatedInterest) : '—' },
          ]} note="Employer EPF share, salary growth and interest are assumptions—not a statutory statement." />
          <CalculatorActions onReset={reset} />
        </div>
      </div>
      {result ? (
        <>
          <div className="calculator-supporting-grid calculator-supporting-grid--chart-wide">
            <ChartContainer title="EPF corpus growth" description="Projected corpus compared with current balance and cumulative contributions.">
              <GrowthChart points={result.growth} ariaLabel={`EPF balance grows to an estimated ${formatINR(result.estimatedCorpus)}`} showContributed />
            </ChartContainer>
            <CalculationBreakdown description="Employee, employer and interest components are shown separately." rows={[
              { label: 'Current EPF balance', value: formatINR(result.currentBalance) },
              { label: 'Employee contributions', value: formatINR(result.employeeContribution) },
              { label: 'Employer EPF contributions', value: formatINR(result.employerContribution) },
              { label: 'Estimated interest', value: formatINR(result.estimatedInterest) },
              { label: 'Estimated corpus', value: formatINR(result.estimatedCorpus) },
            ]} explanation="This projection compounds monthly for illustration. Actual EPFO interest is notified and credited under scheme rules; employer contributions can be split between EPF and EPS and may be subject to wage ceilings." />
          </div>
          <BreakdownTable title="EPF year-wise projection" description="Salary assumption, contributions, interest and closing corpus for each year." regionLabel="EPF year-wise projection" columns={[
            { key: 'year', label: 'Year', align: 'left' },
            { key: 'basic', label: 'Monthly basic' },
            { key: 'employee', label: 'Employee' },
            { key: 'employer', label: 'Employer EPF' },
            { key: 'interest', label: 'Interest' },
            { key: 'closing', label: 'Closing corpus' },
          ]} rows={result.schedule.map((row) => ({ year: row.year, basic: formatINR(row.monthlyBasicSalary), employee: formatINR(row.employeeContribution), employer: formatINR(row.employerContribution), interest: formatINR(row.interestEarned), closing: formatINR(row.closingBalance) }))} />
        </>
      ) : <div className="calculator-fallback" role="status">Enter valid EPF assumptions to generate the corpus projection.</div>}
    </div>
  );
}
