/**
 * Public academy data model.
 *
 * This is the single contract between the backend and the academy website.
 * All three templates render exactly this shape — a template never contains
 * teacher-specific content, it only decides how this data is presented.
 */

export type TemplateId = "MODERN" | "ACADEMIC" | "PREMIUM";
export type Plan = "BASIC" | "PRO";
export type TenantStatus = "ACTIVE" | "SUSPENDED";

export interface Media {
  url: string;
  alt?: string;
}

export interface Tenant {
  /** Subdomain: `ahmed` → ahmed.myacademy.com */
  slug: string;
  /** Backend tenant id — what students register into and are checked against. Absent for the bundled sample academies. */
  tenantId?: number;
  name: string;
  plan: Plan;
  status: TenantStatus;
}

export interface SocialLink {
  platform: "facebook" | "instagram" | "youtube" | "x" | "tiktok" | "linkedin" | "telegram";
  url: string;
}

export interface ContactInfo {
  email?: string;
  phone?: string;
  whatsapp?: string;
  address?: string;
  workingHours?: string;
  socials?: SocialLink[];
}

export interface Academy {
  logo?: Media;
  template: TemplateId;
  /** Optional brand accent (hex). Each template falls back to its own default. */
  brandColor?: string;
  contact: ContactInfo;
}

export type FeatureIcon =
  | "video"
  | "exam"
  | "progress"
  | "support"
  | "certificate"
  | "schedule"
  | "materials"
  | "community"
  | "device";

export interface Feature {
  title: string;
  description: string;
  icon?: FeatureIcon;
}

export interface Qualification {
  title: string;
  institution?: string;
  year?: string;
}

export interface Step {
  title: string;
  description: string;
}

/** Manually managed content only — not a ratings/reviews system. */
export interface Testimonial {
  quote: string;
  author: string;
  role?: string;
}

export interface TeacherInfo {
  name: string;
  /** Short professional title, e.g. "مدرّس الفيزياء للمرحلة الثانوية" */
  title?: string;
  bio: string;
  image?: Media;
  qualifications: Qualification[];
  experienceYears?: number;
  methodology?: Step[];
}

export interface LandingPage {
  hero: {
    title: string;
    description: string;
    image?: Media;
    /** Optional small line above the title. */
    eyebrow?: string;
  };
  about: {
    title: string;
    description: string;
  };
  teacher: TeacherInfo;
  features: Feature[];
  /** Student benefits list (Academic template shows it prominently). */
  benefits?: string[];
  /** Learning process; templates fall back to the platform's default flow. */
  learningSteps?: Step[];
  testimonials?: Testimonial[];
  footer: {
    tagline?: string;
  };
}

export interface Lesson {
  id: string;
  title: string;
  durationMinutes?: number;
  /** Free preview lesson visible before enrollment. */
  isPreview?: boolean;
}

export interface CourseSection {
  title: string;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  description: string;
  image?: Media;
  /** Unknown for courses from the landing-page API; templates leave it out then. */
  lessonCount?: number;
  examCount?: number;
  durationHours?: number;
  level?: string;
  category?: string;
  featured?: boolean;
  outcomes?: string[];
  requirements?: string[];
  curriculum?: CourseSection[];
}

/** Everything a public academy website needs for one render. */
export interface AcademySite {
  tenant: Tenant;
  academy: Academy;
  landing: LandingPage;
  courses: Course[];
}

export interface StudentSession {
  id: string;
  name: string;
}
