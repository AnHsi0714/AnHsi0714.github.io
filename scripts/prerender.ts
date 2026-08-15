import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { preview } from "vite";
import { chromium } from "playwright";
import { parseFrontmatter } from "../src/lib/markdown.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const contentDir = path.join(rootDir, "content");
const distDir = path.join(rootDir, "dist");
const siteUrl = "https://anhsi0714.github.io";

function readJson<T>(relativePath: string): T {
  return JSON.parse(
    fs.readFileSync(path.join(contentDir, relativePath), "utf-8"),
  ) as T;
}

function staticRoutes(): string[] {
  return [
    "/",
    "/about",
    "/projects",
    "/articles",
    "/knowledge",
    "/gallery",
    "/experience",
    "/dreams",
    "/playground",
    "/playground/mini-works",
  ];
}

function projectRoutes(): string[] {
  const projects = readJson<Array<{ slug: string }>>("projects.json");
  return projects.map((project) => `/projects/${project.slug}`);
}

// 只掃 zh 版本目錄就好，因為 slug 對兩種語言是共用的（en 找不到對應翻譯時會 fallback 回 zh）
function articleRoutes(): string[] {
  const zhDir = path.join(contentDir, "articles", "zh");
  const slugs: string[] = [];

  function walk(dir: string) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
        continue;
      }
      if (!entry.isFile() || !entry.name.endsWith(".md")) continue;

      const raw = fs.readFileSync(fullPath, "utf-8");
      const { data } = parseFrontmatter(raw);
      if (data.status === "draft") continue;
      slugs.push(entry.name.replace(/\.md$/, ""));
    }
  }

  walk(zhDir);
  return slugs.map((slug) => `/articles/${slug}`);
}

function knowledgeRoutes(): string[] {
  const nodes = readJson<Record<string, { status?: string }>>("knowledge.json");
  return Object.entries(nodes)
    .filter(([, node]) => node.status === "published")
    .map(([slug]) => `/knowledge/${slug}`);
}

function galleryRoutes(): string[] {
  const artworks = readJson<Array<{ slug: string }>>("artworks.json");
  return artworks.map((artwork) => `/gallery/${artwork.slug}`);
}

// 沒有對應的資料檔，直接對齊 src/pages/playground/miniWorksRegistry.ts 裡的 3 筆
function miniWorkRoutes(): string[] {
  return ["namecard", "brand-guide", "weather-box"].map(
    (slug) => `/playground/mini-works/${slug}`,
  );
}

function buildRoutes(): string[] {
  return [
    ...staticRoutes(),
    ...projectRoutes(),
    ...articleRoutes(),
    ...knowledgeRoutes(),
    ...galleryRoutes(),
    ...miniWorkRoutes(),
  ];
}

function routeToFilePath(route: string): string {
  if (route === "/") return path.join(distDir, "index.html");
  return path.join(distDir, route.replace(/^\//, ""), "index.html");
}

function buildSitemap(routes: string[]): string {
  const urls = routes
    .map((route) => `  <url><loc>${siteUrl}${route}</loc></url>`)
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

async function main() {
  if (!fs.existsSync(distDir)) {
    throw new Error("dist/ not found — run `vite build` before prerendering");
  }

  const routes = buildRoutes();
  console.log(`prerendering ${routes.length} routes...`);

  const server = await preview({
    root: rootDir,
    logLevel: "warn",
    preview: { port: 4173, strictPort: false },
  });
  const baseUrl = server.resolvedUrls?.local[0] ?? "http://localhost:4173/";

  const browser = await chromium.launch();
  const page = await browser.newPage();

  // '/' 的快照留到最後才寫進 dist/index.html，避免流程中途覆蓋掉其他路由
  // 賴以做 SPA fallback 的 shell
  let rootHtml: string | null = null;

  try {
    for (const route of routes) {
      const url = new URL(route, baseUrl).toString();
      await page.goto(url, { waitUntil: "networkidle" });
      await page.waitForSelector("#root:not(:empty)", { timeout: 10_000 });
      const html = await page.content();

      if (route === "/") {
        rootHtml = html;
        continue;
      }

      const filePath = routeToFilePath(route);
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, html, "utf-8");
      console.log(`  ${route}`);
    }

    if (rootHtml) {
      fs.writeFileSync(routeToFilePath("/"), rootHtml, "utf-8");
      console.log("  /");
    }
  } finally {
    await browser.close();
    await server.close();
  }

  fs.writeFileSync(path.join(distDir, "sitemap.xml"), buildSitemap(routes), "utf-8");
  console.log(`wrote sitemap.xml with ${routes.length} urls`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
