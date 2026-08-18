import { useEffect, useId, useState } from 'react';
import { clamp } from '../../../../lib/validation';
import { formatInputNumber, parseNumericInput } from '../../../../lib/formatters';
import SliderInput from './SliderInput';

export interface NumericInputProps {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
  min: number;
  max: number;
  step: number;
  helperText: string;
  error: string | null;
  prefix?: string;
  suffix?: string;
  maximumFractionDigits?: number;
  sliderMin?: number;
  sliderMax?: number;
  sliderStep?: number;
  showRange?: boolean;
}

export default function NumericInput({
  label,
  value,
  onChange,
  min,
  max,
  step,
  helperText,
  error,
  prefix,
  suffix,
  maximumFractionDigits = 2,
  sliderMin = min,
  sliderMax = max,
  sliderStep = step,
  showRange = false,
}: NumericInputProps) {
  const inputId = useId();
  const helperId = `${inputId}-helper`;
  const errorId = `${inputId}-error`;
  const [isFocused, setIsFocused] = useState(false);
  const [displayValue, setDisplayValue] = useState(
    value === null ? '' : formatInputNumber(value, maximumFractionDigits),
  );

  useEffect(() => {
    if (!isFocused) {
      setDisplayValue(value === null ? '' : formatInputNumber(value, maximumFractionDigits));
    }
  }, [isFocused, maximumFractionDigits, value]);

  const describedBy = error ? `${helperId} ${errorId}` : helperId;
  const sliderValue = clamp(value ?? sliderMin, sliderMin, sliderMax);

  return (
    <div className="numeric-field">
      <div className="numeric-field__label-row">
        <label htmlFor={inputId}>{label}</label>
        {showRange && (
          <span className="numeric-field__range">
            {formatInputNumber(min, maximumFractionDigits)}–{formatInputNumber(max, maximumFractionDigits)}
          </span>
        )}
      </div>
      <div className={`numeric-field__control${error ? ' numeric-field__control--error' : ''}`}>
        {prefix && <span className="numeric-field__adornment" aria-hidden="true">{prefix}</span>}
        <input
          id={inputId}
          type="text"
          inputMode="decimal"
          value={displayValue}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={describedBy}
          onFocus={(event) => {
            setIsFocused(true);
            event.currentTarget.select();
          }}
          onBlur={() => {
            setIsFocused(false);
            setDisplayValue(value === null ? '' : formatInputNumber(value, maximumFractionDigits));
          }}
          onChange={(event) => {
            const nextDisplayValue = event.target.value;
            setDisplayValue(nextDisplayValue);
            onChange(parseNumericInput(nextDisplayValue));
          }}
        />
        {suffix && <span className="numeric-field__adornment numeric-field__adornment--suffix" aria-hidden="true">{suffix}</span>}
      </div>
      <span id={helperId} className="numeric-field__helper">{helperText}</span>
      <SliderInput
        label={label}
        value={sliderValue}
        min={sliderMin}
        max={sliderMax}
        step={sliderStep}
        onChange={onChange}
      />
      {error && <p id={errorId} className="numeric-field__error" role="status">{error}</p>}
    </div>
  );
}
