import type { Article, ArticleSection, ArticleType } from "../types/content";
import { useLanguage, type Language } from "../context/LanguageContext";
import { deriveExcerpt, parseFrontmatter, parseListField } from "./markdown";

const defaultSectionByType: Record<ArticleType, ArticleSection> = {
  paper: "academic",
  journal: "academic",
  tech: "technical",
  book: "reading",
  essay: "reading",
};

const modules = import.meta.glob("../../content/articles/**/*.md", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

function baseSlug(path: string): string {
  return path.split("/").pop()!.replace(/\.md$/, "");
}

function isEnglish(path: string): boolean {
  return path.includes("/articles/en/");
}

function parseArticle(slug: string, raw: string): Article {
  const { data, body } = parseFrontmatter(raw);
  const type = (data.type as ArticleType) || "journal";
  return {
    slug,
    type,
    section: (data.section as ArticleSection) || defaultSectionByType[type],
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
  if (isEnglish(path)) {
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

// 算出某篇文章實際指向的下一篇 slug：優先採用 frontmatter 手動指定的 nextSlug
// （該文章需存在又已上架，讓像 exploring-hci 這種系列文章可以照寫作順序串接），
// 否則 fallback 回列表排序（新到舊）的下一筆。previous 也依此反查，兩個方向才不會對不起來
function effectiveNextSlug(
  article: Article,
  index: number,
  published: Article[],
): string | undefined {
  if (article.nextSlug && published.some((a) => a.slug === article.nextSlug)) {
    return article.nextSlug;
  }
  return published[index + 1]?.slug;
}

export function useNextArticle(slug: string | undefined): Article | undefined {
  if (!slug) return undefined;
  const published = usePublishedArticles();
  const index = published.findIndex((article) => article.slug === slug);
  if (index === -1) return undefined;
  const nextSlug = effectiveNextSlug(published[index], index, published);
  return published.find((article) => article.slug === nextSlug);
}

// 反查誰的「下一篇」指向目前這篇，確保跟 useNextArticle 完全對稱
// （包含手動 nextSlug 的系列文章），而不是單純用日期序 index-1
export function usePreviousArticle(slug: string | undefined): Article | undefined {
  if (!slug) return undefined;
  const published = usePublishedArticles();
  return published.find(
    (article, index) => effectiveNextSlug(article, index, published) === slug,
  );
}
