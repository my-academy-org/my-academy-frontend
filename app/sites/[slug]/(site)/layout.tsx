import { El_Messiri } from "next/font/google";
import type { CSSProperties } from "react";
import { getStudentSession } from "@/lib/academy/data";
import { loadAcademy } from "@/lib/academy/load";

// Display face for the Premium template (Cairo and Amiri come from the root layout).
const messiri = El_Messiri({ variable: "--font-messiri", subsets: ["arabic", "latin"], display: "swap" });

/** The academy's public website, rendered with its template. */
export default async function AcademySiteLayout({ params, children }: LayoutProps<"/sites/[slug]">) {
  const { site, template } = await loadAcademy(params);
  const { Shell } = template;
  const session = await getStudentSession();

  return (
    <div
      data-template={site.academy.template}
      className={`${messiri.variable} flex min-h-dvh flex-col`}
      style={{ "--accent": site.academy.brandColor ?? template.defaultAccent } as CSSProperties}
    >
      <Shell site={site} session={session}>
        {children}
      </Shell>
    </div>
  );
}
