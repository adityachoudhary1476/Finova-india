import NumericInput, { type NumericInputProps } from './NumericInput';

type NumberInputProps = Omit<NumericInputProps, 'prefix'>;

export default function NumberInput(props: NumberInputProps) {
  return <NumericInput {...props} />;
}
