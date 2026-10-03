import type { FormKit } from "@/components/academy/shared/forms";

export const container = "mx-auto w-full max-w-[1240px] px-5 sm:px-8 lg:px-10";
/** Display face for headings (El Messiri, loaded by the academy layout). */
export const display = "font-[family-name:var(--font-messiri)]";

export const btn = {
  primary:
    "inline-flex h-12 items-center justify-center gap-2 rounded-full bg-(--accent) px-8 text-[0.9375rem] font-bold text-(--accent-fg) transition hover:bg-(--accent-strong) disabled:opacity-60",
  outline:
    "inline-flex h-12 items-center justify-center gap-2 rounded-full border border-(--accent)/60 px-8 text-[0.9375rem] font-bold text-(--accent) transition hover:border-(--accent) hover:bg-(--accent)/10",
  ghost: "inline-flex items-center gap-2 text-[0.9375rem] font-bold text-white/75 transition hover:text-white",
};

export const formKit: FormKit = {
  form: "flex flex-col gap-5",
  field: "flex flex-col gap-2",
  label: "text-sm font-semibold text-white/70",
  input:
    "h-12 w-full rounded-xl border border-white/12 bg-white/[0.04] px-4 text-[0.9375rem] text-white outline-none transition placeholder:text-white/30 hover:border-white/25 focus:border-(--accent) focus:bg-white/[0.06] aria-invalid:border-red-400/70",
  hint: "text-xs text-white/40",
  error: "text-xs font-semibold text-red-300",
  button: `${btn.primary} mt-2 w-full`,
  link: "text-sm font-bold text-(--accent) hover:underline",
  alertSuccess: "flex gap-2 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm leading-6 text-emerald-200",
  alertError: "flex gap-2 rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm leading-6 text-red-200",
  muted: "text-xs leading-6 text-white/45",
};
