import { messageFieldTokenSet } from '@windmorph/react-pro';
import { ExampleViewer } from '../../components/example-viewer';
import { TokenTable } from '../../components/token-table';
import { MessageFieldChat } from '../../examples/message-field/message-field-chat';
import { MessageFieldComment } from '../../examples/message-field/message-field-comment';
import { MessageFieldTriggerExample } from '../../examples/message-field/message-field-trigger';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';

const code = (text: string) => <code className="text-on-surface">{text}</code>;

/** Message field page body: purpose, examples, behaviour, motion, accessibility and tokens. */
export async function MessageFieldBody() {
  const [comment, chat, trigger] = await Promise.all([
    readExampleSource('message-field/message-field-comment.tsx'),
    readExampleSource('message-field/message-field-chat.tsx'),
    readExampleSource('message-field/message-field-trigger.tsx'),
  ]);
  const [commentHtml, chatHtml, triggerHtml] = await Promise.all([
    highlightSource(comment),
    highlightSource(chat),
    highlightSource(trigger),
  ]);

  return (
    <>
      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Purpose</h2>
        <p className="text-body-large text-on-surface-variant">
          A rounded field for writing something to send: a comment, a reply, a chat message. It is a
          pill on one line, like the search bar, focused or not, and grows into a rounded box as the
          text runs over several lines. Enter sends, a send button grows in with the first
          character, and slots hold an avatar, icon buttons, a reply banner and attachments. It is{' '}
          <strong className="text-on-surface">not an M3 component</strong>, so it comes from{' '}
          {code('@windmorph/react-pro')}. {code('MessageFieldTrigger')} is the same look as one
          button (&quot;What&apos;s on your mind?&quot;) that opens a bigger composer.
        </p>
        <p className="text-body-large text-on-surface-variant">
          Use a {code('TextField')} for form input that is submitted with the rest of a form (a bio,
          an address), and a {code('SearchBar')} for search: it has search semantics, a back button
          and a suggestions view. Use a message field when what&apos;s written is sent on its own,
          straight away.
        </p>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-headline-small text-on-surface">Examples</h2>
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
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Behaviour</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            The text grows from {code('minRows')} (1) to {code('maxRows')} (6), then scrolls inside
            the field. {code('value')} / {code('onChange')} (or {code('defaultValue')}) hold it.
          </li>
          <li>
            {code('submitOn')}: {code("'enter'")} (Enter sends, Shift+Enter is a new line; on touch
            screens Enter is a new line and Send sends, as in Slack&apos;s and Messenger&apos;s
            apps), {code("'mod-enter'")} (Ctrl or ⌘+Enter sends) or {code("'none'")} (only the
            button). Nothing is sent while an input method is composing (Vietnamese Telex, pinyin,
            kana), and a blank value is never sent. {code('onSubmit')} gets the trimmed text.{' '}
            {code('canSend')} overrides &quot;any text&quot;: a photo alone can be sent, or Send can
            wait for an upload.
          </li>
          <li>
            The field doesn&apos;t clear itself: clear {code('value')} once the send succeeds, or
            set {code('clearOnSubmit')}. While {code('isSubmitting')}, the send button shows the
            loading indicator and ignores presses; a send that ends while {code('invalid')} shakes
            the field once beside {code('errorMessage')}.
          </li>
          <li>
            {code('emptyAction')} takes the send button&apos;s place while there is no text, such as
            a microphone. {code('send={false}')} hides the send button, and{' '}
            {code('sendVariant="standard"')} shows it as the icon alone, in primary.
          </li>
          <li>
            {code('onFiles')} gets files pasted or dropped onto the field that match{' '}
            {code('accept')}; the field shows its drag-over state. Without it, files are ignored and
            text pastes as usual.
          </li>
          <li>
            {code('maxLength')} never cuts what&apos;s written: past it, the counter turns to the
            error colour, the field is invalid and Send waits, so a long paste loses no words. The
            counter (&quot;1,840 / 2,000&quot;) shows from {code('counterThreshold')} (90%), or
            always with {code('showCounter')}; nearing, reaching and passing the limit are each
            announced once.
          </li>
          <li>
            {code('banner')} is a row above the text (&quot;Replying to Sam&quot;), with a close
            button when {code('onBannerClose')} is set; {code('attachments')} is a row of content
            above the text, such as {code('MediaUploadGrid')} with {code('layout="row"')}.{' '}
            {code('onEscape')} handles Escape, for example to cancel the reply.
          </li>
          <li>
            {code('tools')} holds icon buttons with their own actions (emoji, attach, GIF), at the
            end of the text row, in a toolbar: one Tab stop, and arrow keys between them. With{' '}
            {code('expandOnFocus')}, the first focus opens the field as Facebook&apos;s comment
            field does: the text takes the first row, and the tools and Send are on the second, with
            Send disabled until there&apos;s text. It stays open, so the page doesn&apos;t move each
            time focus leaves; it also starts open with text or a banner in it. A tool reaches the
            field with {code('useMessageField()')}: {code('insertText')} puts text at the caret
            (over the selection), and the app gets the same through {code('handleRef')}. The closed
            pill hides its tools when they&apos;d leave the text too narrow, or always with{' '}
            {code('toolsWhenIdle="hidden"')}; give {code('MessageFieldTrigger')} the same icons as{' '}
            {code('tools')} so the pill matches.
          </li>
          <li>
            {code('toolbar')} is a row of controls inside the open field, such as formatting
            buttons: above the text, between the text and the tools (in thumb reach on phones), or
            by window size ({code('toolbarPlacement')}). {code('docked')} squares the corners on the
            field&apos;s spring, for a field that becomes its container&apos;s footer (a card&apos;s
            comment field); where it sits is the app&apos;s.
          </li>
          <li>
            Icon buttons in {code('leading')} and {code('trailing')} take the field&apos;s size. An
            avatar as tall as them (32px at {code('sm')}, 40px at {code('md')} and {code('lg')})
            sits concentric in the pill.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Motion</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            The field breathes as it grows: the pill&apos;s corners morph to extra-large (28px) as
            the text wraps or a banner or attachments open, and the height follows on the default
            spatial spring, so a new line slides the field open. Focus never changes the shape: one
            line stays a pill.
          </li>
          <li>
            The send button grows in from a small circle on the fast spatial spring and shrinks away
            with the last character. Pressing it, or the trigger, squares its corners and springs
            back. While sending, its icon gives way to the loading indicator, which morphs through
            Material shapes.
          </li>
          <li>
            Opening on focus puts the tools on their row at once, as Facebook does, and springs the
            field&apos;s height and corners, so the new row slides into view; Send grows in.
          </li>
          <li>
            The banner and attachments open and close on a spring with a fade, so the text never
            jumps; the counter fades in.
          </li>
          <li>
            The springs follow the motion scheme. Under reduced motion, shapes and heights change at
            once, nothing scales or shakes, and only fades remain.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Keyboard &amp; screen reader</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            A visible {code('label')}, {code('aria-label')} or {code('aria-labelledby')} is required
            by the types; the placeholder is never the only name.
          </li>
          <li>
            The text is a {code('textarea')} with {code('aria-invalid')}, {code('aria-required')}{' '}
            and {code('aria-describedby')} linking {code('description')} and {code('errorMessage')};
            the error is announced when it appears. The limit is announced politely as it nears and
            when it is reached ({code('labels.nearLimit')}, {code('labels.atLimit')}).
          </li>
          <li>
            The send button has its own name and tooltip ({code('labels.send')}). Pressing it keeps
            the caret in the text. While sending it stays focusable ({code('aria-disabled')}).
          </li>
          <li>
            {code('MessageFieldTrigger')} is a {code('button')} (or a link with {code('href')})
            named by its prompt; its avatar and icon are decorative.
          </li>
          <li>
            Every button keeps a 48px target. Slots and the counter mirror right-to-left; forced
            colours draw the border in {code('CanvasText')} and focus in {code('Highlight')}.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Theming &amp; tokens</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            {code('variant')}: {code('filled')} ({code('surface-container-high')}, as the search
            bar), {code('tonal')} ({code('secondary-container')}) or {code('outlined')} (an{' '}
            {code('outline')} border, {code('primary')} while focused). {code('size')}: {code('sm')}{' '}
            40px ({code('body-medium')}), {code('md')} 48px and {code('lg')} 56px (
            {code('body-large')}).
          </li>
          <li>
            Every value the field paints is a token: set the variables below on the field (
            {code('className')}) or on any ancestor, globally or per theme. Sizes and variants only
            change their defaults. The send button, the banner&apos;s close button and the tools are
            ordinary {code('IconButton')}s, so a theme reaches them as it does any button, and{' '}
            {code('classNames')} reaches each one.
          </li>
          <li>
            {code('classNames')} styles the {code('root')}, {code('label')}, {code('field')},{' '}
            {code('banner')}, {code('bannerClose')}, {code('toolbar')}, {code('attachments')},{' '}
            {code('leading')}, {code('input')}, {code('tools')}, {code('trailing')}, the send
            button&apos;s parts ({code('send.root')}, {code('send.icon')}, {code('send.glyph')},{' '}
            {code('send.loading')}), {code('emptyAction')}, {code('supporting')} and{' '}
            {code('counter')}; the trigger&apos;s {code('root')}, {code('leading')}, {code('text')},{' '}
            {code('tools')} and {code('trailing')}. {code('sendIcon')} and {code('closeIcon')}{' '}
            replace the icons.
          </li>
          <li>
            {code('MessageFieldFrame')} is everything around the text, exported so another text box
            can sit inside it ({code('useMessageFieldInput')}); {code('MessageField')} is the frame
            with a {code('<textarea>')}, and {code('RichMessageField')} the frame with formatting.
          </li>
        </ul>
        <TokenTable set={messageFieldTokenSet} caption="Message field tokens" />
      </section>
    </>
  );
}
