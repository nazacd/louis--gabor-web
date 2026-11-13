import Link from "next/link";
import { notFound } from "next/navigation";
import { getDict, href, isLocale } from "@/i18n/config";
import { site } from "@/data/site";
import { getProduct, hasStudio, products, shop, type Product } from "@/data/catalog";
import { formatPrice, media } from "@/lib/asset";
import { HeroStage } from "@/components/HeroStage";
import { Tile } from "@/components/ProductCard";
import { Film } from "@/components/Film";
import { Reveal } from "@/components/Reveal";
import { DragRail, Parallax } from "@/components/Motion";
import { ArrowRight } from "@/components/Icons";

const FEATURED = ["y08k11-1", "1571", "8171", "273-z"];

export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDict(lang);
  const featured = FEATURED.map(getProduct).filter(Boolean) as Product[];
  const films = products.filter((p) => !hasStudio(p) && p.film);

  return (
    <>
      <HeroStage />

      {/* Коллекция */}
      <section className="container-x wrap py-20 md:py-28">
        <div className="mb-10 flex items-end justify-between gap-6 md:mb-14">
          <h2 className="title text-[40px] md:text-[56px]">{t.home.collection}</h2>
          <Link href={href(lang, "/catalog/")} className="link">
            {t.home.viewAll}
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-12 lg:grid-cols-4 lg:gap-x-6">
          {featured.map((p, i) => (
            <Reveal key={p.sku} delay={i * 60}>
              <Tile product={p} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* Детали */}
      <section className="container-x wrap pb-20 md:pb-28">
        <div className="grid gap-10 md:grid-cols-12 md:gap-8">
          <Reveal className="md:col-span-3">
            <h2 className="title text-[40px] md:text-[56px]">{t.home.details}</h2>
          </Reveal>
          <Reveal delay={60} className="md:col-span-4 md:col-start-4">
            <Parallax src={media.detail("y08k11-1-navy", 1)} className="aspect-[4/5]" />
            <div className="mt-4 flex justify-between gap-4">
              <span className="label text-muted">{t.home.detailEmboss}</span>
              <span className="label num text-faint">Y08K11-1</span>
            </div>
          </Reveal>
          <Reveal delay={160} className="md:col-span-4 md:col-start-9 md:mt-24">
            <Parallax src={media.detail("1571-brown", 2)} className="aspect-[4/5]" />
            <div className="mt-4 flex justify-between gap-4">
              <span className="label text-muted">{t.home.detailMono}</span>
              <span className="label num text-faint">1571</span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* В движении */}
      <section className="bg-espresso py-20 text-cream md:py-28">
        <div className="container-x wrap mb-10 flex items-end justify-between gap-6 md:mb-14">
          <h2 className="title text-[40px] md:text-[56px]">{t.home.films}</h2>
          <Link href={href(lang, "/catalog/")} className="link text-cream">
            {t.home.viewAll}
          </Link>
        </div>
        <DragRail className="gap-4 px-[var(--gutter)] [scroll-padding-inline:var(--gutter)] after:block after:w-px after:shrink-0 md:gap-6">
          {films.map((p) => (
            <Link key={p.sku} href={href(lang, `/catalog/${p.slug}/`)} draggable={false} className="group block w-[62vw] shrink-0 snap-start sm:w-[36vw] lg:w-[min(21vw,320px)]">
              <Film name={p.film!} className="aspect-[9/16]" autoplay glyph={false} label={p.name[lang]} />
              <div className="mt-4 flex items-baseline justify-between gap-4">
                <span className="font-serif text-[18px]">{p.name[lang]}</span>
                <span className="price">{formatPrice(p.price, lang)}</span>
              </div>
              <div className="label num mt-1 text-cream/50">{p.sku}</div>
            </Link>
          ))}
        </DragRail>
      </section>

      {/* Коробка */}
      <section className="container-x wrap grid items-center gap-10 py-20 md:grid-cols-12 md:py-28">
        <Reveal className="md:col-span-4 md:col-start-2">
          <Film name="unboxing" autoplay glyph={false} className="mx-auto aspect-[9/16] max-h-[640px] max-w-[360px]" />
        </Reveal>
        <Reveal delay={120} className="md:col-span-5 md:col-start-7">
          <div className="label text-muted">Louis Gabor</div>
          <h2 className="title mt-5 text-[40px] md:text-[64px]">{t.home.box}</h2>
          <a href={site.telegram} target="_blank" rel="noreferrer" className="link mt-10 inline-flex items-center gap-3">
            {t.product.order}
            <ArrowRight width={22} height={12} />
          </a>
        </Reveal>
      </section>

      {/* Магазины и оплата */}
      <section className="container-x wrap pb-20 md:pb-28">
        <h2 className="title mb-8 text-[40px] md:text-[56px]">{t.home.stores}</h2>
        <div className="border-t border-line">
          {site.stores.map((s) => (
            <a
              key={s.id}
              href={s.map}
              target="_blank"
              rel="noreferrer"
              className="group grid grid-cols-[1fr_auto] items-center gap-4 border-b border-line py-6 md:grid-cols-[1fr_1fr_auto]"
            >
              <span className="font-serif text-[26px] md:text-[32px]">{s.name}</span>
              <span className="hidden text-[14px] text-muted md:block">{s.city[lang]}</span>
              <span className="flex items-center gap-3 text-[12px] font-medium uppercase tracking-[0.12em] transition-colors group-hover:text-accent">
                {t.home.route}
                <ArrowRight width={22} height={12} className="transition-transform duration-500 group-hover:translate-x-1" />
              </span>
            </a>
          ))}
          <div className="grid grid-cols-[1fr_auto] items-center gap-4 border-b border-line py-6 md:grid-cols-[1fr_1fr_auto]">
            <a href={shop.phoneHref} className="num text-[24px] font-medium tracking-tight md:text-[28px]">
              {shop.phone}
            </a>
            <span className="hidden md:block" />
            <a href={site.telegram} target="_blank" rel="noreferrer" className="link">
              Telegram
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
