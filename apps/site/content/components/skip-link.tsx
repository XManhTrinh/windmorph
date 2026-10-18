import type { ComponentDoc } from './doc';
import { ExampleViewer } from '../../components/example-viewer';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';
import { InlineCode } from '../../components/inline-code';
import { lazyExample } from '../../lib/lazy-example';

const SkipLinkPage = lazyExample('skip-link/skip-link-page', 'SkipLinkPage');
const SkipLinkBelowBar = lazyExample('skip-link/skip-link-below-bar', 'SkipLinkBelowBar');

/** Skip link page body: purpose, example and placement. */
export async function SkipLinkBody(): Promise<ComponentDoc> {
  const [page, belowBar] = await Promise.all([
    readExampleSource('skip-link/skip-link-page.tsx'),
    readExampleSource('skip-link/skip-link-below-bar.tsx'),
  ]);
  const [pageHtml, belowBarHtml] = await Promise.all([
    highlightSource(page),
    highlightSource(belowBar),
  ]);

  return {
    overview: (
      <>
        <section className="flex flex-col gap-6">
          <h2 id="examples" className="text-headline-small text-on-surface">
            Examples
          </h2>
          <ExampleViewer
            title="Before the navigation"
            code={page}
            html={pageHtml}
            fileName="skip-link-page.tsx"
          >
            <SkipLinkPage />
          </ExampleViewer>
          <ExampleViewer
            title="Below a sticky top bar"
            code={belowBar}
            html={belowBarHtml}
            fileName="skip-link-below-bar.tsx"
          >
            <SkipLinkBelowBar />
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
            comes from <InlineCode>@windmorph/react-pro</InlineCode>, and it is the core&apos;s
            filled <InlineCode>Button</InlineCode> as a link: 40px tall with a 48px touch target,
            the state layer, the ripple and the M3 focus indicator.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 id="behaviour" className="text-headline-small text-on-surface">
            Behaviour
          </h2>
          <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
            <li>
              A fixed wrapper at the top start of the window slides it in on the fast spatial spring
              as it takes focus; under reduced motion it fades in instead.
            </li>
            <li>
              Pressing it moves focus to <InlineCode>target</InlineCode> (giving it{' '}
              <InlineCode>tabindex=&quot;-1&quot;</InlineCode> if it can&apos;t take focus), and
              scrolls to it on purpose, so the next Tab continues from there.
            </li>
            <li>
              Several in a row (content, search) show one at a time, in the same place. Without
              JavaScript it is a plain <InlineCode>#target</InlineCode> link.
            </li>
          </ul>
        </section>
      </>
    ),
    api: (
      <>
        <section className="flex flex-col gap-3">
          <h2 id="placement-and-styling" className="text-headline-small text-on-surface">
            Placement &amp; styling
          </h2>
          <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
            <li>
              <InlineCode>className</InlineCode>, <InlineCode>style</InlineCode> and{' '}
              <InlineCode>data-*</InlineCode> go on the fixed wrapper, the outermost element, so an
              app can move it, for example below a sticky bar with{' '}
              <InlineCode>top-[72px]</InlineCode>. <InlineCode>classNames.root</InlineCode> is the
              same element.
            </li>
            <li>
              The link takes <InlineCode>classNames.link</InlineCode>. Classes that styled the link
              through <InlineCode>className</InlineCode> move there.
            </li>
            <li>
              It has no values of its own: it follows the core filled Button&apos;s tokens, and its
              wrapper carries <InlineCode>data-tokens=&quot;wm-skip-link&quot;</InlineCode>. In
              forced colours it keeps only the Button&apos;s border.
            </li>
          </ul>
        </section>
      </>
    ),
  };
}
