"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { getDict, href } from "@/i18n/config";
import { colors, hasStudio, products, types, type ColorKey, type TypeKey } from "@/data/catalog";
import { useUI } from "./Providers";
import { FilmCard, StudioCard } from "./ProductCard";

type Sort = "new" | "cheap" | "expensive";

export function CatalogView() {
  const { locale } = useUI();
  const t = getDict(locale);
  const router = useRouter();
  const params = useSearchParams();
  const raw = params.get("t");
  const type = (types.some((ty) => ty.key === raw) ? raw : null) as TypeKey | null;
  const [color, setColor] = useState<ColorKey | null>(null);
  const [sort, setSort] = useState<Sort>("new");

  // цвет сбрасывается при смене раздела — с вкладок, из меню или подвала
  const [lastType, setLastType] = useState(type);
  if (lastType !== type) {
    setLastType(type);
    setColor(null);
  }

  const list = useMemo(() => {
    const filtered = products.filter((p) => (!type || p.type === type) && (!color || p.colors.includes(color)));
    const sorted = [...filtered];
    if (sort === "cheap") sorted.sort((a, b) => a.price - b.price || b.post - a.post);
    else if (sort === "expensive") sorted.sort((a, b) => b.price - a.price || b.post - a.post);
    else sorted.sort((a, b) => b.post - a.post);
    return sorted;
  }, [type, color, sort]);

  const studio = list.filter(hasStudio);
  const films = list.filter((p) => !hasStudio(p));
  const colorOptions = (Object.keys(colors) as ColorKey[]).filter((c) => products.some((p) => (!type || p.type === type) && p.colors.includes(c)));
  const setType = (k: TypeKey | null) => router.replace(href(locale, k ? `/catalog/?t=${k}` : "/catalog/"), { scroll: false });

  return (
    <div className="page">
      <div className="container-x pt-10 md:pt-16">
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
          <h1 className="display text-[52px] md:text-[88px]">{type ? types.find((ty) => ty.key === type)!.name[locale] : t.catalog.title}</h1>
          <span className="text-[14px] text-muted">{t.catalog.models(list.length)}</span>
        </div>

        <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="no-scrollbar -mx-[var(--gutter)] flex gap-2 overflow-x-auto px-[var(--gutter)]">
            <button type="button" className="chip" aria-pressed={!type} onClick={() => setType(null)}>
              {t.catalog.all}
            </button>
            {types.map((ty) => (
              <button key={ty.key} type="button" className="chip" aria-pressed={type === ty.key} onClick={() => setType(ty.key)}>
                {ty.name[locale]}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="label mr-1 text-muted">{t.catalog.color}</span>
            {colorOptions.map((c) => (
              <button
                key={c}
                type="button"
                className="chip !h-9 !px-3"
                aria-pressed={color === c}
                onClick={() => setColor(color === c ? null : c)}
              >
                <span className="h-3 w-3 rounded-full ring-1 ring-black/15" style={{ background: colors[c].hex }} />
                {colors[c].name[locale]}
              </button>
            ))}
            <label className="ml-1 flex items-center">
              <span className="sr-only">{t.catalog.sort}</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as Sort)}
                className="h-9 rounded-full border border-line bg-white px-3 text-[13px] font-medium outline-none focus:border-ink"
              >
                <option value="new">{t.catalog.sortDefault}</option>
                <option value="cheap">{t.catalog.sortCheap}</option>
                <option value="expensive">{t.catalog.sortExpensive}</option>
              </select>
            </label>
          </div>
        </div>
      </div>

      {list.length === 0 ? (
        <div className="container-x flex flex-col items-center py-28 text-center">
          <h2 className="display text-[32px]">{t.catalog.empty}</h2>
          <p className="mt-3 text-[14px] text-muted">{t.catalog.emptyText}</p>
          <button
            type="button"
            className="btn btn-ink mt-7"
            onClick={() => {
              setColor(null);
              setType(null);
            }}
          >
            {t.catalog.reset}
          </button>
        </div>
      ) : (
        <>
          {studio.length > 0 && (
            <section className="container-x pt-12 md:pt-16">
              <div className="mb-8 flex items-baseline gap-3 border-t border-line pt-5">
                <h2 className="text-[20px] font-semibold">{t.catalog.studio}</h2>
                <span className="text-[13px] text-muted">{t.catalog.studioSub}</span>
              </div>
              <div className="grid gap-x-4 gap-y-14 md:grid-cols-2 xl:grid-cols-3">
                {studio.map((p) => (
                  <StudioCard key={p.sku} product={p} />
                ))}
              </div>
            </section>
          )}
          {films.length > 0 && (
            <section id="films" className="container-x scroll-mt-[calc(var(--top-offset)+16px)] pb-24 pt-16 md:pb-32 md:pt-24">
              <div className="mb-8 flex items-baseline gap-3 border-t border-line pt-5">
                <h2 className="text-[20px] font-semibold">{t.catalog.films}</h2>
                <span className="text-[13px] text-muted">{t.catalog.filmsSub}</span>
              </div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-3 md:gap-x-4 lg:grid-cols-4 xl:grid-cols-5">
                {films.map((p) => (
                  <FilmCard key={p.sku} product={p} />
                ))}
              </div>
            </section>
          )}
          {films.length === 0 && <div className="pb-24 md:pb-32" />}
        </>
      )}
    </div>
  );
}
