import type { AcademyStatus } from "./types";

/**
 * Academies behind the demo sign-in accounts (lib/auth/users.ts), used only
 * while no backend is configured. The first three match the public sample
 * sites in lib/academy/fixtures.ts. The Super Admin dashboard itself always
 * reads from the API (lib/admin/api.ts).
 */
export const sampleAcademies: { id: string; name: string; slug: string; status: AcademyStatus }[] = [
  { id: "a-1", name: "أكاديمية أحمد للبرمجة", slug: "ahmed", status: "ACTIVE" },
  { id: "a-2", name: "أكاديمية أ. محمد للفيزياء", slug: "mohamed", status: "ACTIVE" },
  { id: "a-3", name: "أكاديمية علي للإنجليزية", slug: "ali", status: "ACTIVE" },
  { id: "a-4", name: "أكاديمية د. سارة للكيمياء", slug: "dr-sara", status: "ACTIVE" },
  { id: "a-5", name: "أكاديمية النخبة للإنجليزية", slug: "elite", status: "SUSPENDED" },
  { id: "a-6", name: "أكاديمية يوسف للتصميم", slug: "yousef", status: "ACTIVE" },
  { id: "a-7", name: "أكاديمية نورة للرياضيات", slug: "noura", status: "INACTIVE" },
];
