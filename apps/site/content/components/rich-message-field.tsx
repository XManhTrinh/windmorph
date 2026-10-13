import { messageFieldTokenSet } from '@windmorph/react-pro';
import { mentionListTokenSet, richTextTokenSet } from '@windmorph/react-pro/rich-text';
import { ExampleViewer } from '../../components/example-viewer';
import { TokenTable } from '../../components/token-table';
import { RichMessageFieldComment } from '../../examples/rich-message-field/rich-message-field-comment';
import { RichMessageFieldMentions } from '../../examples/rich-message-field/rich-message-field-mentions';
import { RichMessageFieldPost } from '../../examples/rich-message-field/rich-message-field-post';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';

const code = (text: string) => <code className="text-on-surface">{text}</code>;

/** Rich message field page body: purpose, examples, behaviour, accessibility and tokens. */
export async function RichMessageFieldBody() {
  const [comment, post, mentions] = await Promise.all([
    readExampleSource('rich-message-field/rich-message-field-comment.tsx'),
    readExampleSource('rich-message-field/rich-message-field-post.tsx'),
    readExampleSource('rich-message-field/rich-message-field-mentions.tsx'),
  ]);
  const [commentHtml, postHtml, mentionsHtml] = await Promise.all([
    highlightSource(comment),
    highlightSource(post),
    highlightSource(mentions),
  ]);

  return (
    <>
      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Purpose</h2>
        <p className="text-body-large text-on-surface-variant">
          A message field that formats as you type, as Slack&apos;s: bold looks bold, code gets its
          box, and lists, quotes and code blocks are blocks. It is the {code('MessageField')} frame
          (its look, rows, tools, Send, counter and tokens) with a rich editor inside, and it hands
          out plain text in the <strong className="text-on-surface">marker format</strong> (
          {code('*bold*')}, {code('_italic_')}, {code('~strike~')}, {code('`code`')},{' '}
          {code('[words](https://…)')}, {code('> quote')}, {code('- item')}, {code('1. item')} and{' '}
          {code('```')} code blocks), which {code('FormattedText')} shows. It is{' '}
          <strong className="text-on-surface">not an M3 component</strong>, and comes from{' '}
          {code('@windmorph/react-pro/rich-text')}, which needs the {code('@tiptap/*')} packages (an
          optional peer dependency, so apps that don&apos;t use it never install them).
        </p>
        <p className="text-body-large text-on-surface-variant">
          Use a {code('MessageField')} where formatting isn&apos;t wanted (chat, search-like
          inputs), and a full document editor for headings, tables or images in the text.
        </p>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-headline-small text-on-surface">Examples</h2>
        <ExampleViewer
          title="A comment field, and the comments it wrote"
          code={comment}
          html={commentHtml}
          fileName="rich-message-field-comment.tsx"
        >
          <RichMessageFieldComment />
        </ExampleViewer>
        <ExampleViewer
          title="A post's composer: the toolbar always shows, Enter is a new line"
          code={post}
          html={postHtml}
          fileName="rich-message-field-post.tsx"
        >
          <RichMessageFieldPost />
        </ExampleViewer>
        <ExampleViewer
          title="Mentions: @ suggests people, and posted mentions link to them"
          code={mentions}
          html={mentionsHtml}
          fileName="rich-message-field-mentions.tsx"
        >
          <RichMessageFieldMentions />
        </ExampleViewer>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Mentions</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            {code('mentions.search(query)')} returns the people to suggest, in order: the app
            decides who (friends first, say) and how names match. It runs after a short pause in
            typing; one that takes a while shows a loading row, and one that fails shows nothing.{' '}
            {code('maxItems')} (8) caps the list.
          </li>
          <li>
            The list sits over the field, below it or above when there&apos;s no room, on the M3
            Expressive menu&apos;s surface. Arrows move, Enter or Tab picks, Escape closes, and
            pressing a person picks them; focus stays in the text throughout.
          </li>
          <li>
            A picked person is one {code('@Name')} token (Backspace takes it out whole), stored as{' '}
            {code('<@id|Name>')}: the id finds the person later, and the name written stays for
            anyone who can&apos;t see them. {code('mentionMarker(id, name)')} writes one.
          </li>
          <li>
            {code('FormattedText')} shows a mention as {code('@Name')} in the mention colour, or as{' '}
            {code('renderMention')} draws it: usually a link with the {code('wm-mention')} class to
            the person under their current name, or the name as plain text.
          </li>
          <li>
            {code('markersToPlainText(text)')} gives the words without the markers, for a
            page&apos;s title and description, a link preview or a notification.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Behaviour</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            {code('formatting')}: {code("'toggle'")} (an Aa tool shows and hides the formatting
            toolbar), {code("'always'")} (the toolbar stays, for a composer on larger windows) or{' '}
            {code("'none'")}. The toolbar is the field&apos;s {code('toolbar')} row:{' '}
            {code('formattingPlacement')} puts it above the text, between the text and the tools, or{' '}
            {code("'auto'")}: between on phones, in thumb reach, and above from medium windows.
          </li>
          <li>
            The buttons, and ⌘ or Ctrl + B, I, Shift+X and Shift+C, toggle formats without inserting
            anything visible, and show pressed where their format is on. Typing the markers turns
            them into formatting; {code('```')} then Enter starts a code block. Link asks for an
            http or https address in a dialog, or takes a link off.
          </li>
          <li>
            Enter sends, except in a list (the next item; an empty one ends the list) or a code
            block (a new line), and on touch screens, where it&apos;s a new line and Send sends;
            Shift+Enter starts a new line, and ⌘ or Ctrl + Enter always sends ({code('submitOn')} as
            in {code('MessageField')}).
          </li>
          <li>
            {code('value')} / {code('onChange')} (or {code('defaultValue')}) hold the text in the
            marker format; {code('onSubmit')} gets it trimmed. Everything else is the frame&apos;s:{' '}
            {code('tools')} (after Aa), {code('banner')}, {code('attachments')}, {code('onFiles')},{' '}
            {code('maxLength')} (never cut), {code('expandOnFocus')}, {code('docked')} and the rest.{' '}
            {code('handleRef')} adds {code('format')}, {code('setLink')} and {code('removeLink')} to{' '}
            {code('focus')}, {code('insertText')} and {code('clear')}.
          </li>
          <li>
            {code('FormattedText')} shows the marker format as elements, never HTML from the text.
            Links are http and https only, open in a new tab and get{' '}
            {code('rel="ugc nofollow noopener noreferrer"')}; {code('links={false}')} shows them as
            words inside something pressable. {code('parseMarkers')}, {code('markersToDoc')} and{' '}
            {code('docToMarkers')} read and convert the format.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Accessibility</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            The editor is a multiline {code('textbox')}, named by {code('label')} or{' '}
            {code('aria-label')} and described by the field&apos;s helper text, error and counter.
          </li>
          <li>
            The tools and the formatting buttons are two toolbars: one Tab stop each, arrow keys
            between their buttons. Each button has a name and a tooltip, and the formatting buttons
            are toggle buttons ({code('aria-pressed')}).
          </li>
          <li>
            With {code('mentions')}, the text box has {code('aria-autocomplete="list"')}; while the
            list is open it points at it ({code('aria-controls')}) and at the active person (
            {code('aria-activedescendant')}), and a polite status says how many people it shows. In
            forced colours the active person is outlined in {code('Highlight')}.
          </li>
          <li>
            Every word comes from {code('labels')}, with English defaults. Code and quotes keep a
            visible border in forced colours.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Theming &amp; tokens</h2>
        <p className="text-body-large text-on-surface-variant">
          The field takes every {code('--wm-message-field-*')} token (see Message field). The
          formatted text, while writing and in {code('FormattedText')}, takes these, on the text or
          any ancestor. {code('classNames')} reaches the field&apos;s parts and, through{' '}
          {code('formattingToolbar')}, the toolbar&apos;s {code('root')}, {code('button')} and{' '}
          {code('divider')}; {code('formattingIcon')} and {code('formattingToolbar.icons')} replace
          the icons.
        </p>
        <TokenTable set={richTextTokenSet} caption="Rich text tokens" />
        <p className="text-body-large text-on-surface-variant">
          The mention list takes these. It renders in a popover outside the field, so set them on{' '}
          {code(':root')} or a theme wrapper, or for one field in {code('mentions.classNames.list')}{' '}
          (for example {code('[--wm-mention-list-corner:8px]')}). {code('mentions.classNames')} also
          reaches its {code('item')}, {code('avatar')}, {code('label')} and {code('description')},
          with Tailwind classes that win over the defaults.
        </p>
        <TokenTable set={mentionListTokenSet} caption="Mention list tokens" />
        <details className="text-body-large text-on-surface-variant">
          <summary className="cursor-pointer text-on-surface">The field&apos;s own tokens</summary>
          <div className="pt-3">
            <TokenTable set={messageFieldTokenSet} caption="Message field tokens" />
          </div>
        </details>
      </section>
    </>
  );
}
