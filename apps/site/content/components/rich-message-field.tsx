import { messageFieldTokenSet } from '@windmorph/react-pro';
import { mentionListTokenSet, richTextTokenSet } from '@windmorph/react-pro/rich-text';
import { ExampleViewer } from '../../components/example-viewer';
import { TokenTable } from '../../components/token-table';
import { RichMessageFieldComment } from '../../examples/rich-message-field/rich-message-field-comment';
import { RichMessageFieldMentions } from '../../examples/rich-message-field/rich-message-field-mentions';
import { RichMessageFieldPost } from '../../examples/rich-message-field/rich-message-field-post';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';
import { InlineCode } from '../../components/inline-code';

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
          box, and lists, quotes and code blocks are blocks. It is the{' '}
          <InlineCode>MessageField</InlineCode> frame (its look, rows, tools, Send, counter and
          tokens) with a rich editor inside, and it hands out plain text in the{' '}
          <strong className="text-on-surface">marker format</strong> (
          <InlineCode>*bold*</InlineCode>, <InlineCode>_italic_</InlineCode>,{' '}
          <InlineCode>~strike~</InlineCode>, <InlineCode>{'`code`'}</InlineCode>,{' '}
          <InlineCode>[words](https://…)</InlineCode>, <InlineCode>{'> quote'}</InlineCode>,{' '}
          <InlineCode>- item</InlineCode>, <InlineCode>1. item</InlineCode> and{' '}
          <InlineCode>{'```'}</InlineCode> code blocks), which{' '}
          <InlineCode>FormattedText</InlineCode> shows. It is{' '}
          <strong className="text-on-surface">not an M3 component</strong>, and comes from{' '}
          <InlineCode>@windmorph/react-pro/rich-text</InlineCode>, which needs the{' '}
          <InlineCode>@tiptap/*</InlineCode> packages (an optional peer dependency, so apps that
          don&apos;t use it never install them).
        </p>
        <p className="text-body-large text-on-surface-variant">
          Use a <InlineCode>MessageField</InlineCode> where formatting isn&apos;t wanted (chat,
          search-like inputs), and a full document editor for headings, tables or images in the
          text.
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
            <InlineCode>mentions.search(query)</InlineCode> returns the people to suggest, in order:
            the app decides who (friends first, say) and how names match. It runs after a short
            pause in typing; one that takes a while shows a loading row, and one that fails shows
            nothing. <InlineCode>maxItems</InlineCode> (8) caps the list.
          </li>
          <li>
            The list sits over the field, below it or above when there&apos;s no room, on the M3
            Expressive menu&apos;s surface. Arrows move, Enter or Tab picks, Escape closes, and
            pressing a person picks them; focus stays in the text throughout.
          </li>
          <li>
            A picked person is one <InlineCode>@Name</InlineCode> token (Backspace takes it out
            whole), stored as <InlineCode>{'<@id|Name>'}</InlineCode>: the id finds the person
            later, and the name written stays for anyone who can&apos;t see them.{' '}
            <InlineCode>mentionMarker(id, name)</InlineCode> writes one.
          </li>
          <li>
            <InlineCode>FormattedText</InlineCode> shows a mention as <InlineCode>@Name</InlineCode>{' '}
            in the mention colour, or as <InlineCode>renderMention</InlineCode> draws it: usually a
            link with the <InlineCode>wm-mention</InlineCode> class to the person under their
            current name, or the name as plain text.
          </li>
          <li>
            <InlineCode>markersToPlainText(text)</InlineCode> gives the words without the markers,
            for a page&apos;s title and description, a link preview or a notification.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Behaviour</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            <InlineCode>formatting</InlineCode>: <InlineCode>{"'toggle'"}</InlineCode> (an Aa tool
            shows and hides the formatting toolbar), <InlineCode>{"'always'"}</InlineCode> (the
            toolbar stays, for a composer on larger windows) or <InlineCode>{"'none'"}</InlineCode>.
            The toolbar is the field&apos;s <InlineCode>toolbar</InlineCode> row:{' '}
            <InlineCode>formattingPlacement</InlineCode> puts it above the text, between the text
            and the tools, or <InlineCode>{"'auto'"}</InlineCode>: between on phones, in thumb
            reach, and above from medium windows.
          </li>
          <li>
            The buttons, and ⌘ or Ctrl + B, I, Shift+X and Shift+C, toggle formats without inserting
            anything visible, and show pressed where their format is on. Typing the markers turns
            them into formatting; <InlineCode>{'```'}</InlineCode> then Enter starts a code block.
            Link asks for an http or https address in a dialog, or takes a link off.
          </li>
          <li>
            Enter sends, except in a list (the next item; an empty one ends the list) or a code
            block (a new line), and on touch screens, where it&apos;s a new line and Send sends;
            Shift+Enter starts a new line, and ⌘ or Ctrl + Enter always sends (
            <InlineCode>submitOn</InlineCode> as in <InlineCode>MessageField</InlineCode>).
          </li>
          <li>
            <InlineCode>value</InlineCode> / <InlineCode>onChange</InlineCode> (or{' '}
            <InlineCode>defaultValue</InlineCode>) hold the text in the marker format;{' '}
            <InlineCode>onSubmit</InlineCode> gets it trimmed. Everything else is the frame&apos;s:{' '}
            <InlineCode>tools</InlineCode> (after Aa), <InlineCode>banner</InlineCode>,{' '}
            <InlineCode>attachments</InlineCode>, <InlineCode>onFiles</InlineCode>,{' '}
            <InlineCode>maxLength</InlineCode> (never cut), <InlineCode>expandOnFocus</InlineCode>,{' '}
            <InlineCode>docked</InlineCode> and the rest. <InlineCode>handleRef</InlineCode> adds{' '}
            <InlineCode>format</InlineCode>, <InlineCode>setLink</InlineCode> and{' '}
            <InlineCode>removeLink</InlineCode> to <InlineCode>focus</InlineCode>,{' '}
            <InlineCode>insertText</InlineCode> and <InlineCode>clear</InlineCode>.
          </li>
          <li>
            <InlineCode>FormattedText</InlineCode> shows the marker format as elements, never HTML
            from the text. Links are http and https only, open in a new tab and get{' '}
            <InlineCode>{'rel="ugc nofollow noopener noreferrer"'}</InlineCode>;{' '}
            <InlineCode>{'links={false}'}</InlineCode> shows them as words inside something
            pressable. <InlineCode>parseMarkers</InlineCode>, <InlineCode>markersToDoc</InlineCode>{' '}
            and <InlineCode>docToMarkers</InlineCode> read and convert the format.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Accessibility</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            The editor is a multiline <InlineCode>textbox</InlineCode>, named by{' '}
            <InlineCode>label</InlineCode> or <InlineCode>aria-label</InlineCode> and described by
            the field&apos;s helper text, error and counter.
          </li>
          <li>
            The tools and the formatting buttons are two toolbars: one Tab stop each, arrow keys
            between their buttons. Each button has a name and a tooltip, and the formatting buttons
            are toggle buttons (<InlineCode>aria-pressed</InlineCode>).
          </li>
          <li>
            With <InlineCode>mentions</InlineCode>, the text box has{' '}
            <InlineCode>{'aria-autocomplete="list"'}</InlineCode>; while the list is open it points
            at it (<InlineCode>aria-controls</InlineCode>) and at the active person (
            <InlineCode>aria-activedescendant</InlineCode>), and a polite status says how many
            people it shows. In forced colours the active person is outlined in{' '}
            <InlineCode>Highlight</InlineCode>.
          </li>
          <li>
            Every word comes from <InlineCode>labels</InlineCode>, with English defaults. Code and
            quotes keep a visible border in forced colours.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Theming &amp; tokens</h2>
        <p className="text-body-large text-on-surface-variant">
          The field takes every <InlineCode>--wm-message-field-*</InlineCode> token (see Message
          field). The formatted text, while writing and in <InlineCode>FormattedText</InlineCode>,
          takes these, on the text or any ancestor. <InlineCode>classNames</InlineCode> reaches the
          field&apos;s parts and, through <InlineCode>formattingToolbar</InlineCode>, the
          toolbar&apos;s <InlineCode>root</InlineCode>, <InlineCode>button</InlineCode> and{' '}
          <InlineCode>divider</InlineCode>; <InlineCode>formattingIcon</InlineCode> and{' '}
          <InlineCode>formattingToolbar.icons</InlineCode> replace the icons.
        </p>
        <TokenTable set={richTextTokenSet} caption="Rich text tokens" />
        <p className="text-body-large text-on-surface-variant">
          The mention list takes these. It renders in a popover outside the field, so set them on{' '}
          <InlineCode>:root</InlineCode> or a theme wrapper, or for one field in{' '}
          <InlineCode>mentions.classNames.list</InlineCode> (for example{' '}
          <InlineCode>[--wm-mention-list-corner:8px]</InlineCode>).{' '}
          <InlineCode>mentions.classNames</InlineCode> also reaches its{' '}
          <InlineCode>item</InlineCode>, <InlineCode>avatar</InlineCode>,{' '}
          <InlineCode>label</InlineCode> and <InlineCode>description</InlineCode>, with Tailwind
          classes that win over the defaults.
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
