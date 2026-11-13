"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { getDict, href } from "@/i18n/config";
import { site } from "@/data/site";
import { colors, getProduct, products, shop, types } from "@/data/catalog";
import { formatPrice, media } from "@/lib/asset";
import { useUI } from "./Providers";
import { LangSwitch } from "./Header";
import { Logo } from "./Logo";
import { MiniCard } from "./ProductCard";
import { TelegramButton } from "./TelegramButton";
import { BagIcon, BookmarkIcon, CloseIcon, PhoneIcon, SearchIcon } from "./Icons";

function Drawer({
  open,
  side,
  title,
  onClose,
  closeLabel,
  children,
  footer,
}: {
  open: boolean;
  side: "left" | "right";
  title: ReactNode;
  onClose: () => void;
  closeLabel: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <aside className={`drawer drawer-${side} ${open ? "is-open" : ""}`} role="dialog" aria-modal="true" aria-hidden={!open} inert={!open}>
      <div className="flex h-[68px] shrink-0 items-center justify-between border-b border-line px-5">
        <div className="label">{title}</div>
        <button type="button" aria-label={closeLabel} className="icon-btn -mr-2" onClick={onClose}>
          <CloseIcon />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto overscroll-contain">{children}</div>
      {footer && <div className="shrink-0 border-t border-line p-5">{footer}</div>}
    </aside>
  );
}

function MenuDrawer() {
  const { locale, panel, close } = useUI();
  const t = getDict(locale);
  const links = [
    { label: t.nav.home, path: "/" },
    { label: t.nav.catalog, path: "/catalog/" },
    { label: t.nav.films, path: "/catalog/#films" },
    { label: t.nav.stores, path: "/stores/" },
    { label: t.nav.favorites, path: "/favorites/" },
  ];
  return (
    <Drawer open={panel === "menu"} side="left" title={<Logo tile={26} text="text-[11px]" />} onClose={close} closeLabel={t.nav.close}>
      <nav className="px-5 py-6" aria-label={t.nav.menu}>
        <ul>
          {links.map((item) => (
            <li key={item.path}>
              <Link href={href(locale, item.path)} onClick={close} className="display block py-2 text-[30px] transition-colors hover:text-blue">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-8 border-t border-line pt-6">
          <ul className="flex flex-wrap gap-2">
            {types.map((ty) => (
              <li key={ty.key}>
                <Link href={href(locale, `/catalog/?t=${ty.key}`)} onClick={close} className="chip">
                  {ty.name[locale]}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-8 border-t border-line pt-6 text-[14px] text-muted">
          {site.stores.map((s) => (
            <p key={s.id}>{s.name}</p>
          ))}
          <a href={shop.phoneHref} className="mt-3 block text-[18px] font-medium text-ink">
            {shop.phone}
          </a>
          <div className="mt-6 flex items-center justify-between">
            <span className="label">{t.nav.language}</span>
            <LangSwitch />
          </div>
        </div>
      </nav>
    </Drawer>
  );
}

function CartDrawer() {
  const { locale, panel, close, cartIntent, isFavorite, toggleFavorite } = useUI();
  const t = getDict(locale);
  const product = cartIntent ? getProduct(cartIntent.productId.toLowerCase()) : undefined;
  const image = product?.studio[0]?.image;
  return (
    <Drawer
      open={panel === "cart"}
      side="right"
      title={t.cart.title}
      onClose={close}
      closeLabel={t.nav.close}
      footer={
        <div className="space-y-2.5">
          <TelegramButton className="btn btn-blue w-full">{t.product.askTelegram}</TelegramButton>
          <a href={shop.phoneHref} className="btn btn-line w-full">
            <PhoneIcon width={17} height={17} />
            {t.cart.call}
          </a>
        </div>
      }
    >
      <div className="px-5 py-8">
        {product && cartIntent && (
          <div className="mb-8 flex gap-4 border-b border-line pb-8">
            <div className="stage h-[90px] w-[120px] shrink-0">
              {image && <img src={media.studio(image).small} alt="" className="stage-img" />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="label text-muted">{t.cart.chosen}</div>
              <div className="mt-2 text-[15px] font-medium">
                {product.name[locale]} <span className="sku text-muted">{product.sku}</span>
              </div>
              {cartIntent.size && (
                <div className="mt-1 text-[13px] text-muted">
                  {t.product.sizeLabel} {cartIntent.size}
                </div>
              )}
              <div className="mt-1 text-[15px]">{formatPrice(product.price, locale)}</div>
              {!isFavorite(product.sku) && (
                <button type="button" onClick={() => toggleFavorite(product.sku)} className="mt-3 inline-flex items-center gap-2 text-[12px] font-semibold text-blue">
                  <BookmarkIcon width={14} height={14} /> {t.cart.save}
                </button>
              )}
            </div>
          </div>
        )}
        <div className="flex flex-col items-center text-center">
          <BagIcon width={30} height={30} />
          <h2 className="display mt-6 max-w-[300px] text-[28px]">{t.cart.soonTitle}</h2>
          <p className="mt-4 max-w-[320px] text-[14px] leading-relaxed text-muted">{t.cart.soonText}</p>
          <Link href={href(locale, "/stores/")} onClick={close} className="mt-5 text-[13px] font-semibold text-blue">
            {t.cart.stores}
          </Link>
        </div>
      </div>
    </Drawer>
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
    if (!q) return products.filter((p) => p.studio.length > 0).slice(0, 8);
    return products.filter((p) => {
      const fields = [p.sku, p.name.ru, p.name.uz, ...types.filter((ty) => ty.key === p.type).flatMap((ty) => [ty.name.ru, ty.name.uz]), ...p.colors.flatMap((c) => [colors[c].name.ru, colors[c].name.uz])];
      return fields.some((f) => f.toLowerCase().includes(q));
    });
  }, [query]);

  return (
    <div
      className={`fixed inset-x-0 top-0 z-[70] max-h-[100svh] overflow-y-auto bg-paper transition-[transform,visibility] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        isOpen ? "visible translate-y-0" : "invisible -translate-y-full"
      }`}
      role="dialog"
      aria-modal="true"
      aria-label={t.nav.search}
      aria-hidden={!isOpen}
      inert={!isOpen}
    >
      <div className="container-x mx-auto max-w-[1280px] py-5 md:py-8">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <SearchIcon className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.search.placeholder}
              aria-label={t.search.placeholder}
              className="h-14 w-full rounded-full border border-line bg-white pl-12 pr-5 text-[17px] outline-none placeholder:text-faint focus:border-ink"
            />
          </div>
          <button type="button" className="btn btn-line h-14" onClick={close}>
            {t.nav.close}
          </button>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className="label mr-2 text-muted">{t.search.popular}</span>
          {t.search.terms.map((term) => (
            <button key={term} type="button" onClick={() => setQuery(term)} className="chip">
              {term}
            </button>
          ))}
        </div>
        <div className="mt-7 pb-4">
          {results.length === 0 ? (
            <p className="py-10 text-center text-[15px] text-muted">{t.search.nothing(query)}</p>
          ) : (
            <>
              <div className="mb-4 text-[13px] text-muted">{query.trim() ? `${t.search.found}: ${results.length}` : t.search.all}</div>
              <ul className="grid grid-cols-2 gap-x-3 gap-y-6 md:grid-cols-4 md:gap-x-5">
                {results.map((p) => (
                  <li key={p.sku}>
                    <MiniCard product={p} onClick={close} />
                  </li>
                ))}
              </ul>
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
    <div
      key={toast}
      role="status"
      className="toast fixed right-4 z-[80] flex items-center gap-4 rounded-full bg-ink px-5 py-3 text-[13px] text-white"
      style={{ top: "calc(var(--top-offset) + 12px)" }}
    >
      {toast}
      <Link href={href(locale, "/favorites/")} className="font-semibold text-white/80 hover:text-white">
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
      <CartDrawer />
      <SearchOverlay />
      <Toast />
    </>
  );
}
