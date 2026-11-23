import type { ComponentDoc } from './doc';
import { shelfTokenSet } from '@windmorph/react-pro';
import { TokenTable } from '../../components/token-table';
import { InlineCode } from '../../components/inline-code';
import { CodeList, exampleSection } from './example-list';

const TEXT = 'text-body-large text-on-surface-variant';
const LIST = `flex flex-col gap-2 ps-5 ${TEXT} [&>li]:list-disc`;
const HEADING = 'text-headline-small text-on-surface';
const SECTION = 'flex flex-col gap-3';

const SLOTS = ['root', 'list', 'item', 'previous', 'next'];

/** Shelf page body: examples, when to use it, behaviour, sizes and tokens. */
export async function ShelfBody(): Promise<ComponentDoc> {
  const overview = await exampleSection([
    { title: 'Wide cards', file: 'shelf/shelf-wide', name: 'ShelfWide' },
    { title: 'Tall cards', file: 'shelf/shelf-tall', name: 'ShelfTall' },
    { title: 'Loading', file: 'shelf/shelf-loading', name: 'ShelfLoading' },
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
            One row of your own cards that scrolls sideways, with part of the next card showing at
            its end to say there is more, and Previous and Next at its sides for a mouse. A page
            shows many sets of things (videos, products, people, articles) this way without each
            taking a whole grid. The cards are untouched: the shelf adds no fill, clipping or
            corners.
          </p>
          <p className={TEXT}>
            To screen readers it is a plain list, named by its heading, not a carousel. Use the core{' '}
            <InlineCode>Carousel</InlineCode> for M3&apos;s look, pictures that change size as they
            scroll; a <InlineCode>FeaturedCarousel</InlineCode> for one large slide at a time at the
            top of a page; a grid when every item must be seen at once.
          </p>
        </section>
        <section className={SECTION}>
          <h2 id="behaviour" className={HEADING}>
            Behaviour
          </h2>
          <ul className={LIST}>
            <li>
              One line at every width. The number of cards to a line follows the shelf&apos;s own
              width (a size container), never whole numbers, so part of a card always shows at the
              end: wide cards (<InlineCode>per=&quot;wide&quot;</InlineCode>, the default) 1.35
              under 600px, 3.15 to 840px, 4.15 to 1200px, 5.15 to 1600px and 6.15 beyond; tall cards
              (<InlineCode>per=&quot;tall&quot;</InlineCode>) 2.4, 4.6, 6.3, 7.3 and 9.3. Beside a
              navigation rail the shelf is narrower than the window, so it steps down a size earlier
              than the page does. <InlineCode>cardWidth</InlineCode> gives every card one CSS length
              instead, for cards that shouldn&apos;t grow.
            </li>
            <li>
              A swipe or a trackpad scrolls it natively, each scroll ending on a card&apos;s start;
              a fling may cross several. Tab moves card by card, bringing each wholly into view with
              its focus ring. Nothing moves by itself.
            </li>
            <li>
              With a mouse, at any width, Previous and Next fade in while the pointer is on the
              shelf or focus is in it. Each moves 85% of the row (<InlineCode>pageShare</InlineCode>
              , or the <InlineCode>--wm-shelf-page-share</InlineCode> token), then the snap lands on
              a card&apos;s start, so no card is passed over; under reduced motion it jumps. The one
              at an end is dimmed and <InlineCode>aria-disabled</InlineCode>, kept so focus on it
              isn&apos;t lost. On touch, and when every card fits, there are none.
            </li>
            <li>
              The arrows are centred on the row;{' '}
              <InlineCode>arrowsAlign=&quot;media&quot;</InlineCode> centres them on the element
              marked <InlineCode>data-shelf-media</InlineCode> in the first card (its picture),
              measured on each resize, and <InlineCode>--wm-side-arrow-offset</InlineCode> moves
              them by a length of your own.
            </li>
            <li>
              <InlineCode>onEndReached</InlineCode> is called when the row reaches its end, for an
              app that loads more.
            </li>
            <li>
              Compact shelves (under 600px) run to the edges, the first card resting 12px in and the
              cards scrolling over the padding. Every card is in the server&apos;s HTML, sized by
              CSS; the arrows appear once the row is measured.
            </li>
            <li>
              <InlineCode>ShelfPlaceholder</InlineCode>, a server component, lays out the same row
              without scrolling or arrows, for skeleton cards while the real ones load; nothing
              moves when they arrive.
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
          Set the tokens below on the shelf or any ancestor; set the{' '}
          <InlineCode>--wm-shelf-per-line-*</InlineCode> tokens for your own number of cards at each
          size. The default 8px gap and no let-out suit cards in general; cards that carry their own
          padding set <InlineCode>--wm-shelf-gap</InlineCode> and{' '}
          <InlineCode>--wm-shelf-let-out</InlineCode>. The arrows are the side arrows the{' '}
          <InlineCode>FeaturedCarousel</InlineCode> uses, themed by its{' '}
          <InlineCode>--wm-side-arrow-*</InlineCode> tokens and the shared{' '}
          <InlineCode>--wm-on-media-*</InlineCode> ones on the Video player page.{' '}
          <InlineCode>className</InlineCode> goes on the root and <InlineCode>aria-*</InlineCode> on
          the list; style each part with <InlineCode>classNames</InlineCode>:{' '}
          <CodeList names={SLOTS} />.
        </p>
        <TokenTable set={shelfTokenSet} caption="Shelf tokens" />
      </section>
    ),
  };
}
