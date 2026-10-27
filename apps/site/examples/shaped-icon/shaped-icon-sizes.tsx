import { cookie12SidedShape } from '@windmorph/react/primitives';
import { ShapedIcon } from '@windmorph/react-pro';
import { StarIcon } from '../../components/icons';

/** The four sizes (40, 56, 64 and 96px), in a circle and an Expressive shape. */
export function ShapedIconSizes() {
  return (
    <div className="flex flex-col gap-4">
      {(['circle', cookie12SidedShape] as const).map((shape) => (
        <div key={typeof shape === 'string' ? shape : shape.name} className="flex items-end gap-4">
          {(['sm', 'md', 'lg', 'xl'] as const).map((size) => (
            <ShapedIcon key={size} shape={shape} size={size} color="primary">
              <StarIcon />
            </ShapedIcon>
          ))}
        </div>
      ))}
    </div>
  );
}
