import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { guideMetadata } from '../../../lib/site-metadata';
import { DATA_CONTROLLER } from './data-controller';

export const metadata: Metadata = guideMetadata('/privacy');

const LINK =
  'rounded-sm text-primary underline underline-offset-2 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary';
const TEXT = 'text-body-large text-on-surface-variant';
const LIST = `flex flex-col gap-2 ps-5 ${TEXT} [&>li]:list-disc`;

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 id={id} className="text-headline-small text-on-surface">
        {title}
      </h2>
      {children}
    </section>
  );
}

/** When this notice last changed, as shown at its top (ISO date). */
const LAST_UPDATED = '2026-10-24';

const EMAIL_LINK = (
  <a href={`mailto:${DATA_CONTROLLER.email}`} className={LINK}>
    {DATA_CONTROLLER.email}
  </a>
);

/**
 * The privacy notice: what the register-interest form collects, why, who processes it, how
 * long it's kept and the reader's rights, plus what the host logs. Plain English and short;
 * the controller's name and contact are one constant, {@link DATA_CONTROLLER}.
 */
export default function PrivacyPage() {
  return (
    <article className="mx-auto flex max-w-3xl flex-col gap-10">
      <header className="flex flex-col gap-3">
        <h1 className="text-headline-large text-on-surface">Privacy</h1>
        <p className={TEXT}>
          This site documents Windmorph. The only personal data it asks for is in the form to
          register interest in Windmorph Pro. This page says what that form collects and what
          happens to it.
        </p>
        <p className="text-body-medium text-on-surface-variant">
          Last updated: <time dateTime={LAST_UPDATED}>24 October 2026</time>
        </p>
      </header>

      <Section id="who" title="Who is responsible">
        <p className={TEXT}>
          {DATA_CONTROLLER.name}, {DATA_CONTROLLER.description}, is responsible for your data. Write
          to {EMAIL_LINK} with any question or request about it.
        </p>
      </Section>

      <Section id="what" title="What we collect and why">
        <ul className={LIST}>
          <li>Your email address, to send you news about Windmorph Pro and its add-ons.</li>
          <li>
            Your answers to the form (the components you&apos;d use, what&apos;s missing and your
            team size), to decide what to build next.
          </li>
          <li>Which product and page the form was on, to tell the answers apart.</li>
          <li>
            Your IP address and browser details (its user agent and the page you sent the form
            from), which your browser sends to Loops with the form, to deliver it and to limit
            abuse, such as too many sign-ups from one address.
          </li>
        </ul>
        <p className={TEXT}>
          A new address gets one email to confirm it; nothing else is sent until you do. Every email
          has a link to unsubscribe. We rely on your consent, which you can withdraw at any time.
        </p>
      </Section>

      <Section id="processor" title="Who processes it">
        <p className={TEXT}>
          Your browser sends the form straight to Loops (loops.so), the email service that keeps the
          list and sends the emails, and processes the data for us under its data-processing
          agreement. Loops is in the United States, so your data is transferred there, under the
          safeguards that agreement provides: the standard contractual clauses (with the UK&apos;s
          addendum to them for data from the UK) or, while Loops is certified, the EU–US Data
          Privacy Framework and its UK Extension. We don&apos;t sell or share your data with anyone
          else.
        </p>
      </Section>

      <Section id="retention" title="How long we keep it">
        <p className={TEXT}>
          We delete your address and answers within 30 days of you unsubscribing or asking us to,
          and one year after the last email about a product launch at the latest. An address that is
          never confirmed is deleted 30 days after the form was sent.
        </p>
      </Section>

      <Section id="rights" title="Your rights">
        <p className={TEXT}>
          You can ask to see the data we hold about you, correct it, delete it or object to how we
          use it: write to {EMAIL_LINK}. You can also complain to a data-protection authority: the
          Information Commissioner&apos;s Office (ICO) in the United Kingdom, or the authority where
          you live in the EU.
        </p>
      </Section>

      <Section id="site" title="The rest of the site">
        <p className={TEXT}>
          The site&apos;s hosting provider keeps access logs (such as IP addresses and the pages
          requested) to run and secure the site. The site has no analytics and no tracking cookies.
          It remembers the display settings you change (theme, mode, text direction, package
          manager) and your recent searches, in a cookie and your browser&apos;s storage, read only
          by the pages in your browser. Nothing is stored until you change a setting or search. The
          form stores nothing in your browser.
        </p>
      </Section>
    </article>
  );
}
