"use client";

import { useEffect, useState } from "react";
import { colors, type ColorKey, type Product } from "@/data/catalog";
import { media } from "@/lib/asset";
import { useUI } from "./Providers";

/**
 * Пара на студийном фоне. Все кадры сняты с одного ракурса, поэтому смена цвета —
 * просто плавная подмена картинки на том же месте.
 */
export function PairStage({
  product,
  active,
  sizes = "(min-width: 1024px) 50vw, 100vw",
  className = "aspect-[4/3]",
  priority = false,
  preload = false,
}: {
  product: Product;
  active: ColorKey;
  sizes?: string;
  className?: string;
  priority?: boolean;
  /** Подгрузить остальные цвета, когда страница освободится */
  preload?: boolean;
}) {
  const { locale } = useUI();
  // кадр другого цвета грузится только когда его впервые выбрали
  const [seen, setSeen] = useState<ColorKey[]>([active]);
  if (!seen.includes(active)) setSeen([...seen, active]);
  // пока новый кадр грузится, на сцене остаётся прежний — пара не пропадает на медленной сети
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
    <div className={`stage ${className}`}>
      {product.studio.filter(({ color }) => seen.includes(color)).map(({ color, image }, i) => {
        const m = media.studio(image);
        return (
          <img
            key={image}
            src={m.small}
            srcSet={m.srcSet}
            sizes={sizes}
            alt={color === active ? `${product.name[locale]} ${product.sku}, ${colors[color].name[locale]}` : ""}
            loading={priority && i === 0 ? "eager" : "lazy"}
            fetchPriority={priority && i === 0 ? "high" : "auto"}
            onLoad={() => setLoaded((l) => (l.includes(color) ? l : [...l, color]))}
            className={`stage-img ${color === shown ? "" : "is-hidden"}`}
          />
        );
      })}
    </div>
  );
}

export function Swatches({
  product,
  active,
  onChange,
  size = "w-[64px]",
}: {
  product: Product;
  active: ColorKey;
  onChange: (c: ColorKey) => void;
  size?: string;
}) {
  const { locale } = useUI();
  if (product.studio.length < 2) return null;
  return (
    <div className="flex flex-wrap gap-1.5" role="group" aria-label={colors[active].name[locale]}>
      {product.studio.map(({ color, image }) => (
        <button
          key={image}
          type="button"
          aria-pressed={color === active}
          aria-label={colors[color].name[locale]}
          title={colors[color].name[locale]}
          onClick={(e) => {
            e.preventDefault();
            onChange(color);
          }}
          onMouseEnter={() => onChange(color)}
          className={`swatch ${size}`}
        >
          <img src={media.swatch(image)} alt="" loading="lazy" />
        </button>
      ))}
    </div>
  );
}

export function useColor(product: Product) {
  return useState<ColorKey>(product.studio[0]?.color ?? product.cover[0]?.color ?? product.colors[0]);
}
