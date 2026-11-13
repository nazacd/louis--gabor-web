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
# тёплый тёмный тон тени под цвет фона сайта
SHADOW_RGB = (38, 26, 18)


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


def refine_sole(number: str, cut: Image.Image) -> Image.Image:
    """Возвращает тёмные края подошвы, которые нейросеть срезала или размыла.

    Подошвы почти чёрные, полка под ними светлая, поэтому в нижней части пары
    маску можно уточнить по яркости исходного фото: тёмный пиксель рядом с обувью — это обувь.
    """
    from scipy import ndimage

    photo = np.array(Image.open(photo_path(number)).convert("RGB")).astype(np.float32)
    a = np.array(cut.getchannel("A")).astype(np.float32)
    mask = a > 40
    rows = np.nonzero(mask.any(axis=1))[0]
    top, bottom = rows.min(), rows.max()
    lum = photo @ np.array([0.299, 0.587, 0.114], dtype=np.float32)
    dark = np.clip((70 - lum) / 28, 0, 1)
    near = ndimage.binary_dilation(mask, iterations=24)
    band = np.zeros_like(mask)
    band[top + int((bottom - top) * 0.62) :, :] = True
    # тёмное пятно должно касаться обуви, а не быть отдельной тенью на полке;
    # размыкание убирает тонкие выросты и точки фона по краю
    cand = ndimage.binary_opening((dark > 0.5) & near & band, iterations=4)
    labels, n = ndimage.label(cand | mask)
    keep = np.isin(labels, np.unique(labels[mask]))
    add = np.where(keep & (cand | mask) & band, dark * 255, 0)
    add = ndimage.gaussian_filter(add, 0.8)
    new_a = np.maximum(a, add)
    rgb = np.array(cut.convert("RGB")).astype(np.float32)
    raised = new_a > a + 8
    rgb[raised] = photo[raised]
    out = Image.fromarray(np.clip(rgb, 0, 255).astype("uint8")).convert("RGBA")
    out.putalpha(Image.fromarray(np.clip(new_a, 0, 255).astype("uint8")))
    return out


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
    obj = trim_sole_fringe(obj)
    oa = obj.getchannel("A")

    shadow_alpha = floor_shadow(np.array(oa), x, y)

    canvas = Image.new("RGBA", STAGE, (0, 0, 0, 0))
    shadow = Image.new("RGBA", STAGE, SHADOW_RGB + (0,))
    shadow.putalpha(Image.fromarray(shadow_alpha))
    canvas.alpha_composite(shadow)
    canvas.alpha_composite(obj, (x, y))
    return canvas


def trim_sole_fringe(obj: Image.Image) -> Image.Image:
    """Срезает полупрозрачную кромку под подошвой — остаток полки после вырезки.

    Ниже последнего плотного (или тёмного) пикселя в каждой колонке альфа обнуляется,
    сам край сглаживается на пиксель, чтобы не было лесенки.
    """
    from scipy import ndimage

    a = np.array(obj.getchannel("A")).astype(np.float32)
    hh, ww = a.shape
    # кромка от полки светлая; тёмная подошва и каблук после вырезки бывают полупрозрачными,
    # их считаем частью обуви, иначе срезается угол каблука
    rgb = np.array(obj.convert("RGB")).astype(np.float32)
    lum = rgb @ np.array([0.299, 0.587, 0.114], dtype=np.float32)
    solid = (a > 200) | ((a > 50) & (lum < 70))
    has = solid.any(axis=0)
    bottom = np.where(has, hh - 1 - np.argmax(solid[::-1], axis=0), hh)
    bottom = np.where(has, ndimage.minimum_filter1d(bottom, 3), hh)
    rows = np.arange(hh)[:, None]
    cut = np.where(rows > bottom[None, :], 0, a)
    soft = ndimage.gaussian_filter(cut, 0.7)
    near = np.abs(rows - bottom[None, :]) <= 2
    out = np.where(near, np.minimum(soft, a), cut)
    obj = obj.copy()
    obj.putalpha(Image.fromarray(np.clip(out, 0, 255).astype("uint8")))
    return obj


def floor_shadow(alpha: np.ndarray, x: int, y: int) -> np.ndarray:
    """Тень на полу, которая повторяет нижний контур каждой подошвы.

    Три слоя, как у реальной пары под рассеянным светом:
    плотная линия контакта, короткое затемнение у подошвы и широкая мягкая полутень.
    Там, где подошва поднимается (носок, каблук), контакт слабеет.
    """
    from scipy import ndimage

    W, H = STAGE
    hh, ww = alpha.shape
    filled = alpha > 60
    has = filled.any(axis=0)
    bottom = np.where(has, hh - 1 - np.argmax(filled[::-1], axis=0), 0).astype(np.float32)
    # зубчатый край маски даёт полосы — сглаживаем контур
    bottom = np.where(has, ndimage.median_filter(bottom, 9), 0)
    # линия пола рядом с колонкой: самая нижняя точка подошвы в окрестности
    window = max(9, round(ww * 0.06))
    floor = ndimage.maximum_filter1d(np.where(has, bottom, 0), window)
    lift = np.clip(floor - bottom, 0, None)
    touch = np.exp(-lift / (hh * 0.012)) * has  # 1 — подошва на полу, 0 — приподнята

    ys = np.arange(H, dtype=np.float32)[:, None]
    base = np.full(W, -1e6, dtype=np.float32)
    weight = np.zeros(W, dtype=np.float32)
    base[x : x + ww] = np.where(has, bottom + y, -1e6)
    weight[x : x + ww] = touch
    d = ys - base[None, :]  # >0 — ниже подошвы

    def layer(above: float, below: float, blur: tuple[float, float], power: float, w: np.ndarray | None = None) -> np.ndarray:
        v = np.where((d >= -above) & (d <= below), 1 - np.clip(d, 0, None) / max(below, 1), 0) ** power
        if w is not None:
            v = v * w[None, :]
        # по горизонтали размываем сильнее: тень лежит на полу, а не висит под подошвой
        return ndimage.gaussian_filter(v.astype(np.float32), blur)

    objh = hh
    contact = layer(4, objh * 0.005, (1.2, 4), 1.0, weight)
    near = layer(objh * 0.02, objh * 0.016, (3.5, 12), 1.8, 0.4 + 0.6 * weight)
    wide = layer(objh * 0.1, objh * 0.045, (12, 36), 2.0)

    a = 1 - (1 - 0.7 * contact) * (1 - 0.34 * near) * (1 - 0.14 * wide)
    return (np.clip(a, 0, 1) * 255).astype("uint8")


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
        cut = refine_sole(number, cutout(number))
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
