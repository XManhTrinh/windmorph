'use client';

import {
  AssistChip,
  Button,
  ButtonGroup,
  Fab,
  FilterChip,
  FloatingToolbar,
  IconButton,
  LinearProgressIndicator,
  LoadingIndicator,
  Menu,
  MenuItem,
  SplitButton,
  SuggestionChip,
} from '@windmorph/react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import {
  AddIcon,
  ArrowForwardIcon,
  EditIcon,
  FormatBoldIcon,
  FormatItalicIcon,
  FormatUnderlinedIcon,
} from '../icons';
import { ExpressiveBento } from './expressive-bento';

interface ExpressiveCardProps {
  preview: ReactNode;
  title: string;
  description: string;
  /** Optional call-to-action (e.g. a link) rendered under the description. */
  action?: ReactNode;
}

function ExpressiveCard({ preview, title, description, action }: ExpressiveCardProps) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-corner-extra-large bg-surface-container-low">
      {/* Fixed-height preview band keeps the top edge of every text block aligned. */}
      <div className="flex h-[200px] shrink-0 items-center justify-center bg-secondary-container p-8">
        {preview}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3 className="text-title-large text-on-surface">{title}</h3>
        <p className="text-body-medium text-on-surface-variant">{description}</p>
        {action ? <div className="mt-auto pt-2">{action}</div> : null}
      </div>
    </div>
  );
}

/** Expressive-components section: a grid of live M3 Expressive components. */
export function ExpressiveShowcase() {
  return (
    <section className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <h2 className="text-display-small text-on-surface">Expressive components</h2>
        <p className="max-w-2xl text-body-large text-on-surface-variant">
          Every component from the M3 Expressive update, with its shapes, springs and new sizes,
          ready to drop into a React app.
        </p>
      </div>

      <ExpressiveBento />

      {/* Row 1: Toolbars + Split button */}
      <div className="grid grid-cols-1 gap-4 medium:grid-cols-2">
        <ExpressiveCard
          title="New: Toolbars"
          description="Keep the actions people use most within reach. A floating toolbar holds icon buttons and can sit next to a FAB."
          preview={
            <FloatingToolbar aria-label="Text formatting" expanded={true}>
              <IconButton toggle icon={<FormatBoldIcon />} aria-label="Bold" />
              <IconButton toggle icon={<FormatItalicIcon />} aria-label="Italic" />
              <IconButton toggle icon={<FormatUnderlinedIcon />} aria-label="Underline" />
              <IconButton toggle icon={<AddIcon />} aria-label="Add" />
            </FloatingToolbar>
          }
        />
        <ExpressiveCard
          title="New: Split button"
          description="One main action, with its alternatives one tap away. The menu half morphs its shape as it opens."
          preview={
            <SplitButton
              leadingIcon={<AddIcon />}
              menuLabel="More share options"
              menu={
                <Menu>
                  <MenuItem key="link">Copy link</MenuItem>
                  <MenuItem key="email">Share via email</MenuItem>
                </Menu>
              }
            >
              Share
            </SplitButton>
          }
        />
      </div>

      {/* Row 2: Progress + Button groups + See all */}
      <div className="grid grid-cols-1 gap-4 medium:grid-cols-3">
        <ExpressiveCard
          title="Updated: Progress indicators"
          description="Show how far along a task is, with a wavy track or the shape-morphing loading indicator."
          preview={
            <div className="flex items-center gap-6">
              <LinearProgressIndicator wavy aria-label="Loading" className="w-32" />
              <LoadingIndicator aria-label="Loading" />
            </div>
          }
        />
        <ExpressiveCard
          title="New: Button groups"
          description="Related buttons that react to each other: the pressed one changes shape, and in a standard group it grows while its neighbours make room."
          preview={
            <ButtonGroup
              variant="connected"
              selectionMode="single"
              disallowEmptySelection
              defaultSelectedKeys={['week']}
              aria-label="Calendar view"
              className="w-fit"
            >
              <Button toggle value="day">
                Day
              </Button>
              <Button toggle value="week">
                Week
              </Button>
              <Button toggle value="month">
                Month
              </Button>
            </ButtonGroup>
          }
        />

        {/* "See all" card — same shape as the others, with a live component cluster */}
        <ExpressiveCard
          title="See all expressive components"
          description="Browse every component, each with live demos, its API and accessibility notes."
          action={
            <Link
              href="/components"
              className="group/link inline-flex items-center gap-1 rounded-sm text-label-large text-primary outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
            >
              Browse all
              <span className="inline-flex size-5 transition-transform group-hover/link:translate-x-0.5 rtl:group-hover/link:-translate-x-0.5 motion-reduce:transition-none">
                <ArrowForwardIcon />
              </span>
            </Link>
          }
          preview={
            <div className="flex flex-wrap items-center justify-center gap-2">
              <AssistChip leadingIcon={<EditIcon />}>Edit</AssistChip>
              <FilterChip selected>Filter</FilterChip>
              <SuggestionChip>Suggest</SuggestionChip>
              <LoadingIndicator aria-label="Loading" />
              <Fab size="default" color="tertiary-container" icon={<AddIcon />} aria-label="Add" />
            </div>
          }
        />
      </div>
    </section>
  );
}
