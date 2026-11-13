"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { getDict, href } from "@/i18n/config";
import { site } from "@/data/site";
import { colors, products, shop, types } from "@/data/catalog";
import { useUI } from "./Providers";
import { LangSwitch } from "./Header";
import { Logo } from "./Logo";
import { Tile } from "./ProductCard";
import { CloseIcon, SearchIcon } from "./Icons";

function MenuDrawer() {
  const { locale, panel, close } = useUI();
  const t = getDict(locale);
  const open = panel === "menu";
  const links = [
    { label: t.nav.home, path: "/" },
    { label: t.nav.catalog, path: "/catalog/" },
    { label: t.nav.stores, path: "/stores/" },
    { label: t.nav.favorites, path: "/favorites/" },
  ];
  return (
    <aside className={`drawer drawer-left ${open ? "is-open" : ""}`} role="dialog" aria-modal="true" aria-hidden={!open} inert={!open}>
      <div className="flex h-[var(--header-h)] shrink-0 items-center justify-between border-b border-line px-5">
        <Logo mono="w-[22px]" text="text-[18px]" />
        <button type="button" aria-label={t.nav.close} className="icon-btn -mr-2" onClick={close}>
          <CloseIcon />
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto px-5 py-8" aria-label={t.nav.menu}>
        <ul className="border-t border-line">
          {links.map((item) => (
            <li key={item.path} className="border-b border-line">
              <Link href={href(locale, item.path)} onClick={close} className="title block py-4 text-[30px] transition-colors hover:text-accent">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
        <ul className="mt-8 grid grid-cols-2 gap-y-1">
          {types.map((ty) => (
            <li key={ty.key}>
              <Link href={href(locale, `/catalog/?t=${ty.key}`)} onClick={close} className="tab inline-block">
                {ty.name[locale]}
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-10 space-y-1 text-[14px] text-muted">
          {site.stores.map((s) => (
            <p key={s.id}>{s.name}</p>
          ))}
          <a href={shop.phoneHref} className="num block pt-3 font-serif text-[22px] text-ink">
            {shop.phone}
          </a>
        </div>
        <div className="mt-8 flex items-center justify-between border-t border-line pt-6">
          <span className="label text-muted">{t.nav.language}</span>
          <LangSwitch />
        </div>
      </nav>
    </aside>
  );
}

function SearchOverlay() {
  const { locale, panel, close } = useUI();
  const t = getDict(locale);
  const isOpen = panel === "search";
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const timer = window.setTimeout(() => inputRef.current?.focus(), 80);
    return () => window.clearTimeout(timer);
  }, [isOpen]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products.filter((p) => p.studio.length > 0).slice(0, 4);
    return products.filter((p) => {
      const fields = [p.sku, p.name.ru, p.name.uz, ...types.filter((ty) => ty.key === p.type).flatMap((ty) => [ty.name.ru, ty.name.uz]), ...p.colors.flatMap((c) => [colors[c].name.ru, colors[c].name.uz])];
      return fields.some((f) => f.toLowerCase().includes(q));
    });
  }, [query]);

  return (
    <div
      className={`fixed inset-x-0 top-0 z-[70] max-h-[100svh] overflow-y-auto bg-surface transition-[transform,visibility] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        isOpen ? "visible translate-y-0" : "invisible -translate-y-full"
      }`}
      role="dialog"
      aria-modal="true"
      aria-label={t.nav.search}
      aria-hidden={!isOpen}
      inert={!isOpen}
    >
      <div className="container-x wrap py-6 md:py-10">
        <div className="flex items-center gap-4 border-b border-ink">
          <SearchIcon className="shrink-0 text-muted" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.search.placeholder}
            aria-label={t.search.placeholder}
            className="h-16 min-w-0 flex-1 bg-transparent font-serif text-[24px] outline-none placeholder:text-faint md:text-[32px]"
          />
          <button type="button" aria-label={t.nav.close} className="icon-btn -mr-2 shrink-0" onClick={close}>
            <CloseIcon />
          </button>
        </div>
        <div className="mt-4 flex flex-wrap gap-x-6">
          {t.search.terms.map((term) => (
            <button key={term} type="button" onClick={() => setQuery(term)} className="tab">
              {term}
            </button>
          ))}
        </div>
        <div className="mt-8 pb-4" onClick={(e) => (e.target as HTMLElement).closest("a") && close()}>
          {results.length === 0 ? (
            <p className="py-10 text-[15px] text-muted">{t.search.nothing(query)}</p>
          ) : (
            <>
              {query.trim() && <div className="label num mb-5 text-muted">{`${t.search.found}: ${results.length}`}</div>}
              <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-6">
                {results.map((p) => (
                  <Tile key={p.sku} product={p} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Toast() {
  const { locale, toast } = useUI();
  if (!toast) return null;
  return (
    <div key={toast} role="status" className="toast fixed right-4 z-[80] flex items-center gap-5 bg-ink px-5 py-3.5 text-[13px] text-cream" style={{ top: "calc(var(--top-offset) + 12px)" }}>
      {toast}
      <Link href={href(locale, "/favorites/")} className="link text-cream">
        {getDict(locale).favorites.open}
      </Link>
    </div>
  );
}

export function Overlays() {
  const { panel, close } = useUI();
  return (
    <>
      <div className={`backdrop ${panel ? "is-open" : ""}`} onClick={close} aria-hidden="true" />
      <MenuDrawer />
      <SearchOverlay />
      <Toast />
    </>
  );
}
