import type { ComponentDoc } from './doc';
import { messageFieldTokenSet } from '@windmorph/react-pro';
import { ExampleViewer } from '../../components/example-viewer';
import { TokenTable } from '../../components/token-table';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';
import { InlineCode } from '../../components/inline-code';
import { lazyExample } from '../../lib/lazy-example';

const MessageFieldChat = lazyExample('message-field/message-field-chat', 'MessageFieldChat');
const MessageFieldComment = lazyExample(
  'message-field/message-field-comment',
  'MessageFieldComment',
);
const MessageFieldDocked = lazyExample('message-field/message-field-docked', 'MessageFieldDocked');
const MessageFieldLimit = lazyExample('message-field/message-field-limit', 'MessageFieldLimit');
const MessageFieldTriggerExample = lazyExample(
  'message-field/message-field-trigger',
  'MessageFieldTriggerExample',
);
const MessageFieldVariants = lazyExample(
  'message-field/message-field-variants',
  'MessageFieldVariants',
);

/** Message field page body: purpose, examples, behaviour, motion, accessibility and tokens. */
export async function MessageFieldBody(): Promise<ComponentDoc> {
  const [comment, chat, trigger, variants, docked, limit] = await Promise.all([
    readExampleSource('message-field/message-field-comment.tsx'),
    readExampleSource('message-field/message-field-chat.tsx'),
    readExampleSource('message-field/message-field-trigger.tsx'),
    readExampleSource('message-field/message-field-variants.tsx'),
    readExampleSource('message-field/message-field-docked.tsx'),
    readExampleSource('message-field/message-field-limit.tsx'),
  ]);
  const [commentHtml, chatHtml, triggerHtml, variantsHtml, dockedHtml, limitHtml] =
    await Promise.all([
      highlightSource(comment),
      highlightSource(chat),
      highlightSource(trigger),
      highlightSource(variants),
      highlightSource(docked),
      highlightSource(limit),
    ]);

  return {
    overview: (
      <>
        <section className="flex flex-col gap-6">
          <h2 id="examples" className="text-headline-small text-on-surface">
            Examples
          </h2>
          <ExampleViewer
            title="A comment field"
            code={comment}
            html={commentHtml}
            fileName="message-field-comment.tsx"
          >
            <MessageFieldComment />
          </ExampleViewer>
          <ExampleViewer
            title="A chat composer: a reply banner, attachments and a microphone"
            code={chat}
            html={chatHtml}
            fileName="message-field-chat.tsx"
          >
            <MessageFieldChat />
          </ExampleViewer>
          <ExampleViewer
            title="The trigger, opening the post composer"
            code={trigger}
            html={triggerHtml}
            fileName="message-field-trigger.tsx"
          >
            <MessageFieldTriggerExample />
          </ExampleViewer>
          <ExampleViewer
            title="Variants and sizes"
            code={variants}
            html={variantsHtml}
            fileName="message-field-variants.tsx"
          >
            <MessageFieldVariants />
          </ExampleViewer>
          <ExampleViewer
            title="Docked as a card's footer once it opens"
            code={docked}
            html={dockedHtml}
            fileName="message-field-docked.tsx"
          >
            <MessageFieldDocked />
          </ExampleViewer>
          <ExampleViewer
            title="A limit, a label and an error; Ctrl or ⌘ + Enter sends"
            code={limit}
            html={limitHtml}
            fileName="message-field-limit.tsx"
          >
            <MessageFieldLimit />
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
            A rounded field for writing something to send: a comment, a reply, a chat message. It is
            a pill on one line, like the search bar, focused or not, and grows into a rounded box as
            the text runs over several lines. Enter sends, a send button grows in with the first
            character, and slots hold an avatar, icon buttons, a reply banner and attachments. It is{' '}
            <strong className="text-on-surface">not an M3 component</strong>, so it comes from{' '}
            <InlineCode>@windmorph/react-pro</InlineCode>.{' '}
            <InlineCode>MessageFieldTrigger</InlineCode> is the same look as one button
            (&quot;What&apos;s on your mind?&quot;) that opens a bigger composer.
          </p>
          <p className="text-body-large text-on-surface-variant">
            Use a <InlineCode>TextField</InlineCode> for form input that is submitted with the rest
            of a form (a bio, an address), and a <InlineCode>SearchBar</InlineCode> for search: it
            has search semantics, a back button and a suggestions view. Use a message field when
            what&apos;s written is sent on its own, straight away.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 id="behaviour" className="text-headline-small text-on-surface">
            Behaviour
          </h2>
          <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
            <li>
              The text grows from <InlineCode>minRows</InlineCode> (1) to{' '}
              <InlineCode>maxRows</InlineCode> (6), then scrolls inside the field.{' '}
              <InlineCode>value</InlineCode> / <InlineCode>onChange</InlineCode> (or{' '}
              <InlineCode>defaultValue</InlineCode>) hold it.
            </li>
            <li>
              <InlineCode>submitOn</InlineCode>: <InlineCode>{"'enter'"}</InlineCode> (Enter sends,
              Shift+Enter is a new line; on touch screens Enter is a new line and Send sends, as in
              Slack&apos;s and Messenger&apos;s apps), <InlineCode>{"'mod-enter'"}</InlineCode>{' '}
              (Ctrl or ⌘+Enter sends) or <InlineCode>{"'none'"}</InlineCode> (only the button).
              Nothing is sent while an input method is composing (Vietnamese Telex, pinyin, kana),
              and a blank value is never sent. <InlineCode>onSubmit</InlineCode> gets the trimmed
              text. <InlineCode>canSend</InlineCode> overrides &quot;any text&quot;: a photo alone
              can be sent, or Send can wait for an upload.
            </li>
            <li>
              The field doesn&apos;t clear itself: clear <InlineCode>value</InlineCode> once the
              send succeeds, or set <InlineCode>clearOnSubmit</InlineCode>. While{' '}
              <InlineCode>submitting</InlineCode>, the send button shows the loading indicator and
              ignores presses; a send that ends while <InlineCode>invalid</InlineCode> shakes the
              field once beside <InlineCode>errorMessage</InlineCode>.
            </li>
            <li>
              <InlineCode>emptyAction</InlineCode> takes the send button&apos;s place while there is
              no text, such as a microphone. <InlineCode>{'send={false}'}</InlineCode> hides the
              send button, and <InlineCode>{'sendVariant="standard"'}</InlineCode> shows it as the
              icon alone, in primary.
            </li>
            <li>
              <InlineCode>onFiles</InlineCode> gets files pasted or dropped onto the field that
              match <InlineCode>accept</InlineCode>; the field shows its drag-over state. Without
              it, files are ignored and text pastes as usual.
            </li>
            <li>
              <InlineCode>maxLength</InlineCode> never cuts what&apos;s written: past it, the
              counter turns to the error colour, the field is invalid and Send waits, so a long
              paste loses no words. The counter (&quot;1,840 / 2,000&quot;) shows from{' '}
              <InlineCode>counterThreshold</InlineCode> (90%), or always with{' '}
              <InlineCode>showCounter</InlineCode>; nearing, reaching and passing the limit are each
              announced once.
            </li>
            <li>
              <InlineCode>banner</InlineCode> is a row above the text (&quot;Replying to Sam&quot;),
              with a close button when <InlineCode>onBannerClose</InlineCode> is set;{' '}
              <InlineCode>attachments</InlineCode> is a row of content above the text, such as{' '}
              <InlineCode>MediaUploadGrid</InlineCode> with{' '}
              <InlineCode>{'layout="row"'}</InlineCode>. <InlineCode>onEscape</InlineCode> handles
              Escape, for example to cancel the reply.
            </li>
            <li>
              <InlineCode>tools</InlineCode> holds icon buttons with their own actions (emoji,
              attach, GIF), at the end of the text row, in a toolbar: one Tab stop, and arrow keys
              between them. With <InlineCode>expandOnFocus</InlineCode>, the first focus opens the
              field as Facebook&apos;s comment field does: the text takes the first row, and the
              tools and Send are on the second, with Send disabled until there&apos;s text. It stays
              open, so the page doesn&apos;t move each time focus leaves; it also starts open with
              text or a banner in it. A tool reaches the field with{' '}
              <InlineCode>useMessageField()</InlineCode>: <InlineCode>insertText</InlineCode> puts
              text at the caret (over the selection), and the app gets the same through{' '}
              <InlineCode>handleRef</InlineCode>. The closed pill hides its tools when they&apos;d
              leave the text too narrow, or always with{' '}
              <InlineCode>{'toolsWhenIdle="hidden"'}</InlineCode>; give{' '}
              <InlineCode>MessageFieldTrigger</InlineCode> the same icons as{' '}
              <InlineCode>tools</InlineCode> so the pill matches.
            </li>
            <li>
              <InlineCode>toolbar</InlineCode> is a row of controls inside the open field, such as
              formatting buttons: above the text, between the text and the tools (in thumb reach on
              phones), or by window size (<InlineCode>toolbarPlacement</InlineCode>).{' '}
              <InlineCode>docked</InlineCode> squares the corners on the field&apos;s spring, for a
              field that becomes its container&apos;s footer (a card&apos;s comment field);{' '}
              <InlineCode>{'docked="when-open"'}</InlineCode> docks it once it opens. Where it sits
              is the app&apos;s.
            </li>
            <li>
              Icon buttons in <InlineCode>leading</InlineCode> and <InlineCode>trailing</InlineCode>{' '}
              take the field&apos;s size. An avatar as tall as them (32px at{' '}
              <InlineCode>sm</InlineCode>, 40px at <InlineCode>md</InlineCode> and{' '}
              <InlineCode>lg</InlineCode>) sits concentric in the pill. Slot buttons sit 48px apart
              (16px beside <InlineCode>xs</InlineCode> buttons, 8px beside{' '}
              <InlineCode>sm</InlineCode>), so their 48px touch targets never overlap.
            </li>
            <li>
              The field keeps its height in a dense theme: its icon buttons stay at density 0 (the
              tools, Send, the banner&apos;s close and the slots), so a{' '}
              <InlineCode>density</InlineCode> on a provider or <InlineCode>ThemeScope</InlineCode>{' '}
              never squeezes their touch targets together.
            </li>
            <li>
              Focusing the text never scrolls the page: a press on the field, Send, the
              banner&apos;s close and <InlineCode>insertText</InlineCode> put the caret back without
              moving it. The app&apos;s own <InlineCode>focus()</InlineCode> (through{' '}
              <InlineCode>handleRef</InlineCode>) brings a field that is wholly off screen into view
              with a short, smooth scroll.
            </li>
          </ul>
        </section>

        <section className="flex flex-col gap-3">
          <h2 id="motion" className="text-headline-small text-on-surface">
            Motion
          </h2>
          <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
            <li>
              The field breathes as it grows: the pill&apos;s corners morph to extra-large (28px) as
              the text wraps or a banner or attachments open, and the height follows on the default
              spatial spring, so a new line slides the field open. Focus never changes the shape:
              one line stays a pill.
            </li>
            <li>
              The send button grows in from a small circle on the fast spatial spring and shrinks
              away with the last character. Pressing it squares its corners and springs back;{' '}
              <InlineCode>MessageFieldTrigger</InlineCode>&apos;s press morph runs on the effects
              spring, with no bounce, as the core&apos;s non-toggle buttons. While sending, the send
              icon gives way to the loading indicator, which morphs through Material shapes.
            </li>
            <li>
              Opening on focus puts the tools on their row at once, as Facebook does, and springs
              the field&apos;s height and corners, so the new row slides into view; Send grows in.
            </li>
            <li>
              The banner and attachments open and close on a spring with a fade, so the text never
              jumps; the counter fades in.
            </li>
            <li>
              A send that fails while <InlineCode>invalid</InlineCode> shakes the field once, each
              step on the fast spatial spring.
            </li>
            <li>
              The springs follow the motion scheme. Under reduced motion, shapes and heights change
              at once and nothing scales or shakes, but the fades stay on their effects timing: the
              rows, Send, its icon and the loading indicator still fade in and out.
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
              <InlineCode>variant</InlineCode>: <InlineCode>filled</InlineCode> (
              <InlineCode>surface-container-high</InlineCode>, as the search bar),{' '}
              <InlineCode>tonal</InlineCode> (<InlineCode>secondary-container</InlineCode>) or{' '}
              <InlineCode>outlined</InlineCode> (an <InlineCode>outline</InlineCode> border,{' '}
              <InlineCode>primary</InlineCode> while focused). The tonal placeholder is{' '}
              <InlineCode>on-surface-variant</InlineCode>, quieter than the text, and switches to{' '}
              <InlineCode>on-secondary-container</InlineCode> at medium and high contrast so it
              keeps 4.5:1 (an app&apos;s <InlineCode>--wm-message-field-placeholder</InlineCode>{' '}
              still wins). Disabled colours use the system disabled opacities.{' '}
              <InlineCode>size</InlineCode>: <InlineCode>sm</InlineCode> 40px (
              <InlineCode>body-medium</InlineCode>), <InlineCode>md</InlineCode> 48px and{' '}
              <InlineCode>lg</InlineCode> 56px (<InlineCode>body-large</InlineCode>).
            </li>
            <li>
              Every value the field paints is a token: set the variables below on the field (
              <InlineCode>className</InlineCode>) or on any ancestor, globally or per theme. Sizes
              and variants only change their defaults. The send button, the banner&apos;s close
              button and the tools are ordinary <InlineCode>IconButton</InlineCode>s, so a theme
              reaches them as it does any button, and <InlineCode>classNames</InlineCode> reaches
              each one.
            </li>
            <li>
              <InlineCode>classNames</InlineCode> styles the <InlineCode>root</InlineCode>,{' '}
              <InlineCode>label</InlineCode>, <InlineCode>field</InlineCode>,{' '}
              <InlineCode>banner</InlineCode>, <InlineCode>bannerClose</InlineCode>,{' '}
              <InlineCode>toolbar</InlineCode>, <InlineCode>attachments</InlineCode>,{' '}
              <InlineCode>leading</InlineCode>, <InlineCode>input</InlineCode>,{' '}
              <InlineCode>tools</InlineCode>, <InlineCode>trailing</InlineCode>, the send
              button&apos;s parts (<InlineCode>send.root</InlineCode>,{' '}
              <InlineCode>send.icon</InlineCode>, <InlineCode>send.glyph</InlineCode>,{' '}
              <InlineCode>send.loading</InlineCode>), <InlineCode>emptyAction</InlineCode>,{' '}
              <InlineCode>supporting</InlineCode> and <InlineCode>counter</InlineCode>; the
              trigger&apos;s <InlineCode>root</InlineCode>, <InlineCode>leading</InlineCode>,{' '}
              <InlineCode>text</InlineCode>, <InlineCode>tools</InlineCode> and{' '}
              <InlineCode>trailing</InlineCode>. <InlineCode>sendIcon</InlineCode> and{' '}
              <InlineCode>closeIcon</InlineCode> replace the icons.
            </li>
            <li>
              <InlineCode>MessageFieldFrame</InlineCode> is everything around the text, exported so
              another text box can sit inside it (<InlineCode>useMessageFieldInput</InlineCode>);{' '}
              <InlineCode>MessageField</InlineCode> is the frame with a{' '}
              <InlineCode>{'<textarea>'}</InlineCode>, and <InlineCode>RichMessageField</InlineCode>{' '}
              the frame with formatting.
            </li>
          </ul>
          <TokenTable set={messageFieldTokenSet} caption="Message field tokens" />
        </section>
      </>
    ),
  };
}
