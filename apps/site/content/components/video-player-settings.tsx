import type { ComponentDoc } from './doc';
import { videoPlayerSettingsTokenSet } from '@windmorph/react-pro';
import { TokenTable } from '../../components/token-table';
import { InlineCode } from '../../components/inline-code';
import { CodeList, exampleSection } from './example-list';

const TEXT = 'text-body-large text-on-surface-variant';
const LIST = `flex flex-col gap-2 ps-5 ${TEXT} [&>li]:list-disc`;
const HEADING = 'text-headline-small text-on-surface';
const SECTION = 'flex flex-col gap-3';

const SLOTS = [
  'root',
  'panel',
  'sheet',
  'scroller',
  'page',
  'header',
  'back',
  'title',
  'divider',
  'list',
  'row',
  'rowIcon',
  'rowLabel',
  'rowDescription',
  'rowBadge',
  'rowValue',
  'rowArrow',
  'check',
  'switch',
  'speed',
  'speedValue',
  'slider',
  'slower',
  'faster',
  'presets',
  'preset',
  'presetLeading',
  'presetCaption',
];

/** VideoPlayerSettings page body: examples, the rows, pages, the sheet and tokens. */
export async function VideoPlayerSettingsBody(): Promise<ComponentDoc> {
  const overview = await exampleSection([
    {
      title: "In the player's slot, with a Quality row",
      file: 'video-player-settings/video-player-settings-slot',
      name: 'VideoPlayerSettingsSlot',
    },
    {
      title: 'Alone, with every kind of row',
      file: 'video-player-settings/video-player-settings-alone',
      name: 'VideoPlayerSettingsAlone',
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
            The settings of a video player: a small panel that opens inside the player, over the
            picture, at its end corner. Its first page is a short list of rows, each with what is
            chosen (&ldquo;Quality &nbsp;Auto (720p) ›&rdquo;); a row&apos;s page takes the
            panel&apos;s place under a header that goes back, and the panel grows or shrinks to each
            page from its corner. On a phone the same pages are a bottom sheet.
          </p>
          <p className={TEXT}>
            M3&apos;s menus open submenus beside the item, hold only menu items, sit against their
            trigger and are modal; this panel holds a page that isn&apos;t a menu, rows with a
            value, a second line and a badge, sits at its element&apos;s corner whatever opened it,
            and leaves the video playing. For a menu of actions, use the core{' '}
            <InlineCode>Menu</InlineCode>.
          </p>
        </section>
        <section className={SECTION}>
          <h2 id="in-a-player" className={HEADING}>
            In a player, or alone
          </h2>
          <ul className={LIST}>
            <li>
              In a <InlineCode>VideoPlayer</InlineCode>&apos;s <InlineCode>settings</InlineCode>{' '}
              slot nothing else is written: the player draws the Settings button (a gear that turns
              as it opens, with <InlineCode>settingsBadge</InlineCode> on it), and gives the corner,
              the insets and the most height. With no rows of its own, the panel draws Playback
              speed, Captions and Loop from the player, and Autoplay and Rotate where the bar has no
              room for them; your rows go after them, and{' '}
              <InlineCode>defaultRows=&#123;false&#125;</InlineCode> drops them. Quality is always
              yours.
            </li>
            <li>
              Alone, <InlineCode>VideoPlayerSettingsTrigger</InlineCode> takes your button first,
              then the settings, and gives the button <InlineCode>aria-haspopup</InlineCode>,{' '}
              <InlineCode>aria-expanded</InlineCode>, <InlineCode>aria-controls</InlineCode> and{' '}
              <InlineCode>data-open</InlineCode>. The panel opens in the positioned element you name
              (<InlineCode>container</InlineCode>), at a corner (<InlineCode>placement</InlineCode>,{' '}
              <InlineCode>bottom-end</InlineCode> by default), and keeps its own dark scope.
            </li>
          </ul>
        </section>
        <section className={SECTION}>
          <h2 id="rows-and-pages" className={HEADING}>
            Rows and pages
          </h2>
          <ul className={LIST}>
            <li>
              <InlineCode>VideoPlayerSettingsItem</InlineCode>: an action (
              <InlineCode>onAction</InlineCode>), closing the panel unless{' '}
              <InlineCode>closeOnAction=&#123;false&#125;</InlineCode>.
            </li>
            <li>
              <InlineCode>VideoPlayerSettingsSwitch</InlineCode>: a switch at the row&apos;s end,
              switching in place (<InlineCode>selected</InlineCode>,{' '}
              <InlineCode>onChange</InlineCode>).
            </li>
            <li>
              <InlineCode>VideoPlayerSettingsChoice</InlineCode>: a page of one choice from{' '}
              <InlineCode>options</InlineCode> (each with a label, a second line, a badge or
              disabled), the chosen one ticked. A choice closes the panel at once and hands focus
              back to the button; <InlineCode>afterSelect=&quot;back&quot;</InlineCode> goes back
              instead. <InlineCode>valueLabel</InlineCode> shows a value other than the
              option&apos;s label (&ldquo;Auto (720p)&rdquo;).
            </li>
            <li>
              <InlineCode>VideoPlayerSettingsSpeed</InlineCode>: the speed page, with the speed in
              large figures, a thin slider between Slower and Faster, and a row of common speeds (1,
              1.25, 1.5 and 2 by default, &ldquo;Normal&rdquo; under 1). A speed between two presets
              selects none. A preset can carry a caption and a mark before its figure; a disabled
              one doesn&apos;t change the speed and calls <InlineCode>onPresetPress</InlineCode>,
              for a speed behind a subscription. <InlineCode>label</InlineCode> renames the row;{' '}
              <InlineCode>formatValue</InlineCode> and <InlineCode>labels.presetValue</InlineCode>{' '}
              write the speed and a preset&apos;s figure.
            </li>
            <li>
              <InlineCode>VideoPlayerSettingsPage</InlineCode>: a page of your own content under the
              same header.
            </li>
            <li>
              Every row takes an <InlineCode>icon</InlineCode>, a <InlineCode>label</InlineCode>, a{' '}
              <InlineCode>value</InlineCode>, a <InlineCode>description</InlineCode> and a{' '}
              <InlineCode>badge</InlineCode>; its <InlineCode>id</InlineCode> names its page for{' '}
              <InlineCode>page</InlineCode> and <InlineCode>onPageChange</InlineCode>. A row hidden
              by CSS is skipped by the keys, and a page opens on its first row that shows.
            </li>
            <li>
              Going back: the header, Escape, or the arrow key pointing back returns to the first
              page, focus on the row the page was opened from. Escape on the first page closes it.
            </li>
          </ul>
        </section>
        <section className={SECTION}>
          <h2 id="behaviour" className={HEADING}>
            Behaviour
          </h2>
          <ul className={LIST}>
            <li>
              It isn&apos;t modal: no scrim, no focus trap, no scroll lock. The video plays on and
              the scrubber stays live. A press outside the panel closes it and does nothing else to
              what is under it in the player; a press on another control closes it and that control
              acts. Tab past its last control closes it too.
            </li>
            <li>
              It keeps its corner and its width (320px, never wider than its element less its
              insets) from page to page; only its height changes, from its anchored edge, and a page
              taller than the room scrolls inside. In full screen and theater it sits at the same
              corner of the larger player.
            </li>
            <li>
              Keys pressed inside are its own: none reach the player, so K, M, F and the digits
              don&apos;t act on the video while it is open.
            </li>
            <li>
              Under 600px of window (<InlineCode>presentation=&quot;auto&quot;</InlineCode>, decided
              as it opens) the same pages are a core <InlineCode>BottomSheet</InlineCode> in the
              theme&apos;s colours, with M3&apos;s touch sizes on the speed page; a window crossing
              600px while open closes it. <InlineCode>panel</InlineCode> and{' '}
              <InlineCode>sheet</InlineCode> pick one.
            </li>
            <li>
              It opens and closes with a 50ms fade; pages slide a full width in 150ms as the height
              follows; a choice closes it at once. Under reduced motion only the fade stays.
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
          Set the tokens below on the settings or any ancestor. Its colours, fill, blur, state
          layers and focus ring default to the shared <InlineCode>--wm-on-media-*</InlineCode>{' '}
          tokens (on the Video player page), so one override reaches the player and its settings.
          The fill is 72% <InlineCode>scrim</InlineCode> and the quieter text 88%, the least that
          keep every word at 4.5:1 over a white frame, a selected preset&apos;s label included; the
          blur is extra, and under reduced transparency the fill is opaque. The speed&apos;s slider
          takes the <InlineCode>--wm-media-slider-*</InlineCode> tokens, and the sheet the core
          sheet&apos;s. The panel carries <InlineCode>data-open</InlineCode> while open.{' '}
          <InlineCode>className</InlineCode> goes on the panel; style each part with{' '}
          <InlineCode>classNames</InlineCode>: <CodeList names={SLOTS} />.
        </p>
        <TokenTable set={videoPlayerSettingsTokenSet} caption="VideoPlayerSettings tokens" />
      </section>
    ),
  };
}
