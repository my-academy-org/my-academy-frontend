import type { Metadata, Viewport } from "next";
import { Amiri, Cairo } from "next/font/google";
import "./globals.css";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  display: "swap",
});

// Used only inside the "Academic" academy template preview.
const amiri = Amiri({
  variable: "--font-amiri",
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "My Academy — منصة إنشاء وإدارة الأكاديميات التعليمية",
    template: "%s · My Academy",
  },
  description:
    "My Academy منصة سحابية تمنح كل معلّم أكاديمية إلكترونية مستقلة بنطاق فرعي خاص وقالب احترافي ولوحة تحكم متكاملة لإدارة الدورات والطلاب والاختبارات.",
};

export const viewport: Viewport = {
  themeColor: "#faf8f3",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${cairo.variable} ${amiri.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
