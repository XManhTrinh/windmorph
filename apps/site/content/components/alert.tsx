import type { ComponentDoc } from './doc';
import { ExampleViewer } from '../../components/example-viewer';
import { AlertDismissible } from '../../examples/alert/alert-dismissible';
import { AlertFormError } from '../../examples/alert/alert-form-error';
import { AlertTones } from '../../examples/alert/alert-tones';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';
import { InlineCode } from '../../components/inline-code';

/** Alert page body: when to use it, examples, accessibility and tokens. */
export async function AlertBody(): Promise<ComponentDoc> {
  const [formError, tones, dismissible] = await Promise.all([
    readExampleSource('alert/alert-form-error.tsx'),
    readExampleSource('alert/alert-tones.tsx'),
    readExampleSource('alert/alert-dismissible.tsx'),
  ]);
  const [formErrorHtml, tonesHtml, dismissibleHtml] = await Promise.all([
    highlightSource(formError),
    highlightSource(tones),
    highlightSource(dismissible),
  ]);

  return {
    overview: (
      <>
        <section className="flex flex-col gap-6">
          <h2 id="examples" className="text-headline-small text-on-surface">
            Examples
          </h2>
          <ExampleViewer
            title="A form's error"
            code={formError}
            html={formErrorHtml}
            fileName="alert-form-error.tsx"
          >
            <AlertFormError />
          </ExampleViewer>
          <ExampleViewer
            title="Tones and variants"
            code={tones}
            html={tonesHtml}
            fileName="alert-tones.tsx"
          >
            <AlertTones />
          </ExampleViewer>
          <ExampleViewer
            title="Dismissible"
            code={dismissible}
            html={dismissibleHtml}
            fileName="alert-dismissible.tsx"
          >
            <AlertDismissible />
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
            An alert is a message that stays until it&apos;s resolved: a form&apos;s error, a
            page&apos;s warning, a system notice. It is{' '}
            <strong className="text-on-surface">not an M3 component</strong>: M3 Expressive has no
            persistent message, so it comes from <InlineCode>@windmorph/react-pro</InlineCode>,
            built from M3&apos;s colour roles, type and shape scales, Button and IconButton.
          </p>
          <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
            <li>Brief feedback that goes away by itself: a Snackbar.</li>
            <li>A problem with one field: the field&apos;s error text.</li>
            <li>A region with no content, or that couldn&apos;t load: an Empty state.</li>
            <li>
              A decision that blocks the page (what Apple and Android call an alert): a Dialog with{' '}
              <InlineCode>role=&quot;alertdialog&quot;</InlineCode>.
            </li>
          </ul>
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
              Errors are <InlineCode>role=&quot;alert&quot;</InlineCode>, read at once; other tones
              are <InlineCode>role=&quot;status&quot;</InlineCode>, read politely.
            </li>
            <li>
              <InlineCode>focusOnMount</InlineCode> moves focus to an alert that blocks a form,
              after a failed submit.
            </li>
            <li>
              The close button is named by <InlineCode>labels.close</InlineCode>.
            </li>
            <li>The icon is decorative. In forced-colours mode every alert keeps a border.</li>
          </ul>
        </section>
      </>
    ),
    api: (
      <>
        <section className="flex flex-col gap-3">
          <h2 id="theming-and-tokens" className="text-headline-small text-on-surface">
            Theming &amp; tokens
          </h2>
          <p className="text-body-large text-on-surface-variant">
            Tonal alerts use the tone&apos;s container and on-container roles; outlined ones the
            surface, with the border and icon in the tone&apos;s colour. A test keeps the text at
            4.5:1 in every theme, mode and contrast level. Set{' '}
            <InlineCode>--wm-alert-container</InlineCode>, <InlineCode>-content</InlineCode>,{' '}
            <InlineCode>-outline</InlineCode>, <InlineCode>-icon</InlineCode> or{' '}
            <InlineCode>-corner</InlineCode> on an alert or an ancestor.
          </p>
        </section>
      </>
    ),
  };
}
