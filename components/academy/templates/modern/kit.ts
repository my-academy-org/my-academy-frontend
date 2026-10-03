import type { FormKit } from "@/components/academy/shared/forms";

export const container = "mx-auto w-full max-w-6xl px-5 sm:px-8";

export const btn = {
  primary:
    "inline-flex h-12 items-center justify-center gap-2 rounded-full bg-(--accent) px-6 text-[0.9375rem] font-bold text-(--accent-fg) shadow-[0_8px_20px_-8px_var(--accent)] transition hover:bg-(--accent-strong) active:translate-y-px disabled:opacity-60",
  secondary:
    "inline-flex h-12 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-6 text-[0.9375rem] font-bold text-slate-900 transition hover:border-slate-300 hover:bg-slate-50",
  ghost: "inline-flex h-10 items-center rounded-full px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-100",
  small:
    "inline-flex h-10 items-center justify-center gap-2 rounded-full bg-(--accent) px-5 text-sm font-bold text-(--accent-fg) transition hover:bg-(--accent-strong)",
};

export const formKit: FormKit = {
  form: "flex flex-col gap-5",
  field: "flex flex-col gap-2",
  label: "text-sm font-bold text-slate-800",
  input:
    "h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-[0.9375rem] text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-(--accent) focus:ring-4 focus:ring-(--accent-muted) aria-invalid:border-red-400",
  hint: "text-xs text-slate-500",
  error: "text-xs font-semibold text-red-600",
  button: `${btn.primary} mt-1 w-full`,
  link: "text-sm font-bold text-(--accent) hover:underline",
  alertSuccess: "flex gap-2 rounded-2xl bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-800",
  alertError: "flex gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm leading-6 text-red-700",
  muted: "text-xs leading-6 text-slate-500",
};
