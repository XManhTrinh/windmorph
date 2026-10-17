import { Tag, TAG_COLORS, TAG_VARIANTS } from '@windmorph/react-pro';

/** Every variant × colour: tonal for most labels, filled for strong ones, outlined the quietest. */
export function TagVariants() {
  return (
    <div className="flex flex-col gap-3">
      {TAG_VARIANTS.map((variant) => (
        <div key={variant} className="flex flex-wrap gap-2">
          {TAG_COLORS.map((color) => (
            <Tag key={color} variant={variant} color={color}>
              {color}
            </Tag>
          ))}
        </div>
      ))}
    </div>
  );
}
