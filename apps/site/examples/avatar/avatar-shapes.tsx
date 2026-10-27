import { materialShapePaths } from '@windmorph/react/primitives';
import { Avatar, type AvatarShape } from '@windmorph/react-pro';

const SHAPES: AvatarShape[] = ['circle', 'rounded', ...Object.values(materialShapePaths)];

/**
 * `shape` takes `circle` (the default), `rounded`, or a shape outline: one of the 35 M3
 * Expressive shapes as a constant (`shape={cookie12SidedShape}`, from
 * `@windmorph/react/primitives`) or your own. Outlines are masks, so they scale with the
 * avatar. This gallery imports `materialShapePaths`, every outline at once; an app that draws
 * one shape imports only its constant.
 */
export function AvatarShapes() {
  return (
    <ul className="grid w-full grid-cols-3 gap-4 medium:grid-cols-6 expanded:grid-cols-8">
      {SHAPES.map((shape) => {
        const name = typeof shape === 'string' ? shape : shape.name;
        return (
          <li key={name} className="flex flex-col items-center gap-2">
            <Avatar name="Priya Shah" decorative size="lg" shape={shape} color="primary" />
            <code className="text-label-small text-on-surface-variant">{name}</code>
          </li>
        );
      })}
    </ul>
  );
}
