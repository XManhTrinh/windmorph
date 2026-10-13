/**
 * The site-wide footer, rendered once in the root layout. A Server Component (no
 * interactivity); centred, muted, with a top divider. The compact bottom navigation bar is
 * fixed, so the footer carries extra bottom padding on compact to clear it.
 */
export function Footer() {
  return (
    <footer className="border-t border-outline-variant bg-surface px-6 pb-28 pt-8 text-center text-on-surface-variant medium:pb-8">
      <p className="text-body-small">
        Built with <span aria-hidden="true">❤️</span>
        <span className="sr-only">love</span> by{' '}
        <a
          href="https://github.com/XManhTrinh"
          className="rounded-sm text-on-surface underline underline-offset-2 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
        >
          @XManhTrinh
        </a>
      </p>
      <p className="mt-1 text-body-small">
        MIT License · M3 Expressive · React 19 · Tailwind CSS v4
      </p>
    </footer>
  );
}
