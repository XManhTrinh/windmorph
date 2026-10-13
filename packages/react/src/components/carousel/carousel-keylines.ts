/*
 * A port of Compose Material 3's carousel keylines (androidx `compose/material3/carousel`:
 * Arrangement.kt, Keylines.kt, KeylineList.kt, Strategy.kt, KeylineSnapPosition.kt and the
 * placement in Carousel.kt's `carouselItem`). Pure functions on px values, unit-tested.
 */

export const MIN_SMALL_ITEM_SIZE = 40;
export const MAX_SMALL_ITEM_SIZE = 56;
const ANCHOR_SIZE = 10;
const MEDIUM_LARGE_ITEM_DIFF_THRESHOLD = 0.85;
const MEDIUM_ITEM_FLEX_PERCENTAGE = 0.1;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// ---------------------------------------------------------------------------
// Arrangement.kt

interface Arrangement {
  priority: number;
  smallSize: number;
  smallCount: number;
  mediumSize: number;
  mediumCount: number;
  largeSize: number;
  largeCount: number;
}

function isValidArrangement(a: Arrangement) {
  if (a.largeCount > 0 && a.smallCount > 0 && a.mediumCount > 0)
    return a.largeSize > a.mediumSize && a.mediumSize > a.smallSize;
  if (a.largeCount > 0 && a.smallCount > 0) return a.largeSize > a.smallSize;
  return true;
}

const cost = (a: Arrangement, targetLargeSize: number) =>
  isValidArrangement(a) ? Math.abs(targetLargeSize - a.largeSize) * a.priority : Number.MAX_VALUE;

const arrangementCount = (a: Arrangement) => a.largeCount + a.mediumCount + a.smallCount;

function fit(
  priority: number,
  availableSpace: number,
  itemSpacing: number,
  smallCount: number,
  smallSize: number,
  minSmallSize: number,
  maxSmallSize: number,
  mediumCount: number,
  mediumSize: number,
  largeCount: number,
  largeSize: number,
): Arrangement {
  const total = largeCount + mediumCount + smallCount;
  const space = availableSpace - (total - 1) * itemSpacing;
  let small = Math.min(Math.max(smallSize, minSmallSize), maxSmallSize);
  const taken = largeSize * largeCount + mediumSize * mediumCount + small * smallCount;
  const delta = space - taken;
  if (smallCount > 0 && delta > 0) small += Math.min(delta / smallCount, maxSmallSize - small);
  else if (smallCount > 0 && delta < 0) small += Math.max(delta / smallCount, minSmallSize - small);
  small = smallCount > 0 ? small : 0;
  let large = (space - (smallCount + mediumCount / 2) * small) / (largeCount + mediumCount / 2);
  let medium = (large + small) / 2;
  if (mediumCount > 0 && large !== largeSize) {
    const targetAdjustment = (largeSize - large) * largeCount;
    const availableMediumFlex = medium * MEDIUM_ITEM_FLEX_PERCENTAGE * mediumCount;
    const distribute = Math.min(Math.abs(targetAdjustment), availableMediumFlex);
    if (targetAdjustment > 0) {
      medium -= distribute / mediumCount;
      large += distribute / largeCount;
    } else {
      medium += distribute / mediumCount;
      large -= distribute / largeCount;
    }
  }
  return {
    priority,
    smallSize: small,
    smallCount,
    mediumSize: medium,
    mediumCount,
    largeSize: large,
    largeCount,
  };
}

function findLowestCostArrangement(
  availableSpace: number,
  itemSpacing: number,
  targetSmallSize: number,
  minSmallSize: number,
  maxSmallSize: number,
  smallCounts: number[],
  targetMediumSize: number,
  mediumCounts: number[],
  targetLargeSize: number,
  largeCounts: number[],
): Arrangement | null {
  let lowest: Arrangement | null = null;
  let priority = 1;
  for (const largeCount of largeCounts)
    for (const mediumCount of mediumCounts)
      for (const smallCount of smallCounts) {
        const arrangement = fit(
          priority,
          availableSpace,
          itemSpacing,
          smallCount,
          targetSmallSize,
          minSmallSize,
          maxSmallSize,
          mediumCount,
          targetMediumSize,
          largeCount,
          targetLargeSize,
        );
        if (lowest === null || cost(arrangement, targetLargeSize) < cost(lowest, targetLargeSize)) {
          lowest = arrangement;
          if (cost(lowest, targetLargeSize) === 0) return lowest;
        }
        priority++;
      }
  return lowest;
}

// ---------------------------------------------------------------------------
// KeylineList.kt

export interface Keyline {
  size: number;
  offset: number;
  unadjustedOffset: number;
  isFocal: boolean;
  isAnchor: boolean;
  isPivot: boolean;
  cutoff: number;
}

export type KeylineList = Keyline[];

interface TmpKeyline {
  size: number;
  isAnchor: boolean;
}

const firstIndex = (list: KeylineList, test: (k: Keyline) => boolean) => list.findIndex(test);
const lastIndex = (list: KeylineList, test: (k: Keyline) => boolean) => {
  for (let i = list.length - 1; i >= 0; i--) if (test(list[i]!)) return i;
  return -1;
};

export const firstFocalIndex = (list: KeylineList) => firstIndex(list, (k) => k.isFocal);
export const lastFocalIndex = (list: KeylineList) => lastIndex(list, (k) => k.isFocal);
const firstNonAnchorIndex = (list: KeylineList) => firstIndex(list, (k) => !k.isAnchor);
const lastNonAnchorIndex = (list: KeylineList) => lastIndex(list, (k) => !k.isAnchor);
const pivotIndexOf = (list: KeylineList) => firstIndex(list, (k) => k.isPivot);

function focalInfo(tmp: TmpKeyline[]) {
  let first = -1;
  let focalSize = 0;
  tmp.forEach((k, i) => {
    if (!k.isAnchor && k.size > focalSize) {
      first = i;
      focalSize = k.size;
    }
  });
  let last = first;
  if (first >= 0) while (last < tmp.length - 1 && tmp[last + 1]!.size === focalSize) last++;
  return { first, last, focalSize };
}

const isCutoffLeft = (size: number, offset: number) =>
  offset - size / 2 < 0 && offset + size / 2 > 0;
const isCutoffRight = (size: number, offset: number, mainAxis: number) =>
  offset - size / 2 < mainAxis && offset + size / 2 > mainAxis;

function createKeylinesWithPivot(
  pivotIndex: number,
  pivotOffset: number,
  firstFocal: number,
  lastFocal: number,
  itemMainAxisSize: number,
  carouselMainAxisSize: number,
  itemSpacing: number,
  tmp: TmpKeyline[],
): KeylineList {
  if (tmp.length === 0 || pivotIndex < 0 || pivotIndex >= tmp.length) return [];
  const pivot = tmp[pivotIndex]!;
  const keylines: Keyline[] = [];
  const pivotCutoff = isCutoffLeft(pivot.size, pivotOffset)
    ? pivotOffset - pivot.size / 2
    : isCutoffRight(pivot.size, pivotOffset, carouselMainAxisSize)
      ? pivotOffset + pivot.size / 2 - carouselMainAxisSize
      : 0;
  keylines.push({
    size: pivot.size,
    offset: pivotOffset,
    unadjustedOffset: pivotOffset,
    isFocal: pivotIndex >= firstFocal && pivotIndex <= lastFocal,
    isAnchor: pivot.isAnchor,
    isPivot: true,
    cutoff: pivotCutoff,
  });
  let offset = pivotOffset - itemMainAxisSize / 2 - itemSpacing;
  let unadjusted = pivotOffset - itemMainAxisSize / 2 - itemSpacing;
  for (let i = pivotIndex - 1; i >= 0; i--) {
    const k = tmp[i]!;
    const kOffset = offset - k.size / 2;
    const kUnadjusted = unadjusted - itemMainAxisSize / 2;
    keylines.unshift({
      size: k.size,
      offset: kOffset,
      unadjustedOffset: kUnadjusted,
      isFocal: i >= firstFocal && i <= lastFocal,
      isAnchor: k.isAnchor,
      isPivot: false,
      cutoff: isCutoffLeft(k.size, kOffset) ? Math.abs(kOffset - k.size / 2) : 0,
    });
    offset -= k.size + itemSpacing;
    unadjusted -= itemMainAxisSize + itemSpacing;
  }
  offset = pivotOffset + itemMainAxisSize / 2 + itemSpacing;
  unadjusted = pivotOffset + itemMainAxisSize / 2 + itemSpacing;
  for (let i = pivotIndex + 1; i < tmp.length; i++) {
    const k = tmp[i]!;
    const kOffset = offset + k.size / 2;
    const kUnadjusted = unadjusted + itemMainAxisSize / 2;
    keylines.push({
      size: k.size,
      offset: kOffset,
      unadjustedOffset: kUnadjusted,
      isFocal: i >= firstFocal && i <= lastFocal,
      isAnchor: k.isAnchor,
      isPivot: false,
      cutoff: isCutoffRight(k.size, kOffset, carouselMainAxisSize)
        ? kOffset + k.size / 2 - carouselMainAxisSize
        : 0,
    });
    offset += k.size + itemSpacing;
    unadjusted += itemMainAxisSize + itemSpacing;
  }
  return keylines;
}

function keylineListWithAlignment(
  carouselMainAxisSize: number,
  itemSpacing: number,
  alignment: 'start' | 'center',
  tmp: TmpKeyline[],
): KeylineList {
  const { first, last, focalSize } = focalInfo(tmp);
  const focalItemCount = last - first;
  let pivotOffset: number;
  if (alignment === 'center') {
    const split = itemSpacing === 0 || focalItemCount % 2 === 0 ? 0 : itemSpacing / 2;
    const spaceCounts = Math.trunc(focalItemCount / 2) * itemSpacing;
    pivotOffset = carouselMainAxisSize / 2 - (focalSize / 2) * focalItemCount - split - spaceCounts;
  } else {
    pivotOffset = focalSize / 2;
  }
  return createKeylinesWithPivot(
    first,
    pivotOffset,
    first,
    last,
    focalSize,
    carouselMainAxisSize,
    itemSpacing,
    tmp,
  );
}

function keylineListWithPivot(
  carouselMainAxisSize: number,
  itemSpacing: number,
  pivotIndex: number,
  pivotOffset: number,
  tmp: TmpKeyline[],
): KeylineList {
  const { first, last, focalSize } = focalInfo(tmp);
  return createKeylinesWithPivot(
    pivotIndex,
    pivotOffset,
    first,
    last,
    focalSize,
    carouselMainAxisSize,
    itemSpacing,
    tmp,
  );
}

function lerpKeyline(a: Keyline, b: Keyline, t: number): Keyline {
  return {
    size: lerp(a.size, b.size, t),
    offset: lerp(a.offset, b.offset, t),
    unadjustedOffset: lerp(a.unadjustedOffset, b.unadjustedOffset, t),
    isFocal: t < 0.5 ? a.isFocal : b.isFocal,
    isAnchor: t < 0.5 ? a.isAnchor : b.isAnchor,
    isPivot: t < 0.5 ? a.isPivot : b.isPivot,
    cutoff: lerp(a.cutoff, b.cutoff, t),
  };
}

const lerpList = (a: KeylineList, b: KeylineList, t: number) =>
  a.map((k, i) => lerpKeyline(k, b[i]!, t));

// ---------------------------------------------------------------------------
// Keylines.kt

function leftAligned(
  mainAxis: number,
  itemSpacing: number,
  leftAnchor: number,
  rightAnchor: number,
  a: Arrangement,
): KeylineList {
  const tmp: TmpKeyline[] = [{ size: leftAnchor, isAnchor: true }];
  for (let i = 0; i < a.largeCount; i++) tmp.push({ size: a.largeSize, isAnchor: false });
  for (let i = 0; i < a.mediumCount; i++) tmp.push({ size: a.mediumSize, isAnchor: false });
  for (let i = 0; i < a.smallCount; i++) tmp.push({ size: a.smallSize, isAnchor: false });
  tmp.push({ size: rightAnchor, isAnchor: true });
  return keylineListWithAlignment(mainAxis, itemSpacing, 'start', tmp);
}

function centerAligned(
  mainAxis: number,
  itemSpacing: number,
  leftAnchor: number,
  rightAnchor: number,
  a: Arrangement,
): KeylineList {
  const tmp: TmpKeyline[] = [{ size: leftAnchor, isAnchor: true }];
  const halfSmall = Math.trunc(a.smallCount / 2);
  const halfMedium = Math.trunc(a.mediumCount / 2);
  for (let i = 0; i < halfSmall; i++) tmp.push({ size: a.smallSize, isAnchor: false });
  for (let i = 0; i < halfMedium; i++) tmp.push({ size: a.mediumSize, isAnchor: false });
  for (let i = 0; i < a.largeCount; i++) tmp.push({ size: a.largeSize, isAnchor: false });
  for (let i = 0; i < halfMedium; i++) tmp.push({ size: a.mediumSize, isAnchor: false });
  for (let i = 0; i < halfSmall; i++) tmp.push({ size: a.smallSize, isAnchor: false });
  tmp.push({ size: rightAnchor, isAnchor: true });
  return keylineListWithAlignment(mainAxis, itemSpacing, 'center', tmp);
}

const largeCountsFor = (minCount: number, maxCount: number) =>
  Array.from({ length: maxCount - minCount + 1 }, (_, i) => maxCount - i);

/** Compose's `multiBrowseKeylineList`: large, medium and small items. */
export function multiBrowseKeylineList(
  carouselMainAxisSize: number,
  preferredItemSize: number,
  itemSpacing: number,
  itemCount: number,
  minSmallItemSize = MIN_SMALL_ITEM_SIZE,
  maxSmallItemSize = MAX_SMALL_ITEM_SIZE,
): KeylineList {
  if (carouselMainAxisSize === 0 || preferredItemSize === 0) return [];
  let smallCounts = [1];
  const mediumCounts = [1, 0];
  const targetLarge = Math.min(preferredItemSize, carouselMainAxisSize);
  const targetSmall = Math.min(Math.max(targetLarge / 3, minSmallItemSize), maxSmallItemSize);
  const targetMedium = (targetLarge + targetSmall) / 2;
  if (carouselMainAxisSize < minSmallItemSize * 2) smallCounts = [0];
  const minAvailableLargeSpace =
    carouselMainAxisSize -
    targetMedium * Math.max(...mediumCounts) -
    maxSmallItemSize * Math.max(...smallCounts);
  const minLargeCount = Math.max(1, Math.floor(minAvailableLargeSpace / targetLarge));
  const maxLargeCount = Math.ceil(carouselMainAxisSize / targetLarge);
  const largeCounts = largeCountsFor(minLargeCount, maxLargeCount);
  let arrangement = findLowestCostArrangement(
    carouselMainAxisSize,
    itemSpacing,
    targetSmall,
    minSmallItemSize,
    maxSmallItemSize,
    smallCounts,
    targetMedium,
    mediumCounts,
    targetLarge,
    largeCounts,
  );
  if (arrangement && arrangementCount(arrangement) > itemCount) {
    let surplus = arrangementCount(arrangement) - itemCount;
    let smallCount = arrangement.smallCount;
    let mediumCount = arrangement.mediumCount;
    while (surplus > 0) {
      if (smallCount > 0) smallCount -= 1;
      else if (mediumCount > 1) mediumCount -= 1;
      surplus -= 1;
    }
    arrangement = findLowestCostArrangement(
      carouselMainAxisSize,
      itemSpacing,
      targetSmall,
      minSmallItemSize,
      maxSmallItemSize,
      [smallCount],
      targetMedium,
      [mediumCount],
      targetLarge,
      largeCounts,
    );
  }
  if (!arrangement) return [];
  return leftAligned(carouselMainAxisSize, itemSpacing, ANCHOR_SIZE, ANCHOR_SIZE, arrangement);
}

/** Compose's `uncontainedKeylineList`: fixed-size items, the last one cut off. */
export function uncontainedKeylineList(
  carouselMainAxisSize: number,
  itemSize: number,
  itemSpacing: number,
): KeylineList {
  if (carouselMainAxisSize === 0 || itemSize === 0) return [];
  const largeItemSize = Math.min(itemSize + itemSpacing, carouselMainAxisSize);
  const largeCount = Math.max(1, Math.floor(carouselMainAxisSize / largeItemSize));
  const remainingSpace = carouselMainAxisSize - largeCount * largeItemSize;
  const mediumCount = remainingSpace > 0 ? 1 : 0;
  let mediumItemSize = Math.max(remainingSpace * 1.5, ANCHOR_SIZE);
  const largeItemThreshold = largeItemSize * MEDIUM_LARGE_ITEM_DIFF_THRESHOLD;
  if (mediumItemSize > largeItemThreshold) {
    mediumItemSize = Math.min(Math.max(largeItemThreshold, remainingSpace * 1.2), largeItemSize);
  }
  const arrangement: Arrangement = {
    priority: 0,
    smallSize: 0,
    smallCount: 0,
    mediumSize: mediumItemSize,
    mediumCount,
    largeSize: largeItemSize,
    largeCount,
  };
  const xSmallSize = Math.min(ANCHOR_SIZE, itemSize);
  const leftAnchorSize = Math.max(xSmallSize, mediumItemSize * 0.5);
  return leftAligned(carouselMainAxisSize, itemSpacing, leftAnchorSize, ANCHOR_SIZE, arrangement);
}

/** Compose's `heroKeylineList`: one (or more) large items with small ones beside them. */
export function heroKeylineList(
  carouselMainAxisSize: number,
  preferredItemSize: number | undefined,
  itemSpacing: number,
  itemCount: number,
  isCentered: boolean,
  minSmallItemSize = MIN_SMALL_ITEM_SIZE,
  maxSmallItemSize = MAX_SMALL_ITEM_SIZE,
): KeylineList {
  if (carouselMainAxisSize === 0) return [];
  const shouldCenter = isCentered && itemCount >= 3;
  let smallCounts = itemCount <= 1 ? [0] : shouldCenter ? [2] : [1];
  const targetLarge = Math.min(preferredItemSize ?? carouselMainAxisSize, carouselMainAxisSize);
  const targetSmall = Math.min(Math.max(targetLarge / 3, minSmallItemSize), maxSmallItemSize);
  const fullscreenThreshold = minSmallItemSize * Math.max(...smallCounts) + minSmallItemSize * 1.25;
  if (carouselMainAxisSize < fullscreenThreshold) smallCounts = [0];
  const minAvailableLargeSpace = carouselMainAxisSize - minSmallItemSize * Math.max(...smallCounts);
  const minLargeCount = Math.max(1, Math.floor(minAvailableLargeSpace / targetLarge));
  const maxLargeCount = Math.ceil(carouselMainAxisSize / targetLarge);
  const arrangement = findLowestCostArrangement(
    carouselMainAxisSize,
    itemSpacing,
    targetSmall,
    minSmallItemSize,
    maxSmallItemSize,
    smallCounts,
    0,
    [0],
    targetLarge,
    largeCountsFor(minLargeCount, maxLargeCount),
  );
  if (!arrangement) return [];
  return shouldCenter && itemCount >= arrangementCount(arrangement)
    ? centerAligned(carouselMainAxisSize, itemSpacing, ANCHOR_SIZE, ANCHOR_SIZE, arrangement)
    : leftAligned(carouselMainAxisSize, itemSpacing, ANCHOR_SIZE, ANCHOR_SIZE, arrangement);
}

// ---------------------------------------------------------------------------
// Strategy.kt

function moveKeyline(
  from: KeylineList,
  srcIndex: number,
  dstIndex: number,
  mainAxis: number,
  itemSpacing: number,
): KeylineList {
  const pivotDir = srcIndex > dstIndex ? 1 : -1;
  const src = from[srcIndex]!;
  const pivotDelta = (src.size - src.cutoff + itemSpacing) * pivotDir;
  const pivotIndex = pivotIndexOf(from);
  const newPivotIndex = pivotIndex + pivotDir;
  const newPivotOffset = from[pivotIndex]!.offset + pivotDelta;
  const moved = [...from];
  moved.splice(srcIndex, 1);
  moved.splice(dstIndex, 0, src);
  return keylineListWithPivot(
    mainAxis,
    itemSpacing,
    newPivotIndex,
    newPivotOffset,
    moved.map((k) => ({ size: k.size, isAnchor: k.isAnchor })),
  );
}

function firstIndexAfterFocalRangeWithSize(list: KeylineList, size: number) {
  for (let i = lastFocalIndex(list); i < list.length; i++) if (list[i]!.size === size) return i;
  return list.length - 1;
}

function lastIndexBeforeFocalRangeWithSize(list: KeylineList, size: number) {
  for (let i = firstFocalIndex(list) - 1; i >= 0; i--) if (list[i]!.size === size) return i;
  return 0;
}

function isFirstFocalAtStart(list: KeylineList) {
  const focal = list[firstFocalIndex(list)]!;
  return focal.offset - focal.size / 2 >= 0 && firstFocalIndex(list) === firstNonAnchorIndex(list);
}

function isLastFocalAtEnd(list: KeylineList, mainAxis: number) {
  const focal = list[lastFocalIndex(list)]!;
  return (
    focal.offset + focal.size / 2 <= mainAxis && lastFocalIndex(list) === lastNonAnchorIndex(list)
  );
}

function startSteps(defaults: KeylineList, mainAxis: number, itemSpacing: number): KeylineList[] {
  if (defaults.length === 0) return [];
  const steps = [defaults];
  if (isFirstFocalAtStart(defaults)) return steps;
  const startIndex = firstNonAnchorIndex(defaults);
  const endIndex = firstFocalIndex(defaults);
  const count = endIndex - startIndex;
  if (count <= 0 && defaults[firstFocalIndex(defaults)]!.cutoff > 0) {
    steps.push(moveKeyline(defaults, 0, 0, mainAxis, itemSpacing));
    return steps;
  }
  for (let i = 0; i < count; i++) {
    const prev = steps[steps.length - 1]!;
    const original = startIndex + i;
    let dstIndex = defaults.length - 1;
    if (original > 0) {
      dstIndex = firstIndexAfterFocalRangeWithSize(prev, defaults[original - 1]!.size) - 1;
    }
    steps.push(moveKeyline(prev, firstNonAnchorIndex(defaults), dstIndex, mainAxis, itemSpacing));
  }
  return steps;
}

function endSteps(defaults: KeylineList, mainAxis: number, itemSpacing: number): KeylineList[] {
  if (defaults.length === 0) return [];
  const steps = [defaults];
  if (isLastFocalAtEnd(defaults, mainAxis)) return steps;
  const startIndex = lastFocalIndex(defaults);
  const endIndex = lastNonAnchorIndex(defaults);
  const count = endIndex - startIndex;
  if (count <= 0 && defaults[lastFocalIndex(defaults)]!.cutoff > 0) {
    steps.push(moveKeyline(defaults, 0, 0, mainAxis, itemSpacing));
    return steps;
  }
  for (let i = 0; i < count; i++) {
    const prev = steps[steps.length - 1]!;
    const original = endIndex - i;
    let dstIndex = 0;
    if (original < defaults.length - 1) {
      dstIndex = lastIndexBeforeFocalRangeWithSize(prev, defaults[original + 1]!.size) + 1;
    }
    steps.push(moveKeyline(prev, lastNonAnchorIndex(defaults), dstIndex, mainAxis, itemSpacing));
  }
  return steps;
}

function interpolationPoints(total: number, steps: KeylineList[], shiftingLeft: boolean) {
  const points = [0];
  if (total === 0 || steps.length === 0) return points;
  for (let i = 1; i < steps.length; i++) {
    const prev = steps[i - 1]!;
    const curr = steps[i]!;
    const shifted = shiftingLeft
      ? curr[0]!.unadjustedOffset - prev[0]!.unadjustedOffset
      : prev[prev.length - 1]!.unadjustedOffset - curr[curr.length - 1]!.unadjustedOffset;
    points.push(i === steps.length - 1 ? 1 : points[i - 1]! + shifted / total);
  }
  return points;
}

const clampLerp = (outMin: number, outMax: number, inMin: number, inMax: number, v: number) =>
  v <= inMin ? outMin : v >= inMax ? outMax : lerp(outMin, outMax, (v - inMin) / (inMax - inMin));

export interface Strategy {
  defaults: KeylineList;
  startSteps: KeylineList[];
  endSteps: KeylineList[];
  availableSpace: number;
  itemSpacing: number;
  itemMainAxisSize: number;
  startShiftDistance: number;
  endShiftDistance: number;
  startShiftPoints: number[];
  endShiftPoints: number[];
  isValid: boolean;
}

/** Compose's `Strategy` (without content padding). */
export function createStrategy(
  defaults: KeylineList,
  availableSpace: number,
  itemSpacing: number,
): Strategy {
  const start = startSteps(defaults, availableSpace, itemSpacing);
  const end = endSteps(defaults, availableSpace, itemSpacing);
  const startShiftDistance =
    start.length === 0
      ? 0
      : start[start.length - 1]![0]!.unadjustedOffset - start[0]![0]!.unadjustedOffset;
  const endShiftDistance =
    end.length === 0
      ? 0
      : end[0]![end[0]!.length - 1]!.unadjustedOffset -
        end[end.length - 1]![end[end.length - 1]!.length - 1]!.unadjustedOffset;
  const focal = defaults[firstFocalIndex(defaults)];
  const itemMainAxisSize = focal?.size ?? 0;
  return {
    defaults,
    startSteps: start,
    endSteps: end,
    availableSpace,
    itemSpacing,
    itemMainAxisSize,
    startShiftDistance,
    endShiftDistance,
    startShiftPoints: interpolationPoints(startShiftDistance, start, true),
    endShiftPoints: interpolationPoints(endShiftDistance, end, false),
    isValid: defaults.length > 0 && availableSpace !== 0 && itemMainAxisSize !== 0,
  };
}

/** Compose's `getKeylineListForScrollOffset`. */
export function keylinesForScrollOffset(
  strategy: Strategy,
  scrollOffset: number,
  maxScrollOffset: number,
): KeylineList {
  const offset = Math.max(0, scrollOffset);
  const startShift = strategy.startShiftDistance;
  const endShift = Math.max(0, maxScrollOffset - strategy.endShiftDistance);
  if (offset >= startShift && offset <= endShift) return strategy.defaults;
  let interpolation = clampLerp(1, 0, 0, startShift, offset);
  let points = strategy.startShiftPoints;
  let steps = strategy.startSteps;
  if (offset > endShift) {
    interpolation = clampLerp(0, 1, endShift, maxScrollOffset, offset);
    points = strategy.endShiftPoints;
    steps = strategy.endSteps;
    if (endShift < 0.01 && strategy.startSteps.length === 2 && strategy.endSteps.length === 2) {
      steps = [strategy.startSteps[1]!, strategy.endSteps[1]!];
    }
  }
  let from = 0;
  let to = 0;
  let stepped = 0;
  let lower = points[0]!;
  for (let i = 1; i < steps.length; i++) {
    const upper = points[i]!;
    if (interpolation <= upper) {
      from = i - 1;
      to = i;
      stepped = clampLerp(0, 1, lower, upper, interpolation);
      break;
    }
    lower = upper;
  }
  return lerpList(steps[from]!, steps[to]!, stepped);
}

/** Compose's `calculateMaxScrollOffset`. */
export function maxScrollOffset(strategy: Strategy, itemCount: number) {
  const total = strategy.itemMainAxisSize * itemCount + strategy.itemSpacing * (itemCount - 1);
  return Math.max(0, total - strategy.availableSpace);
}

/** Compose's `getSnapPositionOffset`: where item `index` sits when snapped. */
export function snapPositionOffset(strategy: Strategy, index: number, itemCount: number) {
  if (!strategy.isValid) return 0;
  const half = strategy.itemMainAxisSize / 2;
  let offset = Math.round(
    strategy.defaults[firstFocalIndex(strategy.defaults)]!.unadjustedOffset - half,
  );
  const startLast = strategy.startSteps.length - 1;
  if (index <= startLast) {
    const step = strategy.startSteps[Math.min(Math.max(startLast - index, 0), startLast)]!;
    offset = Math.round(step[firstFocalIndex(step)]!.unadjustedOffset - half);
  }
  const lastItem = itemCount - 1;
  const endLast = strategy.endSteps.length - 1;
  const focalCount = lastFocalIndex(strategy.defaults) - firstFocalIndex(strategy.defaults) + 1;
  if (index >= lastItem - endLast && itemCount > focalCount) {
    const step = strategy.endSteps[Math.min(Math.max(endLast - (lastItem - index), 0), endLast)]!;
    offset = Math.round(step[lastFocalIndex(step)]!.unadjustedOffset - half);
  }
  return offset;
}

export interface ItemPlacement {
  /** Visible (mask) size along the main axis. */
  size: number;
  /** Translation along the main axis from the item's natural position. */
  translation: number;
}

/** Compose's `carouselItem` placement for item `index` at `scrollOffset`. */
export function placeItem(
  strategy: Strategy,
  keylines: KeylineList,
  index: number,
  scrollOffset: number,
): ItemPlacement {
  const sizeWithSpacing = strategy.itemMainAxisSize + strategy.itemSpacing;
  const center = index * sizeWithSpacing + strategy.itemMainAxisSize / 2 - scrollOffset;
  let before = keylines[0]!;
  for (let i = keylines.length - 1; i >= 0; i--) {
    if (keylines[i]!.unadjustedOffset < center) {
      before = keylines[i]!;
      break;
    }
  }
  const after =
    keylines.find((k) => k.unadjustedOffset >= center) ?? keylines[keylines.length - 1]!;
  const outOfBounds = before === after;
  const progress = outOfBounds
    ? 1
    : (center - before.unadjustedOffset) / (after.unadjustedOffset - before.unadjustedOffset);
  const keyline = lerpKeyline(before, after, progress);
  let translation = keyline.offset - center;
  if (outOfBounds) translation += (center - keyline.unadjustedOffset) / keyline.size;
  return { size: keyline.size, translation };
}
