import { PinInput } from '@windmorph/react-pro';

/**
 * Density, as the core's fields: each step takes 4px off the boxes' height, from 56px at 0 to
 * 44px at -3 at the medium size. Left out, the boxes follow the theme's density.
 */
export function PinInputDensity() {
  return (
    <div className="grid w-full gap-6 medium:grid-cols-2">
      {([0, -1, -2, -3] as const).map((density) => (
        <PinInput
          key={density}
          density={density}
          label={`Code (density ${density})`}
          length={6}
          defaultValue="123"
          otp={false}
        />
      ))}
    </div>
  );
}
