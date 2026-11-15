'use client';

import { Carousel } from '@windmorph/react';
import { useState } from 'react';

const TONES = [
  'bg-primary-container text-on-primary-container',
  'bg-secondary-container text-on-secondary-container',
  'bg-tertiary-container text-on-tertiary-container',
  'bg-primary text-on-primary',
  'bg-secondary text-on-secondary',
];

const RECIPES = ['Phở', 'Bánh mì', 'Bún chả', 'Gỏi cuốn', 'Crème brûlée'];

/**
 * With `itemHref`, each item is a real link: a `RouterProvider` routes it, and a modifier or the
 * context menu opens it in a new tab. Its name is its content. Each item carries `data-size`
 * (`large`, `medium` or `small`) and `--m3-carousel-item-openness` (0 to 1), so words over it
 * fade as it shrinks to a strip; `onFocalChange` names the item in the large place once
 * scrolling settles.
 */
export function CarouselLinks() {
  const [focal, setFocal] = useState(0);
  return (
    <div className="flex w-full flex-col gap-2">
      <Carousel
        aria-label="Recipes"
        className="h-[200px]"
        itemHref={(index) => `#demo-recipe-${index + 1}`}
        onFocalChange={setFocal}
      >
        {RECIPES.map((recipe, index) => (
          <div
            key={recipe}
            className={`flex size-full items-end p-4 ${TONES[index % TONES.length]}`}
          >
            <span className="text-title-medium opacity-(--m3-carousel-item-openness)">
              {recipe}
            </span>
          </div>
        ))}
      </Carousel>
      <p className="text-body-medium text-on-surface-variant">
        In the large place: {RECIPES[focal]}
      </p>
    </div>
  );
}
