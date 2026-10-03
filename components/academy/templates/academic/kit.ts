import type { FormKit } from "@/components/academy/shared/forms";

/*
 * ACADEMIC palette: paper background, ink text, the academy accent (navy by
 * default) for structure, and a fixed burgundy for rules and small labels.
 */
export const ink = "text-[#1b2333]";
export const rule = "text-[#7a2232]";
export const container = "mx-auto w-full max-w-[1180px] px-5 sm:px-8";
export const serif = "font-serif";

export const btn = {
  primary:
    "inline-flex h-12 items-center justify-center gap-2 bg-(--accent) px-7 text-[0.9375rem] font-bold text-(--accent-fg) transition hover:bg-(--accent-strong) disabled:opacity-60",
  outline:
    "inline-flex h-12 items-center justify-center gap-2 border border-(--accent) px-7 text-[0.9375rem] font-bold text-(--accent) transition hover:bg-(--accent) hover:text-(--accent-fg)",
  text: "inline-flex items-center gap-1.5 text-sm font-bold text-[#7a2232] underline-offset-4 hover:underline",
};

export const formKit: FormKit = {
  form: "flex flex-col gap-5",
  field: "flex flex-col gap-1.5",
  label: "text-sm font-bold text-[#1b2333]",
  input:
    "h-12 w-full border border-[#1b2333]/25 bg-white px-4 text-[0.9375rem] text-[#1b2333] outline-none transition placeholder:text-[#1b2333]/35 focus:border-(--accent) focus:shadow-[inset_0_-2px_0_var(--accent)] aria-invalid:border-[#7a2232]",
  hint: "text-xs text-[#1b2333]/55",
  error: "text-xs font-semibold text-[#7a2232]",
  button: `${btn.primary} mt-1 w-full`,
  link: "text-sm font-bold text-[#7a2232] underline-offset-4 hover:underline",
  alertSuccess: "flex gap-2 border-s-4 border-emerald-700 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-900",
  alertError: "flex gap-2 border-s-4 border-[#7a2232] bg-[#7a2232]/5 px-4 py-3 text-sm leading-6 text-[#7a2232]",
  muted: "text-xs leading-6 text-[#1b2333]/55",
};
