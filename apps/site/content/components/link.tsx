import type { ComponentDoc } from './doc';
import { linkTokenSet } from '@windmorph/react-pro';
import { ExampleViewer } from '../../components/example-viewer';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';
import { InlineCode } from '../../components/inline-code';
import { TokenTable } from '../../components/token-table';
import { lazyExample } from '../../lib/lazy-example';

const LinkButton = lazyExample('link/link-button', 'LinkButton');
const LinkInText = lazyExample('link/link-in-text', 'LinkInText');
const LinkPlain = lazyExample('link/link-plain', 'LinkPlain');
const LinkStandalone = lazyExample('link/link-standalone', 'LinkStandalone');

/** Link page body: when to use it, examples and tokens. */
export async function LinkBody(): Promise<ComponentDoc> {
  const [inText, standalone, plain, button] = await Promise.all([
    readExampleSource('link/link-in-text.tsx'),
    readExampleSource('link/link-standalone.tsx'),
    readExampleSource('link/link-plain.tsx'),
    readExampleSource('link/link-button.tsx'),
  ]);
  const [inTextHtml, standaloneHtml, plainHtml, buttonHtml] = await Promise.all([
    highlightSource(inText),
    highlightSource(standalone),
    highlightSource(plain),
    highlightSource(button),
  ]);

  return {
    overview: (
      <>
        <section className="flex flex-col gap-6">
          <h2 id="examples" className="text-headline-small text-on-surface">
            Examples
          </h2>
          <ExampleViewer
            title="In running text"
            code={inText}
            html={inTextHtml}
            fileName="link-in-text.tsx"
          >
            <LinkInText />
          </ExampleViewer>
          <ExampleViewer
            title="Standalone and on colour"
            code={standalone}
            html={standaloneHtml}
            fileName="link-standalone.tsx"
          >
            <LinkStandalone />
          </ExampleViewer>
          <ExampleViewer
            title="Around a logo or a photo tile"
            code={plain}
            html={plainHtml}
            fileName="link-plain.tsx"
          >
            <LinkPlain />
          </ExampleViewer>
          <ExampleViewer
            title="Text that does something: onPress instead of href"
            code={button}
            html={buttonHtml}
            fileName="link-button.tsx"
          >
            <LinkButton />
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
            A link is navigation written as text: inside a sentence, as a name, or on a line of its
            own. It is <strong className="text-on-surface">not an M3 component</strong>: M3 leaves
            text links to the platform, so it comes from{' '}
            <InlineCode>@windmorph/react-pro</InlineCode>, built from M3&apos;s colour roles, type
            scale and focus indicator, and routed like every library link.
          </p>
          <p className="text-body-large text-on-surface-variant">
            For a section&apos;s or a dialog&apos;s action (&quot;See all&quot;, &quot;Edit
            profile&quot;), use a text <InlineCode>Button</InlineCode> with{' '}
            <InlineCode>href</InlineCode>. When a whole card or row goes somewhere, give the{' '}
            <InlineCode>Card</InlineCode> or <InlineCode>ListItem</InlineCode> an{' '}
            <InlineCode>href</InlineCode>.
          </p>
          <p className="text-body-large text-on-surface-variant">
            For text inside a sentence that does something rather than going somewhere (&quot;and 3
            others&quot; opening a list, &quot;See translation&quot;), give{' '}
            <InlineCode>onPress</InlineCode> instead of <InlineCode>href</InlineCode>: it renders a{' '}
            <InlineCode>&lt;button&gt;</InlineCode> with the same variants, colour and tokens.
          </p>
        </section>
      </>
    ),
    api: (
      <>
        <section className="flex flex-col gap-3">
          <h2 id="theming-and-tokens" className="text-headline-small text-on-surface">
            Theming &amp; tokens
          </h2>
          <p className="text-body-large text-on-surface-variant">
            The colour is <InlineCode>primary</InlineCode>; with{' '}
            <InlineCode>color=&quot;inherit&quot;</InlineCode> it defaults to the surrounding
            text&apos;s (<InlineCode>currentColor</InlineCode>), for links on a coloured container.
            Set the tokens below on a link or an ancestor. Each link carries{' '}
            <InlineCode>data-tokens=&quot;wm-link&quot;</InlineCode>, so a value set on an outer
            link no longer leaks into a link nested inside it. A <InlineCode>standalone</InlineCode>{' '}
            link has a 48px touch target, in an inner wrapper so the underline still reaches the
            text.
          </p>
          <TokenTable set={linkTokenSet} caption="Link tokens" />
        </section>
      </>
    ),
  };
}
