import type { ComponentDoc } from './doc';
import { durationTagTokenSet, mediaFrameTokenSet } from '@windmorph/react-pro';
import { TokenTable } from '../../components/token-table';
import { InlineCode } from '../../components/inline-code';
import { CodeList, exampleSection } from './example-list';

const TEXT = 'text-body-large text-on-surface-variant';
const LIST = `flex flex-col gap-2 ps-5 ${TEXT} [&>li]:list-disc`;
const HEADING = 'text-headline-small text-on-surface';
const SECTION = 'flex flex-col gap-3';

const SLOTS = ['root', 'label', 'clock'];

/** DurationTag page body: examples, when to use it, behaviour, the frame and tokens. */
export async function DurationTagBody(): Promise<ComponentDoc> {
  const overview = await exampleSection([
    {
      title: 'Cards that are links',
      file: 'duration-tag/duration-tag-card',
      name: 'DurationTagCard',
    },
    {
      title: 'Raised, corners, a rounder frame and your own words',
      file: 'duration-tag/duration-tag-options',
      name: 'DurationTagOptions',
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
            A video&apos;s length in the corner of its picture (&ldquo;4:12&rdquo;), on a card, a
            list row or a search result. It is light on a dark, see-through ground in every theme
            and mode, so it reads over any picture, and it has no role and no focus: inside a link,
            it becomes part of the link&apos;s name.
          </p>
          <p className={TEXT}>
            M3 has no such tag; the core list&apos;s video item draws the same look for its own
            length. For a count or a status on an icon, use a <InlineCode>Badge</InlineCode>; for a
            label a person can act on, a <InlineCode>Tag</InlineCode> or a chip.
          </p>
        </section>
        <section className={SECTION}>
          <h2 id="behaviour" className={HEADING}>
            Behaviour
          </h2>
          <ul className={LIST}>
            <li>
              <InlineCode>duration</InlineCode> is in seconds, rounded down to whole seconds:{' '}
              <InlineCode>m:ss</InlineCode>, or <InlineCode>h:mm:ss</InlineCode> for an hour or
              more, under a second <InlineCode>0:00</InlineCode>. A length that isn&apos;t a finite
              number, or is negative, draws nothing.
            </li>
            <li>
              Screen readers get one text in words, in the page&apos;s language (&ldquo;Length 4
              minutes, 12 seconds&rdquo;), visually hidden; the clock is hidden from them.{' '}
              <InlineCode>label</InlineCode> replaces those words,{' '}
              <InlineCode>labels.length</InlineCode> translates &ldquo;Length&rdquo;, and{' '}
              <InlineCode>formatDuration</InlineCode> replaces the clock. The core&apos;s{' '}
              <InlineCode>formatClock</InlineCode> and <InlineCode>formatDurationWords</InlineCode>,
              in <InlineCode>@windmorph/react/primitives</InlineCode>, write a length the same way
              in a sentence of your own.
            </li>
            <li>
              The whole clock always shows: larger text grows the tag, and on a narrow picture it
              may run past the corner&apos;s inset, never past the frame. It reads left to right in
              every language, and its corner follows the page&apos;s direction.
            </li>
            <li>
              It looks the same in light and dark mode and at every contrast level, and nothing
              changes when the card around it is hovered, focused or pressed. It has no motion.
            </li>
          </ul>
        </section>
        <section className={SECTION}>
          <h2 id="the-frame" className={HEADING}>
            The frame
          </h2>
          <p className={TEXT}>
            <InlineCode>MediaFrame</InlineCode> is a one-cell grid that clips to its corner: the
            picture and everything over it share the cell, so nothing is positioned. Put the picture
            first and the tag last. <InlineCode>ratio</InlineCode> gives it a shape; left out, its
            size is yours. It is a <InlineCode>span</InlineCode>, so it can sit inside a link. It
            works out how far in the tag must sit to clear its corner (4px for corners up to 17px,
            8px at 28px), from <InlineCode>--wm-media-frame-corner</InlineCode>, so change its
            corner with that token rather than a class.
          </p>
          <p className={TEXT}>
            In a frame of your own, make it a one-cell grid (
            <InlineCode>grid *:[grid-area:1/1]</InlineCode>) and the tag finds its corner, or pass{' '}
            <InlineCode>placement=&quot;none&quot;</InlineCode> and place it yourself.
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
          Set the tokens below on the tag, its frame or any ancestor. The clock&apos;s colour is the
          theme&apos;s light neutral in both modes (
          <InlineCode>light-dark(surface, on-surface)</InlineCode>), on{' '}
          <InlineCode>scrim</InlineCode> at 72%, which keeps 4.5:1 over a white picture in every
          theme and contrast level. <InlineCode>className</InlineCode> goes on the tag; style each
          part with <InlineCode>classNames</InlineCode>: <CodeList names={SLOTS} />.
        </p>
        <TokenTable set={durationTagTokenSet} caption="DurationTag tokens" />
        <TokenTable set={mediaFrameTokenSet} caption="MediaFrame tokens" />
      </section>
    ),
  };
}
