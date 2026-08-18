import NumberInput from './NumberInput';
import SelectInput from './SelectInput';

export type DurationUnit = 'years' | 'months';

interface DurationInputProps {
  value: number | null;
  onChange: (value: number | null) => void;
  unit: DurationUnit;
  onUnitChange?: (unit: DurationUnit) => void;
  min: number;
  max: number;
  step: number;
  helperText: string;
  error: string | null;
  sliderMin?: number;
  sliderMax?: number;
  sliderStep?: number;
  allowUnitSelection?: boolean;
}

const unitOptions = [
  { value: 'years', label: 'Years' },
  { value: 'months', label: 'Months' },
] as const;

export default function DurationInput({
  value,
  onChange,
  unit,
  onUnitChange,
  min,
  max,
  step,
  helperText,
  error,
  sliderMin = min,
  sliderMax = max,
  sliderStep = step,
  allowUnitSelection = true,
}: DurationInputProps) {
  const numberInput = (
    <NumberInput
      label="Time period"
      value={value}
      onChange={onChange}
      min={min}
      max={max}
      step={step}
      helperText={helperText}
      error={error}
      maximumFractionDigits={unit === 'years' ? 2 : 0}
      sliderMin={sliderMin}
      sliderMax={sliderMax}
      sliderStep={sliderStep}
    />
  );

  if (!allowUnitSelection || !onUnitChange) return numberInput;

  return (
    <div className="duration-input">
      <div className="duration-input__grid">
        {numberInput}
        <SelectInput
          label="Unit"
          value={unit}
          onChange={onUnitChange}
          options={unitOptions}
        />
      </div>
    </div>
  );
}
