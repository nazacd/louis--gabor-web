"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { colors, type ColorKey, type Product } from "@/data/catalog";
import { media } from "@/lib/asset";
import { useUI } from "./Providers";

/**
 * Пара на сцене. Все кадры сняты с одного ракурса, поэтому смена цвета — плавная подмена
 * картинки на том же месте. Пока новый кадр грузится, на сцене остаётся прежний.
 */
export function PairStage({
  product,
  active,
  sizes = "(min-width: 1024px) 50vw, 100vw",
  className = "aspect-[4/3]",
  zoom = 1,
  priority = false,
  preload = false,
  stage = true,
}: {
  product: Product;
  active: ColorKey;
  sizes?: string;
  className?: string;
  /** Увеличение пары внутри рамки (кадры 4:3, пара занимает ~78% ширины) */
  zoom?: number;
  priority?: boolean;
  /** Подгрузить остальные цвета, когда страница освободится */
  preload?: boolean;
  /** Рисовать фон сцены (в герое фон даёт секция) */
  stage?: boolean;
}) {
  const { locale } = useUI();
  const [seen, setSeen] = useState<ColorKey[]>([active]);
  if (!seen.includes(active)) setSeen([...seen, active]);
  const [loaded, setLoaded] = useState<ColorKey[]>([]);
  const [shown, setShown] = useState<ColorKey>(active);
  if (shown !== active && loaded.includes(active)) setShown(active);

  useEffect(() => {
    if (!preload) return;
    const all = product.studio.map((s) => s.color);
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 1200));
    const id = idle(() => setSeen((s) => [...new Set([...s, ...all])]));
    return () => (window.cancelIdleCallback ?? window.clearTimeout)(id as number);
  }, [preload, product]);

  return (
    <div className={`${stage ? "stage" : "relative"} ${className}`}>
      {product.studio
        .filter(({ color }) => seen.includes(color))
        .map(({ color, image }, i) => {
          const m = media.studio(image);
          return (
            <img
              key={image}
              src={m.small}
              srcSet={m.srcSet}
              sizes={sizes}
              alt={color === shown ? `${product.name[locale]} ${product.sku}, ${colors[color].name[locale]}` : ""}
              loading={priority && i === 0 ? "eager" : "lazy"}
              fetchPriority={priority && i === 0 ? "high" : "auto"}
              onLoad={() => setLoaded((l) => (l.includes(color) ? l : [...l, color]))}
              style={{ transform: zoom !== 1 ? `scale(${zoom})` : undefined } as CSSProperties}
              className={`stage-img ${color === shown ? "" : "is-hidden"}`}
            />
          );
        })}
    </div>
  );
}

/** Мини-вырезки пар для выбора цвета на странице модели */
export function Swatches({
  product,
  active,
  onChange,
  size = "w-[84px]",
}: {
  product: Product;
  active: ColorKey;
  onChange: (c: ColorKey) => void;
  size?: string;
}) {
  const { locale } = useUI();
  if (product.studio.length < 2) return null;
  return (
    <div className="flex flex-wrap gap-3" role="group" aria-label={colors[active].name[locale]}>
      {product.studio.map(({ color, image }) => (
        <button
          key={image}
          type="button"
          aria-pressed={color === active}
          aria-label={colors[color].name[locale]}
          title={colors[color].name[locale]}
          onClick={() => onChange(color)}
          className={`swatch ${size}`}
        >
          <img src={media.swatch(image)} alt="" loading="lazy" />
        </button>
      ))}
    </div>
  );
}

/** Квадратные образцы цвета; там, где есть кадр, по ним можно переключать пару */
export function ColorSquares({
  product,
  active,
  onChange,
  big = false,
}: {
  product: Product;
  active?: ColorKey;
  onChange?: (c: ColorKey) => void;
  big?: boolean;
}) {
  const { locale } = useUI();
  const photographed = new Set(product.studio.map((s) => s.color));
  return (
    <div className="flex items-center gap-0.5">
      {product.colors.map((c) => {
        const live = Boolean(onChange && photographed.has(c));
        const px = big ? 16 : live ? 12 : 8;
        const square = <span className="chip-color" style={{ background: colors[c].hex, width: px, height: px }} />;
        if (live && onChange) {
          return (
            <button
              key={c}
              type="button"
              aria-pressed={c === active}
              aria-label={colors[c].name[locale]}
              title={colors[c].name[locale]}
              onClick={(e) => {
                e.preventDefault();
                onChange(c);
              }}
              onMouseEnter={() => onChange(c)}
              className="chip-color-btn"
            >
              {square}
            </button>
          );
        }
        return (
          <span key={c} title={colors[c].name[locale]} className="inline-flex h-[20px] w-[14px] items-center justify-center">
            {square}
          </span>
        );
      })}
    </div>
  );
}

export function useColor(product: Product) {
  return useState<ColorKey>(product.studio[0]?.color ?? product.cover[0]?.color ?? product.colors[0]);
}
