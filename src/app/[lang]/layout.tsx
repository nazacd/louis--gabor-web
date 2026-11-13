import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import "@fontsource/prata/400.css";
import "@fontsource-variable/inter-tight";
import "../globals.css";
import { getDict, isLocale, locales } from "@/i18n/config";
import { asset } from "@/lib/asset";
import { Providers } from "@/components/Providers";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Overlays } from "@/components/Overlays";

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = getDict(lang).meta;
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
    title: { default: t.title, template: `%s — Louis Gabor` },
    description: t.description,
    icons: { icon: asset("/icon.svg") },
    openGraph: {
      title: t.title,
      description: t.description,
      images: [asset("/media/og.jpg")],
      locale: lang === "uz" ? "uz_UZ" : "ru_RU",
      type: "website",
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#ece8e1",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return (
    <html lang={lang}>
      <body>
        <Providers locale={lang}>
          <Header />
          <main>{children}</main>
          <Footer locale={lang} />
          <Overlays />
        </Providers>
      </body>
    </html>
  );
}
