'use client';

import { Button, IconButton } from '@windmorph/react';
import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { ExpandMoreIcon, LinkIcon } from './icons';
import { useCopy } from './site-snackbar';

/**
 * Unfolding content fades and settles in on the default effects spring; under reduced
 * motion it simply appears.
 */
const REVEAL =
  'transition-[opacity,translate] duration-(--md-sys-motion-spring-effects-default-duration) ease-(--md-sys-motion-spring-effects-default-easing) motion-safe:starting:-translate-y-1 motion-safe:starting:opacity-0';

/** The chevron turns over while its disclosure is open. */
const CHEVRON =
  '[&_svg]:transition-transform [&_svg]:duration-(--md-sys-motion-spring-spatial-fast-duration) [&_svg]:ease-(--md-sys-motion-spring-spatial-fast-easing) aria-expanded:[&_svg]:rotate-180';

/** The element the URL's fragment names, if any. */
function hashTarget(): HTMLElement | null {
  const id = decodeURIComponent(window.location.hash.slice(1));
  return id ? document.getElementById(id) : null;
}

/**
 * An object prop's keys behind a disclosure: a text button showing how many there are, which
 * expands the nested list below it. The list is in the page from the start (hidden while
 * folded), so its anchors exist; a URL fragment naming a key opens it and scrolls the key
 * into view, on load and on every fragment change.
 */
export function PropKeys({ count, children }: { count: number; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const listId = useId();
  const list = useRef<HTMLDivElement>(null);
  const reveal = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const openForHash = () => {
      const target = hashTarget();
      if (!target || !list.current?.contains(target)) return;
      reveal.current = target;
      setOpen(true);
    };
    openForHash();
    window.addEventListener('hashchange', openForHash);
    return () => window.removeEventListener('hashchange', openForHash);
  }, []);

  useEffect(() => {
    // The browser couldn't scroll to a key while it was hidden, so this does once it shows.
    if (!open || !reveal.current) return;
    reveal.current.scrollIntoView({ block: 'start' });
    reveal.current = null;
  }, [open]);

  return (
    <div className="flex flex-col items-start gap-1">
      <Button
        variant="text"
        size="sm"
        leadingIcon={<ExpandMoreIcon />}
        aria-expanded={open}
        aria-controls={listId}
        onPress={() => setOpen((value) => !value)}
        className={`-ms-3 ${CHEVRON}`}
      >
        {`${count} ${count === 1 ? 'key' : 'keys'}`}
      </Button>
      <div id={listId} ref={list} hidden={!open} className={`self-stretch ${REVEAL}`}>
        {children}
      </div>
    </div>
  );
}

/**
 * The rest of a long union's members (a country code, a shape), folded behind a text button
 * that names how many there are in all.
 */
export function MoreValues({ total, children }: { total: number; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const restId = useId();
  return (
    <>
      <span id={restId} hidden={!open} className={`contents ${REVEAL}`}>
        {children}
      </span>
      <Button
        variant="text"
        size="xs"
        aria-expanded={open}
        aria-controls={restId}
        onPress={() => setOpen((value) => !value)}
      >
        {open ? 'Show fewer' : `Show all ${total}`}
      </Button>
    </>
  );
}

/**
 * A prop's anchor: a link to it that also copies its address and confirms in the snackbar.
 * It shows while the pointer is over the prop's header or focus is in it, and always on
 * touch screens, which have no hover.
 */
export function PropLink({ id, name }: { id: string; name: string }) {
  const copy = useCopy('Link copied');
  return (
    <IconButton
      href={`#${id}`}
      variant="standard"
      size="xs"
      icon={<LinkIcon />}
      aria-label={`Link to ${name}`}
      onPress={() => {
        void copy(`${window.location.origin}${window.location.pathname}#${id}`);
      }}
      className="opacity-0 group-focus-within/prop:opacity-100 group-hover/prop:opacity-100 pointer-coarse:opacity-100"
    />
  );
}
