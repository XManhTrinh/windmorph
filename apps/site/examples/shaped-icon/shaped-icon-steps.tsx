import { cookie9SidedShape, flowerShape, softBurstShape } from '@windmorph/react/primitives';
import { ShapedIcon } from '@windmorph/react-pro';
import { EditIcon, SearchIcon, SendIcon } from '../../components/icons';

const steps = [
  {
    title: 'Find',
    body: 'Search shops, jobs and homes near you.',
    Icon: SearchIcon,
    shape: cookie9SidedShape,
    color: 'primary',
  },
  {
    title: 'Ask',
    body: 'Message sellers and businesses directly.',
    Icon: SendIcon,
    shape: flowerShape,
    color: 'secondary',
  },
  {
    title: 'Review',
    body: 'Share how it went, to help the next person.',
    Icon: EditIcon,
    shape: softBurstShape,
    color: 'tertiary',
  },
] as const;

/** Steps that each lead with an icon on an M3 Expressive shape. */
export function ShapedIconSteps() {
  return (
    <ol className="flex w-full max-w-md flex-col gap-6">
      {steps.map(({ title, body, Icon, shape, color }) => (
        <li key={title} className="flex items-start gap-4">
          <ShapedIcon shape={shape} color={color} size="lg">
            <Icon />
          </ShapedIcon>
          <div className="flex flex-col gap-1">
            <h3 className="text-title-large text-on-surface">{title}</h3>
            <p className="text-body-large text-on-surface-variant">{body}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
