import type { ComponentDoc } from './doc';
import { popoverTokenSet } from '@windmorph/react-pro';
import { TokenTable } from '../../components/token-table';
import { InlineCode } from '../../components/inline-code';
import { CodeList, exampleSection } from './example-list';

const TEXT = 'text-body-large text-on-surface-variant';
const LIST = `flex flex-col gap-2 ps-5 ${TEXT} [&>li]:list-disc`;
const HEADING = 'text-headline-small text-on-surface';
const SECTION = 'flex flex-col gap-3';

const SLOTS = ['root', 'panel', 'content', 'header', 'close'];

/** Popover page body: examples, when to use it, behaviour, parts and tokens. */
export async function PopoverBody(): Promise<ComponentDoc> {
  const overview = await exampleSection([
    { title: 'An account card', file: 'popover/popover-account', name: 'PopoverAccount' },
    { title: 'A small form, controlled', file: 'popover/popover-form', name: 'PopoverForm' },
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
            An anchored panel of any content: a notifications list, an account card, a small form.
            For a list of actions use a Menu, for a few words a Tooltip, and for a task that needs
            full attention a Dialog.
          </p>
        </section>
        <section className={SECTION}>
          <h2 id="behaviour" className={HEADING}>
            Behaviour
          </h2>
          <ul className={LIST}>
            <li>
              Focus moves into the panel as it opens, stays inside, and returns to the trigger as it
              closes.
            </li>
            <li>
              <InlineCode>closedBy</InlineCode> sets what closes it: <InlineCode>any</InlineCode>{' '}
              for a press outside and Escape, <InlineCode>closerequest</InlineCode> for Escape,{' '}
              <InlineCode>none</InlineCode> for neither.
            </li>
            <li>
              It follows its anchor as the page scrolls and resizes.{' '}
              <InlineCode>triggerRef</InlineCode> anchors it to another element, and{' '}
              <InlineCode>placement</InlineCode> takes Menu&apos;s values.
            </li>
            <li>
              With <InlineCode>fullScreenOnCompact</InlineCode>, below 600px wide it fills the
              window with a close button.
            </li>
          </ul>
        </section>
      </>
    ),
    api: (
      <section className={SECTION}>
        <h2 id="theming-and-tokens" className={HEADING}>
          Theming &amp; tokens
        </h2>
        <p className={TEXT}>
          Set the tokens below on the panel or any ancestor, such as <InlineCode>:root</InlineCode>,
          since it renders in a portal. Style each part with <InlineCode>classNames</InlineCode>:{' '}
          <CodeList names={SLOTS} />.
        </p>
        <TokenTable set={popoverTokenSet} caption="Popover tokens" />
      </section>
    ),
  };
}
