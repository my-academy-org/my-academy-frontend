/**
 * Super Admin data model — mirrors the backend responses documented in
 * docs/super-admin-api.md. The Super Admin manages academies and their owners
 * (one ACADEMY_ADMIN per academy).
 */

export type UserRole = "SUPER_ADMIN" | "ACADEMY_ADMIN" | "STUDENT";

/** INACTIVE: created but not live yet. SUSPENDED: stopped by the Super Admin. */
export type AcademyStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";

/** INACTIVE: account created, owner hasn't signed in yet. */
export type OwnerStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";

export type Plan = "BASIC" | "PRO";

export type TemplateType = "MODERN" | "EDUCATION" | "CORPORATE";

export interface AdminTemplate {
  id: number;
  name: string;
  type: TemplateType;
}

export interface PageMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** Row of GET /academies. */
export interface AdminAcademy {
  /** Academy id — used in every /academies/:id route. */
  id: number;
  /** Only used when adding an owner (POST /users/add-academy-admin/:tenant_id). */
  tenantId: number;
  name: string;
  /** Subdomain: `ahmed` → ahmed.<root domain> */
  slug: string;
  logoUrl: string | null;
  plan: Plan;
  status: AcademyStatus;
  template: AdminTemplate;
  owner: { id: number; name: string; email: string } | null;
  createdAt: string;
}

/** GET /academies/:id */
export interface AdminAcademyDetail extends AdminAcademy {
  description: string | null;
  phone: string | null;
  /** The academy's contact email, not the owner's. */
  email: string | null;
  address: string | null;
  updatedAt: string;
  landingPage: { id: number; published: boolean } | null;
  stats: { courses: number; lessons: number; enrollments: number; students: number };
}

export interface AcademyList {
  /** Affected by search and template, not by the status tab. */
  counts: { all: number; active: number; inactive: number; suspended: number };
  data: AdminAcademy[];
  meta: PageMeta;
}

/** Fields accepted by POST /academies/:id — send only what changed. */
export interface AcademyPatch {
  name?: string;
  slug?: string;
  plan?: Plan;
  templateId?: number;
  description?: string;
  logoUrl?: string | null;
  phone?: string;
  email?: string | null;
  address?: string;
}

/**
 * Row of GET /users/academy-admins: the row is the *academy*, with its owner
 * nested. Owner actions use `academyAdmin.id`, never the row id.
 */
export interface OwnerRow {
  id: number;
  name: string;
  slug: string;
  status: AcademyStatus;
  academyAdmin: { id: number; name: string; email: string; status: OwnerStatus; createdAt: string };
}

export interface OwnerList {
  counts: { all: number; active: number; pending: number; suspended: number };
  data: OwnerRow[];
  meta: PageMeta;
}

/** GET /academies/statistics */
export interface PlatformStats {
  academies: { total: number; active: number; inactive: number; suspended: number; activePercentage: number };
  owners: { total: number; pendingFirstLogin: number };
  students: { total: number };
  courses: { total: number; averagePerAcademy: number };
}
