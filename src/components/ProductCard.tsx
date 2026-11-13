"use client";

import Link from "next/link";
import { getDict, href } from "@/i18n/config";
import { colors, productPath, sizeRange, type Product } from "@/data/catalog";
import { formatPrice, media } from "@/lib/asset";
import { useUI } from "./Providers";
import { PairStage, Swatches, useColor } from "./PairStage";
import { Film } from "./Film";
import { BookmarkIcon } from "./Icons";

function FavButton({ product, dark = false }: { product: Product; dark?: boolean }) {
  const { locale, isFavorite, toggleFavorite } = useUI();
  const t = getDict(locale).product;
  const fav = isFavorite(product.sku);
  return (
    <button
      type="button"
      aria-label={fav ? t.favRemove : t.favAdd}
      aria-pressed={fav}
      onClick={() => toggleFavorite(product.sku)}
      className={`absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
        fav ? "bg-blue text-white" : dark ? "bg-white/90 text-ink hover:bg-white" : "bg-white/80 text-ink hover:bg-white"
      }`}
    >
      <BookmarkIcon width={16} height={16} filled={fav} />
    </button>
  );
}

function Meta({ product, tone = "light" }: { product: Product; tone?: "light" | "dark" }) {
  const { locale } = useUI();
  const muted = tone === "dark" ? "text-white/55" : "text-muted";
  return (
    <div className="mt-3 flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
      <div className="min-w-0">
        <h3 className={`text-[15px] font-medium leading-snug ${tone === "dark" ? "text-white" : ""}`}>{product.name[locale]}</h3>
        <div className={`sku mt-0.5 text-[12px] ${muted}`}>
          {product.sku} · {sizeRange(product)}
        </div>
      </div>
      <div className={`text-[14px] font-medium sm:shrink-0 ${tone === "dark" ? "text-white" : ""}`}>{formatPrice(product.price, locale)}</div>
    </div>
  );
}

/** Студийная карточка: пара на сцене, цвет переключается мини-вырезками. */
export function StudioCard({ product }: { product: Product }) {
  const { locale } = useUI();
  const [active, setActive] = useColor(product);
  const link = href(locale, productPath(product));
  return (
    <article className="group relative">
      <Link href={link} className="lift block" aria-label={`${product.name[locale]} ${product.sku}`}>
        <PairStage product={product} active={active} sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw" />
      </Link>
      <FavButton product={product} />
      <div className="mt-3">
        <Swatches product={product} active={active} onChange={setActive} size="w-[58px]" />
      </div>
      <Link href={link} className="block">
        <Meta product={product} />
      </Link>
    </article>
  );
}

/** Карточка «в движении»: вертикальный ролик или фото в руке, если оно есть. */
export function FilmCard({ product, tone = "light" }: { product: Product; tone?: "light" | "dark" }) {
  const { locale } = useUI();
  const link = href(locale, productPath(product));
  const cover = product.cover[0];
  return (
    <article className="group relative">
      <Link href={link} className="block" aria-label={`${product.name[locale]} ${product.sku}`}>
        {product.film ? (
          <Film name={product.film} poster={cover ? media.cover(cover.image).small : undefined} label={product.name[locale]} />
        ) : cover ? (
          <div className="film">
            <img src={media.cover(cover.image).small} alt={product.name[locale]} loading="lazy" />
          </div>
        ) : null}
      </Link>
      <FavButton product={product} dark />
      <Link href={link} className="block">
        <Meta product={product} tone={tone} />
        <div className={`mt-1.5 flex gap-1.5 ${tone === "dark" ? "text-white/55" : "text-muted"}`}>
          {product.colors.map((c) => (
            <span key={c} className="h-2.5 w-2.5 rounded-full ring-1 ring-black/10" style={{ background: colors[c].hex }} title={colors[c].name[locale]} />
          ))}
        </div>
      </Link>
    </article>
  );
}

/** Компактная карточка для поиска и избранного — любой тип модели. */
export function MiniCard({ product, onClick }: { product: Product; onClick?: () => void }) {
  const { locale } = useUI();
  const s = product.studio[0];
  const c = product.cover[0];
  return (
    <Link href={href(locale, productPath(product))} onClick={onClick} className="group block">
      <div className="stage aspect-[4/3]">
        {s ? (
          <img src={media.studio(s.image).small} alt={product.name[locale]} className="stage-img" loading="lazy" />
        ) : c ? (
          <img src={media.cover(c.image).small} alt={product.name[locale]} className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
        ) : product.film ? (
          <img src={media.film(product.film).poster} alt={product.name[locale]} className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
        ) : null}
      </div>
      <Meta product={product} />
    </Link>
  );
}

export { FavButton };
