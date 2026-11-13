// Проверяет, что цены, артикулы и размеры на сайте совпадают с постами канала.
// Запуск: node scripts/check-data.mjs (входит в npm run lint)
import { readFileSync } from "node:fs";

const html = readFileSync(new URL("../source/telegram-export/messages.html", import.meta.url), "utf8")
  .replace(/<[^>]+>/g, " ")
  .replace(/&nbsp;/g, " ");
const data = JSON.parse(readFileSync(new URL("../src/data/export.json", import.meta.url), "utf8"));

let errors = 0;
for (const p of data.products) {
  const price = p.price.toLocaleString("ru-RU").replace(/\s/g, " ");
  const checks = [
    `Артикул: ${p.sku}`,
    `Цена: ${price}`,
    `от ${p.sizes[0]} до ${p.sizes[1]}`,
  ];
  for (const c of checks) {
    if (!html.replace(/\s+/g, " ").includes(c.replace(/\s+/g, " "))) {
      console.error(`${p.sku}: в экспорте нет «${c}»`);
      errors++;
    }
  }
}
if (!html.includes(data.phone)) {
  console.error(`телефон ${data.phone} не найден в экспорте`);
  errors++;
}
if (errors) process.exit(1);
console.log(`data ok: ${data.products.length} артикулов совпадают с постами канала`);
