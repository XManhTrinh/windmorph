import type { ComponentDoc } from './doc';
import { pinInputTokenSet } from '@windmorph/react-pro';
import { ExampleViewer } from '../../components/example-viewer';
import { TokenTable } from '../../components/token-table';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';
import { InlineCode } from '../../components/inline-code';
import { lazyExample } from '../../lib/lazy-example';

const PinInputCorners = lazyExample('pin-input/pin-input-corners', 'PinInputCorners');
const PinInputDensity = lazyExample('pin-input/pin-input-density', 'PinInputDensity');
const PinInputGroups = lazyExample('pin-input/pin-input-groups', 'PinInputGroups');
const PinInputPin = lazyExample('pin-input/pin-input-pin', 'PinInputPin');
const PinInputStates = lazyExample('pin-input/pin-input-states', 'PinInputStates');
const PinInputVariants = lazyExample('pin-input/pin-input-variants', 'PinInputVariants');
const PinInputVerification = lazyExample(
  'pin-input/pin-input-verification',
  'PinInputVerification',
);

/** PIN input page body: purpose, examples and theming. */
export async function PinInputBody(): Promise<ComponentDoc> {
  const [verification, variants, groups, pin, corners, states, density] = await Promise.all([
    readExampleSource('pin-input/pin-input-verification.tsx'),
    readExampleSource('pin-input/pin-input-variants.tsx'),
    readExampleSource('pin-input/pin-input-groups.tsx'),
    readExampleSource('pin-input/pin-input-pin.tsx'),
    readExampleSource('pin-input/pin-input-corners.tsx'),
    readExampleSource('pin-input/pin-input-states.tsx'),
    readExampleSource('pin-input/pin-input-density.tsx'),
  ]);
  const densityHtml = await highlightSource(density);
  const [verificationHtml, variantsHtml, groupsHtml, pinHtml, cornersHtml, statesHtml] =
    await Promise.all([
      highlightSource(verification),
      highlightSource(variants),
      highlightSource(groups),
      highlightSource(pin),
      highlightSource(corners),
      highlightSource(states),
    ]);

  return {
    overview: (
      <>
        <section className="flex flex-col gap-6">
          <h2 id="examples" className="text-headline-small text-on-surface">
            Examples
          </h2>
          <ExampleViewer
            title="A verification code that submits itself"
            code={verification}
            html={verificationHtml}
            fileName="pin-input-verification.tsx"
          >
            <PinInputVerification />
          </ExampleViewer>
          <ExampleViewer
            title="Outlined or filled, in three sizes"
            code={variants}
            html={variantsHtml}
            fileName="pin-input-variants.tsx"
          >
            <PinInputVariants />
          </ExampleViewer>
          <ExampleViewer
            title="Groups, letters and custom characters"
            code={groups}
            html={groupsHtml}
            fileName="pin-input-groups.tsx"
          >
            <PinInputGroups />
          </ExampleViewer>
          <ExampleViewer
            title="A masked PIN"
            code={pin}
            html={pinHtml}
            fileName="pin-input-pin.tsx"
          >
            <PinInputPin />
          </ExampleViewer>
          <ExampleViewer
            title="Corners and character sets"
            code={corners}
            html={cornersHtml}
            fileName="pin-input-corners.tsx"
          >
            <PinInputCorners />
          </ExampleViewer>
          <ExampleViewer
            title="Invalid, required, read-only and disabled"
            code={states}
            html={statesHtml}
            fileName="pin-input-states.tsx"
          >
            <PinInputStates />
          </ExampleViewer>
          <ExampleViewer
            title="Density, from 56px to 44px"
            code={density}
            html={densityHtml}
            fileName="pin-input-density.tsx"
          >
            <PinInputDensity />
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
            A PIN input takes a short code of fixed length, one character per box: email and SMS
            verification codes, password reset and two-factor codes, PINs, and invite or voucher
            codes. It is <strong className="text-on-surface">not an M3 component</strong>: it comes
            from <InlineCode>@windmorph/react-pro</InlineCode>, and each box is drawn with the M3
            text field&apos;s tokens, so it sits naturally next to a Text field.
          </p>
          <p className="text-body-large text-on-surface-variant">
            One real input sits invisibly over the boxes. Typing, pasting (&quot;123 456&quot; or
            &quot;Code: 123456&quot; both become <InlineCode>123456</InlineCode>), one-time-code
            autofill on phones and password managers all work as in a normal field. Codes of up to
            six characters fit a 320px phone in every size.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 id="behaviour" className="text-headline-small text-on-surface">
            Behaviour
          </h2>
          <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
            <li>
              <InlineCode>density</InlineCode> (or the theme&apos;s, through a provider or{' '}
              <InlineCode>ThemeScope</InlineCode>) takes 4px a step off the boxes&apos; height: 56px
              at 0 to 44px at -3 at the medium size, as the core&apos;s fields.
            </li>
            <li>
              Box sizes are minimums (at least 1.25em each way), so text at 200% makes the boxes
              bigger instead of clipping the characters.
            </li>
            <li>
              Disabled parts dim with the M3 disabled state opacities. An invalid code shakes the
              row on the default spatial spring on every swing, and the caret blinks as a step
              (500ms on, 500ms off).
            </li>
          </ul>
        </section>
      </>
    ),
    api: (
      <>
        <section className="flex flex-col gap-3">
          <h2 id="theming" className="text-headline-small text-on-surface">
            Theming &amp; tokens
          </h2>
          <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
            <li>
              <InlineCode>outlined</InlineCode> boxes have an <InlineCode>outline</InlineCode>{' '}
              border that turns <InlineCode>on-surface</InlineCode> on hover and 2px{' '}
              <InlineCode>primary</InlineCode> in the active box; <InlineCode>filled</InlineCode>{' '}
              boxes have a <InlineCode>surface-container-highest</InlineCode> container and an
              active indicator. Errors use <InlineCode>error</InlineCode>, so every theme, mode and
              contrast level follows.
            </li>
            <li>
              The boxes read the <InlineCode>--wm-pin-input-*</InlineCode> tokens below, whose
              defaults are the core&apos;s text field tokens: a{' '}
              <InlineCode>--md-comp-outlined-text-field-*</InlineCode> or{' '}
              <InlineCode>--md-comp-filled-text-field-*</InlineCode> override restyles the boxes as
              it does a Text field and a Phone field. Set them on the input (
              <InlineCode>className</InlineCode>) or any ancestor; the root is marked{' '}
              <InlineCode>data-tokens=&quot;wm-pin-input&quot;</InlineCode>.
            </li>
            <li>
              <InlineCode>corner</InlineCode> takes any step of the M3 shape scale; the default is
              the text field&apos;s extra-small. For a corner of your own, set{' '}
              <InlineCode>--wm-pin-input-container-shape</InlineCode> (the old{' '}
              <InlineCode>--wm-pin-corner</InlineCode> variable is gone).
            </li>
            <li>
              New characters pop in on the fast spatial spring and fade in on the fast effects
              spring, and border changes use the fast effects spring, from the active motion scheme.
              Under reduced motion the pop is skipped but the fade stays.
            </li>
          </ul>
          <TokenTable set={pinInputTokenSet} caption="PIN input tokens" />
        </section>
      </>
    ),
  };
}
