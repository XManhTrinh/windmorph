import type { ComponentDoc } from './doc';
import { InlineCode } from '../../components/inline-code';
import { exampleSection } from './example-list';

const TEXT = 'text-body-large text-on-surface-variant';
const LIST = `flex flex-col gap-2 ps-5 ${TEXT} [&>li]:list-disc`;
const HEADING = 'text-headline-small text-on-surface';
const SECTION = 'flex flex-col gap-3';

/** TimeField page body: examples, when to use it and how it reads what's typed. */
export async function TimeFieldBody(): Promise<ComponentDoc> {
  const overview = await exampleSection([
    {
      title: 'Typing, and a 24-hour clock',
      file: 'time-field/time-field-formats',
      name: 'TimeFieldFormats',
    },
    {
      title: 'Controlled, with limits',
      file: 'time-field/time-field-schedule',
      name: 'TimeFieldSchedule',
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
            The time sibling of DateField, for forms that hold many times, such as a weekly
            schedule: one compact field per time that takes what people type, with the TimePicker a
            press away. For a single, deliberate choice, a TimePicker in a PickerDialog alone suits.
          </p>
        </section>
        <section className={SECTION}>
          <h2 id="behaviour" className={HEADING}>
            Behaviour
          </h2>
          <ul className={LIST}>
            <li>
              It reads 9, 930, 0930, 9:30, 9.30, 9h30, 21:30, 9pm and 9:30 pm, with the
              locale&apos;s digits and day periods, and normalizes them on blur and Enter.
            </li>
            <li>
              Unreadable or out-of-range text stays as typed with an inline error, and the value is
              unchanged until it&apos;s put right. <InlineCode>9:3</InlineCode> is refused: it could
              mean 9:03 or 9:30.
            </li>
            <li>
              <InlineCode>value</InlineCode> is a <InlineCode>Time</InlineCode> or{' '}
              <InlineCode>null</InlineCode>. <InlineCode>Time</InlineCode> and{' '}
              <InlineCode>parseTime</InlineCode> are exported, so an app needs no date library.
            </li>
            <li>
              The picker opens from the clock, is full screen below 600px, and loads on demand, so a
              form of many fields carries none of it.
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
          It has no tokens of its own: M3 has no time field, so the field and button take the text
          field&apos;s and icon button&apos;s tokens.
        </p>
      </section>
    ),
  };
}
