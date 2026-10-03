import type { ReactNode } from "react";

/** Posts to /logout, which clears the session cookie and returns to /login. */
export function SignOutButton({ className, label, children }: { className?: string; label?: string; children: ReactNode }) {
  return (
    <form action="/logout" method="post" className="contents">
      <button type="submit" aria-label={label} className={className}>
        {children}
      </button>
    </form>
  );
}
