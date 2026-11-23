import type { ReactElement } from 'react';
import type { RailGroupId } from '../../content/components/catalog';
import {
  BarChartIcon,
  BoltIcon,
  CalendarMonthIcon,
  CategoryIcon,
  EditIcon,
  ExploreIcon,
  NotificationsIcon,
  WidgetsIcon,
} from '../icons';

/** A representative Material Symbols icon for each rail group. */
export const GROUP_ICONS: Record<RailGroupId, ReactElement> = {
  actions: <BoltIcon />,
  inputs: <EditIcon />,
  containment: <WidgetsIcon />,
  navigation: <ExploreIcon />,
  feedback: <NotificationsIcon />,
  pickers: <CalendarMonthIcon />,
  charts: <BarChartIcon />,
  primitives: <CategoryIcon />,
};
