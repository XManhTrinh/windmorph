import { Alert } from '@windmorph/react-pro';

/**
 * Every severity. `info` is the default; `error` (in the first example) is read at once.
 * Tonal alerts take the severity's container; outlined ones sit on the surface with a border,
 * for quieter notices. Success and warning come from the theme.
 */
export function AlertSeverities() {
  return (
    <div className="flex w-full max-w-xl flex-col gap-3">
      <Alert title="You're offline">Changes will sync when you&apos;re back.</Alert>
      <Alert severity="success" variant="outlined">
        Your profile was saved.
      </Alert>
      <Alert severity="warning" title="Payment pending">
        Your bank hasn&apos;t confirmed the payment yet.
      </Alert>
      <Alert severity="neutral" variant="outlined">
        New messages are kept for 30 days.
      </Alert>
    </div>
  );
}
