import { Fragment } from 'react';
import { InlineCode } from './inline-code';

/**
 * Plain text from the catalog's data with its `code` spans set as inline code, so a note can
 * name a prop (`expandedRatio`) the way running text does. A Server Component.
 */
export function CodeText({ text }: { text: string }) {
  return text.split('`').map((part, index) =>
    index % 2 === 1 ? (
      <InlineCode key={index} dir="ltr">
        {part}
      </InlineCode>
    ) : (
      <Fragment key={index}>{part}</Fragment>
    ),
  );
}
