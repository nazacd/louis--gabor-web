"use client";

import { useEffect, useRef, useState } from "react";
import { media } from "@/lib/asset";
import { PlayIcon } from "./Icons";

/** На странице одновременно играет только один ролик — иначе телефон не справится с десятком видео. */
let current: HTMLVideoElement | null = null;

function playOnly(v: HTMLVideoElement) {
  if (current && current !== v) current.pause();
  current = v;
  v.play().catch(() => {});
}

/**
 * Вертикальный ролик: до запуска показывает постер. На компьютере играет при наведении,
 * на телефоне — когда карточка в центре экрана. Видео грузится только при первом запуске.
 */
export function Film({
  name,
  poster,
  className = "",
  autoplay = false,
  label,
}: {
  name: string;
  /** Своя обложка вместо кадра из ролика */
  poster?: string;
  className?: string;
  /** Играть, как только ролик виден (для крупного ролика на странице) */
  autoplay?: boolean;
  label?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const f = media.film(name);

  useEffect(() => {
    const el = wrap.current;
    const v = ref.current;
    if (!el || !v) return;
    const touch = window.matchMedia("(hover: none)").matches;
    if (!touch && !autoplay) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.intersectionRatio >= 0.6) playOnly(v);
        else v.pause();
      },
      { threshold: [0, 0.6, 1] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [autoplay]);

  return (
    <div
      ref={wrap}
      className={`film ${className}`}
      onMouseEnter={() => ref.current && playOnly(ref.current)}
      onMouseLeave={() => !autoplay && ref.current?.pause()}
    >
      <img src={poster ?? f.poster} alt={label ?? ""} loading="lazy" />
      <video
        ref={ref}
        src={f.src}
        muted
        loop
        playsInline
        preload="none"
        className={playing ? "is-playing" : ""}
        onPlaying={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
      {!playing && (
        <span className="pointer-events-none absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/85 text-ink">
          <PlayIcon width={14} height={14} />
        </span>
      )}
    </div>
  );
}
