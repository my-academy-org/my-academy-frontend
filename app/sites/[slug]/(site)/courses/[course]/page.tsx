import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { findCourse } from "@/lib/academy/data";
import { loadAcademy } from "@/lib/academy/load";

export async function generateMetadata({ params }: PageProps<"/sites/[slug]/courses/[course]">): Promise<Metadata> {
  const { site } = await loadAcademy(params);
  const course = findCourse(site, (await params).course);
  return course ? { title: course.title, description: course.shortDescription } : {};
}

export default async function AcademyCoursePage({ params }: PageProps<"/sites/[slug]/courses/[course]">) {
  const { site, template } = await loadAcademy(params);
  const course = findCourse(site, (await params).course);
  if (!course) notFound();
  return <template.CourseDetails site={site} course={course} />;
}
