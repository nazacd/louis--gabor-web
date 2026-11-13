"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getDict, href, locales } from "@/i18n/config";
import { useUI } from "./Providers";
import { Logo } from "./Logo";
import { BagIcon, BookmarkIcon, MenuIcon, SearchIcon } from "./Icons";

export const LOCALE_KEY = "lg-locale";

/** Тот же адрес на другом языке: /ru/catalog/ -> /uz/catalog/ */
function switchLocalePath(pathname: string, target: string): string {
  return pathname.replace(/^\/(ru|uz)(?=\/|$)/, `/${target}`) || `/${target}/`;
}

export function LangSwitch({ className = "" }: { className?: string }) {
  const { locale } = useUI();
  const pathname = usePathname();
  return (
    <div className={`flex items-center rounded-full border border-line bg-white p-0.5 text-[11px] font-semibold ${className}`}>
      {locales.map((l) => (
        <Link
          key={l}
          href={switchLocalePath(pathname, l)}
          hrefLang={l}
          onClick={() => {
            try {
              window.localStorage.setItem(LOCALE_KEY, l);
            } catch {
              /* ignore */
            }
          }}
          aria-current={l === locale ? "true" : undefined}
          className={`rounded-full px-2.5 py-1 transition-colors ${l === locale ? "bg-ink text-white" : "text-muted hover:text-ink"}`}
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
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 8);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [pathname]);

  const nav = [
    { label: t.nav.catalog, path: "/catalog/" },
    { label: t.nav.films, path: "/catalog/#films" },
    { label: t.nav.stores, path: "/stores/" },
  ];

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 h-[var(--header-h)] transition-[background-color,box-shadow] duration-300 ${
        scrolled ? "bg-paper/90 shadow-[0_1px_0_var(--color-line)] backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <div className="container-x flex h-full items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button type="button" aria-label={t.nav.menu} className="icon-btn -ml-2 lg:hidden" onClick={() => open("menu")}>
            <MenuIcon />
          </button>
          <Link href={href(locale, "/")} aria-label="Louis Gabor">
            <Logo tile={30} text="hidden text-[12px] sm:block" />
          </Link>
        </div>

        <nav className="hidden items-center gap-1 lg:flex" aria-label={t.nav.menu}>
          {nav.map((item) => (
            <Link key={item.path} href={href(locale, item.path)} className="rounded-full px-4 py-2 text-[13px] font-medium transition-colors hover:bg-ink/5">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <LangSwitch className="mr-1 hidden sm:flex" />
          <button type="button" aria-label={t.nav.search} className="icon-btn" onClick={() => open("search")}>
            <SearchIcon />
          </button>
          <Link href={href(locale, "/favorites/")} aria-label={t.nav.favorites} className="icon-btn relative">
            <BookmarkIcon />
            {favorites.length > 0 && (
              <span className="absolute right-0.5 top-0.5 flex h-[16px] min-w-[16px] items-center justify-center rounded-full bg-blue px-1 text-[9px] font-bold leading-none text-white">
                {favorites.length}
              </span>
            )}
          </Link>
          <button type="button" aria-label={t.nav.cart} className="icon-btn" onClick={() => open("cart")}>
            <BagIcon />
          </button>
        </div>
      </div>
    </header>
  );
}
