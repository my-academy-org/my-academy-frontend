import type { Metadata } from "next";
import { ProfileView } from "@/components/student/views/ProfileView";

export const metadata: Metadata = { title: "حسابي" };

export default function Page() {
  return <ProfileView />;
}
