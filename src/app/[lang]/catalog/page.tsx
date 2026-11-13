import type { Metadata } from "next";
import { Suspense } from "react";
import { getDict, isLocale } from "@/i18n/config";
import { CatalogView } from "@/components/CatalogView";

export async function generateMetadata({ params }: PageProps<"/[lang]/catalog">): Promise<Metadata> {
  const { lang } = await params;
  return isLocale(lang) ? { title: getDict(lang).catalog.title } : {};
}

export default function CatalogPage() {
  return (
    <Suspense fallback={<div className="page" />}>
      <CatalogView />
    </Suspense>
  );
}
