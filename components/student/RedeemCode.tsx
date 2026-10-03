"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Field, Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { academyRoutes } from "@/lib/academy/nav";
import { useStudent } from "./StudentStore";

/** "Activate a course" — the student enters the enrollment code the teacher gave them. */
export function RedeemCodeButton({ variant = "secondary", label = "تفعيل دورة بكود" }: { variant?: "primary" | "secondary"; label?: string }) {
  const [state, setState] = useState({ open: false, version: 0 });
  return (
    <>
      <Button variant={variant} onClick={() => setState((s) => ({ open: true, version: s.version + 1 }))}>
        <Icon name="ticket" className="size-4" />
        {label}
      </Button>
      <RedeemDialog key={state.version} open={state.open} onClose={() => setState((s) => ({ ...s, open: false }))} />
    </>
  );
}

function RedeemDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const { redeemCode, notify } = useStudent();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string>();

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      title="تفعيل دورة"
      description="أدخل كود التسجيل الذي حصلت عليه من معلّمك."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>إلغاء</Button>
          <Button type="submit" form="redeem-form">تفعيل</Button>
        </>
      }
    >
      <form
        id="redeem-form"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          const result = redeemCode(code);
          if ("error" in result) return setError(result.error);
          notify(`تم تفعيل «${result.course.title}» — بالتوفيق!`);
          onClose();
          const first = result.course.lessons[0];
          if (first) router.push(academyRoutes.student.lesson(result.course.id, first.id));
        }}
      >
        <Field label="كود التسجيل" htmlFor="redeem-code" error={error} hint="يتكوّن من 3 أجزاء، مثل ABC-1234-WXYZ. كل كود صالح لمرة واحدة.">
          <Input
            id="redeem-code"
            dir="ltr"
            autoComplete="off"
            spellCheck={false}
            autoCapitalize="characters"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              setError(undefined);
            }}
            placeholder="ABC-1234-WXYZ"
            className="text-center font-mono text-lg tracking-widest"
            aria-invalid={!!error}
            autoFocus
          />
        </Field>
      </form>
    </Modal>
  );
}
