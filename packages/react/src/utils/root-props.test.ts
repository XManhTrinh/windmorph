import { describe, expect, it } from 'vitest';
import { pickWidgetAria, splitRootProps, type RootEvent, type WidgetAria } from './root-props';

/** Every root event, written out: the type checks the list, the test checks the run-time match. */
const ROOT_EVENTS = [
  'onClick',
  'onAuxClick',
  'onContextMenu',
  'onDoubleClick',
  'onMouseDown',
  'onMouseEnter',
  'onMouseLeave',
  'onMouseMove',
  'onMouseOut',
  'onMouseOver',
  'onMouseUp',
  'onPointerDown',
  'onPointerMove',
  'onPointerUp',
  'onPointerCancel',
  'onPointerEnter',
  'onPointerLeave',
  'onPointerOver',
  'onPointerOut',
  'onGotPointerCapture',
  'onLostPointerCapture',
  'onTouchStart',
  'onTouchMove',
  'onTouchEnd',
  'onTouchCancel',
  'onDrag',
  'onDragEnd',
  'onDragEnter',
  'onDragExit',
  'onDragLeave',
  'onDragOver',
  'onDragStart',
  'onDrop',
  'onWheel',
  'onScroll',
  'onAnimationStart',
  'onAnimationEnd',
  'onAnimationIteration',
  'onTransitionStart',
  'onTransitionRun',
  'onTransitionEnd',
  'onTransitionCancel',
] as const satisfies readonly RootEvent[];

// Every member of the union is in the list.
type Missing = Exclude<RootEvent, (typeof ROOT_EVENTS)[number]>;
const complete: Missing extends never ? true : Missing = true;

describe('splitRootProps', () => {
  it('sends data-*, non-naming aria-*, global attributes and root events to the root', () => {
    const handler = () => {};
    const { root, rest } = splitRootProps({
      'data-probe': 'yes',
      'aria-busy': true,
      'aria-hidden': false,
      title: 'Probe',
      lang: 'fr',
      ...Object.fromEntries(ROOT_EVENTS.map((name) => [name, handler])),
      onPointerDownCapture: handler,
    });
    expect(complete).toBe(true);
    expect(Object.keys(rest)).toEqual([]);
    expect(Object.keys(root)).toHaveLength(ROOT_EVENTS.length + 6);
  });

  it('leaves the naming attributes, focus, key and input events and React Aria callbacks', () => {
    const handler = () => {};
    const kept = {
      id: 'name',
      'aria-label': 'Name',
      'aria-labelledby': 'label',
      'aria-describedby': 'hint',
      'aria-details': 'details',
      'aria-errormessage': 'error',
      onFocus: handler,
      onBlur: handler,
      onKeyDown: handler,
      onKeyUp: handler,
      onChange: handler,
      onInput: handler,
      onPress: handler,
      onFocusChange: handler,
      onSelectionChange: handler,
      onClickOutside: handler,
      name: 'field',
    };
    const { root, rest } = splitRootProps(kept);
    expect(root).toEqual({});
    expect(rest).toEqual(kept);
  });

  /** Every widget attribute, written out: the type checks the list. */
  const WIDGET: Record<WidgetAria, string | boolean> = {
    'aria-controls': 'list',
    'aria-haspopup': 'listbox',
    'aria-autocomplete': 'list',
    'aria-activedescendant': 'option-1',
    'aria-expanded': true,
    'aria-required': true,
    'aria-invalid': true,
    'aria-readonly': true,
  };

  it('sends the widget attributes to the root when the root is the widget', () => {
    const { root, rest } = splitRootProps(WIDGET);
    expect(root).toEqual(WIDGET);
    expect(rest).toEqual({});
  });

  it('leaves the widget attributes for the labelled element when the root wraps it', () => {
    const { root, rest } = splitRootProps({ ...WIDGET, 'aria-busy': true }, { wrapper: true });
    expect(root).toEqual({ 'aria-busy': true });
    expect(rest).toEqual(WIDGET);
  });

  it('picks the widget attributes that are set', () => {
    const { 'aria-expanded': _expanded, ...set } = WIDGET;
    expect(
      pickWidgetAria({ ...set, 'aria-expanded': undefined, 'aria-label': 'Name', id: 'name' }),
    ).toEqual(set);
  });
});
