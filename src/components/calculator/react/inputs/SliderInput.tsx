interface SliderInputProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}

export default function SliderInput({ label, value, min, max, step, onChange }: SliderInputProps) {
  return (
    <div className="slider-input">
      <input
        type="range"
        aria-label={`Adjust ${label}`}
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </div>
  );
}
