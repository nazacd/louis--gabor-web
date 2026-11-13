"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { getDict, type Locale } from "@/i18n/config";

export type Panel = "menu" | "search" | "cart" | "sizes" | null;

export type CartIntent = { productId: string; size: string } | null;

type UI = {
  locale: Locale;
  panel: Panel;
  open: (panel: Exclude<Panel, null>) => void;
  close: () => void;
  /** Товар, который пытались положить в корзину — показываем его в уведомлении */
  cartIntent: CartIntent;
  requestCart: (intent: CartIntent) => void;
  toast: string | null;
  showToast: (message: string) => void;
  favorites: string[];
  isFavorite: (id: string) => boolean;
  toggleFavorite: (id: string) => void;
};

const UIContext = createContext<UI | null>(null);

export function useUI(): UI {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error("useUI must be used inside <Providers>");
  return ctx;
}

/* ---- Избранное: хранится в localStorage, без регистрации ---- */

const FAV_KEY = "lg-favorites";
const EMPTY: string[] = [];
let favCache: string[] = EMPTY;
let favRaw: string | null = null;
const favListeners = new Set<() => void>();

function readFavorites(): string[] {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(FAV_KEY);
  } catch {
    return favCache;
  }
  if (raw !== favRaw) {
    favRaw = raw;
    try {
      const parsed: unknown = raw ? JSON.parse(raw) : [];
      favCache = Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : EMPTY;
    } catch {
      favCache = EMPTY;
    }
  }
  return favCache;
}

function writeFavorites(next: string[]) {
  favCache = next;
  favRaw = JSON.stringify(next);
  try {
    window.localStorage.setItem(FAV_KEY, favRaw);
  } catch {
    /* приватный режим — оставляем только в памяти */
  }
  favListeners.forEach((l) => l());
}

function subscribeFavorites(listener: () => void) {
  favListeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    favListeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

export function Providers({ locale, children }: { locale: Locale; children: ReactNode }) {
  const pathname = usePathname();
  const [panel, setPanel] = useState<Panel>(null);
  const [cartIntent, setCartIntent] = useState<CartIntent>(null);
  const [toast, setToast] = useState<string | null>(null);

  const favorites = useSyncExternalStore(subscribeFavorites, readFavorites, () => EMPTY);

  const open = useCallback((p: Exclude<Panel, null>) => {
    if (p === "cart") setCartIntent(null);
    setPanel(p);
  }, []);
  const close = useCallback(() => setPanel(null), []);

  const requestCart = useCallback((intent: CartIntent) => {
    setCartIntent(intent);
    setPanel("cart");
  }, []);

  const showToast = useCallback((message: string) => setToast(message), []);

  const toggleFavorite = useCallback(
    (id: string) => {
      const current = readFavorites();
      const has = current.includes(id);
      writeFavorites(has ? current.filter((x) => x !== id) : [...current, id]);
      const t = getDict(locale).favorites;
      showToast(has ? t.removed : t.added);
    },
    [showToast, locale],
  );

  const isFavorite = useCallback((id: string) => favorites.includes(id), [favorites]);

  // Закрываем панели при переходе на другую страницу
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setPanel(null);
  }

  useEffect(() => {
    document.body.classList.toggle("scroll-locked", panel !== null);
  }, [panel]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPanel(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(t);
  }, [toast]);

  const value = useMemo<UI>(
    () => ({
      locale,
      panel,
      open,
      close,
      cartIntent,
      requestCart,
      toast,
      showToast,
      favorites,
      isFavorite,
      toggleFavorite,
    }),
    [locale, panel, open, close, cartIntent, requestCart, toast, showToast, favorites, isFavorite, toggleFavorite],
  );

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}
