import { ShapedIcon } from '@windmorph/react-pro';
import { EditIcon, SearchIcon, SendIcon } from '../../components/icons';

const steps = [
  {
    title: 'Find',
    body: 'Search shops, jobs and homes near you.',
    Icon: SearchIcon,
    shape: 'Cookie9Sided',
    tone: 'primary',
  },
  {
    title: 'Ask',
    body: 'Message sellers and businesses directly.',
    Icon: SendIcon,
    shape: 'Flower',
    tone: 'secondary',
  },
  {
    title: 'Review',
    body: 'Share how it went, to help the next person.',
    Icon: EditIcon,
    shape: 'SoftBurst',
    tone: 'tertiary',
  },
] as const;

/** Steps that each lead with an icon on an M3 Expressive shape. */
export function ShapedIconSteps() {
  return (
    <ol className="flex w-full max-w-md flex-col gap-6">
      {steps.map(({ title, body, Icon, shape, tone }) => (
        <li key={title} className="flex items-start gap-4">
          <ShapedIcon shape={shape} tone={tone} size="lg">
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
