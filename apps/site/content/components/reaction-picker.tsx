import { ExampleViewer } from '../../components/example-viewer';
import { ReactionPickerMessage } from '../../examples/reaction-picker/reaction-picker-message';
import { ReactionPickerPost } from '../../examples/reaction-picker/reaction-picker-post';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';

const code = (text: string) => <code className="text-on-surface">{text}</code>;

/** Reaction picker page body: purpose, examples, behaviour, accessibility and tokens. */
export async function ReactionPickerBody() {
  const [post, message] = await Promise.all([
    readExampleSource('reaction-picker/reaction-picker-post.tsx'),
    readExampleSource('reaction-picker/reaction-picker-message.tsx'),
  ]);
  const [postHtml, messageHtml] = await Promise.all([
    highlightSource(post),
    highlightSource(message),
  ]);

  return (
    <>
      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Purpose</h2>
        <p className="text-body-large text-on-surface-variant">
          A reaction button that likes on a tap, with a floating row of reactions that opens on a
          long press, when the mouse rests on it, or from the keyboard: Facebook&apos;s pattern,
          also used by LinkedIn and Teams, for posts, comments and messages. The timings (a long
          press against a tap, hover intent), the row&apos;s keyboard and focus, and sliding a
          finger along the row are easy to get wrong, so they live in one component. It is{' '}
          <strong className="text-on-surface">not an M3 component</strong>, so it comes from{' '}
          {code('@windmorph/react-pro')}.
        </p>
        <p className="text-body-large text-on-surface-variant">
          The reactions are yours: each option is {code('{ id, label, icon, color }')}, where{' '}
          {code('icon')} is any node (an emoji or an SVG) and {code('color')} is the colour role the
          button takes once that reaction is picked. For a single on/off action, use a toggle{' '}
          {code('IconButton')} or {code('Button')} instead.
        </p>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-headline-small text-on-surface">Examples</h2>
        <ExampleViewer
          title="A post's action bar"
          code={post}
          html={postHtml}
          fileName="reaction-picker-post.tsx"
        >
          <ReactionPickerPost />
        </ExampleViewer>
        <ExampleViewer
          title="Messages, small and in French"
          code={message}
          html={messageHtml}
          fileName="reaction-picker-message.tsx"
        >
          <ReactionPickerMessage />
        </ExampleViewer>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Behaviour</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            Without a reaction, the button shows the default option ({code('defaultOption')}, or the
            first) with its {code('outlineIcon')}, and a tap picks it. With one, it shows that
            reaction&apos;s icon and label in its colour, and a tap removes it.
          </li>
          <li>
            {code('variant')}: {code('text')} (transparent, the default) or {code('tonal')} (on a
            pill, as in a post&apos;s action row). {code('showIdleIcon={false}')} makes the button a
            word (&quot;Like&quot;) until there&apos;s a reaction, as under a comment. Pair it with
            a Reaction summary to show the reactions so far.
          </li>
          <li>
            The row opens on a 500ms long press, after the mouse rests on the button for 600ms (it
            closes 300ms after the mouse leaves both), or with ArrowUp or Alt+ArrowDown. It sits
            above the button, or below when there&apos;s no room, and closes when the page scrolls.
          </li>
          <li>
            On touch, keep the finger down after the long press and slide it along the row: the
            reaction under it grows and shows its name, and lifting picks it. Lifting over nothing
            leaves the row open; a tap elsewhere closes it.
          </li>
          <li>
            {code('value')} / {code('onChange')} (or {code('defaultValue')}) hold the reaction id or{' '}
            {code('null')}; {code('isOpen')} / {code('onOpenChange')} control the row.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Keyboard &amp; screen reader</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            The button is a toggle ({code('aria-pressed')}) named by the reaction it shows, and
            describes how to open the row ({code('labels.openPicker')}).
          </li>
          <li>
            Enter or Space toggles the reaction. ArrowUp or Alt+ArrowDown opens the row on the
            picked reaction, or the first.
          </li>
          <li>
            The row is a {code('toolbar')} ({code('labels.reactions')}) of buttons named by each
            reaction. Arrow keys move between them (reversed right-to-left), Enter or Space picks,
            and Escape closes and returns focus to the button. Tab leaves the row as if it sat right
            after the button.
          </li>
          <li>
            Every target is at least 48px. In forced-colours mode the row keeps a border and a
            picked reaction uses the system highlight colour.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Theming &amp; tokens</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            The button is transparent with {code('on-surface-variant')} content, and{' '}
            {code('--wm-reaction-color')} (the option&apos;s colour role) once picked. Prefer{' '}
            {code('primary')}, {code('error')}, {code('warning')} or {code('tertiary')}: they keep
            4.5:1 on the surface in every theme, mode and contrast level.
          </li>
          <li>
            The row is a {code('surface-container-high')} pill at elevation 3. It scales and fades
            in from its anchor on the default spatial spring, and the option under the pointer grows
            1.5× on the fast spatial spring. Under reduced motion both happen at once.
          </li>
          <li>
            {code('classNames')} styles the {code('button')}, {code('icon')}, {code('label')},{' '}
            {code('row')} and each {code('option')}; {code('reactionPickerStyles')} can be extended
            with new variants.
          </li>
        </ul>
      </section>
    </>
  );
}
