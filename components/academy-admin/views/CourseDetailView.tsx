"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useConfirm } from "@/components/dashboard/ConfirmDialog";
import { RowMenu } from "@/components/dashboard/RowMenu";
import { Avatar, BackLink, EmptyState, Notice, PageHeader, Panel, SearchField, Table, Tabs, Td, Th, Tr } from "@/components/dashboard/ui";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";
import { paragraphs } from "@/lib/academy/format";
import { dash, formatStudents } from "@/lib/academy-admin/meta";
import type { DashCourse } from "@/lib/academy-admin/types";
import { formatDate, formatDuration, formatNumber } from "@/lib/format";
import { useAcademy } from "../AcademyStore";
import { CourseStatusBadge, CourseThumb, LessonStatusBadge, ProgressBar } from "../parts";
import { useCourseActions } from "../useCourseActions";

type Tab = "overview" | "lessons" | "students";

export function CourseDetailView({ id, initialTab = "overview" }: { id: string; initialTab?: Tab }) {
  const router = useRouter();
  const { courseById, lessonsOf, studentsIn, codes } = useAcademy();
  const { publish, unpublish, menuItems, dialog } = useCourseActions({ onDeleted: () => router.push(dash.courses) });
  const [tab, setTab] = useState<Tab>(initialTab);
  const course = courseById(id);

  if (!course) return <NotFound />;

  const lessons = lessonsOf(course.id);
  const enrolled = studentsIn(course.id);
  const totalMinutes = lessons.reduce((sum, l) => sum + l.durationMinutes, 0);
  const unusedCodes = codes.filter((c) => c.courseId === course.id && c.status === "UNUSED").length;

  return (
    <>
      <PageHeader
        title={
          <span className="flex items-center gap-4">
            <CourseThumb course={course} className="w-20 rounded-xl" />
            <span className="min-w-0">
              <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                {course.title}
                <CourseStatusBadge status={course.status} />
              </span>
              <span className="mt-1 block text-sm font-normal text-ink-500">أُنشئت في {formatDate(course.createdAt)}</span>
            </span>
          </span>
        }
        actions={
          <>
            <Button href={dash.editCourse(course.id)} variant="secondary">
              <Icon name="edit" className="size-4" />
              تعديل
            </Button>
            {course.status !== "PUBLISHED" ? (
              <Button onClick={() => publish(course)}>
                <Icon name="power" className="size-4" />
                نشر الدورة
              </Button>
            ) : (
              <Button variant="secondary" onClick={() => unpublish(course)}>
                إلغاء النشر
              </Button>
            )}
            <RowMenu label="إجراءات أخرى" items={menuItems(course, { includeView: false }).filter((i) => i.tone === "danger")} />
          </>
        }
      >
        <BackLink href={dash.courses}>الدورات</BackLink>
      </PageHeader>

      <dl className="mb-6 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line shadow-card sm:grid-cols-4">
        {[
          { label: "الدروس", value: formatNumber(lessons.length) },
          { label: "مدة المحتوى", value: totalMinutes ? formatDuration(totalMinutes) : "—" },
          { label: "الطلاب المسجّلون", value: formatNumber(enrolled.length) },
          { label: "أكواد متاحة", value: formatNumber(unusedCodes) },
        ].map((s) => (
          <div key={s.label} className="bg-white px-5 py-4">
            <dt className="text-sm text-ink-500">{s.label}</dt>
            <dd className="mt-1 text-xl font-extrabold text-ink-950 tabular-nums">{s.value}</dd>
          </div>
        ))}
      </dl>

      <Tabs
        label="أقسام الدورة"
        value={tab}
        onChange={setTab}
        className="mb-6"
        tabs={[
          { value: "overview", label: "نظرة عامة" },
          { value: "lessons", label: "الدروس", count: lessons.length },
          { value: "students", label: "الطلاب", count: enrolled.length },
        ]}
      />

      {tab === "overview" && <OverviewTab course={course} />}
      {tab === "lessons" && (
        <Panel
          title="ترتيب الدروس"
          description="هكذا يرى الطلاب الدروس داخل الدورة."
          bodyClassName="p-0"
          action={
            <Button href={dash.lessons(course.id)} size="sm" variant="secondary">
              إدارة الدروس
            </Button>
          }
        >
          {lessons.length === 0 ? (
            <EmptyState icon="play" title="لا توجد دروس بعد" action={<Button href={dash.lessons(course.id)} size="sm">إضافة أول درس</Button>} />
          ) : (
            <ol className="divide-y divide-line">
              {lessons.map((l) => (
                <li key={l.id} className="flex items-center gap-4 px-6 py-3.5">
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-canvas text-xs font-bold text-ink-600 ring-1 ring-line tabular-nums">{l.order}</span>
                  <span className="min-w-0 flex-1 truncate font-semibold text-ink-900">{l.title}</span>
                  {l.isPreview && <span className="rounded-md bg-brand-50 px-1.5 py-px text-[0.6875rem] font-bold text-brand-700">معاينة مجانية</span>}
                  {l.status !== "PUBLISHED" && <LessonStatusBadge status={l.status} />}
                  {l.durationMinutes > 0 && <span className="text-xs text-ink-500 tabular-nums">{formatDuration(l.durationMinutes)}</span>}
                </li>
              ))}
            </ol>
          )}
        </Panel>
      )}
      {tab === "students" && <StudentsTab course={course} />}
      {dialog}
    </>
  );
}

function OverviewTab({ course }: { course: DashCourse }) {
  const { live } = useAcademy();
  return (
    <Panel title="عن الدورة">
      <p className="leading-8 text-ink-800">{course.description}</p>
      {/* The API has no long-form course content yet. */}
      {live ? null : course.content ? (
        <div className="mt-5 space-y-4 border-t border-line pt-5 leading-8 whitespace-pre-line text-ink-700">
          {paragraphs(course.content).map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
      ) : (
        <Notice tone="info" className="mt-5">
          لم تُضف محتوى تفصيلياً للدورة بعد. <Link href={dash.editCourse(course.id)} className="font-semibold text-brand-700 underline">أضفه الآن</Link>
        </Notice>
      )}
    </Panel>
  );
}

function StudentsTab({ course }: { course: DashCourse }) {
  const { studentsIn, progressOf, unenrollStudent, notify } = useAcademy();
  const { confirm, dialog } = useConfirm();
  const [enrollOpen, setEnrollOpen] = useState(false);
  const [query, setQuery] = useState("");
  const enrolled = studentsIn(course.id).filter((s) => !query || s.name.includes(query) || s.email.includes(query.toLowerCase()));

  return (
    <div className="rounded-2xl border border-line bg-white shadow-card">
      <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row sm:items-center sm:justify-between">
        <SearchField value={query} onChange={setQuery} label="بحث في طلاب الدورة" placeholder="ابحث بالاسم أو البريد" />
        <Button size="sm" variant="secondary" onClick={() => setEnrollOpen(true)}>
          <Icon name="plus" className="size-4" />
          تسجيل طالب يدوياً
        </Button>
      </div>
      {studentsIn(course.id).length === 0 ? (
        <EmptyState
          icon="users"
          title="لا يوجد طلاب في هذه الدورة"
          description="يسجّل الطلاب بتفعيل كود تسجيل الدورة من حسابهم في موقع الأكاديمية."
          action={<Button href={dash.codes} size="sm">توليد أكواد للدورة</Button>}
        />
      ) : enrolled.length === 0 ? (
        <EmptyState icon="search" title="لا توجد نتائج" />
      ) : (
        <Table className="min-w-[44rem]">
          <thead>
            <tr>
              <Th>الطالب</Th>
              <Th className="w-56">التقدّم</Th>
              <Th>تاريخ التسجيل</Th>
              <Th>كود التسجيل</Th>
              <Th className="w-14"><span className="sr-only">إجراءات</span></Th>
            </tr>
          </thead>
          <tbody>
            {enrolled.map((s) => {
              const enrollment = s.enrollments.find((e) => e.courseId === course.id)!;
              return (
                <Tr key={s.id}>
                  <Td>
                    <Link href={dash.student(s.id)} className="group flex items-center gap-3">
                      <Avatar name={s.name} className="size-8 text-xs" />
                      <span className="min-w-0">
                        <span className="block font-bold whitespace-nowrap text-ink-950 group-hover:text-brand-700">{s.name}</span>
                        <span className="block text-xs text-ink-500"><bdi>{s.email}</bdi></span>
                      </span>
                    </Link>
                  </Td>
                  <Td><ProgressBar value={progressOf(s, course.id)} /></Td>
                  <Td className="whitespace-nowrap text-ink-600">{formatDate(enrollment.enrolledAt)}</Td>
                  <Td className="font-mono text-xs text-ink-600"><bdi>{enrollment.code ?? "يدوي"}</bdi></Td>
                  <Td>
                    <RowMenu
                      label={`إجراءات ${s.name}`}
                      items={[
                        { label: "ملف الطالب", icon: "user", href: dash.student(s.id) },
                        {
                          label: "إزالة من الدورة",
                          icon: "trash",
                          tone: "danger",
                          separated: true,
                          onSelect: () =>
                            confirm({
                              title: "إزالة الطالب من الدورة",
                              description: (
                                <>
                                  سيفقد <b className="text-ink-900">{s.name}</b> الوصول إلى «{course.title}» ويُحذف تقدّمه فيها.
                                </>
                              ),
                              points: ["لا يُعاد كود التسجيل المستخدم إلى الأكواد المتاحة."],
                              confirmLabel: "إزالة",
                              tone: "danger",
                              onConfirm: () => {
                                unenrollStudent(s.id, course.id);
                                notify(`تمت إزالة ${s.name} من الدورة`);
                              },
                            }),
                        },
                      ]}
                    />
                  </Td>
                </Tr>
              );
            })}
          </tbody>
        </Table>
      )}
      <EnrollModal open={enrollOpen} onClose={() => setEnrollOpen(false)} course={course} />
      {dialog}
    </div>
  );
}

function EnrollModal({ open, onClose, course }: { open: boolean; onClose: () => void; course: DashCourse }) {
  const { students, enrollStudent, notify } = useAcademy();
  const [query, setQuery] = useState("");
  const available = students.filter(
    (s) => s.status === "ACTIVE" && !s.enrollments.some((e) => e.courseId === course.id) && (!query || s.name.includes(query) || s.email.includes(query.toLowerCase())),
  );

  return (
    <Modal open={open} onClose={onClose} title="تسجيل طالب يدوياً" description={`يحصل الطالب على وصول فوري إلى «${course.title}» دون كود.`}>
      <SearchField value={query} onChange={setQuery} label="بحث عن طالب" placeholder="ابحث بالاسم أو البريد" />
      <ul className="mt-4 max-h-80 divide-y divide-line overflow-y-auto rounded-xl border border-line">
        {available.length === 0 ? (
          <li className="px-4 py-8 text-center text-sm text-ink-500">لا يوجد طلاب متاحون للتسجيل.</li>
        ) : (
          available.map((s) => (
            <li key={s.id} className="flex items-center gap-3 px-4 py-2.5">
              <Avatar name={s.name} className="size-8 text-xs" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold text-ink-950">{s.name}</span>
                <span className="block truncate text-xs text-ink-500"><bdi>{s.email}</bdi></span>
              </span>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  enrollStudent(s.id, course.id);
                  notify(`تم تسجيل ${s.name} في الدورة`);
                }}
              >
                تسجيل
              </Button>
            </li>
          ))
        )}
      </ul>
      <p className="mt-3 text-xs text-ink-500">
        يظهر هنا الطلاب المسجّلون في أكاديميتك فقط. {formatStudents(available.length)} متاحون.
      </p>
    </Modal>
  );
}

function NotFound() {
  return (
    <div className="rounded-2xl border border-line bg-white shadow-card">
      <EmptyState
        icon="book"
        title="الدورة غير موجودة"
        description="ربما حُذفت أو أن الرابط غير صحيح."
        action={<Button href={dash.courses} variant="secondary">العودة إلى الدورات</Button>}
      />
    </div>
  );
}
