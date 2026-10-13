import { reactionSummaryTokenSet } from '@windmorph/react-pro';
import { ExampleViewer } from '../../components/example-viewer';
import { TokenTable } from '../../components/token-table';
import { ReactionSummaryVariants } from '../../examples/reaction-summary/reaction-summary-variants';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';

const code = (text: string) => <code className="text-on-surface">{text}</code>;

/** ReactionSummary page body: purpose, example, behaviour, accessibility and tokens. */
export async function ReactionSummaryBody() {
  const source = await readExampleSource('reaction-summary/reaction-summary-variants.tsx');
  const html = await highlightSource(source);

  return (
    <>
      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Purpose</h2>
        <p className="text-body-large text-on-surface-variant">
          The reactions so far: the top kinds&apos; icons and how many. {code('stacked')} overlaps
          the icons in rings, as under a post; {code('chip')} is a small pill, as at the end of a
          comment&apos;s actions. Pair it with {code('ReactionPicker')}. It is{' '}
          <strong className="text-on-surface">not an M3 component</strong>, so it comes from{' '}
          {code('@windmorph/react-pro')}.
        </p>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-headline-small text-on-surface">Examples</h2>
        <ExampleViewer
          title="Under a post and in a comment"
          code={source}
          html={html}
          fileName="reaction-summary-variants.tsx"
        >
          <ReactionSummaryVariants />
        </ExampleViewer>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Behaviour</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            {code('items')} are the top kinds, most first; {code('maxIcons')} (3) caps them, e.g. to
            1 in a narrow row.
          </li>
          <li>
            The count uses the locale&apos;s compact numbers (1.2K). A chip shows it only from 2, as
            one icon already says one; nothing renders at 0.
          </li>
          <li>
            {code('onPress')} makes it a button that opens the list of who reacted; without it,
            it&apos;s plain text.
          </li>
          <li>
            {code('size')}: {code('sm')} for comments and messages, {code('md')} for posts.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Keyboard &amp; screen reader</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            Pressable, it&apos;s a button named by {code('labels.count')} (&quot;128 reactions. See
            who reacted&quot;), with a 48dp touch target.
          </li>
          <li>
            Otherwise the icons and number are hidden from screen readers, which read{' '}
            {code('labels.count')} instead.
          </li>
          <li>In forced-colours mode the chip keeps a border.</li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Theming &amp; tokens</h2>
        <p className="text-body-large text-on-surface-variant">
          Set the tokens below on a summary or any ancestor; match{' '}
          {code('--wm-reaction-summary-icon-ring')} to the surface it sits on. Style the parts with{' '}
          {code('classNames')} ({code('root')}, {code('icons')}, {code('icon')}, {code('count')}).
        </p>
        <TokenTable set={reactionSummaryTokenSet} caption="Reaction summary tokens" />
      </section>
    </>
  );
}
