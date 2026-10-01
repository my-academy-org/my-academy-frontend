import { AcademyWebsites } from "@/components/marketing/AcademyWebsites";
import { Dashboards } from "@/components/marketing/Dashboards";
import { Faq } from "@/components/marketing/Faq";
import { Features } from "@/components/marketing/Features";
import { FinalCta } from "@/components/marketing/FinalCta";
import { Hero } from "@/components/marketing/Hero";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { PlatformOverview } from "@/components/marketing/PlatformOverview";
import { Pricing } from "@/components/marketing/Pricing";
import { Templates } from "@/components/marketing/Templates";

export default function HomePage() {
  return (
    <>
      <Hero />
      <PlatformOverview />
      <Features />
      <AcademyWebsites />
      <Templates />
      <Dashboards />
      <Pricing />
      <HowItWorks />
      <Faq />
      <FinalCta />
    </>
  );
}
