import { ShapedIcon } from '@windmorph/react-pro';
import { StarIcon } from '../../components/icons';

const TONES = ['primary', 'secondary', 'tertiary', 'neutral', 'error'] as const;

/**
 * The five tones, each a container role with its content colour. A shaped icon is decorative
 * unless it has an `aria-label`, like the last one here.
 */
export function ShapedIconTones() {
  return (
    <div className="flex flex-wrap items-center gap-4">
      {TONES.map((tone) => (
        <ShapedIcon
          key={tone}
          tone={tone}
          shape="Flower"
          {...(tone === 'error' && { 'aria-label': 'Needs attention' })}
        >
          <StarIcon />
        </ShapedIcon>
      ))}
    </div>
  );
}
