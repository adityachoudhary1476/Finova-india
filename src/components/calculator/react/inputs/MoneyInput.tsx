import NumericInput, { type NumericInputProps } from './NumericInput';

type MoneyInputProps = Omit<NumericInputProps, 'prefix' | 'maximumFractionDigits'>;

export default function MoneyInput(props: MoneyInputProps) {
  return <NumericInput {...props} prefix="₹" maximumFractionDigits={0} />;
}
