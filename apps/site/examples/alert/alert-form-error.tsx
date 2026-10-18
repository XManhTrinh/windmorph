import { Button } from '@windmorph/react';
import { Alert } from '@windmorph/react-pro';

/**
 * A form's error above its fields: read at once (`role="alert"`), and it can take focus
 * after a failed submit. Text buttons in a tonal alert take its own readable colour.
 */
export function AlertFormError() {
  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <Alert severity="error" actions={<Button variant="text">Reset password</Button>}>
        That email and password don&apos;t match. Try again or reset your password.
      </Alert>
    </div>
  );
}
