"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useConfirm } from "@/components/dashboard/ConfirmDialog";
import { RowMenu, type MenuItem } from "@/components/dashboard/RowMenu";
import { EmptyState, FilterTabs, PageHeader, SearchField, Table, Td, Th, Tr } from "@/components/dashboard/ui";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Field, Input, Select } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/cn";
import { dash, formatCodes } from "@/lib/academy-admin/meta";
import type { CodeStatus, EnrollmentCode } from "@/lib/academy-admin/types";
import { formatDate, fromZonedInput } from "@/lib/format";
import { useAcademy } from "../AcademyStore";
import { CopyButton, copyText } from "../CopyButton";
import { CodeStatusBadge } from "../parts";

const PAGE = 50;
const PRESETS = [10, 25, 50, 100];
const MAX_BATCH = 500;

export function CodesView() {
  const { codes, courses, courseById, studentById, setCodesStatus, deleteCodes, notify } = useAcademy();
  const { confirm, dialog } = useConfirm();
  const [status, setStatus] = useState<"ALL" | CodeStatus>("ALL");
  const [courseId, setCourseId] = useState("ALL");
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(PAGE);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [result, setResult] = useState<{ open: boolean; codes: EnrollmentCode[] }>({ open: false, codes: [] });

  const q = query.trim().toUpperCase();
  const rows = useMemo(
    () =>
      [...codes]
        // Newest first, so freshly generated (available) codes lead.
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .filter((c) => status === "ALL" || c.status === status)
        .filter((c) => courseId === "ALL" || c.courseId === courseId)
        .filter((c) => !q || c.code.includes(q)),
    [codes, status, courseId, q],
  );
  const visible = rows.slice(0, limit);
  const selectedCodes = codes.filter((c) => selected.has(c.id));
  const count = (s: CodeStatus) => codes.filter((c) => c.status === s && (courseId === "ALL" || c.courseId === courseId)).length;
  const scoped = codes.filter((c) => courseId === "ALL" || c.courseId === courseId).length;

  const resetSelection = () => setSelected(new Set());
  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const allVisibleSelected = visible.length > 0 && visible.every((c) => selected.has(c.id));

  const copyMany = async (list: EnrollmentCode[]) => {
    if (await copyText(list.map((c) => c.code).join("\n"))) notify(`تم نسخ ${formatCodes(list.length)}`);
  };

  const disable = (list: EnrollmentCode[]) => {
    const target = list.filter((c) => c.status === "UNUSED");
    if (!target.length) return notify("لا توجد أكواد متاحة ضمن التحديد", "error");
    confirm({
      title: target.length === 1 ? "تعطيل الكود" : `تعطيل ${formatCodes(target.length)}`,
      description: "لن يتمكّن الطلاب من استخدام الأكواد المعطّلة. يمكنك إعادة تفعيلها لاحقاً.",
      points: list.length !== target.length ? ["الأكواد المستخدمة أو المعطّلة مسبقاً لن تتأثر."] : undefined,
      confirmLabel: "تعطيل",
      tone: "danger",
      onConfirm: () => {
        setCodesStatus(target.map((c) => c.id), "DISABLED");
        notify(`تم تعطيل ${formatCodes(target.length)}`);
        resetSelection();
      },
    });
  };

  const remove = (list: EnrollmentCode[]) => {
    const target = list.filter((c) => c.status !== "USED");
    if (!target.length) return notify("لا يمكن حذف الأكواد المستخدمة", "error");
    confirm({
      title: target.length === 1 ? "حذف الكود" : `حذف ${formatCodes(target.length)}`,
      description: "تُحذف الأكواد غير المستخدمة نهائياً.",
      points: list.length !== target.length ? ["الأكواد المستخدمة تبقى كسجلّ لتسجيل الطلاب ولا تُحذف."] : undefined,
      confirmLabel: "حذف",
      tone: "danger",
      onConfirm: () => {
        deleteCodes(target.map((c) => c.id));
        notify(`تم حذف ${formatCodes(target.length)}`);
        resetSelection();
      },
    });
  };

  const rowMenu = (c: EnrollmentCode): MenuItem[] => {
    const items: MenuItem[] = [];
    if (c.status === "UNUSED") items.push({ label: "تعطيل", icon: "ban", onSelect: () => disable([c]) });
    if (c.status === "DISABLED")
      items.push({
        label: "إعادة التفعيل",
        icon: "power",
        onSelect: () => {
          setCodesStatus([c.id], "UNUSED");
          notify("أصبح الكود متاحاً");
        },
      });
    if (c.status === "USED" && c.usedByStudentId) items.push({ label: "عرض الطالب", icon: "user", href: dash.student(c.usedByStudentId) });
    if (c.status !== "USED") items.push({ label: "حذف", icon: "trash", tone: "danger", separated: true, onSelect: () => remove([c]) });
    return items;
  };

  return (
    <>
      <PageHeader
        title="أكواد التسجيل"
        description="كل كود يفعّل دورة واحدة لطالب واحد. ولّد الأكواد، انسخها، ووزّعها على طلابك بالطريقة التي تناسبك."
      />

      {courses.length === 0 ? (
        <div className="rounded-2xl border border-line bg-white shadow-card">
          <EmptyState icon="book" title="أنشئ دورة أولاً" description="الأكواد مرتبطة بالدورات." action={<Button href={dash.newCourse}>دورة جديدة</Button>} />
        </div>
      ) : (
        <Generator onGenerated={(list) => setResult({ open: true, codes: list })} />
      )}

      {codes.length > 0 && (
        <div className="mt-6 rounded-2xl border border-line bg-white shadow-card">
          <div className="flex flex-col gap-3 border-b border-line p-4 lg:flex-row lg:items-center">
            <FilterTabs
              label="تصفية حسب الحالة"
              value={status}
              onChange={(v) => {
                setStatus(v);
                setLimit(PAGE);
              }}
              options={[
                { value: "ALL", label: "الكل", count: scoped },
                { value: "UNUSED", label: "متاحة", count: count("UNUSED") },
                { value: "USED", label: "مستخدمة", count: count("USED") },
                { value: "DISABLED", label: "معطّلة", count: count("DISABLED") },
              ]}
            />
            <div className="flex flex-col gap-3 sm:flex-row lg:ms-auto">
              <div className="sm:w-52">
                <Select aria-label="تصفية حسب الدورة" value={courseId} onChange={(e) => { setCourseId(e.target.value); setLimit(PAGE); }} className="h-10 text-sm">
                  <option value="ALL">كل الدورات</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </Select>
              </div>
              <SearchField value={query} onChange={setQuery} label="بحث عن كود" placeholder="ابحث بالكود" />
            </div>
          </div>

          {selected.size > 0 && (
            <div className="flex flex-wrap items-center gap-2 border-b border-line bg-brand-50/60 px-6 py-2.5">
              <p className="text-sm font-semibold text-brand-800">تم تحديد {formatCodes(selected.size)}</p>
              <div className="ms-auto flex flex-wrap gap-1.5">
                <Button size="sm" variant="secondary" onClick={() => copyMany(selectedCodes)}>
                  <Icon name="copy" className="size-4" />
                  نسخ
                </Button>
                <Button size="sm" variant="secondary" onClick={() => disable(selectedCodes)}>تعطيل</Button>
                <Button size="sm" variant="secondary" onClick={() => remove(selectedCodes)} className="text-red-600">حذف</Button>
                <Button size="sm" variant="ghost" onClick={resetSelection}>إلغاء التحديد</Button>
              </div>
            </div>
          )}

          {rows.length === 0 ? (
            <EmptyState icon="ticket" title="لا توجد أكواد مطابقة" description="غيّر عوامل التصفية أو ولّد أكواداً جديدة." />
          ) : (
            <Table className="min-w-[56rem]">
              <thead>
                <tr>
                  <Th className="w-10">
                    <input
                      type="checkbox"
                      aria-label="تحديد كل الأكواد الظاهرة"
                      checked={allVisibleSelected}
                      onChange={() =>
                        setSelected((prev) => {
                          const next = new Set(prev);
                          for (const c of visible) {
                            if (allVisibleSelected) next.delete(c.id);
                            else next.add(c.id);
                          }
                          return next;
                        })
                      }
                      className="size-4 rounded accent-brand-700"
                    />
                  </Th>
                  <Th>الكود</Th>
                  <Th>الدورة</Th>
                  <Th>الحالة</Th>
                  <Th>استُخدم بواسطة</Th>
                  <Th>تاريخ الإنشاء</Th>
                  <Th>الصلاحية</Th>
                  <Th className="w-14"><span className="sr-only">إجراءات</span></Th>
                </tr>
              </thead>
              <tbody>
                {visible.map((c) => {
                  const student = c.usedByStudentId ? studentById(c.usedByStudentId) : undefined;
                  const items = rowMenu(c);
                  return (
                    <Tr key={c.id} className={cn(selected.has(c.id) && "bg-brand-50/40")}>
                      <Td>
                        <input type="checkbox" aria-label={`تحديد ${c.code}`} checked={selected.has(c.id)} onChange={() => toggle(c.id)} className="size-4 rounded accent-brand-700" />
                      </Td>
                      <Td>
                        <span className="inline-flex items-center gap-1">
                          <bdi className={cn("font-mono text-sm font-semibold tracking-wide", c.status === "UNUSED" ? "text-ink-950" : "text-ink-400", c.status === "DISABLED" && "line-through")}>
                            {c.code}
                          </bdi>
                          {c.status === "UNUSED" && <CopyButton text={c.code} label={`نسخ ${c.code}`} />}
                        </span>
                      </Td>
                      <Td className="max-w-[14rem] truncate text-ink-700">{courseById(c.courseId)?.title}</Td>
                      <Td><CodeStatusBadge status={c.status} /></Td>
                      <Td>
                        {student ? (
                          <Link href={dash.student(student.id)} className="block leading-5 hover:text-brand-700">
                            <span className="block text-sm font-semibold whitespace-nowrap text-ink-800">{student.name}</span>
                            {c.usedAt && <span className="block text-xs text-ink-500">{formatDate(c.usedAt)}</span>}
                          </Link>
                        ) : (
                          <span className="text-ink-400">—</span>
                        )}
                      </Td>
                      <Td className="whitespace-nowrap text-ink-600">{formatDate(c.createdAt)}</Td>
                      <Td className="whitespace-nowrap text-ink-600">{c.expiresAt ? `حتى ${formatDate(c.expiresAt)}` : <span className="text-ink-400">بلا انتهاء</span>}</Td>
                      <Td>{items.length > 0 && <RowMenu label={`إجراءات ${c.code}`} items={items} />}</Td>
                    </Tr>
                  );
                })}
              </tbody>
            </Table>
          )}

          {rows.length > 0 && (
            <div className="flex items-center justify-between border-t border-line px-6 py-3">
              <p className="text-xs text-ink-500">
                عرض {visible.length} من {rows.length}
              </p>
              {rows.length > visible.length && (
                <Button size="sm" variant="ghost" onClick={() => setLimit((l) => l + PAGE)}>
                  عرض المزيد
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      <GeneratedModal result={result} onClose={() => setResult((r) => ({ ...r, open: false }))} />
      {dialog}
    </>
  );
}

/* ------------------------------------------------------------------ */

function Generator({ onGenerated }: { onGenerated: (codes: EnrollmentCode[]) => void }) {
  const { courses, generateCodes } = useAcademy();
  const published = courses.filter((c) => c.status === "PUBLISHED");
  const [courseId, setCourseId] = useState(published[0]?.id ?? courses[0]?.id ?? "");
  const [quantity, setQuantity] = useState(25);
  const [expires, setExpires] = useState("");
  const [error, setError] = useState<string>();
  const course = courses.find((c) => c.id === courseId);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!(quantity >= 1 && quantity <= MAX_BATCH)) return setError(`من 1 إلى ${MAX_BATCH} كود في المرة الواحدة`);
        onGenerated(generateCodes(courseId, quantity, expires ? fromZonedInput(`${expires}T23:59`) : undefined));
      }}
      className="rounded-2xl border border-line bg-white p-6 shadow-card"
    >
      <div className="flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-xl bg-brand-50 text-brand-700 ring-1 ring-brand-100">
          <Icon name="ticket" className="size-5" />
        </span>
        <div>
          <h2 className="font-bold text-ink-950">توليد أكواد جديدة</h2>
          <p className="text-sm text-ink-500">أكواد فريدة غير قابلة للتكرار، جاهزة للنسخ فور توليدها.</p>
        </div>
      </div>

      <div className="mt-5 grid gap-5 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1.3fr)_minmax(0,1fr)_auto] md:items-start">
        <Field label="الدورة" htmlFor="g-course" hint={course?.status === "DRAFT" ? "الدورة مسودة: يمكن توليد الأكواد، لكن التفعيل يعمل بعد النشر." : undefined}>
          <Select id="g-course" value={courseId} onChange={(e) => setCourseId(e.target.value)}>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
                {c.status === "DRAFT" ? " (مسودة)" : ""}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="العدد" htmlFor="g-qty" error={error}>
          <div className="flex gap-2">
            <div className="w-20 shrink-0">
              <Input
                id="g-qty"
                type="number"
                min={1}
                max={MAX_BATCH}
                inputMode="numeric"
                value={quantity || ""}
                onChange={(e) => {
                  setQuantity(Number(e.target.value));
                  setError(undefined);
                }}
                className="tabular-nums"
                aria-invalid={!!error}
              />
            </div>
            <div className="flex gap-1" role="group" aria-label="أعداد شائعة">
              {PRESETS.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => {
                    setQuantity(n);
                    setError(undefined);
                  }}
                  className={cn(
                    "h-11 rounded-lg px-2.5 text-sm font-semibold tabular-nums transition-colors",
                    quantity === n ? "bg-ink-950 text-white" : "bg-muted text-ink-600 hover:text-ink-950",
                  )}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </Field>
        <Field label="تنتهي في" htmlFor="g-exp" optional>
          <Input id="g-exp" type="date" value={expires} onChange={(e) => setExpires(e.target.value)} dir="ltr" className="text-start" />
        </Field>
        <div className="md:pt-7">
          <Button type="submit" className="w-full md:w-auto">
            توليد {quantity > 0 && quantity <= MAX_BATCH ? formatCodes(quantity) : "الأكواد"}
          </Button>
        </div>
      </div>
    </form>
  );
}

function GeneratedModal({ result, onClose }: { result: { open: boolean; codes: EnrollmentCode[] }; onClose: () => void }) {
  const { courseById, notify } = useAcademy();
  const list = result.codes;
  const course = list[0] && courseById(list[0].courseId);

  const download = () => {
    const rows = [["code", "course", "expires_at"], ...list.map((c) => [c.code, course?.title ?? "", c.expiresAt?.slice(0, 10) ?? ""])];
    const csv = "﻿" + rows.map((r) => r.map((v) => `"${v.replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: `codes-${new Date().toISOString().slice(0, 10)}.csv` });
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Modal
      open={result.open}
      onClose={onClose}
      size="lg"
      title={`تم توليد ${formatCodes(list.length)}`}
      description={course ? `لدورة «${course.title}»${list[0]?.expiresAt ? ` · صالحة حتى ${formatDate(list[0].expiresAt)}` : ""}` : undefined}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>إغلاق</Button>
          <Button variant="secondary" onClick={download}>
            <Icon name="upload" className="size-4 rotate-180" />
            تحميل CSV
          </Button>
          <Button
            onClick={async () => {
              if (await copyText(list.map((c) => c.code).join("\n"))) notify(`تم نسخ ${formatCodes(list.length)}`);
            }}
          >
            <Icon name="copy" className="size-4" />
            نسخ الكل
          </Button>
        </>
      }
    >
      <ul className="grid max-h-[50vh] grid-cols-1 gap-2 overflow-y-auto sm:grid-cols-2 lg:grid-cols-3">
        {list.map((c) => (
          <li key={c.id} className="flex items-center justify-between gap-2 rounded-xl border border-line bg-canvas py-1.5 ps-3.5 pe-1.5">
            <bdi className="font-mono text-sm font-semibold tracking-wide text-ink-950">{c.code}</bdi>
            <CopyButton text={c.code} label={`نسخ ${c.code}`} />
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs leading-5 text-ink-500">كل كود صالح لطالب واحد. يدخله الطالب من حسابه في موقع الأكاديمية لتفعيل الدورة.</p>
    </Modal>
  );
}
