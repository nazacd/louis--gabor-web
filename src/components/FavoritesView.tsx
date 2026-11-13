"use client";

import Link from "next/link";
import { getDict, href } from "@/i18n/config";
import { products } from "@/data/catalog";
import { Tile } from "./ProductCard";
import { useUI } from "./Providers";
import { Monogram } from "./Logo";

export function FavoritesView() {
  const { locale, favorites } = useUI();
  const t = getDict(locale);
  const list = products.filter((p) => favorites.includes(p.sku));

  if (list.length === 0) {
    return (
      <div className="page flex flex-col items-center justify-center px-6 pb-28 pt-20 text-center md:pt-32">
        <Monogram className="w-[34px] text-faint" />
        <h1 className="title mt-8 text-[30px] md:text-[36px]">{t.favorites.empty}</h1>
        <p className="mt-4 max-w-[360px] text-[14px] leading-relaxed text-muted">{t.favorites.emptyText}</p>
        <Link href={href(locale, "/catalog/")} className="btn btn-ink mt-9">
          {t.favorites.toCatalog}
        </Link>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container-x wrap pb-24 pt-8 md:pb-32 md:pt-14">
        <div className="flex items-baseline gap-4 border-b border-line pb-6">
          <h1 className="display text-[44px] md:text-[56px]">{t.favorites.title}</h1>
          <span className="label num text-muted">{list.length}</span>
        </div>
        <div className="mt-10 grid gap-x-3 gap-y-12 sm:gap-x-6 sm:gap-y-14" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(min(260px, 40vw), 1fr))" }}>
          {list.map((p) => (
            <Tile key={p.sku} product={p} />
          ))}
        </div>
      </div>
    </div>
  );
}
