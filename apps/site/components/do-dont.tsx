import type { DoDontCard, DoDontPair } from '../content/components/do-dont';
import { LazyExample } from './lazy-example';
import { CancelFilledIcon, CheckCircleFilledIcon } from './icons';
import { InlineMarkdown } from './inline-markdown';

const KIND = {
  do: {
    label: 'Do',
    icon: <CheckCircleFilledIcon className="size-5" />,
    text: 'text-success',
    bar: 'bg-success',
  },
  dont: {
    label: "Don't",
    icon: <CancelFilledIcon className="size-5" />,
    text: 'text-error',
    bar: 'bg-error',
  },
} as const;

function Card({ kind, card }: { kind: keyof typeof KIND; card: DoDontCard }) {
  const { label, icon, text, bar } = KIND[kind];
  return (
    <figure
      data-do-dont={kind}
      className="flex min-w-0 flex-col overflow-hidden rounded-corner-large border border-outline-variant"
    >
      {/* The example illustrates the sentence below, which carries the meaning: it is
          hidden from assistive tech and can't be focused or pressed. */}
      <div
        aria-hidden="true"
        inert
        className="flex min-h-44 items-center justify-center overflow-hidden bg-surface-container-low p-4"
      >
        <LazyExample file={card.file} name={card.name} />
      </div>
      <div aria-hidden="true" className={`h-1 ${bar}`} />
      <figcaption className="flex flex-col gap-1 p-4">
        <span className={`inline-flex items-center gap-2 text-title-small ${text}`}>
          {icon}
          {label}
        </span>
        <span className="text-body-medium text-on-surface-variant">
          <InlineMarkdown text={card.text} />
        </span>
      </figcaption>
    </figure>
  );
}

/**
 * The Guidelines tab's Do and Don't cards: each rule as a pair, side by side from medium
 * windows up and stacked on phones. Each card has a live example, a label in words and an
 * icon (not colour alone) and one sentence. A Server Component.
 */
export function DoDont({ pairs }: { pairs: readonly DoDontPair[] }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 id="do-and-dont" className="text-headline-small text-on-surface">
        Do and don&apos;t
      </h2>
      <div className="flex flex-col gap-6">
        {pairs.map((pair) => (
          <div key={pair.do.name} className="grid grid-cols-1 gap-4 medium:grid-cols-2">
            <Card kind="do" card={pair.do} />
            <Card kind="dont" card={pair.dont} />
          </div>
        ))}
      </div>
    </section>
  );
}
