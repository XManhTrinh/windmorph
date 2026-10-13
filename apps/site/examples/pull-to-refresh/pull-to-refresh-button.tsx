'use client';

import { IconButton, List, ListItem, PullToRefresh, TopAppBar } from '@windmorph/react';
import { useState } from 'react';
import { RefreshIcon } from '../../components/icons';

const ORDERS = ['Order 1042 · Shipped', 'Order 1041 · Delivered', 'Order 1040 · Delivered'];

/**
 * Pulling can't be the only way to refresh: some people can't drag. A refresh button in the
 * app bar sets the same `refreshing` state, so the indicator comes in exactly as it does after
 * a pull, and the start and end of the refresh are announced either way.
 */
export function PullToRefreshButton() {
  const [refreshing, setRefreshing] = useState(false);
  const refresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };
  return (
    <div className="flex h-[360px] w-full max-w-[412px] flex-col overflow-hidden rounded-corner-large bg-surface">
      <TopAppBar
        title="Orders"
        actions={
          <IconButton
            icon={<RefreshIcon />}
            aria-label="Refresh orders"
            onPress={refresh}
            disabled={refreshing}
          />
        }
      />
      <PullToRefresh
        refreshing={refreshing}
        onRefresh={refresh}
        labels={{ refreshing: 'Refreshing orders', refreshed: 'Orders refreshed' }}
        className="min-h-0 grow overflow-y-auto"
      >
        <List aria-label="Orders">
          {ORDERS.map((order) => (
            <ListItem key={order}>{order}</ListItem>
          ))}
        </List>
      </PullToRefresh>
    </div>
  );
}
