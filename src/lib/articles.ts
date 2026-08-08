import type { Article, ArticleType } from "../types/content";
import { useLanguage, type Language } from "../context/LanguageContext";
import { deriveExcerpt, parseFrontmatter, parseListField } from "./markdown";

const modules = import.meta.glob("../../content/articles/**/*.md", {
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
    type: (data.type as ArticleType) || "journal",
    title: data.title ?? slug,
    date: data.date ?? "",
    categories: data.categories ? parseListField(data.categories) : [],
    excerpt: data.excerpt || deriveExcerpt(body),
    body,
    coverUrl: data.coverUrl || undefined,
    author: data.author || undefined,
    rating: data.rating ? Number(data.rating) : undefined,
    featured: data.featured === "true",
    // 沒寫 status 的既有文章一律視為已上架，避免補這個欄位就讓所有舊文章消失
    status: data.status === "draft" ? "draft" : "published",
    nextSlug: data.nextSlug || undefined,
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

// /articles 列表、「下一篇文章」與知識點反查都只看 published，draft 只能透過直接網址預覽
export function usePublishedArticles(): Article[] {
  return useArticles().filter((article) => article.status === "published");
}

// 預設依目前列表排序（新到舊）找下一篇；文章 frontmatter 若手動指定 nextSlug
// 且該文章存在又已上架，則優先採用，讓像 exploring-hci 這種系列文章可以照寫作
// 順序串接，而不是被日期排序打散
export function useNextArticle(slug: string | undefined): Article | undefined {
  if (!slug) return undefined;
  const published = usePublishedArticles();

  const current = published.find((article) => article.slug === slug);
  if (current?.nextSlug) {
    const manual = published.find((article) => article.slug === current.nextSlug);
    if (manual) return manual;
  }

  const index = published.findIndex((article) => article.slug === slug);
  if (index === -1) return undefined;
  return published[index + 1];
}
