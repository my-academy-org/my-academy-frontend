"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

type Tone = "success" | "error";
type Toast = { id: number; message: string; tone: Tone };
type Notify = (message: string, tone?: Tone) => void;

const ToastContext = createContext<Notify | null>(null);

/** Short confirmation messages after an action ("تم الحفظ"). */
export function useToast() {
  const notify = useContext(ToastContext);
  if (!notify) throw new Error("useToast must be used inside <ToastProvider>");
  return notify;
}

let nextId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const dismiss = useCallback((id: number) => setToasts((prev) => prev.filter((t) => t.id !== id)), []);

  const notify = useCallback<Notify>(
    (message, tone = "success") => {
      const id = ++nextId;
      setToasts((prev) => [...prev, { id, message, tone }]);
      setTimeout(() => dismiss(id), 4000);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={notify}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 bottom-4 z-[70] flex flex-col items-center gap-2 sm:inset-x-auto sm:start-6 sm:bottom-6 sm:items-start"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className="animate-fade-up pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-2xl bg-ink-950 py-3 ps-4 pe-2 text-sm text-white shadow-float [animation-duration:0.3s]"
          >
            <span
              className={cn(
                "grid size-6 shrink-0 place-items-center rounded-full",
                t.tone === "success" ? "bg-brand-500/25 text-brand-200" : "bg-red-500/25 text-red-200",
              )}
            >
              <Icon name={t.tone === "success" ? "check" : "alert"} className="size-3.5" strokeWidth={2.5} />
            </span>
            <p className="flex-1 leading-6">{t.message}</p>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              aria-label="إغلاق التنبيه"
              className="grid size-8 place-items-center rounded-lg text-white/50 transition-colors hover:bg-white/10 hover:text-white"
            >
              <Icon name="x" className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
