'use client';

import { IconButton } from '@windmorph/react';
import { useState } from 'react';
import { RefreshIcon } from '../../components/icons';

/**
 * `pending` on an icon button: the loading indicator takes the icon's place after 200ms, the
 * button keeps its size and focus, its name becomes "Refresh, Loading" and its tooltip still
 * says "Refresh".
 */
export function IconButtonPending() {
  const [refreshing, setRefreshing] = useState(false);
  const refresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2000);
  };
  return (
    <IconButton
      variant="tonal"
      icon={<RefreshIcon />}
      aria-label="Refresh"
      pending={refreshing}
      onPress={refresh}
    />
  );
}
