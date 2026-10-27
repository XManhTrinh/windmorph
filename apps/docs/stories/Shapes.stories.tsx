import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button, useM3Spring } from '@windmorph/react';
import {
  materialShapeNames,
  morphPathAt,
  useM3Morph,
  type MaterialShapeName,
} from '@windmorph/react/primitives';
import { animate, motion, useMotionValue, useReducedMotion } from 'motion/react';
import { useEffect, useState } from 'react';

interface ShapeArgs {
  from: MaterialShapeName;
  to: MaterialShapeName;
  progress: number;
}

const meta = {
  title: 'Foundations/Shapes',
  args: { from: 'Circle', to: 'Cookie9Sided', progress: 0.5 },
  argTypes: {
    from: { control: 'select', options: materialShapeNames },
    to: { control: 'select', options: materialShapeNames },
    progress: { control: { type: 'range', min: -0.2, max: 1.2, step: 0.05 } },
  },
} satisfies Meta<ShapeArgs>;

export default meta;
type Story = StoryObj<ShapeArgs>;

/** A shape (or a morph frame) as a filled SVG. Morph frames can poke ~1% out of the box. */
function ShapeSvg({ d, size, label }: { d: string; size: number; label?: string }) {
  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      overflow="visible"
      className="text-primary"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <path d={d} className="fill-current" />
    </svg>
  );
}

/** The 35 Material 3 Expressive shapes, from Compose's `MaterialShapes`. */
export const Gallery: Story = {
  render: () => (
    <div className="grid w-fit grid-cols-[repeat(7,5.5rem)] gap-x-4 gap-y-6" data-testid="gallery">
      {materialShapeNames.map((name) => (
        <figure key={name} className="m-0 flex flex-col items-center gap-2">
          <ShapeSvg d={morphPathAt([name], 0, { size: 56 })} size={56} label={name} />
          <figcaption className="text-center text-label-small text-on-surface-variant">
            {name}
          </figcaption>
        </figure>
      ))}
    </div>
  ),
};

/** A single morph frame. Progress outside 0–1 shows the extrapolation springs overshoot into. */
export const Morph: Story = {
  render: ({ from, to, progress }) => (
    <div data-testid="morph" className="inline-block p-2">
      <ShapeSvg d={morphPathAt([from, to], progress, { size: 160 })} size={160} />
    </div>
  ),
};

const FRAME_PAIRS: [MaterialShapeName, MaterialShapeName][] = [
  ['Circle', 'Cookie9Sided'],
  ['Square', 'Burst'],
  ['Triangle', 'Heart'],
  ['Pill', 'Flower'],
  ['SoftBurst', 'Cookie4Sided'],
  ['Pentagon', 'Sunny'],
];
const FRAMES = [0, 0.25, 0.5, 0.75, 1];

/** Morph frames between pairs of shapes: corners are matched, so the outlines flow. */
export const MorphFrames: Story = {
  render: () => (
    <div className="flex w-fit flex-col gap-4" data-testid="frames">
      {FRAME_PAIRS.map(([from, to]) => (
        <div key={`${from}-${to}`} className="flex items-center gap-4">
          <span className="w-40 text-label-medium text-on-surface-variant">
            {from} → {to}
          </span>
          {FRAMES.map((progress) => (
            <ShapeSvg
              key={progress}
              d={morphPathAt([from, to], progress, { size: 48 })}
              size={48}
            />
          ))}
        </div>
      ))}
    </div>
  ),
};

function AnimatedMorph({ from, to }: Pick<ShapeArgs, 'from' | 'to'>) {
  const [morphed, setMorphed] = useState(false);
  const progress = useMotionValue(0);
  const d = useM3Morph([from, to], progress, { size: 160 });
  const spring = useM3Spring('spatial', 'default');
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const target = morphed ? 1 : 0;
    if (reduceMotion) {
      progress.jump(target);
      return;
    }
    const controls = animate(progress, target, spring);
    return () => controls.stop();
  }, [morphed, progress, reduceMotion, spring]);

  return (
    <div className="flex flex-col items-start gap-4">
      <Button variant="tonal" onPress={() => setMorphed((value) => !value)}>
        Morph
      </Button>
      <div data-testid="animated" data-morphed={morphed} className="inline-block p-2">
        <svg
          viewBox="0 0 160 160"
          width={160}
          height={160}
          overflow="visible"
          className="text-primary"
        >
          <motion.path d={d} className="fill-current" />
        </svg>
      </div>
    </div>
  );
}

/**
 * `useM3Morph` driven by the expressive spatial spring, which overshoots past the end shape.
 * Reduced motion snaps instead.
 */
export const Animated: Story = {
  args: { from: 'Circle', to: 'SoftBurst' },
  argTypes: { progress: { table: { disable: true } } },
  render: ({ from, to }) => <AnimatedMorph from={from} to={to} />,
};
