"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** Картинка внутри рамки чуть сдвигается при прокрутке — до 6% высоты. */
export function Parallax({ src, alt = "", className = "" }: { src: string; alt?: string; className?: string }) {
  const frame = useRef<HTMLDivElement>(null);
  const img = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const f = frame.current;
      const i = img.current;
      if (!f || !i) return;
      const r = f.getBoundingClientRect();
      const progress = (r.top + r.height / 2 - window.innerHeight / 2) / window.innerHeight;
      i.style.transform = `translateY(${Math.max(-1, Math.min(1, progress)) * -6}%) scale(1.14)`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={frame} className={`relative overflow-hidden ${className}`}>
      <img ref={img} src={src} alt={alt} loading="lazy" className="absolute inset-0 h-full w-full object-cover will-change-transform" style={{ transform: "scale(1.14)" }} />
    </div>
  );
}

/** Горизонтальная лента, которую можно тянуть мышью. */
export function DragRail({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let down = false;
    let startX = 0;
    let startLeft = 0;
    let moved = false;
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      down = true;
      moved = false;
      startX = e.clientX;
      startLeft = el.scrollLeft;
    };
    const onMove = (e: PointerEvent) => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 4) {
        moved = true;
        el.style.scrollSnapType = "none";
        el.classList.add("cursor-grabbing");
      }
      el.scrollLeft = startLeft - dx;
    };
    const onUp = () => {
      down = false;
      el.style.scrollSnapType = "";
      el.classList.remove("cursor-grabbing");
    };
    const onClick = (e: MouseEvent) => {
      if (moved) {
        e.preventDefault();
        e.stopPropagation();
        moved = false;
      }
    };
    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    el.addEventListener("click", onClick, true);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      el.removeEventListener("click", onClick, true);
    };
  }, []);

  return (
    <div ref={ref} className={`no-scrollbar flex cursor-grab snap-x snap-mandatory overflow-x-auto select-none ${className}`}>
      {children}
    </div>
  );
}
