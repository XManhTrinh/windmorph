'use client';

import type { Time } from '@internationalized/date';
import { useEffect, useMemo, useRef, type RefObject } from 'react';
import { useLocale } from 'react-aria';
import { Item, useListState, type OverlayTriggerState } from 'react-stately';
import type { Density } from '../../tokens/density';
import { OptionList, OptionPopover } from '../select/option-list';
import { formatTime } from './time-format';
import { listTimes, minutesOf, nearestTime } from './time-list';

export interface TimeFieldListProps {
  /** The field's open state, which the list follows. */
  state: OverlayTriggerState;
  /** The field: the list opens under it, at least as wide. */
  triggerRef: RefObject<HTMLElement | null>;
  /** The list's id, which the clock button controls. */
  id: string;
  value: Time | null;
  /** A time was picked. */
  onCommit: (time: Time) => void;
  min?: Time | undefined;
  max?: Time | undefined;
  /** Minutes between the listed times. */
  step: number;
  hourCycle: 12 | 24;
  /** The list's name. */
  label: string;
  density?: Density | undefined;
  classNames?: { list?: string | undefined; option?: string | undefined } | undefined;
}

interface TimeOption {
  key: string;
  time: Time;
  text: string;
}

/**
 * The docked picker of a {@link TimeField}: a list of times under the field, drawn as the
 * library's menu (the popover and options of `Select`). It opens at the field's time, or with
 * none at the time nearest now; a press or Enter picks a time and closes it. Loaded on
 * demand, so a form of many fields carries none of it.
 */
export function TimeFieldList({
  state,
  triggerRef,
  id,
  value,
  onCommit,
  min,
  max,
  step,
  hourCycle,
  label,
  density,
  classNames,
}: TimeFieldListProps) {
  const { locale } = useLocale();
  const popoverRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const options = useMemo<TimeOption[]>(
    () =>
      listTimes(step, min, max, value).map((time) => ({
        key: String(minutesOf(time)),
        time,
        text: formatTime(time, locale, hourCycle),
      })),
    [step, min, max, value, locale, hourCycle],
  );
  const chosen = value ? String(minutesOf(value)) : null;
  const selected = chosen !== null && options.some((option) => option.key === chosen);
  const list = useListState<TimeOption>({
    items: options,
    children: (option) => (
      <Item key={option.key} textValue={option.text}>
        {option.text}
      </Item>
    ),
    selectionMode: 'single',
    disallowEmptySelection: true,
    // Picking the field's own time again still closes the list.
    allowDuplicateSelectionEvents: true,
    selectedKeys: selected ? [chosen] : [],
    onSelectionChange: (keys) => {
      const [key] = keys === 'all' ? [] : [...keys];
      const picked = options.find((option) => option.key === key);
      if (picked) onCommit(picked.time);
      state.close();
    },
  });

  // As it opens, the list shows where the field is: its time in the middle, or with none the
  // time nearest now, which takes focus. Only the list scrolls, never the page.
  const { isOpen } = state;
  const { selectionManager } = list;
  useEffect(() => {
    if (!isOpen) return;
    let start = chosen;
    if (!selected) {
      const now = new Date();
      const nearest = nearestTime(
        options.map((option) => option.time),
        now.getHours() * 60 + now.getMinutes(),
      );
      start = String(minutesOf(nearest ?? options[0]!.time));
      selectionManager.setFocused(true);
      selectionManager.setFocusedKey(start);
    }
    const scroller = listRef.current;
    const option = scroller?.querySelector<HTMLElement>(`[data-key="${start}"]`);
    if (!scroller || !option) return;
    const offset = option.getBoundingClientRect().top - scroller.getBoundingClientRect().top;
    scroller.scrollTop += offset - (scroller.clientHeight - option.offsetHeight) / 2;
    // Once per opening: the person scrolls from there.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  return (
    <OptionPopover
      state={state}
      triggerRef={triggerRef}
      popoverRef={popoverRef}
      onPressOutside={state.close}
      density={density}
    >
      <OptionList
        // A time is always chosen once one is, so Escape closes the list instead of clearing it.
        listBoxProps={{
          id,
          'aria-label': label,
          autoFocus: true,
          disallowEmptySelection: true,
        }}
        state={list}
        listBoxRef={listRef}
        emptyLabel={null}
        classNames={{ list: classNames?.list, item: classNames?.option }}
      />
    </OptionPopover>
  );
}
