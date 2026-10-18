'use client';

import { List, ListItem, PullToRefresh, Switch } from '@windmorph/react';
import { useState } from 'react';

const FILES = ['Budget.xlsx', 'Trip photos', 'Notes from Monday', 'Müller invoice.pdf', 'Slides'];

/**
 * `threshold` (px, 80 by default) sets how far the indicator travels before a release
 * refreshes; past it, the pull meets growing resistance up to twice the threshold. A longer
 * one, as here, suits content where an accidental refresh costs more. `disabled` turns the
 * gesture off (a running refresh still shows its indicator), and `labels` names the
 * indicator for what it refreshes.
 */
export function PullToRefreshThreshold() {
  const [refreshing, setRefreshing] = useState(false);
  const [disabled, setDisabled] = useState(false);
  return (
    <div className="flex w-full max-w-[412px] flex-col gap-4">
      <Switch checked={disabled} onCheckedChange={setDisabled}>
        Turn pulling off
      </Switch>
      <PullToRefresh
        threshold={120}
        disabled={disabled}
        refreshing={refreshing}
        onRefresh={() => {
          setRefreshing(true);
          setTimeout(() => setRefreshing(false), 1500);
        }}
        labels={{
          pull: 'Pull to sync files',
          refreshing: 'Syncing files',
          refreshed: 'Files synced',
        }}
        role="region"
        aria-label="File list"
        // A scrolling area needs keyboard access.
        tabIndex={0}
        className="h-[320px] overflow-y-auto rounded-corner-large bg-surface-container-low outline-offset-2 focus-visible:outline-2 focus-visible:outline-secondary"
      >
        <List aria-label="Files">
          {FILES.map((file) => (
            <ListItem key={file}>{file}</ListItem>
          ))}
        </List>
      </PullToRefresh>
    </div>
  );
}
