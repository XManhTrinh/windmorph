import type { ComponentDoc } from './doc';
import { ExampleViewer } from '../../components/example-viewer';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';
import { InlineCode } from '../../components/inline-code';
import { lazyExample } from '../../lib/lazy-example';

const SkipLinkPage = lazyExample('skip-link/skip-link-page', 'SkipLinkPage');

/** Skip link page body: purpose, example, accessibility and placement. */
export async function SkipLinkBody(): Promise<ComponentDoc> {
  const page = await readExampleSource('skip-link/skip-link-page.tsx');
  const pageHtml = await highlightSource(page);

  return {
    overview: (
      <>
        <section className="flex flex-col gap-6">
          <h2 id="example" className="text-headline-small text-on-surface">
            Example
          </h2>
          <ExampleViewer
            title="Before the navigation"
            code={page}
            html={pageHtml}
            fileName="skip-link-page.tsx"
          >
            <SkipLinkPage />
          </ExampleViewer>
        </section>
      </>
    ),
    guidelines: (
      <>
        <section className="flex flex-col gap-3">
          <h2 id="purpose" className="text-headline-small text-on-surface">
            Purpose
          </h2>
          <p className="text-body-large text-on-surface-variant">
            &quot;Skip to content&quot; lets keyboard and screen-reader users jump past the top bar
            and navigation that repeat on every page (WCAG 2.4.1, Bypass Blocks). It stays off
            screen until it takes focus, then shows at the top; pressing it moves focus into the
            content. It is <strong className="text-on-surface">not an M3 component</strong>, so it
            comes from <InlineCode>@windmorph/react-pro</InlineCode>, drawn as a filled button with
            the M3 focus indicator.
          </p>
        </section>
      </>
    ),
    accessibility: (
      <>
        <section className="flex flex-col gap-3">
          <h2 id="placement-and-keyboard" className="text-headline-small text-on-surface">
            Placement &amp; keyboard
          </h2>
          <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
            <li>
              Put it first in the page, before the top bar, and give the content an id:{' '}
              <InlineCode>{'<main id="main">'}</InlineCode> with{' '}
              <InlineCode>{'target="main"'}</InlineCode>.
            </li>
            <li>
              The first Tab shows it; Enter moves focus to the target (made focusable with{' '}
              <InlineCode>{'tabindex="-1"'}</InlineCode> if it isn&apos;t), so the next Tab
              continues from there. The hash stays out of the URL.
            </li>
            <li>
              Several in a row (content, search) show one at a time, in the same place, as each
              takes focus.
            </li>
            <li>
              Without JavaScript it is a plain <InlineCode>#target</InlineCode> link, which still
              works.
            </li>
            <li>Under reduced motion it appears at once instead of sliding in.</li>
          </ul>
        </section>
      </>
    ),
  };
}
