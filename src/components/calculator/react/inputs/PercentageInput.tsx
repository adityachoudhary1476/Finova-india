import NumericInput, { type NumericInputProps } from './NumericInput';

type PercentageInputProps = Omit<NumericInputProps, 'suffix' | 'maximumFractionDigits'>;

export default function PercentageInput(props: PercentageInputProps) {
  return <NumericInput {...props} suffix="%" maximumFractionDigits={2} />;
}
