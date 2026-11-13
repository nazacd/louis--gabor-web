import exported from "./export.json";
import type { L10n, Locale } from "@/i18n/config";

/**
 * Каталог собирается из двух частей:
 * - export.json — факты из постов канала (артикул, цена, размеры, цвета, подошва). Генерируется
 *   scripts/parse-export.py, руками не правится;
 * - LOOKS ниже — только то, чего в постах нет: тип модели (по фото), какие кадры к какому цвету.
 */

export type ColorKey = "black" | "navy" | "brown" | "burgundy" | "khaki";

export const colors: Record<ColorKey, { name: L10n; hex: string }> = {
  black: { name: { ru: "Чёрный", uz: "Qora" }, hex: "#16171a" },
  navy: { name: { ru: "Тёмно-синий", uz: "To‘q ko‘k" }, hex: "#1f2a44" },
  brown: { name: { ru: "Коричневый", uz: "Jigarrang" }, hex: "#5a3a28" },
  burgundy: { name: { ru: "Бордовый", uz: "To‘q qizil" }, hex: "#5b1f27" },
  khaki: { name: { ru: "Хаки", uz: "Xaki" }, hex: "#6b6650" },
};

export type TypeKey = "sneakers" | "slipons" | "loafers" | "shoes";

export const types: { key: TypeKey; name: L10n; one: L10n }[] = [
  { key: "sneakers", name: { ru: "Кроссовки и кеды", uz: "Krossovka va kedlar" }, one: { ru: "Кроссовки", uz: "Krossovka" } },
  { key: "slipons", name: { ru: "Слипоны", uz: "Sliponlar" }, one: { ru: "Слипоны", uz: "Slipon" } },
  { key: "loafers", name: { ru: "Лоферы", uz: "Loferlar" }, one: { ru: "Лоферы", uz: "Lofer" } },
  { key: "shoes", name: { ru: "Туфли", uz: "Tuflilar" }, one: { ru: "Туфли", uz: "Tufli" } },
];

/** Отдельное название вида там, где он однозначно виден на фото */
const STYLE: Record<string, L10n> = {
  oxford: { ru: "Оксфорды", uz: "Oksford" },
  derby: { ru: "Дерби", uz: "Derbi" },
  monk: { ru: "Туфли с пряжкой", uz: "Toqali tufli" },
  kedy: { ru: "Кеды", uz: "Ked" },
};

type Look = {
  type: TypeKey;
  style?: keyof typeof STYLE;
  /** Студийные кадры по цветам: имя файла в /public/media/studio без расширения */
  studio?: Partial<Record<ColorKey, string>>;
  /** Обложка «в руке» по цветам: /public/media/cover */
  cover?: Partial<Record<ColorKey, string>>;
  /** Ролик в /public/media/film (у 932 в канале нет видео) */
  film?: string;
  /** Цвет, который показываем первым */
  lead?: ColorKey;
};

const LOOKS: Record<string, Look> = {
  "Y08K11-1": {
    type: "sneakers",
    studio: { navy: "y08k11-1-navy", black: "y08k11-1-black", brown: "y08k11-1-brown" },
    film: "y08k11-1",
    lead: "navy",
  },
  "536": { type: "shoes", style: "oxford", studio: { black: "536-black", navy: "536-navy" }, film: "536" },
  "273": { type: "slipons", studio: { black: "273-black", navy: "273-navy" }, film: "273" },
  "273-Z": {
    type: "slipons",
    studio: { brown: "273-z-brown", black: "273-z-black", navy: "273-z-navy" },
    film: "273-z",
    lead: "brown",
  },
  "1571": {
    type: "shoes",
    style: "derby",
    studio: { burgundy: "1571-burgundy", navy: "1571-navy", brown: "1571-brown" },
    film: "1571",
    lead: "burgundy",
  },
  "8171": { type: "shoes", style: "monk", studio: { navy: "8171-navy", brown: "8171-brown" }, film: "8171" },
  "196": { type: "sneakers", studio: { navy: "196-navy", black: "196-black" }, film: "196" },
  "196-N": {
    type: "sneakers",
    studio: { brown: "196-n-brown", navy: "196-n-navy", black: "196-n-black" },
    film: "196-n",
    lead: "brown",
  },
  C181A: { type: "sneakers", cover: { navy: "c181a-navy", brown: "c181a-brown", black: "c181a-black" }, film: "c181a", lead: "navy" },
  "932": { type: "slipons", cover: { navy: "932-navy", black: "932-black" }, lead: "navy" },
  "Y08K10-1": { type: "slipons", film: "y08k10-1" },
  "Y08K12-1": { type: "slipons", film: "y08k12-1" },
  "1577": { type: "loafers", film: "1577" },
  "6297A28": { type: "shoes", film: "6297a28" },
  MC296A: { type: "shoes", film: "mc296a" },
  MC268A: { type: "shoes", style: "monk", film: "mc268a" },
  "1387": { type: "loafers", film: "1387" },
  "LG-01": { type: "loafers", film: "lg-01" },
  "332-D": { type: "sneakers", style: "kedy", film: "332-d" },
  "GG3502-17": { type: "loafers", film: "gg3502-17" },
};

type Raw = (typeof exported.products)[number];

export type Product = {
  sku: string;
  slug: string;
  type: TypeKey;
  name: L10n;
  price: number;
  sizes: [number, number];
  colors: ColorKey[];
  sole: string | null;
  /** Цвета, для которых есть студийный кадр */
  studio: { color: ColorKey; image: string }[];
  cover: { color: ColorKey; image: string }[];
  film: string | null;
  /** Порядок в канале: чем больше, тем новее */
  post: number;
};

function build(raw: Raw): Product {
  const look = LOOKS[raw.sku];
  if (!look) throw new Error(`Нет описания для артикула ${raw.sku} в LOOKS`);
  const typeName = look.style ? STYLE[look.style] : types.find((t) => t.key === look.type)!.one;
  const order = (map?: Partial<Record<ColorKey, string>>) => {
    if (!map) return [];
    const entries = Object.entries(map) as [ColorKey, string][];
    entries.sort(([a], [b]) => (a === look.lead ? -1 : b === look.lead ? 1 : 0));
    return entries.map(([color, image]) => ({ color, image }));
  };
  return {
    sku: raw.sku,
    slug: raw.sku.toLowerCase(),
    type: look.type,
    name: typeName,
    price: raw.price,
    sizes: raw.sizes as [number, number],
    colors: raw.colors as ColorKey[],
    sole: raw.sole,
    studio: order(look.studio),
    cover: order(look.cover),
    film: look.film ?? null,
    post: Math.max(...raw.posts),
  };
}

export const products: Product[] = exported.products.map(build);

export const shop = {
  phone: exported.phone,
  phoneHref: `tel:${exported.phone.replace(/\s/g, "")}`,
  payment: exported.payment,
  malls: exported.malls,
};

/** Названия способов оплаты из постов; переводим только слово «Наличные», остальное — названия систем. */
export function paymentMethods(locale: Locale): string[] {
  return shop.payment.map((m) => (locale === "uz" && m === "Наличные" ? "Naqd pul" : m));
}

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function productPath(p: Product): string {
  return `/catalog/${p.slug}/`;
}

export function hasStudio(p: Product): boolean {
  return p.studio.length > 0;
}

export function typeName(key: TypeKey, locale: Locale): string {
  return types.find((t) => t.key === key)!.name[locale];
}

/** «38–45» */
export function sizeRange(p: Product): string {
  return `${p.sizes[0]}–${p.sizes[1]}`;
}
