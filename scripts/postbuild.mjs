// Своя страница 404 для GitHub Pages: стандартная от Next.js выходит без стилей сайта.
import { readFileSync, writeFileSync } from "node:fs";

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const mono = readFileSync(new URL("../src/brand/monogram.svg", import.meta.url), "utf8")
  .replace("currentColor", "#ffffff")
  .replace("<svg ", '<svg width="30" ');

const html = `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>404 — Louis Gabor</title>
<link rel="icon" href="${base}/icon.svg" />
<style>
  body { margin: 0; min-height: 100svh; display: flex; align-items: center; justify-content: center; background: linear-gradient(180deg,#ecedef,#d5d8dc); color: #101318;
    font-family: "Manrope", system-ui, -apple-system, "Segoe UI", sans-serif; text-align: center; padding: 24px; box-sizing: border-box; }
  .tile { width: 56px; height: 56px; background: #005d9b; display: inline-flex; align-items: center; justify-content: center; }
  .word { margin-top: 14px; font-size: 13px; font-weight: 600; letter-spacing: .32em; text-transform: uppercase; }
  .code { margin-top: 48px; font-size: 11px; font-weight: 600; letter-spacing: .18em; color: #6a707a; }
  h1 { margin: 12px 0 0; font-weight: 300; font-size: 40px; letter-spacing: -.03em; }
  p { margin: 6px 0 0; color: #6a707a; font-size: 15px; }
  .links { margin-top: 32px; display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; }
  a.btn { display: inline-block; padding: 15px 26px; border-radius: 999px; font-size: 13px; font-weight: 600; text-decoration: none; }
  .ink { background: #101318; color: #fff; } .line { background: #fff; color: #101318; border: 1px solid #dcdee2; }
</style>
</head>
<body>
  <main>
    <a href="${base}/ru/" aria-label="Louis Gabor" style="text-decoration:none;color:inherit"><span class="tile">${mono}</span><div class="word">Louis Gabor</div></a>
    <div class="code">404</div>
    <h1>Страница не найдена</h1>
    <p>Sahifa topilmadi</p>
    <div class="links">
      <a class="btn ink" href="${base}/ru/catalog/">Каталог</a>
      <a class="btn line" href="${base}/uz/catalog/">Katalog</a>
    </div>
  </main>
</body>
</html>
`;
writeFileSync(new URL("../out/404.html", import.meta.url), html);
console.log("404.html written");
