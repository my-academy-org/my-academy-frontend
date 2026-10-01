import { Footer } from "@/components/marketing/Footer";
import { Navbar } from "@/components/marketing/Navbar";
import { RequestAcademyProvider } from "@/components/marketing/RequestAcademy";

export default function MarketingLayout({ children }: LayoutProps<"/">) {
  return (
    <RequestAcademyProvider>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:shadow-lift"
      >
        تخطَّ إلى المحتوى
      </a>
      <Navbar />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
    </RequestAcademyProvider>
  );
}
