import type { AcademyTemplate } from "../types";
import { Auth, Contact, CourseDetails, Courses, Home, Teacher } from "./pages";
import { Shell } from "./parts";

/** MODERN — clean, contemporary, generous whitespace and soft rounded cards. */
export const modernTemplate: AcademyTemplate = {
  defaultAccent: "#3b5bdb",
  Shell,
  Home,
  Courses,
  CourseDetails,
  Teacher,
  Contact,
  Auth,
};
