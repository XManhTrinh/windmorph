import { Link } from '@windmorph/react-pro';

/**
 * Standalone links sit on their own line or in a list: no underline until hovered, pressed
 * or focused, in a label type role. On a coloured container, `color="inherit"` keeps the
 * container's readable text colour.
 */
export function LinkStandalone() {
  return (
    <div className="flex flex-col items-start gap-4">
      <Link variant="standalone" size="lg" href="#demo-forgot">
        Forgot password?
      </Link>
      <nav aria-label="Legal" className="flex flex-col items-start gap-2">
        <Link variant="standalone" size="md" href="#demo-terms">
          Terms of service
        </Link>
        <Link variant="standalone" size="md" href="#demo-privacy">
          Privacy policy
        </Link>
      </nav>
      <p className="rounded-corner-medium bg-primary-container p-4 text-body-medium text-on-primary-container">
        Need a hand?{' '}
        <Link color="inherit" href="#demo-help">
          Get help
        </Link>
      </p>
    </div>
  );
}
