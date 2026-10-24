import type { TypeDocFile } from '../lib/component-props';
import { codeNameHref } from '../lib/code-name-href';
import { markdownParagraphs } from '../lib/inline-markdown';
import { InlineCode } from './inline-code';
import { InlineMarkdown } from './inline-markdown';
import { PropsList } from './props-list';

/**
 * A data type a component's props take (an item of a collection prop), documented on its
 * API tab field by field: what it is, then a table of its fields. Generated from the
 * library's types with the props tables. A Server Component.
 */
export function TypeTable({ doc }: { doc: TypeDocFile }) {
  const name = doc.displayName;
  return (
    <div className="flex flex-col gap-3">
      <h3
        id={`type-${name}`}
        data-outline-label={name}
        className="flex flex-wrap items-baseline gap-x-3 scroll-mt-2"
      >
        <InlineCode dir="ltr">{name}</InlineCode>{' '}
        <span className="text-body-medium text-on-surface-variant">
          {doc.fields.length} {doc.fields.length === 1 ? 'field' : 'fields'}
        </span>
      </h3>
      {doc.description &&
        markdownParagraphs(doc.description).map((paragraph, index) => (
          <p key={index} className="text-body-medium text-on-surface-variant">
            <InlineMarkdown text={paragraph} resolve={codeNameHref} />
          </p>
        ))}
      <PropsList caption={`${name} fields`} scope={name} props={doc.fields} />
    </div>
  );
}
