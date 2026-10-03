"use client";

import { useConfirm } from "@/components/dashboard/ConfirmDialog";
import type { MenuItem } from "@/components/dashboard/RowMenu";
import { formatLessons } from "@/lib/academy/format";
import { dash, formatStudents } from "@/lib/academy-admin/meta";
import type { DashCourse } from "@/lib/academy-admin/types";
import { useAcademy } from "./AcademyStore";

/** Publish / unpublish / delete a course, each behind a confirmation. */
export function useCourseActions({ onDeleted }: { onDeleted?: () => void } = {}) {
  const { setCourseStatus, deleteCourse, lessonsOf, studentsIn, notify } = useAcademy();
  const { confirm, dialog } = useConfirm();

  const publish = (c: DashCourse) => {
    const lessonCount = lessonsOf(c.id).length;
    confirm({
      title: "نشر الدورة",
      description: (
        <>
          ستظهر <b className="text-ink-900">{c.title}</b> في موقع الأكاديمية، ويستطيع الطلاب تفعيلها بأكواد التسجيل.
        </>
      ),
      points: lessonCount === 0 ? ["تنبيه: الدورة لا تحتوي على دروس بعد."] : [`تحتوي على ${formatLessons(lessonCount)}.`],
      confirmLabel: "نشر الدورة",
      onConfirm: () => {
        setCourseStatus(c.id, "PUBLISHED");
        notify(`تم نشر «${c.title}»`);
      },
    });
  };

  const unpublish = (c: DashCourse) => {
    const enrolled = studentsIn(c.id).length;
    confirm({
      title: "إلغاء نشر الدورة",
      description: (
        <>
          ستختفي <b className="text-ink-900">{c.title}</b> من موقع الأكاديمية ولن يمكن تفعيلها بأكواد جديدة.
        </>
      ),
      points: enrolled ? [`${formatStudents(enrolled)} مسجّلون فيها يحتفظون بوصولهم إلى الدروس.`] : undefined,
      confirmLabel: "إلغاء النشر",
      onConfirm: () => {
        setCourseStatus(c.id, "DRAFT");
        notify(`أصبحت «${c.title}» مسودة`);
      },
    });
  };

  const remove = (c: DashCourse) => {
    const enrolled = studentsIn(c.id).length;
    confirm({
      title: "حذف الدورة نهائياً",
      description: (
        <>
          سيتم حذف <b className="text-ink-900">{c.title}</b> مع دروسها واختباراتها وأكوادها. لا يمكن التراجع عن ذلك.
        </>
      ),
      points: [
        `${formatLessons(lessonsOf(c.id).length)} ستُحذف.`,
        enrolled ? `${formatStudents(enrolled)} سيفقدون الوصول إلى الدورة.` : "لا يوجد طلاب مسجّلون فيها.",
      ],
      confirmText: enrolled ? "حذف" : undefined,
      confirmLabel: "حذف الدورة",
      tone: "danger",
      onConfirm: () => {
        deleteCourse(c.id);
        notify(`تم حذف «${c.title}»`);
        onDeleted?.();
      },
    });
  };

  const menuItems = (c: DashCourse, { includeView = true } = {}): MenuItem[] => [
    ...(includeView ? [{ label: "عرض الدورة", icon: "eye" as const, href: dash.course(c.id) }] : []),
    { label: "تعديل", icon: "edit", href: dash.editCourse(c.id) },
    { label: "إدارة الدروس", icon: "play", href: dash.lessons(c.id) },
    { label: "الطلاب المسجّلون", icon: "users", href: `${dash.course(c.id)}?tab=students` },
    c.status === "PUBLISHED"
      ? { label: "إلغاء النشر", icon: "ban", onSelect: () => unpublish(c), separated: true }
      : { label: "نشر", icon: "power", onSelect: () => publish(c), separated: true },
    { label: "حذف", icon: "trash", tone: "danger", onSelect: () => remove(c), separated: true },
  ];

  return { publish, unpublish, remove, menuItems, dialog };
}
