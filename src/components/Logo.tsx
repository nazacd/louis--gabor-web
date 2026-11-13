import monogram from "@/brand/monogram.svg";

/**
 * Монограмма векторизована из присланного логотипа. Надпись LOUIS GABOR набрана шрифтом сайта —
 * это временная замена, пока магазин не пришлёт фирменное начертание.
 */
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

/** Синий квадрат с белой монограммой — как в присланном логотипе */
export function LogoTile({ size = 32 }: { size?: number }) {
  return (
    <span className="flex items-center justify-center bg-blue text-white" style={{ width: size, height: size }} aria-hidden="true">
      <Monogram className="w-[52%]" />
    </span>
  );
}

export function Logo({ tile = 32, text = "text-[13px]" }: { tile?: number; text?: string }) {
  return (
    <span className="flex items-center gap-3">
      <LogoTile size={tile} />
      <span className={`wordmark ${text}`}>Louis Gabor</span>
    </span>
  );
}
