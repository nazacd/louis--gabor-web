import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, locales } from "@/i18n/config";
import { getProduct, products } from "@/data/catalog";
import { media } from "@/lib/asset";
import { ProductView } from "@/components/ProductView";

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.flatMap((lang) => products.map((p) => ({ lang, slug: p.slug })));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/catalog/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  const product = getProduct(slug);
  if (!product || !isLocale(lang)) return {};
  const image = product.studio[0] ? media.studio(product.studio[0].image).src : product.cover[0] ? media.cover(product.cover[0].image).src : undefined;
  return {
    title: `${product.name[lang]} ${product.sku}`,
    openGraph: image ? { images: [image] } : undefined,
  };
}

export default async function ProductPage({ params }: PageProps<"/[lang]/catalog/[slug]">) {
  const { lang, slug } = await params;
  const product = getProduct(slug);
  if (!product || !isLocale(lang)) notFound();
  return <ProductView key={product.sku} product={product} />;
}
