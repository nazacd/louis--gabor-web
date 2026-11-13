import type { Metadata } from "next";
import { getDict, isLocale } from "@/i18n/config";
import { FavoritesView } from "@/components/FavoritesView";

export async function generateMetadata({ params }: PageProps<"/[lang]/favorites">): Promise<Metadata> {
  const { lang } = await params;
  return isLocale(lang) ? { title: getDict(lang).favorites.title } : {};
}

export default function FavoritesPage() {
  return <FavoritesView />;
}
