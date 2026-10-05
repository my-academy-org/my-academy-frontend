"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { academyUrl, formatDate, formatNumber, planLabels } from "@/lib/admin/meta";
import type { AdminAcademyDetail } from "@/lib/admin/types";
import { AddOwnerDialog } from "../AddOwnerDialog";
import { TemplateThumb } from "../TemplateThumb";
import { useAcademyActions } from "../useAcademyActions";
import { Avatar, BackLink, DetailRow, EmptyState, Notice, PageHeader, Panel, StatusPill } from "@/components/dashboard/ui";
import { AcademyMark, AcademyStatusBadge, DomainLink, Loading, LoadError, TemplateTag } from "../ui";
import { useApiQuery } from "../useApiQuery";
import { getAcademy } from "@/lib/admin/api";

export function AcademyDetailView({ id, openAddOwner = false }: { id: number; openAddOwner?: boolean }) {
  const academy = useApiQuery(`academy:${id}`, () => getAcademy(id));

  if (academy.error) return <LoadError message={academy.error} />;
  if (academy.data === undefined) return <Loading />;
  if (!academy.data) return <AcademyNotFound />;
  return <AcademyDetail academy={academy.data} openAddOwner={openAddOwner} />;
}

function AcademyDetail({ academy, openAddOwner }: { academy: AdminAcademyDetail; openAddOwner: boolean }) {
  const router = useRouter();
  const { activate, suspend, remove, dialog } = useAcademyActions({ onDeleted: () => router.push("/super-admin/academies") });
  const [ownerDialog, setOwnerDialog] = useState({ open: openAddOwner && !academy.owner, version: 0 });

  const { owner, stats, template } = academy;
  const empty = <span className="text-ink-400">—</span>;

  return (
    <>
      <PageHeader
        title={
          <span className="flex items-center gap-4">
            <AcademyMark name={academy.name} logoUrl={academy.logoUrl} className="size-14 rounded-2xl text-xl" />
            <span className="min-w-0">
              <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                {academy.name}
                <AcademyStatusBadge status={academy.status} />
              </span>
              <span className="mt-1 block text-base font-normal">
                <DomainLink slug={academy.slug} />
              </span>
            </span>
          </span>
        }
        actions={
          <>
            <Button href={`/super-admin/academies/${academy.id}/edit`} variant="secondary">
              <Icon name="edit" className="size-4" />
              تعديل
            </Button>
            <Button href={`/super-admin/academies/${academy.id}/landing`} variant="secondary">
              <Icon name={academy.landingPage ? "layout" : "plus"} className="size-4" />
              {academy.landingPage ? "تعديل صفحة الهبوط" : "إنشاء صفحة الهبوط"}
            </Button>
            {academy.status === "ACTIVE" ? (
              <Button variant="secondary" onClick={() => suspend(academy)} className="text-red-600 hover:text-red-700">
                <Icon name="ban" className="size-4" />
                إيقاف
              </Button>
            ) : (
              <Button onClick={() => activate(academy)}>
                <Icon name="power" className="size-4" />
                تفعيل الأكاديمية
              </Button>
            )}
          </>
        }
      >
        <BackLink href="/super-admin/academies">الأكاديميات</BackLink>
      </PageHeader>

      {academy.status !== "ACTIVE" && (
        <Notice tone="warning" className="mb-6">
          {academy.status === "SUSPENDED"
            ? "هذه الأكاديمية موقوفة: صفحتها العامة مغلقة، وحساب مالكها موقوف ولا يستطيع تسجيل الدخول. البيانات محفوظة."
            : "هذه الأكاديمية غير مفعّلة بعد. فعّلها ليصبح موقعها متاحاً."}
        </Notice>
      )}

      <dl className="mb-8 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line shadow-card lg:grid-cols-4">
        {[
          { label: "الطلاب", value: formatNumber(stats.students) },
          { label: "الدورات", value: formatNumber(stats.courses) },
          { label: "الدروس", value: formatNumber(stats.lessons) },
          { label: "الاشتراكات", value: formatNumber(stats.enrollments) },
        ].map((s) => (
          <div key={s.label} className="bg-white px-6 py-5">
            <dt className="text-sm text-ink-500">{s.label}</dt>
            <dd className="mt-1.5 text-xl font-extrabold text-ink-950 tabular-nums">{s.value}</dd>
          </div>
        ))}
      </dl>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <Panel title="بيانات الأكاديمية" bodyClassName="px-6 py-2">
            <dl className="divide-y divide-line">
              <DetailRow label="الاسم">{academy.name}</DetailRow>
              <DetailRow label="النطاق الفرعي">
                <bdi className="font-mono text-sm">{academyUrl(academy.slug)}</bdi>
              </DetailRow>
              <DetailRow label="الخطة">
                <bdi className="font-semibold">{planLabels[academy.plan] ?? academy.plan}</bdi>
              </DetailRow>
              <DetailRow label="الوصف">{academy.description ? <p className="leading-7 text-ink-700">{academy.description}</p> : empty}</DetailRow>
              <DetailRow label="البريد الإلكتروني">{academy.email ? <bdi>{academy.email}</bdi> : empty}</DetailRow>
              <DetailRow label="الهاتف">{academy.phone ? <bdi>{academy.phone}</bdi> : empty}</DetailRow>
              <DetailRow label="العنوان">{academy.address || empty}</DetailRow>
              <DetailRow label="صفحة الهبوط">
                {academy.landingPage ? (
                  <span className="flex flex-wrap items-center gap-3">
                    <StatusPill tone={academy.landingPage.published ? "success" : "neutral"}>{academy.landingPage.published ? "منشورة" : "غير منشورة"}</StatusPill>
                    <Link href={`/super-admin/academies/${academy.id}/landing`} className="text-sm font-semibold text-brand-700 hover:text-brand-800">
                      تعديل المحتوى
                    </Link>
                  </span>
                ) : (
                  <span className="flex flex-wrap items-center gap-3">
                    <span className="text-ink-400">لم تُنشأ بعد</span>
                    <Link href={`/super-admin/academies/${academy.id}/landing`} className="text-sm font-semibold text-brand-700 hover:text-brand-800">
                      إنشاء الصفحة
                    </Link>
                  </span>
                )}
              </DetailRow>
              <DetailRow label="تاريخ الإنشاء">{formatDate(academy.createdAt)}</DetailRow>
              <DetailRow label="آخر تحديث">{formatDate(academy.updatedAt)}</DetailRow>
            </dl>
          </Panel>

          {template && (
            <Panel
              title="القالب"
              description={<TemplateTag name={template.name} />}
              action={
                <Link href={`/super-admin/academies/${academy.id}/edit`} className="text-sm font-semibold text-brand-700 hover:text-brand-800">
                  تغيير القالب
                </Link>
              }
            >
              <TemplateThumb type={template.type} name={academy.name} slug={academy.slug} className="shadow-card" />
            </Panel>
          )}
        </div>

        <div className="space-y-6">
          <Panel
            title="مالك الأكاديمية"
            action={
              <Link href="/super-admin/owners" className="text-sm font-semibold text-brand-700 hover:text-brand-800">
                إدارة الملّاك
              </Link>
            }
          >
            {owner ? (
              <>
                <div className="flex items-center gap-3">
                  <Avatar name={owner.name} className="size-11" />
                  <div className="min-w-0">
                    <p className="truncate font-bold text-ink-950">{owner.name}</p>
                    <p className="truncate text-sm text-ink-500">
                      <bdi>{owner.email}</bdi>
                    </p>
                  </div>
                </div>
                <dl className="mt-5 border-t border-line pt-4 text-sm">
                  <div className="flex items-center justify-between">
                    <dt className="text-ink-500">الدور</dt>
                    <dd dir="ltr" className="font-mono text-xs font-semibold text-ink-700">
                      ACADEMY_ADMIN
                    </dd>
                  </div>
                </dl>
              </>
            ) : (
              <EmptyState
                icon="user"
                title="لا يوجد مالك مرتبط"
                description={academy.status === "ACTIVE" ? "أضف مالك الأكاديمية ليتمكّن من إدارتها." : "فعّل الأكاديمية أولاً لتتمكّن من إضافة مالكها."}
                className="py-6"
                action={
                  academy.status === "ACTIVE" && (
                    <Button size="sm" onClick={() => setOwnerDialog((d) => ({ open: true, version: d.version + 1 }))}>
                      <Icon name="plus" className="size-4" />
                      إضافة مالك
                    </Button>
                  )
                }
              />
            )}
          </Panel>

          <section className="rounded-2xl border border-red-200 bg-white">
            <div className="p-6">
              <h2 className="font-bold text-red-700">حذف الأكاديمية</h2>
              <p className="mt-1 text-sm leading-6 text-ink-500">
                يحذف الأكاديمية نهائياً مع مالكها وطلابها ودوراتها وكل ما يتبعها، ويحرّر نطاقها الفرعي. للإيقاف المؤقت استخدم «إيقاف» بدلاً من ذلك.
              </p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => remove(academy)}
                className="mt-4 border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50"
              >
                <Icon name="trash" className="size-4" />
                حذف الأكاديمية
              </Button>
            </div>
          </section>
        </div>
      </div>

      <AddOwnerDialog
        key={ownerDialog.version}
        open={ownerDialog.open}
        onClose={() => setOwnerDialog((d) => ({ ...d, open: false }))}
        academies={owner ? [] : [academy]}
        fixed
      />
      {dialog}
    </>
  );
}

export function AcademyNotFound() {
  return (
    <div className="rounded-2xl border border-line bg-white shadow-card">
      <EmptyState
        icon="academy"
        title="الأكاديمية غير موجودة"
        description="ربما حُذفت أو أن الرابط غير صحيح."
        action={
          <Button href="/super-admin/academies" variant="secondary">
            العودة إلى الأكاديميات
          </Button>
        }
      />
    </div>
  );
}
