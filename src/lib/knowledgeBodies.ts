import { useLanguage, type Language } from "../context/LanguageContext";
import { parseFrontmatter } from "./markdown";

const modules = import.meta.glob("../../content/knowledge/**/*.md", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

function baseSlug(path: string): string {
  return path.split("/").pop()!.replace(/\.md$/, "");
}

function isEnglish(path: string): boolean {
  return path.includes("/knowledge/en/");
}

const zhBodies: Record<string, string> = {};
const enBodies: Record<string, string> = {};

for (const [path, raw] of Object.entries(modules)) {
  const slug = baseSlug(path);
  const body = parseFrontmatter(raw).body;
  if (isEnglish(path)) {
    enBodies[slug] = body;
  } else {
    zhBodies[slug] = body;
  }
}

// slug -> 長文 markdown；沒有對應 .md 檔的詞條就只顯示 knowledge.json 裡的 definition/application，
// 只有值得寫長文的詞條才需要建檔案，其餘維持原本的精簡卡片
// 英文版找不到對應翻譯時 fallback 回中文
export const knowledgeBodiesByLang: Record<Language, Record<string, string>> = {
  zh: zhBodies,
  en: Object.fromEntries(
    Object.keys(zhBodies).map((slug) => [slug, enBodies[slug] ?? zhBodies[slug]]),
  ),
};

export function useKnowledgeBodies(): Record<string, string> {
  const { language } = useLanguage();
  return knowledgeBodiesByLang[language];
}
