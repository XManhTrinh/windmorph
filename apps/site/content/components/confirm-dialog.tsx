import type { ComponentDoc } from './doc';
import { confirmDialogTokenSet } from '@windmorph/react-pro';
import { TokenTable } from '../../components/token-table';
import { InlineCode } from '../../components/inline-code';
import { CodeList, exampleSection } from './example-list';

const TEXT = 'text-body-large text-on-surface-variant';
const LIST = `flex flex-col gap-2 ps-5 ${TEXT} [&>li]:list-disc`;
const HEADING = 'text-headline-small text-on-surface';
const SECTION = 'flex flex-col gap-3';

const SLOTS = [
  'scrim',
  'positioner',
  'panel',
  'icon',
  'title',
  'content',
  'description',
  'error',
  'actions',
  'cancel',
  'confirm',
];

/** ConfirmDialog page body: examples, when to use it, behaviour, parts and tokens. */
export async function ConfirmDialogBody(): Promise<ComponentDoc> {
  const overview = await exampleSection([
    {
      title: "An action that can't be undone, by promise",
      file: 'confirm-dialog/confirm-dialog-remove',
      name: 'ConfirmDialogRemove',
    },
    {
      title: 'From a trigger, with no state',
      file: 'confirm-dialog/confirm-dialog-trigger',
      name: 'ConfirmDialogTrigger',
    },
    {
      title: 'With a field the decision needs',
      file: 'confirm-dialog/confirm-dialog-content',
      name: 'ConfirmDialogContent',
    },
    {
      title: 'Leaving with unsaved changes',
      file: 'confirm-dialog/confirm-dialog-unsaved',
      name: 'ConfirmDialogUnsaved',
    },
    {
      title: 'The actions as a part, in a form dialog',
      file: 'confirm-dialog/confirm-dialog-form',
      name: 'ConfirmDialogForm',
    },
  ]);
  return {
    overview,
    guidelines: (
      <>
        <section className={SECTION}>
          <h2 id="purpose" className={HEADING}>
            Purpose
          </h2>
          <p className={TEXT}>
            One dialog for the moment an app asks &quot;are you sure?&quot; before something takes
            effect at once: deleting, removing, discarding unsaved work, signing out everywhere. It
            asks one question, says what will happen, and offers two actions: one that backs out and
            one named for what it does.
          </p>
          <p className={TEXT}>
            M3 has the basic dialog, and the core&apos;s <InlineCode>Dialog</InlineCode> is it. M3
            defines nothing around a confirmation: where focus starts, what happens while the action
            runs, where a failure shows. This component decides those once. For anything that
            isn&apos;t a yes-or-no decision, use a <InlineCode>Dialog</InlineCode>.
          </p>
        </section>
        <section className={SECTION}>
          <h2 id="behaviour" className={HEADING}>
            Behaviour
          </h2>
          <ul className={LIST}>
            <li>
              It is an alert dialog, small at every width. Escape and the back gesture back out as
              Cancel does, through <InlineCode>onCancel</InlineCode>; a press on the scrim does
              nothing, and there is no close button.
            </li>
            <li>
              <InlineCode>confirmLabel</InlineCode> is required and says what happens
              (&quot;Remove&quot;, &quot;Delete post&quot;), never &quot;OK&quot;. Both actions are
              text buttons, as M3 asks of dialogs, with the one that backs out first.
            </li>
            <li>
              While the action runs the acting button is pending, Cancel is disabled and nothing
              closes the dialog, so the action can&apos;t be abandoned or pressed twice. Set{' '}
              <InlineCode>pending</InlineCode> yourself, or return a promise from{' '}
              <InlineCode>onConfirm</InlineCode>: the dialog is pending until it settles, closes
              when it resolves and stays open when it rejects.
            </li>
            <li>
              When <InlineCode>onConfirm</InlineCode> returns nothing, a dialog with{' '}
              <InlineCode>open</InlineCode> stays open for you to close, and one in a{' '}
              <InlineCode>DialogTrigger</InlineCode> closes at once.
            </li>
            <li>
              A failure stays in the dialog: pass your words as <InlineCode>error</InlineCode>. It
              shows in an alert above the content, is announced, and focus moves to the acting
              button so Enter tries again. It hides while a retry runs.
            </li>
            <li>
              <InlineCode>destructive</InlineCode> marks an action that can&apos;t be undone: the
              acting button takes the <InlineCode>error</InlineCode> role. The label still names the
              action, so colour is never the only sign.
            </li>
            <li>
              Anything else the decision needs (a password, a reason, a one-time code) goes in as
              children, between the description and the actions.
            </li>
            <li>It opens over another dialog or a sheet, and Escape closes only the one on top.</li>
          </ul>
        </section>
        <section className={SECTION}>
          <h2 id="the-actions-as-a-part" className={HEADING}>
            The actions as a part
          </h2>
          <p className={TEXT}>
            <InlineCode>ConfirmDialogActions</InlineCode> is the same row the dialog uses, for a
            form in a core <InlineCode>Dialog</InlineCode>: Cancel, then one acting button with{' '}
            <InlineCode>pending</InlineCode>. With <InlineCode>type=&quot;submit&quot;</InlineCode>{' '}
            the acting button submits the form it sits in.
          </p>
        </section>
      </>
    ),
    api: (
      <section className={SECTION}>
        <h2 id="theming-and-tokens" className={HEADING}>
          Theming &amp; tokens
        </h2>
        <p className={TEXT}>
          Set the tokens below on the dialog or any ancestor. The dialog, its buttons and the
          failure&apos;s alert keep their own tokens, so a theme reaches them as anywhere else.{' '}
          <InlineCode>className</InlineCode> goes on the full-window layer around the dialog, as on
          the core <InlineCode>Dialog</InlineCode>; style each part with{' '}
          <InlineCode>classNames</InlineCode>: <CodeList names={SLOTS} />.
        </p>
        <TokenTable set={confirmDialogTokenSet} caption="ConfirmDialog tokens" />
      </section>
    ),
  };
}
