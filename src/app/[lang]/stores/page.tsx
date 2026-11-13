import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDict, isLocale } from "@/i18n/config";
import { site } from "@/data/site";
import { shop, paymentMethods } from "@/data/catalog";
import { Film } from "@/components/Film";
import { ArrowRight, PhoneIcon } from "@/components/Icons";

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
      <div className="container-x grid gap-12 pb-24 pt-10 md:pb-32 md:pt-16 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <h1 className="display text-[56px] md:text-[96px]">{t.stores.title}</h1>
          <p className="mt-5 max-w-[460px] text-[15px] leading-relaxed text-muted">{t.stores.text}</p>

          <ul className="mt-10 divide-y divide-line border-y border-line">
            {site.stores.map((s, i) => (
              <li key={s.id} className="grid grid-cols-[48px_1fr] gap-4 py-7 md:grid-cols-[64px_1fr_auto] md:items-center">
                <span className="sku text-[14px] text-faint">0{i + 1}</span>
                <div>
                  <div className="text-[26px] font-medium tracking-tight md:text-[32px]">{s.name}</div>
                  <div className="text-[14px] text-muted">{s.city[lang]}</div>
                </div>
                <a href={s.map} target="_blank" rel="noreferrer" className="btn btn-line col-start-2 justify-self-start md:col-start-auto">
                  {t.stores.route}
                  <ArrowRight width={22} height={12} />
                </a>
              </li>
            ))}
          </ul>

          <div className="mt-10 flex flex-wrap gap-2">
            <a href={shop.phoneHref} className="btn btn-ink">
              <PhoneIcon width={17} height={17} />
              {shop.phone}
            </a>
            <a href={site.telegram} target="_blank" rel="noreferrer" className="btn btn-blue">
              {t.product.askTelegram}
            </a>
            <a href={site.telegramChannel} target="_blank" rel="noreferrer" className="btn btn-line">
              {t.stores.channel}
            </a>
          </div>

          <div className="mt-12">
            <div className="label text-muted">{t.home.payTitle}</div>
            <ul className="mt-4 flex flex-wrap gap-2">
              {paymentMethods(lang).map((m) => (
                <li key={m} className="chip pointer-events-none">
                  {m}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="lg:col-span-4 lg:col-start-9">
          <Film name="stand" autoplay className="mx-auto max-w-[380px]" />
        </div>
      </div>
    </div>
  );
}
