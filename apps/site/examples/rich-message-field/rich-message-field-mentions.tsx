'use client';

import { Avatar } from '@windmorph/react-pro';
import { FormattedText, RichMessageField } from '@windmorph/react-pro/rich-text';
import { useState } from 'react';

const PEOPLE = [
  { id: 'u1', label: 'Alex Kim', description: '@alex.kim · Friend' },
  { id: 'u2', label: 'Sam Lee', description: '@sam.lee · Friend' },
  { id: 'u3', label: 'Jordan Park', description: '@jordan.park · Following' },
  { id: 'u4', label: 'Riley Chen', description: '@riley.chen' },
];

/**
 * Mentions: `@` and a name suggest people (the app's search decides who, and in what order),
 * a picked person goes in as one `@Name` token, and the text stores `<@id|Name>`, which
 * `FormattedText` shows. Here each mention links to a profile with `renderMention`.
 */
export function RichMessageFieldMentions() {
  const [comments, setComments] = useState(['Soup night was great, thanks <@u1|Alex Kim>!']);

  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <ul className="flex flex-col gap-2" aria-label="Comments">
        {comments.map((comment, index) => (
          <li
            key={index}
            className="rounded-corner-large bg-surface-container px-4 py-2 text-body-medium text-on-surface"
          >
            <FormattedText
              text={comment}
              renderMention={({ id, label }) => (
                <a href={`#demo-person-${id}`} className="wm-mention hover:underline">
                  {label}
                </a>
              )}
            />
          </li>
        ))}
      </ul>
      <RichMessageField
        aria-label="Write a comment"
        placeholder="Write a comment… (try @)"
        leading={<Avatar name="Alex Morgan" decorative size="md" />}
        sendVariant="standard"
        clearOnSubmit
        onSubmit={(text) => setComments((current) => [...current, text])}
        mentions={{
          search: (query) =>
            PEOPLE.filter((person) => person.label.toLowerCase().includes(query.toLowerCase())).map(
              (person) => ({
                ...person,
                avatar: <Avatar name={person.label} decorative size="sm" />,
              }),
            ),
        }}
      />
    </div>
  );
}
