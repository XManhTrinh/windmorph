'use client';

import { Link } from '@windmorph/react-pro';
import { FormattedText } from '@windmorph/react-pro/rich-text';

/**
 * The app's own origin, a constant from its config: `internalLinks` runs on the server too,
 * where there is no `location`, and must answer the same there.
 */
const SITE_ORIGIN = 'https://site.example';

const POST =
  'New here? Start with [getting started](https://site.example/getting-started), then read ' +
  '[the Link page](https://site.example/components/link). The ' +
  '[writing checklist](https://example.com/writing-checklist) is on another site.';

/**
 * The app's own links as ordinary links: `internalLinks` picks them by origin, and `renderLink`
 * renders them with `link.path` (one leading slash, then the search and hash), as a router's
 * link component takes it; never the address's raw `pathname`, which can name another site.
 * For every other link it returns `undefined`, keeping the default: a new tab, with
 * `rel="ugc nofollow noopener noreferrer"`.
 */
export function FormattedTextOwnLinks() {
  return (
    <div className="w-full max-w-md rounded-corner-large bg-surface-container px-4 py-2 text-body-medium text-on-surface">
      <FormattedText
        text={POST}
        internalLinks={(url) => url.origin === SITE_ORIGIN}
        renderLink={(link) =>
          link.internal ? <Link href={link.path}>{link.label}</Link> : undefined
        }
      />
    </div>
  );
}
