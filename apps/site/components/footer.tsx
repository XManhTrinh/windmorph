const LINK =
  'rounded-sm underline-offset-2 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary';

/**
 * The footer's links: where the code lives, the package, its licence, Pro, sponsoring the
 * project and the privacy notice.
 */
const FOOTER_LINKS = [
  { href: 'https://github.com/XManhTrinh/windmorph', label: 'GitHub' },
  { href: 'https://www.npmjs.com/package/@windmorph/react', label: 'npm' },
  { href: 'https://github.com/XManhTrinh/windmorph/blob/main/LICENSE', label: 'MIT licence' },
  { href: '/pro', label: 'Windmorph Pro' },
  { href: 'https://github.com/sponsors/XManhTrinh', label: 'Sponsor' },
  { href: '/privacy', label: 'Privacy' },
] as const;

/**
 * The site-wide footer, rendered once in the docs shell. A Server Component (no
 * interactivity): the Windmorph name with its links (the repository, the npm package, the
 * licence, the Pro guide, sponsoring and privacy), the stack it's built on, and its author. Centred and muted,
 * with a top divider. The compact bottom navigation bar is fixed, so the footer carries extra
 * bottom padding on compact to clear it.
 */
export function Footer() {
  return (
    <footer className="flex flex-col items-center gap-2 border-t border-outline-variant bg-surface px-6 pb-28 pt-8 text-center text-on-surface-variant medium:pb-8">
      <p className="text-title-medium text-on-surface">Windmorph</p>
      <nav aria-label="Windmorph">
        <ul className="flex flex-wrap justify-center gap-x-1 text-body-medium">
          {FOOTER_LINKS.map((link) => (
            <li key={link.href}>
              {/* 48px tall, so each link is an easy tap on a phone. */}
              <a
                href={link.href}
                className={`inline-flex min-h-12 items-center px-3 text-primary underline ${LINK}`}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <p className="text-body-small">M3 Expressive · React 19 · Tailwind CSS v4</p>
      <p className="text-body-small">
        Built with <span aria-hidden="true">❤️</span>
        <span className="sr-only">love</span> by{' '}
        <a href="https://github.com/XManhTrinh" className={`text-on-surface underline ${LINK}`}>
          @XManhTrinh
        </a>
      </p>
    </footer>
  );
}
