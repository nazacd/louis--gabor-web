import Link from "next/link";
import { getDict, href, type Locale } from "@/i18n/config";
import { site } from "@/data/site";
import { shop, types, paymentMethods } from "@/data/catalog";
import { LogoTile } from "./Logo";

export function Footer({ locale }: { locale: Locale }) {
  const t = getDict(locale);
  return (
    <footer className="bg-night text-white/60">
      <div className="container-x flex flex-col items-start justify-between gap-8 border-b border-white/10 py-14 md:flex-row md:items-end md:py-20">
        <div className="flex items-center gap-5 text-white">
          <LogoTile size={56} />
          <div>
            <div className="wordmark text-[20px]">Louis Gabor</div>
            <div className="mt-1 text-[13px] text-white/50">{t.footer.tagline}</div>
          </div>
        </div>
        <a href={site.telegram} target="_blank" rel="noreferrer" className="btn btn-white">
          {t.product.askTelegram}
        </a>
      </div>

      <div className="container-x grid grid-cols-2 gap-x-6 gap-y-10 py-12 md:grid-cols-4 md:py-16">
        <div>
          <div className="label mb-5 text-white">{t.footer.collection}</div>
          <ul className="space-y-2.5 text-[14px]">
            {types.map((ty) => (
              <li key={ty.key}>
                <Link href={href(locale, `/catalog/?t=${ty.key}`)} className="transition-colors hover:text-white">
                  {ty.name[locale]}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="label mb-5 text-white">{t.footer.help}</div>
          <ul className="space-y-2.5 text-[14px]">
            <li>
              <Link href={href(locale, "/stores/")} className="transition-colors hover:text-white">
                {t.nav.stores}
              </Link>
            </li>
            <li>
              <Link href={href(locale, "/favorites/")} className="transition-colors hover:text-white">
                {t.nav.favorites}
              </Link>
            </li>
            <li>
              <a href={site.telegramChannel} target="_blank" rel="noreferrer" className="transition-colors hover:text-white">
                {t.stores.channel}
              </a>
            </li>
          </ul>
        </div>
        <div className="col-span-2">
          <div className="label mb-5 text-white">{t.footer.contacts}</div>
          <ul className="space-y-2.5 text-[14px]">
            {site.stores.map((s) => (
              <li key={s.id}>
                {s.name}, {s.city[locale]}
              </li>
            ))}
            <li className="pt-2">
              <a href={shop.phoneHref} className="text-[26px] font-light tracking-tight text-white">
                {shop.phone}
              </a>
            </li>
            <li className="pt-2 text-[12px] leading-relaxed text-white/45">{paymentMethods(locale).join(" · ")}</li>
          </ul>
        </div>
      </div>

      <div className="container-x border-t border-white/10 py-6 text-[12px]">
        © {new Date().getFullYear()} Louis Gabor. {t.footer.rights}
      </div>
    </footer>
  );
}
