"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Container, Section } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { BrowserFrame } from "@/components/mockups/BrowserFrame";
import { TemplatePreview } from "@/components/mockups/TemplatePreview";
import { ROOT_DOMAIN, templates, type TemplateId } from "@/lib/site";
import { RequestAcademyButton } from "./RequestAcademy";

export function Templates() {
  const [previewId, setPreviewId] = useState<TemplateId | null>(null);
  const preview = templates.find((t) => t.id === previewId);

  return (
    <Section id="templates">
      <Container>
        <SectionHeader
          index="04"
          eyebrow="القوالب"
          title="ثلاثة قوالب احترافية، هوية واحدة لك"
          description="اختر القالب الأقرب لأسلوبك، ثم خصّصه بشعارك وألوانك ومحتواك. جميع القوالب متجاوبة وتعمل على الجوال والحاسوب."
        />

        <div className="mt-12 grid gap-x-6 gap-y-12 sm:mt-16 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((t, i) => (
            <Reveal as="article" delay={i * 90} key={t.id} className={`group flex flex-col ${i === 2 ? "md:col-span-2 lg:col-span-1" : ""}`}>
              <button
                type="button"
                onClick={() => setPreviewId(t.id)}
                className="block overflow-hidden rounded-2xl bg-canvas p-4 pb-0 text-start ring-1 ring-inset ring-line sm:p-5 sm:pb-0"
                aria-label={`معاينة قالب ${t.name}`}
              >
                <div className="aspect-[4/3.4] overflow-hidden rounded-t-lg border border-b-0 border-line shadow-lift transition-transform duration-500 group-hover:-translate-y-1.5">
                  <TemplatePreview template={t.id} academy={t.sample} />
                </div>
              </button>

              <div className="flex flex-1 flex-col px-1 pt-5">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-xl font-bold text-ink-950">
                    <span dir="ltr">{t.name}</span>
                    <span className="ms-2 text-base font-medium text-ink-400">{t.arabicName}</span>
                  </h3>
                  <div className="flex -space-x-1.5" aria-hidden="true">
                    {t.palette.map((c) => (
                      <span key={c} className="size-5 rounded-full ring-2 ring-white" style={{ background: c }} />
                    ))}
                  </div>
                </div>
                <p className="mt-2 flex-1 text-[0.9375rem] leading-7 text-ink-600">{t.description}</p>
                <div className="mt-5 flex items-center justify-between gap-4 border-t border-line pt-4">
                  <p className="text-sm text-ink-500">
                    مناسب لـ <span className="font-semibold text-ink-800">{t.bestFor}</span>
                  </p>
                  <button
                    type="button"
                    onClick={() => setPreviewId(t.id)}
                    className="flex shrink-0 items-center gap-1.5 text-sm font-bold text-brand-700 transition-colors hover:text-brand-900"
                  >
                    معاينة
                    <Icon name="arrow" className="size-4 rtl:rotate-180" />
                  </button>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>

      <Modal
        open={!!preview}
        onClose={() => setPreviewId(null)}
        size="xl"
        title={preview ? `قالب ${preview.name} — ${preview.arabicName}` : ""}
        description={preview?.description}
        footer={
          preview && (
            <>
              <Button variant="ghost" onClick={() => setPreviewId(null)}>
                إغلاق
              </Button>
              <div className="grid" onClick={() => setPreviewId(null)}>
                <RequestAcademyButton template={preview.id} withArrow>
                  استخدم هذا القالب
                </RequestAcademyButton>
              </div>
            </>
          )
        }
      >
        {preview && (
          <BrowserFrame
            url={`${preview.sample.subdomain}.${ROOT_DOMAIN}`}
            dark={preview.id === "premium"}
            className="shadow-lift"
          >
            <TemplatePreview template={preview.id} academy={preview.sample} detailed />
          </BrowserFrame>
        )}
      </Modal>
    </Section>
  );
}
