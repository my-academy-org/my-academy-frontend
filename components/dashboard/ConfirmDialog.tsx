"use client";

import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Field, Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/cn";

export type ConfirmOptions = {
  title: string;
  description: ReactNode;
  confirmLabel: string;
  tone?: "danger" | "default";
  /** Consequences listed under the description. */
  points?: string[];
  /** Requires typing this exact value before the action is enabled (for irreversible actions). */
  confirmText?: string;
  onConfirm: () => void;
};

/**
 * Confirmation for state-changing actions. Danger actions are visually distinct
 * and can require typing a value (e.g. the academy subdomain) to proceed.
 */
export function ConfirmDialog({
  open,
  version = 0,
  options,
  onClose,
}: {
  open: boolean;
  /** Bump to reset the dialog state when it is reopened. */
  version?: number;
  options: ConfirmOptions | null;
  onClose: () => void;
}) {
  return (
    <Modal open={open} onClose={onClose} size="sm" title={options?.title ?? ""}>
      {options && <ConfirmBody key={version} options={options} onClose={onClose} />}
    </Modal>
  );
}

function ConfirmBody({ options, onClose }: { options: ConfirmOptions; onClose: () => void }) {
  const [typed, setTyped] = useState("");
  const danger = options.tone === "danger";
  const blocked = !!options.confirmText && typed.trim() !== options.confirmText;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (blocked) return;
        options.onConfirm();
        onClose();
      }}
    >
      <div className="flex gap-4">
        <span
          className={cn(
            "grid size-10 shrink-0 place-items-center rounded-full",
            danger ? "bg-red-50 text-red-600 ring-1 ring-red-100" : "bg-gold-50 text-gold-600 ring-1 ring-gold-100",
          )}
        >
          <Icon name="alert" className="size-5" />
        </span>
        <div className="min-w-0 text-[0.9375rem] leading-7 text-ink-600">
          {options.description}
          {options.points && (
            <ul className="mt-3 space-y-1.5 text-sm">
              {options.points.map((p) => (
                <li key={p} className="flex gap-2">
                  <span className="mt-2.5 size-1 shrink-0 rounded-full bg-ink-400" aria-hidden="true" />
                  {p}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {options.confirmText && (
        <Field
          className="mt-5"
          htmlFor="confirm-text"
          label="للتأكيد، اكتب"
          hint={
            <>
              اكتب <span dir="ltr" className="font-mono font-semibold text-ink-800">{options.confirmText}</span> كما هو.
            </>
          }
        >
          <Input
            id="confirm-text"
            dir="ltr"
            autoComplete="off"
            spellCheck={false}
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder={options.confirmText}
            className="text-start font-mono"
          />
        </Field>
      )}

      <div className="-mx-5 mt-6 -mb-5 flex flex-col-reverse gap-2 border-t border-line bg-canvas px-5 py-4 sm:-mx-7 sm:-mb-6 sm:flex-row sm:justify-end sm:px-7">
        <Button variant="ghost" onClick={onClose}>
          إلغاء
        </Button>
        <Button
          type="submit"
          disabled={blocked}
          className={danger ? "bg-red-600 shadow-none hover:bg-red-700" : undefined}
        >
          {options.confirmLabel}
        </Button>
      </div>
    </form>
  );
}

/** Small hook so pages can open a confirmation with one call. */
export function useConfirm() {
  // Options outlive `open` so the content stays put during the closing transition.
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [open, setOpen] = useState(false);
  const [version, setVersion] = useState(0);
  return {
    confirm: (next: ConfirmOptions) => {
      setOptions(next);
      setVersion((v) => v + 1);
      setOpen(true);
    },
    dialog: <ConfirmDialog open={open} version={version} options={options} onClose={() => setOpen(false)} />,
  };
}
