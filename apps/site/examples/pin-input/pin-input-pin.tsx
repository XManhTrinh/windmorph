import { PinInput } from '@windmorph/react-pro';

/** A masked 4-digit PIN in round boxes, without one-time-code autofill. */
export function PinInputPin() {
  return (
    <PinInput
      label="Enter your PIN"
      length={4}
      corner="full"
      size="lg"
      mask
      otp={false}
      supportingText="4 digits"
    />
  );
}
