import type { ComponentDoc } from './doc';
import { copyFieldTokenSet } from '@windmorph/react-pro';
import { TokenTable } from '../../components/token-table';
import { InlineCode } from '../../components/inline-code';
import { CodeList, exampleSection } from './example-list';

const TEXT = 'text-body-large text-on-surface-variant';
const LIST = `flex flex-col gap-2 ps-5 ${TEXT} [&>li]:list-disc`;
const HEADING = 'text-headline-small text-on-surface';
const SECTION = 'flex flex-col gap-3';

const SLOTS = ['button', 'icon', 'status', "…every key of the core TextField's classNames"];

/** CopyField page body: examples, when to use it, behaviour, parts and tokens. */
export async function CopyFieldBody(): Promise<ComponentDoc> {
  const overview = await exampleSection([
    {
      title: 'Filled and outlined',
      file: 'copy-field/copy-field-variants',
      name: 'CopyFieldVariants',
    },
    {
      title: 'Copying something other than what shows',
      file: 'copy-field/copy-field-masked',
      name: 'CopyFieldMasked',
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
            A read-only value with a copy button and its own confirmation, for invite links,
            identifiers and addresses. To let someone type, use a TextField.
          </p>
        </section>
        <section className={SECTION}>
          <h2 id="behaviour" className={HEADING}>
            Behaviour
          </h2>
          <ul className={LIST}>
            <li>
              The icon changes and the button&apos;s name changes, for{' '}
              <InlineCode>confirmationDuration</InlineCode>, and the result is announced. No
              snackbar is needed.
            </li>
            <li>
              It copies with the Clipboard API, falls back to a selection on an insecure origin, and
              reports a failure through the failed state and <InlineCode>onCopyError</InlineCode>.
            </li>
            <li>
              <InlineCode>copyValue</InlineCode> copies something other than{' '}
              <InlineCode>value</InlineCode>, such as the whole of a masked key.
            </li>
            <li>Focus in the field selects its text.</li>
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
          Set the tokens below on the field or any ancestor. The field and button keep the
          core&apos;s own tokens. Style each part with <InlineCode>classNames</InlineCode>:{' '}
          <CodeList names={SLOTS} />.
        </p>
        <TokenTable set={copyFieldTokenSet} caption="CopyField tokens" />
      </section>
    ),
  };
}
