import type { ComponentDoc } from './doc';
import { collapseTokenSet } from '@windmorph/react-pro';
import { ExampleViewer } from '../../components/example-viewer';
import { TokenTable } from '../../components/token-table';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';
import { InlineCode } from '../../components/inline-code';
import { lazyExample } from '../../lib/lazy-example';

const CollapseDisclosure = lazyExample('collapse/collapse-disclosure', 'CollapseDisclosure');
const CollapseReplies = lazyExample('collapse/collapse-replies', 'CollapseReplies');
const CollapseShownFirst = lazyExample('collapse/collapse-shown-first', 'CollapseShownFirst');

/** Collapse page body: purpose, examples, behaviour, accessibility and tokens. */
export async function CollapseBody(): Promise<ComponentDoc> {
  const [replies, disclosure] = await Promise.all([
    readExampleSource('collapse/collapse-replies.tsx'),
    readExampleSource('collapse/collapse-disclosure.tsx'),
  ]);
  const [repliesHtml, disclosureHtml] = await Promise.all([
    highlightSource(replies),
    highlightSource(disclosure),
  ]);

  const shownFirst = await readExampleSource('collapse/collapse-shown-first.tsx');
  const shownFirstHtml = await highlightSource(shownFirst);
  return {
    overview: (
      <>
        <section className="flex flex-col gap-6">
          <h2 id="examples" className="text-headline-small text-on-surface">
            Examples
          </h2>
          <ExampleViewer
            title="One reply field at a time"
            code={replies}
            html={repliesHtml}
            fileName="collapse-replies.tsx"
          >
            <CollapseReplies />
          </ExampleViewer>
          <ExampleViewer
            title="A question and its answer"
            code={disclosure}
            html={disclosureHtml}
            fileName="collapse-disclosure.tsx"
          >
            <CollapseDisclosure />
          </ExampleViewer>
          <ExampleViewer
            title="Open from the start"
            code={shownFirst}
            html={shownFirstHtml}
            fileName="collapse-shown-first.tsx"
          >
            <CollapseShownFirst />
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
            Content that opens and folds on its height: a reply field under a comment, an answer
            under a question, more filters. Folding to an unknown height smoothly, staying in the
            page until the fold ends and keeping what it showed meanwhile are easy to get wrong. It
            is <strong className="text-on-surface">not an M3 component</strong>, so it comes from{' '}
            <InlineCode>@windmorph/react-pro</InlineCode>.
          </p>
          <p className="text-body-large text-on-surface-variant">
            For text cut to a few lines use Expandable text; for content over the page, a dialog or
            a sheet.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 id="behaviour" className="text-headline-small text-on-surface">
            Behaviour
          </h2>
          <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
            <li>
              <InlineCode>isOpen</InlineCode> opens and folds it on its grid track, so no height is
              measured, on the default spatial spring, with the content fading on the effects
              spring.
            </li>
            <li>
              Folding keeps it in the page, showing what it last showed even if the app has moved
              on, and <InlineCode>inert</InlineCode> so focus can&apos;t land in it;{' '}
              <InlineCode>onExited</InlineCode> runs when it has gone.
            </li>
            <li>
              It opens as it mounts open; <InlineCode>{'appear={false}'}</InlineCode> makes it
              simply there, for content shown from the start.
            </li>
            <li>
              Two switching on the same render (one folding as the other opens) move together, as an
              accordion. A list of them should set <InlineCode>overflow-anchor: none</InlineCode>,
              or the browser keeps the focused one still and scrolls the page around it.
            </li>
            <li>
              Spacing that should fold with the content goes inside it (a margin or padding), not in
              a gap around it.
            </li>
            <li>Under reduced motion it only fades.</li>
          </ul>
        </section>
      </>
    ),
    accessibility: (
      <>
        <section className="flex flex-col gap-3">
          <h2 id="keyboard-and-screen-reader" className="text-headline-small text-on-surface">
            Keyboard &amp; screen reader
          </h2>
          <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
            <li>
              What opens it is the app&apos;s. For a disclosure, give that button{' '}
              <InlineCode>aria-expanded</InlineCode> and <InlineCode>aria-controls</InlineCode>{' '}
              pointing at the content.
            </li>
            <li>Folded content is gone from the page, so screen readers and Tab skip it.</li>
          </ul>
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
            Set the timing with the tokens below, on the collapse or any ancestor. Style the parts
            with <InlineCode>classNames</InlineCode> (<InlineCode>root</InlineCode>,{' '}
            <InlineCode>content</InlineCode>).
          </p>
          <TokenTable set={collapseTokenSet} caption="Collapse tokens" />
        </section>
      </>
    ),
  };
}
