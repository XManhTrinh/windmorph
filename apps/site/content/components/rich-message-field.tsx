import type { ComponentDoc } from './doc';
import { messageFieldTokenSet } from '@windmorph/react-pro';
import { mentionListTokenSet, richTextTokenSet } from '@windmorph/react-pro/rich-text';
import { ExampleViewer } from '../../components/example-viewer';
import { TokenTable } from '../../components/token-table';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';
import { InlineCode } from '../../components/inline-code';
import { lazyExample } from '../../lib/lazy-example';

const RichMessageFieldComment = lazyExample(
  'rich-message-field/rich-message-field-comment',
  'RichMessageFieldComment',
);
const RichMessageFieldMentions = lazyExample(
  'rich-message-field/rich-message-field-mentions',
  'RichMessageFieldMentions',
);
const RichMessageFieldPost = lazyExample(
  'rich-message-field/rich-message-field-post',
  'RichMessageFieldPost',
);
const RichMessageFieldDialog = lazyExample(
  'rich-message-field/rich-message-field-dialog',
  'RichMessageFieldDialog',
);
const FormattedTextOwnLinks = lazyExample(
  'rich-message-field/formatted-text-own-links',
  'FormattedTextOwnLinks',
);

/** Rich message field page body: purpose, examples, behaviour, accessibility and tokens. */
export async function RichMessageFieldBody(): Promise<ComponentDoc> {
  const [comment, post, dialog, mentions, ownLinks] = await Promise.all([
    readExampleSource('rich-message-field/rich-message-field-comment.tsx'),
    readExampleSource('rich-message-field/rich-message-field-post.tsx'),
    readExampleSource('rich-message-field/rich-message-field-dialog.tsx'),
    readExampleSource('rich-message-field/rich-message-field-mentions.tsx'),
    readExampleSource('rich-message-field/formatted-text-own-links.tsx'),
  ]);
  const [commentHtml, postHtml, dialogHtml, mentionsHtml, ownLinksHtml] = await Promise.all([
    highlightSource(comment),
    highlightSource(post),
    highlightSource(dialog),
    highlightSource(mentions),
    highlightSource(ownLinks),
  ]);

  return {
    overview: (
      <>
        <section className="flex flex-col gap-6">
          <h2 id="examples" className="text-headline-small text-on-surface">
            Examples
          </h2>
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
            title="A post’s composer in a dialog, with a smaller corner than the dialog’s"
            code={dialog}
            html={dialogHtml}
            fileName="rich-message-field-dialog.tsx"
          >
            <RichMessageFieldDialog />
          </ExampleViewer>
          <ExampleViewer
            title="Mentions: @ suggests people, and posted mentions link to them"
            code={mentions}
            html={mentionsHtml}
            fileName="rich-message-field-mentions.tsx"
          >
            <RichMessageFieldMentions />
          </ExampleViewer>
          <ExampleViewer
            title="FormattedText: the app’s own links as ordinary links, by their safe path"
            code={ownLinks}
            html={ownLinksHtml}
            fileName="formatted-text-own-links.tsx"
          >
            <FormattedTextOwnLinks />
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
            A message field that formats as you type, with markers in plain text: bold looks bold,
            code gets its box, and lists, quotes and code blocks are blocks. It is the{' '}
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

        <section className="flex flex-col gap-3">
          <h2 id="behaviour" className="text-headline-small text-on-surface">
            Behaviour
          </h2>
          <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
            <li>
              <InlineCode>formatting</InlineCode>: <InlineCode>{"'toggle'"}</InlineCode> (an Aa tool
              shows and hides the formatting toolbar), <InlineCode>{"'always'"}</InlineCode> (the
              toolbar stays, for a composer on larger windows) or{' '}
              <InlineCode>{"'none'"}</InlineCode>. The toolbar is the field&apos;s{' '}
              <InlineCode>toolbar</InlineCode> row: <InlineCode>formattingPlacement</InlineCode>{' '}
              puts it above the text, between the text and the tools, or{' '}
              <InlineCode>{"'auto'"}</InlineCode>: between on phones, in thumb reach, and above from
              medium windows.
            </li>
            <li>
              The buttons, and ⌘ or Ctrl + B, I, Shift+X and Shift+C, toggle formats without
              inserting anything visible, and show pressed where their format is on. Typing the
              markers turns them into formatting; <InlineCode>{'```'}</InlineCode> then Enter starts
              a code block. Link asks for an http or https address in a dialog, or takes a link off.
              The toolbar is one Tab stop: the arrows move between its buttons and wrap, Home and
              End reach the first and last, and a <InlineCode>separator</InlineCode> divides its
              groups. Its buttons stay at density 0, so the field keeps its height in a dense theme.
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
              <InlineCode>onSubmit</InlineCode> gets it trimmed. Everything else is the
              frame&apos;s: <InlineCode>tools</InlineCode> (after Aa),{' '}
              <InlineCode>banner</InlineCode>, <InlineCode>attachments</InlineCode>,{' '}
              <InlineCode>onFileAccept</InlineCode> and <InlineCode>onFileReject</InlineCode>,{' '}
              <InlineCode>maxLength</InlineCode> (never cut; it counts the stored marker text, so
              markers and mentions count: <InlineCode>*bold*</InlineCode> is 6),{' '}
              <InlineCode>expandOnFocus</InlineCode>, <InlineCode>docked</InlineCode> and the rest.{' '}
              <InlineCode>handleRef</InlineCode> adds <InlineCode>format</InlineCode>,{' '}
              <InlineCode>setLink</InlineCode> and <InlineCode>removeLink</InlineCode> to{' '}
              <InlineCode>focus</InlineCode>, <InlineCode>insertText</InlineCode> and{' '}
              <InlineCode>clear</InlineCode>. Focusing the text (a press on the field or a tool,{' '}
              <InlineCode>insertText</InlineCode>) never scrolls the page; the app&apos;s{' '}
              <InlineCode>focus()</InlineCode> brings a field that is wholly off screen into view.
            </li>
            <li>
              <InlineCode>onFileAccept</InlineCode> gets files pasted or dropped onto the field that
              match <InlineCode>accept</InlineCode>, before the editor sees them.{' '}
              <InlineCode>onFileReject(rejections)</InlineCode> gets the files a paste or drop
              brought that weren&apos;t taken, after <InlineCode>onFileAccept</InlineCode> and never
              with an empty list, each with its <InlineCode>reason</InlineCode> (
              <InlineCode>type</InlineCode>, off <InlineCode>accept</InlineCode>), so you can say
              why a file didn&apos;t appear. A paste whose HTML holds words is a text paste whatever
              files it carries (copied cells or a document bring a picture of themselves), neither
              taken nor reported; a copied picture, whose HTML is the image alone, is taken, or
              reported when <InlineCode>accept</InlineCode> leaves it out. A paste that takes no
              file still pastes as usual, and reports its files unless it carries plain text (a
              copied file&apos;s name).
            </li>
            <li>
              <InlineCode>FormattedText</InlineCode> shows the marker format as elements, never HTML
              from the text. Links are http and https only, open in a new tab and get{' '}
              <InlineCode>{'rel="ugc nofollow noopener noreferrer"'}</InlineCode>;{' '}
              <InlineCode>{'links={false}'}</InlineCode> shows them as words inside something
              pressable. Links to the app&apos;s own pages can be ordinary links:{' '}
              <InlineCode>internalLinks(url)</InlineCode> picks them (say,{' '}
              <InlineCode>{'(url) => url.origin === SITE_ORIGIN'}</InlineCode>, a constant from the
              app&apos;s config: it runs on the server too, where there is no{' '}
              <InlineCode>location</InlineCode>, and must answer the same there), and they open in
              the same tab, through the app&apos;s <InlineCode>RouterProvider</InlineCode> on the
              page&apos;s own origin (its <InlineCode>navigate</InlineCode> gets the link as
              written, a full <InlineCode>https://</InlineCode> address), with no new-tab mark or
              words and <InlineCode>internalLinkRel</InlineCode> (none by default) in place of{' '}
              <InlineCode>ugc nofollow</InlineCode>. <InlineCode>renderLink(link)</InlineCode>{' '}
              renders a link yourself, for instance with your router&apos;s link component; return{' '}
              <InlineCode>undefined</InlineCode> to keep the default for that link. For a router
              that takes a path, render the link there and give it{' '}
              <InlineCode>link.path</InlineCode>: the path with one leading slash, then the search
              and hash. Never use the address&apos;s raw <InlineCode>pathname</InlineCode>:{' '}
              <InlineCode>https://site.example//other.example/x</InlineCode> has the pathname{' '}
              <InlineCode>//other.example/x</InlineCode>, which a browser or router reads as an
              address on another site, so a crafted link would send people there. An address whose
              path starts with <InlineCode>//</InlineCode> is never one of the app&apos;s own,
              whatever <InlineCode>internalLinks</InlineCode> says.{' '}
              <InlineCode>parseMarkers</InlineCode>, <InlineCode>markersToDoc</InlineCode> and{' '}
              <InlineCode>docToMarkers</InlineCode> read and convert the format.
            </li>
          </ul>
        </section>
      </>
    ),
    api: (
      <>
        <section className="flex flex-col gap-3">
          <h2 id="mentions" className="text-headline-small text-on-surface">
            Mentions
          </h2>
          <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
            <li>
              <InlineCode>mentions.search(query)</InlineCode> returns the people to suggest, in
              order: the app decides who (friends first, say) and how names match. It runs after a
              short pause in typing; one that takes a while shows a loading row, and one that fails
              shows nothing. <InlineCode>maxItems</InlineCode> (8) caps the list.
            </li>
            <li>
              The list sits over the field, below it or above when there&apos;s no room, drawn as
              the core&apos;s menu: its container, elevation 2, state layers and the pressed ripple.
              Arrows move (the arrowed person shows keyboard focus), Enter or Tab picks, Escape
              closes, and pressing a person picks them; focus stays in the text throughout. The
              &quot;N people&quot; status is in the page before its first count, so screen readers
              announce it.
            </li>
            <li>
              A picked person is one <InlineCode>@Name</InlineCode> token (Backspace takes it out
              whole), stored as <InlineCode>{'<@id|Name>'}</InlineCode>: the id finds the person
              later, and the name written stays for anyone who can&apos;t see them.{' '}
              <InlineCode>mentionMarker(id, name)</InlineCode> writes one.
            </li>
            <li>
              <InlineCode>FormattedText</InlineCode> shows a mention as{' '}
              <InlineCode>@Name</InlineCode> in the mention colour, or as{' '}
              <InlineCode>renderMention</InlineCode> draws it: usually a link with the{' '}
              <InlineCode>wm-mention</InlineCode> class to the person under their current name, or
              the name as plain text.
            </li>
            <li>
              <InlineCode>markersToPlainText(text)</InlineCode> gives the words without the markers,
              for a page&apos;s title and description, a link preview or a notification.
            </li>
            <li>
              The suggestion list&apos;s rows follow density as the core menu&apos;s do (44px at 0,
              32px at −3).
            </li>
          </ul>
        </section>

        <section className="flex flex-col gap-3">
          <h2 id="theming-and-tokens" className="text-headline-small text-on-surface">
            Theming &amp; tokens
          </h2>
          <p className="text-body-large text-on-surface-variant">
            The field takes every <InlineCode>--wm-message-field-*</InlineCode> token (see Message
            field); inside a dialog, a card or a sheet, give the grown field a smaller corner than
            the container&apos;s (<InlineCode>--wm-message-field-grown-corner</InlineCode>), as the
            dialog example does. The formatted text, while writing and in{' '}
            <InlineCode>FormattedText</InlineCode>, takes these, on the text or any ancestor: bold
            and mentions use the emphasized body weight, inline code keeps the text&apos;s size and
            code blocks are <InlineCode>body-medium</InlineCode>.{' '}
            <InlineCode>classNames</InlineCode> reaches the field&apos;s parts and, through{' '}
            <InlineCode>formattingToolbar</InlineCode>, the toolbar&apos;s{' '}
            <InlineCode>root</InlineCode>, <InlineCode>button</InlineCode> and{' '}
            <InlineCode>divider</InlineCode>; <InlineCode>formattingIcon</InlineCode> and{' '}
            <InlineCode>formattingToolbar.icons</InlineCode> replace the icons.
          </p>
          <TokenTable set={richTextTokenSet} caption="Rich text tokens" />
          <p className="text-body-large text-on-surface-variant">
            The mention list carries the core menu&apos;s tokens, and its{' '}
            <InlineCode>container</InlineCode>, <InlineCode>corner</InlineCode> and{' '}
            <InlineCode>label-color</InlineCode> default to the{' '}
            <InlineCode>--md-comp-menus-*</InlineCode> ones, so an app&apos;s menu theme reaches it
            too. Its own tokens are these. It renders in a popover outside the field, so set them on{' '}
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
            <summary className="cursor-pointer text-on-surface">
              The field&apos;s own tokens
            </summary>
            <div className="pt-3">
              <TokenTable set={messageFieldTokenSet} caption="Message field tokens" />
            </div>
          </details>
        </section>
      </>
    ),
  };
}
