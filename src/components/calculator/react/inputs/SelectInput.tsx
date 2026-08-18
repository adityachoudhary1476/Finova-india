import { useId } from 'react';

export interface SelectOption<T extends string> {
  value: T;
  label: string;
}

interface SelectInputProps<T extends string> {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: readonly SelectOption<T>[];
  helperText?: string;
  hideLabel?: boolean;
}

export default function SelectInput<T extends string>({
  label,
  value,
  onChange,
  options,
  helperText,
  hideLabel = false,
}: SelectInputProps<T>) {
  const inputId = useId();
  const helperId = `${inputId}-helper`;

  return (
    <div className="select-input">
      <label htmlFor={inputId} className={hideLabel ? 'sr-only' : undefined}>{label}</label>
      <select
        id={inputId}
        value={value}
        aria-describedby={helperText ? helperId : undefined}
        onChange={(event) => onChange(event.target.value as T)}
      >
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
      {helperText && <span id={helperId} className="select-input__helper">{helperText}</span>}
    </div>
  );
}
