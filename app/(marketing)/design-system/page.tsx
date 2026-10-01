import type { Metadata } from "next";
import type { ReactNode } from "react";
import { FeatureCard } from "@/components/marketing/FeatureCard";
import { PlanCard } from "@/components/marketing/Pricing";
import { Accordion } from "@/components/ui/Accordion";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { Field, Input, Select, Textarea } from "@/components/ui/Input";
import { Logo } from "@/components/ui/Logo";
import { faqs, features, plans } from "@/lib/site";
import { ModalDemo } from "./ModalDemo";

export const metadata: Metadata = {
  title: "نظام التصميم",
  robots: { index: false },
};

const colors = [
  { name: "brand-700", value: "var(--color-brand-700)", hex: "#105544" },
  { name: "brand-900", value: "var(--color-brand-900)", hex: "#0b342b" },
  { name: "brand-50", value: "var(--color-brand-50)", hex: "#eef6f2" },
  { name: "gold-400", value: "var(--color-gold-400)", hex: "#d6a956" },
  { name: "ink-950", value: "var(--color-ink-950)", hex: "#0b1512" },
  { name: "ink-600", value: "var(--color-ink-600)", hex: "#52615b" },
  { name: "line", value: "var(--color-line)", hex: "#e7e2d7" },
  { name: "canvas", value: "var(--color-canvas)", hex: "#faf8f3" },
];

export default function DesignSystemPage() {
  return (
    <Container className="pt-32 pb-24 sm:pt-40">
      <Badge tone="brand">داخلي</Badge>
      <h1 className="mt-4 text-4xl font-extrabold text-ink-950">نظام التصميم</h1>
      <p className="mt-3 max-w-2xl leading-8 text-ink-600">
        المكوّنات القابلة لإعادة الاستخدام في موقع My Academy التسويقي. جميعها في <code dir="ltr">components/ui</code>.
      </p>

      <Block title="الهوية والألوان">
        <div className="mb-8 flex flex-wrap items-center gap-8">
          <Logo />
          <span className="rounded-xl bg-brand-900 p-3"><Logo inverse /></span>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {colors.map((c) => (
            <div key={c.name}>
              <div className="h-16 rounded-xl ring-1 ring-line ring-inset" style={{ background: c.value }} />
              <p className="mt-2 text-xs font-bold text-ink-800" dir="ltr">{c.name}</p>
              <p className="text-xs text-ink-500" dir="ltr">{c.hex}</p>
            </div>
          ))}
        </div>
      </Block>

      <Block title="الخطوط">
        <div className="space-y-4">
          <p className="text-5xl font-extrabold leading-[1.25] text-ink-950">عنوان رئيسي — Display</p>
          <p className="text-3xl font-extrabold leading-[1.35] text-ink-950">عنوان قسم — Heading</p>
          <p className="text-lg font-bold text-ink-950">عنوان بطاقة — Title</p>
          <p className="max-w-2xl text-base leading-8 text-ink-600">
            نص أساسي بخط Cairo، بارتفاع سطر مريح للقراءة العربية. يدعم الإنجليزية دون تغيير في التخطيط — English text works too.
          </p>
        </div>
      </Block>

      <Block title="الأزرار">
        <div className="flex flex-wrap items-center gap-3">
          <Button>أساسي</Button>
          <Button variant="secondary">ثانوي</Button>
          <Button variant="ghost">شفاف</Button>
          <Button withArrow>مع سهم</Button>
          <Button size="sm">صغير</Button>
          <Button size="lg">كبير</Button>
          <Button disabled>معطّل</Button>
        </div>
        <div className="mt-4 flex flex-wrap gap-3 rounded-2xl bg-brand-900 p-5">
          <Button variant="inverse">معكوس</Button>
          <Button variant="inverse-outline">معكوس بإطار</Button>
        </div>
      </Block>

      <Block title="الشارات">
        <div className="flex flex-wrap gap-2">
          <Badge>محايد</Badge>
          <Badge tone="brand" dot>نشط</Badge>
          <Badge tone="gold">Pro</Badge>
          <Badge tone="outline">إطار</Badge>
          <span className="rounded-full bg-brand-900 p-1"><Badge tone="dark">داكن</Badge></span>
        </div>
      </Block>

      <Block title="الحقول">
        <Card className="grid max-w-2xl gap-4 p-6 sm:grid-cols-2">
          <Field label="الاسم" htmlFor="ds-name">
            <Input id="ds-name" placeholder="أحمد سامي" />
          </Field>
          <Field label="البريد الإلكتروني" htmlFor="ds-email" error="يرجى إدخال بريد صحيح">
            <Input id="ds-email" aria-invalid dir="ltr" defaultValue="ahmed@" className="text-start" />
          </Field>
          <Field label="النطاق الفرعي" htmlFor="ds-sub" hint="أحرف إنجليزية صغيرة فقط." className="sm:col-span-2">
            <Input id="ds-sub" placeholder="ahmed" suffix=".myacademy.com" />
          </Field>
          <Field label="الخطة" htmlFor="ds-plan">
            <Select id="ds-plan"><option>Basic</option><option>Pro</option></Select>
          </Field>
          <Field label="معطّل" htmlFor="ds-disabled">
            <Input id="ds-disabled" disabled placeholder="غير متاح" />
          </Field>
          <Field label="ملاحظات" htmlFor="ds-notes" optional className="sm:col-span-2">
            <Textarea id="ds-notes" />
          </Field>
        </Card>
      </Block>

      <Block title="البطاقات">
        <div className="grid gap-5 md:grid-cols-3">
          <FeatureCard feature={features.courses} />
          <FeatureCard feature={features.media} />
          <Card interactive className="p-6">
            <p className="font-bold text-ink-950">بطاقة أساسية</p>
            <p className="mt-2 text-sm leading-7 text-ink-600">سطح أبيض بحدود رفيعة وظل خفيف، مع حالة تفاعلية عند المرور.</p>
          </Card>
        </div>
      </Block>

      <Block title="بطاقات الأسعار">
        <div className="grid max-w-4xl gap-6 md:grid-cols-2">
          {plans.map((p) => <PlanCard key={p.id} plan={p} />)}
        </div>
      </Block>

      <Block title="الأكورديون والنافذة المنبثقة">
        <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
          <Accordion group="ds-faq" items={faqs.slice(0, 3)} />
          <div><ModalDemo /></div>
        </div>
      </Block>
    </Container>
  );
}

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-16 border-t border-line pt-10">
      <h2 className="mb-6 text-xl font-bold text-ink-950">{title}</h2>
      {children}
    </section>
  );
}
