import type { ComponentDoc } from './doc';
import { mediaSliderTokenSet, onMediaTokenSet, videoPlayerTokenSet } from '@windmorph/react-pro';
import { TokenTable } from '../../components/token-table';
import { InlineCode } from '../../components/inline-code';
import { CodeList, exampleSection } from './example-list';

const TEXT = 'text-body-large text-on-surface-variant';
const LIST = `flex flex-col gap-2 ps-5 ${TEXT} [&>li]:list-disc`;
const HEADING = 'text-headline-small text-on-surface';
const SECTION = 'flex flex-col gap-3';

const SLOTS = [
  'root',
  'video',
  'poster',
  'middle',
  'mark',
  'notice',
  'controls',
  'scrubber',
  'bar',
  'container',
  'control',
  'time',
  'captions',
  'bars',
  'volume',
  'sound',
  'resumed',
  'ended',
];

/** VideoPlayer page body: examples, behaviour, options, the source, its parts and tokens. */
export async function VideoPlayerBody(): Promise<ComponentDoc> {
  const overview = await exampleSection([
    {
      title: 'With nothing set',
      file: 'video-player/video-player-basic',
      name: 'VideoPlayerBasic',
    },
    {
      title: 'Captions, chapters, Next, Rotate, Autoplay and Theater',
      file: 'video-player/video-player-controls',
      name: 'VideoPlayerControls',
    },
    {
      title: 'The scrim look, a control of your own and the end',
      file: 'video-player/video-player-look',
      name: 'VideoPlayerLook',
    },
    {
      title: 'A stream an engine drives',
      file: 'video-player/video-player-engine',
      name: 'VideoPlayerEngine',
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
            A video player that is complete with nothing set: its own controls, keys, touch gestures
            and states, over any <InlineCode>&lt;video&gt;</InlineCode>, a plain file or a stream an
            engine drives. It is drawn in the theme&apos;s colour roles, shapes, type and springs,
            built from the core&apos;s icon buttons, tooltips and loading indicator and Pro&apos;s{' '}
            <InlineCode>MediaTimeSlider</InlineCode>.
          </p>
          <p className={TEXT}>
            M3 has no video player. For a scrubber alone (an audio player of your own), use the{' '}
            <InlineCode>MediaTimeSlider</InlineCode>; for a video&apos;s length on a card, the{' '}
            <InlineCode>DurationTag</InlineCode>.
          </p>
        </section>
        <section className={SECTION}>
          <h2 id="states" className={HEADING}>
            States
          </h2>
          <ul className={LIST}>
            <li>
              Before anything is asked for, the poster shows with Play in the middle, and nothing of
              the video is downloaded: the source is set on the{' '}
              <InlineCode>&lt;video&gt;</InlineCode> only when Play is first pressed.{' '}
              <InlineCode>posterLoading=&quot;eager&quot;</InlineCode> loads a page&apos;s main
              poster at once.
            </li>
            <li>
              Loading and buffering keep the picture and show the waiting mark after 500ms. Paused,
              the controls stay; playing, they go after 2.6 seconds without the pointer moving.
            </li>
            <li>
              Ended shows Replay in the middle and on the bar, or your{' '}
              <InlineCode>ended</InlineCode> content in the middle with Replay on the bar.
            </li>
            <li>
              Failed shows &ldquo;Couldn&apos;t load video&rdquo; with Try again, which reloads and
              plays from the same place. Offline while buffering, it says so and carries on when the
              connection is back. Both are said at once.
            </li>
            <li>
              Where the browser won&apos;t start a video with sound by itself, it starts muted with
              &ldquo;Turn sound on&rdquo; at the top start. Given{' '}
              <InlineCode>resumeFrom</InlineCode>, it starts there and says &ldquo;Resumed from
              12:34&rdquo; with Start over, until 8 seconds have played.
            </li>
            <li>
              One video plays at a time on a page: starting one pauses the one before. A new source
              keeps the place, the playing and the last frame.
            </li>
            <li>
              The root carries <InlineCode>data-state</InlineCode> (<InlineCode>poster</InlineCode>,{' '}
              <InlineCode>loading</InlineCode>, <InlineCode>buffering</InlineCode>,{' '}
              <InlineCode>playing</InlineCode>, <InlineCode>paused</InlineCode>,{' '}
              <InlineCode>ended</InlineCode>, <InlineCode>failed</InlineCode>,{' '}
              <InlineCode>offline</InlineCode>), <InlineCode>data-controls-shown</InlineCode>,{' '}
              <InlineCode>data-look</InlineCode>, <InlineCode>data-theater</InlineCode>,{' '}
              <InlineCode>data-fullscreen</InlineCode>, <InlineCode>data-pip</InlineCode> and{' '}
              <InlineCode>data-settings-open</InlineCode>.
            </li>
          </ul>
        </section>
        <section className={SECTION}>
          <h2 id="pointer-and-touch" className={HEADING}>
            Pointer and touch
          </h2>
          <ul className={LIST}>
            <li>
              The controls come when the pointer moves over the picture and go when it leaves; they
              stay while keyboard focus is among them, while the settings are open, while the
              scrubber or the volume is dragged, and while the video isn&apos;t playing. Hidden,
              they stay in the tab order, and focus arriving by keyboard shows them.
            </li>
            <li>
              A mouse click on the picture plays or pauses; a double click toggles full screen.
            </li>
            <li>
              A tap shows the controls, or hides them over a playing video. Two taps within 300ms on
              the left third go back 10 seconds, on the right third forward 10.
            </li>
            <li>
              Full screen takes the whole frame, controls and captions included; a phone without
              element full screen uses the video&apos;s own player. Picture-in-picture shows where
              the browser has it, from a 30rem player. A button the browser can&apos;t do keeps its
              place, invisible, so nothing under the pointer moves.
            </li>
          </ul>
        </section>
        <section className={SECTION}>
          <h2 id="options" className={HEADING}>
            Options
          </h2>
          <ul className={LIST}>
            <li>
              <InlineCode>captions</InlineCode> (WebVTT tracks): a Captions button and C. The player
              draws the lines itself, as plain text (cue markup is stripped), and names each track
              in the reader&apos;s language from its code. C turns on the track last chosen, then
              the page&apos;s language, then the first. In picture-in-picture and a phone&apos;s own
              full screen the browser draws the chosen track.
            </li>
            <li>
              <InlineCode>chapters</InlineCode> split the scrubber, each segment&apos;s title in the
              bubble over the time.
            </li>
            <li>
              <InlineCode>onNext</InlineCode> adds Next beside Play (Shift+N);{' '}
              <InlineCode>rotatable</InlineCode> adds Rotate (R, Shift+R back), turning only the
              picture a quarter at a time; <InlineCode>onAutoplayNextChange</InlineCode> adds the
              Autoplay switch, which the player only shows and reports;{' '}
              <InlineCode>onTheaterChange</InlineCode> adds Theater (T) from{' '}
              <InlineCode>theaterFrom</InlineCode>, with the page&apos;s layout left to you.
            </li>
            <li>
              <InlineCode>playbackRates</InlineCode> are the speeds &lt; and &gt; step through,{' '}
              <InlineCode>loop</InlineCode> the <InlineCode>&lt;video&gt;</InlineCode>&apos;s own
              loop. Every state takes the controlled and uncontrolled pair (
              <InlineCode>loop</InlineCode>, <InlineCode>defaultLoop</InlineCode>,{' '}
              <InlineCode>onLoopChange</InlineCode>), <InlineCode>volume</InlineCode> and{' '}
              <InlineCode>muted</InlineCode> too; a mute the browser forced is never reported as the
              person&apos;s.
            </li>
            <li>
              <InlineCode>playerRef</InlineCode> hands you a{' '}
              <InlineCode>VideoPlayerHandle</InlineCode> with <InlineCode>play</InlineCode>,{' '}
              <InlineCode>pause</InlineCode>, <InlineCode>seek(seconds)</InlineCode>,{' '}
              <InlineCode>toggleFullScreen</InlineCode> and{' '}
              <InlineCode>togglePictureInPicture</InlineCode> (the last two only inside a press or
              key handler). <InlineCode>posterDelay</InlineCode> holds the poster back where a
              player follows another, so it never flashes between the two.
            </li>
            <li>
              <InlineCode>settings</InlineCode> takes a <InlineCode>VideoPlayerSettings</InlineCode>
              : a Settings button joins the bar after Captions, and its panel opens over the
              picture. On a narrow player, Autoplay and Rotate move from the bar into it.
            </li>
            <li>
              <InlineCode>inView</InlineCode>, for a feed: <InlineCode>pause</InlineCode> pauses it
              when less than 60% is in view or <InlineCode>covered</InlineCode>;{' '}
              <InlineCode>play</InlineCode> also starts it, muted, while in view (never under
              reduced motion, nor after the person paused it).
            </li>
            <li>
              <InlineCode>look=&quot;scrim&quot;</InlineCode> draws bare controls over a gradient at
              the foot, in place of a see-through container per group (
              <InlineCode>grouped</InlineCode>, the default).
            </li>
          </ul>
        </section>
        <section className={SECTION}>
          <h2 id="the-source" className={HEADING}>
            The source
          </h2>
          <p className={TEXT}>
            <InlineCode>source</InlineCode> is a URL the browser plays itself, or an engine&apos;s{' '}
            <InlineCode>&#123; attach(video) &#125;</InlineCode> returning what detaches it, called
            at the moment playback is first asked for. The player reads only the media
            element&apos;s standard state and events, so any streaming library fits behind{' '}
            <InlineCode>attach</InlineCode>, and none is a dependency.{' '}
            <InlineCode>videoRef</InlineCode> hands you the element, and{' '}
            <InlineCode>videoProps</InlineCode> passes attributes such as{' '}
            <InlineCode>crossOrigin</InlineCode>.
          </p>
        </section>
        <section className={SECTION}>
          <h2 id="parts" className={HEADING}>
            Parts
          </h2>
          <ul className={LIST}>
            <li>
              <InlineCode>VideoPlayerControl</InlineCode>: a button on the bar in the player&apos;s
              look, with a tooltip above it; <InlineCode>shortcut</InlineCode> shows a key in the
              tooltip and gives it as <InlineCode>aria-keyshortcuts</InlineCode>;{' '}
              <InlineCode>toggle</InlineCode> makes it an on and off control (
              <InlineCode>selected</InlineCode>, <InlineCode>onSelectedChange</InlineCode>,{' '}
              <InlineCode>selectedIcon</InlineCode>, <InlineCode>defaultSelected</InlineCode>);{' '}
              <InlineCode>badge</InlineCode> puts a mark over its icon, hidden from assistive tech.
              Its shortcut works while focus is anywhere in the player. Pass yours in{' '}
              <InlineCode>controls</InlineCode>.
            </li>
            <li>
              <InlineCode>VideoPlayerControlGroup</InlineCode>, a see-through container of controls;{' '}
              <InlineCode>VideoPlayerVolume</InlineCode>, the mute button with its thin slider; and{' '}
              <InlineCode>VideoPlayerNotice</InlineCode>, a notice over the frame, also for a frame
              shown without a player (&ldquo;Still processing&rdquo;).
            </li>
            <li>
              <InlineCode>useVideoPlayer()</InlineCode>, inside the player: its state (playing,
              time, length, what has loaded, volume, speed, loop, rotation, Autoplay, captions,
              theater, full screen, picture-in-picture, and its width class:{' '}
              <InlineCode>compact</InlineCode> under 30rem, <InlineCode>medium</InlineCode> to
              42rem, <InlineCode>expanded</InlineCode> beyond) and actions (
              <InlineCode>play</InlineCode>, <InlineCode>pause</InlineCode>,{' '}
              <InlineCode>seek</InlineCode>, <InlineCode>setVolume</InlineCode>,{' '}
              <InlineCode>setRate</InlineCode>…), for a control of your own.
            </li>
            <li>
              <InlineCode>MediaSlider</InlineCode>: the thin value slider the volume and the
              settings&apos; speed use, in the same look as the scrubber, for a value of your own
              over a picture.
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
          The controls are in a dark scope over the picture in every theme. Their colours,
          see-through fill, blur, state layers and the two-tone focus ring are the shared{' '}
          <InlineCode>--wm-on-media-*</InlineCode> tokens below, which the settings panel and the
          side arrows of <InlineCode>FeaturedCarousel</InlineCode> and{' '}
          <InlineCode>Shelf</InlineCode> read too, so one override reaches all of them. Under
          reduced transparency, or without <InlineCode>backdrop-filter</InlineCode>, the fill is the
          fallback colour without the blur. The player&apos;s own{' '}
          <InlineCode>--wm-video-player-*</InlineCode> tokens set its sizes, insets and timing; its
          scrubber takes the <InlineCode>--wm-media-time-slider-*</InlineCode> tokens.{' '}
          <InlineCode>className</InlineCode> goes on the frame (its size and corners); style each
          part with <InlineCode>classNames</InlineCode>: <CodeList names={SLOTS} />.
        </p>
        <TokenTable set={videoPlayerTokenSet} caption="VideoPlayer tokens" />
        <TokenTable set={onMediaTokenSet} caption="On-media tokens (shared)" />
        <TokenTable set={mediaSliderTokenSet} caption="MediaSlider tokens" />
      </section>
    ),
  };
}
