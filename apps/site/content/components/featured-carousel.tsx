import type { ComponentDoc } from './doc';
import { featuredCarouselTokenSet, sideArrowTokenSet } from '@windmorph/react-pro';
import { TokenTable } from '../../components/token-table';
import { InlineCode } from '../../components/inline-code';
import { CodeList, exampleSection } from './example-list';

const TEXT = 'text-body-large text-on-surface-variant';
const LIST = `flex flex-col gap-2 ps-5 ${TEXT} [&>li]:list-disc`;
const HEADING = 'text-headline-small text-on-surface';
const SECTION = 'flex flex-col gap-3';

const SLOTS = [
  'root',
  'frame',
  'viewport',
  'slide',
  'previous',
  'next',
  'foot',
  'indicator',
  'dot',
  'progress',
  'count',
  'pause',
];

/** FeaturedCarousel page body: examples, when to use it, behaviour, the timer and tokens. */
export async function FeaturedCarouselBody(): Promise<ComponentDoc> {
  const overview = await exampleSection([
    {
      title: 'Slides with a link and two buttons',
      file: 'featured-carousel/featured-carousel-slides',
      name: 'FeaturedCarouselSlides',
    },
    {
      title: 'Moving by itself, with a video in a slide',
      file: 'featured-carousel/featured-carousel-auto',
      name: 'FeaturedCarouselAuto',
    },
    {
      title: 'Loading and failed',
      file: 'featured-carousel/featured-carousel-loading',
      name: 'FeaturedCarouselLoading',
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
            The large carousel at the top of a media or store page: one slide in front, whole slides
            beside it set back and peeking in, moved by a swipe, by arrows at its sides or by the
            keyboard, and able to move by itself within what WCAG 2.2.2 allows. A slide holds
            anything: a picture, words, links, buttons, a video.
          </p>
          <p className={TEXT}>
            M3&apos;s carousel doesn&apos;t move by itself and has no Previous and Next, no
            indicator and no controls inside an item, so this is a Pro component. Use the core{' '}
            <InlineCode>Carousel</InlineCode> for M3&apos;s browsing row of pictures; a{' '}
            <InlineCode>Shelf</InlineCode> for a row of cards; a{' '}
            <InlineCode>MediaViewer</InlineCode> to look through photos full screen.
          </p>
        </section>
        <section className={SECTION}>
          <h2 id="behaviour" className={HEADING}>
            Behaviour
          </h2>
          <ul className={LIST}>
            <li>
              Its layout follows its own width: under 600px a slide is 88% wide at 4:5; to 840px,
              90% wide and at least 448px tall; from 840px, 16:9, at most 70% of the window&apos;s
              height. Heights are least heights, so longer words lengthen a slide. The first slide
              stands at the start edge, the last at the end edge, the others centred.
            </li>
            <li>
              The current slide is the one showing most of itself, measured on each scroll frame, so
              size and brightness hand over during a move. It carries{' '}
              <InlineCode>data-current</InlineCode>; every other slide is{' '}
              <InlineCode>inert</InlineCode>. When a slide stops being current with focus inside it,
              focus moves first to the arriving slide.
            </li>
            <li>
              By hand: a swipe or a trackpad (native scrolling, snapping to a slide); a press
              anywhere beside the current slide brings that side&apos;s slide forward; Previous and
              Next at the sides for a mouse, at any width; and Left and Right while the pointer is
              over it or focus is in it (left to anything with arrow keys of its own). Without a
              mouse, a visually hidden pair of buttons beside the dots shows on keyboard focus. It
              goes round by default; with <InlineCode>loop=&#123;false&#125;</InlineCode> the arrow
              that leads nowhere is dimmed and <InlineCode>aria-disabled</InlineCode>. A second
              press during a move goes on from where the first was heading.
            </li>
            <li>
              <InlineCode>onIndexChange</InlineCode> reports each new slide with what moved it:{' '}
              <InlineCode>person</InlineCode>, <InlineCode>timer</InlineCode> or{' '}
              <InlineCode>app</InlineCode>. An <InlineCode>index</InlineCode> you set moves it
              without an announcement and without stopping the timer.
            </li>
            <li>
              Under the slides, dots say how many there are, the current one wider (not buttons:
              hidden from assistive tech); past <InlineCode>maxDots</InlineCode> (20) a count
              (&ldquo;3 of 30&rdquo;) takes their place. One slide has no arrows, no dots and no
              timer; no slides draw nothing.
            </li>
          </ul>
        </section>
        <section className={SECTION}>
          <h2 id="moving-by-itself" className={HEADING}>
            Moving by itself
          </h2>
          <ul className={LIST}>
            <li>
              Off unless you pass <InlineCode>autoAdvance</InlineCode> (7 seconds a slide, or{' '}
              <InlineCode>&#123; interval &#125;</InlineCode>). The current dot fills over the
              slide&apos;s time.
            </li>
            <li>
              It waits, and goes on from where it was, while a mouse is over the slides, while less
              than half of it is in view, while the tab is hidden, and while a slide holds it.
            </li>
            <li>
              The slides stop moving by themselves when keyboard focus comes in and when the person
              moves them by any means; media in the slide they went to plays on. The Pause control,
              first in the Tab order though drawn under the slides, stops everything that moves by
              itself, media in a slide included, until Play (<InlineCode>paused</InlineCode> and{' '}
              <InlineCode>onPausedChange</InlineCode> are that control&apos;s state).
            </li>
            <li>
              A slide that plays something passes <InlineCode>media</InlineCode> and reads{' '}
              <InlineCode>useFeaturedCarouselSlide()</InlineCode>: <InlineCode>mayMove</InlineCode>{' '}
              says whether it may play, <InlineCode>hold()</InlineCode> holds the timer while it
              does, and <InlineCode>next()</InlineCode> moves the carousel on when it ends.
            </li>
            <li>
              Under reduced motion it never moves by itself, media in a slide isn&apos;t told it may
              play, and the Pause control isn&apos;t there.
            </li>
          </ul>
        </section>
        <section className={SECTION}>
          <h2 id="loading" className={HEADING}>
            Loading and failed
          </h2>
          <p className={TEXT}>
            <InlineCode>FeaturedCarouselPlaceholder</InlineCode>, a server component, draws the
            carousel&apos;s frame, one slide&apos;s box by the same classes and the foot (
            <InlineCode>foot=&#123;false&#125;</InlineCode> leaves it out), with your content in the
            slide (<InlineCode>classNames.slide</InlineCode> styles it): a{' '}
            <InlineCode>Skeleton</InlineCode> while loading, a notice and Try again when it fails.
            Every slide is in the server&apos;s HTML, the first one current.
          </p>
        </section>
      </>
    ),
    api: (
      <section className={SECTION}>
        <h2 id="theming-and-tokens" className={HEADING}>
          Theming &amp; tokens
        </h2>
        <p className={TEXT}>
          Set the tokens below on the carousel or any ancestor.{' '}
          <InlineCode>--wm-featured-carousel-control-inset</InlineCode> is published for your slide
          content: the arrows&apos; distance from the edge, which the{' '}
          <InlineCode>wm-featured-carousel-content</InlineCode> utility uses as padding so words
          stay clear of them. The side arrows, shared with <InlineCode>Shelf</InlineCode>, take the{' '}
          <InlineCode>--wm-side-arrow-*</InlineCode> tokens below, and their colours, blur and focus
          ring the shared <InlineCode>--wm-on-media-*</InlineCode> ones on the Video player page.{' '}
          <InlineCode>className</InlineCode> and <InlineCode>aria-*</InlineCode> go on the root, the
          named region; style each part with <InlineCode>classNames</InlineCode>:{' '}
          <CodeList names={SLOTS} />.
        </p>
        <TokenTable set={featuredCarouselTokenSet} caption="FeaturedCarousel tokens" />
        <TokenTable set={sideArrowTokenSet} caption="Side arrow tokens (FeaturedCarousel, Shelf)" />
      </section>
    ),
  };
}
