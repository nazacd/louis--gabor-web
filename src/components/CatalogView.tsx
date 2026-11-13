"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { getDict, href } from "@/i18n/config";
import { colors, hasStudio, products, types, type ColorKey, type Product, type TypeKey } from "@/data/catalog";
import { useUI } from "./Providers";
import { Tile } from "./ProductCard";
import { Reveal } from "./Reveal";

type Sort = "new" | "cheap" | "expensive";

// студийные пары первыми, потом ролики, потом фото с телефона — чтобы сетка не выглядела пёстрой
const tier = (p: Product) => (hasStudio(p) ? 0 : p.film ? 1 : 2);
const SORTS: Sort[] = ["new", "cheap", "expensive"];

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
    else sorted.sort((a, b) => tier(a) - tier(b) || b.post - a.post);
    return sorted;
  }, [type, color, sort]);

  const colorOptions = (Object.keys(colors) as ColorKey[]).filter((c) => products.some((p) => (!type || p.type === type) && p.colors.includes(c)));
  const setType = (k: TypeKey | null) => router.replace(href(locale, k ? `/catalog/?t=${k}` : "/catalog/"), { scroll: false });
  const title = type ? types.find((ty) => ty.key === type)!.name[locale] : t.catalog.title;

  return (
    <div className="page">
      <div className="container-x wrap pt-10 md:pt-16">
        <div className="flex flex-wrap items-baseline gap-x-5 gap-y-2">
          <h1 className="title text-[44px] md:text-[56px]">{title}</h1>
          <span className="label num text-muted">{t.catalog.models(list.length)}</span>
        </div>

        {/* строка 1: разделы */}
        <div className="no-scrollbar -mx-[var(--gutter)] mt-8 overflow-x-auto border-b border-line px-[var(--gutter)] [mask-image:linear-gradient(90deg,#000_82%,transparent)] md:[mask-image:none]">
          <div className="flex w-max gap-8 whitespace-nowrap pr-[var(--gutter)]">
            <button type="button" className="tab" aria-pressed={!type} onClick={() => setType(null)}>
              {t.catalog.all}
            </button>
            {types.map((ty) => (
              <button key={ty.key} type="button" className="tab" aria-pressed={type === ty.key} onClick={() => setType(ty.key)}>
                {ty.name[locale]}
              </button>
            ))}
          </div>
        </div>

        {/* строка 2: цвет слева, сортировка справа */}
        <div className="grid grid-cols-[1fr_auto] items-center gap-4 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="label text-muted sm:hidden">{t.catalog.color}</span>
            <div className="-ml-[6px] flex shrink-0 gap-0.5 sm:gap-1">
              {colorOptions.map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-pressed={color === c}
                  aria-label={colors[c].name[locale]}
                  title={colors[c].name[locale]}
                  onClick={() => setColor(color === c ? null : c)}
                  className="chip-color-btn !h-[28px] !w-[28px] sm:!h-[30px] sm:!w-[30px]"
                >
                  <span className="chip-color !h-[16px] !w-[16px] sm:!h-[18px] sm:!w-[18px]" style={{ background: colors[c].hex }} />
                </button>
              ))}
            </div>
            <span className="hidden truncate text-[13px] text-muted sm:inline">{color ? colors[color].name[locale] : t.catalog.anyColor}</span>
          </div>
          <button
            type="button"
            onClick={() => setSort(SORTS[(SORTS.indexOf(sort) + 1) % SORTS.length])}
            className="tab whitespace-nowrap !text-ink"
            aria-label={t.catalog.sort[sort]}
          >
            {t.catalog.sort[sort]} ↕
          </button>
        </div>
      </div>

      <div className="container-x wrap pb-24 pt-6 md:pb-32">
        {list.length === 0 ? (
          <div className="flex flex-col items-center py-28 text-center">
            <h2 className="title text-[32px]">{t.catalog.empty}</h2>
            <button
              type="button"
              className="btn btn-ink mt-8"
              onClick={() => {
                setColor(null);
                setType(null);
              }}
            >
              {t.catalog.reset}
            </button>
          </div>
        ) : (
          <div className="grid gap-x-3 gap-y-12 sm:gap-x-6 sm:gap-y-14" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(min(260px, 40vw), 1fr))" }}>
            {list.map((p, i) => (
              <Reveal key={`${p.sku}-${type}-${color}-${sort}`} delay={(i % 4) * 60}>
                <Tile product={p} sizes="(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 50vw" />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
