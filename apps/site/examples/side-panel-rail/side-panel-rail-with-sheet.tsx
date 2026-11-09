'use client';

import { SideSheet } from '@windmorph/react';
import { SidePanelRail, SidePanelRailItem } from '@windmorph/react-pro';
import { useState } from 'react';
import { MenuBookIcon, TuneIcon } from '../../components/icons';

type Tool = 'notes' | 'filters';

const TITLES: Record<Tool, string> = { notes: 'Notes', filters: 'Filters' };

/** A press opens a standard side sheet between the page and the strip, and the page narrows. */
export function SidePanelRailWithSheet() {
  const [tool, setTool] = useState<Tool | null>(null);
  // Keeps the title while the sheet closes.
  const [shown, setShown] = useState<Tool>('notes');

  const toggle = (next: Tool) => {
    setShown(next);
    setTool((current) => (current === next ? null : next));
  };

  return (
    <div className="flex h-[420px] w-full overflow-hidden rounded-corner-large bg-surface-container">
      <div className="my-4 ms-4 min-w-0 flex-1 rounded-corner-large bg-surface" />
      <SideSheet
        variant="standard"
        detached
        divider={false}
        open={tool !== null}
        onOpenChange={(open) => {
          if (!open) setTool(null);
        }}
        title={TITLES[shown]}
        classNames={{
          frame: 'ps-[16px] pe-0',
          panel: 'w-[280px] rounded-corner-large bg-surface shadow-none',
          header: 'border-b border-solid border-outline-variant',
        }}
      >
        <p className="pt-4 text-body-medium text-on-surface-variant">
          {TITLES[shown]} appear here, beside the page.
        </p>
      </SideSheet>
      <SidePanelRail aria-label="Tools" role="group" hideBelow={false}>
        <SidePanelRailItem
          selected={tool === 'notes'}
          onPress={() => toggle('notes')}
          icon={<MenuBookIcon />}
        >
          Notes
        </SidePanelRailItem>
        <SidePanelRailItem
          selected={tool === 'filters'}
          onPress={() => toggle('filters')}
          icon={<TuneIcon />}
        >
          Filters
        </SidePanelRailItem>
      </SidePanelRail>
    </div>
  );
}
