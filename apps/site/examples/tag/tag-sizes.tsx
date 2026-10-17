import { Tag } from '@windmorph/react-pro';
import { StarIcon } from '../../components/icons';

const SIZES = ['sm', 'md', 'lg'] as const;

/** Three sizes (20, 24 and 32px), as a pill (`round`, the default) or with the shape scale's corners (`square`). */
export function TagSizes() {
  return (
    <div className="flex flex-col gap-3">
      {(['round', 'square'] as const).map((shape) => (
        <div key={shape} className="flex flex-wrap items-center gap-2">
          {SIZES.map((size) => (
            <Tag key={size} size={size} shape={shape} color="primary" icon={<StarIcon />}>
              {`${size}, ${shape}`}
            </Tag>
          ))}
        </div>
      ))}
    </div>
  );
}
