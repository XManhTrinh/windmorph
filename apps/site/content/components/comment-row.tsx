import type { ComponentDoc } from './doc';
import { commentRowTokenSet } from '@windmorph/react-pro';
import { ExampleViewer } from '../../components/example-viewer';
import { TokenTable } from '../../components/token-table';
import { CommentRowThread } from '../../examples/comment-row/comment-row-thread';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';
import { InlineCode } from '../../components/inline-code';

/** CommentRow page body: purpose, example, behaviour, accessibility and tokens. */
export async function CommentRowBody(): Promise<ComponentDoc> {
  const source = await readExampleSource('comment-row/comment-row-thread.tsx');
  const html = await highlightSource(source);

  return {
    overview: (
      <>
        <section className="flex flex-col gap-6">
          <h2 id="examples" className="text-headline-small text-on-surface">
            Examples
          </h2>
          <ExampleViewer
            title="A thread"
            code={source}
            html={html}
            fileName="comment-row-thread.tsx"
          >
            <CommentRowThread />
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
            One comment or message in a thread: the avatar, the bubble with the name and the words,
            what goes under it (a photo, a note) and a 48dp row of actions. That row spaces one
            comment from the next, so a list of them needs no gaps, and every place that shows
            comments looks the same. It is{' '}
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
              The bubble is static, a button (<InlineCode>onPress</InlineCode>, e.g. opening the
              conversation) or a link (<InlineCode>href</InlineCode>), with the state layer and
              focus ring when pressable.
            </li>
            <li>
              <InlineCode>{'variant="outlined"'}</InlineCode> draws a dashed bubble, for a removed
              comment only its writer sees.
            </li>
            <li>
              <InlineCode>isPending</InlineCode> lightens the bubble while it&apos;s being sent,
              keeping the words at full contrast, and sets <InlineCode>aria-busy</InlineCode>; say
              it in the actions row too (&quot;Sending…&quot;).
            </li>
            <li>
              What goes in <InlineCode>below</InlineCode> keeps 4dp off the bubble; the actions row
              sits right under it.
            </li>
            <li>
              The words, the actions and what they do are the app&apos;s: pass a{' '}
              <InlineCode>ReactionPicker</InlineCode>, Reply and a menu in{' '}
              <InlineCode>actions</InlineCode>.
            </li>
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
              <InlineCode>as</InlineCode> renders the root as an <InlineCode>article</InlineCode>{' '}
              (name it with <InlineCode>aria-label</InlineCode>, such as &quot;Comment by
              Ada&quot;), an <InlineCode>li</InlineCode> in a list, or a{' '}
              <InlineCode>div</InlineCode>.
            </li>
            <li>
              A pressable bubble is a button or link named by its content; the avatar should be
              decorative, as the name is in the bubble.
            </li>
            <li>In forced-colours mode the bubble keeps a border.</li>
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
            Set the tokens below on a row or any ancestor. Style the parts with{' '}
            <InlineCode>classNames</InlineCode> (<InlineCode>root</InlineCode>,{' '}
            <InlineCode>avatar</InlineCode>, <InlineCode>bubble</InlineCode>,{' '}
            <InlineCode>below</InlineCode>, <InlineCode>actions</InlineCode>).
          </p>
          <TokenTable set={commentRowTokenSet} caption="Comment row tokens" />
        </section>
      </>
    ),
  };
}
