import { expect, test, type Page } from '@playwright/test';
import { componentStoryIds } from './catalog-stories';
import { openStory } from './story';

/*
 * Scroll-jump guard (2026-10-15). The re-audit found pages that jumped when a control took
 * focus (a checkbox 430px, scrollable tabs 190px, a snackbar's focus return 1130px) or when
 * the browser's scroll anchor moved. Every component story is placed on a scrolled page with
 * its first interactive element partly above the window, at phone and desktop sizes; the
 * element is pressed where it shows, as a reader would, and `window.scrollY` must not move on
 * any frame. On desktop, a press that lands in a composite widget (tabs, radio group, list,
 * menu, toolbar, slider) then moves focus with an arrow key, the widget fully in view: the
 * page may scroll only as far as revealing a newly focused element that was off-screen needs.
 *
 * One test per story and size, so the suite shards freely.
 */

const PHONE = { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true };
const DESKTOP = { viewport: { width: 1280, height: 800 } };

interface Target {
  x: number;
  y: number;
  /** The element's text or label, for failure messages. */
  name: string;
}

/**
 * Wraps the story in a tall page and scrolls it to the story. Overlays open by default may
 * close on that scroll (React Aria's close-on-scroll), so targets are found afterwards.
 */
async function setUpPage(page: Page) {
  await page.evaluate(() => {
    // A link's press stays on the page.
    document.addEventListener(
      'click',
      (event) => {
        if ((event.target as Element).closest('a[href]')) event.preventDefault();
      },
      true,
    );
    const root = document.getElementById('storybook-root')!;
    const spacer = (height: number) => {
      const element = document.createElement('div');
      element.style.height = `${height}px`;
      return element;
    };
    root.before(spacer(1500));
    root.after(spacer(2500));
    window.scrollTo(0, 1500);
    // Overlays open by default reposition next to their trigger, which the spacer moved.
    window.dispatchEvent(new Event('resize'));
  });
  await page.waitForTimeout(300);
}

/** Places the story's first pressable element a third above the window's top edge. */
function placeTarget(page: Page) {
  return page.evaluate((): Target | null => {
    const INTERACTIVE = [
      'button',
      'a[href]',
      'input:not([type=hidden])',
      'textarea',
      'select',
      'label:has(input)',
      '[role=button]',
      '[role=link]',
      '[role=tab]',
      '[role=switch]',
      '[role=checkbox]',
      '[role=radio]',
      '[role=slider]',
      '[role=option]',
      '[role=menuitem]',
      '[role=menuitemradio]',
      '[role=menuitemcheckbox]',
      '[role=gridcell]',
      '[role=row][tabindex]',
      '[role=combobox]',
      '[tabindex="0"]',
    ].join(',');

    const viewport = { width: window.innerWidth, height: window.innerHeight };
    const visibleBox = (rect: DOMRect) => ({
      left: Math.max(rect.left, 0),
      right: Math.min(rect.right, viewport.width),
      top: Math.max(rect.top, 0),
      bottom: Math.min(rect.bottom, viewport.height),
    });
    /** The middle of the element's on-screen part, if it can be pressed there. */
    const pressPoint = (element: Element) => {
      const box = visibleBox(element.getBoundingClientRect());
      if (box.right - box.left < 4 || box.bottom - box.top < 4) return null;
      const x = (box.left + box.right) / 2;
      const y = (box.top + box.bottom) / 2;
      const hit = document.elementFromPoint(x, y);
      if (!hit) return null;
      // A press there reaches the element, or another part of the same component (a field's
      // floating label over its input, say).
      const component = (node: Element) => node.closest('[data-tokens]');
      const reaches = element.contains(hit) || component(hit) === component(element);
      return reaches ? { x, y } : null;
    };

    /** A visually hidden control (a checkbox's or slider's input) is pressed by what shows it. */
    const shown = (element: HTMLElement) => {
      if (!element.matches('input, [role=slider]')) return element;
      let node: HTMLElement | null = element;
      for (let depth = 0; node && depth < 4; depth++, node = node.parentElement) {
        const rect = node.getBoundingClientRect();
        if (rect.width >= 8 && rect.height >= 8) return node;
      }
      return null;
    };
    const candidates = [...document.querySelectorAll<HTMLElement>(INTERACTIVE)]
      .filter((element) => {
        // Storybook's own (hidden) error and loading screens aren't the story.
        const chrome = '.sb-errordisplay, .sb-nopreview, .sb-preparing-story, .sb-preparing-docs';
        if (element.closest(`[inert], [aria-hidden=true], #storybook-docs, ${chrome}`)) {
          return false;
        }
        return !element.matches(':disabled, [aria-disabled=true]');
      })
      .map(shown)
      .filter((element): element is HTMLElement => {
        if (!element || element.id === 'storybook-root') return false;
        const rect = element.getBoundingClientRect();
        if (rect.width < 8 || rect.height < 8) return false;
        const style = getComputedStyle(element);
        return style.visibility !== 'hidden' && Number(style.opacity) > 0;
      });

    for (const element of candidates) {
      const rect = element.getBoundingClientRect();
      const documentTop = rect.top + window.scrollY;
      window.scrollTo(0, Math.max(documentTop + rect.height / 3, 600));
      const point = pressPoint(element);
      if (point) {
        return {
          ...point,
          name: (element.getAttribute('aria-label') ?? element.textContent ?? element.tagName)
            .trim()
            .slice(0, 40),
        };
      }
    }
    return null;
  });
}

/** Runs `act` while recording `scrollY` on every frame, until things settle. */
async function scrollDuring(page: Page, act: () => Promise<void>) {
  await page.evaluate(() => {
    const record = { values: [window.scrollY], running: true };
    (window as unknown as { scrollGuard: typeof record }).scrollGuard = record;
    const tick = () => {
      record.values.push(window.scrollY);
      if (record.running) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  await act();
  await page.waitForTimeout(700);
  return page.evaluate(() => {
    const record = (window as unknown as { scrollGuard: { values: number[]; running: boolean } })
      .scrollGuard;
    record.running = false;
    record.values.push(window.scrollY);
    return record.values;
  });
}

/** Whether focus is in a widget that moves it with the arrow keys, and which key. */
function arrowKeyFor(page: Page) {
  return page.evaluate(() => {
    const active = document.activeElement;
    if (!active || active === document.body) return null;
    const widget = active.closest(
      '[role=tablist], [role=radiogroup], [role=listbox], [role=menu], [role=menubar], [role=grid], [role=tree], [role=toolbar], [role=slider]',
    );
    if (!widget) return null;
    const orientation = widget.getAttribute('aria-orientation');
    const role = widget.getAttribute('role');
    const horizontal =
      orientation === 'horizontal' ||
      (!orientation && ['tablist', 'menubar', 'toolbar', 'slider'].includes(role!));
    return horizontal ? 'ArrowRight' : 'ArrowDown';
  });
}

for (const [size, device] of [
  ['phone', PHONE],
  ['desktop', DESKTOP],
] as const) {
  test.describe(`Scroll guard, ${size}`, () => {
    test.describe.configure({ mode: 'parallel' });
    test.use(device);

    for (const id of componentStoryIds) {
      test(id, async ({ page }) => {
        test.setTimeout(20_000);
        await openStory(page, id);
        // Let enter transitions (overlays open by default) finish.
        await page.waitForTimeout(400);
        await setUpPage(page);
        const target = await placeTarget(page);
        if (!target) {
          // A static story (progress, a divider): nothing to press, nothing may move.
          test.info().annotations.push({ type: 'static', description: 'nothing to press' });
          return;
        }
        const { x, y, name } = target;

        const pressed = await scrollDuring(page, () =>
          size === 'phone' ? page.touchscreen.tap(x, y) : page.mouse.click(x, y),
        );
        expect(new Set(pressed), `pressing "${name}": ${pressed.join(' ')}`).toEqual(
          new Set([pressed[0]]),
        );

        if (size === 'phone') return;
        const key = await arrowKeyFor(page);
        if (!key) return;
        // The focused widget fully in view, a third of the way down the window.
        await page.evaluate(() => {
          const rect = document.activeElement!.getBoundingClientRect();
          window.scrollTo(0, Math.max(rect.top + window.scrollY - window.innerHeight / 3, 600));
        });
        const moved = await scrollDuring(page, () => page.keyboard.press(key));
        const delta = moved.at(-1)! - moved[0]!;
        // A newly focused element off-screen may be revealed, by no more than it needs.
        const allowed = await page.evaluate((delta) => {
          const rect = document.activeElement!.getBoundingClientRect();
          const top = rect.top + delta;
          const bottom = rect.bottom + delta;
          if (top < 0) return -top;
          if (bottom > window.innerHeight) return bottom - window.innerHeight;
          return 0;
        }, delta);
        const largest = Math.max(...moved.map((value) => Math.abs(value - moved[0]!)));
        expect(largest, `${key} after pressing "${name}": ${moved.join(' ')}`).toBeLessThanOrEqual(
          allowed + 1,
        );
      });
    }
  });
}
