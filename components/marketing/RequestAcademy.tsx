"use client";

import { createContext, useCallback, useContext, useId, useState, type ReactNode } from "react";
import { Button, type ButtonProps } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Field, Input, Select, Textarea } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { ROOT_DOMAIN, type PlanId, type TemplateId } from "@/lib/site";

type OpenOptions = { plan?: PlanId; template?: TemplateId };

const RequestAcademyContext = createContext<((opts?: OpenOptions) => void) | null>(null);

/**
 * Teachers can't self-register — accounts are created by the Super Admin.
 * So every "أنشئ أكاديميتك" CTA opens this request form instead of a sign-up page.
 */
export function RequestAcademyProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<OpenOptions>({});
  const [submitted, setSubmitted] = useState(false);
  // Bumped on every open so the form remounts with fresh defaults.
  const [formKey, setFormKey] = useState(0);
  const formId = useId();

  const openModal = useCallback((opts: OpenOptions = {}) => {
    setOptions(opts);
    setSubmitted(false);
    setFormKey((k) => k + 1);
    setOpen(true);
  }, []);

  return (
    <RequestAcademyContext.Provider value={openModal}>
      {children}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={submitted ? "تم استلام طلبك" : "اطلب إنشاء أكاديميتك"}
        description={
          submitted
            ? undefined
            : "يتواصل معك فريق My Academy لإنشاء أكاديميتك وحسابك كمعلّم وتجهيز نطاقك الفرعي."
        }
        footer={
          submitted ? (
            <Button variant="secondary" onClick={() => setOpen(false)}>
              إغلاق
            </Button>
          ) : (
            <>
              <Button variant="ghost" onClick={() => setOpen(false)}>
                إلغاء
              </Button>
              <Button type="submit" form={formId} withArrow>
                إرسال الطلب
              </Button>
            </>
          )
        }
      >
        {submitted ? (
          <div className="flex flex-col items-center py-6 text-center">
            <span className="grid size-14 place-items-center rounded-full bg-brand-50 text-brand-700 ring-8 ring-brand-50/50">
              <Icon name="check" className="size-7" />
            </span>
            <p className="mt-5 max-w-sm text-[0.9375rem] leading-7 text-ink-600">
              شكراً لك. سيراجع فريقنا طلبك ويتواصل معك عبر البريد الإلكتروني لاستكمال إعداد أكاديميتك.
            </p>
          </div>
        ) : (
          <form
            key={formKey}
            id={formId}
            className="grid gap-4 sm:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              // No backend yet — wire this to the academy-request API endpoint.
              setSubmitted(true);
            }}
          >
            <Field label="الاسم الكامل" htmlFor={`${formId}-name`}>
              <Input id={`${formId}-name`} name="name" required autoComplete="name" placeholder="مثال: أحمد سامي" />
            </Field>
            <Field label="البريد الإلكتروني" htmlFor={`${formId}-email`}>
              <Input id={`${formId}-email`} name="email" type="email" required dir="ltr" autoComplete="email" placeholder="name@example.com" className="text-start" />
            </Field>
            <Field label="رقم الجوال" htmlFor={`${formId}-phone`} optional>
              <Input id={`${formId}-phone`} name="phone" type="tel" dir="ltr" autoComplete="tel" placeholder="+966 5x xxx xxxx" className="text-start" />
            </Field>
            <Field label="اسم الأكاديمية" htmlFor={`${formId}-academy`}>
              <Input id={`${formId}-academy`} name="academy" required placeholder="مثال: أكاديمية أحمد للبرمجة" />
            </Field>
            <Field
              label="النطاق الفرعي المقترح"
              htmlFor={`${formId}-subdomain`}
              hint="أحرف إنجليزية صغيرة وأرقام وشرطة فقط."
              className="sm:col-span-2"
            >
              <Input
                id={`${formId}-subdomain`}
                name="subdomain"
                required
                pattern="[a-z0-9-]{3,30}"
                placeholder="ahmed"
                suffix={`.${ROOT_DOMAIN}`}
              />
            </Field>
            <Field label="الخطة" htmlFor={`${formId}-plan`}>
              <Select id={`${formId}-plan`} name="plan" defaultValue={options.plan ?? "pro"}>
                <option value="basic">Basic</option>
                <option value="pro">Pro</option>
              </Select>
            </Field>
            <Field label="القالب المفضّل" htmlFor={`${formId}-template`}>
              <Select id={`${formId}-template`} name="template" defaultValue={options.template ?? "modern"}>
                <option value="modern">Modern — عصري</option>
                <option value="academic">Academic — أكاديمي</option>
                <option value="premium">Premium — فاخر</option>
              </Select>
            </Field>
            <Field label="نبذة عن أكاديميتك" htmlFor={`${formId}-notes`} optional className="sm:col-span-2">
              <Textarea id={`${formId}-notes`} name="notes" placeholder="المادة التي تدرّسها، وعدد الطلاب المتوقع…" />
            </Field>
          </form>
        )}
      </Modal>
    </RequestAcademyContext.Provider>
  );
}

export function useRequestAcademy() {
  const open = useContext(RequestAcademyContext);
  if (!open) throw new Error("useRequestAcademy must be used inside <RequestAcademyProvider>");
  return open;
}

/** Drop-in button that opens the academy request form. */
export function RequestAcademyButton({
  plan,
  template,
  children = "أنشئ أكاديميتك",
  ...props
}: Omit<Extract<ButtonProps, { href?: undefined }>, "children" | "onClick"> &
  OpenOptions & { children?: ReactNode }) {
  const open = useRequestAcademy();
  return (
    <Button {...props} onClick={() => open({ plan, template })}>
      {children}
    </Button>
  );
}
