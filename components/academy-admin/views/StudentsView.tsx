"use client";

import Link from "next/link";
import { useState } from "react";
import { RowMenu } from "@/components/dashboard/RowMenu";
import { Avatar, EmptyState, FilterTabs, PageHeader, SearchField, Table, Td, Th, Tr } from "@/components/dashboard/ui";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Input";
import { dash, formatStudents } from "@/lib/academy-admin/meta";
import type { StudentStatus } from "@/lib/academy-admin/types";
import { formatDate } from "@/lib/format";
import { useAcademy } from "../AcademyStore";
import { ProgressBar, StudentStatusBadge } from "../parts";
import { useStudentActions } from "../useStudentActions";

export function StudentsView() {
  const { students, courses, courseById, progressOf } = useAcademy();
  const { toggleStatus, dialog } = useStudentActions();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"ALL" | StudentStatus>("ALL");
  const [courseId, setCourseId] = useState("ALL");

  const q = query.trim().toLowerCase();
  const rows = [...students]
    .sort((a, b) => b.registeredAt.localeCompare(a.registeredAt))
    .filter((s) => status === "ALL" || s.status === status)
    .filter((s) => courseId === "ALL" || s.enrollments.some((e) => e.courseId === courseId))
    .filter((s) => !q || s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q));

  const avgProgress = (s: (typeof students)[number]) => {
    const list = courseId === "ALL" ? s.enrollments : s.enrollments.filter((e) => e.courseId === courseId);
    if (!list.length) return null;
    return Math.round(list.reduce((sum, e) => sum + progressOf(s, e.courseId), 0) / list.length);
  };

  return (
    <>
      <PageHeader
        title="الطلاب"
        description="طلاب أكاديميتك. يسجّل الطالب من موقع الأكاديمية ثم يفعّل دوراته بأكواد التسجيل."
        actions={
          <Button href={dash.codes} variant="secondary">
            توزيع أكواد التسجيل
          </Button>
        }
      />

      <div className="rounded-2xl border border-line bg-white shadow-card">
        {students.length === 0 ? (
          <EmptyState
            icon="users"
            title="لا يوجد طلاب بعد"
            description="شارك رابط أكاديميتك مع طلابك ليسجّلوا، ثم وزّع عليهم أكواد التسجيل لتفعيل الدورات."
            action={<Button href={dash.codes}>توليد أكواد</Button>}
          />
        ) : (
          <>
            <div className="flex flex-col gap-3 border-b border-line p-4 lg:flex-row lg:items-center">
              <FilterTabs
                label="تصفية حسب الحالة"
                value={status}
                onChange={setStatus}
                options={[
                  { value: "ALL", label: "الكل", count: students.length },
                  { value: "ACTIVE", label: "نشط", count: students.filter((s) => s.status === "ACTIVE").length },
                  { value: "SUSPENDED", label: "موقوف", count: students.filter((s) => s.status === "SUSPENDED").length },
                ]}
              />
              <div className="flex flex-col gap-3 sm:flex-row lg:ms-auto">
                <div className="sm:w-52">
                  <Select aria-label="تصفية حسب الدورة" value={courseId} onChange={(e) => setCourseId(e.target.value)} className="h-10 text-sm">
                    <option value="ALL">كل الدورات</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </Select>
                </div>
                <SearchField value={query} onChange={setQuery} label="بحث في الطلاب" placeholder="ابحث بالاسم أو البريد" />
              </div>
            </div>

            {rows.length === 0 ? (
              <EmptyState
                icon="search"
                title="لا يوجد طلاب مطابقون"
                action={
                  <Button variant="secondary" size="sm" onClick={() => { setQuery(""); setStatus("ALL"); setCourseId("ALL"); }}>
                    إزالة التصفية
                  </Button>
                }
              />
            ) : (
              <Table className="min-w-[60rem]">
                <thead>
                  <tr>
                    <Th>الطالب</Th>
                    <Th>الدورات المسجّل بها</Th>
                    <Th className="w-48">{courseId === "ALL" ? "متوسط التقدّم" : "التقدّم"}</Th>
                    <Th>الحالة</Th>
                    <Th>تاريخ التسجيل</Th>
                    <Th className="w-14"><span className="sr-only">إجراءات</span></Th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((s) => {
                    const progress = avgProgress(s);
                    const titles = s.enrollments.map((e) => courseById(e.courseId)?.title).filter(Boolean);
                    return (
                      <Tr key={s.id}>
                        <Td>
                          <Link href={dash.student(s.id)} className="group flex items-center gap-3">
                            <Avatar name={s.name} />
                            <span className="min-w-0">
                              <span className="block font-bold whitespace-nowrap text-ink-950 group-hover:text-brand-700">{s.name}</span>
                              <span className="block text-xs text-ink-500"><bdi>{s.email}</bdi></span>
                            </span>
                          </Link>
                        </Td>
                        <Td>
                          {titles.length === 0 ? (
                            <span className="text-sm text-ink-400">لم يفعّل أي دورة</span>
                          ) : (
                            <span className="flex flex-wrap gap-1.5">
                              {titles.slice(0, 2).map((t) => (
                                <span key={t} className="max-w-[11rem] truncate rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-ink-700">{t}</span>
                              ))}
                              {titles.length > 2 && <span className="rounded-md px-1 py-0.5 text-xs font-semibold text-ink-500">+{titles.length - 2}</span>}
                            </span>
                          )}
                        </Td>
                        <Td>{progress === null ? <span className="text-ink-400">—</span> : <ProgressBar value={progress} />}</Td>
                        <Td><StudentStatusBadge status={s.status} /></Td>
                        <Td className="whitespace-nowrap text-ink-600">{formatDate(s.registeredAt)}</Td>
                        <Td>
                          <RowMenu
                            label={`إجراءات ${s.name}`}
                            items={[
                              { label: "عرض ملف الطالب", icon: "user", href: dash.student(s.id) },
                              s.status === "ACTIVE"
                                ? { label: "إيقاف الحساب", icon: "ban", tone: "danger", separated: true, onSelect: () => toggleStatus(s) }
                                : { label: "تفعيل الحساب", icon: "power", separated: true, onSelect: () => toggleStatus(s) },
                            ]}
                          />
                        </Td>
                      </Tr>
                    );
                  })}
                </tbody>
              </Table>
            )}
            {rows.length > 0 && (
              <p className="border-t border-line px-6 py-3 text-xs text-ink-500">
                {rows.length === students.length ? formatStudents(students.length) : `${rows.length} من ${formatStudents(students.length)}`}
              </p>
            )}
          </>
        )}
      </div>
      {dialog}
    </>
  );
}
