import type { AcademyTemplate } from "../types";
import { Auth, Contact, CourseDetails, Courses, Home, Teacher } from "./pages";
import { Shell } from "./parts";

/** PREMIUM — dark, cinematic, restrained luxury for private instructors. */
export const premiumTemplate: AcademyTemplate = {
  defaultAccent: "#c9a96e",
  Shell,
  Home,
  Courses,
  CourseDetails,
  Teacher,
  Contact,
  Auth,
};
