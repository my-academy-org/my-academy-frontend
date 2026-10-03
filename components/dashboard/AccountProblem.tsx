import { LogoMark } from "@/components/ui/Logo";
import { SignOutButton } from "./SignOutButton";

/** Shown to a signed-in user whose account can't open its dashboard (no or suspended academy). */
export function AccountProblem({ title, text }: { title: string; text: string }) {
  return (
    <main className="grid min-h-dvh place-items-center bg-canvas px-6 text-center">
      <div className="max-w-md">
        <LogoMark className="mx-auto size-12" />
        <h1 className="mt-8 text-2xl font-extrabold text-ink-950">{title}</h1>
        <p className="mt-3 leading-8 text-ink-600">{text}</p>
        <SignOutButton className="mt-8 inline-flex h-11 items-center rounded-xl border border-line-strong bg-white px-5 font-semibold text-ink-900 shadow-card hover:bg-canvas">
          تسجيل الخروج
        </SignOutButton>
      </div>
    </main>
  );
}
