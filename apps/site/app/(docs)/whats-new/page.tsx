import type { Metadata } from 'next';
import { InlineCode } from '../../../components/inline-code';
import { RELEASES, releaseAnchor } from '../../../content/releases';
import { guideMetadata } from '../../../lib/site-metadata';

export const metadata: Metadata = guideMetadata('/whats-new');

/** A `YYYY-MM-DD` date as "13 October 2026", the same on the server and in every time zone. */
function formatDate(date: string): string {
  return new Intl.DateTimeFormat('en-GB', { dateStyle: 'long', timeZone: 'UTC' }).format(
    new Date(`${date}T00:00:00Z`),
  );
}

/** Release notes for `@windmorph/react`, newest first, from `content/releases.tsx`. */
export default function WhatsNewPage() {
  return (
    <article className="mx-auto flex max-w-3xl flex-col gap-10">
      <header className="flex flex-col gap-3">
        <h1 className="text-headline-large text-on-surface">What&apos;s new</h1>
        <p className="text-body-large text-on-surface-variant">
          What each version of <InlineCode>@windmorph/react</InlineCode> brings, newest first.
        </p>
      </header>

      {RELEASES.map((release, index) => {
        const anchor = releaseAnchor(release.version);
        return (
          <section key={release.version} aria-labelledby={anchor} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-3">
                <h2 id={anchor} className="text-headline-small text-on-surface">
                  {release.version}
                </h2>
                {index === RELEASES.length - 1 && (
                  <span className="rounded-corner-full bg-secondary-container px-3 py-1 text-label-medium text-on-secondary-container">
                    First release
                  </span>
                )}
              </div>
              <p className="text-body-medium text-on-surface-variant">
                {release.date ? (
                  <time dateTime={release.date}>{formatDate(release.date)}</time>
                ) : (
                  'Not released yet'
                )}
              </p>
              <p className="text-body-large text-on-surface-variant">{release.summary}</p>
            </div>
            {release.sections.map((section) => (
              <div key={section.title} className="flex flex-col gap-3">
                <h3 className="text-title-large text-on-surface">{section.title}</h3>
                <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
                  {section.items.map((item, itemIndex) => (
                    <li key={itemIndex}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
        );
      })}
    </article>
  );
}
