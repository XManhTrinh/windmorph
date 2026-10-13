import { MessageField } from '@windmorph/react-pro';

/** Filled, tonal and outlined, each in the three one-line heights (40, 48 and 56px). */
export function MessageFieldVariants() {
  return (
    <div className="grid w-full gap-6 medium:grid-cols-3">
      {(['filled', 'tonal', 'outlined'] as const).map((variant) => (
        <div key={variant} className="flex flex-col gap-3">
          {(['sm', 'md', 'lg'] as const).map((size) => (
            <MessageField
              key={size}
              aria-label={`Message (${variant}, ${size})`}
              placeholder={`${variant}, ${size}`}
              variant={variant}
              size={size}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
