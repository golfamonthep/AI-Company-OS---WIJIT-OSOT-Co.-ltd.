/**
 * Home — บริษัท วิจิตรโอสถ จำกัด official landing page
 *
 * Design philosophy: Modern Clinical Apothecary
 * - Off-white paper background (--paper) with sage and cream alt-sections
 * - Lime green (--wijit) used as ACCENT, not flooded background
 * - Editorial section numbers & mono trust info
 * - Asymmetric, magazine-like flow:
 *     01 Hero  →  02 About  →  03 Standards (dark)  →  04 Products  →
 *     05 Channels (sage)  →  06 Contact  →  Footer (deep forest)
 */

import SiteHeader from "@/components/SiteHeader";
import Hero from "@/components/Hero";
import AboutSection from "@/components/AboutSection";
import StandardsSection from "@/components/StandardsSection";
import ProductsSection from "@/components/ProductsSection";
import ChannelsSection from "@/components/ChannelsSection";
import ContactSection from "@/components/ContactSection";
import SiteFooter from "@/components/SiteFooter";
import FloatingChannels from "@/components/FloatingChannels";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <AboutSection />
        <StandardsSection />
        <ProductsSection />
        <ChannelsSection />
        <ContactSection />
      </main>
      <SiteFooter />
      <FloatingChannels />
    </div>
  );
}
