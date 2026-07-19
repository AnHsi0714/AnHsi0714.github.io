import type { Article, ArticleType } from "../types/content";
import { useLanguage, type Language } from "../context/LanguageContext";
import { deriveExcerpt, parseFrontmatter, parseListField } from "./markdown";

const modules = import.meta.glob("../../content/articles/*.md", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

function baseSlug(path: string): string {
  return path.split("/").pop()!.replace(/\.en\.md$/, "").replace(/\.md$/, "");
}

function parseArticle(slug: string, raw: string): Article {
  const { data, body } = parseFrontmatter(raw);
  return {
    slug,
    type: (data.type as ArticleType) || "note",
    title: data.title ?? slug,
    date: data.date ?? "",
    categories: data.categories ? parseListField(data.categories) : [],
    excerpt: data.excerpt || deriveExcerpt(body),
    body,
    coverUrl: data.coverUrl || undefined,
    author: data.author || undefined,
    rating: data.rating ? Number(data.rating) : undefined,
    featured: data.featured === "true",
  };
}

const zhArticles = new Map<string, Article>();
const enArticles = new Map<string, Article>();

for (const [path, raw] of Object.entries(modules)) {
  const slug = baseSlug(path);
  const article = parseArticle(slug, raw);
  if (path.endsWith(".en.md")) {
    enArticles.set(slug, article);
  } else {
    zhArticles.set(slug, article);
  }
}

function sortByDate(list: Article[]): Article[] {
  return [...list].sort((a, b) => b.date.localeCompare(a.date));
}

// 英文版找不到對應翻譯時 fallback 回中文，避免漏翻譯的文章整篇消失
export const articlesByLang: Record<Language, Article[]> = {
  zh: sortByDate([...zhArticles.values()]),
  en: sortByDate(
    [...zhArticles.values()].map((zh) => enArticles.get(zh.slug) ?? zh),
  ),
};

export function useArticles(): Article[] {
  const { language } = useLanguage();
  return articlesByLang[language];
}
