'use client';

import { List, ListItem, PullToRefresh } from '@windmorph/react';
import { useState } from 'react';

const NAMES = ['ليلى', 'عمر', 'سارة', 'يوسف'];

/**
 * Right to left, nothing changes: the indicator comes down the middle and turns the same way,
 * as loading indicators aren't mirrored. Words for assistive tech come from `labels`.
 */
export function PullToRefreshRtl() {
  const [refreshing, setRefreshing] = useState(false);
  return (
    <div dir="rtl" lang="ar" className="w-full max-w-[412px]">
      <PullToRefresh
        refreshing={refreshing}
        onRefresh={() => {
          setRefreshing(true);
          setTimeout(() => setRefreshing(false), 1500);
        }}
        labels={{ pull: 'اسحب للتحديث', refreshing: 'جارٍ التحديث', refreshed: 'تم التحديث' }}
        className="h-[280px] overflow-y-auto rounded-corner-large bg-surface-container-low"
      >
        <List aria-label="جهات الاتصال">
          {NAMES.map((name) => (
            <ListItem key={name}>{name}</ListItem>
          ))}
        </List>
      </PullToRefresh>
    </div>
  );
}
