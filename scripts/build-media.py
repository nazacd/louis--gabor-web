"""Готовит все медиа сайта из экспорта Telegram-канала.

Запуск из корня репозитория:
    pip install pillow numpy "rembg[cpu]"
    python3 scripts/build-media.py            # всё
    python3 scripts/build-media.py --images   # только картинки, без перекодирования видео

Что делает:
1. Вырезает обувь с фото на полке (rembg, модель isnet-general-use ~180 МБ, скачивается один раз).
   Вырезки кешируются в .cache/cutouts, поэтому повторный запуск быстрый.
2. Ставит пару в единый «студийный» кадр 4:3: одинаковая ширина пары, общая линия пола,
   тень вдоль подошвы. Фон прозрачный — его даёт CSS, тень лежит в альфа-канале.
3. Делает мини-вырезки для переключателя цвета и кадры деталей изнутри силуэта.
4. Обрезает фото «в руке» (C181A, 932) до 4:5 — они идут обложками, их не вырезаем.
5. Режет из роликов по 5 секунд без звука и без финальной заставки, с постером.

Скрипт не запускается в CI: ему нужна модель и исходные видео.
"""

import glob
import subprocess
from pathlib import Path

import numpy as np
from PIL import Image, ImageChops, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
PHOTOS = ROOT / "source" / "telegram-export" / "photos"
VIDEOS = ROOT / "source" / "telegram-export" / "video_files"
CACHE = ROOT / ".cache" / "cutouts"
OUT = ROOT / "public" / "media"

# Студийные кадры: фото -> имя на сайте (артикул + цвет)
STUDIO = {
    "2151": "y08k11-1-brown",
    "2152": "y08k11-1-black",
    "2153": "y08k11-1-navy",
    "2154": "536-navy",
    "2155": "536-black",
    # 273-Z — с вставкой (по ролику 273-Z), 273 — гладкие (по ролику 273)
    "2156": "273-z-black",
    "2157": "273-z-brown",
    "2158": "273-z-navy",
    "2159": "273-black",
    "2160": "273-navy",
    "2164": "1571-burgundy",
    "2165": "1571-navy",
    "2166": "1571-brown",
    "2167": "8171-navy",
    "2168": "8171-brown",
    # 196 — гладкие (по ролику 196), 196-N — с ворсом (по ролику 196-N)
    "2174": "196-navy",
    "2175": "196-black",
    "2176": "196-n-black",
    "2177": "196-n-brown",
    "2178": "196-n-navy",
}

# Фото «в руке» — обложки без вырезки
COVERS = {
    "2161": "c181a-black",
    "2162": "c181a-brown",
    "2163": "c181a-navy",
    "2169": "932-navy",
    "2170": "932-black",
}

# Ролик -> (артикул, начало, длительность). Только шаги, руки и подставки: без лиц и заставки.
CLIPS = {
    "2701": ("273", 21.0, 5.0),
    "2690": ("8171", 16.7, 4.5),
    "2684": ("y08k10-1", 16.7, 4.5),
    "2628": ("1577", 14.0, 5.0),
    "2546": ("y08k12-1", 15.7, 4.5),
    "2609": ("1571", 0.5, 5.0),
    "2528": ("196", 16.7, 4.5),
    "2584": ("6297a28", 30.7, 4.5),
    "2573": ("196-n", 25.7, 4.5),
    "2567": ("y08k11-1", 33.0, 5.0),
    "2298": ("mc296a", 22.5, 5.0),
    "2510": ("536", 0.5, 5.0),
    "7398": ("273-z", 12.7, 4.5),
    "2494": ("c181a", 15.0, 5.0),
    "2465": ("mc268a", 10.0, 5.0),
    "2379": ("1387", 10.7, 4.5),
    "2329": ("lg-01", 18.7, 4.5),
    "2320": ("332-d", 2.0, 5.0),
    "2306": ("gg3502-17", 24.0, 5.0),
}
# Дополнительные фрагменты для главной
EXTRA_CLIPS = {
    "unboxing": ("2379", 0.5, 6.5),
    "stand": ("2510", 0.5, 5.0),
}

STAGE = (1600, 1200)
PAIR_W = 0.78
BASELINE = 0.8


def photo_path(number: str) -> Path:
    found = [p for p in glob.glob(str(PHOTOS / f"photo_{number}@*.jpg")) if "_thumb" not in p]
    if len(found) != 1:
        raise SystemExit(f"photo_{number}: найдено {len(found)}")
    return Path(found[0])


def cutout(number: str) -> Image.Image:
    CACHE.mkdir(parents=True, exist_ok=True)
    cached = CACHE / f"{number}.png"
    if not cached.exists():
        from rembg import new_session, remove

        session = cutout.session = getattr(cutout, "session", None) or new_session("isnet-general-use")
        remove(Image.open(photo_path(number)).convert("RGB"), session=session).save(cached)
    return Image.open(cached).convert("RGBA")


def clean_alpha(cut: Image.Image) -> Image.Image:
    """Оставляет только крупные связные области маски и срезает полупрозрачную бахрому."""
    from scipy import ndimage

    a = np.array(cut.getchannel("A"))
    labels, n = ndimage.label(a > 40)
    if n > 1:
        sizes = ndimage.sum(np.ones_like(a), labels, range(1, n + 1))
        keep = [i + 1 for i, v in enumerate(sizes) if v >= sizes.max() * 0.08]
        mask = np.isin(labels, keep)
        mask = ndimage.binary_dilation(mask, iterations=3)
        a = np.where(mask, a, 0)
    a = np.where(a < 28, 0, np.clip((a.astype(np.int32) - 28) * 255 // 200, 0, 255)).astype("uint8")
    out = cut.copy()
    out.putalpha(Image.fromarray(a))
    return out


def staged(cut: Image.Image) -> Image.Image:
    """Пара в кадре 4:3 на прозрачном фоне; тень — чёрный цвет с прозрачностью."""
    cut = clean_alpha(cut)
    a = cut.getchannel("A")
    box = a.point(lambda v: 255 if v > 40 else 0).getbbox()
    obj = cut.crop(box)
    W, H = STAGE
    s = W * PAIR_W / obj.width
    obj = obj.resize((round(obj.width * s), round(obj.height * s)), Image.LANCZOS)
    x = (W - obj.width) // 2
    y = round(H * BASELINE) - obj.height
    oa = obj.getchannel("A")

    # контактная тень вдоль нижнего контура подошвы
    arr = np.array(oa)
    hh, ww = arr.shape
    filled = arr > 60
    has = filled.any(axis=0)
    bottom = np.where(has, hh - 1 - np.argmax(filled[::-1], axis=0), -1)
    depth = max(6, round(obj.height * 0.05))
    band = np.zeros((hh + depth * 3, ww), dtype=np.float32)
    for xi in np.nonzero(has)[0]:
        yb = bottom[xi]
        band[yb : yb + depth, xi] = np.linspace(1.0, 0.0, depth)
    contact = Image.new("L", STAGE, 0)
    contact.paste(Image.fromarray((band * 255).astype("uint8")), (x, y))
    contact = contact.filter(ImageFilter.GaussianBlur(5)).point(lambda v: int(v * 0.6))
    # мягкая тень под всей парой
    flat = oa.resize((round(obj.width * 0.98), max(8, obj.height // 5)))
    soft = Image.new("L", STAGE, 0)
    soft.paste(flat, (x + round(obj.width * 0.01), round(H * BASELINE) - round(flat.height * 0.85)))
    soft = soft.filter(ImageFilter.GaussianBlur(26)).point(lambda v: int(v * 0.26))

    canvas = Image.new("RGBA", STAGE, (0, 0, 0, 0))
    shadow = Image.new("RGBA", STAGE, (14, 16, 22, 0))
    shadow.putalpha(ImageChops.lighter(soft, contact))
    canvas.alpha_composite(shadow)
    canvas.alpha_composite(obj, (x, y))
    return canvas


def details(cut: Image.Image, name: str, count: int = 2) -> None:
    """Квадратные кадры деталей целиком внутри силуэта — самые фактурные участки."""
    for share in (0.24, 0.2, 0.16):
        if _details(cut, name, count, share) >= count:
            return
    raise SystemExit(f"{name}: не нашлось {count} кадров деталей")


def _details(cut: Image.Image, name: str, count: int, share: float) -> int:
    rgb = np.array(cut.convert("L"), dtype=np.float32)
    col = np.array(cut.convert("RGB"), dtype=np.int32)
    # колодки (светлое дерево) и металлические головки не должны попадать в кадр
    wood = (col[..., 0] > 140) & (col[..., 1] > 110) & (col[..., 2] < 120) & (col[..., 0] - col[..., 2] > 50)
    alpha = np.array(cut.getchannel("A"))
    box = Image.fromarray(alpha).point(lambda v: 255 if v > 40 else 0).getbbox()
    top = box[1] + round((box[3] - box[1]) * 0.28)
    side = round((box[2] - box[0]) * share)
    step = side // 4
    candidates = []
    for yy in range(top, box[3] - side, step):
        for xx in range(box[0], box[2] - side, step):
            if alpha[yy : yy + side, xx : xx + side].min() < 250:
                continue
            if wood[yy : yy + side, xx : xx + side].mean() > 0.002:
                continue
            patch = rgb[yy : yy + side, xx : xx + side]
            candidates.append((float(patch.std()), xx, yy))
    candidates.sort(reverse=True)
    chosen: list[tuple[int, int]] = []
    for _, xx, yy in candidates:
        if all(abs(xx - cx) > side or abs(yy - cy) > side for cx, cy in chosen):
            chosen.append((xx, yy))
        if len(chosen) == count:
            break
    for i, (xx, yy) in enumerate(chosen, start=1):
        crop = cut.convert("RGB").crop((xx, yy, xx + side, yy + side)).resize((640, 640), Image.LANCZOS)
        crop.save(OUT / "detail" / f"{name}-{i}.webp", quality=84, method=6)
    return len(chosen)


def cover(number: str, name: str) -> None:
    im = Image.open(photo_path(number)).convert("RGB")
    w, h = im.size
    nh = round(w * 5 / 4)
    top = max(0, (h - nh) // 2)
    im = im.crop((0, top, w, top + nh))
    im.resize((960, 1200), Image.LANCZOS).save(OUT / "cover" / f"{name}.webp", quality=82, method=6)
    im.resize((480, 600), Image.LANCZOS).save(OUT / "cover" / f"{name}-480.webp", quality=80, method=6)


def clip(video: str, name: str, start: float, length: float) -> None:
    src = VIDEOS / f"IMG_{video}.MP4"
    dst = OUT / "film" / f"{name}.mp4"
    subprocess.run(
        ["ffmpeg", "-v", "error", "-y", "-ss", str(start), "-i", str(src), "-t", str(length), "-an",
         "-vf", "scale=540:-2,fps=30", "-c:v", "libx264", "-preset", "slow", "-crf", "27",
         "-pix_fmt", "yuv420p", "-movflags", "+faststart", str(dst)],
        check=True,
    )
    poster = OUT / "film" / f"{name}.jpg"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", "0.8", "-i", str(dst), "-frames:v", "1", "-q:v", "4", str(poster)], check=True)
    Image.open(poster).convert("RGB").save(poster.with_suffix(".webp"), quality=80, method=6)
    poster.unlink()


def main() -> None:
    import sys

    images_only = "--images" in sys.argv
    for sub in ("studio", "swatch", "detail", "cover", "film"):
        (OUT / sub).mkdir(parents=True, exist_ok=True)
    for number, name in STUDIO.items():
        cut = cutout(number)
        stage = staged(cut.copy())
        stage.save(OUT / "studio" / f"{name}.webp", quality=86, method=6)
        stage.resize((800, 600), Image.LANCZOS).save(OUT / "studio" / f"{name}-800.webp", quality=84, method=6)
        sw = stage.crop((0, round(STAGE[1] * 0.12), STAGE[0], round(STAGE[1] * 0.88)))
        sw.resize((200, round(200 * sw.height / sw.width)), Image.LANCZOS).save(OUT / "swatch" / f"{name}.webp", quality=86, method=6)
        details(cut, name)
        print("studio", name)
    for number, name in COVERS.items():
        cover(number, name)
        print("cover", name)
    if images_only:
        return
    for video, (name, start, length) in CLIPS.items():
        clip(video, name, start, length)
        print("film", name)
    for name, (video, start, length) in EXTRA_CLIPS.items():
        clip(video, name, start, length)
        print("film", name)


if __name__ == "__main__":
    main()
