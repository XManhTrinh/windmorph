/**
 * The Guidelines tab's Do and Don't cards for the most-used components: each pair sets a
 * live example of a rule from the M3 guidelines beside one that breaks it. Each example is
 * an export of `examples/<file>.tsx`, loaded on demand like the Overview's; each sentence
 * states the rule's intent in a line.
 */

/** One card: a live example and the sentence that says what it shows. */
export interface DoDontCard {
  /** The example's file under `examples/`, without `.tsx`. */
  file: string;
  /** The example's export name. */
  name: string;
  /** One sentence, in inline Markdown. */
  text: string;
}

/** A rule, followed and broken. */
export interface DoDontPair {
  do: DoDontCard;
  dont: DoDontCard;
}

export const DO_DONT: Record<string, readonly DoDontPair[]> = {
  button: [
    {
      do: {
        file: 'button/button-guidelines',
        name: 'ButtonDoOneFilled',
        text: 'Use one filled button for the main action, and give the others less emphasis.',
      },
      dont: {
        file: 'button/button-guidelines',
        name: 'ButtonDontManyFilled',
        text: "Don't crowd a view with high-emphasis buttons: move low-priority actions to an overflow menu or icon buttons.",
      },
    },
    {
      do: {
        file: 'button/button-guidelines',
        name: 'ButtonDoToggleLabels',
        text: "Keep a toggle button's label about the same length in both states.",
      },
      dont: {
        file: 'button/button-guidelines',
        name: 'ButtonDontToggleLabels',
        text: "Don't let the label grow or shrink a lot when the button is selected.",
      },
    },
  ],
  'icon-button': [
    {
      do: {
        file: 'icon-button/icon-button-guidelines',
        name: 'IconButtonDoToggle',
        text: 'Use a toggle icon button when the icon can be selected, such as a like.',
      },
      dont: {
        file: 'icon-button/icon-button-guidelines',
        name: 'IconButtonDontToggle',
        text: "Don't use a toggle for an action with no selected state, such as opening an overflow menu.",
      },
    },
  ],
  fab: [
    {
      do: {
        file: 'fab/fab-guidelines',
        name: 'FabDoOne',
        text: "Use one FAB per screen, for the screen's most important action.",
      },
      dont: {
        file: 'fab/fab-guidelines',
        name: 'FabDontMany',
        text: "Don't show several FABs on one screen.",
      },
    },
    {
      do: {
        file: 'fab/fab-guidelines',
        name: 'FabDoPositive',
        text: 'Use a FAB for a primary, positive action, with a clear icon such as add or edit.',
      },
      dont: {
        file: 'fab/fab-guidelines',
        name: 'FabDontDestructive',
        text: "Don't use a FAB for a minor, unclear or destructive action.",
      },
    },
  ],
  'text-field': [
    {
      do: {
        file: 'text-field/text-field-guidelines',
        name: 'TextFieldDoErrorSwap',
        text: 'Swap the supporting text for the error text, with `errorMessage`.',
      },
      dont: {
        file: 'text-field/text-field-guidelines',
        name: 'TextFieldDontErrorAdded',
        text: "Don't add error text below the supporting text: the content under the field shifts.",
      },
    },
    {
      do: {
        file: 'text-field/text-field-guidelines',
        name: 'TextFieldDoShortLabel',
        text: 'Keep the label short, clear and fully visible.',
      },
      dont: {
        file: 'text-field/text-field-guidelines',
        name: 'TextFieldDontLongLabel',
        text: "Don't write a label too long for the field: it gets cut off.",
      },
    },
  ],
  select: [
    {
      do: {
        file: 'select/select-guidelines',
        name: 'SelectDoLongList',
        text: 'Use a select for one choice from a long list: it takes less room than radio buttons or chips.',
      },
      dont: {
        file: 'select/select-guidelines',
        name: 'SelectDontTwoOptions',
        text: "Don't hide two or three choices people should compare in a select: show them as radio buttons or chips.",
      },
    },
  ],
  dialog: [
    {
      do: {
        file: 'dialog/dialog-guidelines',
        name: 'DialogDoSpecific',
        text: 'Ask a specific question, say what it involves, and name the actions after what they do.',
      },
      dont: {
        file: 'dialog/dialog-guidelines',
        name: 'DialogDontAmbiguous',
        text: "Don't ask an ambiguous question with vague actions such as OK.",
      },
    },
    {
      do: {
        file: 'dialog/dialog-guidelines',
        name: 'DialogDoActionOrder',
        text: 'Put the dismissive action first and the confirming action last.',
      },
      dont: {
        file: 'dialog/dialog-guidelines',
        name: 'DialogDontActionOrder',
        text: "Don't put the dismissive action after the confirming one.",
      },
    },
  ],
  snackbar: [
    {
      do: {
        file: 'snackbar/snackbar-guidelines',
        name: 'SnackbarDoUndo',
        text: 'Show one snackbar at a time, with an Undo action when people may want to change their choice.',
      },
      dont: {
        file: 'snackbar/snackbar-guidelines',
        name: 'SnackbarDontStacked',
        text: "Don't stack snackbars on top of one another: queue them with a `SnackbarHost`.",
      },
    },
  ],
  'navigation-bar': [
    {
      do: {
        file: 'navigation-bar/navigation-bar-guidelines',
        name: 'NavigationBarDoFour',
        text: 'Use three to five destinations, each with a short label.',
      },
      dont: {
        file: 'navigation-bar/navigation-bar-guidelines',
        name: 'NavigationBarDontSix',
        text: "Don't put more than five destinations in a navigation bar.",
      },
    },
    {
      do: {
        file: 'navigation-bar/navigation-bar-guidelines',
        name: 'NavigationBarDoOneActive',
        text: 'Show the active indicator on the current destination only.',
      },
      dont: {
        file: 'navigation-bar/navigation-bar-guidelines',
        name: 'NavigationBarDontManyActive',
        text: "Don't mark more than one destination as active at a time.",
      },
    },
  ],
  tabs: [
    {
      do: {
        file: 'tabs/tabs-guidelines',
        name: 'TabsDoConsistent',
        text: 'Give every tab the same kind of content: all with icons and labels, or all with labels.',
      },
      dont: {
        file: 'tabs/tabs-guidelines',
        name: 'TabsDontMixed',
        text: "Don't give icons to some tabs and not to others.",
      },
    },
  ],
  chips: [
    {
      do: {
        file: 'chips/chips-guidelines',
        name: 'ChipsDoSet',
        text: 'Show chips in a set, with short labels.',
      },
      dont: {
        file: 'chips/chips-guidelines',
        name: 'ChipsDontSingle',
        text: "Don't show a single chip on its own.",
      },
    },
    {
      do: {
        file: 'chips/chips-guidelines',
        name: 'ChipsDoFinishWithButton',
        text: 'Use a button for the step that finishes a task, and chips for the options around it.',
      },
      dont: {
        file: 'chips/chips-guidelines',
        name: 'ChipsDontFinishWithChip',
        text: "Don't use a chip to finish or move on a task.",
      },
    },
  ],
};
