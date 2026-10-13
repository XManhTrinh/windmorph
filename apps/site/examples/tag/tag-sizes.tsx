import { Tag } from '@windmorph/react-pro';
import { StarIcon } from '../../components/icons';

const SIZES = ['sm', 'md', 'lg'] as const;

/** Three sizes (20, 24 and 32px), as a pill (`full`) or with the shape scale's corners. */
export function TagSizes() {
  return (
    <div className="flex flex-col gap-3">
      {(['full', 'rounded'] as const).map((shape) => (
        <div key={shape} className="flex flex-wrap items-center gap-2">
          {SIZES.map((size) => (
            <Tag key={size} size={size} shape={shape} tone="primary" icon={<StarIcon />}>
              {`${size}, ${shape}`}
            </Tag>
          ))}
        </div>
      ))}
    </div>
  );
}
