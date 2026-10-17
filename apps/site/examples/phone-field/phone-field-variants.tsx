import { PhoneField } from '@windmorph/react-pro';

/**
 * Filled (the default) and outlined, like the M3 text field, with a valid and an invalid
 * number.
 */
export function PhoneFieldVariants() {
  return (
    <div className="grid w-full gap-6 medium:grid-cols-2">
      {(['filled', 'outlined'] as const).map((variant) => (
        <div key={variant} className="flex flex-col gap-4">
          <PhoneField variant={variant} label={`Phone (${variant})`} defaultValue="+447400123456" />
          <PhoneField
            variant={variant}
            label="Phone"
            defaultValue="+6681234"
            invalid
            errorMessage="Enter a valid phone number"
          />
        </div>
      ))}
    </div>
  );
}
