'use client';

import { List, ListItem, PullToRefresh } from '@windmorph/react';
import { useState } from 'react';

const SENDERS = ['Alex', 'Sam', 'Priya', 'Zoë', 'Jonas', 'Mei', 'Omar', 'Lena'];
const TEXTS = [
  'Lunch at noon?',
  'Running ten minutes late',
  'The slides are ready',
  'Call me later',
];

interface Message {
  id: number;
  from: string;
  text: string;
}

const message = (id: number): Message => ({
  id,
  from: SENDERS[id % SENDERS.length]!,
  text: TEXTS[id % TEXTS.length]!,
});

/**
 * A list feed with `refreshing` controlled: `onRefresh` starts the request and sets it, and
 * the indicator rests at the threshold until it is `false` again. New messages arrive at the
 * top, where pull to refresh belongs. The indicator stays in view even if the list is
 * scrolled while it refreshes.
 */
export function PullToRefreshFeed() {
  const [messages, setMessages] = useState(() => Array.from({ length: 12 }, (_, i) => message(i)));
  const [refreshing, setRefreshing] = useState(false);
  const refresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setMessages((list) => [message(list.length), message(list.length + 1), ...list]);
      setRefreshing(false);
    }, 2000);
  };
  return (
    <PullToRefresh
      refreshing={refreshing}
      onRefresh={refresh}
      labels={{ refreshing: 'Refreshing messages', refreshed: 'Messages refreshed' }}
      className="h-[400px] w-full max-w-[412px] overflow-y-auto rounded-corner-large bg-surface"
    >
      <List aria-label="Messages">
        {messages.map((item) => (
          <ListItem key={item.id} supportingText={item.text}>
            {item.from}
          </ListItem>
        ))}
      </List>
    </PullToRefresh>
  );
}
