import { PinInput } from '@windmorph/react-pro';

/** Invalid with its message, required, read-only and disabled. */
export function PinInputStates() {
  return (
    <div className="grid w-full gap-6 medium:grid-cols-2">
      <PinInput
        label="Invalid"
        length={4}
        defaultValue="1234"
        invalid
        errorMessage="That code has expired."
        otp={false}
      />
      <PinInput label="Required" length={4} required supportingText="4 digits" otp={false} />
      <PinInput label="Read-only" length={4} defaultValue="2468" readOnly otp={false} />
      <PinInput label="Disabled" length={4} defaultValue="13" disabled otp={false} />
    </div>
  );
}
