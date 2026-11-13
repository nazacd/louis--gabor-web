"use client";

import Link from "next/link";
import { useState } from "react";
import { getDict, href } from "@/i18n/config";
import { getProduct, productPath, type ColorKey, type Product } from "@/data/catalog";
import { formatPrice } from "@/lib/asset";
import { useUI } from "./Providers";
import { PairStage, Swatches } from "./PairStage";
import { ArrowRight } from "./Icons";

const HERO = ["1571", "y08k11-1", "273-z"].map(getProduct).filter(Boolean) as Product[];

export function HeroStage() {
  const { locale } = useUI();
  const t = getDict(locale);
  const [index, setIndex] = useState(0);
  const [color, setColor] = useState<Record<string, ColorKey>>(() => Object.fromEntries(HERO.map((p) => [p.sku, p.studio[0].color])));
  const product = HERO[index];
  const [visited, setVisited] = useState<number[]>([0]);
  if (!visited.includes(index)) setVisited([...visited, index]);
  const active = color[product.sku];

  return (
    <section className="relative overflow-hidden" style={{ background: "var(--stage)" }}>
      <div className="container-x grid min-h-[100svh] items-center gap-6 pb-10 pt-[calc(var(--top-offset)+24px)] lg:grid-cols-12 lg:gap-8 lg:pb-16">
        <div className="rise order-2 lg:order-1 lg:col-span-4">
          <div className="label text-blue">{t.hero.kicker}</div>
          <h1 className="display mt-4 text-[56px] md:text-[88px] lg:text-[96px]">{t.hero.title}</h1>
          <p className="mt-5 max-w-[340px] text-[15px] leading-relaxed text-muted">{t.hero.text}</p>
          <Link href={href(locale, "/catalog/")} className="btn btn-ink mt-8">
            {t.hero.cta}
            <ArrowRight width={22} height={12} />
          </Link>
        </div>

        <div className="order-1 lg:order-2 lg:col-span-8">
          <div className="relative">
            {HERO.map((p, i) => visited.includes(i) && (
              <div key={p.sku} className={`transition-opacity duration-500 ${i === index ? "relative opacity-100" : "pointer-events-none absolute inset-0 opacity-0"}`}>
                <PairStage product={p} active={color[p.sku]} className="aspect-[4/3] !bg-none" sizes="(min-width: 1024px) 66vw, 100vw" priority={i === 0} preload />
              </div>
            ))}
          </div>

          <div className="mt-2 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="flex gap-1" role="tablist">
                {HERO.map((p, i) => (
                  <button
                    key={p.sku}
                    type="button"
                    role="tab"
                    aria-selected={i === index}
                    onClick={() => setIndex(i)}
                    className={`rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition-colors ${
                      i === index ? "bg-ink text-white" : "text-muted hover:text-ink"
                    }`}
                  >
                    {p.name[locale]}
                  </button>
                ))}
              </div>
              <div className="mt-3">
                <Swatches product={product} active={active} onChange={(c) => setColor((m) => ({ ...m, [product.sku]: c }))} size="w-[76px]" />
              </div>
            </div>
            <Link href={href(locale, productPath(product))} className="link-arrow self-start md:self-auto">
              <span className="sku text-muted">{product.sku}</span>
              <span>{formatPrice(product.price, locale)}</span>
              <ArrowRight width={22} height={12} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
