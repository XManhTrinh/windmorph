'use client';

import { useMemo, useSyncExternalStore } from 'react';

/** The content the outline lists: the page's section headings (`h2` with an id). */
const HEADINGS = '#main-content h2[id]';
/** A heading is the current section once its top is this far from the window's top (px). */
const ACTIVE_OFFSET = 112;
/** The outline column's width, reserved on large windows whether or not it lists anything. */
const COLUMN = 'w-52 shrink-0';

interface OutlineEntry {
  id: string;
  text: string;
}

function readHeadings(): OutlineEntry[] {
  return [...document.querySelectorAll<HTMLElement>(HEADINGS)].map((heading) => ({
    id: heading.id,
    text: heading.textContent?.trim() ?? '',
  }));
}

function subscribeToHeadings(onChange: () => void) {
  const main = document.getElementById('main-content');
  if (!main) return () => {};
  const observer = new MutationObserver(onChange);
  observer.observe(main, { childList: true, subtree: true });
  return () => observer.disconnect();
}

/** The headings as a string, so the snapshot only changes when they do. */
const headingsSnapshot = () => JSON.stringify(readHeadings());

function subscribeToScroll(onChange: () => void) {
  window.addEventListener('scroll', onChange, { passive: true });
  window.addEventListener('resize', onChange);
  return () => {
    window.removeEventListener('scroll', onChange);
    window.removeEventListener('resize', onChange);
  };
}

/** The section being read: the last heading scrolled past the top, or the last at the end. */
function activeSnapshot(): string {
  const headings = [...document.querySelectorAll<HTMLElement>(HEADINGS)];
  const atEnd = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
  if (atEnd && headings.length > 0) return headings[headings.length - 1]!.id;
  let active = headings[0]?.id ?? '';
  for (const heading of headings) {
    if (heading.getBoundingClientRect().top <= ACTIVE_OFFSET) active = heading.id;
    else break;
  }
  return active;
}

/**
 * "On this page": the page's sections, sticky at the end side of the content on large
 * windows (hidden on smaller ones), with the one being read marked. It reads the rendered
 * headings through `useSyncExternalStore`, so the static HTML has no outline (the server
 * snapshot is empty) and hydration never mismatches; it follows tab changes as the headings
 * change. Pages with fewer than two sections show none, but keep the column empty, so the
 * content sits in the same place on every page.
 */
export function PageOutline() {
  const json = useSyncExternalStore(subscribeToHeadings, headingsSnapshot, () => '[]');
  const headings = useMemo(() => JSON.parse(json) as OutlineEntry[], [json]);
  const active = useSyncExternalStore(subscribeToScroll, activeSnapshot, () => '');
  if (headings.length < 2) {
    return <div aria-hidden="true" className={`${COLUMN} hidden large:block`} />;
  }

  return (
    <nav
      aria-labelledby="page-outline-title"
      className={`${COLUMN} sticky top-24 hidden max-h-[calc(100dvh-8rem)] self-start overflow-y-auto large:block`}
    >
      <p id="page-outline-title" className="pb-3 ps-4 text-title-small text-on-surface">
        On this page
      </p>
      <ul className="flex flex-col border-s border-outline-variant">
        {headings.map((heading) => (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              aria-current={heading.id === active ? 'location' : undefined}
              className="-ms-px block border-s-2 border-transparent py-1.5 ps-4 pe-2 text-body-medium text-on-surface-variant outline-none transition-colors hover:text-on-surface focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-secondary aria-[current=location]:border-primary aria-[current=location]:text-body-medium-emphasized aria-[current=location]:text-primary motion-reduce:transition-none"
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
