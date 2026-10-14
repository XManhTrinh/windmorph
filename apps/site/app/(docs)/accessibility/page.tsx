import type { Metadata } from 'next';
import { CodeBlock } from '@windmorph/react-pro';
import { highlightSource } from '../../../lib/highlight';
import { guideMetadata } from '../../../lib/site-metadata';
import { InlineCode } from '../../../components/inline-code';

export const metadata: Metadata = guideMetadata('/accessibility');

const NAMING_SNIPPET = `import { IconButton, TextField } from '@windmorph/react';

// Icon-only buttons require a name — the types enforce aria-label OR aria-labelledby.
<IconButton variant="standard" icon={<SearchIcon />} aria-label="Search" />;

// A TextField needs a visible label OR aria-label / aria-labelledby.
<TextField label="Email" type="email" />;
<TextField aria-label="Search" />;`;

const RTL_SNIPPET = `import { DomDirectionLocale, localeWithDirection } from '@windmorph/react/primitives';

// React Aria takes keyboard direction from its locale, not the DOM dir. DomDirectionLocale
// reads an element's computed direction and, when it differs from the locale, supplies a
// same-language locale with the matching script (en-US -> en-Arab-US for RTL, ar -> ar-Latn
// for LTR) so dates and numbers still format the same.
<DomDirectionLocale>
  {(directionRef) => <ul ref={directionRef}>{/* list items */}</ul>}
</DomDirectionLocale>;

// localeWithDirection('en-US', 'rtl') -> 'en-Arab-US'`;

const NAMES = [
  ['IconButton, Fab, FabMenu', 'aria-label or aria-labelledby'],
  ['TextField', 'label, or aria-label / aria-labelledby'],
  ['Checkbox, Radio, Switch', 'a label (children), or aria-label / aria-labelledby'],
  ['RadioGroup', 'label, or aria-label / aria-labelledby'],
  ['Toolbars (Docked / Floating)', 'aria-label or aria-labelledby'],
  ['List, ChipSet, Carousel', 'aria-label or aria-labelledby'],
  ['Slider, RangeSlider', 'aria-label or aria-labelledby'],
  ['NavigationRail, NavigationBar', 'aria-label or aria-labelledby'],
  ['SearchBar', 'aria-label or aria-labelledby'],
  ['BottomSheet', 'aria-label or aria-labelledby'],
  ['SideSheet', 'title, or aria-label / aria-labelledby'],
  ['Linear / Circular progress, LoadingIndicator', 'aria-label or aria-labelledby'],
] as const;

const KEYBOARD = [
  [
    'Menu',
    'Arrow keys move, typeahead jumps, Esc or an outside press dismisses, focus returns to the trigger.',
  ],
  [
    'ButtonGroup (single select)',
    'Renders a radiogroup; Tab enters and leaves the group as one stop, and arrow keys move between options.',
  ],
  [
    'Tabs',
    'Arrow keys plus Home / End move focus; Space or Enter selects the focused tab (keyboardActivation="automatic" selects on focus).',
  ],
  [
    'Dialog',
    'Focus is contained while open and returns to the trigger on close; Esc dismisses unless keyboardDismissDisabled is set; an outside press dismisses too, except for an alertdialog (the default role) without dismissable.',
  ],
  ['Tooltip', 'Shows on hover or keyboard focus, stays while focused, and Esc hides it.'],
  ['Slider', 'Arrow keys adjust the value; Home / End jump to the ends.'],
] as const;

export default async function AccessibilityPage() {
  const [namingHtml, rtlHtml] = await Promise.all([
    highlightSource(NAMING_SNIPPET, 'tsx'),
    highlightSource(RTL_SNIPPET, 'tsx'),
  ]);

  return (
    <article className="mx-auto flex max-w-3xl flex-col gap-10">
      <header className="flex flex-col gap-3">
        <h1 className="text-headline-large text-on-surface">Accessibility</h1>
        <p className="text-body-large text-on-surface-variant">
          Components target WCAG 2.2 AA: full keyboard operation, visible focus, 48px touch targets,{' '}
          <InlineCode>prefers-reduced-motion</InlineCode>, RTL support, and screen-reader names
          required by the types where one is needed.
        </p>
      </header>

      <section className="flex flex-col gap-4">
        <h2 id="commitments" className="text-headline-small text-on-surface">
          Commitments
        </h2>
        <ul className="list-disc ps-6 text-body-large text-on-surface-variant">
          <li>Keyboard operation and a visible focus indicator on every interactive element.</li>
          <li>
            48px touch targets even for extra-small visuals — for example XS and S buttons wrap a
            48px touch target while their layout height stays 32 / 40px.
          </li>
          <li>
            <InlineCode>prefers-reduced-motion</InlineCode> removes non-essential movement (see the{' '}
            <a className="text-primary underline" href="/motion">
              Motion guide
            </a>
            ).
          </li>
          <li>Right-to-left layouts via logical properties, so components mirror automatically.</li>
          <li>Accessible names required by the component types wherever one is needed.</li>
        </ul>
      </section>

      <section className="flex flex-col gap-4">
        <h2 id="focus-rings" className="text-headline-small text-on-surface">
          Focus rings
        </h2>
        <p className="text-body-large text-on-surface-variant">
          Focus rings are a CSS <InlineCode>outline</InlineCode> with{' '}
          <InlineCode>outline-offset</InlineCode> (the <InlineCode>focus-ring</InlineCode> /{' '}
          <InlineCode>focus-ring-inset</InlineCode> utilities), so an{' '}
          <InlineCode>overflow-hidden</InlineCode> on the component itself can&apos;t clip them. The
          inset ring is drawn inside the element, for full-bleed items such as list rows, where an
          ancestor that clips its overflow would cut off an outer ring.
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <h2 id="names-the-types-require" className="text-headline-small text-on-surface">
          Names the types require
        </h2>
        <p className="text-body-large text-on-surface-variant">
          These components won’t type-check without an accessible name, so the requirement can’t be
          forgotten:
        </p>
        <table className="w-full border-collapse text-body-medium">
          <thead>
            <tr>
              <th className="border-b border-outline-variant p-2 text-start text-title-small text-on-surface">
                Component
              </th>
              <th className="border-b border-outline-variant p-2 text-start text-title-small text-on-surface">
                Required name
              </th>
            </tr>
          </thead>
          <tbody>
            {NAMES.map(([component, requirement]) => (
              <tr key={component}>
                <td className="border-b border-outline-variant p-2 text-on-surface-variant">
                  <InlineCode>{component}</InlineCode>
                </td>
                <td className="border-b border-outline-variant p-2 text-on-surface-variant">
                  {requirement}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <CodeBlock code={NAMING_SNIPPET} html={namingHtml} lang="tsx" title="naming.tsx" />
      </section>

      <section className="flex flex-col gap-4">
        <h2 id="keyboard-behaviour" className="text-headline-small text-on-surface">
          Keyboard behaviour
        </h2>
        <p className="text-body-large text-on-surface-variant">
          A per-family summary. Detailed per-component tables live on the individual component
          pages.
        </p>
        <table className="w-full border-collapse text-body-medium">
          <thead>
            <tr>
              <th className="border-b border-outline-variant p-2 text-start text-title-small text-on-surface">
                Component
              </th>
              <th className="border-b border-outline-variant p-2 text-start text-title-small text-on-surface">
                Keys
              </th>
            </tr>
          </thead>
          <tbody>
            {KEYBOARD.map(([component, keys]) => (
              <tr key={component}>
                <td className="border-b border-outline-variant p-2 text-on-surface-variant">
                  <InlineCode>{component}</InlineCode>
                </td>
                <td className="border-b border-outline-variant p-2 text-on-surface-variant">
                  {keys}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="flex flex-col gap-4">
        <h2 id="right-to-left" className="text-headline-small text-on-surface">
          Right-to-left
        </h2>
        <p className="text-body-large text-on-surface-variant">
          Components use logical properties, so they mirror in RTL. React Aria, though, takes
          keyboard direction (arrow keys, <InlineCode>start</InlineCode> /{' '}
          <InlineCode>end</InlineCode>) from its locale rather than the DOM{' '}
          <InlineCode>dir</InlineCode>. <InlineCode>DomDirectionLocale</InlineCode> bridges that gap
          and is used internally by Toolbar, ButtonGroup, Slider, DatePicker, DateField and List. It
          lives in <InlineCode>@windmorph/react/primitives</InlineCode>, shown here for reference.
        </p>
        <CodeBlock code={RTL_SNIPPET} html={rtlHtml} lang="tsx" title="rtl.tsx" />
      </section>
    </article>
  );
}
