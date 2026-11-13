"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getDict, href, locales } from "@/i18n/config";
import { useUI } from "./Providers";
import { Monogram } from "./Logo";
import { BookmarkIcon, MenuIcon, SearchIcon } from "./Icons";

export const LOCALE_KEY = "lg-locale";

function switchLocalePath(pathname: string, target: string): string {
  return pathname.replace(/^\/(ru|uz)(?=\/|$)/, `/${target}`) || `/${target}/`;
}

export function LangSwitch({ className = "" }: { className?: string }) {
  const { locale } = useUI();
  const pathname = usePathname();
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {locales.map((l) => (
        <Link
          key={l}
          href={switchLocalePath(pathname, l)}
          hrefLang={l}
          aria-current={l === locale ? "true" : undefined}
          onClick={() => {
            try {
              window.localStorage.setItem(LOCALE_KEY, l);
            } catch {
              /* ignore */
            }
          }}
          className="tab !py-1"
        >
          {getDict(l).langShort}
        </Link>
      ))}
    </div>
  );
}

export function Header() {
  const { locale, open, favorites } = useUI();
  const pathname = usePathname();
  const t = getDict(locale);
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    const update = () => setSolid(window.scrollY > 40);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [pathname]);

  const isCatalog = pathname.includes("/catalog");
  const isStores = pathname.includes("/stores");

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 h-[var(--header-h)] border-b transition-[background-color,border-color] duration-300 ${
        solid ? "border-line bg-bg/95 backdrop-blur-md" : "border-transparent bg-transparent"
      }`}
    >
      <div className="container-x relative flex h-full items-center justify-between">
        <div className="flex items-center gap-8">
          <button type="button" aria-label={t.nav.menu} className="icon-btn -ml-2 md:hidden" onClick={() => open("menu")}>
            <MenuIcon />
          </button>
          <nav className="hidden items-center gap-8 md:flex" aria-label={t.nav.menu}>
            <Link href={href(locale, "/catalog/")} className="tab" aria-current={isCatalog ? "true" : undefined}>
              {t.nav.catalog}
            </Link>
            <Link href={href(locale, "/stores/")} className="tab" aria-current={isStores ? "true" : undefined}>
              {t.nav.stores}
            </Link>
          </nav>
        </div>

        <Link href={href(locale, "/")} aria-label="Louis Gabor" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <Monogram className="w-[30px]" />
        </Link>

        <div className="flex items-center gap-2 md:gap-5">
          <LangSwitch className="hidden md:flex" />
          <button type="button" aria-label={t.nav.search} className="icon-btn" onClick={() => open("search")}>
            <SearchIcon />
          </button>
          <Link href={href(locale, "/favorites/")} aria-label={t.nav.favorites} className="icon-btn relative -mr-2">
            <BookmarkIcon />
            {favorites.length > 0 && (
              <span className="num absolute right-0 top-1 text-[10px] font-semibold text-accent">{favorites.length}</span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
