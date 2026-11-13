import type { NextConfig } from "next";

// При деплое на GitHub Pages сайт живёт в подпапке /<repo>, поэтому путь задаётся переменной.
// Для Vercel / своего домена переменную не задаём — сайт будет в корне.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath,
  images: { unoptimized: true },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
