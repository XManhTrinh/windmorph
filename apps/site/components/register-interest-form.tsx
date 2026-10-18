'use client';

import { Button, Checkbox, Radio, RadioGroup, TextField } from '@windmorph/react';
import { useEffect, useRef, useState, type FormEvent } from 'react';

const LINK =
  'rounded-sm text-primary underline underline-offset-2 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary';

/** One set of choices to tick, shown as a fieldset: a catalog group's components, say. */
export interface RegisterInterestGroup {
  id: string;
  /** The fieldset's legend. */
  label: string;
  /** The names to tick; a ticked one is sent as written. */
  choices: readonly string[];
}

export interface RegisterInterestFormProps {
  /** The paid product the person registers interest in, sent as `interest` (`pro`). */
  interest: string;
  /** The question over the choices: "Which Pro components would you use?" */
  choicesLabel: string;
  /** The choices to tick, in groups. */
  groups: readonly RegisterInterestGroup[];
  /** Where the form is, sent as `source` (`pro-page`), so answers can be told apart. */
  source: string;
}

/** The team sizes to pick from, as sent (`teamSize`) and as shown. */
const TEAM_SIZES = [
  { value: '1', label: 'Just me' },
  { value: '2-10', label: '2–10' },
  { value: '11+', label: '11 or more' },
] as const;

/** The longest answer to "What component is missing?". */
export const MISSING_MAX_LENGTH = 500;

/**
 * What the last submit came to. `sent` replaces the form; `email` is an error on the email
 * field; the rest are messages under the form, `failed` with Try again.
 */
type Outcome =
  | { kind: 'idle' }
  | { kind: 'sent'; email: string }
  | { kind: 'email'; message: string }
  | { kind: 'rate-limited' }
  | { kind: 'failed' }
  | { kind: 'unconfigured' };

const MESSAGES = {
  emailMissing: 'Enter your email address.',
  emailInvalid: 'Enter an email address like name@example.com.',
  emailRejected: "This address can't be used. Check it and try again.",
  rateLimited: 'Too many tries. Wait a minute and try again.',
  failed: "Your answers couldn't be sent. Check your connection and try again.",
  unconfigured: "Nothing was sent: sign-up isn't set up in this build of the site.",
  sentTitle: 'Check your inbox to confirm your address',
  sent: (email: string) =>
    `We've sent a link to ${email}. Your address is added to the list once you open it.`,
};

/**
 * The email provider's public form endpoint and list, from the build's environment; `null`
 * when either is missing (local builds, previews, CI), so the form sends nothing. Both IDs
 * are public: they're in every page that has the form.
 */
export function signUpTarget(): { url: string; listId: string } | null {
  const formId = process.env.NEXT_PUBLIC_LOOPS_FORM_ID;
  const listId = process.env.NEXT_PUBLIC_LOOPS_LIST_ID;
  if (!formId || !listId) return null;
  return { url: `https://app.loops.so/api/newsletter-form/${formId}`, listId };
}

/** The answers as the endpoint takes them, leaving out the optional ones left empty. */
export function signUpBody(answers: {
  email: string;
  interest: string;
  components: readonly string[];
  missingComponent: string;
  teamSize: string;
  source: string;
  listId: string;
}): URLSearchParams {
  const body = new URLSearchParams({ email: answers.email, interest: answers.interest });
  if (answers.components.length > 0) body.set('components', answers.components.join(','));
  if (answers.missingComponent) body.set('missingComponent', answers.missingComponent);
  if (answers.teamSize) body.set('teamSize', answers.teamSize);
  body.set('source', answers.source);
  body.set('mailingLists', answers.listId);
  return body;
}

/**
 * Sends the answers and reads the reply: `{ success, message? }`, or HTTP 429 when rate
 * limited. A refusal that names the email is the address's fault; anything else, a thrown
 * request included, is a failure to retry.
 */
async function send(url: string, body: URLSearchParams, email: string): Promise<Outcome> {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });
    if (response.status === 429) return { kind: 'rate-limited' };
    const reply = (await response.json().catch(() => ({}))) as {
      success?: boolean;
      message?: string;
    };
    if (response.ok && reply.success) return { kind: 'sent', email };
    if (/email/i.test(reply.message ?? '')) {
      return { kind: 'email', message: MESSAGES.emailRejected };
    }
    return { kind: 'failed' };
  } catch {
    return { kind: 'failed' };
  }
}

/** Focuses `element` without the jump `focus()` makes, then brings it into view if needed. */
function focusQuietly(element: HTMLElement | null) {
  if (!element) return;
  element.focus({ preventScroll: true });
  element.scrollIntoView?.({ block: 'nearest' });
}

/**
 * The form for registering interest in a paid product (Windmorph Pro, later its add-ons): an
 * email address, the choices the person would use, what's missing and their team size, sent
 * to the email provider's double opt-in list. Nothing is stored in the browser.
 *
 * Every outcome is announced in a status region that mounts with the form (a region added
 * with its content isn't announced), and focus moves to it, or to the email field for an
 * address error, without scrolling the page. Success replaces the form with "check your
 * inbox"; an error keeps everything typed. A filled trap field, which people never see,
 * shows success and sends nothing. A build without the provider's IDs says so and sends
 * nothing.
 */
export function RegisterInterestForm({
  interest,
  choicesLabel,
  groups,
  source,
}: RegisterInterestFormProps) {
  const target = signUpTarget();
  const [email, setEmail] = useState('');
  const [outcome, setOutcome] = useState<Outcome>({ kind: 'idle' });
  const [pending, setPending] = useState(false);
  // Counts submits, so a repeated outcome is announced and focused again.
  const [attempt, setAttempt] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (outcome.kind === 'idle') return;
    focusQuietly(outcome.kind === 'email' ? emailRef.current : messageRef.current);
  }, [outcome, attempt]);

  const finish = (next: Outcome) => {
    setOutcome(next);
    setAttempt((count) => count + 1);
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const address = email.trim();
    if (!address) return finish({ kind: 'email', message: MESSAGES.emailMissing });
    if (emailRef.current?.validity.typeMismatch) {
      return finish({ kind: 'email', message: MESSAGES.emailInvalid });
    }
    // Only a bot fills the trap: it gets the success it expects, and nothing is sent.
    if (String(data.get('website') ?? '')) return finish({ kind: 'sent', email: address });
    if (!target) return finish({ kind: 'unconfigured' });

    const body = signUpBody({
      email: address,
      interest,
      components: data.getAll('components').map(String),
      missingComponent: String(data.get('missingComponent') ?? '').trim(),
      teamSize: String(data.get('teamSize') ?? ''),
      source,
      listId: target.listId,
    });
    setPending(true);
    const result = await send(target.url, body, address);
    setPending(false);
    finish(result);
  };

  const emailError = outcome.kind === 'email' ? outcome.message : undefined;
  const message =
    outcome.kind === 'rate-limited'
      ? MESSAGES.rateLimited
      : outcome.kind === 'failed'
        ? MESSAGES.failed
        : outcome.kind === 'unconfigured'
          ? MESSAGES.unconfigured
          : undefined;

  return (
    // No gap between the parts: the status region is always there, empty or not, so its
    // messages carry their own space. A form means nothing in the page's Markdown twin.
    <div data-markdown="skip" className="flex flex-col">
      {!target && (
        <p className="mb-6 rounded-corner-medium bg-surface-container-high p-4 text-body-medium text-on-surface-variant">
          Sign-up isn&apos;t set up in this build of the site, so this form sends nothing.
        </p>
      )}
      {outcome.kind !== 'sent' && (
        <form
          ref={formRef}
          noValidate
          onSubmit={submit}
          aria-label="Register interest"
          className="flex flex-col gap-6"
        >
          <TextField
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(value) => {
              setEmail(value);
              if (outcome.kind === 'email') setOutcome({ kind: 'idle' });
            }}
            invalid={emailError !== undefined}
            errorMessage={emailError}
            inputRef={emailRef}
          />
          <fieldset className="flex min-w-0 flex-col gap-4">
            <legend className="mb-2 text-title-medium text-on-surface">{choicesLabel}</legend>
            {groups.map((group) => (
              <fieldset key={group.id} className="min-w-0">
                <legend className="mb-1 text-title-small text-on-surface-variant">
                  {group.label}
                </legend>
                <div className="grid grid-cols-1 medium:grid-cols-2">
                  {group.choices.map((choice) => (
                    <Checkbox key={choice} name="components" value={choice}>
                      {choice}
                    </Checkbox>
                  ))}
                </div>
              </fieldset>
            ))}
          </fieldset>
          <TextField
            label="What component is missing?"
            name="missingComponent"
            multiline
            autoGrow
            maxRows={8}
            maxLength={MISSING_MAX_LENGTH}
          />
          <RadioGroup label="Team size" name="teamSize">
            {TEAM_SIZES.map(({ value, label }) => (
              <Radio key={value} value={value}>
                {label}
              </Radio>
            ))}
          </RadioGroup>
          {/* The trap: out of sight, out of the tab order and hidden from screen readers. */}
          <div aria-hidden="true" className="sr-only">
            <label>
              Website
              <input type="text" name="website" tabIndex={-1} autoComplete="off" />
            </label>
          </div>
          <div className="flex flex-col items-start gap-3">
            <Button type="submit" pending={pending} labels={{ pending: 'Sending' }}>
              Register interest
            </Button>
            <p className="text-body-medium text-on-surface-variant">
              We&apos;ll email you to confirm, then only about Windmorph Pro and its add-ons.
              Unsubscribe any time.{' '}
              <a href="/privacy" className={LINK}>
                Privacy
              </a>
            </p>
          </div>
        </form>
      )}
      <div role="status">
        {outcome.kind === 'sent' ? (
          <div
            key={attempt}
            ref={messageRef}
            tabIndex={-1}
            className="flex flex-col gap-2 rounded-corner-medium bg-secondary-container p-4 text-on-secondary-container outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
          >
            <p className="text-title-medium">{MESSAGES.sentTitle}</p>
            <p className="text-body-medium">{MESSAGES.sent(outcome.email)}</p>
          </div>
        ) : message ? (
          <div
            key={attempt}
            ref={messageRef}
            tabIndex={-1}
            className="mt-6 rounded-sm text-body-medium text-error outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
          >
            {message}
          </div>
        ) : emailError ? (
          <div key={attempt} className="sr-only">
            {emailError}
          </div>
        ) : null}
      </div>
      {outcome.kind === 'failed' && (
        <Button
          variant="outlined"
          pending={pending}
          className="mt-3 self-start"
          onPress={() => formRef.current?.requestSubmit()}
        >
          Try again
        </Button>
      )}
    </div>
  );
}
