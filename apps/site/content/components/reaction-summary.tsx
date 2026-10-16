import type { ComponentDoc } from './doc';
import { reactionSummaryTokenSet } from '@windmorph/react-pro';
import { ExampleViewer } from '../../components/example-viewer';
import { TokenTable } from '../../components/token-table';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';
import { InlineCode } from '../../components/inline-code';
import { lazyExample } from '../../lib/lazy-example';

const ReactionSummaryVariants = lazyExample(
  'reaction-summary/reaction-summary-variants',
  'ReactionSummaryVariants',
);
const ReactionSummarySizes = lazyExample(
  'reaction-summary/reaction-summary-sizes',
  'ReactionSummarySizes',
);

/** ReactionSummary page body: purpose, example, behaviour, accessibility and tokens. */
export async function ReactionSummaryBody(): Promise<ComponentDoc> {
  const source = await readExampleSource('reaction-summary/reaction-summary-variants.tsx');
  const html = await highlightSource(source);

  const [sizesSrc] = await Promise.all([
    readExampleSource('reaction-summary/reaction-summary-sizes.tsx'),
  ]);
  const [sizesSrcHtml] = await Promise.all([highlightSource(sizesSrc)]);

  return {
    overview: (
      <>
        <section className="flex flex-col gap-6">
          <h2 id="examples" className="text-headline-small text-on-surface">
            Examples
          </h2>
          <ExampleViewer
            title="Under a post and in a comment"
            code={source}
            html={html}
            fileName="reaction-summary-variants.tsx"
          >
            <ReactionSummaryVariants />
          </ExampleViewer>
          <ExampleViewer
            title="Sizes and icon count"
            code={sizesSrc}
            html={sizesSrcHtml}
            fileName="reaction-summary-sizes.tsx"
          >
            <ReactionSummarySizes />
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
            The reactions so far: the top kinds&apos; icons and how many.{' '}
            <InlineCode>stacked</InlineCode> overlaps the icons in rings, as under a post;{' '}
            <InlineCode>chip</InlineCode> is a small pill, as at the end of a comment&apos;s
            actions. Pair it with <InlineCode>ReactionPicker</InlineCode>. It is{' '}
            <strong className="text-on-surface">not an M3 component</strong>, so it comes from{' '}
            <InlineCode>@windmorph/react-pro</InlineCode>.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 id="behaviour" className="text-headline-small text-on-surface">
            Behaviour
          </h2>
          <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
            <li>
              <InlineCode>items</InlineCode> are the top kinds, most first;{' '}
              <InlineCode>maxIcons</InlineCode> (3) caps them, e.g. to 1 in a narrow row.
            </li>
            <li>
              The count uses the locale&apos;s compact numbers (1.2K). A chip shows it only from 2,
              as one icon already says one; nothing renders at 0.
            </li>
            <li>
              <InlineCode>onPress</InlineCode> makes it a button that opens the list of who reacted;
              without it, it&apos;s plain text.
            </li>
            <li>
              <InlineCode>size</InlineCode>: <InlineCode>sm</InlineCode> for comments and messages,{' '}
              <InlineCode>md</InlineCode> for posts.
            </li>
            <li>
              The <InlineCode>chip</InlineCode> variant is an M3 chip: the core&apos;s{' '}
              <InlineCode>AssistChip</InlineCode> when pressable, and the assist chip&apos;s look
              when static (32px tall, 8px corners, an <InlineCode>outline-variant</InlineCode>{' '}
              border). Emoji take type-scale sizes.
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
            Set the tokens below on a summary or any ancestor; match{' '}
            <InlineCode>--wm-reaction-summary-icon-ring</InlineCode> to the surface it sits on. A
            chip also carries the assist chip&apos;s tokens (
            <InlineCode>data-tokens=&quot;md-comp-assist-chip wm-reaction-summary&quot;</InlineCode>
            ), so an app&apos;s chip theme reaches it; <InlineCode>chip-container</InlineCode>{' '}
            defaults to transparent and <InlineCode>chip-corner</InlineCode> to the small corner, as
            M3&apos;s flat chip. Style the parts with <InlineCode>classNames</InlineCode> (
            <InlineCode>root</InlineCode>, <InlineCode>icons</InlineCode>,{' '}
            <InlineCode>icon</InlineCode>, <InlineCode>count</InlineCode>).
          </p>
          <TokenTable set={reactionSummaryTokenSet} caption="Reaction summary tokens" />
        </section>
      </>
    ),
  };
}
