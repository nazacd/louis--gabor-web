"use client";

import Link from "next/link";
import { getDict, href } from "@/i18n/config";
import { productPath, sizeRange, type Product } from "@/data/catalog";
import { formatPrice, media } from "@/lib/asset";
import { useUI } from "./Providers";
import { ColorSquares, PairStage, useColor } from "./PairStage";
import { Film } from "./Film";
import { BookmarkIcon } from "./Icons";

export function FavButton({ product, className = "" }: { product: Product; className?: string }) {
  const { locale, isFavorite, toggleFavorite } = useUI();
  const t = getDict(locale).product;
  const fav = isFavorite(product.sku);
  return (
    <button
      type="button"
      aria-label={fav ? t.favRemove : t.favAdd}
      aria-pressed={fav}
      onClick={(e) => {
        e.preventDefault();
        toggleFavorite(product.sku);
      }}
      className={`icon-btn ${className}`}
    >
      <BookmarkIcon width={18} height={18} filled={fav} />
    </button>
  );
}

/**
 * Единая карточка модели: рамка 4:5. Если есть студийный кадр — пара на сцене с переключением цвета,
 * иначе — ролик (или фото в руке) в той же рамке.
 */
export function Tile({ product, tone = "light", sizes = "(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw" }: { product: Product; tone?: "light" | "dark"; sizes?: string }) {
  const { locale } = useUI();
  const [active, setActive] = useColor(product);
  const link = href(locale, productPath(product));
  const cover = product.cover[0];
  const dark = tone === "dark";

  return (
    <article className="@container group relative min-w-0">
      <Link href={link} className="block" aria-label={`${product.name[locale]} ${product.sku}`}>
        {product.studio.length > 0 ? (
          <PairStage product={product} active={active} className="aspect-[4/5]" zoom={1.12} sizes={sizes} />
        ) : product.film ? (
          <Film name={product.film} poster={cover ? media.cover(cover.image).small : undefined} className="aspect-[4/5]" label={product.name[locale]} />
        ) : cover ? (
          <div className="film aspect-[4/5]">
            <img src={media.cover(cover.image).small} alt={product.name[locale]} loading="lazy" />
          </div>
        ) : null}
      </Link>
      <FavButton product={product} className={`absolute right-2 top-2 ${dark || product.studio.length === 0 ? "text-white" : ""}`} />

      <div className="mt-4 flex flex-col gap-1 @[300px]:flex-row @[300px]:items-baseline @[300px]:justify-between @[300px]:gap-4">
        <Link href={link} className={`font-serif text-[16px] sm:text-[18px] leading-tight transition-colors ${dark ? "text-cream hover:text-white" : "hover:text-accent"}`}>
          {product.name[locale]}
        </Link>
        <span className={`price shrink-0 ${dark ? "text-cream" : ""}`}>{formatPrice(product.price, locale)}</span>
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <span className={`label num ${dark ? "text-cream/55" : "text-muted"}`}>
          {product.sku} · {sizeRange(product)}
        </span>
        <ColorSquares product={product} active={active} onChange={product.studio.length > 1 ? setActive : undefined} />
      </div>
    </article>
  );
}
