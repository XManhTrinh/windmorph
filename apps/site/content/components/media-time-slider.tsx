import type { ComponentDoc } from './doc';
import { mediaTimeSliderTokenSet } from '@windmorph/react-pro';
import { TokenTable } from '../../components/token-table';
import { InlineCode } from '../../components/inline-code';
import { CodeList, exampleSection } from './example-list';

const TEXT = 'text-body-large text-on-surface-variant';
const LIST = `flex flex-col gap-2 ps-5 ${TEXT} [&>li]:list-disc`;
const HEADING = 'text-headline-small text-on-surface';
const SECTION = 'flex flex-col gap-3';

const SLOTS = ['root', 'track', 'buffered', 'played', 'thumb', 'bubble'];

/** MediaTimeSlider page body: examples, when to use it, behaviour, parts and tokens. */
export async function MediaTimeSliderBody(): Promise<ComponentDoc> {
  const overview = await exampleSection([
    {
      title: "A player's controls",
      file: 'media-time-slider/media-time-slider-player',
      name: 'MediaTimeSliderPlayer',
    },
    {
      title: 'Loaded ranges, an hour-long media, and a length not known yet',
      file: 'media-time-slider/media-time-slider-states',
      name: 'MediaTimeSliderStates',
    },
    {
      title: 'Over a video',
      file: 'media-time-slider/media-time-slider-video',
      name: 'MediaTimeSliderVideo',
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
            The position bar of a video or audio player: where playback is, how much has loaded, and
            a way to move through it by pointer, touch and keyboard. It is a slider in seconds,
            named after the part the leading web players call a time slider.
          </p>
          <p className={TEXT}>
            M3 has no media components, and its <InlineCode>Slider</InlineCode> is a form control
            with tracks from 16px, so this one follows M3&apos;s colour roles, shapes and springs
            instead of a spec. To choose a number or a volume, use a <InlineCode>Slider</InlineCode>
            ; for progress the person can&apos;t move, a Progress indicator.
          </p>
        </section>
        <section className={SECTION}>
          <h2 id="behaviour" className={HEADING}>
            Behaviour
          </h2>
          <ul className={LIST}>
            <li>
              A 4px bar that grows to 8px, showing its handle, under the pointer, while dragged or
              keyboard-focused. The played part is <InlineCode>primary</InlineCode>; the loaded
              parts sit behind it.
            </li>
            <li>
              <InlineCode>duration</InlineCode>, <InlineCode>value</InlineCode> and{' '}
              <InlineCode>buffered</InlineCode> are in seconds. <InlineCode>buffered</InlineCode>{' '}
              takes an end time (loaded from the start), <InlineCode>[start, end]</InlineCode>{' '}
              ranges, or a media element&apos;s <InlineCode>buffered</InlineCode> as it is.
            </li>
            <li>
              <InlineCode>onChange</InlineCode> follows every move of a drag;{' '}
              <InlineCode>onChangeEnd</InlineCode> comes when the drag ends or a key moves it: the
              moment to seek. While dragged, and after a seek until <InlineCode>value</InlineCode>{' '}
              lands within a second of where it was put (two seconds at most, for a seek the player
              refused), it shows where it was put, so the player&apos;s time updates neither fight a
              drag nor pull the handle back before the seek lands. A change of{' '}
              <InlineCode>duration</InlineCode> lets a held seek go, never a drag, and so does a
              form reset; give the slider a new <InlineCode>key</InlineCode> (the media&apos;s
              address, say) when it shows new media.
            </li>
            <li>
              A screen reader&apos;s step (one step of the native input, as VoiceOver&apos;s swipe
              up or down) moves <InlineCode>step</InlineCode> seconds and seeks, as a key does.
              While the slider has focus, the value screen readers read stays where the person last
              put it, so playback doesn&apos;t make it speak every second; it refreshes on each key,
              step or drag, and follows playback again once focus leaves. The handle on screen keeps
              moving.
            </li>
            <li>
              A bubble shows the time under the pointer before a press, and the handle&apos;s time
              while it moves or has keyboard focus. It is <InlineCode>m:ss</InlineCode>, or{' '}
              <InlineCode>h:mm:ss</InlineCode> for an hour or longer, in the locale&apos;s digits;{' '}
              <InlineCode>formatTime</InlineCode> writes your own. It shows above the bar, outside
              the slider&apos;s box, so leave about 40px above it.
            </li>
            <li>
              A touch waits to tell a tap, a drag and a scroll apart, as the core{' '}
              <InlineCode>Slider</InlineCode> does: a tap seeks as the finger lifts, a drag starts
              after 8px along the bar, and a swipe across it scrolls the page.
            </li>
            <li>
              Until the length is known (<InlineCode>duration</InlineCode>{' '}
              <InlineCode>0</InlineCode> or <InlineCode>NaN</InlineCode>, as a media element&apos;s
              before its metadata loads), and with <InlineCode>Infinity</InlineCode>, a live
              stream&apos;s, it can&apos;t be moved: it is marked{' '}
              <InlineCode>aria-disabled</InlineCode>, reads{' '}
              <InlineCode>labels.unknownLength</InlineCode> and leaves the Tab order, but focus
              already on it stays as the next media loads. <InlineCode>disabled</InlineCode> turns
              it off fully.
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
          Set the tokens below on the slider or any ancestor; over a video, a dark{' '}
          <InlineCode>ThemeScope</InlineCode> round the controls is usually all it needs. The bubble
          is the core&apos;s plain tooltip, themed by its own{' '}
          <InlineCode>--md-comp-plain-tooltip-*</InlineCode> tokens.{' '}
          <InlineCode>className</InlineCode> goes on the root, the 48px target; style each part with{' '}
          <InlineCode>classNames</InlineCode>: <CodeList names={SLOTS} />.
        </p>
        <TokenTable set={mediaTimeSliderTokenSet} caption="MediaTimeSlider tokens" />
      </section>
    ),
  };
}
