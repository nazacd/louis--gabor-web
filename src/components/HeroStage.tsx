"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getDict, href } from "@/i18n/config";
import { colors, getProduct, productPath, type ColorKey, type Product } from "@/data/catalog";
import { formatPrice } from "@/lib/asset";
import { useUI } from "./Providers";
import { PairStage } from "./PairStage";

const HERO = ["1571", "y08k11-1", "273-z"].map(getProduct).filter(Boolean) as Product[];
const STEP = 4500;

/** Все сочетания «модель — цвет» по порядку: сначала все цвета первой модели, потом следующей */
const SEQUENCE = HERO.flatMap((p, model) => p.studio.map(({ color }) => ({ model, color })));

export function HeroStage() {
  const { locale } = useUI();
  const t = getDict(locale);
  const [step, setStep] = useState(0);
  const [hover, setHover] = useState(false);
  const [stopped, setStopped] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [picked, setPicked] = useState<Record<string, ColorKey>>({});

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- настройка системы известна только в браузере
    setReduced(mq.matches);
  }, []);

  const running = !hover && !stopped && !reduced;

  useEffect(() => {
    if (!running) return;
    const id = window.setTimeout(() => setStep((s) => (s + 1) % SEQUENCE.length), STEP);
    return () => window.clearTimeout(id);
  }, [step, running]);

  const { model, color: autoColor } = SEQUENCE[step];
  const product = HERO[model];
  const active = picked[product.sku] ?? autoColor;

  // модель грузим, когда до неё дошла очередь, и заранее — следующую
  const mounted = useMemo(() => new Set([model, (model + 1) % HERO.length]), [model]);
  const [visited, setVisited] = useState<number[]>([0]);
  const missing = [...mounted].filter((m) => !visited.includes(m));
  if (missing.length) setVisited([...visited, ...missing]);

  const choose = (m: number, c?: ColorKey) => {
    setStopped(true);
    const first = SEQUENCE.findIndex((s) => s.model === m && (!c || s.color === c));
    if (first >= 0) setStep(first);
    if (c) setPicked((p) => ({ ...p, [HERO[m].sku]: c }));
  };

  return (
    <section
      className="relative isolate overflow-hidden"
      style={{ background: "var(--stage)" }}
    >
      <div className="stage-drift pointer-events-none absolute -inset-[20%] -z-10" aria-hidden="true" />

      <div className="container-x wrap relative grid min-h-[100svh] grid-rows-[minmax(0,1fr)_auto] lg:h-[100svh] lg:min-h-[680px] pb-8 pt-[var(--top-offset)] md:pb-12">
        {/* пара */}
        <div className="relative flex items-center justify-center lg:-mb-12 lg:items-end lg:justify-end">
          <div className="relative w-full max-w-[1240px] lg:mr-[4vw] lg:w-[min(70vw,calc((max(100svh,680px)-var(--top-offset)-220px)*1.333))]">
            {HERO.map((p, i) =>
              visited.includes(i) ? (
                <div
                  key={p.sku}
                  className={`transition-opacity duration-[900ms] ease-[cubic-bezier(.22,1,.36,1)] ${
                    i === model ? "relative opacity-100" : "pointer-events-none absolute inset-0 opacity-0"
                  }`}
                >
                  <PairStage
                    product={p}
                    active={i === model ? active : (picked[p.sku] ?? p.studio[0].color)}
                    className="aspect-[4/3]"
                    stage={false}
                    sizes="(min-width: 1024px) 70vw, 100vw"
                    priority={i === 0}
                    preload={i === model}
                  />
                </div>
              ) : null,
            )}
          </div>
        </div>

        {/* подпись и управление */}
        <div className="relative z-10 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <div className="label fade-in text-muted">{t.hero.kicker}</div>
            <h1 key={product.sku} className="display mt-4 text-[clamp(56px,7.5vw,128px)]">
              <span className="mask-line">
                <span>{product.name[locale]}</span>
              </span>
            </h1>
            <div key={`${product.sku}-meta`} className="fade-in mt-5 flex flex-wrap items-center gap-x-6 gap-y-3" style={{ ["--delay" as string]: "200ms" }}>
              <span className="label num text-muted">{product.sku}</span>
              <span className="price">{formatPrice(product.price, locale)}</span>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
              <Link href={href(locale, productPath(product))} className="btn btn-ink">
                {t.hero.view}
              </Link>
              <Link href={href(locale, "/catalog/")} className="link">
                {t.home.viewAll}
              </Link>
            </div>
          </div>

          <div className="lg:min-w-[340px]" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
            <div className="flex gap-6" role="tablist">
              {HERO.map((p, i) => (
                <button key={p.sku} type="button" role="tab" aria-selected={i === model} onClick={() => choose(i)} className="tab">
                  <span className="num mr-2 text-faint">0{i + 1}</span>
                  {p.name[locale]}
                </button>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-3">
              <div className="flex gap-1">
                {product.studio.map(({ color }) => (
                  <button
                    key={color}
                    type="button"
                    aria-pressed={color === active}
                    aria-label={colors[color].name[locale]}
                    title={colors[color].name[locale]}
                    onClick={() => choose(model, color)}
                    className="chip-color-btn !h-[30px] !w-[30px]"
                  >
                    <span className="chip-color !h-[18px] !w-[18px]" style={{ background: colors[color].hex }} />
                  </button>
                ))}
              </div>
              <span className="text-[13px] text-muted">{colors[active].name[locale]}</span>
            </div>
            <div className="relative mt-4 h-px w-full bg-line">
              {running && <div key={step} className="progress-line absolute inset-x-0 -top-px h-[2px] bg-accent" style={{ animationDuration: `${STEP}ms` }} />}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
