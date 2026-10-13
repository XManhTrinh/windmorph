import { ExampleViewer } from '../../components/example-viewer';
import { SwitchBasic } from '../../examples/switch/switch-basic';
import { SwitchIcons } from '../../examples/switch/switch-icons';
import { SwitchStates } from '../../examples/switch/switch-states';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';

/** Switch page body. */
export async function SwitchBody() {
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

  return (
    <>
      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Purpose</h2>
        <p className="text-body-large text-on-surface-variant">
          A switch toggles a single setting on or off and takes effect immediately, like a system
          preference. Use a <code className="text-on-surface">Checkbox</code> instead when the
          choice is part of a form that is submitted later, or when you need an indeterminate state.
        </p>
        <p className="text-body-large text-on-surface-variant">
          Give the switch an accessible name through its label{' '}
          <code className="text-on-surface">children</code> or an{' '}
          <code className="text-on-surface">aria-label</code> /{' '}
          <code className="text-on-surface">aria-labelledby</code> (the types enforce one).
        </p>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-headline-small text-on-surface">Examples</h2>
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

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Keyboard &amp; screen reader</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            A visually hidden native input with{' '}
            <code className="text-on-surface">role=&quot;switch&quot;</code> (React Aria{' '}
            <code className="text-on-surface">useSwitch</code>) carries the state, so forms and
            assistive tech work natively.
          </li>
          <li>
            Tab moves focus; Space toggles it. The focus ring surrounds the track, which has a 48px
            touch target.
          </li>
          <li>
            An accessible name is required; the thumb icons (
            <code className="text-on-surface">icons</code>,{' '}
            <code className="text-on-surface">selectedIcon</code>,{' '}
            <code className="text-on-surface">unselectedIcon</code>) are decorative.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Differences from Compose</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            A 52×32px track with a 2px outline. The thumb geometry is computed like Compose&apos;s{' '}
            <code className="text-on-surface">ThumbNode</code>: 16px off, 24px on or with an icon,
            28px pressed, centred 16 / 36px from the start.
          </li>
          <li>
            Pressing snaps the thumb; releasing animates its{' '}
            <code className="text-on-surface">width</code> /{' '}
            <code className="text-on-surface">height</code> / position on the fast spatial spring,
            and it mirrors in RTL. The geometry is passed as CSS variables so no state selectors
            compete.
          </li>
          <li>
            Hover, focus and press recolour the thumb to{' '}
            <code className="text-on-surface">on-surface-variant</code> (off) /{' '}
            <code className="text-on-surface">primary-container</code> (on); disabled colours are
            Compose&apos;s composites over <code className="text-on-surface">surface</code>.
          </li>
          <li>
            <code className="text-on-surface">icons</code> shows the default check / close marks;{' '}
            <code className="text-on-surface">selectedIcon</code> /{' '}
            <code className="text-on-surface">unselectedIcon</code> override them.
          </li>
        </ul>
      </section>
    </>
  );
}
