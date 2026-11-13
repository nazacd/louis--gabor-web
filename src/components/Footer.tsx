import Link from "next/link";
import { getDict, href, type Locale } from "@/i18n/config";
import { site } from "@/data/site";
import { paymentMethods, shop, types } from "@/data/catalog";
import { Monogram } from "./Logo";

export function Footer({ locale }: { locale: Locale }) {
  const t = getDict(locale);
  return (
    <footer className="bg-espresso text-cream/60">
      <div className="container-x wrap grid gap-12 py-20 md:grid-cols-12 md:py-28">
        <div className="md:col-span-5">
          <Monogram className="w-[40px] text-cream" />
          <div className="display mt-8 text-[48px] text-cream md:text-[72px]">Louis Gabor</div>
          <div className="label mt-4">{t.footer.tagline}</div>
        </div>

        <div className="md:col-span-3 md:col-start-7">
          <div className="label mb-5 text-cream">{t.nav.catalog}</div>
          <ul className="space-y-2.5 text-[14px]">
            {types.map((ty) => (
              <li key={ty.key}>
                <Link href={href(locale, `/catalog/?t=${ty.key}`)} className="transition-colors hover:text-cream">
                  {ty.name[locale]}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-3">
          <div className="label mb-5 text-cream">{t.nav.stores}</div>
          <ul className="space-y-2.5 text-[14px]">
            {site.stores.map((s) => (
              <li key={s.id}>
                <a href={s.map} target="_blank" rel="noreferrer" className="transition-colors hover:text-cream">
                  {s.name}
                </a>
              </li>
            ))}
            <li className="pt-3">
              <a href={shop.phoneHref} className="num text-[20px] font-medium tracking-tight text-cream">
                {shop.phone}
              </a>
            </li>
            <li className="flex gap-5 pt-2">
              <a href={site.telegram} target="_blank" rel="noreferrer" className="link text-cream">
                Telegram
              </a>
              <a href={site.telegramChannel} target="_blank" rel="noreferrer" className="link">
                {t.stores.channel}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="container-x wrap flex flex-col gap-2 border-t border-cream/10 py-6 text-[12px] md:flex-row md:justify-between">
        <span>
          © {new Date().getFullYear()} Louis Gabor. {t.footer.rights}
        </span>
        <span className="text-cream/40">{paymentMethods(locale).join(" · ")}</span>
      </div>
    </footer>
  );
}
