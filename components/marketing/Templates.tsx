"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container, Section } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";
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
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <SectionHeader
            align="start"
            eyebrow="القوالب"
            title="ثلاثة قوالب احترافية، هوية واحدة لك"
            description="اختر القالب الأقرب لأسلوبك، ثم خصّصه بشعارك وألوانك ومحتواك. جميع القوالب متجاوبة وتعمل على الجوال والحاسوب."
          />
          <RequestAcademyButton variant="secondary" withArrow className="max-md:hidden">
            ابدأ بقالبك المفضّل
          </RequestAcademyButton>
        </div>

        <div className="mt-12 grid gap-5 sm:mt-14 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {templates.map((t, i) => (
            <Card
              key={t.id}
              interactive
              className={`group flex flex-col overflow-hidden ${i === 2 ? "md:col-span-2 lg:col-span-1" : ""}`}
            >
              <button
                type="button"
                onClick={() => setPreviewId(t.id)}
                className="relative block overflow-hidden border-b border-line bg-muted p-4 pb-0 text-start sm:p-5 sm:pb-0"
                aria-label={`معاينة قالب ${t.name}`}
              >
                <div className="aspect-[4/3.4] overflow-hidden rounded-t-xl border border-b-0 border-line shadow-lift transition-transform duration-500 group-hover:-translate-y-1">
                  <TemplatePreview template={t.id} academy={t.sample} />
                </div>
                <span className="absolute inset-0 grid place-items-center bg-ink-950/0 opacity-0 transition-[opacity,background-color] duration-300 group-hover:bg-ink-950/25 group-hover:opacity-100">
                  <span className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-ink-900 shadow-lift">
                    <Icon name="eye" className="size-4" /> معاينة
                  </span>
                </span>
              </button>

              <div className="flex flex-1 flex-col p-6">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-xl font-extrabold text-ink-950" dir="ltr">
                    {t.name}
                  </h3>
                  <div className="flex -space-x-1.5" aria-hidden="true">
                    {t.palette.map((c) => (
                      <span key={c} className="size-5 rounded-full ring-2 ring-white" style={{ background: c }} />
                    ))}
                  </div>
                </div>
                <p className="mt-1 text-sm font-semibold text-ink-500">قالب {t.arabicName}</p>
                <p className="mt-3 flex-1 text-[0.9375rem] leading-7 text-ink-600">{t.description}</p>
                <div className="mt-4">
                  <Badge tone="neutral">مناسب لـ: {t.bestFor}</Badge>
                </div>
                <Button variant="secondary" className="mt-6 w-full" onClick={() => setPreviewId(t.id)}>
                  <Icon name="eye" className="size-4" />
                  معاينة القالب
                </Button>
              </div>
            </Card>
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
