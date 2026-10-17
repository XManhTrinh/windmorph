'use client';

import { Button, useM3Spring, type SpringFamily, type SpringSpeed } from '@windmorph/react';
import { motion, useReducedMotion } from 'motion/react';
import { useState } from 'react';

/**
 * A live `useM3Spring` demo: the box springs between two positions using the M3 spring for
 * the active motion scheme (expressive overshoots, standard barely). Under
 * `prefers-reduced-motion` it moves at once, as the components' spatial motion does. Built from
 * `@windmorph/react` + Motion + React only.
 */
export function SpringDemo({
  family = 'spatial',
  speed = 'fast',
}: {
  family?: SpringFamily;
  speed?: SpringSpeed;
}) {
  const spring = useM3Spring(family, speed);
  const reduceMotion = useReducedMotion();
  const [moved, setMoved] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <Button variant="filled" size="sm" onPress={() => setMoved((value) => !value)}>
        {`Animate ${family} / ${speed}`}
      </Button>
      <div className="rounded-corner-large bg-surface-container p-3">
        <motion.div
          className="size-12 rounded-corner-medium bg-primary"
          animate={{ x: moved ? 220 : 0 }}
          transition={reduceMotion ? { duration: 0 } : spring}
        />
      </div>
    </div>
  );
}
