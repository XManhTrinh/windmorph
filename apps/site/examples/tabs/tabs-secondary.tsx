'use client';

import { Tab, Tabs } from '@windmorph/react';

/**
 * Secondary tabs for a nested level of navigation: a full-width indicator marks the
 * selection and the labels are text only. `defaultSelectedKey` sets the initial tab when
 * the selection is uncontrolled, and `disabledKeys` skips a tab.
 */
export function TabsSecondary() {
  return (
    <div className="w-full max-w-[480px]">
      <Tabs aria-label="Media" variant="secondary" defaultValue="photos" disabledKeys={['audio']}>
        <Tab key="video" title="Video" />
        <Tab key="photos" title="Photos" />
        <Tab key="audio" title="Audio" />
      </Tabs>
    </div>
  );
}
