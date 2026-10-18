import type { Meta, StoryObj } from '@storybook/react-vite';
import { IconButton, TopAppBar } from '@windmorph/react';
import { useRef } from 'react';
import { MenuIcon, MoreVertIcon, SearchIcon } from '../icons';
import { TokenProbe } from './probe';

function Sample({ title, className }: { title: string; className?: string }) {
  return (
    <TopAppBar
      title={title}
      subtitle="3 unread"
      navigationIcon={<IconButton icon={<MenuIcon />} aria-label="Menu" />}
      actions={
        <>
          <IconButton icon={<SearchIcon />} aria-label="Search" />
          <IconButton icon={<MoreVertIcon />} aria-label="More" />
        </>
      }
      className={className}
    />
  );
}

/** A pinned bar over a list that starts scrolled, so it shows its on-scroll colour. */
function Scrolled() {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  return (
    <div className="flex flex-col">
      <TopAppBar title="Scrolled" scrollBehavior="pinned" scrollRef={scrollRef} />
      <div
        ref={(element) => {
          scrollRef.current = element;
          if (element) element.scrollTop = 40;
        }}
        className="h-[80px] overflow-y-auto"
      >
        <div className="h-[400px]" />
      </div>
    </div>
  );
}

/** The app bar's component tokens, probed by e2e/component-tokens.spec.ts. */
const meta = {
  title: 'Tokens/md-comp-app-bar',
  tags: ['tokens-probe'],
} satisfies Meta;

export default meta;

export const Probe: StoryObj = {
  render: () => (
    <TokenProbe
      instances={
        <>
          <Sample title="Inbox" />
          <Scrolled />
        </>
      }
      scoped={<Sample title="Scoped" />}
      override={{
        token: '--md-comp-app-bar-container-color',
        children: <Sample title="Override" className="bg-tertiary" />,
      }}
    />
  ),
};
