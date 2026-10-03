import { AcademyUnavailable } from "@/components/academy/shared/AcademyUnavailable";

/** Unknown subdomain (thrown by the [slug] layout). */
export default function AcademyNotFound() {
  return <AcademyUnavailable missing />;
}
