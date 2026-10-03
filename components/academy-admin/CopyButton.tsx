"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Clipboard API is unavailable on insecure origins; fall back to a hidden textarea.
    const area = document.createElement("textarea");
    area.value = text;
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.append(area);
    area.select();
    const ok = document.execCommand("copy");
    area.remove();
    return ok;
  }
}

export function CopyButton({ text, label, className }: { text: string; label: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      aria-label={copied ? "تم النسخ" : label}
      title={copied ? "تم النسخ" : label}
      onClick={async () => {
        if (await copyText(text)) {
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }
      }}
      className={cn(
        "grid size-8 place-items-center rounded-lg transition-colors",
        copied ? "text-brand-600" : "text-ink-400 hover:bg-muted hover:text-ink-900",
        className,
      )}
    >
      <Icon name={copied ? "check" : "copy"} className="size-4" strokeWidth={copied ? 2.5 : 1.75} />
    </button>
  );
}
