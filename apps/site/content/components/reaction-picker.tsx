import type { ComponentDoc } from './doc';
import { reactionPickerTokenSet } from '@windmorph/react-pro';
import { ExampleViewer } from '../../components/example-viewer';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';
import { InlineCode } from '../../components/inline-code';
import { TokenTable } from '../../components/token-table';
import { lazyExample } from '../../lib/lazy-example';

const ReactionPickerMessage = lazyExample(
  'reaction-picker/reaction-picker-message',
  'ReactionPickerMessage',
);
const ReactionPickerPost = lazyExample(
  'reaction-picker/reaction-picker-post',
  'ReactionPickerPost',
);
const ReactionPickerVariants = lazyExample(
  'reaction-picker/reaction-picker-variants',
  'ReactionPickerVariants',
);

/** Reaction picker page body: purpose, examples, behaviour, accessibility and tokens. */
export async function ReactionPickerBody(): Promise<ComponentDoc> {
  const [post, message] = await Promise.all([
    readExampleSource('reaction-picker/reaction-picker-post.tsx'),
    readExampleSource('reaction-picker/reaction-picker-message.tsx'),
  ]);
  const [postHtml, messageHtml] = await Promise.all([
    highlightSource(post),
    highlightSource(message),
  ]);

  const [variantsSrc] = await Promise.all([
    readExampleSource('reaction-picker/reaction-picker-variants.tsx'),
  ]);
  const [variantsSrcHtml] = await Promise.all([highlightSource(variantsSrc)]);

  return {
    overview: (
      <>
        <section className="flex flex-col gap-6">
          <h2 id="examples" className="text-headline-small text-on-surface">
            Examples
          </h2>
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
          <ExampleViewer
            title="Variants and sizes"
            code={variantsSrc}
            html={variantsSrcHtml}
            fileName="reaction-picker-variants.tsx"
          >
            <ReactionPickerVariants />
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
            A reaction button that likes on a tap, with a floating row of reactions that opens on a
            long press, when the mouse rests on it, or from the keyboard: the common pattern on
            social and work apps for posts, comments and messages. The timings (a long press against
            a tap, hover intent), the row&apos;s keyboard and focus, and sliding a finger along the
            row are easy to get wrong, so they live in one component. It is{' '}
            <strong className="text-on-surface">not an M3 component</strong>, so it comes from{' '}
            <InlineCode>@windmorph/react-pro</InlineCode>.
          </p>
          <p className="text-body-large text-on-surface-variant">
            The reactions are yours: each option is{' '}
            <InlineCode>{'{ id, label, icon, color }'}</InlineCode>, where{' '}
            <InlineCode>icon</InlineCode> is any node (an emoji or an SVG) and{' '}
            <InlineCode>color</InlineCode> is the colour role the button takes once that reaction is
            picked: a <InlineCode>ReactionColor</InlineCode>, one of{' '}
            <InlineCode>REACTION_COLORS</InlineCode> (<InlineCode>primary</InlineCode>,{' '}
            <InlineCode>secondary</InlineCode>, <InlineCode>tertiary</InlineCode>,{' '}
            <InlineCode>error</InlineCode>, <InlineCode>success</InlineCode>,{' '}
            <InlineCode>warning</InlineCode>, <InlineCode>on-surface</InlineCode>,{' '}
            <InlineCode>on-surface-variant</InlineCode>), each tested at 4.5:1 on the button and the
            row in every theme, mode and contrast level. Container roles aren&apos;t accepted. For a
            single on/off action, use a toggle <InlineCode>IconButton</InlineCode> or{' '}
            <InlineCode>Button</InlineCode> instead.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 id="behaviour" className="text-headline-small text-on-surface">
            Behaviour
          </h2>
          <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
            <li>
              Without a reaction, the button shows the default option (
              <InlineCode>defaultOption</InlineCode>, or the first) with its{' '}
              <InlineCode>outlineIcon</InlineCode>, and a tap picks it. With one, it shows that
              reaction&apos;s icon and label in its colour, and a tap removes it.
            </li>
            <li>
              <InlineCode>variant</InlineCode>: <InlineCode>text</InlineCode> (transparent, the
              default) or <InlineCode>tonal</InlineCode> (on a pill, as in a post&apos;s action
              row). <InlineCode>{'showIdleIcon={false}'}</InlineCode> makes the button a word
              (&quot;Like&quot;) until there&apos;s a reaction, as under a comment. Pair it with a
              Reaction summary to show the reactions so far.
            </li>
            <li>
              The row opens on a 500ms long press, after the mouse rests on the button for 600ms (it
              closes 300ms after the mouse leaves both), or with ArrowUp or Alt+ArrowDown. It sits
              above the button, or below when there&apos;s no room, and closes when the page
              scrolls.
            </li>
            <li>
              In the row, the arrow keys move between reactions and wrap at the ends, and Home and
              End reach the first and last. The active option shows its name above it on the
              core&apos;s plain tooltip surface, and the picked reaction is exposed with{' '}
              <InlineCode>aria-pressed</InlineCode>. Closing the row returns focus to the button
              without scrolling the page.
            </li>
            <li>
              On touch, keep the finger down after the long press and slide it along the row: the
              reaction under it grows and shows its name, and lifting picks it. Lifting over nothing
              leaves the row open; a tap elsewhere closes it.
            </li>
            <li>
              <InlineCode>value</InlineCode> / <InlineCode>onChange</InlineCode> (or{' '}
              <InlineCode>defaultValue</InlineCode>) hold the reaction id or{' '}
              <InlineCode>null</InlineCode>; <InlineCode>open</InlineCode> /{' '}
              <InlineCode>onOpenChange</InlineCode> control the row.
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
          <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
            <li>
              The button is transparent (<InlineCode>tonal</InlineCode>: a{' '}
              <InlineCode>surface-container-high</InlineCode> pill) with{' '}
              <InlineCode>on-surface-variant</InlineCode> content, and the picked option&apos;s{' '}
              <InlineCode>color</InlineCode> once picked. Disabled, it takes the system
              disabled-content opacity; in forced colours it keeps a 1px boundary (
              <InlineCode>Highlight</InlineCode> when picked).
            </li>
            <li>
              The row is a <InlineCode>surface-container-high</InlineCode> pill at elevation 3. It
              scales and fades in from its anchor on the default spatial spring, and the option
              under the pointer grows 1.5× on the fast spatial spring. Under reduced motion the row
              only fades, and the option is shown at 1.5× at once.
            </li>
            <li>
              Set the tokens below on <InlineCode>:root</InlineCode>, a theme wrapper, the button or{' '}
              <InlineCode>classNames.row</InlineCode>: the button and the portalled row both carry{' '}
              <InlineCode>data-tokens=&quot;wm-reaction-picker&quot;</InlineCode>, so the row&apos;s
              tokens reach it from outside. Emoji take type-scale sizes.
            </li>
            <li>
              <InlineCode>classNames</InlineCode> styles the <InlineCode>button</InlineCode>,{' '}
              <InlineCode>icon</InlineCode>, <InlineCode>label</InlineCode>,{' '}
              <InlineCode>row</InlineCode> and each <InlineCode>option</InlineCode>;{' '}
              <InlineCode>reactionPickerStyles</InlineCode> can be extended with new variants.
            </li>
          </ul>
          <TokenTable set={reactionPickerTokenSet} caption="Reaction picker tokens" />
        </section>
      </>
    ),
  };
}
