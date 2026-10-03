"use client";

import {
  deleteAcademyAction,
  setAcademyStatusAction,
  type ActionResult,
} from "@/app/super-admin/actions";
import { useConfirm } from "@/components/dashboard/ConfirmDialog";
import type { MenuItem } from "@/components/dashboard/RowMenu";
import { useToast } from "@/components/dashboard/Toaster";
import { academyUrl } from "@/lib/admin/meta";
import type { AdminAcademy } from "@/lib/admin/types";

type Target = Pick<AdminAcademy, "id" | "name" | "slug" | "status">;

/**
 * Status changes and deletion for an academy, each behind a confirmation.
 * Shared by the academies table and the academy details page.
 */
export function useAcademyActions({ onDeleted }: { onDeleted?: () => void } = {}) {
  const notify = useToast();
  const { confirm, dialog } = useConfirm();

  const run = async (action: Promise<ActionResult>, success: string, then?: () => void) => {
    const result = await action;
    if (!result.ok) return notify(result.message, "error");
    notify(success);
    then?.();
  };

  const activate = (a: Target) =>
    confirm({
      title: "تفعيل الأكاديمية",
      description: (
        <>
          سيصبح موقع <b className="text-ink-900">{a.name}</b> متاحاً على{" "}
          <span dir="ltr" className="font-semibold text-ink-900">{academyUrl(a.slug)}</span>.
        </>
      ),
      points: ["يُعاد تفعيل حساب المالك إن كان موقوفاً، فيستطيع إدارة الأكاديمية من لوحته."],
      confirmLabel: "تفعيل الأكاديمية",
      onConfirm: () => void run(setAcademyStatusAction(a.id, "activate"), `تم تفعيل «${a.name}»`),
    });

  const suspend = (a: Target) =>
    confirm({
      title: "إيقاف الأكاديمية",
      description: (
        <>
          سيتم إيقاف <b className="text-ink-900">{a.name}</b> مؤقتاً. لا تُحذف أي بيانات، ويمكنك إعادة تفعيلها في أي وقت.
        </>
      ),
      points: [
        "تُغلق صفحة الأكاديمية العامة.",
        "يُوقَف حساب المالك في نفس العملية ولا يستطيع تسجيل الدخول.",
        "تبقى الدورات والطلاب والنتائج محفوظة كما هي.",
      ],
      confirmLabel: "إيقاف الأكاديمية",
      tone: "danger",
      onConfirm: () => void run(setAcademyStatusAction(a.id, "suspend"), `تم إيقاف «${a.name}»`),
    });

  const remove = (a: Target) =>
    confirm({
      title: "حذف الأكاديمية نهائياً",
      description: (
        <>
          سيتم حذف <b className="text-ink-900">{a.name}</b> وكل ما يتبعها. لا يمكن التراجع عن هذا الإجراء.
        </>
      ),
      points: [
        "يُحذف معها حساب المالك والطلاب والدورات والدروس والامتحانات والاشتراكات والأكواد والإشعارات وصفحة الهبوط.",
        "يتحرّر النطاق الفرعي ويمكن استخدامه لأكاديمية أخرى.",
      ],
      confirmText: a.slug,
      confirmLabel: "حذف نهائياً",
      tone: "danger",
      onConfirm: () => void run(deleteAcademyAction(a.id), `تم حذف «${a.name}»`, onDeleted),
    });

  const menuItems = (a: Target, { includeView = true } = {}): MenuItem[] => [
    ...(includeView ? [{ label: "عرض التفاصيل", icon: "eye" as const, href: `/super-admin/academies/${a.id}` }] : []),
    { label: "تعديل", icon: "edit", href: `/super-admin/academies/${a.id}/edit` },
    a.status === "ACTIVE"
      ? { label: "إيقاف", icon: "ban", onSelect: () => suspend(a), separated: true }
      : { label: "تفعيل", icon: "power", onSelect: () => activate(a), separated: true },
    ...(a.status === "INACTIVE" ? [{ label: "إيقاف", icon: "ban" as const, onSelect: () => suspend(a) }] : []),
    { label: "حذف", icon: "trash", onSelect: () => remove(a), tone: "danger", separated: true },
  ];

  return { activate, suspend, remove, menuItems, dialog };
}
