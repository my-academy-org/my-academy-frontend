import Link from "next/link";
import { academyRoutes } from "@/lib/academy/nav";

/** Unknown page inside an existing academy — rendered within the academy's own Shell. */
export default function AcademyPageNotFound() {
  return (
    <div className="mx-auto max-w-xl px-6 py-28 text-center">
      <p className="text-6xl font-extrabold text-(--accent)" dir="ltr">404</p>
      <h1 className="mt-6 text-2xl font-extrabold sm:text-3xl">الصفحة غير موجودة</h1>
      <p className="mt-3 leading-8 opacity-70">ربما تم نقل الصفحة أو حذفها. يمكنك العودة إلى الرئيسية أو تصفّح الدورات.</p>
      <div className="mt-8 flex justify-center gap-6 font-bold text-(--accent)">
        <Link href={academyRoutes.home} className="hover:underline">الرئيسية</Link>
        <Link href={academyRoutes.courses} className="hover:underline">الدورات</Link>
      </div>
    </div>
  );
}
