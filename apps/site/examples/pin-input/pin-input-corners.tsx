import { PinInput } from '@windmorph/react-pro';

/**
 * Any corner from the M3 shape scale (the text field's extra small by default), and the
 * three character sets: digits, letters, or both.
 */
export function PinInputCorners() {
  return (
    <div className="grid w-full gap-6 medium:grid-cols-2">
      <PinInput label="Extra small (default)" length={4} defaultValue="12" otp={false} />
      <PinInput label="Medium" corner="medium" length={4} defaultValue="12" otp={false} />
      <PinInput label="Large" corner="large" length={4} defaultValue="12" otp={false} />
      <PinInput label="Full" corner="full" length={4} defaultValue="12" otp={false} />
      <PinInput label="Letters" type="alphabetic" length={5} defaultValue="CAF" otp={false} />
      <PinInput
        label="Letters and digits"
        type="alphanumeric"
        length={5}
        defaultValue="B2"
        otp={false}
      />
    </div>
  );
}
