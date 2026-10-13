import { commentRowTokenSet } from '@windmorph/react-pro';
import { ExampleViewer } from '../../components/example-viewer';
import { TokenTable } from '../../components/token-table';
import { CommentRowThread } from '../../examples/comment-row/comment-row-thread';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';

const code = (text: string) => <code className="text-on-surface">{text}</code>;

/** CommentRow page body: purpose, example, behaviour, accessibility and tokens. */
export async function CommentRowBody() {
  const source = await readExampleSource('comment-row/comment-row-thread.tsx');
  const html = await highlightSource(source);

  return (
    <>
      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Purpose</h2>
        <p className="text-body-large text-on-surface-variant">
          One comment or message in a thread: the avatar, the bubble with the name and the words,
          what goes under it (a photo, a note) and a 48dp row of actions. That row spaces one
          comment from the next, so a list of them needs no gaps, and every place that shows
          comments looks the same. It is{' '}
          <strong className="text-on-surface">not an M3 component</strong>, so it comes from{' '}
          {code('@windmorph/react-pro')}.
        </p>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-headline-small text-on-surface">Examples</h2>
        <ExampleViewer title="A thread" code={source} html={html} fileName="comment-row-thread.tsx">
          <CommentRowThread />
        </ExampleViewer>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Behaviour</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            The bubble is static, a button ({code('onPress')}, e.g. opening the conversation) or a
            link ({code('href')}), with the state layer and focus ring when pressable.
          </li>
          <li>
            {code('variant="outlined"')} draws a dashed bubble, for a removed comment only its
            writer sees.
          </li>
          <li>
            {code('isPending')} lightens the bubble while it&apos;s being sent, keeping the words at
            full contrast, and sets {code('aria-busy')}; say it in the actions row too
            (&quot;Sending…&quot;).
          </li>
          <li>
            What goes in {code('below')} keeps 4dp off the bubble; the actions row sits right under
            it.
          </li>
          <li>
            The words, the actions and what they do are the app&apos;s: pass a{' '}
            {code('ReactionPicker')}, Reply and a menu in {code('actions')}.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Keyboard &amp; screen reader</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            {code('as')} renders the root as an {code('article')} (name it with {code('aria-label')}
            , such as &quot;Comment by Ada&quot;), an {code('li')} in a list, or a {code('div')}.
          </li>
          <li>
            A pressable bubble is a button or link named by its content; the avatar should be
            decorative, as the name is in the bubble.
          </li>
          <li>In forced-colours mode the bubble keeps a border.</li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Theming &amp; tokens</h2>
        <p className="text-body-large text-on-surface-variant">
          Set the tokens below on a row or any ancestor. Style the parts with {code('classNames')} (
          {code('root')}, {code('avatar')}, {code('bubble')}, {code('below')}, {code('actions')}).
        </p>
        <TokenTable set={commentRowTokenSet} caption="Comment row tokens" />
      </section>
    </>
  );
}
