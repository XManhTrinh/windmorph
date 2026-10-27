import { PhoneField } from '@windmorph/react-pro';

/**
 * Density, as the core's fields: each step takes 4px off both fields and the country list's
 * rows, from 56px at 0 to 44px at -3. Left out, the field follows the theme's density.
 */
export function PhoneFieldDensity() {
  return (
    <div className="grid w-full gap-6 medium:grid-cols-2">
      {([0, -1, -2, -3] as const).map((density) => (
        <PhoneField
          key={density}
          density={density}
          label={`Phone (density ${density})`}
          defaultValue="+447400123456"
        />
      ))}
    </div>
  );
}
