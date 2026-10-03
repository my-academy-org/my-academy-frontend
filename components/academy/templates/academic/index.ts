import type { AcademyTemplate } from "../types";
import { Auth, Contact, CourseDetails, Courses, Home, Teacher } from "./pages";
import { Shell } from "./parts";

/** ACADEMIC — formal, editorial, information-dense; serif headings on paper. */
export const academicTemplate: AcademyTemplate = {
  defaultAccent: "#1c2b4a",
  Shell,
  Home,
  Courses,
  CourseDetails,
  Teacher,
  Contact,
  Auth,
};
