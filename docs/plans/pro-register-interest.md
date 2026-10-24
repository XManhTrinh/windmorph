# Plan: register interest in Windmorph Pro (docs site)

Status: **approved 2026-10-18.**

## Goal

At launch the core (`@windmorph/react`) is free under MIT and Windmorph Pro isn't on sale. `/pro` keeps documenting Pro in full and invites people to register interest: an email address, which Pro components they'd use, what's missing and their team size. No prices are shown; they're decided later, with the list told first. The answers decide what Pro builds and polishes next.

Pro won't be the only paid product (add-on kits are planned), so the list, the consent and the form are shared by every paid product from the start.

## The `/pro` page, top to bottom

1. **Header.** "Windmorph Pro" and the lead, reworded: Pro will be a paid set of components on top of the free core and isn't on sale yet. A filled `Button` "Register interest" links to `#register`.
2. **What's included.** The components by group, from the catalog, unchanged. "Add-on kits are planned." is removed.
3. **Register interest** (`#register`, replaces "Licence"). Two sentences: we'll email you when Pro opens, and your answers decide what we build next. Then the form, the consent line, and "Rather ask in public? Request a component in GitHub Discussions" (the core repo's "Component requests" category, where requests can be upvoted).
4. **Using Pro** (was Install, Add the stylesheet and Use it). The token and `.npmrc` steps go, since delivery isn't decided and placeholder steps would mislead. What stays: Pro installs beside the core at the same minor version, the stylesheet order (Tailwind and compiled) and the usage snippet, so people can judge the integration.
5. **Components for your docs.** Unchanged (`CodeBlock`, `PropsTable`, live sample).
6. **Questions** (the Pro `Accordion`), reworded or new:
   - *Can I buy Pro today?* Not yet. Register interest and you'll hear first.
   - *How much will it cost?* Not decided. People on the list hear before anyone else.
   - *What happens to my email?* A confirmation email, then only news about Windmorph Pro and its add-ons. Unsubscribe from any email. Link to `/privacy`.
   - *Can I ask for a component?* The form's "missing" box, or GitHub Discussions.
   - Kept: Tailwind, core version, Tiptap, theming.

## The form

One site component, `RegisterInterestForm`, takes the product (`interest`) and the choices to tick, so a later add-on page reuses it with its own list.

| Field | Component | Rules |
|---|---|---|
| Email | core `TextField`, `type="email"`, `autoComplete="email"` | Required; checked in the browser before sending |
| Which Pro components would you use? | core `Checkbox` per catalog page, in a `fieldset` per catalog group (one column on compact, two from medium) | Optional |
| What component is missing? | core `TextField` `multiline` `autoGrow` | Optional, 500 characters, with a counter |
| Team size | core `RadioGroup`: Just me / 2–10 / 11 or more | Optional |
| Trap | a visually hidden text input people never reach (`tabIndex={-1}`, `aria-hidden`, `autoComplete="off"`) | When filled, the form shows success and sends nothing |

- **Submit:** core `Button` "Register interest" with its `pending` state while sending; Enter in the email field submits.
- **Sending:** `fetch` POST, `application/x-www-form-urlencoded`, to the email provider's public form endpoint, `https://app.loops.so/api/newsletter-form/<NEXT_PUBLIC_LOOPS_FORM_ID>`. Fields: `email`, `interest` (`pro`), `components` (the ticked names, comma-separated), `missingComponent`, `teamSize` (`1`, `2-10`, `11+`), `source` (`pro-page`) and `mailingLists` (`NEXT_PUBLIC_LOOPS_LIST_ID`). Both IDs are public and read at build time. A build without them (local, previews, CI) shows the form with a note that sign-up isn't set up in this build, and sends nothing.
- **Outcomes,** each announced in a live region that mounts with the form, with focus moved to the message (`preventScroll`):
  - success: the form is replaced by "Thanks for registering your interest", saying a new address gets a link to confirm it and one already on the list stays on it (2026-10-24: the provider mails a confirmation to new contacts only, and its form endpoint updates nothing but `userGroup` on an existing contact, so a returning person's new answers aren't stored; a refusal saying the address is already listed counts as success too);
  - an email the provider rejects (a reply blaming the address, "Invalid email", not any that mentions email): the email field's error text, read by the field as focus moves to it, and said in the status region only when focus was already on the field;
  - HTTP 429: "Too many tries. Wait a minute and try again.";
  - a network or other error: an error message with Try again, keeping everything typed.
- **Consent line** under the button: "We'll email you to confirm, then only about Windmorph Pro and its add-ons. Unsubscribe any time." with a Privacy link.
- **No cookies, no tracking,** nothing stored in the browser.

## Also in this change

- **`/privacy`** (new, short; linked from the form, the FAQ and the footer): who is responsible for the data and how to reach them (one constant, easy to change), what's collected (the email and the form's answers) and why (news about Windmorph Pro and its add-ons, and planning them), the email provider as processor (Loops, in the US, under its data-protection agreement), how long it's kept (deleted within 30 days of unsubscribing or a request, a year after the last product launch email at the latest, and 30 days after the form for an address never confirmed; 2026-10-24), the IP address and browser details the provider receives with the form, the US transfer's safeguard, a "Last updated" date, your rights (access, correction, deletion, complaint to a data-protection authority) via `hello@windmorph.dev`, the host's access logs, and no analytics or cookies.
- **Footer:** adds "Sponsor" (GitHub Sponsors) and "Privacy".
- **Repo:** `.github/FUNDING.yml` (`github: XManhTrinh`), so GitHub shows the Sponsor button.
- **Search index, `llms.txt` and the Markdown pages** regenerate from the pages as today.

## Checks

- Unit tests (Vitest + Testing Library, `fetch` mocked): the required email, the payload, success, a rejected email, 429, a network error with retry, the trap, the unconfigured build, focus and announcements; axe on each state.
- The site's suites: built-in strings, the link check (the Discussions and Sponsors links), axe on every page, phone width with no sideways scroll, forced colours, right to left, 200% text.
- Screenshots of `/pro` (light and dark, phone and desktop, each form state) and `/privacy` reviewed before the change reaches the release branch.
- `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm check:traces`.

## Before the form goes live (owner)

1. Loops: account, sending domain `mail.windmorph.dev` (DNS at Cloudflare), double opt-in, the list "Windmorph paid products" marked **Public** (a private list can't be subscribed through the form endpoint), text properties `interest`, `components`, `missingComponent`, `teamSize`; the form endpoint ID and list ID go into the host's environment.
2. GitHub Sponsors enrolment, and GitHub Discussions on the core repo with a "Component requests" category.
3. A DMARC record for `windmorph.dev` once Email Routing and Loops are both set up.
4. A test submission, new and repeated, to check the provider's replies for an invalid and an already-listed address against the form's patterns (`INVALID_ADDRESS`, `ALREADY_LISTED` in `register-interest-form.tsx`).
