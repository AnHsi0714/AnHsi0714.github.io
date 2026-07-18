import { useLanguage, type Language } from "../context/LanguageContext";
import { parseFrontmatter } from "./markdown";

const modules = import.meta.glob("../../content/projects/*.md", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

function baseSlug(path: string): string {
  return path.split("/").pop()!.replace(/\.en\.md$/, "").replace(/\.md$/, "");
}

const zhBodies: Record<string, string> = {};
const enBodies: Record<string, string> = {};

for (const [path, raw] of Object.entries(modules)) {
  const slug = baseSlug(path);
  const body = parseFrontmatter(raw).body;
  if (path.endsWith(".en.md")) {
    enBodies[slug] = body;
  } else {
    zhBodies[slug] = body;
  }
}

// slug -> 正文 markdown（沒有對應 .md 檔的專案就只顯示 projects.json 裡的 desc）
// 英文版找不到對應翻譯時 fallback 回中文
export const projectBodiesByLang: Record<Language, Record<string, string>> = {
  zh: zhBodies,
  en: Object.fromEntries(
    Object.keys(zhBodies).map((slug) => [slug, enBodies[slug] ?? zhBodies[slug]]),
  ),
};

export function useProjectBodies(): Record<string, string> {
  const { language } = useLanguage();
  return projectBodiesByLang[language];
}
