import { Link } from '@windmorph/react-pro';
import { HomeIcon } from '../../components/icons';

/**
 * `plain` is for links around non-text content: a logo, a photo tile. They're never
 * underlined or filled (a background on hover would make them read as buttons); keyboard
 * focus shows the ring, and the content can react to the link's hover, here underlining
 * the name.
 */
export function LinkPlain() {
  return (
    <div className="flex items-start gap-8">
      <Link
        variant="plain"
        color="inherit"
        href="#demo-home"
        aria-label="Home"
        className="text-on-surface"
      >
        <HomeIcon className="size-8" />
      </Link>
      <Link
        variant="plain"
        color="inherit"
        href="#demo-lan"
        className="flex w-28 flex-col gap-1 text-on-surface"
      >
        <span
          aria-hidden="true"
          className="flex aspect-square items-center justify-center rounded-corner-medium bg-tertiary-container text-headline-small text-on-tertiary-container"
        >
          NL
        </span>
        <span className="text-label-large group-data-hovered/link:underline group-data-focus-visible/link:underline">
          Nora Lindqvist
        </span>
      </Link>
    </div>
  );
}
