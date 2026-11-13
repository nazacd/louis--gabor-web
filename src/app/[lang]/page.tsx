import Link from "next/link";
import { notFound } from "next/navigation";
import { getDict, href, isLocale } from "@/i18n/config";
import { site } from "@/data/site";
import { hasStudio, products, shop, paymentMethods } from "@/data/catalog";
import { media } from "@/lib/asset";
import { HeroStage } from "@/components/HeroStage";
import { FilmCard, StudioCard } from "@/components/ProductCard";
import { Film } from "@/components/Film";
import { Reveal } from "@/components/Reveal";
import { ArrowRight } from "@/components/Icons";

const DETAILS: { image: string; i: 1 | 2 }[] = [
  { image: "y08k11-1-navy", i: 2 },
  { image: "1571-brown", i: 2 },
  { image: "8171-brown", i: 2 },
  { image: "536-navy", i: 2 },
];

export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDict(lang);
  const studio = products.filter(hasStudio);
  const films = products.filter((p) => !hasStudio(p) && p.film).slice(0, 8);

  return (
    <>
      <HeroStage />

      {/* Коллекция */}
      <section className="container-x py-20 md:py-28">
        <div className="mb-10 flex flex-col justify-between gap-4 md:mb-14 md:flex-row md:items-end">
          <div>
            <h2 className="display text-[44px] md:text-[64px]">{t.home.collection}</h2>
            <p className="mt-3 max-w-[460px] text-[15px] text-muted">{t.home.collectionSub}</p>
          </div>
          <Link href={href(lang, "/catalog/")} className="link-arrow">
            {t.home.viewAll}
            <ArrowRight width={22} height={12} />
          </Link>
        </div>
        <div className="grid gap-x-4 gap-y-14 md:grid-cols-2 xl:grid-cols-3">
          {studio.map((p) => (
            <StudioCard key={p.sku} product={p} />
          ))}
        </div>
      </section>

      {/* Детали */}
      <section className="bg-white">
        <div className="container-x py-20 md:py-28">
          <Reveal className="max-w-[560px]">
            <div className="label text-blue">{t.home.detailsKicker}</div>
            <h2 className="display mt-4 text-[38px] md:text-[56px]">{t.home.detailsTitle}</h2>
            <p className="mt-5 text-[15px] leading-relaxed text-muted">{t.home.detailsText}</p>
          </Reveal>
          <div className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            {DETAILS.map((d, k) => (
              <Reveal key={d.image} delay={k * 90}>
                <div className="aspect-square overflow-hidden">
                  <img src={media.detail(d.image, d.i)} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-[1.4s] hover:scale-[1.06]" />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* В движении */}
      <section className="bg-night py-20 text-white md:py-28" id="films">
        <div className="container-x mb-10 flex flex-col justify-between gap-4 md:mb-14 md:flex-row md:items-end">
          <div>
            <div className="label text-white/50">{t.home.filmsKicker}</div>
            <h2 className="display mt-4 text-[38px] md:text-[56px]">{t.home.filmsTitle}</h2>
            <p className="mt-4 max-w-[420px] text-[15px] text-white/60">{t.home.filmsText}</p>
          </div>
          <Link href={href(lang, "/catalog/#films")} className="link-arrow text-white">
            {t.home.viewAll}
            <ArrowRight width={22} height={12} />
          </Link>
        </div>
        <div className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto px-[var(--gutter)] pb-2" style={{ scrollPaddingLeft: "var(--gutter)" }}>
          {films.map((p) => (
            <div key={p.sku} className="w-[62vw] shrink-0 snap-start sm:w-[34vw] lg:w-[19vw]">
              <FilmCard product={p} tone="dark" />
            </div>
          ))}
        </div>
      </section>

      {/* Упаковка */}
      <section className="container-x grid items-center gap-10 py-20 md:grid-cols-12 md:py-28">
        <div className="md:col-span-4 md:col-start-2">
          <Film name="unboxing" autoplay className="mx-auto max-w-[360px] rounded-[2px]" />
        </div>
        <Reveal className="md:col-span-5 md:col-start-7">
          <div className="label text-blue">{t.home.boxKicker}</div>
          <h2 className="display mt-4 text-[38px] md:text-[56px]">{t.home.boxTitle}</h2>
          <p className="mt-5 max-w-[420px] text-[15px] leading-relaxed text-muted">{t.home.boxText}</p>
          <a href={site.telegram} target="_blank" rel="noreferrer" className="btn btn-blue mt-8">
            {t.product.askTelegram}
          </a>
        </Reveal>
      </section>

      {/* Магазины и оплата */}
      <section className="bg-white">
        <div className="container-x grid gap-12 py-20 md:grid-cols-2 md:py-28">
          <div>
            <h2 className="display text-[38px] md:text-[52px]">{t.home.storesTitle}</h2>
            <ul className="mt-8 divide-y divide-line border-y border-line">
              {site.stores.map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-4 py-5">
                  <div>
                    <div className="text-[20px] font-medium">{s.name}</div>
                    <div className="text-[13px] text-muted">{s.city[lang]}</div>
                  </div>
                  <a href={s.map} target="_blank" rel="noreferrer" className="link-arrow text-blue">
                    {t.stores.route}
                    <ArrowRight width={22} height={12} />
                  </a>
                </li>
              ))}
            </ul>
            <a href={shop.phoneHref} className="mt-6 block text-[28px] font-light tracking-tight">
              {shop.phone}
            </a>
          </div>
          <div>
            <div className="label text-muted">{t.home.payTitle}</div>
            <ul className="mt-6 flex flex-wrap gap-2">
              {paymentMethods(lang).map((m) => (
                <li key={m} className="chip pointer-events-none">
                  {m}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
