import { useMemo, useState } from 'react';
import { calculateGst, type GstDirection, type GstResult } from '../../../../lib/calculators/gst';
import { describeIndianAmount, formatINR } from '../../../../lib/formatters';
import { hasValidationErrors, validateNumericValue } from '../../../../lib/validation';
import CalculationBreakdown from '../CalculationBreakdown';
import CalculatorActions from '../CalculatorActions';
import CalculatorInputPanel from '../CalculatorInputPanel';
import ResultPanel from '../ResultPanel';
import MoneyInput from '../inputs/MoneyInput';
import PercentageInput from '../inputs/PercentageInput';
import SelectInput from '../inputs/SelectInput';
import '../calculator-ui.css';

const directionOptions = [
  { value: 'add', label: 'Add GST to a base amount' },
  { value: 'remove', label: 'Remove GST from an inclusive amount' },
] as const;
const rateOptions = [
  { value: '5', label: '5%' }, { value: '12', label: '12%' }, { value: '18', label: '18%' }, { value: '28', label: '28%' }, { value: 'custom', label: 'Custom rate' },
] as const;
type GstRateChoice = '5' | '12' | '18' | '28' | 'custom';
const defaults = { direction: 'add' as GstDirection, amount: 100_000, rateChoice: '18' as GstRateChoice, customRate: 18 };

export default function GstCalculator() {
  const [direction, setDirection] = useState<GstDirection>(defaults.direction);
  const [amount, setAmount] = useState<number | null>(defaults.amount);
  const [rateChoice, setRateChoice] = useState<GstRateChoice>(defaults.rateChoice);
  const [customRate, setCustomRate] = useState<number | null>(defaults.customRate);
  const rate = rateChoice === 'custom' ? customRate : Number(rateChoice);
  const amountError = validateNumericValue(amount, { min: 0, max: 1_000_000_000, label: direction === 'add' ? 'Base amount' : 'Inclusive amount', allowZero: true });
  const rateError = validateNumericValue(rate, { min: 0, max: 100, label: 'GST rate', allowZero: true });
  const errors = [amountError, rateError] as const;
  const result = useMemo<GstResult | null>(() => {
    if (hasValidationErrors(errors) || amount === null || rate === null) return null;
    try { return calculateGst({ amount, rate, direction }); } catch { return null; }
  }, [amount, direction, errors, rate]);
  const reset = () => { setDirection(defaults.direction); setAmount(defaults.amount); setRateChoice(defaults.rateChoice); setCustomRate(defaults.customRate); };

  return (
    <div className="calculator-workspace">
      <div className="calculator-primary-grid">
        <CalculatorInputPanel reference="GST / 01">
          <SelectInput label="Calculation direction" value={direction} onChange={setDirection} options={directionOptions} helperText="Choose add for a pre-tax base, or remove for a GST-inclusive total." />
          <MoneyInput label={direction === 'add' ? 'Base amount before GST' : 'GST-inclusive amount'} value={amount} onChange={setAmount} min={0} max={1_000_000_000} step={1_000} sliderMax={10_000_000} sliderStep={1_000} helperText={amount === null ? 'Enter an amount.' : `${describeIndianAmount(amount)} rupees ${direction === 'add' ? 'before GST' : 'including GST'}`} error={amountError} />
          <SelectInput label="GST rate" value={rateChoice} onChange={setRateChoice} options={rateOptions} helperText="Common rate choices are provided for convenience; confirm the applicable rate separately." />
          {rateChoice === 'custom' && <PercentageInput label="Custom GST rate" value={customRate} onChange={setCustomRate} min={0} max={100} step={0.1} sliderMax={50} sliderStep={0.1} helperText="Enter the custom percentage to add or remove." error={rateError} />}
        </CalculatorInputPanel>
        <div className="calculator-result-column">
          <ResultPanel eyebrow={direction === 'add' ? 'GST added' : 'GST removed'} primaryLabel={direction === 'add' ? 'Final amount including GST' : 'Original base amount'} primaryValue={result ? formatINR(direction === 'add' ? result.inclusiveAmount : result.baseAmount) : '—'} metrics={[
            { label: 'GST amount', value: result ? formatINR(result.gstAmount) : '—' },
            { label: direction === 'add' ? 'Base amount' : 'Inclusive amount', value: result ? formatINR(direction === 'add' ? result.baseAmount : result.inclusiveAmount) : '—' },
          ]} note={`${rate ?? '—'}% GST · this is an arithmetic estimate, not tax advice`} />
          <CalculatorActions onReset={reset} />
        </div>
      </div>
      {result ? (
        <CalculationBreakdown title={direction === 'add' ? 'Add GST breakdown' : 'Remove GST breakdown'} description="Base, GST component and inclusive total are shown separately." rows={[
          { label: 'Base amount', value: formatINR(result.baseAmount, 2) },
          { label: `GST at ${result.rate}%`, value: formatINR(result.gstAmount, 2) },
          { label: 'Inclusive amount', value: formatINR(result.inclusiveAmount, 2) },
        ]} explanation={direction === 'add'
          ? 'GST amount = base amount × GST rate ÷ 100. Final amount = base amount + GST amount.'
          : 'Base amount = inclusive amount ÷ (1 + GST rate ÷ 100). GST component = inclusive amount − base amount.'} />
      ) : <div className="calculator-fallback" role="status">Enter a valid amount and GST rate to calculate the breakdown.</div>}
    </div>
  );
}
