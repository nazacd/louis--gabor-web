"""Достаёт из экспорта Telegram-канала артикулы, цены, размеры, цвета и отметку о подошве.

Запуск из корня репозитория:  python3 scripts/parse-export.py
Результат: src/data/export.json — источник фактов для сайта. Руками этот файл не правится.

Если один артикул публиковался несколько раз, берётся самый поздний пост — кроме артикулов из PIN.
"""

import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
EXPORT = ROOT / "source" / "telegram-export" / "messages.html"
OUT = ROOT / "src" / "data" / "export.json"

# Артикул -> пост, факты из которого берём вместо самого позднего.
# 196: пост #2799 смешивает в альбоме два финиша (гладкие 196 и ворсовые 196-N), а #2791
# («чёрный / тёмно-синий, 39–45») ровно совпадает с двумя гладкими фото. Уточнить у магазина.
PIN = {"196": 2791}

COLOR_KEYS = {
    "чёрный": "black",
    "черный": "black",
    "тёмно-синий": "navy",
    "темно-синий": "navy",
    "коричневый": "brown",
    "бордовый": "burgundy",
    "хаки": "khaki",
}


def text_of(block: str) -> str:
    m = re.search(r'<div class="text">(.*?)</div>', block, re.S)
    if not m:
        return ""
    t = re.sub(r"<br\s*/?>", "\n", m.group(1))
    return html.unescape(re.sub(r"<[^>]+>", "", t)).strip()


def main() -> None:
    raw = EXPORT.read_text(encoding="utf-8")
    parts = re.split(r'<div class="message (?:default|service)[^"]*" id="message(\d+)">', raw)
    posts = []
    current = None
    for i in range(1, len(parts), 2):
        mid, body = int(parts[i]), parts[i + 1]
        date = re.search(r'title="(\d\d)\.(\d\d)\.(\d{4}) ([\d:]+)', body)
        media = re.findall(r'href="((?:photos|video_files)/[^"]+)"', body)
        media = [m for m in media if "_thumb" not in m]
        text = text_of(body)
        sku = re.search(r"Артикул:\s*(\S+)", text)
        if sku:
            current = {
                "post": mid,
                "date": f"{date.group(3)}-{date.group(2)}-{date.group(1)}" if date else "",
                "sku": sku.group(1),
                "price": int(re.sub(r"\D", "", re.search(r"Цена:\s*([\d\s]+)", text).group(1))),
                "sizes": [int(x) for x in re.search(r"Размеры:\s*от\s*(\d+)\s*до\s*(\d+)", text).groups()],
                "colors": [COLOR_KEYS[c.strip().lower()] for c in re.search(r"Цвета:\s*([^\n]+)", text).group(1).split("/")],
                "sole": "XL Extralight" if "XL Extralight" in text else None,
                "media": list(media),
            }
            posts.append(current)
        elif current is not None and media:
            # альбом: фото без подписи относятся к предыдущему посту с артикулом
            current["media"].extend(media)

    by_sku: dict[str, dict] = {}
    for p in posts:
        prev = by_sku.get(p["sku"])
        media = (prev["media"] if prev else []) + [m for m in p["media"] if not prev or m not in prev["media"]]
        pinned = PIN.get(p["sku"])
        newer = prev is None or (p["post"] == pinned if pinned else p["post"] > prev["post"])
        if newer:
            by_sku[p["sku"]] = {**p, "media": media, "posts": (prev["posts"] if prev else []) + [p["post"]]}
        else:
            prev["media"] = media
            prev["posts"].append(p["post"])

    payment = re.search(r"Условия оплаты:\s*([^\n<]+)", raw)
    data = {
        "phone": re.search(r"(\+998[\d\s]+)", raw).group(1).strip(),
        "malls": sorted(set(re.findall(r"📍\s*([^\n<]+?)\s*(?:<br|\n)", raw))),
        "payment": [p.strip() for p in html.unescape(payment.group(1)).split(",")] if payment else [],
        "products": sorted(by_sku.values(), key=lambda p: -p["post"]),
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"{len(posts)} постов с артикулом -> {len(by_sku)} артикулов -> {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
