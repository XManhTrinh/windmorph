import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { InlineCode } from '../../../components/inline-code';
import { guideMetadata } from '../../../lib/site-metadata';

export const metadata: Metadata = guideMetadata('/api-conventions');

const SECTION = 'flex flex-col gap-4';
const HEADING = 'text-headline-small text-on-surface';
const TEXT = 'text-body-large text-on-surface-variant';
const LIST = 'flex list-disc flex-col gap-2 ps-6 text-body-large text-on-surface-variant';

/** One rule: what the props are called, and an example from the library. */
function Rule({ children }: { children: ReactNode }) {
  return <li>{children}</li>;
}

/**
 * The naming and API conventions every component of `@windmorph/react` and
 * `@windmorph/react-pro` follows, so a prop learnt on one component means the same on all.
 */
export default function ApiConventionsPage() {
  return (
    <article className="mx-auto flex max-w-3xl flex-col gap-10">
      <header className="flex flex-col gap-3">
        <h1 className="text-headline-large text-on-surface">API conventions</h1>
        <p className={TEXT}>
          Every Windmorph component, in the core and in Pro, names its props the same way, so what
          you learn on one carries over to the next. The names follow HTML first, then M3 and the
          leading React libraries. A unit test reads every public prop, inherited ones included, and
          fails on a name these rules leave out.
        </p>
      </header>

      <section className={SECTION}>
        <h2 id="booleans" className={HEADING}>
          Booleans
        </h2>
        <ul className={LIST}>
          <Rule>
            A state is a plain adjective, as in HTML: <InlineCode>disabled</InlineCode>,{' '}
            <InlineCode>readOnly</InlineCode>, <InlineCode>required</InlineCode>,{' '}
            <InlineCode>invalid</InlineCode>, <InlineCode>open</InlineCode>. No{' '}
            <InlineCode>is</InlineCode>, <InlineCode>allows</InlineCode> or{' '}
            <InlineCode>should</InlineCode> prefix: <InlineCode>allowCustomValue</InlineCode>,{' '}
            <InlineCode>closeOnSelect</InlineCode>.
          </Rule>
          <Rule>
            Booleans are positive, with the common case as the default:{' '}
            <InlineCode>deselectable</InlineCode> (default <InlineCode>true</InlineCode>), not{' '}
            <InlineCode>disallowEmptySelection</InlineCode>.
          </Rule>
          <Rule>
            A prop that shows or hides an optional part is named after the part:{' '}
            <InlineCode>valueLabel</InlineCode>, <InlineCode>counter</InlineCode>,{' '}
            <InlineCode>ticks</InlineCode>, <InlineCode>closeButton</InlineCode>.
          </Rule>
          <Rule>
            A function that answers a question keeps its question form:{' '}
            <InlineCode>isDateUnavailable(date)</InlineCode>.
          </Rule>
        </ul>
      </section>

      <section className={SECTION}>
        <h2 id="state" className={HEADING}>
          Controlled and uncontrolled state
        </h2>
        <p className={TEXT}>
          Every piece of state comes as a triple: the value, its <InlineCode>default…</InlineCode>{' '}
          twin for uncontrolled use, and an <InlineCode>on…Change</InlineCode> callback that
          receives the new value first.
        </p>
        <ul className={LIST}>
          <Rule>
            One choice: <InlineCode>value</InlineCode> / <InlineCode>defaultValue</InlineCode> /{' '}
            <InlineCode>onChange</InlineCode> (<InlineCode>Select</InlineCode>,{' '}
            <InlineCode>Tabs</InlineCode>, <InlineCode>RadioGroup</InlineCode>, the sliders and
            pickers).
          </Rule>
          <Rule>
            Checkable inputs: <InlineCode>checked</InlineCode> /{' '}
            <InlineCode>defaultChecked</InlineCode> / <InlineCode>onCheckedChange</InlineCode> (
            <InlineCode>Checkbox</InlineCode>, <InlineCode>Switch</InlineCode>, list items). Toggle
            buttons, chips and navigation items say <InlineCode>selected</InlineCode>, as M3 does.
          </Rule>
          <Rule>
            Overlays: <InlineCode>open</InlineCode> / <InlineCode>defaultOpen</InlineCode> /{' '}
            <InlineCode>onOpenChange</InlineCode>. Several choices:{' '}
            <InlineCode>selectedKeys</InlineCode> / <InlineCode>defaultSelectedKeys</InlineCode> /{' '}
            <InlineCode>onSelectionChange</InlineCode>.
          </Rule>
          <Rule>
            Ranges are <InlineCode>min</InlineCode> and <InlineCode>max</InlineCode>, as on an HTML
            input.
          </Rule>
          <Rule>
            Hooks follow the same rule: <InlineCode>defaultExpanded</InlineCode>, not{' '}
            <InlineCode>initialExpanded</InlineCode>.
          </Rule>
        </ul>
      </section>

      <section className={SECTION}>
        <h2 id="events" className={HEADING}>
          Events
        </h2>
        <ul className={LIST}>
          <Rule>
            Buttons, cards, chips and links take <InlineCode>onPress</InlineCode>, which covers
            mouse, touch, pen and keyboard alike; <InlineCode>onClick</InlineCode> still works.
          </Rule>
          <Rule>
            An item of a collection is activated with <InlineCode>onAction(key)</InlineCode> (
            <InlineCode>List</InlineCode>, <InlineCode>Menu</InlineCode>,{' '}
            <InlineCode>Carousel</InlineCode>).
          </Rule>
          <Rule>
            The end of a motion is <InlineCode>onOpened</InlineCode> /{' '}
            <InlineCode>onClosed</InlineCode>; a drag or key that finishes changing a value is{' '}
            <InlineCode>onChangeEnd</InlineCode>.
          </Rule>
        </ul>
      </section>

      <section className={SECTION}>
        <h2 id="words" className={HEADING}>
          Words
        </h2>
        <p className={TEXT}>
          Every word a component shows or announces comes from its <InlineCode>labels</InlineCode>{' '}
          prop, with English defaults, so an app can translate all of them. Each key is documented
          with its default, and <InlineCode>labels</InlineCode> takes any of them (
          <InlineCode>{'labels={{ close: "Fermer" }}'}</InlineCode>). Names only your app knows,
          such as a list&apos;s <InlineCode>aria-label</InlineCode>, are required by the types.
        </p>
      </section>

      <section className={SECTION}>
        <h2 id="placement-and-sizes" className={HEADING}>
          Placement, sizes and colours
        </h2>
        <ul className={LIST}>
          <Rule>
            Where a part goes is <InlineCode>…Placement</InlineCode>:{' '}
            <InlineCode>iconPlacement</InlineCode>, <InlineCode>fabPlacement</InlineCode>,{' '}
            <InlineCode>controlPlacement</InlineCode>. Sides are CSS&apos;s logical{' '}
            <InlineCode>start</InlineCode> and <InlineCode>end</InlineCode>, which follow the text
            direction.
          </Rule>
          <Rule>
            Multi-word values are hyphenated: <InlineCode>bottom-start</InlineCode>,{' '}
            <InlineCode>full-screen</InlineCode>, <InlineCode>space-between</InlineCode>.
          </Rule>
          <Rule>
            Icon slots are M3&apos;s <InlineCode>leadingIcon</InlineCode> and{' '}
            <InlineCode>trailingIcon</InlineCode>.
          </Rule>
          <Rule>
            Sizes share one scale, <InlineCode>xs</InlineCode> to <InlineCode>xl</InlineCode> (a FAB
            adds <InlineCode>default</InlineCode>). M3&apos;s named variants, such as a top app
            bar&apos;s <InlineCode>small</InlineCode> or <InlineCode>large</InlineCode>, are{' '}
            <InlineCode>variant</InlineCode>s, not sizes.
          </Rule>
          <Rule>
            A colour choice is <InlineCode>color</InlineCode>, named after an M3 colour role.
          </Rule>
        </ul>
      </section>

      <section className={SECTION}>
        <h2 id="elements-and-styling" className={HEADING}>
          Elements and styling
        </h2>
        <ul className={LIST}>
          <Rule>
            Every component with an element of its own takes <InlineCode>className</InlineCode>,{' '}
            <InlineCode>style</InlineCode>, <InlineCode>ref</InlineCode> and{' '}
            <InlineCode>id</InlineCode>. A field&apos;s <InlineCode>id</InlineCode> goes to its
            input or trigger, so a <InlineCode>{'<label for>'}</InlineCode> or an error summary
            reaches it.
          </Rule>
          <Rule>
            <InlineCode>className</InlineCode> and <InlineCode>style</InlineCode> go on the
            outermost element; <InlineCode>classNames</InlineCode> reaches each part, with one slot
            name per part everywhere (<InlineCode>supportingText</InlineCode>,{' '}
            <InlineCode>close</InlineCode>, <InlineCode>back</InlineCode>).
          </Rule>
          <Rule>
            <InlineCode>as</InlineCode> picks the element where a component offers a choice (
            <InlineCode>{'as="div"'}</InlineCode>); <InlineCode>href</InlineCode> turns a button
            into a link.
          </Rule>
          <Rule>
            State shows on the root as <InlineCode>data-*</InlineCode> attributes, present or absent
            (<InlineCode>data-disabled</InlineCode>, <InlineCode>data-checked</InlineCode>,{' '}
            <InlineCode>data-open</InlineCode>), and choices as values (
            <InlineCode>data-variant</InlineCode>, <InlineCode>data-size</InlineCode>).
          </Rule>
          <Rule>
            How a dialog or sheet may be closed follows HTML&apos;s{' '}
            <InlineCode>{'<dialog closedby>'}</InlineCode>: <InlineCode>closedBy</InlineCode> is{' '}
            <InlineCode>any</InlineCode>, <InlineCode>closerequest</InlineCode> or{' '}
            <InlineCode>none</InlineCode>.
          </Rule>
        </ul>
      </section>
    </article>
  );
}
