import { describe, expect, expectTypeOf, it } from 'vitest';
import {
  ariaFlag,
  pickWidgetAria,
  splitRootProps,
  type DescriptionAria,
  type RootEvent,
  type WidgetAria,
} from './root-props';

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
    'aria-multiline': false,
    'aria-placeholder': 'MM/DD/YYYY',
  };

  /** Every description attribute, written out: the type checks the list. */
  const DESCRIPTION: Record<DescriptionAria, string> = {
    'aria-description': 'Shown to everyone you follow',
    'aria-roledescription': 'slide',
    'aria-braillelabel': 'Name',
    'aria-brailleroledescription': 'sld',
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

  it('sends the description attributes to a root that is the labelled element', () => {
    const { root, rest } = splitRootProps(DESCRIPTION);
    expect(root).toEqual(DESCRIPTION);
    expect(rest).toEqual({});
  });

  it('leaves the description attributes for the labelled element when the root wraps it', () => {
    const { root, rest } = splitRootProps({ ...DESCRIPTION, 'aria-busy': true }, { wrapper: true });
    expect(root).toEqual({ 'aria-busy': true });
    expect(rest).toEqual(DESCRIPTION);
  });

  it('types `rest` as what stays in it, for a wrapper or not', () => {
    type Props = {
      'aria-label'?: string;
      'aria-expanded'?: boolean;
      'aria-description'?: string;
      'aria-busy'?: boolean;
      'data-probe'?: string;
      name?: string;
    };
    const props: Props = {};
    expectTypeOf(splitRootProps(props).rest).toEqualTypeOf<Pick<Props, 'aria-label' | 'name'>>();
    expectTypeOf(splitRootProps(props, { wrapper: true }).rest).toEqualTypeOf<
      Pick<Props, 'aria-label' | 'aria-expanded' | 'aria-description' | 'name'>
    >();
  });

  it('picks the widget and description attributes that are set', () => {
    const { 'aria-expanded': _expanded, ...set } = WIDGET;
    expect(
      pickWidgetAria({
        ...set,
        ...DESCRIPTION,
        'aria-expanded': undefined,
        'aria-label': 'Name',
        id: 'name',
      }),
    ).toEqual({ ...set, ...DESCRIPTION });
  });
});

describe('ariaFlag', () => {
  it('reads an aria-invalid, aria-required or aria-readonly value as a boolean state', () => {
    expect(ariaFlag(undefined)).toBeUndefined();
    expect(ariaFlag(false)).toBe(false);
    expect(ariaFlag('false')).toBe(false);
    expect(ariaFlag(true)).toBe(true);
    expect(ariaFlag('true')).toBe(true);
    expect(ariaFlag('grammar')).toBe(true);
  });
});
