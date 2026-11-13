// Своя страница 404 для GitHub Pages: стандартная от Next.js выходит без стилей сайта.
import { readFileSync, writeFileSync } from "node:fs";

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const mono = readFileSync(new URL("../src/brand/monogram.svg", import.meta.url), "utf8")
  .replace("currentColor", "#16120f")
  .replace("<svg ", '<svg width="40" ');

const html = `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>404 — Louis Gabor</title>
<link rel="icon" href="${base}/icon.svg" />
<style>
  body { margin: 0; min-height: 100svh; display: flex; align-items: center; justify-content: center; background: #ece8e1; color: #16120f;
    font-family: "Inter Tight", system-ui, -apple-system, "Segoe UI", sans-serif; text-align: center; padding: 24px; box-sizing: border-box; }
  .word { margin-top: 18px; font-family: "Prata", Georgia, "Times New Roman", serif; font-size: 22px; }
  .code { margin-top: 56px; font-size: 11px; font-weight: 500; letter-spacing: .2em; color: #7a7168; }
  h1 { margin: 14px 0 0; font-family: "Prata", Georgia, "Times New Roman", serif; font-weight: 400; font-size: 40px; letter-spacing: -.01em; }
  p { margin: 8px 0 0; color: #7a7168; font-size: 15px; }
  .links { margin-top: 36px; display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; }
  a.btn { display: inline-block; padding: 16px 28px; font-size: 12px; font-weight: 500; letter-spacing: .14em; text-transform: uppercase; text-decoration: none; }
  .ink { background: #16120f; color: #e9e3d8; } .line { color: #16120f; border: 1px solid #16120f; }
</style>
</head>
<body>
  <main>
    <a href="${base}/ru/" aria-label="Louis Gabor" style="text-decoration:none;color:inherit">${mono}<div class="word">Louis Gabor</div></a>
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
