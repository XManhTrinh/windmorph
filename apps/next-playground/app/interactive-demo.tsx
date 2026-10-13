'use client';

import { useM3Spring } from '@windmorph/react';
import { useM3Interaction } from '@windmorph/react/primitives';
import { LazyMotion, domAnimation, m } from 'motion/react';
import { useRef, useState } from 'react';

/** A pressable surface wired to the state layer, ripple and focus ring primitives. */
export function InteractiveDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState(0);
  const { interactionProps, dataAttributes, state } = useM3Interaction(
    { onPress: () => setCount((c) => c + 1) },
    ref,
  );
  const spring = useM3Spring('spatial', 'fast');

  return (
    <LazyMotion features={domAnimation}>
      <div
        ref={ref}
        role="button"
        tabIndex={0}
        data-testid="pressable"
        {...interactionProps}
        {...dataAttributes}
        className="state-layer focus-ring inline-flex h-14 cursor-pointer items-center gap-3 rounded-corner-full bg-primary px-6 text-label-large text-on-primary select-none"
      >
        <m.span
          className="inline-block"
          animate={{ scale: state.isPressed ? 1.25 : 1 }}
          transition={spring}
          aria-hidden="true"
        >
          ●
        </m.span>
        Pressed {count} times
      </div>
    </LazyMotion>
  );
}
