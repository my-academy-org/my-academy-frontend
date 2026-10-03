import { monogram, StatusPill, type PillTone } from "@/components/dashboard/ui";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import type { LearnCourse, StudentProfile } from "@/lib/student/types";
import type { StudentExamState } from "./StudentStore";

export function StudentAvatar({ profile, className }: { profile: Pick<StudentProfile, "name" | "avatarUrl">; className?: string }) {
  if (profile.avatarUrl) {
    // eslint-disable-next-line @next/next/no-img-element -- uploaded avatar (remote or local object URL)
    return <img src={profile.avatarUrl} alt="" className={cn("size-9 shrink-0 rounded-full object-cover", className)} />;
  }
  return (
    <span aria-hidden="true" className={cn("grid size-9 shrink-0 place-items-center rounded-full bg-brand-700 text-sm font-bold text-white", className)}>
      {monogram(profile.name)}
    </span>
  );
}

/** Course artwork: the uploaded thumbnail, or a soft tinted cover with the course initial. */
export function CourseCover({ course, className }: { course: Pick<LearnCourse, "thumbnailUrl" | "tint" | "title">; className?: string }) {
  return (
    <div className={cn("relative aspect-[16/9] overflow-hidden", className)} style={{ background: course.tint }} aria-hidden="true">
      {course.thumbnailUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- course thumbnails come from the academy's storage
        <img src={course.thumbnailUrl} alt="" className="absolute inset-0 size-full object-cover" />
      ) : (
        <>
          <div className="absolute -end-6 -bottom-10 size-40 rounded-full bg-white/35" />
          <div className="absolute -start-8 -top-12 size-32 rounded-full bg-white/25" />
          <Icon name="book" className="absolute start-5 bottom-4 size-8 text-ink-900/30" />
        </>
      )}
    </div>
  );
}

export function Meter({ value, className, label }: { value: number; className?: string; label?: string }) {
  return (
    <div
      className={cn("h-1.5 overflow-hidden rounded-full bg-ink-900/8", className)}
      role="progressbar"
      aria-label={label}
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className="h-full rounded-full bg-brand-500 transition-[width] duration-500" style={{ width: `${value}%` }} />
    </div>
  );
}

export function ProgressRing({ value, size = 96, stroke = 8, children }: { value: number; size?: number; stroke?: number; children?: React.ReactNode }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative grid shrink-0 place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-muted)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--color-brand-500)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - value / 100)}
          className="transition-[stroke-dashoffset] duration-700"
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{children}</div>
    </div>
  );
}

const examTone: Record<StudentExamState, { label: string; tone: PillTone }> = {
  AVAILABLE: { label: "متاح الآن", tone: "success" },
  UPCOMING: { label: "قادم", tone: "info" },
  COMPLETED: { label: "مكتمل", tone: "neutral" },
  MISSED: { label: "انتهى", tone: "warning" },
};

export const ExamPill = ({ state }: { state: StudentExamState }) => <StatusPill tone={examTone[state].tone}>{examTone[state].label}</StatusPill>;

export const ResultPill = ({ passed }: { passed: boolean }) => <StatusPill tone={passed ? "success" : "danger"}>{passed ? "ناجح" : "لم ينجح"}</StatusPill>;
