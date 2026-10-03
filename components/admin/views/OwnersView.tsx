"use client";

import Link from "next/link";
import { useState } from "react";
import { resendInvitationAction, setOwnerStatusAction, updateOwnerAction, type ActionResult } from "@/lib/admin/actions";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Field, Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/cn";
import { listOwnerlessAcademies, listOwners } from "@/lib/admin/api";
import { EMAIL_RE, formatDate } from "@/lib/admin/meta";
import type { OwnerRow, OwnerStatus } from "@/lib/admin/types";
import { useApiQuery } from "../useApiQuery";
import { AddOwnerDialog } from "../AddOwnerDialog";
import { useListFilters } from "../useListFilters";
import { useConfirm } from "@/components/dashboard/ConfirmDialog";
import { RowMenu, type MenuItem } from "@/components/dashboard/RowMenu";
import { useToast } from "@/components/dashboard/Toaster";
import { Avatar, EmptyState, FilterTabs, PageHeader, SearchField, Table, Td, Th, Tr } from "@/components/dashboard/ui";
import { Loading, LoadError, OwnerStatusBadge, Pagination } from "../ui";

export type OwnerFilters = { status: OwnerStatus | ""; search: string };
type Editor = { open: boolean; row?: OwnerRow; version: number };

export function OwnersView({ filters, page, openCreate = false }: { filters: OwnerFilters; page: number; openCreate?: boolean }) {
  const notify = useToast();
  const { confirm, dialog } = useConfirm();
  const { query, onSearch, apply, reset, hrefFor } = useListFilters("/super-admin/owners", filters);
  const [editor, setEditor] = useState<Editor>({ open: false, version: 0 });
  const [creator, setCreator] = useState({ open: openCreate, version: 0 });
  const list = useApiQuery(`owners:${JSON.stringify(filters)}:${page}`, () => listOwners({ ...filters, page }));
  // Academies that can still receive an owner.
  const ownerless = useApiQuery("ownerless", listOwnerlessAcademies);

  if (list.error) return <LoadError message={list.error} />;
  if (!list.data) return <Loading />;

  const { counts, data: rows, meta } = list.data;
  const pending = list.loading;

  const filtered = filters.search !== "" || filters.status !== "";
  const openCreator = () => setCreator((c) => ({ open: true, version: c.version + 1 }));

  const run = async (action: Promise<ActionResult>, success: string) => {
    const result = await action;
    notify(result.ok ? success : result.message, result.ok ? "success" : "error");
  };

  // Every owner action targets `academyAdmin.id`; the row id is the academy's.
  const menuItems = (row: OwnerRow): MenuItem[] => {
    const o = row.academyAdmin;
    const items: MenuItem[] = [
      { label: "عرض الأكاديمية", icon: "academy", href: `/super-admin/academies/${row.id}` },
      { label: "تعديل البيانات", icon: "edit", onSelect: () => setEditor((e) => ({ open: true, row, version: e.version + 1 })) },
    ];
    if (o.status === "INACTIVE") {
      items.push({
        label: "إعادة إرسال الدعوة",
        icon: "mail",
        onSelect: () =>
          confirm({
            title: "إعادة إرسال الدعوة",
            description: (
              <>
                ستُرسل كلمة مرور جديدة إلى <bdi className="font-semibold text-ink-900">{o.email}</bdi>، وتُلغى كلمة المرور السابقة.
              </>
            ),
            confirmLabel: "إرسال الدعوة",
            onConfirm: () => void run(resendInvitationAction(o.id), `تم إرسال دعوة جديدة إلى ${o.email}`),
          }),
      });
    }
    items.push(
      o.status === "SUSPENDED"
        ? {
            label: "تفعيل الحساب",
            icon: "power",
            separated: true,
            onSelect: () =>
              confirm({
                title: "تفعيل حساب المالك",
                description: (
                  <>
                    سيتمكّن <b className="text-ink-900">{o.name}</b> من تسجيل الدخول وإدارة أكاديميته مجدداً.
                  </>
                ),
                points: row.status === "SUSPENDED" ? ["أكاديميته موقوفة حالياً: يجب تفعيل الأكاديمية نفسها لاستعادة حسابه."] : undefined,
                confirmLabel: "تفعيل الحساب",
                onConfirm: () => void run(setOwnerStatusAction(o.id, "activate"), `تم تفعيل حساب ${o.name}`),
              }),
          }
        : {
            label: "إيقاف الحساب",
            icon: "ban",
            separated: true,
            onSelect: () =>
              confirm({
                title: "إيقاف حساب المالك",
                description: (
                  <>
                    لن يتمكّن <b className="text-ink-900">{o.name}</b> من تسجيل الدخول إلى لوحة أكاديميته.
                  </>
                ),
                points: ["تبقى الأكاديمية وموقعها كما هما — لإيقاف الموقع أوقف الأكاديمية نفسها.", "يمكن إعادة تفعيل الحساب في أي وقت."],
                confirmLabel: "إيقاف الحساب",
                tone: "danger",
                onConfirm: () => void run(setOwnerStatusAction(o.id, "suspend"), `تم إيقاف حساب ${o.name}`),
              }),
          },
    );
    return items;
  };

  return (
    <>
      <PageHeader
        title="ملّاك الأكاديميات"
        description="حسابات ACADEMY_ADMIN — لكل أكاديمية مالك واحد هو المعلّم الذي يديرها."
        actions={
          <Button onClick={openCreator}>
            <Icon name="plus" className="size-4" />
            إضافة مالك
          </Button>
        }
      />

      <div className="rounded-2xl border border-line bg-white shadow-card">
        {counts.all === 0 && !filtered ? (
          <EmptyState
            icon="users"
            title="لا يوجد ملّاك بعد"
            description="أنشئ أكاديمية ثم أضف مالكها. يظهر المالك هنا بعد تأكيد بريده برمز التحقق."
            action={
              <Button onClick={openCreator}>
                <Icon name="plus" className="size-4" />
                إضافة مالك
              </Button>
            }
          />
        ) : (
          <>
            <div className="flex flex-col gap-3 border-b border-line p-4 lg:flex-row lg:items-center lg:justify-between">
              <FilterTabs
                label="تصفية حسب حالة الحساب"
                value={filters.status}
                onChange={(status) => apply({ status })}
                options={[
                  { value: "", label: "الكل", count: counts.all },
                  { value: "ACTIVE", label: "نشط", count: counts.active },
                  { value: "INACTIVE", label: "بانتظار الدخول", count: counts.pending },
                  { value: "SUSPENDED", label: "موقوف", count: counts.suspended },
                ]}
              />
              <SearchField value={query} onChange={onSearch} label="بحث في الملّاك" placeholder="ابحث بالاسم أو البريد أو الأكاديمية" />
            </div>

            <div className={cn("transition-opacity", pending && "opacity-60")} aria-busy={pending}>
              {rows.length === 0 ? (
                <EmptyState
                  icon="search"
                  title="لا توجد نتائج مطابقة"
                  description="جرّب كلمات بحث أخرى أو أزل عوامل التصفية."
                  action={
                    <Button variant="secondary" size="sm" onClick={reset}>
                      إزالة التصفية
                    </Button>
                  }
                />
              ) : (
                <Table className="min-w-[52rem]">
                  <thead>
                    <tr>
                      <Th>الاسم</Th>
                      <Th>البريد الإلكتروني</Th>
                      <Th>الأكاديمية</Th>
                      <Th>حالة الحساب</Th>
                      <Th>تاريخ الإنشاء</Th>
                      <Th className="w-14">
                        <span className="sr-only">إجراءات</span>
                      </Th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => {
                      const o = row.academyAdmin;
                      return (
                        <Tr key={o.id}>
                          <Td>
                            <div className="flex items-center gap-3">
                              <Avatar name={o.name} />
                              <span className="font-bold whitespace-nowrap text-ink-950">{o.name}</span>
                            </div>
                          </Td>
                          <Td className="text-ink-600">
                            <bdi>{o.email}</bdi>
                          </Td>
                          <Td>
                            <Link href={`/super-admin/academies/${row.id}`} className="font-semibold whitespace-nowrap text-ink-800 hover:text-brand-700">
                              {row.name}
                            </Link>
                          </Td>
                          <Td>
                            <OwnerStatusBadge status={o.status} />
                          </Td>
                          <Td className="whitespace-nowrap text-ink-600">{formatDate(o.createdAt)}</Td>
                          <Td>
                            <RowMenu label={`إجراءات ${o.name}`} items={menuItems(row)} />
                          </Td>
                        </Tr>
                      );
                    })}
                  </tbody>
                </Table>
              )}
            </div>

            {rows.length > 0 && <Pagination meta={meta} noun="مالك" hrefFor={(page) => hrefFor({}, page)} />}
          </>
        )}
      </div>

      <OwnerEditor key={`edit-${editor.version}`} open={editor.open} row={editor.row} onClose={() => setEditor((e) => ({ ...e, open: false }))} />
      {/* Mounted once the academies are known: its initial choice depends on them. */}
      {ownerless.data && (
        <AddOwnerDialog key={`add-${creator.version}`} open={creator.open} onClose={() => setCreator((c) => ({ ...c, open: false }))} academies={ownerless.data} />
      )}
      {dialog}
    </>
  );
}

function OwnerEditor({ open, row, onClose }: { open: boolean; row?: OwnerRow; onClose: () => void }) {
  const notify = useToast();
  const owner = row?.academyAdmin;
  const [values, setValues] = useState({ name: owner?.name ?? "", email: owner?.email ?? "" });
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!owner) return;
    const next: typeof errors = {};
    const input = { name: values.name.trim(), email: values.email.trim() };
    if (input.name.length < 3) next.name = "أدخل الاسم الكامل";
    if (!EMAIL_RE.test(input.email)) next.email = "أدخل بريداً إلكترونياً صحيحاً";
    setErrors(next);
    if (Object.keys(next).length) return;

    // Only the fields that changed.
    const patch: { name?: string; email?: string } = {};
    if (input.name !== owner.name) patch.name = input.name;
    if (input.email !== owner.email) patch.email = input.email;
    if (Object.keys(patch).length === 0) return onClose();

    setSaving(true);
    const result = await updateOwnerAction(owner.id, patch);
    setSaving(false);
    if (!result.ok) {
      if (result.status === 409) return setErrors({ email: result.message });
      return notify(result.message, "error");
    }
    notify("تم حفظ بيانات المالك");
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="تعديل بيانات المالك"
      description={row?.name}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            إلغاء
          </Button>
          <Button type="submit" form="owner-form" disabled={saving}>
            {saving ? "جارٍ الحفظ…" : "حفظ التعديلات"}
          </Button>
        </>
      }
    >
      <form id="owner-form" onSubmit={submit} noValidate className="grid gap-5">
        <Field label="الاسم الكامل" htmlFor="edit-owner-name" error={errors.name}>
          <Input
            id="edit-owner-name"
            value={values.name}
            onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
            placeholder="مثال: م. أحمد سامي"
            aria-invalid={!!errors.name}
            autoFocus
          />
        </Field>
        <Field label="البريد الإلكتروني" htmlFor="edit-owner-email" error={errors.email} hint="يُستخدم لتسجيل الدخول إلى لوحة الأكاديمية.">
          <Input
            id="edit-owner-email"
            type="email"
            dir="ltr"
            className="text-start"
            value={values.email}
            onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
            placeholder="name@example.com"
            aria-invalid={!!errors.email}
          />
        </Field>
      </form>
    </Modal>
  );
}
