'use client';

import { ChipSet, FilterChip, IconButton, TopAppBar } from '@windmorph/react';
import { useRef, useState } from 'react';
import { ArrowBackIcon, SearchIcon } from '../../components/icons';

const RECIPES = [
  { name: 'Lentil soup', tag: 'soup' },
  { name: 'Garlic noodles', tag: 'noodles' },
  { name: 'Garden salad', tag: 'starter' },
  { name: 'Club sandwich', tag: 'sandwich' },
  { name: 'Crème brûlée', tag: 'dessert' },
  { name: 'Ratatouille', tag: 'stew' },
];

/**
 * A row of filter chips in the bar's `bottom` slot. It's part of the bar: it takes the
 * bar's colour, and as the large title collapses the chips stay right below the top row,
 * so the filters are always at hand.
 */
export function TopAppBarChips() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState<string>('all');
  const shown = Array.from({ length: 4 }, () => RECIPES)
    .flat()
    .filter((recipe) => filter === 'all' || recipe.tag === filter);
  return (
    <div
      ref={scrollRef}
      className="h-[420px] w-[412px] max-w-full overflow-y-auto rounded-corner-large border border-outline-variant"
    >
      <TopAppBar
        variant="large"
        title="Recipes"
        navigationIcon={<IconButton icon={<ArrowBackIcon />} aria-label="Back" />}
        actions={<IconButton icon={<SearchIcon />} aria-label="Search recipes" />}
        scrollBehavior="exit-until-collapsed"
        scrollRef={scrollRef}
        bottom={
          <ChipSet
            aria-label="Filter recipes"
            selectionMode="single"
            selectedKeys={[filter]}
            onSelectionChange={(keys) => setFilter(String([...keys][0] ?? 'all'))}
            layout="scroll"
            className="px-[8px] pb-[8px]"
          >
            <FilterChip value="all">All</FilterChip>
            <FilterChip value="soup">Soup</FilterChip>
            <FilterChip value="noodles">Noodles</FilterChip>
            <FilterChip value="dessert">Dessert</FilterChip>
          </ChipSet>
        }
      />
      {shown.map((recipe, index) => (
        <p key={index} className="px-4 py-3 text-body-large text-on-surface-variant">
          {recipe.name}
        </p>
      ))}
    </div>
  );
}
