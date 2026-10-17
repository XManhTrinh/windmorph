import { Alert } from '@windmorph/react-pro';

/**
 * Every tone. Tonal alerts take the tone's container; outlined ones sit on the surface
 * with a border, for quieter notices. Success and warning come from the theme.
 */
export function AlertTones() {
  return (
    <div className="flex w-full max-w-xl flex-col gap-3">
      <Alert tone="info" title="You're offline">
        Changes will sync when you&apos;re back.
      </Alert>
      <Alert tone="success" variant="outlined">
        Your profile was saved.
      </Alert>
      <Alert tone="warning" title="Payment pending">
        Your bank hasn&apos;t confirmed the payment yet.
      </Alert>
      <Alert tone="neutral" variant="outlined">
        New messages are kept for 30 days.
      </Alert>
    </div>
  );
}
