import { LogoMark } from "@/components/ui/Logo";
import { PoweredBy } from "./brand";

/** Neutral, platform-branded page for suspended or missing academies. */
export function AcademyUnavailable({ name, missing }: { name?: string; missing?: boolean }) {
  return (
    <main className="grid min-h-dvh place-items-center bg-canvas px-6 text-center">
      <div className="max-w-md">
        <LogoMark className="mx-auto size-12" />
        <h1 className="mt-8 text-2xl font-extrabold text-ink-950 sm:text-3xl">
          {missing ? "لم نعثر على هذه الأكاديمية" : `${name} غير متاحة حالياً`}
        </h1>
        <p className="mt-4 leading-8 text-ink-600">
          {missing
            ? "تأكد من كتابة عنوان الأكاديمية بشكل صحيح، أو تواصل مع معلّمك للحصول على الرابط."
            : "الأكاديمية متوقفة مؤقتاً. يُرجى المحاولة لاحقاً أو التواصل مع المعلّم."}
        </p>
        <PoweredBy className="mt-10 text-sm text-ink-500" />
      </div>
    </main>
  );
}
