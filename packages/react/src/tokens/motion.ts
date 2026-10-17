/**
 * M3 Expressive motion: spring tokens for the `expressive` and `standard` motion
 * schemes (Compose `ExpressiveMotionTokens` / `StandardMotionTokens`), plus the
 * legacy duration + easing tokens for consumers migrating from baseline M3.
 *
 * Compose springs are expressed as a damping ratio and stiffness with mass 1.
 * Motion (`motion/react`) takes a damping coefficient, so
 * `damping = 2 * dampingRatio * sqrt(stiffness * mass)`.
 */

export const MOTION_SCHEMES = ['expressive', 'standard'] as const;
export type MotionScheme = (typeof MOTION_SCHEMES)[number];
export const DEFAULT_MOTION_SCHEME: MotionScheme = 'expressive';

export const SPRING_FAMILIES = ['spatial', 'effects'] as const;
export type SpringFamily = (typeof SPRING_FAMILIES)[number];

export const SPRING_SPEEDS = ['fast', 'default', 'slow'] as const;
export type SpringSpeed = (typeof SPRING_SPEEDS)[number];

export interface SpringToken {
  dampingRatio: number;
  stiffness: number;
}

type SpringScheme = Record<SpringFamily, Record<SpringSpeed, SpringToken>>;

const spring = (dampingRatio: number, stiffness: number): SpringToken => ({
  dampingRatio,
  stiffness,
});

const EFFECTS = {
  fast: spring(1, 3800),
  default: spring(1, 1600),
  slow: spring(1, 800),
};

export const SPRINGS: Record<MotionScheme, SpringScheme> = {
  expressive: {
    spatial: { fast: spring(0.6, 800), default: spring(0.8, 380), slow: spring(0.8, 200) },
    effects: EFFECTS,
  },
  standard: {
    spatial: { fast: spring(0.9, 1400), default: spring(0.9, 700), slow: spring(0.9, 300) },
    effects: EFFECTS,
  },
};

/** A spring transition in the shape Motion's `transition` prop expects. */
export interface MotionSpring {
  type: 'spring';
  stiffness: number;
  damping: number;
  mass: number;
}

export function toMotionSpring({ dampingRatio, stiffness }: SpringToken): MotionSpring {
  const mass = 1;
  return {
    type: 'spring',
    stiffness,
    damping: Math.round(2 * dampingRatio * Math.sqrt(stiffness * mass) * 100) / 100,
    mass,
  };
}

/** Normalised displacement threshold at which a spring is treated as settled. */
const SETTLE_THRESHOLD = 0.001;

/**
 * Position of a unit step spring (0 → 1, mass 1) at time `t` seconds,
 * using the closed-form solution for under- and critically-damped springs.
 */
export function springPosition({ dampingRatio: z, stiffness: k }: SpringToken, t: number): number {
  const w0 = Math.sqrt(k);
  if (z < 1) {
    const wd = w0 * Math.sqrt(1 - z * z);
    return 1 - Math.exp(-z * w0 * t) * (Math.cos(wd * t) + ((z * w0) / wd) * Math.sin(wd * t));
  }
  return 1 - Math.exp(-w0 * t) * (1 + w0 * t);
}

/** Time in ms after which the spring stays within the settle threshold of its target. */
export function springSettleDuration(token: SpringToken): number {
  const step = 0.001;
  let lastUnsettled = 0;
  for (let t = 0; t < 5; t += step) {
    if (Math.abs(1 - springPosition(token, t)) > SETTLE_THRESHOLD) lastUnsettled = t;
  }
  return Math.ceil((lastUnsettled * 1000) / 10) * 10;
}

/**
 * CSS `linear()` approximation of a spring, sampled at evenly spaced points
 * over its settle duration. Pair it with {@link springSettleDuration}.
 */
export function springToLinearEasing(token: SpringToken, samples = 40): string {
  const duration = springSettleDuration(token) / 1000;
  const points: string[] = [];
  for (let i = 0; i <= samples; i++) {
    const value = i === samples ? 1 : springPosition(token, (duration * i) / samples);
    points.push(String(Math.round(value * 10000) / 10000));
  }
  return `linear(${points.join(', ')})`;
}

/** Legacy M3 durations (Compose `MotionTokens`), in ms. */
export const LEGACY_DURATIONS = {
  'short-1': 50,
  'short-2': 100,
  'short-3': 150,
  'short-4': 200,
  'medium-1': 250,
  'medium-2': 300,
  'medium-3': 350,
  'medium-4': 400,
  'long-1': 450,
  'long-2': 500,
  'long-3': 550,
  'long-4': 600,
  'extra-long-1': 700,
  'extra-long-2': 800,
  'extra-long-3': 900,
  'extra-long-4': 1000,
} as const;

/** Legacy M3 easing curves (Compose `MotionTokens`). */
export const LEGACY_EASINGS = {
  emphasized: 'cubic-bezier(0.2, 0, 0, 1)',
  'emphasized-accelerate': 'cubic-bezier(0.3, 0, 0.8, 0.15)',
  'emphasized-decelerate': 'cubic-bezier(0.05, 0.7, 0.1, 1)',
  standard: 'cubic-bezier(0.2, 0, 0, 1)',
  'standard-accelerate': 'cubic-bezier(0.3, 0, 1, 1)',
  'standard-decelerate': 'cubic-bezier(0, 0, 0, 1)',
  legacy: 'cubic-bezier(0.4, 0, 0.2, 1)',
  'legacy-accelerate': 'cubic-bezier(0.4, 0, 1, 1)',
  'legacy-decelerate': 'cubic-bezier(0, 0, 0.2, 1)',
  linear: 'cubic-bezier(0, 0, 1, 1)',
} as const;

/** `<family>-<speed>` names used by the `ease-m3-*` / `duration-m3-*` utilities. */
export const SPRING_TOKEN_NAMES = SPRING_FAMILIES.flatMap((family) =>
  SPRING_SPEEDS.map((speed) => `${family}-${speed}` as const),
);
