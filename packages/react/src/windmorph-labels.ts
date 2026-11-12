import type { AutocompleteLabels } from './components/autocomplete/Autocomplete';
import type { BadgeLabels } from './components/badge/Badge';
import type { ButtonLabels } from './components/button/button-pending';
import type { CarouselLabels } from './components/carousel/Carousel';
import type { ChipLabels } from './components/chip/Chip';
import type { DateFieldLabels } from './components/date-picker/DateField';
import type { DatePickerLabels } from './components/date-picker/DatePicker';
import type { PickerDialogLabels } from './components/date-picker/PickerDialog';
import type { DialogHeaderLabels } from './components/dialog/Dialog';
import type { MenuLabels } from './components/menu/Menu';
import type { PullToRefreshLabels } from './components/pull-to-refresh/PullToRefresh';
import type { SearchFieldLabels } from './components/search/SearchField';
import type { SelectLabels } from './components/select/Select';
import type { BottomSheetLabels } from './components/sheet/BottomSheet';
import type { SideSheetLabels } from './components/sheet/SideSheet';
import type { RangeSliderLabels } from './components/slider/Slider';
import type { SnackbarLabels } from './components/snackbar/Snackbar';
import type { SplitButtonLabels } from './components/split-button/SplitButton';
import type { TextFieldLabels } from './components/text-field/TextField';
import type { TimeFieldLabels } from './components/time-picker/TimeField';
import type { TimePickerLabels } from './components/time-picker/TimePicker';
import type { ButtonGroupLabels } from './components/button-group/ButtonGroup';

/**
 * The words components show or announce by themselves, keyed by component, for
 * {@link LabelsProvider}. Each key is a labels type's name without `Labels`, and takes the
 * words that component's own `labels` prop takes.
 *
 * Components that share a labels type share a key: `Button` is `Button` and `IconButton`,
 * `Chip` the chips, `DatePicker` both date pickers, `TimePicker` the picker and its mode
 * toggle, `Snackbar` the snackbar and its host. A component built from another reads that
 * one's words too, then its own: `DateField` reads `DatePicker`'s, and `TimeField` reads
 * `TimePicker`'s and `PickerDialog`'s.
 *
 * A package that builds on this one adds its components by declaration merging:
 *
 * ```ts
 * declare module '@windmorph/react' {
 *   interface WindmorphLabels {
 *     Rating?: Partial<RatingLabels>;
 *   }
 * }
 * ```
 */
export interface WindmorphLabels {
  /** `Autocomplete`'s words. @default each word's English default */
  Autocomplete?: Partial<AutocompleteLabels>;
  /** `Badge`'s words. @default each word's English default */
  Badge?: Partial<BadgeLabels>;
  /** `BottomSheet`'s words. @default each word's English default */
  BottomSheet?: Partial<BottomSheetLabels>;
  /** `Button`'s and `IconButton`'s words. @default each word's English default */
  Button?: Partial<ButtonLabels>;
  /** `ButtonGroup`'s words. @default each word's English default */
  ButtonGroup?: Partial<ButtonGroupLabels>;
  /** `Carousel`'s words. @default each word's English default */
  Carousel?: Partial<CarouselLabels>;
  /** `FilterChip`'s and `InputChip`'s words. @default each word's English default */
  Chip?: Partial<ChipLabels>;
  /**
   * `DateField`'s words. It reads `DatePicker`'s first, then these.
   * @default each word's English default
   */
  DateField?: Partial<DateFieldLabels>;
  /** `DatePicker`'s and `DateRangePicker`'s words. @default each word's English default */
  DatePicker?: Partial<DatePickerLabels>;
  /** `DialogHeader`'s words. @default each word's English default */
  DialogHeader?: Partial<DialogHeaderLabels>;
  /** `Menu`'s words. @default each word's English default */
  Menu?: Partial<MenuLabels>;
  /** `PickerDialog`'s words. @default each word's English default */
  PickerDialog?: Partial<PickerDialogLabels>;
  /** `PullToRefresh`'s words. @default each word's English default */
  PullToRefresh?: Partial<PullToRefreshLabels>;
  /** `RangeSlider`'s words. @default each word's English default */
  RangeSlider?: Partial<RangeSliderLabels>;
  /** `SearchField`'s words. @default each word's English default */
  SearchField?: Partial<SearchFieldLabels>;
  /** `Select`'s words. @default each word's English default */
  Select?: Partial<SelectLabels>;
  /** `SideSheet`'s words. @default each word's English default */
  SideSheet?: Partial<SideSheetLabels>;
  /**
   * `Snackbar`'s words, and those of the snackbars a `SnackbarHost` shows.
   * @default each word's English default
   */
  Snackbar?: Partial<SnackbarLabels>;
  /** `SplitButton`'s words. @default each word's English default */
  SplitButton?: Partial<SplitButtonLabels>;
  /** `TextField`'s words. @default each word's English default */
  TextField?: Partial<TextFieldLabels>;
  /**
   * `TimeField`'s words. It reads `TimePicker`'s and `PickerDialog`'s first, then these.
   * @default each word's English default
   */
  TimeField?: Partial<TimeFieldLabels>;
  /** `TimePicker`'s and `TimePickerModeToggle`'s words. @default each word's English default */
  TimePicker?: Partial<TimePickerLabels>;
}
