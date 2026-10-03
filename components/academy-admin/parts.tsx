import type { CSSProperties } from "react";
import { monogram, StatusPill } from "@/components/dashboard/ui";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { codeStatus, courseStatus, examState, studentStatus, type ExamState } from "@/lib/academy-admin/meta";
import type { CodeStatus, CourseStatus, DashCourse, StudentStatus } from "@/lib/academy-admin/types";

/** The academy's logo, or a monogram tinted with its brand colour. */
export function AcademyLogo({
  name,
  logoUrl,
  color,
  className,
}: {
  name: string;
  logoUrl?: string;
  color?: string;
  className?: string;
}) {
  if (logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- uploaded logos (remote or local object URLs)
      <img src={logoUrl} alt="" className={cn("size-9 shrink-0 rounded-xl object-cover ring-1 ring-line", className)} />
    );
  }
  return (
    <span
      aria-hidden="true"
      style={{ "--mark": color ?? "var(--color-brand-700)" } as CSSProperties}
      className={cn("grid size-9 shrink-0 place-items-center rounded-xl bg-(--mark) text-sm font-bold text-white", className)}
    >
      {monogram(name)}
    </span>
  );
}

/** Course thumbnail, or a tinted placeholder with the book icon. */
export function CourseThumb({ course, className }: { course: Pick<DashCourse, "thumbnailUrl" | "tint" | "title">; className?: string }) {
  return (
    <span
      className={cn("relative grid aspect-[16/10] w-16 shrink-0 place-items-center overflow-hidden rounded-lg ring-1 ring-black/5", className)}
      style={{ background: course.tint }}
      aria-hidden="true"
    >
      {course.thumbnailUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- uploaded thumbnails (remote or local object URLs)
        <img src={course.thumbnailUrl} alt="" className="absolute inset-0 size-full object-cover" />
      ) : (
        <Icon name="book" className="size-[35%] text-ink-900/35" />
      )}
    </span>
  );
}

export function ProgressBar({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div
        className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className={cn("h-full rounded-full", value === 100 ? "bg-brand-600" : "bg-brand-400")} style={{ width: `${value}%` }} />
      </div>
      <span className="w-9 text-end text-xs text-ink-500 tabular-nums">{value}%</span>
    </div>
  );
}

export const CourseStatusBadge = ({ status }: { status: CourseStatus }) => (
  <StatusPill tone={courseStatus[status].tone}>{courseStatus[status].label}</StatusPill>
);
export const StudentStatusBadge = ({ status }: { status: StudentStatus }) => (
  <StatusPill tone={studentStatus[status].tone}>{studentStatus[status].label}</StatusPill>
);
export const CodeStatusBadge = ({ status }: { status: CodeStatus }) => (
  <StatusPill tone={codeStatus[status].tone}>{codeStatus[status].label}</StatusPill>
);
export const ExamStateBadge = ({ state }: { state: ExamState }) => (
  <StatusPill tone={examState[state].tone}>{examState[state].label}</StatusPill>
);
