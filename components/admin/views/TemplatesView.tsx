"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";
import type { AdminTemplate } from "@/lib/admin/types";
import { TemplateThumb } from "../TemplateThumb";
import { EmptyState, Notice, PageHeader } from "@/components/dashboard/ui";

/** Read-only: the API has no templates endpoint yet, so these are the templates existing academies use. */
export function TemplatesView({ templates }: { templates: (AdminTemplate & { usage: number })[] }) {
  const [preview, setPreview] = useState<{ open: boolean; id?: number }>({ open: false });
  const previewed = templates.find((t) => t.id === preview.id);

  return (
    <>
      <PageHeader title="القوالب" description="قوالب مواقع الأكاديميات. كل قالب يعرض بيانات الأكاديمية نفسها بشكل مختلف." />

      {templates.length === 0 ? (
        <div className="rounded-2xl border border-line bg-white shadow-card">
          <EmptyState icon="layout" title="لا توجد قوالب مستخدمة بعد" description="تظهر هنا القوالب التي تستخدمها الأكاديميات الموجودة." />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {templates.map((t) => (
            <article key={t.id} className="flex flex-col rounded-2xl border border-line bg-white shadow-card">
              <button
                type="button"
                onClick={() => setPreview({ open: true, id: t.id })}
                className="group relative block overflow-hidden rounded-t-2xl bg-canvas p-4 text-start"
                aria-label={`معاينة قالب ${t.name}`}
              >
                <TemplateThumb type={t.type} className="shadow-lift transition-transform duration-300 group-hover:-translate-y-0.5" />
                <span className="absolute inset-0 grid place-items-center bg-ink-950/0 opacity-0 transition-[opacity,background-color] group-hover:bg-ink-950/25 group-hover:opacity-100 group-focus-visible:opacity-100">
                  <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-ink-950 shadow-lift">
                    <Icon name="eye" className="size-4" />
                    معاينة
                  </span>
                </span>
              </button>

              <div className="flex flex-1 items-end justify-between gap-4 border-t border-line p-5">
                <div className="min-w-0">
                  <h2 className="text-lg font-extrabold text-ink-950">
                    <bdi>{t.name}</bdi>
                  </h2>
                  <p className="mt-0.5 font-mono text-xs text-ink-400">
                    <bdi>
                      #{t.id} · {t.type}
                    </bdi>
                  </p>
                </div>
                <span className="shrink-0 text-sm text-ink-500">
                  {t.usage === 1 ? "أكاديمية واحدة" : t.usage === 2 ? "أكاديميتان" : `${t.usage} أكاديميات`}
                </span>
              </div>
            </article>
          ))}
        </div>
      )}

      <Notice tone="info" className="mt-8">
        لا يوفّر الـ API قائمة بالقوالب بعد، لذلك تظهر هنا القوالب المستخدمة في أكاديميات موجودة فقط، وإتاحة القوالب أو إيقافها غير متاح حالياً.
      </Notice>

      <Modal
        open={preview.open}
        onClose={() => setPreview((p) => ({ ...p, open: false }))}
        size="xl"
        title={previewed ? <bdi>{previewed.name}</bdi> : ""}
        footer={
          <Button variant="secondary" onClick={() => setPreview((p) => ({ ...p, open: false }))}>
            إغلاق
          </Button>
        }
      >
        {previewed && <TemplateThumb type={previewed.type} detailed className="shadow-card" />}
      </Modal>
    </>
  );
}
