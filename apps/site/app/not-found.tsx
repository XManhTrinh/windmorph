import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page not found',
  description: 'There is no page at this address.',
  robots: { index: false },
};

const LINK =
  'rounded-sm text-primary underline underline-offset-2 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary';

/** Where a reader most often meant to go. */
const DESTINATIONS = [
  { href: '/', label: 'Home' },
  { href: '/components', label: 'Components' },
  { href: '/getting-started', label: 'Getting started' },
];

/**
 * The site's 404 page, in the site's shell: what happened in plain words, what to check, and
 * the ways back (the main pages, and search in the top bar), as the GOV.UK "Page not found"
 * pattern advises, without blaming the reader or naming the error code.
 */
export default function NotFound() {
  return (
    <article className="mx-auto flex max-w-3xl flex-col gap-6">
      <h1 className="text-headline-large text-on-surface">Page not found</h1>
      <div className="flex flex-col gap-3 text-body-large text-on-surface-variant">
        <p>If you typed the web address, check it is correct.</p>
        <p>If you pasted the web address, check you copied the entire address.</p>
        <p>
          The page may also have moved. Search the documentation from the top bar, or go to one of
          these pages:
        </p>
      </div>
      <ul className="flex list-disc flex-col gap-2 ps-6 text-body-large text-on-surface">
        {DESTINATIONS.map(({ href, label }) => (
          <li key={href}>
            <a href={href} className={LINK}>
              {label}
            </a>
          </li>
        ))}
      </ul>
    </article>
  );
}
