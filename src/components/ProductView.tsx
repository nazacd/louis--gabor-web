"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { getDict, href } from "@/i18n/config";
import { site } from "@/data/site";
import { colors, hasStudio, paymentMethods, products, shop, typeName, type ColorKey, type Product } from "@/data/catalog";
import { formatPrice, media } from "@/lib/asset";
import { useUI } from "./Providers";
import { PairStage, Swatches } from "./PairStage";
import { Film } from "./Film";
import { FavButton, Tile } from "./ProductCard";
import { PhoneIcon, TelegramIcon } from "./Icons";

export function ProductView({ product }: { product: Product }) {
  const { locale } = useUI();
  const t = getDict(locale);
  const studio = hasStudio(product);
  const shots = studio ? product.studio : product.cover;
  const [active, setActive] = useState<ColorKey>(shots[0]?.color ?? product.colors[0]);
  const [size, setSize] = useState<number | null>(null);
  const allSizes = Array.from({ length: product.sizes[1] - product.sizes[0] + 1 }, (_, i) => product.sizes[0] + i);
  const photographed = new Set(shots.map((s) => s.color));
  const textOnly = product.colors.filter((c) => !photographed.has(c));
  const activeShot = shots.find((s) => s.color === active);
  const colorName = shots.length ? colors[active].name[locale] : product.colors.map((c) => colors[c].name[locale]).join(", ");
  const message = t.product.message(product.name[locale], product.sku, shots.length ? colors[active].name[locale] : "", size ? String(size) : null);
  const telegram = `${site.telegram}?text=${encodeURIComponent(message)}`;
  const more = [
    ...products.filter((p) => p.sku !== product.sku && p.type === product.type),
    ...products.filter((p) => p.sku !== product.sku && p.type !== product.type),
  ]
    .sort((a, b) => Number(hasStudio(b)) - Number(hasStudio(a)))
    .slice(0, 4);

  // в таблице только то, чего нет выше
  const facts: [string, string][] = [
    ...(shots.length > 0 && product.colors.length > 1 ? ([[t.product.colors, product.colors.map((c) => colors[c].name[locale]).join(", ")]] as [string, string][]) : []),
    ...(product.sole ? ([[t.product.sole, product.sole]] as [string, string][]) : []),
  ];

  // нижняя панель на телефоне появляется, когда основная кнопка ушла вверх
  const cta = useRef<HTMLDivElement>(null);
  const [showBar, setShowBar] = useState(false);
  useEffect(() => {
    const el = cta.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setShowBar(!e.isIntersecting && e.boundingClientRect.top < 0));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div className="page">
      <div className="container-x wrap grid gap-x-16 gap-y-12 pt-6 lg:grid-cols-12 lg:pt-10">
        {/* ---------- Пара ---------- */}
        <div className="lg:col-span-7 lg:row-start-1">
          {studio ? (
            <>
              <PairStage product={product} active={active} className="aspect-[4/3]" sizes="(min-width: 1024px) 58vw, 100vw" priority preload />
              <div className="mt-6">
                <Swatches product={product} active={active} onChange={setActive} size="w-[92px]" />
              </div>
            </>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {activeShot && (
                <div className="relative aspect-[4/5] overflow-hidden">
                  <img src={media.cover(activeShot.image).src} alt={product.name[locale]} className="absolute inset-0 h-full w-full object-cover" />
                </div>
              )}
              {product.film && (
                <Film
                  name={product.film}
                  autoplay
                  glyph={false}
                  label={product.name[locale]}
                  className={activeShot ? "aspect-[4/5]" : "mx-auto aspect-[9/16] w-full max-w-[460px] sm:col-span-2"}
                />
              )}
              {product.cover.length > 1 && (
                <div className="flex gap-3 sm:col-span-2">
                  {product.cover.map((c) => (
                    <button
                      key={c.image}
                      type="button"
                      aria-pressed={c.color === active}
                      aria-label={colors[c.color].name[locale]}
                      onClick={() => setActive(c.color)}
                      className="swatch w-[72px] overflow-hidden"
                    >
                      <img src={media.cover(c.image).small} alt="" className="aspect-square object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ---------- Детали (на телефоне — после блока покупки) ---------- */}
        {studio && activeShot && (
          <div className="order-last grid grid-cols-2 gap-4 lg:order-none lg:col-span-7 lg:row-start-2">
            {([1, 2] as const).map((i) => (
              <div key={i} className="aspect-square max-w-[640px] overflow-hidden">
                <img src={media.detail(activeShot.image, i)} alt="" loading="lazy" className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        )}

        {/* ---------- Информация ---------- */}
        <div className="lg:col-span-5 lg:col-start-8 lg:row-span-2 lg:row-start-1">
          <div className="lg:sticky" style={{ top: "calc(var(--top-offset) + 32px)" }}>
            <div className="flex items-start justify-between gap-4">
              <Link href={href(locale, `/catalog/?t=${product.type}`)} className="label text-muted transition-colors hover:text-accent">
                {typeName(product.type, locale)}
              </Link>
              <FavButton product={product} className="-mr-2 -mt-3" />
            </div>
            <h1 className="display mt-4 text-[48px] md:text-[64px]">{product.name[locale]}</h1>
            <div className="mt-5 flex items-baseline justify-between gap-4 border-b border-line pb-6">
              <span className="label num text-muted">{product.sku}</span>
              <span className="price text-[24px] font-medium">{formatPrice(product.price, locale)}</span>
            </div>

            <div className="mt-6 text-[14px]">
              <span className="text-muted">{shots.length ? t.product.color : t.product.colors}: </span>
              {colorName}
              {shots.length > 0 && textOnly.length > 0 && (
                <span className="text-muted">
                  {" "}
                  · {t.product.otherColors}: {textOnly.map((c) => colors[c].name[locale].toLowerCase()).join(", ")}
                </span>
              )}
            </div>

            <div className="mt-8">
              <div className="label text-muted">{t.product.chooseSize}</div>
              <div className="mt-3 grid border-l border-t border-line [grid-template-columns:repeat(var(--n),minmax(0,1fr))]" style={{ ["--n" as string]: allSizes.length }}>
                {allSizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    aria-pressed={size === s}
                    onClick={() => setSize(size === s ? null : s)}
                    className={`num h-12 border-b border-r border-line text-[14px] transition-colors ${
                      size === s ? "bg-ink text-cream" : "hover:bg-surface"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <p className="mt-3 text-[13px] text-muted">{t.product.sizeHint}</p>

            <div ref={cta} className="mt-8">
              <a href={telegram} target="_blank" rel="noreferrer" className="btn btn-ink w-full">
                <TelegramIcon width={16} height={16} />
                {t.product.order}
              </a>
              <a href={shop.phoneHref} className="mt-4 flex items-center justify-center gap-3 text-[14px] text-muted transition-colors hover:text-ink">
                <PhoneIcon width={15} height={15} />
                {t.product.call}
                <span className="num font-medium text-ink">{shop.phone}</span>
              </a>
            </div>

            <dl className="mt-10 border-t border-line text-[14px]">
              {facts.map(([k, v]) => (
                <div key={k} className="flex justify-between gap-6 border-b border-line py-3.5">
                  <dt className="text-muted">{k}</dt>
                  <dd className="num text-right">{v}</dd>
                </div>
              ))}
              <div className="border-b border-line py-3.5">
                <dt className="text-muted">{t.product.payment}</dt>
                <dd className="mt-1.5 text-[13px] leading-relaxed">{paymentMethods(locale).join(" · ")}</dd>
              </div>
            </dl>

            {studio && product.film && (
              <div className="mt-10">
                <div className="label mb-4 text-muted">{t.product.film}</div>
                <Film name={product.film} glyph={false} autoplay className="aspect-[9/16] w-[220px]" label={product.name[locale]} />
              </div>
            )}
          </div>
        </div>
      </div>

      <div
        className={`mobile-buy fixed inset-x-0 bottom-0 z-40 flex h-14 items-center justify-between gap-4 border-t border-line bg-bg/95 px-4 backdrop-blur transition-transform duration-300 lg:hidden ${
          showBar ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        aria-hidden={!showBar}
        inert={!showBar}
      >
        <span className="price text-[16px] font-medium">{formatPrice(product.price, locale)}</span>
        <a href={telegram} target="_blank" rel="noreferrer" className="btn btn-ink !h-10 !px-5 text-[11px]">
          <TelegramIcon width={14} height={14} />
          {t.product.order}
        </a>
      </div>

      <section className="container-x wrap pb-24 pt-24 md:pb-32 md:pt-32">
        <h2 className="title mb-10 text-[36px] md:text-[48px]">{t.product.more}</h2>
        <div className="grid grid-cols-2 gap-x-4 gap-y-12 lg:grid-cols-4 lg:gap-x-6">
          {more.map((p) => (
            <Tile key={p.sku} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
