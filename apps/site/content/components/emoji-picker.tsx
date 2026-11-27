import type { ComponentDoc } from './doc';
import { emojiPickerTokenSet } from '@windmorph/react-pro/emoji-picker';
import { TokenTable } from '../../components/token-table';
import { InlineCode } from '../../components/inline-code';
import { CodeList, exampleSection } from './example-list';

const TEXT = 'text-body-large text-on-surface-variant';
const LIST = `flex flex-col gap-2 ps-5 ${TEXT} [&>li]:list-disc`;
const HEADING = 'text-headline-small text-on-surface';
const SECTION = 'flex flex-col gap-3';

const SLOTS = [
  'root',
  'header',
  'search',
  'tabs',
  'tab',
  'scroller',
  'grid',
  'section',
  'heading',
  'row',
  'cell',
  'status',
  'footer',
  'preview',
  'skinTone',
];
const TRIGGER_SLOTS = ['button', 'popover', 'sheet', 'docked', 'picker'];

/** EmojiPicker page body: examples, when to use it, where it shows, data, storage and tokens. */
export async function EmojiPickerBody(): Promise<ComponentDoc> {
  const overview = await exampleSection([
    {
      title: 'The panel on its own',
      file: 'emoji-picker/emoji-picker-panel',
      name: 'EmojiPickerPanel',
    },
    {
      title: 'In a message field',
      file: 'emoji-picker/emoji-picker-message-field',
      name: 'EmojiPickerMessageField',
    },
    {
      title: 'A one-off pick, closed on select',
      file: 'emoji-picker/emoji-picker-status',
      name: 'EmojiPickerStatus',
    },
    {
      title: 'Custom emoji',
      file: 'emoji-picker/emoji-picker-custom',
      name: 'EmojiPickerCustom',
    },
    {
      title: 'Another language',
      file: 'emoji-picker/emoji-picker-german',
      name: 'EmojiPickerGerman',
    },
  ]);
  return {
    overview,
    guidelines: (
      <>
        <section className={SECTION}>
          <h2 id="purpose" className={HEADING}>
            Purpose
          </h2>
          <p className={TEXT}>
            A panel for choosing emoji: a search box, a tab per category, a grid of every emoji the
            device can draw, a preview with the focused emoji&apos;s name, and a skin tone. M3 has
            no emoji picker, so it is drawn with M3&apos;s surfaces, tabs, menus and type.
          </p>
          <ul className={LIST}>
            <li>
              <InlineCode>EmojiPickerTrigger</InlineCode>: an emoji button in a message field&apos;s
              tools, or beside any text box. It opens the picker, and inside a{' '}
              <InlineCode>MessageField</InlineCode> or <InlineCode>RichMessageField</InlineCode>{' '}
              each pick goes in at the caret through the field&apos;s{' '}
              <InlineCode>insertText</InlineCode> (<InlineCode>insert=&#123;false&#125;</InlineCode>{' '}
              turns it off).
            </li>
            <li>
              <InlineCode>EmojiPicker</InlineCode>: the panel alone, placed by the app (a side
              panel, a settings page, a status).
            </li>
            <li>
              For a short, fixed row of reactions to a message, use a{' '}
              <InlineCode>ReactionPicker</InlineCode> instead.
            </li>
          </ul>
          <p className={TEXT}>
            Import it from <InlineCode>@windmorph/react-pro/emoji-picker</InlineCode>, with{' '}
            <InlineCode>emojibase-data</InlineCode> and <InlineCode>emojibase</InlineCode> installed
            (<InlineCode>pnpm add emojibase-data emojibase</InlineCode>): its default loader imports
            the data, so bundlers need the package even when you pass your own. Pro&apos;s main
            entry never reaches the data.
          </p>
        </section>
        <section className={SECTION}>
          <h2 id="where-it-shows" className={HEADING}>
            Where it shows
          </h2>
          <p className={TEXT}>
            The trigger&apos;s <InlineCode>presentation</InlineCode> picks the form, decided as it
            opens, so a rotation or a resize while it&apos;s open keeps the picker, its search and
            its focus:
          </p>
          <ul className={LIST}>
            <li>
              <InlineCode>popover</InlineCode>: beside the button (
              <InlineCode>placement</InlineCode>, <InlineCode>top-start</InlineCode> by default),
              its height following the window.
            </li>
            <li>
              <InlineCode>sheet</InlineCode>: a modal bottom sheet with a drag handle, at most{' '}
              <InlineCode>--wm-emoji-picker-sheet-height</InlineCode>, with its search and tabs at
              the top and its footer at the bottom.
            </li>
            <li>
              <InlineCode>docked</InlineCode>: below the message field it&apos;s in, in the
              keyboard&apos;s place, as messaging apps do on phones. The on-screen keyboard closes
              and the panel takes its height, so the field stays in sight above it and each pick
              shows in the text as it goes in. Nothing is dimmed; the emoji button becomes a
              keyboard button (&ldquo;Show keyboard&rdquo;) that puts the caret back in the text,
              and a press in the text goes back to typing too.
            </li>
            <li>
              <InlineCode>auto</InlineCode> (the default): the popover from the medium window size
              or with a fine pointer; below it by touch, docked inside a message field and a sheet
              anywhere else. <InlineCode>docked</InlineCode> outside a message field falls back to
              the sheet.
            </li>
          </ul>
          <p className={TEXT}>
            A pick keeps the picker open for more; Escape or a press outside closes it, and{' '}
            <InlineCode>closeOnSelect</InlineCode> closes it on the first pick. The trigger&apos;s
            button renders on the server; the panel&apos;s code and the data load on the
            button&apos;s first hover, focus or press, so a closed trigger costs little.
          </p>
        </section>
        <section className={SECTION}>
          <h2 id="data-and-languages" className={HEADING}>
            Data and languages
          </h2>
          <ul className={LIST}>
            <li>
              The emoji, their names and their search words come from{' '}
              <InlineCode>emojibase-data</InlineCode>, loaded on first open from your own bundle,
              never from a third-party server, and kept for the page by{' '}
              <InlineCode>locale</InlineCode>. The default is English.
            </li>
            <li>
              For another language, pass that language&apos;s data and a{' '}
              <InlineCode>locale</InlineCode> to keep it under:{' '}
              <InlineCode>
                locale=&quot;de&quot; loadData=&#123;() =&gt;
                import(&apos;emojibase-data/de/data.json&apos;)&#125;
              </InlineCode>
              . Search then matches that language&apos;s names and keywords. Translate the
              picker&apos;s own words with <InlineCode>labels</InlineCode>, or once for the app with
              a <InlineCode>LabelsProvider</InlineCode> under its{' '}
              <InlineCode>EmojiPicker</InlineCode> key.
            </li>
            <li>
              Every word of a search must appear in an emoji&apos;s name or a keyword, anywhere in
              it (so languages written without spaces search too), ignoring case and accents.
            </li>
            <li>
              Emoji the device&apos;s font can&apos;t draw are hidden, found once per page by
              drawing a sample of each Unicode version; where flags draw as two letters, the country
              flags are hidden. Nothing about the device is stored.
            </li>
            <li>
              Glyphs are the platform&apos;s colour emoji font (
              <InlineCode>--wm-emoji-picker-font-family</InlineCode>).{' '}
              <InlineCode>renderEmoji</InlineCode> draws your own image set instead.
            </li>
          </ul>
        </section>
        <section className={SECTION}>
          <h2 id="custom-emoji" className={HEADING}>
            Custom and animated emoji
          </h2>
          <p className={TEXT}>
            <InlineCode>custom</InlineCode> adds your own emoji (
            <InlineCode>&#123; id, label, tags, src, animatedSrc, render &#125;</InlineCode>) in a
            Custom category after Recently used, found by search and kept in Recently used. A text
            box can&apos;t hold an image, so a pick hands text for it, <InlineCode>:id:</InlineCode>{' '}
            unless <InlineCode>customText</InlineCode> says otherwise, with the emoji itself in{' '}
            <InlineCode>custom</InlineCode>; draw its image wherever you show that text.{' '}
            <InlineCode>src</InlineCode> is drawn lazily; <InlineCode>animatedSrc</InlineCode> (GIF,
            WebP, APNG) plays only while the emoji is hovered or focused and in the preview, and
            never under reduced motion, so the grid stays still.
          </p>
        </section>
        <section className={SECTION}>
          <h2 id="recently-used-and-skin-tone" className={HEADING}>
            Recently used and skin tone
          </h2>
          <ul className={LIST}>
            <li>
              Recently used holds the last <InlineCode>maxRecent</InlineCode> picks (16), newest
              first. A pick is recorded at once, but the row keeps its order until the picker opens
              again, so repeated presses never land on a moved emoji.
            </li>
            <li>
              One skin tone applies to the whole picker, chosen from the menu in its footer; an
              emoji of two people takes its same-tone form.
            </li>
            <li>
              Both are kept in <InlineCode>localStorage</InlineCode> under{' '}
              <InlineCode>storageKey</InlineCode> (
              <InlineCode>&quot;wm-emoji-picker&quot;</InlineCode>; <InlineCode>null</InlineCode>{' '}
              keeps them in memory), and blocked or full storage never throws. Everyone using the
              browser shares the key, so an app with accounts passes one per account, or controls
              them with <InlineCode>recent</InlineCode> / <InlineCode>onRecentChange</InlineCode>{' '}
              and <InlineCode>skinTone</InlineCode> / <InlineCode>onSkinToneChange</InlineCode>.
            </li>
            <li>
              <InlineCode>useEmojiPickerStorage(storageKey)</InlineCode> reads and writes the same
              stored list and tone, for an app that shows recently used emoji elsewhere.{' '}
              <InlineCode>EMOJI_CATEGORIES</InlineCode> and{' '}
              <InlineCode>EMOJI_SKIN_TONES</InlineCode> list the categories and tones, for your own
              labels.
            </li>
          </ul>
        </section>
      </>
    ),
    api: (
      <section className={SECTION}>
        <h2 id="theming-and-tokens" className={HEADING}>
          Theming &amp; tokens
        </h2>
        <p className={TEXT}>
          Set the tokens below on the picker or any ancestor; the popover, the sheet and the docked
          panel read them too. <InlineCode>className</InlineCode> goes on the picker&apos;s root;
          style each part with <InlineCode>classNames</InlineCode>: <CodeList names={SLOTS} />. On
          the trigger, <InlineCode>className</InlineCode> goes on its button, and its{' '}
          <InlineCode>classNames</InlineCode> take <CodeList names={TRIGGER_SLOTS} /> (the
          picker&apos;s own keys). The root carries <InlineCode>data-loading</InlineCode>,{' '}
          <InlineCode>data-error</InlineCode>, <InlineCode>data-searching</InlineCode> and{' '}
          <InlineCode>data-skin-tone</InlineCode>.
        </p>
        <TokenTable set={emojiPickerTokenSet} caption="EmojiPicker tokens" />
      </section>
    ),
  };
}
