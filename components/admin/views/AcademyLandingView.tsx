"use client";

import { useState } from "react";
import { BackLink, PageHeader } from "@/components/dashboard/ui";
import { LandingPageForm, type LandingPageApi } from "@/components/dashboard/LandingPageForm";
import type { LandingPageAdmin, LandingResult } from "@/lib/academy/landing";
import { refreshAcademySite } from "@/lib/academy-admin/landing-actions";
import { ApiError, createLandingPage, deleteLandingPage, errorMessage, getAcademy, getAcademyLandingPage, invalidateData, updateLandingPage } from "@/lib/admin/api";
import type { AdminAcademyDetail } from "@/lib/admin/types";
import { AcademyNotFound } from "./AcademyDetailView";
import { DomainLink, Loading, LoadError } from "../ui";
import { useApiQuery } from "../useApiQuery";

/** Super Admin: create, edit, publish or delete one academy's landing page. */
export function AcademyLandingView({ id }: { id: number }) {
  const academy = useApiQuery(`academy:${id}`, () => getAcademy(id), { refresh: false });
  // The form keeps its own copy after saving, so this loads once.
  const landing = useApiQuery(`landing:${id}`, () => getAcademyLandingPage(id), { refresh: false });

  const error = academy.error ?? landing.error;
  if (error) return <LoadError message={error} />;
  if (academy.data === undefined || landing.data === undefined) return <Loading />;
  if (!academy.data) return <AcademyNotFound />;
  return <AcademyLanding academy={academy.data} initial={landing.data} />;
}

function AcademyLanding({ academy, initial }: { academy: AdminAcademyDetail; initial: LandingPageAdmin | null }) {
  const [page, setPage] = useState(initial);
  const back = `/super-admin/academies/${academy.id}`;

  /** Runs a write, then reloads the page (PATCH/DELETE return a message only) and the public site's cache. */
  const write = async (call: () => Promise<unknown>): Promise<LandingResult> => {
    try {
      await call();
    } catch (error) {
      return { ok: false, status: error instanceof ApiError ? error.status : 0, message: errorMessage(error) };
    }
    invalidateData();
    await refreshAcademySite(academy.slug).catch(() => {});
    try {
      return { ok: true, page: await getAcademyLandingPage(academy.id) };
    } catch {
      return { ok: true };
    }
  };

  const api: LandingPageApi = {
    save: (pageId, input) => write(() => (pageId == null ? createLandingPage(academy.id, input) : updateLandingPage(pageId, input))),
    remove: (pageId) => write(() => deleteLandingPage(pageId)),
  };

  return (
    <>
      <PageHeader
        title={`صفحة الهبوط · ${academy.name}`}
        description={
          <span>
            المحتوى الذي يظهر للزوار على <DomainLink slug={academy.slug} />
          </span>
        }
      >
        <BackLink href={back}>{academy.name}</BackLink>
      </PageHeader>

      <LandingPageForm
        page={page}
        onChange={setPage}
        api={api}
        academyName={academy.name}
        intro={
          !page
            ? "لم تُنشأ صفحة الهبوط بعد. املأ المحتوى ثم اضغط «إنشاء الصفحة»؛ حتى تُنشر يرى الزوار صفحة افتراضية من بيانات الأكاديمية."
            : page.published
              ? "المحتوى أدناه ظاهر للزوار. تعديلاتك تُحفظ مباشرةً على صفحة الأكاديمية."
              : "الصفحة غير منشورة: يرى الزوار صفحة افتراضية من بيانات الأكاديمية حتى تُنشر."
        }
      />
    </>
  );
}
