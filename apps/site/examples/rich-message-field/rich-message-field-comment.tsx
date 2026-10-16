'use client';

import { Avatar } from '@windmorph/react-pro';
import { FormattedText, RichMessageField } from '@windmorph/react-pro/rich-text';
import { useState } from 'react';

/**
 * A comment field that formats as you type, with markers in plain text: Aa shows the
 * formatting toolbar, and `*bold*`, `_italic_`, `` `code` ``, `- ` or ```` ``` ```` typed turn
 * into formatting. It hands out the marker format, which `FormattedText` shows once posted.
 */
export function RichMessageFieldComment() {
  const [comments, setComments] = useState([
    'Count me in! I’ll bring *spring rolls* and `dipping sauce`.',
  ]);

  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <ul className="flex flex-col gap-2" aria-label="Comments">
        {comments.map((comment, index) => (
          <li
            key={index}
            className="rounded-corner-large bg-surface-container px-4 py-2 text-body-medium text-on-surface"
          >
            <FormattedText text={comment} />
          </li>
        ))}
      </ul>
      <RichMessageField
        aria-label="Write a comment"
        placeholder="Write a comment…"
        leading={<Avatar name="Alex Morgan" decorative size="md" />}
        expandOnFocus
        sendVariant="standard"
        maxLength={500}
        clearOnSubmit
        onSubmit={(text) => setComments((current) => [...current, text])}
      />
    </div>
  );
}
