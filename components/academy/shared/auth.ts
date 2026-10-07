import { ROOT_DOMAIN } from "@/lib/academy/config";
import { academyRoutes } from "@/lib/academy/nav";

export type AuthMode = "login" | "register" | "forgot";

/** Copy for the auth pages — shared so every template says the same thing. */
export const authCopy: Record<
  AuthMode,
  { title: string; subtitle: (academy: string) => string; switchText?: string; switchLabel?: string; switchHref?: string }
> = {
  login: {
    title: "تسجيل الدخول",
    subtitle: (a) => `ادخل إلى حسابك في ${a} لمتابعة دوراتك.`,
    switchText: "طالب جديد؟",
    switchLabel: "أنشئ حسابك",
    switchHref: academyRoutes.register,
  },
  register: {
    title: "إنشاء حساب طالب",
    subtitle: (a) => `سجّل في ${a} وابدأ التعلّم بعد تفعيل دورتك بكود التسجيل.`,
    switchText: "لديك حساب بالفعل؟",
    switchLabel: "سجّل الدخول",
    switchHref: academyRoutes.login,
  },
  forgot: {
    title: "استعادة كلمة المرور",
    subtitle: () => "أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور.",
    switchText: "تذكّرت كلمة المرور؟",
    switchLabel: "العودة لتسجيل الدخول",
    switchHref: academyRoutes.login,
  },
};

/** Why a student sign-in failed. `other-academy`: the account isn't a student of the academy being visited. */
export const loginErrors = {
  invalid: "البريد الإلكتروني أو كلمة المرور غير صحيحة",
  "account-suspended": "حسابك موقوف حالياً. تواصل مع إدارة الأكاديمية.",
  unavailable: "تعذّر تسجيل الدخول الآن. حاول مرة أخرى بعد قليل.",
  "other-academy": "هذا الحساب غير مسجّل كطالب في هذه الأكاديمية.",
} as const;

/** Academy owners don't sign in here: they manage their academy from the platform (ROOT_DOMAIN/login → /dashboard). */
export const TEACHER_LOGIN_NOTE = `صاحب الأكاديمية؟ سجّل الدخول إلى لوحة التحكم من منصة My Academy على ${ROOT_DOMAIN}/login`;
