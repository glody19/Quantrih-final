import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a href="#contenu" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-navy focus:px-4 focus:py-2 focus:text-ivory">
        Aller au contenu
      </a>
      <Header />
      <main id="contenu">{children}</main>
      <Footer />
    </>
  );
}
