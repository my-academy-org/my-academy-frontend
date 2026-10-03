"use client";

import { useState } from "react";
import { requestOwnerOtpAction, verifyOwnerOtpAction } from "@/lib/admin/actions";
import { Notice } from "@/components/dashboard/ui";
import { useToast } from "@/components/dashboard/Toaster";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { EMAIL_RE } from "@/lib/admin/meta";
import type { AdminAcademy } from "@/lib/admin/types";

export type OwnerlessAcademy = Pick<AdminAcademy, "id" | "tenantId" | "name" | "status">;

/**
 * Adds an academy's owner in the API's two steps: the owner's details send a
 * 5-minute OTP to their email, then the OTP creates the account and emails the
 * credentials. Remount (change `key`) to reset it between uses.
 */
export function AddOwnerDialog({
  open,
  onClose,
  academies,
  fixed,
}: {
  open: boolean;
  onClose: () => void;
  /** Academies without an owner. */
  academies: OwnerlessAcademy[];
  /** The academy is already chosen (opened from its details page). */
  fixed?: boolean;
}) {
  const notify = useToast();
  // Only an active academy can receive an owner.
  const eligible = academies.filter((a) => a.status === "ACTIVE");
  const [step, setStep] = useState<"details" | "otp">("details");
  const [tenantId, setTenantId] = useState(eligible.length === 1 ? String(eligible[0].tenantId) : "");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [errors, setErrors] = useState<{ tenantId?: string; name?: string; email?: string; otp?: string; form?: string }>({});
  const [busy, setBusy] = useState(false);

  const academy = eligible.find((a) => String(a.tenantId) === tenantId);

  const sendOtp = async () => {
    const next: typeof errors = {};
    if (!academy) next.tenantId = "اختر الأكاديمية";
    if (name.trim().length < 3) next.name = "أدخل الاسم الكامل";
    if (!EMAIL_RE.test(email.trim())) next.email = "أدخل بريداً إلكترونياً صحيحاً";
    setErrors(next);
    if (!academy || Object.keys(next).length) return;

    setBusy(true);
    const result = await requestOwnerOtpAction(academy.tenantId, { name: name.trim(), email: email.trim() });
    setBusy(false);
    // A code sent less than 5 minutes ago is still valid: go on to enter it.
    if (result.ok || result.raw.includes("OTP already sent")) {
      setErrors({});
      setStep("otp");
      if (!result.ok) notify(result.message, "error");
      return;
    }
    setErrors({ form: result.message });
  };

  const verify = async () => {
    if (!/^\d{4,8}$/.test(otp.trim())) return setErrors({ otp: "أدخل رمز التحقق المرسل إلى البريد" });
    setBusy(true);
    const result = await verifyOwnerOtpAction({ email: email.trim(), otp: otp.trim() });
    setBusy(false);
    if (!result.ok) return setErrors({ otp: result.message });
    notify(`تم إنشاء حساب ${name.trim()} وإرسال بيانات الدخول إلى بريده`);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="إضافة مالك أكاديمية"
      description={step === "details" ? "حساب ACADEMY_ADMIN جديد لأكاديمية ليس لها مالك." : "أدخل رمز التحقق لإتمام إنشاء الحساب."}
      footer={
        eligible.length === 0 ? (
          <Button variant="secondary" onClick={onClose}>
            إغلاق
          </Button>
        ) : (
          <>
            {step === "otp" ? (
              <Button variant="ghost" disabled={busy} onClick={() => setStep("details")}>
                رجوع
              </Button>
            ) : (
              <Button variant="ghost" onClick={onClose}>
                إلغاء
              </Button>
            )}
            <Button type="submit" form="add-owner-form" disabled={busy}>
              {busy ? "جارٍ التنفيذ…" : step === "details" ? "إرسال رمز التحقق" : "تأكيد وإنشاء الحساب"}
            </Button>
          </>
        )
      }
    >
      {eligible.length === 0 ? (
        <Notice tone="info">
          {academies.length
            ? "الأكاديميات التي بلا مالك غير نشطة. فعّل الأكاديمية أولاً ثم أضف مالكها."
            : "كل الأكاديميات لها مالك. أنشئ أكاديمية جديدة ثم أضف مالكها."}
        </Notice>
      ) : (
        <form
          id="add-owner-form"
          noValidate
          className="grid gap-5"
          onSubmit={(e) => {
            e.preventDefault();
            void (step === "details" ? sendOtp() : verify());
          }}
        >
          {step === "details" ? (
            <>
              {errors.form && (
                <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm leading-6 text-red-700 ring-1 ring-red-100">
                  {errors.form}
                </p>
              )}
              <Field label="الأكاديمية" htmlFor="owner-academy" error={errors.tenantId} hint={fixed ? undefined : "تظهر هنا الأكاديميات النشطة التي ليس لها مالك."}>
                <Select id="owner-academy" value={tenantId} disabled={fixed} onChange={(e) => setTenantId(e.target.value)} aria-invalid={!!errors.tenantId}>
                  <option value="" disabled>
                    اختر الأكاديمية…
                  </option>
                  {eligible.map((a) => (
                    <option key={a.id} value={a.tenantId}>
                      {a.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="الاسم الكامل" htmlFor="owner-name" error={errors.name}>
                <Input id="owner-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="مثال: م. أحمد سامي" aria-invalid={!!errors.name} />
              </Field>
              <Field label="البريد الإلكتروني" htmlFor="owner-email" error={errors.email} hint="يُستخدم لتسجيل الدخول إلى لوحة الأكاديمية.">
                <Input
                  id="owner-email"
                  type="email"
                  dir="ltr"
                  className="text-start"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  aria-invalid={!!errors.email}
                />
              </Field>
              <Notice tone="info">يُرسَل رمز تحقق إلى بريد المالك صالح لمدة 5 دقائق. اطلبه منه ثم أدخله في الخطوة التالية.</Notice>
            </>
          ) : (
            <>
              <Notice tone="info">
                أُرسل رمز التحقق إلى <bdi className="font-semibold text-ink-900">{email.trim()}</bdi> وهو صالح لمدة 5 دقائق.
              </Notice>
              <Field label="رمز التحقق (OTP)" htmlFor="owner-otp" error={errors.otp}>
                <Input
                  id="owner-otp"
                  dir="ltr"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  className="text-start font-mono tracking-widest"
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value.replace(/\D/g, ""));
                    setErrors({});
                  }}
                  placeholder="123456"
                  aria-invalid={!!errors.otp}
                  autoFocus
                />
              </Field>
              <p className="text-xs leading-5 text-ink-500">
                أو أرسل للمالك{" "}
                <a href={`/verify-otp?email=${encodeURIComponent(email.trim())}`} target="_blank" rel="noreferrer" className="font-semibold text-brand-700 hover:text-brand-800">
                  صفحة تأكيد البريد
                </a>{" "}
                ليُدخل الرمز بنفسه.
              </p>
              <p className="text-xs leading-5 text-ink-500">
                بعد التأكيد يُنشأ الحساب بحالة «بانتظار الدخول» وتُرسل بيانات الدخول إلى بريد المالك، ويصبح نشطاً عند أول تسجيل دخول.
              </p>
            </>
          )}
        </form>
      )}
    </Modal>
  );
}
