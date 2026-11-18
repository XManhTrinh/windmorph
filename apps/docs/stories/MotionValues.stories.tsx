import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '@windmorph/react';
import {
  AnimatedNumber,
  staggerDelays,
  useEntrance,
  useM3SpringValue,
  useM3SpringValues,
} from '@windmorph/react/primitives';
import { motion, useTransform } from 'motion/react';
import { useMemo, useRef, useState } from 'react';

const meta = { title: 'Foundations/Motion values' } satisfies Meta;

export default meta;
type Story = StoryObj;

/** A bar whose height springs to each new target, keeping its speed when one arrives mid-move. */
export const SpringValue: Story = {
  render: function Render() {
    const [target, setTarget] = useState(40);
    const height = useM3SpringValue(target);
    const px = useTransform(height, (value) => `${value}px`);
    return (
      <div className="flex items-end gap-6">
        <div className="flex h-[320px] w-16 items-end bg-surface-container-highest">
          <motion.div data-testid="bar" className="w-full bg-primary" style={{ height: px }} />
        </div>
        <div className="flex flex-col gap-2">
          {[40, 200, 300].map((value) => (
            <Button key={value} variant="tonal" onPress={() => setTarget(value)}>
              {`To ${value}`}
            </Button>
          ))}
        </div>
      </div>
    );
  },
};

const wave = (count: number) =>
  Array.from(
    { length: count },
    (_, index) => 60 + 40 * Math.sin((index / (count - 1)) * Math.PI * 2),
  );

/** A line whose points spring as one; another number of points starts from the old shape. */
export const SpringValues: Story = {
  render: function Render() {
    const [count, setCount] = useState(7);
    const targets = useMemo(() => wave(count), [count]);
    const points = useM3SpringValues(targets);
    const d = useTransform(points, (list) =>
      list
        .map((y, index) => `${index === 0 ? 'M' : 'L'}${(index / (list.length - 1)) * 300} ${y}`)
        .join(' '),
    );
    return (
      <div className="flex flex-col gap-4">
        <svg width={300} height={120} className="overflow-visible text-primary" aria-hidden="true">
          <motion.path data-testid="line" d={d} fill="none" stroke="currentColor" strokeWidth={2} />
        </svg>
        <div className="flex gap-2">
          {[7, 84].map((value) => (
            <Button key={value} variant="tonal" onPress={() => setCount(value)}>
              {`${value} points`}
            </Button>
          ))}
        </div>
      </div>
    );
  },
};

/** A number that counts between values: said once, never past its target, its width held. */
export const CountingNumber: Story = {
  render: function Render() {
    const [value, setValue] = useState(1284);
    return (
      <div className="flex items-center gap-4">
        <AnimatedNumber data-testid="number" value={value} className="text-display-medium" />
        <Button variant="tonal" onPress={() => setValue(value === 1284 ? 96 : 1284)}>
          Change
        </Button>
      </div>
    );
  },
};

function Row({ count }: { count: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { entered, inView } = useEntrance(ref);
  const delays = useMemo(() => staggerDelays(count), [count]);
  return (
    <div ref={ref} data-testid="row" className="flex h-[160px] items-end gap-1">
      {delays.map((delay, index) => (
        <Bar
          key={index}
          share={0.3 + (0.7 * ((index * 37) % 10)) / 10}
          entered={entered}
          delay={delay}
          animate={inView}
        />
      ))}
    </div>
  );
}

function Bar({
  share,
  entered,
  delay,
  animate,
}: {
  share: number;
  entered: boolean;
  delay: number;
  animate: boolean;
}) {
  const height = useM3SpringValue(entered ? share * 160 : 0, {
    delay: entered ? delay : 0,
    animate,
  });
  const px = useTransform(height, (value) => `${value}px`);
  return <motion.div data-testid="row-bar" className="w-3 bg-primary" style={{ height: px }} />;
}

/** Bars that rise one after another, once, as the row first comes into view. */
export const Entrance: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <p className="text-body-medium text-on-surface-variant">Scroll down to the bars.</p>
      <div style={{ height: 1200 }} />
      <Row count={24} />
    </div>
  ),
};
