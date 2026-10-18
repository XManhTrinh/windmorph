import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { axeViolations } from '../test/axe';
import {
  RegisterInterestForm,
  signUpBody,
  type RegisterInterestGroup,
} from './register-interest-form';

const GROUPS: RegisterInterestGroup[] = [
  { id: 'feedback', label: 'Feedback', choices: ['Alert', 'Skeleton'] },
  { id: 'forms', label: 'Forms', choices: ['PIN input', 'Phone field'] },
];

const ENDPOINT = 'https://app.loops.so/api/newsletter-form/form-123';

const fetchMock = vi.fn<typeof fetch>();

function reply(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function renderForm() {
  const user = userEvent.setup();
  const view = render(
    <RegisterInterestForm
      interest="pro"
      source="pro-page"
      choicesLabel="Which Pro components would you use?"
      groups={GROUPS}
    />,
  );
  return { user, view };
}

const emailField = () => screen.getByRole('textbox', { name: /Email/ });
const submit = () => screen.getByRole('button', { name: /^Register interest/ });
const status = () => screen.getByRole('status');

/** The body of the one request sent, as fields. */
function sentFields(): Record<string, string> {
  expect(fetchMock).toHaveBeenCalledTimes(1);
  const [url, init] = fetchMock.mock.calls[0]!;
  expect(url).toBe(ENDPOINT);
  expect(init?.method).toBe('POST');
  expect(new Headers(init?.headers).get('Content-Type')).toBe('application/x-www-form-urlencoded');
  return Object.fromEntries(new URLSearchParams(String(init?.body)));
}

beforeEach(() => {
  vi.stubEnv('NEXT_PUBLIC_LOOPS_FORM_ID', 'form-123');
  vi.stubEnv('NEXT_PUBLIC_LOOPS_LIST_ID', 'list-456');
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('RegisterInterestForm', () => {
  it('shows every field, with the status region mounted before any message', async () => {
    renderForm();
    expect(emailField()).toHaveAttribute('type', 'email');
    expect(emailField()).toHaveAttribute('autocomplete', 'email');
    expect(
      screen.getByRole('group', { name: 'Which Pro components would you use?' }),
    ).toBeVisible();
    expect(screen.getByRole('group', { name: 'Feedback' })).toBeVisible();
    expect(screen.getByRole('checkbox', { name: 'PIN input' })).toBeVisible();
    expect(screen.getByRole('textbox', { name: 'What component is missing?' })).toHaveAttribute(
      'maxlength',
      '500',
    );
    expect(screen.getByRole('radiogroup', { name: 'Team size' })).toBeVisible();
    expect(screen.getByRole('link', { name: 'Privacy' })).toHaveAttribute('href', '/privacy');
    expect(status()).toBeEmptyDOMElement();
    expect(screen.queryByText(/isn't set up in this build/)).toBeNull();
    expect(await axeViolations(document.body)).toEqual([]);
  });

  it('asks for an email, then a valid one, before sending', async () => {
    const { user } = renderForm();
    await user.click(submit());
    expect(emailField()).toHaveFocus();
    expect(emailField()).toHaveAttribute('aria-invalid', 'true');
    expect(emailField()).toHaveAccessibleDescription(/Enter your email address\./);
    expect(status()).toHaveTextContent('Enter your email address.');
    expect(await axeViolations(document.body)).toEqual([]);

    await user.type(emailField(), 'not-an-address');
    expect(emailField()).not.toHaveAttribute('aria-invalid');
    await user.keyboard('{Enter}');
    expect(emailField()).toHaveAccessibleDescription(/like name@example\.com/);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('sends the answers urlencoded, leaving out the empty ones', async () => {
    fetchMock.mockResolvedValue(reply(200, { success: true }));
    const { user } = renderForm();
    await user.type(emailField(), ' ada@example.com ');
    await user.click(submit());
    await screen.findByText(/Check your inbox/);
    expect(sentFields()).toEqual({
      email: 'ada@example.com',
      interest: 'pro',
      source: 'pro-page',
      mailingLists: 'list-456',
    });
  });

  it('sends every answer it has', async () => {
    fetchMock.mockResolvedValue(reply(200, { success: true }));
    const { user } = renderForm();
    await user.type(emailField(), 'ada@example.com');
    await user.click(screen.getByRole('checkbox', { name: 'Alert' }));
    await user.click(screen.getByRole('checkbox', { name: 'Phone field' }));
    await user.type(
      screen.getByRole('textbox', { name: 'What component is missing?' }),
      'A data table, sortable',
    );
    await user.click(screen.getByRole('radio', { name: '2–10' }));
    await user.click(submit());
    await screen.findByText(/Check your inbox/);
    expect(sentFields()).toEqual({
      email: 'ada@example.com',
      interest: 'pro',
      components: 'Alert,Phone field',
      missingComponent: 'A data table, sortable',
      teamSize: '2-10',
      source: 'pro-page',
      mailingLists: 'list-456',
    });
  });

  it('builds the body in a stable order', () => {
    expect(
      signUpBody({
        email: 'a@example.com',
        interest: 'pro',
        components: ['Tag'],
        missingComponent: '',
        teamSize: '11+',
        source: 'pro-page',
        listId: 'list',
      }).toString(),
    ).toBe(
      'email=a%40example.com&interest=pro&components=Tag&teamSize=11%2B&source=pro-page&mailingLists=list',
    );
  });

  it('is pending while sending, then replaces the form with a focused confirmation', async () => {
    let resolve: (response: Response) => void = () => {};
    fetchMock.mockReturnValue(new Promise((done) => (resolve = done)));
    const { user } = renderForm();
    await user.type(emailField(), 'ada@example.com');
    await user.click(submit());
    expect(submit()).toHaveAttribute('aria-disabled', 'true');
    await user.click(submit());
    expect(fetchMock).toHaveBeenCalledTimes(1);

    await act(async () => resolve(reply(200, { success: true })));
    expect(screen.queryByRole('form')).toBeNull();
    const message = within(status()).getByText(
      /Check your inbox to confirm your address/,
    ).parentElement!;
    expect(message).toHaveFocus();
    expect(status()).toHaveTextContent("We've sent a link to ada@example.com.");
    expect(await axeViolations(document.body)).toEqual([]);
  });

  it('shows an address the provider refuses as the email field’s error', async () => {
    fetchMock.mockResolvedValue(reply(400, { success: false, message: 'Invalid email' }));
    const { user } = renderForm();
    await user.type(emailField(), 'ada@example.com');
    await user.click(submit());
    await waitFor(() => expect(emailField()).toHaveFocus());
    expect(emailField()).toHaveAccessibleDescription(/can't be used/);
    expect(status()).toHaveTextContent(/can't be used/);
    expect(emailField()).toHaveValue('ada@example.com');
    expect(await axeViolations(document.body)).toEqual([]);
  });

  it('asks to wait when rate limited', async () => {
    fetchMock.mockResolvedValue(new Response('', { status: 429 }));
    const { user } = renderForm();
    await user.type(emailField(), 'ada@example.com');
    await user.click(submit());
    const message = await within(status()).findByText(
      'Too many tries. Wait a minute and try again.',
    );
    expect(message).toHaveFocus();
    expect(screen.queryByRole('button', { name: 'Try again' })).toBeNull();
    expect(await axeViolations(document.body)).toEqual([]);
  });

  it('offers Try again after a network error, keeping everything typed', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch'));
    fetchMock.mockResolvedValueOnce(reply(200, { success: true }));
    const { user } = renderForm();
    await user.type(emailField(), 'ada@example.com');
    await user.click(screen.getByRole('checkbox', { name: 'Skeleton' }));
    await user.click(submit());
    const message = await within(status()).findByText(/couldn't be sent/);
    expect(message).toHaveFocus();
    expect(emailField()).toHaveValue('ada@example.com');
    expect(screen.getByRole('checkbox', { name: 'Skeleton' })).toBeChecked();
    expect(await axeViolations(document.body)).toEqual([]);

    await user.click(screen.getByRole('button', { name: 'Try again' }));
    await screen.findByText(/Check your inbox/);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const body = new URLSearchParams(String(fetchMock.mock.calls[1]![1]?.body));
    expect(body.get('components')).toBe('Skeleton');
  });

  it('treats any other refusal as a failure to retry', async () => {
    fetchMock.mockResolvedValue(reply(500, { success: false, message: 'Server error' }));
    const { user } = renderForm();
    await user.type(emailField(), 'ada@example.com');
    await user.click(submit());
    await within(status()).findByText(/couldn't be sent/);
    expect(screen.getByRole('button', { name: 'Try again' })).toBeVisible();
  });

  it('shows success and sends nothing when the trap is filled', async () => {
    const { user, view } = renderForm();
    const trap = view.container.querySelector<HTMLInputElement>('input[name="website"]')!;
    expect(trap).toHaveAttribute('tabindex', '-1');
    expect(trap.closest('[aria-hidden="true"]')).not.toBeNull();
    await user.type(trap, 'https://spam.example');
    await user.type(emailField(), 'bot@example.com');
    await user.click(submit());
    await screen.findByText(/Check your inbox/);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('says sign-up isn’t set up, and sends nothing, in a build without the IDs', async () => {
    vi.stubEnv('NEXT_PUBLIC_LOOPS_FORM_ID', '');
    const { user } = renderForm();
    expect(screen.getByText(/isn't set up in this build/)).toBeVisible();
    await user.type(emailField(), 'ada@example.com');
    await user.click(submit());
    const message = await within(status()).findByText(/Nothing was sent/);
    expect(message).toHaveFocus();
    expect(fetchMock).not.toHaveBeenCalled();
    expect(await axeViolations(document.body)).toEqual([]);
  });

  it('stores nothing in the browser', async () => {
    fetchMock.mockResolvedValue(reply(200, { success: true }));
    localStorage.clear();
    sessionStorage.clear();
    const cookies = document.cookie;
    const { user } = renderForm();
    await user.type(emailField(), 'ada@example.com');
    await user.click(submit());
    await screen.findByText(/Check your inbox/);
    expect(localStorage.length).toBe(0);
    expect(sessionStorage.length).toBe(0);
    expect(document.cookie).toBe(cookies);
  });
});
