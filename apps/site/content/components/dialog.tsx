import { ExampleViewer } from '../../components/example-viewer';
import { DialogAlert } from '../../examples/dialog/dialog-alert';
import { DialogBasic } from '../../examples/dialog/dialog-basic';
import { DialogFullScreen } from '../../examples/dialog/dialog-full-screen';
import { DialogScrollable } from '../../examples/dialog/dialog-scrollable';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';
import { InlineCode } from '../../components/inline-code';

/** Dialog page body: the flat parts, basic, alert, scrollable and full-screen dialogs. */
export async function DialogBody() {
  const [basic, alert, scrollable, fullScreen] = await Promise.all([
    readExampleSource('dialog/dialog-basic.tsx'),
    readExampleSource('dialog/dialog-alert.tsx'),
    readExampleSource('dialog/dialog-scrollable.tsx'),
    readExampleSource('dialog/dialog-full-screen.tsx'),
  ]);
  const [basicHtml, alertHtml, scrollableHtml, fullScreenHtml] = await Promise.all([
    highlightSource(basic),
    highlightSource(alert),
    highlightSource(scrollable),
    highlightSource(fullScreen),
  ]);

  return (
    <>
      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Purpose</h2>
        <p className="text-body-large text-on-surface-variant">
          A dialog is a modal surface that interrupts the user for a focused task or an important
          decision. A basic dialog is an alert dialog on the web, as the spec says: it needs a
          decision and isn&apos;t dismissed by pressing outside. Set{' '}
          <InlineCode>role=&quot;dialog&quot;</InlineCode> (or <InlineCode>dismissable</InlineCode>)
          for one a press outside may close. For non-blocking supplementary content prefer a sheet,
          and for a brief message prefer a snackbar.
        </p>
        <p className="text-body-large text-on-surface-variant">
          A dialog is a component, not a composite: open it from a{' '}
          <InlineCode>DialogTrigger</InlineCode> (trigger first, dialog second) or control it with{' '}
          <InlineCode>open</InlineCode> / <InlineCode>onOpenChange</InlineCode>. Its anatomy is the
          flat parts <InlineCode>DialogTitle</InlineCode>, <InlineCode>DialogContent</InlineCode>{' '}
          and <InlineCode>DialogActions</InlineCode>.
        </p>
        <p className="text-body-large text-on-surface-variant">
          On compact windows, a task with several fields or a form is clearer as a{' '}
          <strong className="text-on-surface">full-screen dialog</strong>:{' '}
          <InlineCode>fullScreen=&quot;compact&quot;</InlineCode> fills the window below 600px and
          stays a basic dialog above it. Give it a <InlineCode>DialogHeader</InlineCode>, which
          holds the close button, the headline and the confirming action in full screen. Without
          that action, the <InlineCode>DialogActions</InlineCode> become a 56px bottom action bar;{' '}
          <InlineCode>divider</InlineCode> draws a line under the header.{' '}
          <InlineCode>fullScreen=&quot;always&quot;</InlineCode> fills every window, but the spec
          keeps full-screen dialogs to compact windows.
        </p>
        <p className="text-body-large text-on-surface-variant">
          A basic dialog is centred; <InlineCode>placement</InlineCode> (
          <InlineCode>top</InlineCode>, <InlineCode>bottom</InlineCode>,{' '}
          <InlineCode>start</InlineCode>, <InlineCode>end</InlineCode>) moves it, keeping 56px from
          the edges of wider windows (24px on compact ones).
        </p>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-headline-small text-on-surface">Examples</h2>
        <ExampleViewer
          title="Basic dialog"
          code={basic}
          html={basicHtml}
          fileName="dialog-basic.tsx"
        >
          <DialogBasic />
        </ExampleViewer>
        <ExampleViewer
          title="Alert dialog"
          code={alert}
          html={alertHtml}
          fileName="dialog-alert.tsx"
        >
          <DialogAlert />
        </ExampleViewer>
        <ExampleViewer
          title="Scrollable content"
          code={scrollable}
          html={scrollableHtml}
          fileName="dialog-scrollable.tsx"
        >
          <DialogScrollable />
        </ExampleViewer>
        <ExampleViewer
          title="Full screen on compact windows"
          code={fullScreen}
          html={fullScreenHtml}
          fileName="dialog-full-screen.tsx"
        >
          <DialogFullScreen />
        </ExampleViewer>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Keyboard &amp; screen reader</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            Opening the dialog moves focus to its first interactive element (or to an element marked{' '}
            <InlineCode>autoFocus</InlineCode>) and contains focus there; closing it returns focus
            to the trigger. The page behind does not scroll and is hidden from assistive tech.
          </li>
          <li>
            The <InlineCode>DialogTitle</InlineCode> names the dialog (or supply{' '}
            <InlineCode>aria-label</InlineCode>), and an alert dialog is described by its{' '}
            <InlineCode>DialogContent</InlineCode>. An <InlineCode>icon</InlineCode> is decorative
            and centres the title.
          </li>
          <li>
            Escape closes the dialog unless <InlineCode>keyboardDismissDisabled</InlineCode> is set.
            A press outside closes a <InlineCode>role=&quot;dialog&quot;</InlineCode> (and
            full-screen dialogs), but not the default alert dialog.
          </li>
          <li>
            Long content scrolls inside the panel; when the actions don&apos;t fit on one line they
            stack with the confirming action (last) on top.
          </li>
          <li>
            In full screen, the header&apos;s close button (named by{' '}
            <InlineCode>closeLabel</InlineCode>) closes the dialog and Escape still works. Hidden{' '}
            <InlineCode>DialogActions</InlineCode> are out of the accessibility tree, so each action
            is announced once.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Differences from Compose</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            Values follow Compose&apos;s <InlineCode>AlertDialog.kt</InlineCode> and the dialog
            tokens: 280–560px wide, 24px padding, 28px corners,{' '}
            <InlineCode>surface-container-high</InlineCode> at level 3, a 32% scrim.
          </li>
          <li>
            Stacked actions put the confirm action on top, matching Compose&apos;s flipped{' '}
            <InlineCode>FlowRow</InlineCode>.
          </li>
          <li>
            Motion is not from Compose (which uses platform window animations). The spec avoids
            scale motion, so the panel fades while it expands downward from its top edge (a
            clip-path reveal) on a library-owned wrapper with no transform. Reduced motion keeps
            only the fade.
          </li>
          <li>
            Moved to the components layer because its core is the <InlineCode>Overlay</InlineCode>{' '}
            primitive and React Aria hooks.
          </li>
          <li>
            Compose has no full-screen dialog component; the full-screen type follows the M3 dialog
            spec: <InlineCode>surface-container-high</InlineCode> with no corners or elevation, a
            56px header with a <InlineCode>title-large</InlineCode> headline, and the panel sliding
            up 48px as it fades in on the slow springs.
          </li>
        </ul>
      </section>
    </>
  );
}
