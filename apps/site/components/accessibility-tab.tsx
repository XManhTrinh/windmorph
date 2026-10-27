import { Fragment, type ReactNode } from 'react';
import {
  ACCESSIBILITY_SECTIONS,
  isNotApplicable,
  type ComponentAccessibility,
  type KeyBinding,
  type NotApplicable,
  type Notes,
  type ScreenReaderInfo,
} from '../content/components/accessibility/types';
import { codeNameHref } from '../lib/code-name-href';
import { InlineMarkdown } from './inline-markdown';

const TEXT = 'text-body-large text-on-surface-variant';
const LIST = `flex flex-col gap-2 ps-5 ${TEXT} [&>li]:list-disc`;

function Text({ text }: { text: string }) {
  return <InlineMarkdown text={text} resolve={codeNameHref} />;
}

function NoneNote({ value }: { value: NotApplicable }) {
  return (
    <p className={TEXT}>
      <span className="text-on-surface">None.</span> <Text text={value.none} />
    </p>
  );
}

function NoteList({ notes }: { notes: readonly string[] }) {
  if (notes.length === 1) {
    return (
      <p className={TEXT}>
        <Text text={notes[0]!} />
      </p>
    );
  }
  return (
    <ul className={LIST}>
      {notes.map((note) => (
        <li key={note}>
          <Text text={note} />
        </li>
      ))}
    </ul>
  );
}

/** A key as the keyboard labels it. */
function Key({ name }: { name: string }) {
  return (
    <kbd className="inline-block whitespace-nowrap rounded-corner-extra-small border border-outline-variant bg-surface-container-high px-1.5 py-0.5 font-mono text-label-large text-on-surface">
      {name}
    </kbd>
  );
}

/** The keys of one row: each pressed on its own, "or" between them. */
function Keys({ keys }: { keys: readonly string[] }) {
  return (
    <span className="inline-flex flex-wrap items-center gap-x-1.5 gap-y-1">
      {keys.map((key, index) => (
        <Fragment key={key}>
          {index > 0 && <span className="text-body-medium text-on-surface-variant"> or </span>}
          <Key name={key} />
        </Fragment>
      ))}
    </span>
  );
}

function KeyboardTable({ title, rows }: { title: string; rows: readonly KeyBinding[] }) {
  const scoped = rows.some((row) => row.where);
  // Narrow columns whose cells wrap, so the table fits a phone without scrolling; there the
  // "Where" column folds into the action cell (and stays in the Markdown twin's table).
  return (
    <table className="w-full table-fixed border-separate border-spacing-0 overflow-hidden rounded-corner-large border border-outline-variant text-start text-body-medium text-on-surface">
      <caption className="sr-only">{title} keyboard</caption>
      <thead className="bg-surface-container text-label-large text-on-surface-variant">
        <tr>
          <th scope="col" className="px-4 py-3 text-start medium:w-[34%]">
            Key
          </th>
          <th scope="col" className="px-4 py-3 text-start">
            Action
          </th>
          {scoped && (
            <th scope="col" className="hidden w-[24%] px-4 py-3 text-start medium:table-cell">
              Where
            </th>
          )}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={`${row.keys.join()}-${row.where ?? ''}-${row.action}`}>
            <th
              scope="row"
              className="border-t border-outline-variant px-4 py-3 text-start align-top"
            >
              <Keys keys={row.keys} />
            </th>
            <td className="border-t border-outline-variant px-4 py-3 align-top text-on-surface-variant [overflow-wrap:anywhere]">
              <Text text={row.action} />
              {/* Compact windows have no room for a third column: the place goes under. */}
              {row.where && (
                <span
                  data-markdown="skip"
                  className="mt-1 block text-label-medium text-on-surface medium:hidden"
                >
                  <Text text={row.where} />
                </span>
              )}
            </td>
            {scoped && (
              <td className="hidden border-t border-outline-variant px-4 py-3 align-top text-on-surface-variant [overflow-wrap:anywhere] medium:table-cell">
                {row.where ? <Text text={row.where} /> : null}
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ScreenReader({ info }: { info: ScreenReaderInfo }) {
  const rows: [string, string][] = [
    ['Role', info.role],
    ['Accessible name', info.name],
    ['States announced', info.states],
  ];
  return (
    <>
      <dl className="grid grid-cols-1 gap-x-6 gap-y-1 medium:grid-cols-[12rem_minmax(0,1fr)] medium:gap-y-3">
        {rows.map(([term, text]) => (
          <Fragment key={term}>
            <dt className="pt-2 text-title-small text-on-surface first:pt-0 medium:pt-0">{term}</dt>
            <dd className={TEXT}>
              <Text text={text} />
            </dd>
          </Fragment>
        ))}
      </dl>
      {info.notes && info.notes.length > 0 && <NoteList notes={info.notes} />}
    </>
  );
}

function notesOrNone(value: Notes): ReactNode {
  return isNotApplicable(value) ? <NoneNote value={value} /> : <NoteList notes={value} />;
}

/**
 * A component page's Accessibility tab, built from its data: Keyboard, Screen reader, Focus,
 * Touch target, Motion and What you need to do, in that order on every page. Each section
 * has an `h2` with an id, so the "On this page" outline lists them. A section that doesn't
 * apply says so and why. A Server Component.
 */
export function AccessibilityTab({ title, data }: { title: string; data: ComponentAccessibility }) {
  const body: Record<(typeof ACCESSIBILITY_SECTIONS)[number]['key'], ReactNode> = {
    keyboard: isNotApplicable(data.keyboard) ? (
      <NoneNote value={data.keyboard} />
    ) : (
      <>
        <KeyboardTable title={title} rows={data.keyboard} />
        {data.keyboardNotes && data.keyboardNotes.length > 0 && (
          <NoteList notes={data.keyboardNotes} />
        )}
      </>
    ),
    screenReader: isNotApplicable(data.screenReader) ? (
      <NoneNote value={data.screenReader} />
    ) : (
      <ScreenReader info={data.screenReader} />
    ),
    focus: notesOrNone(data.focus),
    touchTarget: notesOrNone(data.touchTarget),
    motion: notesOrNone(data.motion),
    consumer: notesOrNone(data.consumer),
  };
  return (
    <>
      {ACCESSIBILITY_SECTIONS.map((section) => (
        <section key={section.id} className="flex flex-col gap-4" data-a11y-section={section.id}>
          <h2 id={section.id} className="text-headline-small text-on-surface">
            {section.title}
          </h2>
          {body[section.key]}
        </section>
      ))}
    </>
  );
}
