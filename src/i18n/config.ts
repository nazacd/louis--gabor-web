import { ru } from "./ru";
import { uz } from "./uz";

export const locales = ["ru", "uz"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "ru";

export type Dict = typeof ru;

const dictionaries: Record<Locale, Dict> = { ru, uz };

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export function getDict(locale: Locale): Dict {
  return dictionaries[locale];
}

/** Текст на двух языках — для данных о товарах и магазинах. */
export type L10n = Record<Locale, string>;

/** Ссылка внутри сайта с учётом языка: href("ru", "/catalog/") -> "/ru/catalog/". */
export function href(locale: Locale, path = "/"): string {
  return `/${locale}${path.startsWith("/") ? path : `/${path}`}`;
}
