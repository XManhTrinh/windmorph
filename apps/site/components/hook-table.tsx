import { CodeBlock } from '@windmorph/react-pro';
import type { HookDocFile } from '../lib/component-props';
import { highlightSource } from '../lib/highlight';
import { CodeText } from './code-text';
import { InlineCode } from './inline-code';
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
      {doc.description && (
        <p className="whitespace-pre-line text-body-medium text-on-surface-variant">
          <CodeText text={doc.description.replace(/\n(?!\n)/g, ' ')} />
        </p>
      )}
      {doc.params.length > 0 && <PropsList caption={`${name} parameters`} rows={doc.params} />}
      <p className="text-body-medium text-on-surface-variant">
        <span className="text-on-surface">Returns</span>{' '}
        <InlineCode dir="ltr">{doc.returns.type}</InlineCode>
        {doc.returns.description && <>: {doc.returns.description}</>}
      </p>
      {doc.returns.fields.length > 0 && (
        <PropsList caption={`${name} returns`} rows={doc.returns.fields} />
      )}
    </div>
  );
}
