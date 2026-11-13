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
 * Ролик без звука. До запуска — постер. На компьютере играет при наведении (или сам, если autoplay),
 * на телефоне — когда карточка в центре экрана. Видео грузится только при первом запуске.
 */
export function Film({
  name,
  poster,
  className = "",
  autoplay = false,
  label,
  glyph = true,
}: {
  name: string;
  poster?: string;
  className?: string;
  autoplay?: boolean;
  label?: string;
  glyph?: boolean;
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
      <img src={poster ?? f.poster} alt={label ?? ""} loading="lazy" draggable={false} />
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
      {glyph && (
        <span
          className={`pointer-events-none absolute bottom-3 left-3 inline-flex h-6 w-6 items-center justify-center bg-[rgba(22,18,15,0.55)] text-white transition-opacity duration-300 ${playing ? "opacity-0" : "opacity-100"}`}
        >
          <PlayIcon width={10} height={10} />
        </span>
      )}
    </div>
  );
}
