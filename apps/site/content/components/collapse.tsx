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
const CollapseKeptMounted = lazyExample('collapse/collapse-kept-mounted', 'CollapseKeptMounted');

/** Collapse page body: purpose, examples, behaviour and tokens. */
export async function CollapseBody(): Promise<ComponentDoc> {
  const [replies, disclosure] = await Promise.all([
    readExampleSource('collapse/collapse-replies.tsx'),
    readExampleSource('collapse/collapse-disclosure.tsx'),
  ]);
  const [repliesHtml, disclosureHtml] = await Promise.all([
    highlightSource(replies),
    highlightSource(disclosure),
  ]);

  const [shownFirst, keptMounted] = await Promise.all([
    readExampleSource('collapse/collapse-shown-first.tsx'),
    readExampleSource('collapse/collapse-kept-mounted.tsx'),
  ]);
  const [shownFirstHtml, keptMountedHtml] = await Promise.all([
    highlightSource(shownFirst),
    highlightSource(keptMounted),
  ]);
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
          <ExampleViewer
            title="Found by find-in-page"
            code={keptMounted}
            html={keptMountedHtml}
            fileName="collapse-kept-mounted.tsx"
          >
            <CollapseKeptMounted />
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
            For a stack of headers that each open a panel (an FAQ, settings groups) use Accordion,
            which is built on it; for text cut to a few lines, Expandable text; for content over the
            page, a dialog or a sheet.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 id="behaviour" className="text-headline-small text-on-surface">
            Behaviour
          </h2>
          <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
            <li>
              <InlineCode>open</InlineCode> (or <InlineCode>defaultOpen</InlineCode>, uncontrolled)
              opens and folds it on its grid track, so no height is measured. It opens on the
              default spatial spring and folds over the same time on the default effects
              spring&apos;s easing, which never overshoots, so a folding height never bounces back
              open (<InlineCode>--wm-collapse-spring-duration</InlineCode>,{' '}
              <InlineCode>-spring-easing</InlineCode>, <InlineCode>-fold-easing</InlineCode>). Its
              content fades on the default effects spring (<InlineCode>-fade-duration</InlineCode>,{' '}
              <InlineCode>-fade-easing</InlineCode>).
            </li>
            <li>
              Folding keeps it in the page, showing what it last showed even if the app has moved
              on, and <InlineCode>inert</InlineCode> so focus can&apos;t land in it;{' '}
              <InlineCode>onExited</InlineCode> runs when it has folded.
            </li>
            <li>
              Folded, its content goes, unless <InlineCode>keepMounted</InlineCode>: then it stays
              in the page as <InlineCode>hidden=&quot;until-found&quot;</InlineCode>, out of the
              accessibility tree and the Tab order, but in the server&apos;s HTML. Find-in-page and
              a <InlineCode>#fragment</InlineCode> link find text inside it, and it opens at once
              through <InlineCode>onOpenChange</InlineCode>, so the browser can scroll to the match.
              Otherwise its control is the app&apos;s, and <InlineCode>onOpenChange</InlineCode>{' '}
              doesn&apos;t run.
            </li>
            <li>
              It opens as it mounts open; <InlineCode>{'appear={false}'}</InlineCode> makes it
              simply there, for content shown from the start.
            </li>
            <li>
              Two switching on the same render (one folding as the other opens) move together on the
              folding curve, as an accordion, so what&apos;s around them stays put. A list of them
              should set <InlineCode>overflow-anchor: none</InlineCode>, or the browser keeps the
              focused one still and scrolls the page around it. For a ready-made one, use Accordion.
            </li>
            <li>
              Spacing that should fold with the content goes inside it (a margin or padding), not in
              a gap around it.
            </li>
            <li>
              Under reduced motion the height no longer animates: an opening collapse appears at
              full height and fades in, and a folding one fades out where it is, over{' '}
              <InlineCode>--wm-collapse-fade-duration</InlineCode>, then goes (
              <InlineCode>onExited</InlineCode> runs when the fade ends). One that folds as another
              opens goes at once, so what&apos;s below shifts once.
            </li>
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
