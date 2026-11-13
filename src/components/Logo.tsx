import monogram from "@/brand/monogram.svg";

/** Буква G из логотипа магазина, векторизована. Цвет берёт от текста (currentColor). */
export function Monogram({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`block bg-current ${className ?? ""}`}
      style={{
        aspectRatio: "1328 / 1264",
        WebkitMaskImage: `url(${monogram.src})`,
        maskImage: `url(${monogram.src})`,
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskSize: "contain",
        maskSize: "contain",
      }}
    />
  );
}

/** Монограмма и название. Название набрано шрифтом сайта — временно, до фирменного начертания. */
export function Logo({ mono = "w-[26px]", text = "text-[22px]" }: { mono?: string; text?: string }) {
  return (
    <span className="flex items-center gap-3">
      <Monogram className={mono} />
      <span className={`font-serif leading-none ${text}`}>Louis Gabor</span>
    </span>
  );
}
