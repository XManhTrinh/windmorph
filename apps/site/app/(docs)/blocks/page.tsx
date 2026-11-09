import type { Metadata } from 'next';
import Link from 'next/link';
import { guideMetadata } from '../../../lib/site-metadata';

export const metadata: Metadata = guideMetadata('/blocks');

/** The Blocks index. */
export default function BlocksPage() {
  return (
    <article className="mx-auto flex max-w-3xl flex-col gap-6">
      <h1 className="text-headline-large text-on-surface">Blocks</h1>
      <p className="text-body-large text-on-surface-variant">
        Larger layouts built from the components, as code you copy into your app and own. Blocks
        aren’t in the package, so change them however your app needs.
      </p>
      <Link
        href="/blocks/app-frame"
        className="flex flex-col gap-1 rounded-corner-large bg-surface-container p-6 no-underline outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
      >
        <span className="text-title-large text-on-surface">App frame</span>
        <span className="text-body-medium text-on-surface-variant">
          A top bar, a rail with flyouts, a rounded pane and a side panel rail, in three variations.
        </span>
      </Link>
    </article>
  );
}
