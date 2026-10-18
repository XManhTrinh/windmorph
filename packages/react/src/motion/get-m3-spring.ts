import {
  SPRINGS,
  toMotionSpring,
  type MotionScheme,
  type MotionSpring,
  type SpringFamily,
  type SpringSpeed,
} from '../tokens/motion';

/** The Motion spring for a motion scheme, family and speed. */
export function getM3Spring(
  scheme: MotionScheme,
  family: SpringFamily,
  speed: SpringSpeed = 'default',
): MotionSpring {
  return toMotionSpring(SPRINGS[scheme][family][speed]);
}
