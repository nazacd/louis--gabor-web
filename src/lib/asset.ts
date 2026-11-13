import { getDict, type Locale } from "@/i18n/config";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** Путь к файлу из /public с учётом basePath (нужно для GitHub Pages). */
export function asset(path: string): string {
  return `${basePath}${path.startsWith("/") ? path : `/${path}`}`;
}

export const media = {
  /** Пара на прозрачном фоне 4:3, 1600 и 800 px */
  studio: (name: string) => ({
    src: asset(`/media/studio/${name}.webp`),
    small: asset(`/media/studio/${name}-800.webp`),
    srcSet: `${asset(`/media/studio/${name}-800.webp`)} 800w, ${asset(`/media/studio/${name}.webp`)} 1600w`,
  }),
  swatch: (name: string) => asset(`/media/swatch/${name}.webp`),
  detail: (name: string, i: 1 | 2) => asset(`/media/detail/${name}-${i}.webp`),
  cover: (name: string) => ({
    src: asset(`/media/cover/${name}.webp`),
    small: asset(`/media/cover/${name}-480.webp`),
  }),
  film: (name: string) => ({ src: asset(`/media/film/${name}.mp4`), poster: asset(`/media/film/${name}.webp`) }),
};

export function formatPrice(value: number, locale: Locale): string {
  const digits = String(value).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${digits} ${getDict(locale).currency}`;
}
