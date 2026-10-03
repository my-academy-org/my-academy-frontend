"use client";

import Link from "next/link";
import { useState } from "react";
import { RowMenu } from "@/components/dashboard/RowMenu";
import { EmptyState, FilterTabs, PageHeader, SearchField, Table, Td, Th, Tr } from "@/components/dashboard/ui";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { dash } from "@/lib/academy-admin/meta";
import type { CourseStatus } from "@/lib/academy-admin/types";
import { formatDate } from "@/lib/format";
import { useAcademy } from "../AcademyStore";
import { CourseStatusBadge, CourseThumb } from "../parts";
import { useCourseActions } from "../useCourseActions";

export function CoursesView() {
  const { courses, lessonsOf, studentsIn } = useAcademy();
  const { menuItems, dialog } = useCourseActions();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"ALL" | CourseStatus>("ALL");

  const q = query.trim().toLowerCase();
  const rows = [...courses]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .filter((c) => status === "ALL" || c.status === status)
    .filter((c) => !q || c.title.toLowerCase().includes(q));

  return (
    <>
      <PageHeader
        title="الدورات"
        description="دورات أكاديميتك. الدورات المنشورة فقط تظهر في الموقع ويمكن تفعيلها بأكواد التسجيل."
        actions={
          <Button href={dash.newCourse}>
            <Icon name="plus" className="size-4" />
            دورة جديدة
          </Button>
        }
      />

      <div className="rounded-2xl border border-line bg-white shadow-card">
        {courses.length === 0 ? (
          <EmptyState
            icon="book"
            title="أنشئ دورتك الأولى"
            description="أضف عنوان الدورة ووصفها، ثم رتّب دروسها وانشرها لطلابك."
            action={
              <Button href={dash.newCourse}>
                <Icon name="plus" className="size-4" />
                دورة جديدة
              </Button>
            }
          />
        ) : (
          <>
            <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row sm:items-center sm:justify-between">
              <FilterTabs
                label="تصفية حسب الحالة"
                value={status}
                onChange={setStatus}
                options={[
                  { value: "ALL", label: "الكل", count: courses.length },
                  { value: "PUBLISHED", label: "منشورة", count: courses.filter((c) => c.status === "PUBLISHED").length },
                  { value: "DRAFT", label: "مسودة", count: courses.filter((c) => c.status === "DRAFT").length },
                ]}
              />
              <SearchField value={query} onChange={setQuery} label="بحث في الدورات" placeholder="ابحث باسم الدورة" />
            </div>

            {rows.length === 0 ? (
              <EmptyState
                icon="search"
                title="لا توجد دورات مطابقة"
                action={
                  <Button variant="secondary" size="sm" onClick={() => { setQuery(""); setStatus("ALL"); }}>
                    إزالة التصفية
                  </Button>
                }
              />
            ) : (
              <Table className="min-w-[48rem]">
                <thead>
                  <tr>
                    <Th>الدورة</Th>
                    <Th>الدروس</Th>
                    <Th>الطلاب المسجّلون</Th>
                    <Th>الحالة</Th>
                    <Th>تاريخ الإنشاء</Th>
                    <Th className="w-14">
                      <span className="sr-only">إجراءات</span>
                    </Th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((c) => (
                    <Tr key={c.id}>
                      <Td>
                        <Link href={dash.course(c.id)} className="group flex items-center gap-3.5">
                          <CourseThumb course={c} />
                          <span className="min-w-0">
                            <span className="block font-bold text-ink-950 group-hover:text-brand-700">{c.title}</span>
                            <span className="block max-w-sm truncate text-xs text-ink-500">{c.description}</span>
                          </span>
                        </Link>
                      </Td>
                      <Td className="text-ink-700 tabular-nums">{lessonsOf(c.id).length}</Td>
                      <Td className="text-ink-700 tabular-nums">{studentsIn(c.id).length}</Td>
                      <Td>
                        <CourseStatusBadge status={c.status} />
                      </Td>
                      <Td className="whitespace-nowrap text-ink-600">{formatDate(c.createdAt)}</Td>
                      <Td>
                        <RowMenu label={`إجراءات ${c.title}`} items={menuItems(c)} />
                      </Td>
                    </Tr>
                  ))}
                </tbody>
              </Table>
            )}
          </>
        )}
      </div>
      {dialog}
    </>
  );
}
