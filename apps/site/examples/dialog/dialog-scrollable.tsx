'use client';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@windmorph/react';
/**
 * A dialog with scrollable content: when the content is taller than the panel,
 * `DialogContent` scrolls on its own (`overflow-y-auto`) while the title and actions stay
 * pinned above and below. The demo caps the panel height with `max-h-[70vh]` (through
 * `classNames.panel`) so the long terms overflow and scroll on any screen,
 * keeping the title and actions in view instead of pushing them off screen.
 */
const SECTIONS = [
  {
    heading: '1. Acceptance of these terms',
    paragraphs: [
      'These terms govern your use of the service. Please read them carefully before continuing. By creating an account or otherwise using the service, you agree to be bound by them.',
      'If you are using the service on behalf of an organisation, you confirm that you have the authority to accept these terms for that organisation.',
    ],
  },
  {
    heading: '2. Your content',
    paragraphs: [
      'You retain ownership of the content you create. You grant us a licence to host, store and display it so the service can function.',
      'You are responsible for the content you submit and for making sure you have the rights to share it. We may remove content that breaches these terms.',
    ],
  },
  {
    heading: '3. Availability of the service',
    paragraphs: [
      'We provide the service as-is. We work to keep it available, but we cannot guarantee it will be uninterrupted or error-free.',
      'We may add, change or remove features over time. Where a change materially reduces the service, we will give you reasonable notice.',
    ],
  },
  {
    heading: '4. Acceptable use',
    paragraphs: [
      'You agree not to misuse the service, interfere with other people using it, or attempt to access it in ways other than the interface we provide.',
      'You must not use the service to break the law, infringe the rights of others, or distribute malware or unsolicited messages.',
    ],
  },
  {
    heading: '5. Changes to these terms',
    paragraphs: [
      'We may update these terms from time to time. When we do, we will tell you and give you a chance to review the changes before they take effect.',
      'If you continue to use the service after an update takes effect, you accept the revised terms.',
    ],
  },
  {
    heading: '6. Termination',
    paragraphs: [
      'Either of us may end this agreement at any time. Some sections, such as those about ownership and liability, survive termination.',
      'On termination your right to use the service stops, and we may delete your content after a reasonable retention period.',
    ],
  },
  {
    heading: '7. Liability',
    paragraphs: [
      'To the extent permitted by law, we are not liable for indirect or consequential loss arising from your use of the service.',
      'Nothing in these terms limits liability that cannot be limited under the law that applies to you.',
    ],
  },
  {
    heading: '8. General',
    paragraphs: [
      'If any part of these terms is found to be unenforceable, the rest stays in effect. These terms are the entire agreement between us about the service.',
      'A delay in enforcing these terms is not a waiver of our rights, and you may not transfer your rights under them without our consent.',
    ],
  },
];
export function DialogScrollable() {
  return (
    <DialogTrigger>
      <Button variant="tonal">Review terms</Button>
      <Dialog aria-label="Terms of service" classNames={{ panel: 'max-h-[70vh]' }}>
        {({ close }) => (
          <>
            <DialogTitle>Terms of service</DialogTitle>
            <DialogContent>
              <div className="flex flex-col gap-6">
                {SECTIONS.map((section) => (
                  <section key={section.heading} className="flex flex-col gap-2">
                    <h3 className="text-title-medium text-on-surface">{section.heading}</h3>
                    {section.paragraphs.map((text, index) => (
                      <p key={index}>{text}</p>
                    ))}
                  </section>
                ))}
              </div>
            </DialogContent>
            <DialogActions>
              <Button variant="text" onPress={close}>
                Decline
              </Button>
              <Button variant="text" onPress={close}>
                Accept
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </DialogTrigger>
  );
}
