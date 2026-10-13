import Link from 'next/link';
import type { ReactElement } from 'react';
import { GALLERY_RAIL_GROUPS, pagesInRailGroup } from '../content/components/catalog';
import { ArrowForwardIcon } from './icons';
import { GROUP_ICONS } from './nav/group-icons';
import { PageChips } from './page-chips';

export interface ComponentGalleryProps {
  /**
   * Heading tag for each group title. The standalone `/components` page uses `h2` (under its
   * own `h1`); the homepage nests the gallery under a section `h2`, so it uses `h3`.
   * @default 'h2'
   */
  groupHeadingTag?: 'h2' | 'h3';
}

/**
 * The grouped component browser, shared by the `/components` route and the homepage. Groups
 * by `RAIL_GROUPS` (full names) and renders each component as a modern, interactive card
 * that links to its page. Server Component — no client state, tokens only, dark + RTL safe.
 */
export function ComponentGallery({ groupHeadingTag: GroupHeading = 'h2' }: ComponentGalleryProps) {
  const groups = GALLERY_RAIL_GROUPS.map((group) => ({
    group,
    pages: pagesInRailGroup(group.id),
  })).filter(({ pages }) => pages.length > 0);

  return (
    <div className="flex flex-col gap-12">
      {groups.map(({ group, pages }) => (
        <section key={group.id} className="flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-corner-large bg-secondary-container text-on-secondary-container">
              <span className="inline-flex size-6 [&>svg]:size-full">{GROUP_ICONS[group.id]}</span>
            </span>
            <GroupHeading className="text-headline-small text-on-surface">
              {group.fullName}
            </GroupHeading>
            <span className="rounded-corner-full bg-surface-container-high px-2.5 py-0.5 text-label-medium text-on-surface-variant">
              {pages.length}
            </span>
          </div>
          <ul className="grid grid-cols-1 gap-4 medium:grid-cols-2 large:grid-cols-3">
            {pages.map((page) => (
              <li key={page.slug}>
                <GalleryCard
                  href={`/components/${page.slug}`}
                  title={page.title}
                  summary={page.summary}
                  expressive={page.expressive}
                  pro={page.pro}
                />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function GalleryCard({
  href,
  title,
  summary,
  expressive,
  pro,
}: {
  href: string;
  title: string;
  summary: string;
  expressive?: boolean;
  pro?: boolean;
}): ReactElement {
  return (
    <Link
      href={href}
      className="state-layer focus-ring group/card flex h-full flex-col gap-2 rounded-corner-large border border-outline-variant bg-surface-container-low p-5 transition-[box-shadow,border-color] duration-200 hover:border-outline hover:shadow-elevation-2 motion-reduce:transition-none"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="text-title-medium text-on-surface">{title}</span>
          <PageChips expressive={expressive} pro={pro} />
        </div>
        <span
          aria-hidden="true"
          className="inline-flex size-5 shrink-0 text-on-surface-variant transition-transform duration-200 [&>svg]:size-full group-hover/card:translate-x-0.5 rtl:group-hover/card:-translate-x-0.5 motion-reduce:transition-none"
        >
          <ArrowForwardIcon />
        </span>
      </div>
      <span className="text-body-medium text-on-surface-variant">{summary}</span>
    </Link>
  );
}
