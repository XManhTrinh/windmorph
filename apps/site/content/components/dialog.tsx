import { dialogTokenSet } from '@windmorph/react';
import type { ComponentDoc } from './doc';
import { ExampleViewer } from '../../components/example-viewer';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';
import { InlineCode } from '../../components/inline-code';
import { lazyExample } from '../../lib/lazy-example';

const DialogAlert = lazyExample('dialog/dialog-alert', 'DialogAlert');
const DialogBasic = lazyExample('dialog/dialog-basic', 'DialogBasic');
const DialogCustomPosition = lazyExample('dialog/dialog-custom-position', 'DialogCustomPosition');
const DialogContainerTransform = lazyExample(
  'dialog/dialog-container-transform',
  'DialogContainerTransform',
);
const DialogDiscard = lazyExample('dialog/dialog-discard', 'DialogDiscard');
const DialogDividers = lazyExample('dialog/dialog-dividers', 'DialogDividers');
const DialogFullScreen = lazyExample('dialog/dialog-full-screen', 'DialogFullScreen');
const DialogScrollable = lazyExample('dialog/dialog-scrollable', 'DialogScrollable');
const DialogIcon = lazyExample('dialog/dialog-icon', 'DialogIcon');
const DialogPlacement = lazyExample('dialog/dialog-placement', 'DialogPlacement');

/**
 * Dialog page body: the flat parts, basic, alert, scrollable, divided and full-screen
 * dialogs, the container transform from a FAB, discard confirmation, and the spec's rules.
 */
export async function DialogBody(): Promise<ComponentDoc> {
  const [basic, alert, scrollable, dividers, fullScreen, transform, discard] = await Promise.all([
    readExampleSource('dialog/dialog-basic.tsx'),
    readExampleSource('dialog/dialog-alert.tsx'),
    readExampleSource('dialog/dialog-scrollable.tsx'),
    readExampleSource('dialog/dialog-dividers.tsx'),
    readExampleSource('dialog/dialog-full-screen.tsx'),
    readExampleSource('dialog/dialog-container-transform.tsx'),
    readExampleSource('dialog/dialog-discard.tsx'),
  ]);
  const [
    basicHtml,
    alertHtml,
    scrollableHtml,
    dividersHtml,
    fullScreenHtml,
    transformHtml,
    discardHtml,
  ] = await Promise.all([
    highlightSource(basic),
    highlightSource(alert),
    highlightSource(scrollable),
    highlightSource(dividers),
    highlightSource(fullScreen),
    highlightSource(transform),
    highlightSource(discard),
  ]);

  const iconDialog = await readExampleSource('dialog/dialog-icon.tsx');
  const iconDialogHtml = await highlightSource(iconDialog);

  const placement = await readExampleSource('dialog/dialog-placement.tsx');
  const placementHtml = await highlightSource(placement);

  const customPosition = await readExampleSource('dialog/dialog-custom-position.tsx');
  const customPositionHtml = await highlightSource(customPosition);

  return {
    tokens: [dialogTokenSet],
    overview: (
      <>
        <section className="flex flex-col gap-6">
          <h2 id="examples" className="text-headline-small text-on-surface">
            Examples
          </h2>
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
            title="With an icon"
            code={iconDialog}
            html={iconDialogHtml}
            fileName="dialog-icon.tsx"
          >
            <DialogIcon />
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
            title="Placement"
            code={placement}
            html={placementHtml}
            fileName="dialog-placement.tsx"
          >
            <DialogPlacement />
          </ExampleViewer>
          <ExampleViewer
            title="Custom position"
            code={customPosition}
            html={customPositionHtml}
            fileName="dialog-custom-position.tsx"
          >
            <DialogCustomPosition />
          </ExampleViewer>
          <ExampleViewer
            title="Dividers and a choice"
            code={dividers}
            html={dividersHtml}
            fileName="dialog-dividers.tsx"
          >
            <DialogDividers />
          </ExampleViewer>
          <ExampleViewer
            title="Full screen on compact windows"
            code={fullScreen}
            html={fullScreenHtml}
            fileName="dialog-full-screen.tsx"
          >
            <DialogFullScreen />
          </ExampleViewer>
          <ExampleViewer
            title="From a FAB (container transform)"
            code={transform}
            html={transformHtml}
            fileName="dialog-container-transform.tsx"
          >
            <DialogContainerTransform />
          </ExampleViewer>
          <ExampleViewer
            title="Discarding unsaved changes"
            code={discard}
            html={discardHtml}
            fileName="dialog-discard.tsx"
          >
            <DialogDiscard />
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
            A dialog is a modal surface that interrupts the user for a focused task or an important
            decision. A basic dialog is an alert dialog on the web, as the spec says: it needs a
            decision and isn&apos;t dismissed by pressing outside. Set{' '}
            <InlineCode>role=&quot;dialog&quot;</InlineCode> (or{' '}
            <InlineCode>dismissable</InlineCode>) for one a press outside may close. For
            non-blocking supplementary content prefer a sheet, and for a brief message prefer a
            snackbar.
          </p>
          <p className="text-body-large text-on-surface-variant">
            A dialog is a component, not a composite: open it from a{' '}
            <InlineCode>DialogTrigger</InlineCode> (trigger first, dialog second) or control it with{' '}
            <InlineCode>open</InlineCode> / <InlineCode>onOpenChange</InlineCode>. Its anatomy is
            the flat parts <InlineCode>DialogTitle</InlineCode>,{' '}
            <InlineCode>DialogContent</InlineCode> and <InlineCode>DialogActions</InlineCode>.
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
            <InlineCode>start</InlineCode>, <InlineCode>end</InlineCode>) moves it, keeping 56px
            from the edges of wider windows (24px on compact ones). It expands away from the edge it
            sits against as it opens. For any other spot, such as a corner near the controls that
            opened it, align it with <InlineCode>classNames.positioner</InlineCode> (
            <InlineCode>items-*</InlineCode> and <InlineCode>justify-*</InlineCode> classes): the
            positioner&apos;s padding keeps the same margin. <InlineCode>className</InlineCode> and{' '}
            <InlineCode>style</InlineCode> go on the outermost element, a full-window layer around
            the positioner; style the dialog&apos;s surface with{' '}
            <InlineCode>classNames.panel</InlineCode>.
          </p>
          <p className="text-body-large text-on-surface-variant">
            <InlineCode>dividers</InlineCode> on <InlineCode>DialogContent</InlineCode> draws the
            spec&apos;s optional dividers above and below the content, for example around a list. A
            full-screen dialog opened from a FAB can grow out of it:{' '}
            <InlineCode>origin=&quot;trigger&quot;</InlineCode> (or an element, or a box) gives the
            container transform the spec asks for.
          </p>
        </section>
        <section className="flex flex-col gap-3">
          <h2 id="actions-and-writing" className="text-headline-small text-on-surface">
            Actions and writing
          </h2>
          <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
            <li>
              Use at most two actions. A single action must be an acknowledgement (&quot;OK&quot;,
              &quot;Got it&quot;); with two, one confirms and the other dismisses. Don&apos;t add a
              third such as &quot;Learn more&quot;: it leaves the task unfinished. Show more inline,
              or before the dialog opens. In development, <InlineCode>DialogActions</InlineCode>{' '}
              warns once when it holds more than two actions.
            </li>
            <li>
              Put the dismissive action first and the confirming action last, so it sits closest to
              the trailing edge (and on top when they stack). Both are text buttons.
            </li>
            <li>
              Write the headline as a brief, clear statement or question (&quot;Discard
              draft?&quot;). Avoid apologies (&quot;Sorry for the interruption&quot;), alarm
              (&quot;Warning!&quot;) and ambiguity (&quot;Are you sure?&quot;). In a full-screen
              dialog, put a long headline in the content rather than the header.
            </li>
            <li>
              When the dialog asks for a choice, disable the confirming action until one is made;
              never disable the dismissive action. A full-screen dialog&apos;s confirming action
              (&quot;Save&quot;, &quot;Create&quot;, &quot;Send&quot;) says what happens and is
              never disabled.
            </li>
            <li>
              When a full-screen dialog with unsaved changes is closed, confirm in a basic dialog
              that the changes should be discarded. Don&apos;t use the confirming action to dismiss.
            </li>
            <li>
              Show errors about fields inline, where they occur, all at once. Show a general error
              (a failed save) in a basic dialog when the confirming action fails.
            </li>
            <li>
              Use dialogs sparingly, for high-priority information or decisions. A snackbar suits
              low or medium priority; only a full-screen dialog may have another dialog over it.
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
              Opening the dialog moves focus to its first interactive element (or to an element
              marked <InlineCode>autoFocus</InlineCode>) and contains focus there; closing it
              returns focus to the trigger. The page behind does not scroll and is hidden from
              assistive tech.
            </li>
            <li>
              The <InlineCode>DialogTitle</InlineCode> names the dialog (or supply{' '}
              <InlineCode>aria-label</InlineCode>), and an alert dialog is described by its{' '}
              <InlineCode>DialogContent</InlineCode>. An <InlineCode>icon</InlineCode> is decorative
              and centres the title.
            </li>
            <li>
              Escape closes the dialog unless <InlineCode>keyboardDismissDisabled</InlineCode> is
              set. A press outside closes a <InlineCode>role=&quot;dialog&quot;</InlineCode> (and
              full-screen dialogs), but not the default alert dialog.
            </li>
            <li>
              Long content scrolls inside the panel, with the title and actions pinned. While it
              scrolls, <InlineCode>DialogContent</InlineCode> is focusable (Tab and Shift+Tab reach
              it, with a focus ring) so the keyboard can scroll it; initial focus still goes to the
              first control. When the actions don&apos;t fit on one line they stack with the
              confirming action (last) on top.
            </li>
            <li>
              In full screen, the header&apos;s close button (named by{' '}
              <InlineCode>closeLabel</InlineCode>) closes the dialog and Escape still works. Hidden{' '}
              <InlineCode>DialogActions</InlineCode> are out of the accessibility tree, so each
              action is announced once.
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
              Values follow Compose&apos;s <InlineCode>AlertDialog.kt</InlineCode> and the dialog
              tokens: 280–560px wide (the minimum narrows only to keep 24px from a very narrow
              window&apos;s edges), 24px padding, 28px corners,{' '}
              <InlineCode>surface-container-high</InlineCode> at level 3, a 32% scrim.
            </li>
            <li>
              Stacked actions put the confirm action on top, matching Compose&apos;s flipped{' '}
              <InlineCode>FlowRow</InlineCode>.
            </li>
            <li>
              Motion is not from Compose (which uses platform window animations). The spec avoids
              scale motion, so the panel fades while it expands away from the window edge it sits
              against (downward when centred or at the top, upward at the bottom, along the x axis
              at the start or end; a clip-path reveal) on a library-owned wrapper with no transform.
              Reduced motion keeps only the fade, entering and leaving.
            </li>
            <li>
              Compose has no full-screen dialog component; the full-screen type follows the M3
              dialog spec: <InlineCode>surface-container-high</InlineCode> with no corners or
              elevation, a 56px header with an <InlineCode>on-surface</InlineCode> close icon and a{' '}
              <InlineCode>title-large</InlineCode> headline, content padded 24px at the top and
              sides, and the panel sliding up 48px as it fades in on the slow springs. With{' '}
              <InlineCode>origin</InlineCode> it is a container transform instead: the clip, corners
              and container colour move from the origin to the window on the slow spatial spring,
              and back on the fast springs.
            </li>
          </ul>
        </section>
      </>
    ),
  };
}
