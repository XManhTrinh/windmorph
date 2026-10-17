import { Tag, TAG_TONES, TAG_VARIANTS } from '@windmorph/react-pro';

/** Every variant × tone: tonal for most labels, filled for strong ones, outlined the quietest. */
export function TagVariants() {
  return (
    <div className="flex flex-col gap-3">
      {TAG_VARIANTS.map((variant) => (
        <div key={variant} className="flex flex-wrap gap-2">
          {TAG_TONES.map((tone) => (
            <Tag key={tone} variant={variant} tone={tone}>
              {tone}
            </Tag>
          ))}
        </div>
      ))}
    </div>
  );
}
