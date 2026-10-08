import { IBM_Plex_Sans_Arabic } from "next/font/google";
import { Footer } from "@/components/marketing/Footer";
import { Navbar } from "@/components/marketing/Navbar";
import { RequestAcademyProvider } from "@/components/marketing/RequestAcademy";

// Same family as the logo wordmark. Marketing only — the dashboards stay on Cairo.
const plex = IBM_Plex_Sans_Arabic({
  variable: "--font-plex",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export default function MarketingLayout({ children }: LayoutProps<"/">) {
  return (
    <div className={`${plex.variable} marketing flex min-h-full flex-1 flex-col`}>
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
    </div>
  );
}
