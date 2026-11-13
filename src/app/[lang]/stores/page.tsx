import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDict, isLocale } from "@/i18n/config";
import { site } from "@/data/site";
import { shop, paymentMethods } from "@/data/catalog";
import { Film } from "@/components/Film";
import { ArrowRight } from "@/components/Icons";

export async function generateMetadata({ params }: PageProps<"/[lang]/stores">): Promise<Metadata> {
  const { lang } = await params;
  return isLocale(lang) ? { title: getDict(lang).stores.title } : {};
}

export default async function StoresPage({ params }: PageProps<"/[lang]/stores">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDict(lang);

  return (
    <div className="page">
      <div className="container-x wrap grid gap-14 pb-24 pt-8 md:pb-32 md:pt-14 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-7">
          <div className="label text-muted">{t.stores.city}</div>
          <h1 className="display mt-4 text-[56px] md:text-[88px]">{t.stores.title}</h1>

          <ul className="mt-12 border-t border-ink">
            {site.stores.map((s, i) => (
              <li key={s.id} className="border-b border-line">
                <a
                  href={s.map}
                  target="_blank"
                  rel="noreferrer"
                  className="group grid grid-cols-[40px_1fr_auto] items-baseline gap-4 py-7 md:grid-cols-[64px_1fr_auto] md:py-9"
                >
                  <span className="num label text-faint">0{i + 1}</span>
                  <span>
                    <span className="title block text-[30px] transition-colors group-hover:text-accent md:text-[40px]">{s.name}</span>
                    <span className="mt-1 block text-[14px] text-muted">{s.city[lang]}</span>
                  </span>
                  <span className="label flex items-center gap-3 text-muted transition-colors group-hover:text-ink">
                    <span className="hidden sm:inline">{t.stores.route}</span>
                    <ArrowRight width={22} height={12} />
                  </span>
                </a>
              </li>
            ))}
          </ul>

          <dl className="mt-12 text-[14px]">
            <div className="flex items-baseline justify-between gap-6 border-b border-line py-4">
              <dt className="text-muted">{t.stores.phone}</dt>
              <dd>
                <a href={shop.phoneHref} className="num text-[20px] font-medium tracking-tight">
                  {shop.phone}
                </a>
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-6 border-b border-line py-4">
              <dt className="text-muted">Telegram</dt>
              <dd className="flex flex-wrap justify-end gap-x-6 gap-y-1">
                <a href={site.telegram} target="_blank" rel="noreferrer" className="link">
                  {t.stores.telegram}
                </a>
                <a href={site.telegramChannel} target="_blank" rel="noreferrer" className="link">
                  {t.stores.channel}
                </a>
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-6 border-b border-line py-4">
              <dt className="shrink-0 text-muted">{t.home.payment}</dt>
              <dd className="text-right">{paymentMethods(lang).join(" · ")}</dd>
            </div>
          </dl>
        </div>
        <div className="lg:col-span-4 lg:col-start-9">
          <Film name="stand" autoplay glyph={false} className="mx-auto aspect-[9/16] max-w-[400px]" />
        </div>
      </div>
    </div>
  );
}
