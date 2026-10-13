import { Button, Card, createTheme, ThemeScope } from '@windmorph/react';

/** The same blue seed twice: `vibrant` alone, and `vibrant` with tonal-spot neutrals. */
const vivid = createTheme({ name: 'demo-vivid', seed: '#1877F2', variant: 'vibrant' });
const calm = createTheme({
  name: 'demo-calm',
  seed: '#1877F2',
  variant: 'vibrant',
  palettes: { neutral: 'tonal-spot', neutralVariant: 'tonal-spot' },
});

const COLUMNS = [
  { theme: vivid, label: 'vibrant' },
  { theme: calm, label: 'vibrant + tonal-spot neutrals' },
] as const;

/**
 * Vivid accents on calm surfaces: the right-hand theme keeps the vibrant buttons and
 * containers, and takes its surfaces from the tonal-spot neutrals. Rendered on the server.
 */
export function PalettesDemo() {
  return (
    <div className="grid w-full gap-4 medium:grid-cols-2">
      {[vivid, calm].map((theme) => (
        <style key={theme.name} href={`docs-${theme.name}`} precedence="windmorph">
          {theme.css}
        </style>
      ))}
      {COLUMNS.map(({ theme, label }) => (
        <div key={theme.name} className="flex min-w-0 flex-col gap-2">
          <code className="truncate text-body-small text-on-surface-variant">{label}</code>
          {(['light', 'dark'] as const).map((mode) => (
            <ThemeScope
              key={mode}
              theme={theme.name}
              mode={mode}
              className="flex flex-col gap-3 rounded-corner-large bg-surface p-4"
            >
              <Card variant="filled" className="flex flex-col gap-3 p-4">
                <p className="text-title-medium text-on-surface">Join the community</p>
                <p className="text-body-medium text-on-surface-variant">
                  {mode === 'light' ? 'Light mode' : 'Dark mode'}: surface and card colours.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button variant="filled" size="sm">
                    Sign up
                  </Button>
                  <Button variant="tonal" size="sm">
                    Learn more
                  </Button>
                </div>
              </Card>
            </ThemeScope>
          ))}
        </div>
      ))}
    </div>
  );
}
