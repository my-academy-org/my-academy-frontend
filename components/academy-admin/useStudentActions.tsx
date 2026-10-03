"use client";

import { useConfirm } from "@/components/dashboard/ConfirmDialog";
import type { DashStudent } from "@/lib/academy-admin/types";
import { useAcademy } from "./AcademyStore";

export function useStudentActions() {
  const { setStudentStatus, notify } = useAcademy();
  const { confirm, dialog } = useConfirm();

  const toggleStatus = (s: DashStudent) =>
    s.status === "ACTIVE"
      ? confirm({
          title: "إيقاف حساب الطالب",
          description: (
            <>
              لن يتمكّن <b className="text-ink-900">{s.name}</b> من الدخول إلى الأكاديمية أو مشاهدة الدروس.
            </>
          ),
          points: ["يبقى تقدّمه ونتائجه محفوظة.", "يمكنك إعادة تفعيل الحساب في أي وقت."],
          confirmLabel: "إيقاف الحساب",
          tone: "danger",
          onConfirm: () => {
            setStudentStatus(s.id, "SUSPENDED");
            notify(`تم إيقاف حساب ${s.name}`);
          },
        })
      : confirm({
          title: "تفعيل حساب الطالب",
          description: (
            <>
              سيستعيد <b className="text-ink-900">{s.name}</b> الوصول إلى دوراته المسجّل بها.
            </>
          ),
          confirmLabel: "تفعيل الحساب",
          onConfirm: () => {
            setStudentStatus(s.id, "ACTIVE");
            notify(`تم تفعيل حساب ${s.name}`);
          },
        });

  return { toggleStatus, dialog };
}
