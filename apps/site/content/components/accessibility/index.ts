import { button } from './button';
import { iconButton } from './icon-button';
import { buttonGroup } from './button-group';
import { splitButton } from './split-button';
import { fab } from './fab';
import { fabMenu } from './fab-menu';
import { reactionPicker } from './reaction-picker';
import { reactionSummary } from './reaction-summary';
import { textField } from './text-field';
import { messageField } from './message-field';
import { richMessageField } from './rich-message-field';
import { select } from './select';
import { autocomplete } from './autocomplete';
import { fileTrigger } from './file-trigger';
import { imageCrop } from './image-crop';
import { mediaUploadGrid } from './media-upload-grid';
import { phoneField } from './phone-field';
import { pinInput } from './pin-input';
import { checkbox } from './checkbox';
import { radioGroup } from './radio-group';
import { switchControl } from './switch';
import { slider } from './slider';
import { chips } from './chips';
import { card } from './card';
import { dialog } from './dialog';
import { menu } from './menu';
import { tooltip } from './tooltip';
import { sheets } from './sheets';
import { list } from './list';
import { listDetailLayout } from './list-detail-layout';
import { carousel } from './carousel';
import { mediaGrid } from './media-grid';
import { mediaViewer } from './media-viewer';
import { shapedIcon } from './shaped-icon';
import { commentRow } from './comment-row';
import { collapse } from './collapse';
import { accordion } from './accordion';
import { expandableText } from './expandable-text';
import { avatar } from './avatar';
import { badge } from './badge';
import { tag } from './tag';
import { divider } from './divider';
import { skipLink } from './skip-link';
import { link } from './link';
import { navigationRail } from './navigation-rail';
import { navigationBar } from './navigation-bar';
import { tabs } from './tabs';
import { topAppBar } from './top-app-bar';
import { search } from './search';
import { toolbars } from './toolbars';
import { alert } from './alert';
import { snackbar } from './snackbar';
import { progress } from './progress';
import { loadMore } from './load-more';
import { loadingIndicator } from './loading-indicator';
import { pullToRefresh } from './pull-to-refresh';
import { skeleton } from './skeleton';
import { emptyState } from './empty-state';
import { datePicker } from './date-picker';
import { timePicker } from './time-picker';
import { pickerDialog } from './picker-dialog';
import { primitives } from './primitives';
import type { ComponentAccessibility } from './types';

/**
 * Every component page's Accessibility tab, by slug. Each claim is checked against the
 * component's code and tests; `accessibility.test.ts` checks every page has every section.
 */
export const ACCESSIBILITY: Record<string, ComponentAccessibility> = {
  button: button,
  'icon-button': iconButton,
  'button-group': buttonGroup,
  'split-button': splitButton,
  fab: fab,
  'fab-menu': fabMenu,
  'reaction-picker': reactionPicker,
  'reaction-summary': reactionSummary,
  'text-field': textField,
  'message-field': messageField,
  'rich-message-field': richMessageField,
  select: select,
  autocomplete: autocomplete,
  'file-trigger': fileTrigger,
  'image-crop': imageCrop,
  'media-upload-grid': mediaUploadGrid,
  'phone-field': phoneField,
  'pin-input': pinInput,
  checkbox: checkbox,
  'radio-group': radioGroup,
  switch: switchControl,
  slider: slider,
  chips: chips,
  card: card,
  dialog: dialog,
  menu: menu,
  tooltip: tooltip,
  sheets: sheets,
  list: list,
  'list-detail-layout': listDetailLayout,
  carousel: carousel,
  'media-grid': mediaGrid,
  'media-viewer': mediaViewer,
  'shaped-icon': shapedIcon,
  'comment-row': commentRow,
  collapse: collapse,
  accordion: accordion,
  'expandable-text': expandableText,
  avatar: avatar,
  badge: badge,
  tag: tag,
  divider: divider,
  'skip-link': skipLink,
  link: link,
  'navigation-rail': navigationRail,
  'navigation-bar': navigationBar,
  tabs: tabs,
  'top-app-bar': topAppBar,
  search: search,
  toolbars: toolbars,
  alert: alert,
  snackbar: snackbar,
  progress: progress,
  'load-more': loadMore,
  'loading-indicator': loadingIndicator,
  'pull-to-refresh': pullToRefresh,
  skeleton: skeleton,
  'empty-state': emptyState,
  'date-picker': datePicker,
  'time-picker': timePicker,
  'picker-dialog': pickerDialog,
  primitives: primitives,
};
