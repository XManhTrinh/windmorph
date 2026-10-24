import type { ComponentDoc } from './doc';
import { alertTokenSet } from '@windmorph/react-pro';
import { ExampleViewer } from '../../components/example-viewer';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';
import { InlineCode } from '../../components/inline-code';
import { TokenTable } from '../../components/token-table';
import { lazyExample } from '../../lib/lazy-example';

const AlertDismissible = lazyExample('alert/alert-dismissible', 'AlertDismissible');
const AlertFormError = lazyExample('alert/alert-form-error', 'AlertFormError');
const AlertSeverities = lazyExample('alert/alert-severities', 'AlertSeverities');

/** Alert page body: when to use it, examples and tokens. */
export async function AlertBody(): Promise<ComponentDoc> {
  const [formError, severities, dismissible] = await Promise.all([
    readExampleSource('alert/alert-form-error.tsx'),
    readExampleSource('alert/alert-severities.tsx'),
    readExampleSource('alert/alert-dismissible.tsx'),
  ]);
  const [formErrorHtml, severitiesHtml, dismissibleHtml] = await Promise.all([
    highlightSource(formError),
    highlightSource(severities),
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
            title="Severities and variants"
            code={severities}
            html={severitiesHtml}
            fileName="alert-severities.tsx"
          >
            <AlertSeverities />
          </ExampleViewer>
          <ExampleViewer
            title="Dismissible, leaving with its exit motion"
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
              A decision that blocks the page (what some platforms call an alert): a Dialog with{' '}
              <InlineCode>role=&quot;alertdialog&quot;</InlineCode>.
            </li>
          </ul>
        </section>

        <section className="flex flex-col gap-3">
          <h2 id="behaviour" className="text-headline-small text-on-surface">
            Behaviour
          </h2>
          <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
            <li>
              It is a live region (<InlineCode>alert</InlineCode> for the{' '}
              <InlineCode>error</InlineCode> severity, <InlineCode>status</InlineCode> for the
              others; the default is <InlineCode>info</InlineCode>) that goes into the page first
              and shows its content a moment later, so screen readers announce it even when it
              mounts with its message. One in the server&apos;s HTML shows at once.
            </li>
            <li>It fades in on the default effects spring, under reduced motion too.</li>
            <li>
              To let it leave, set <InlineCode>{'open={false}'}</InlineCode> instead of unmounting
              it: it fades out as its height folds (on the effects easing, so it never bounces),
              then unmounts its content and calls <InlineCode>onClosed</InlineCode>. Under reduced
              motion it only fades, keeping its height until it has gone.
            </li>
            <li>
              <InlineCode>onClose</InlineCode> adds a close button. Before{' '}
              <InlineCode>onClose</InlineCode> runs, focus moves back to where it was before{' '}
              <InlineCode>autoFocus</InlineCode>, or on to the next control, so hiding the alert
              never drops focus to the page.
            </li>
            <li>
              <InlineCode>autoFocus</InlineCode> moves focus to the alert as it appears, for an
              error that blocks a form, and scrolls it into view no further than needed. A keyboard
              user sees the M3 focus indicator on it.
            </li>
            <li>
              Up to two actions move beside the text once the alert is at least 480px wide. Text
              buttons in a tonal alert take its content colour; its close button keeps its size at
              every density.
            </li>
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
            Tonal alerts use the severity&apos;s container and on-container roles; outlined ones
            have no fill and <InlineCode>on-surface</InlineCode> text, with the border and icon in
            the severity&apos;s colour. A test keeps the text at 4.5:1 in every theme, mode and
            contrast level. Set the tokens below on an alert or an ancestor (the root carries{' '}
            <InlineCode>data-tokens=&quot;wm-alert&quot;</InlineCode>, with{' '}
            <InlineCode>data-severity</InlineCode> and <InlineCode>data-variant</InlineCode> picking
            each one&apos;s default), and style the parts with <InlineCode>classNames</InlineCode> (
            <InlineCode>root</InlineCode>, <InlineCode>icon</InlineCode>,{' '}
            <InlineCode>title</InlineCode>, <InlineCode>message</InlineCode>,{' '}
            <InlineCode>actions</InlineCode>, <InlineCode>close</InlineCode>). In forced colours
            every alert keeps a border.
          </p>
          <TokenTable set={alertTokenSet} caption="Alert tokens" />
        </section>
      </>
    ),
  };
}
