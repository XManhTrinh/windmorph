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
import type { ButtonGroupLabels } from './composites/button-group/ButtonGroup';

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
  Autocomplete?: Partial<AutocompleteLabels>;
  Badge?: Partial<BadgeLabels>;
  BottomSheet?: Partial<BottomSheetLabels>;
  /** `Button` and `IconButton`. */
  Button?: Partial<ButtonLabels>;
  ButtonGroup?: Partial<ButtonGroupLabels>;
  Carousel?: Partial<CarouselLabels>;
  /** `FilterChip` and `InputChip`. */
  Chip?: Partial<ChipLabels>;
  /** `DateField` reads `DatePicker`'s words first, then these. */
  DateField?: Partial<DateFieldLabels>;
  /** `DatePicker` and `DateRangePicker`. */
  DatePicker?: Partial<DatePickerLabels>;
  DialogHeader?: Partial<DialogHeaderLabels>;
  Menu?: Partial<MenuLabels>;
  PickerDialog?: Partial<PickerDialogLabels>;
  PullToRefresh?: Partial<PullToRefreshLabels>;
  RangeSlider?: Partial<RangeSliderLabels>;
  SearchField?: Partial<SearchFieldLabels>;
  Select?: Partial<SelectLabels>;
  SideSheet?: Partial<SideSheetLabels>;
  /** `Snackbar` and `SnackbarHost`. */
  Snackbar?: Partial<SnackbarLabels>;
  SplitButton?: Partial<SplitButtonLabels>;
  TextField?: Partial<TextFieldLabels>;
  /** `TimeField` reads `TimePicker`'s and `PickerDialog`'s words first, then these. */
  TimeField?: Partial<TimeFieldLabels>;
  /** `TimePicker` and `TimePickerModeToggle`. */
  TimePicker?: Partial<TimePickerLabels>;
}
