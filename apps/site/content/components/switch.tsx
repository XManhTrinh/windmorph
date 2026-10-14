import { switchTokenSet } from '@windmorph/react';
import type { ComponentDoc } from './doc';
import { ExampleViewer } from '../../components/example-viewer';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';
import { InlineCode } from '../../components/inline-code';
import { lazyExample } from '../../lib/lazy-example';

const SwitchBasic = lazyExample('switch/switch-basic', 'SwitchBasic');
const SwitchIcons = lazyExample('switch/switch-icons', 'SwitchIcons');
const SwitchStates = lazyExample('switch/switch-states', 'SwitchStates');

/** Switch page body. */
export async function SwitchBody(): Promise<ComponentDoc> {
  const [basic, icons, states] = await Promise.all([
    readExampleSource('switch/switch-basic.tsx'),
    readExampleSource('switch/switch-icons.tsx'),
    readExampleSource('switch/switch-states.tsx'),
  ]);
  const [basicHtml, iconsHtml, statesHtml] = await Promise.all([
    highlightSource(basic),
    highlightSource(icons),
    highlightSource(states),
  ]);

  return {
    tokens: [switchTokenSet],
    overview: (
      <>
        <section className="flex flex-col gap-6">
          <h2 id="examples" className="text-headline-small text-on-surface">
            Examples
          </h2>
          <ExampleViewer title="Basic" code={basic} html={basicHtml} fileName="switch-basic.tsx">
            <SwitchBasic />
          </ExampleViewer>
          <ExampleViewer
            title="Icons in the thumb"
            code={icons}
            html={iconsHtml}
            fileName="switch-icons.tsx"
          >
            <SwitchIcons />
          </ExampleViewer>
          <ExampleViewer
            title="Disabled"
            code={states}
            html={statesHtml}
            fileName="switch-states.tsx"
          >
            <SwitchStates />
          </ExampleViewer>
        </section>
      </>
    ),
    guidelines: (
      <>
        <section className="flex flex-col gap-3">
          <h2 id="purpose" className="text-headline-small text-on-surface">
            Purpose
          </h2>
          <p className="text-body-large text-on-surface-variant">
            A switch toggles a single setting on or off and takes effect immediately, like a system
            preference. Use a <InlineCode>Checkbox</InlineCode> instead when the choice is part of a
            form that is submitted later, or when you need an indeterminate state.
          </p>
          <p className="text-body-large text-on-surface-variant">
            Give the switch an accessible name through its label <InlineCode>children</InlineCode>{' '}
            or an <InlineCode>aria-label</InlineCode> / <InlineCode>aria-labelledby</InlineCode>{' '}
            (the types enforce one).
          </p>
        </section>
      </>
    ),
    accessibility: (
      <>
        <section className="flex flex-col gap-3">
          <h2 id="keyboard-and-screen-reader" className="text-headline-small text-on-surface">
            Keyboard &amp; screen reader
          </h2>
          <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
            <li>
              A visually hidden native input with <InlineCode>role=&quot;switch&quot;</InlineCode>{' '}
              (React Aria <InlineCode>useSwitch</InlineCode>) carries the state, so forms and
              assistive tech work natively.
            </li>
            <li>
              Tab moves focus; Space or Enter toggles it (M3&apos;s keyboard spec). The focus ring
              surrounds the track, which has a 48px touch target.
            </li>
            <li>
              An accessible name is required; the thumb icons (<InlineCode>icons</InlineCode>,{' '}
              <InlineCode>selectedIcon</InlineCode>, <InlineCode>unselectedIcon</InlineCode>) are
              decorative.
            </li>
          </ul>
        </section>
      </>
    ),
    api: (
      <>
        <section className="flex flex-col gap-3">
          <h2 id="differences-from-compose" className="text-headline-small text-on-surface">
            Differences from Compose
          </h2>
          <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
            <li>
              A 52×32px track with a 2px outline. The thumb geometry is computed like Compose&apos;s{' '}
              <InlineCode>ThumbNode</InlineCode>: 16px off, 24px on or with an icon, 28px pressed,
              centred 16 / 36px from the start.
            </li>
            <li>
              The thumb can be dragged: it follows the pointer between its off and on positions, and
              releasing sets the switch from the half it&apos;s in (a tap still toggles).
            </li>
            <li>
              Pressing snaps the thumb; releasing animates its <InlineCode>width</InlineCode> /{' '}
              <InlineCode>height</InlineCode> / position on the fast spatial spring, and it mirrors
              in RTL. The geometry is passed as CSS variables so no state selectors compete.
            </li>
            <li>
              Hover, focus and press recolour the thumb to{' '}
              <InlineCode>on-surface-variant</InlineCode> (off) /{' '}
              <InlineCode>primary-container</InlineCode> (on); disabled colours are Compose&apos;s
              composites over <InlineCode>surface</InlineCode>.
            </li>
            <li>
              <InlineCode>icons</InlineCode> shows the default check / close marks;{' '}
              <InlineCode>selectedIcon</InlineCode> / <InlineCode>unselectedIcon</InlineCode>{' '}
              override them.
            </li>
          </ul>
        </section>
      </>
    ),
  };
}
