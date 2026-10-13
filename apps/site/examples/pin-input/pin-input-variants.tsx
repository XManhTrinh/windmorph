import { PinInput, type PinInputSize } from '@windmorph/react-pro';

const SIZES: PinInputSize[] = ['small', 'medium', 'large'];

/** The M3 text field's two variants, in three sizes. */
export function PinInputVariants() {
  return (
    <div className="grid w-full gap-6 medium:grid-cols-2">
      {(['outlined', 'filled'] as const).map((variant) => (
        <div key={variant} className="flex flex-col gap-4">
          {SIZES.map((size) => (
            <PinInput
              key={size}
              label={`${variant}, ${size}`}
              variant={variant}
              size={size}
              length={4}
              defaultValue="20"
              otp={false}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
