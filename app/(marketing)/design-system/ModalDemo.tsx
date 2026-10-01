"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

export function ModalDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        فتح نافذة منبثقة
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        size="sm"
        title="عنوان النافذة"
        description="وصف مختصر يوضّح الغرض من النافذة."
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>إلغاء</Button>
            <Button onClick={() => setOpen(false)}>تأكيد</Button>
          </>
        }
      >
        <p className="leading-7 text-ink-600">محتوى النافذة. تُغلق بزر الإغلاق أو مفتاح Escape أو النقر خارجها.</p>
      </Modal>
    </>
  );
}
