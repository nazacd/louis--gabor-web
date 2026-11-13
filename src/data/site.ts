import type { L10n } from "@/i18n/config";

export const site = {
  name: "Louis Gabor",
  /** Telegram для связи — сюда ведут кнопки «Написать в Telegram» */
  telegram: "https://t.me/louisgaboruz",
  /** Telegram-канал */
  telegramChannel: "https://t.me/LouisGabor",
  stores: [
    {
      id: "riviera",
      name: "Riviera Mall",
      city: { ru: "Ташкент", uz: "Toshkent" } as L10n,
      map: "https://yandex.uz/maps/?text=" + encodeURIComponent("Louis Gabor Riviera Mall Ташкент"),
    },
    {
      id: "chimgan",
      name: "Chimgan Mall",
      city: { ru: "Ташкент", uz: "Toshkent" } as L10n,
      map: "https://yandex.uz/maps/?text=" + encodeURIComponent("Louis Gabor Chimgan Mall Ташкент"),
    },
  ],
};
