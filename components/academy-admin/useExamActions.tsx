"use client";

import { useConfirm } from "@/components/dashboard/ConfirmDialog";
import type { MenuItem } from "@/components/dashboard/RowMenu";
import { dash, formatQuestions, stateOf } from "@/lib/academy-admin/meta";
import type { Exam } from "@/lib/academy-admin/types";
import { formatDateTime } from "@/lib/format";
import { useAcademy } from "./AcademyStore";

export function useExamActions({ onDeleted }: { onDeleted?: () => void } = {}) {
  const { setExamStatus, deleteExam, submissionsOf, courseById, notify } = useAcademy();
  const { confirm, dialog } = useConfirm();

  const publish = (e: Exam) => {
    if (e.questions.length === 0) return notify("أضف سؤالاً واحداً على الأقل قبل النشر", "error");
    confirm({
      title: "نشر الاختبار",
      description: (
        <>
          سيظهر <b className="text-ink-900">{e.title}</b> لطلاب «{courseById(e.courseId)?.title}».
        </>
      ),
      points: [
        `${formatQuestions(e.questions.length)} · ${e.durationMinutes} دقيقة.`,
        e.opensAt ? `يبدأ في ${formatDateTime(e.opensAt)}.` : "يصبح متاحاً فوراً.",
      ],
      confirmLabel: "نشر الاختبار",
      onConfirm: () => {
        setExamStatus(e.id, "PUBLISHED");
        notify(`تم نشر «${e.title}»`);
      },
    });
  };

  const close = (e: Exam) =>
    confirm({
      title: "إغلاق الاختبار",
      description: "لن يستطيع الطلاب بدء الاختبار بعد الآن. تبقى النتائج الحالية محفوظة.",
      confirmLabel: "إغلاق الاختبار",
      onConfirm: () => {
        setExamStatus(e.id, "CLOSED");
        notify(`تم إغلاق «${e.title}»`);
      },
    });

  const reopen = (e: Exam) => {
    setExamStatus(e.id, "PUBLISHED");
    notify(`أُعيد فتح «${e.title}»`);
  };

  const unpublish = (e: Exam) =>
    confirm({
      title: "إعادة الاختبار إلى مسودة",
      description: "سيختفي الاختبار من حسابات الطلاب حتى تنشره مجدداً.",
      confirmLabel: "إلغاء النشر",
      onConfirm: () => {
        setExamStatus(e.id, "DRAFT");
        notify(`أصبح «${e.title}» مسودة`);
      },
    });

  const remove = (e: Exam) => {
    const count = submissionsOf(e.id).length;
    confirm({
      title: "حذف الاختبار",
      description: (
        <>
          سيتم حذف <b className="text-ink-900">{e.title}</b> وأسئلته نهائياً.
        </>
      ),
      points: count ? [`${count} محاولة طلاب ونتائجها ستُحذف.`] : undefined,
      confirmText: count ? "حذف" : undefined,
      confirmLabel: "حذف الاختبار",
      tone: "danger",
      onConfirm: () => {
        deleteExam(e.id);
        notify("تم حذف الاختبار");
        onDeleted?.();
      },
    });
  };

  const menuItems = (e: Exam, { includeEdit = true } = {}): MenuItem[] => {
    const state = stateOf(e);
    const items: MenuItem[] = [];
    if (includeEdit) items.push({ label: "تعديل الأسئلة والإعدادات", icon: "edit", href: dash.exam(e.id) });
    if (state !== "DRAFT") items.push({ label: "النتائج", icon: "progress", href: dash.examResults(e.id) });
    if (state === "DRAFT") items.push({ label: "نشر", icon: "power", onSelect: () => publish(e), separated: true });
    if (state === "OPEN" || state === "SCHEDULED") {
      items.push({ label: "إغلاق الاختبار", icon: "lock", onSelect: () => close(e), separated: true });
      if (submissionsOf(e.id).length === 0) items.push({ label: "إلغاء النشر", icon: "ban", onSelect: () => unpublish(e) });
    }
    if (state === "CLOSED") items.push({ label: "إعادة الفتح", icon: "power", onSelect: () => reopen(e), separated: true });
    items.push({ label: "حذف", icon: "trash", tone: "danger", onSelect: () => remove(e), separated: true });
    return items;
  };

  return { publish, close, reopen, unpublish, remove, menuItems, dialog };
}
