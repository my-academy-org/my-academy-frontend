import { StudentShell } from "@/components/student/StudentShell";

export default function StudentAppLayout({ children }: LayoutProps<"/sites/[slug]/student">) {
  return <StudentShell>{children}</StudentShell>;
}
