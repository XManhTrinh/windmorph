interface Base {
  /** The style. @default "filled" */
  variant?: 'filled' | 'text';
}

interface ActionForm extends Base {
  /** Ref to the root element: the `<button>`, or the `<a>` with `href`. */
  ref?: string;
  /** Not set: the control is a button. */
  href?: never;
}

interface LinkForm extends Base {
  /** Ref to the root `<a>` element. */
  ref?: string;
  /** Renders a link. */
  href: string;
}

/** Names the control: one of the two is required. */
type Naming =
  | {
      /** Names the control. */
      'aria-label': string;
      'aria-labelledby'?: never;
    }
  | {
      /** The id of the element that names the control. */
      'aria-labelledby': string;
      'aria-label'?: never;
    };

/** A control with an action and a link form. */
export function Control(props: (ActionForm | LinkForm) & Naming): string {
  return String(props.variant);
}
