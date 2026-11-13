"use client";

import Link from "next/link";
import { getDict, href } from "@/i18n/config";
import { products } from "@/data/catalog";
import { MiniCard } from "./ProductCard";
import { useUI } from "./Providers";
import { BookmarkIcon } from "./Icons";

export function FavoritesView() {
  const { locale, favorites } = useUI();
  const t = getDict(locale);
  const list = products.filter((p) => favorites.includes(p.sku));

  if (list.length === 0) {
    return (
      <div className="page flex flex-col items-center justify-center px-6 pb-24 pt-20 text-center md:pt-28">
        <BookmarkIcon width={26} height={26} />
        <h1 className="mt-6 text-[20px] font-medium md:text-[22px]">{t.favorites.empty}</h1>
        <p className="mt-3 max-w-[340px] text-[14px] leading-relaxed text-muted">{t.favorites.emptyText}</p>
        <Link href={href(locale, "/catalog/")} className="btn btn-ink mt-7">
          {t.favorites.toCatalog}
        </Link>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container-x pb-24 pt-10 md:pb-32 md:pt-16">
        <div className="flex items-baseline gap-3">
          <h1 className="display text-[48px] md:text-[72px]">{t.favorites.title}</h1>
          <span className="text-[14px] text-muted">{list.length}</span>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-3 md:gap-x-4 xl:grid-cols-4">
          {list.map((p) => (
            <MiniCard key={p.sku} product={p} />
          ))}
        </div>
      </div>
    </div>
  );
}
