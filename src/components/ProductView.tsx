"use client";

import Link from "next/link";
import { useState } from "react";
import { getDict, href } from "@/i18n/config";
import { colors, hasStudio, products, sizeRange, typeName, type ColorKey, type Product, paymentMethods } from "@/data/catalog";
import { formatPrice, media } from "@/lib/asset";
import { useUI } from "./Providers";
import { PairStage, Swatches } from "./PairStage";
import { Film } from "./Film";
import { MiniCard } from "./ProductCard";
import { TelegramButton } from "./TelegramButton";
import { BookmarkIcon } from "./Icons";

export function ProductView({ product }: { product: Product }) {
  const { locale, requestCart, isFavorite, toggleFavorite } = useUI();
  const t = getDict(locale);
  const studio = hasStudio(product);
  const shots = studio ? product.studio : product.cover;
  const [active, setActive] = useState<ColorKey>(shots[0]?.color ?? product.colors[0]);
  const [size, setSize] = useState<number | null>(null);
  const [nudge, setNudge] = useState(false);
  const fav = isFavorite(product.sku);
  const allSizes = Array.from({ length: product.sizes[1] - product.sizes[0] + 1 }, (_, i) => product.sizes[0] + i);
  const photographed = new Set(shots.map((s) => s.color));
  const textOnly = product.colors.filter((c) => !photographed.has(c));
  const activeShot = shots.find((s) => s.color === active);
  const more = [
    ...products.filter((p) => p.sku !== product.sku && p.type === product.type),
    ...products.filter((p) => p.sku !== product.sku && p.type !== product.type),
  ]
    .sort((a, b) => Number(hasStudio(b)) - Number(hasStudio(a)))
    .slice(0, 4);

  const buy = () => {
    if (!size) {
      setNudge(true);
      window.setTimeout(() => setNudge(false), 900);
      return;
    }
    requestCart({ productId: product.sku, size: String(size) });
  };

  const facts: [string, string][] = [
    [t.product.sku, product.sku],
    [t.product.type, typeName(product.type, locale)],
    [t.product.sizes, sizeRange(product)],
    [t.product.colors, product.colors.map((c) => colors[c].name[locale]).join(", ")],
    ...(product.sole ? ([[t.product.sole, product.sole]] as [string, string][]) : []),
  ];

  return (
    <div className="page">
      <div className="container-x grid gap-10 pt-6 lg:grid-cols-12 lg:gap-12 lg:pt-10">
        {/* ---------- Пара ---------- */}
        <div className="lg:col-span-7">
          {studio ? (
            <>
              <PairStage product={product} active={active} sizes="(min-width: 1024px) 58vw, 100vw" priority />
              <div className="mt-3">
                <Swatches product={product} active={active} onChange={setActive} size="w-[84px]" />
              </div>
              {activeShot && (
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {([1, 2] as const).map((i) => (
                    <div key={i} className="aspect-square overflow-hidden bg-white">
                      <img src={media.detail(activeShot.image, i)} alt="" loading="lazy" className="h-full w-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {activeShot && (
                <div className="relative aspect-[4/5] overflow-hidden bg-white">
                  <img src={media.cover(activeShot.image).src} alt={product.name[locale]} className="absolute inset-0 h-full w-full object-cover" />
                </div>
              )}
              {product.film && <Film name={product.film} autoplay label={product.name[locale]} className={activeShot ? "" : "mx-auto w-full max-w-[420px] sm:col-span-2"} />}
              {product.cover.length > 1 && (
                <div className="flex gap-1.5 sm:col-span-2">
                  {product.cover.map((c) => (
                    <button
                      key={c.image}
                      type="button"
                      aria-pressed={c.color === active}
                      aria-label={colors[c.color].name[locale]}
                      onClick={() => setActive(c.color)}
                      className="swatch w-[64px] overflow-hidden"
                    >
                      <img src={media.cover(c.image).small} alt="" className="aspect-square object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ---------- Информация ---------- */}
        <div className="lg:col-span-5">
          <div className="lg:sticky" style={{ top: "calc(var(--top-offset) + 24px)" }}>
            <Link href={href(locale, `/catalog/?t=${product.type}`)} className="label text-blue">
              {typeName(product.type, locale)}
            </Link>
            <h1 className="display mt-3 text-[44px] md:text-[56px]">{product.name[locale]}</h1>
            <div className="sku mt-2 text-[14px] text-muted">
              {t.product.sku} {product.sku}
            </div>
            <div className="mt-6 text-[26px] font-light tracking-tight">{formatPrice(product.price, locale)}</div>

            <div className="mt-6 text-[14px]">
              {shots.length > 0 ? (
                <>
                  <span className="text-muted">{t.product.color}: </span>
                  {colors[active].name[locale]}
                </>
              ) : (
                <>
                  <span className="text-muted">{t.product.colors}: </span>
                  {product.colors.map((c) => colors[c].name[locale]).join(", ")}
                </>
              )}
              {shots.length > 0 && textOnly.length > 0 && (
                <div className="mt-1 text-[13px] text-muted">
                  {t.product.otherColors}: {textOnly.map((c) => colors[c].name[locale]).join(", ")}
                </div>
              )}
            </div>

            <div className="mt-6">
              <div className={`label transition-colors ${nudge ? "text-blue" : "text-muted"}`}>{t.product.chooseSize}</div>
              <div className="mt-3 grid grid-cols-4 gap-1.5 sm:grid-cols-8">
                {allSizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    aria-pressed={size === s}
                    onClick={() => setSize(s)}
                    className={`h-11 rounded-full border text-[14px] font-medium transition-colors ${
                      size === s ? "border-ink bg-ink text-white" : nudge ? "border-blue" : "border-line bg-white hover:border-ink"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <button type="button" onClick={buy} className="btn btn-ink flex-1">
                {t.product.addToCart}
                {size ? ` · ${size}` : ""}
              </button>
              <button
                type="button"
                aria-label={fav ? t.product.favRemove : t.product.favAdd}
                aria-pressed={fav}
                onClick={() => toggleFavorite(product.sku)}
                className={`flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full border transition-colors ${
                  fav ? "border-blue bg-blue text-white" : "border-line bg-white hover:border-ink"
                }`}
              >
                <BookmarkIcon filled={fav} />
              </button>
            </div>
            <TelegramButton className="btn btn-line mt-2 w-full">{t.product.askTelegram}</TelegramButton>

            <dl className="mt-8 divide-y divide-line border-y border-line text-[14px]">
              {facts.map(([k, v]) => (
                <div key={k} className="flex justify-between gap-6 py-3">
                  <dt className="text-muted">{k}</dt>
                  <dd className="sku text-right">{v}</dd>
                </div>
              ))}
              <div className="py-3">
                <dt className="text-muted">{t.product.payment}</dt>
                <dd className="mt-1.5 text-[13px] leading-relaxed">{paymentMethods(locale).join(" · ")}</dd>
              </div>
            </dl>

            {studio && product.film && (
              <div className="mt-8">
                <div className="label mb-3 text-muted">{t.product.film}</div>
                <Film name={product.film} className="w-[200px]" label={product.name[locale]} />
              </div>
            )}
          </div>
        </div>
      </div>

      <section className="container-x pb-24 pt-20 md:pb-32 md:pt-28">
        <h2 className="display mb-8 text-[32px] md:text-[44px]">{t.product.more}</h2>
        <div className="grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-4 md:gap-x-4">
          {more.map((p) => (
            <MiniCard key={p.sku} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
