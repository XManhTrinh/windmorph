import { CodeBlock } from '@windmorph/react-pro';
import type { HookDocFile } from '../lib/component-props';
import { highlightSource } from '../lib/highlight';
import { codeNameHref } from '../lib/code-name-href';
import { markdownParagraphs } from '../lib/inline-markdown';
import { InlineCode } from './inline-code';
import { InlineMarkdown } from './inline-markdown';
import { PropsList } from './props-list';

/**
 * A hook documented as a function on a component's API tab: its signature, what it does, a
 * table of its parameters (an options object field by field) and what it returns. Generated
 * from the library's types with the props tables. A Server Component.
 */
export async function HookTable({ doc }: { doc: HookDocFile }) {
  const name = doc.displayName;
  const signatureHtml = await highlightSource(doc.signature, 'ts');
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-title-medium text-on-surface">
        <InlineCode dir="ltr">{name}</InlineCode>
      </h3>
      <CodeBlock
        code={doc.signature}
        html={signatureHtml}
        lang="ts"
        title={`${name} signature`}
        copyable={false}
      />
      {doc.description &&
        markdownParagraphs(doc.description).map((paragraph, index) => (
          <p key={index} className="text-body-medium text-on-surface-variant">
            <InlineMarkdown text={paragraph} resolve={codeNameHref} />
          </p>
        ))}
      {doc.params.length > 0 && (
        <PropsList caption={`${name} parameters`} scope={name} props={doc.params} />
      )}
      <p className="text-body-medium text-on-surface-variant">
        <span className="text-on-surface">Returns</span>{' '}
        <InlineCode dir="ltr">{doc.returns.type}</InlineCode>
        {doc.returns.description && (
          <>
            : <InlineMarkdown text={doc.returns.description} resolve={codeNameHref} />
          </>
        )}
      </p>
      {doc.returns.fields.length > 0 && (
        <PropsList
          caption={`${name} returns`}
          scope={`${name}-returns`}
          props={doc.returns.fields}
        />
      )}
    </div>
  );
}
