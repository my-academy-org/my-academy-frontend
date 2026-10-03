import { notFound } from "next/navigation";

/** Unknown paths on an academy subdomain: render the 404 inside the academy's own Shell. */
export default function UnknownAcademyPage() {
  notFound();
}
