import type { ComponentDoc } from './doc';
import { ExampleViewer } from '../../components/example-viewer';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';
import { InlineCode } from '../../components/inline-code';
import { lazyExample } from '../../lib/lazy-example';

const PinInputCorners = lazyExample('pin-input/pin-input-corners', 'PinInputCorners');
const PinInputGroups = lazyExample('pin-input/pin-input-groups', 'PinInputGroups');
const PinInputPin = lazyExample('pin-input/pin-input-pin', 'PinInputPin');
const PinInputStates = lazyExample('pin-input/pin-input-states', 'PinInputStates');
const PinInputVariants = lazyExample('pin-input/pin-input-variants', 'PinInputVariants');
const PinInputVerification = lazyExample(
  'pin-input/pin-input-verification',
  'PinInputVerification',
);

/** PIN input page body: purpose, examples, accessibility and theming. */
export async function PinInputBody(): Promise<ComponentDoc> {
  const [verification, variants, groups, pin, corners, states] = await Promise.all([
    readExampleSource('pin-input/pin-input-verification.tsx'),
    readExampleSource('pin-input/pin-input-variants.tsx'),
    readExampleSource('pin-input/pin-input-groups.tsx'),
    readExampleSource('pin-input/pin-input-pin.tsx'),
    readExampleSource('pin-input/pin-input-corners.tsx'),
    readExampleSource('pin-input/pin-input-states.tsx'),
  ]);
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
              Screen readers meet one labelled field, not one per box; the boxes are hidden from
              assistive technology. The label, supporting text and error are wired to the input, so
              an error is announced.
            </li>
            <li>
              Each character moves to the next box. Backspace deletes, the arrow keys, Home and End
              move between boxes, and typing over a filled box replaces its character.
            </li>
            <li>
              <InlineCode>otp</InlineCode> (on by default) sets{' '}
              <InlineCode>autocomplete=&quot;one-time-code&quot;</InlineCode>, and numeric codes
              open the number pad. <InlineCode>mask</InlineCode> makes the input a password field,
              so the code is never read aloud.
            </li>
            <li>
              The boxes keep reading left to right in right-to-left layouts. The caret stops
              blinking and the error shake is off under reduced motion; in forced-colours mode the
              boxes keep system-colour borders.
            </li>
          </ul>
        </section>
      </>
    ),
    api: (
      <>
        <section className="flex flex-col gap-3">
          <h2 id="theming" className="text-headline-small text-on-surface">
            Theming
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
              <InlineCode>corner</InlineCode> takes any step of the M3 shape scale; the default is
              the text field&apos;s extra-small.
            </li>
            <li>
              New characters pop in on the fast spatial spring, and border changes use the fast
              effects spring, from the active motion scheme.
            </li>
          </ul>
        </section>
      </>
    ),
  };
}
