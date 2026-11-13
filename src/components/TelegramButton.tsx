import type { ReactNode } from "react";
import { site } from "@/data/site";
import { TelegramIcon } from "./Icons";

/**
 * Кнопка «Написать в Telegram». Пока в site.telegram пусто, это обычная кнопка без ссылки —
 * когда магазин пришлёт контакт менеджера, достаточно вписать его в src/data/site.ts.
 */
export function TelegramButton({ className, children }: { className: string; children: ReactNode }) {
  const content = (
    <>
      <TelegramIcon width={17} height={17} />
      {children}
    </>
  );
  if (site.telegram) {
    return (
      <a href={site.telegram} target="_blank" rel="noreferrer" className={className}>
        {content}
      </a>
    );
  }
  return (
    <button type="button" className={className}>
      {content}
    </button>
  );
}
